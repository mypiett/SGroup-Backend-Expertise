import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';
import { RefreshToken } from '../../common/entities/refresh-token.entity';
import { LoginDto, RegisterDto } from './auth.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateJwt } from '../../common/utils/jwtUtils';
import axios from 'axios';
import { EmailService } from './mail.service';
import { redisClient } from '@/config/redisClient';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  private emailService = new EmailService();
  async register(data: RegisterDto) {
    const existingEmail = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingEmail) throw new Error('Email already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = this.userRepository.create({
      ...data,
      password: hashedPassword,
      isActive: true,
    });
    await this.userRepository.save(newUser);

    return {
      message: 'Register successfully',
      user: { name: newUser.name, email: newUser.email },
    };
  }

  async login(data: LoginDto, userAgent?: string, ip?: string) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('Account is not active');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      hash: 'temporary',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      userAgent,
      ip,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    const accessToken = generateJwt({
      userId: user.id,
      email: user.email,
    });

    const refreshTokenPayload = {
      userId: user.id,
      email: user.email,
      jti: refreshTokenEntity.jti,
    };

    const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    refreshTokenEntity.hash = hashedRefreshToken;
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { message: 'Login successful', accessToken, refreshToken };
  }

  async loginOAuth2(code: string, userAgent?: string, ip?: string) {
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }
    );
    const profileResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
      }
    );

    const { email, name, id: providerId } = profileResponse.data;
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      user = await this.userRepository.save({
        email,
        name,
        provider: 'google',
        gooleId: providerId,
        isActive: true,
      });

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      hash: 'temporary',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      userAgent,
      ip,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    const accessToken = generateJwt({
      userId: user.id,
      email: user.email,
    });

    const refreshTokenPayload = {
      userId: user.id,
      email: user.email,
      jti: refreshTokenEntity.jti,
    };

    const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    refreshTokenEntity.hash = hashedRefreshToken;
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { message: 'Login successful', accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const decoded = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET) as any;

      const storedToken = await this.refreshTokenRepository.findOne({
        where: { jti: decoded.jti, userId: decoded.userId },
      });

      if (!storedToken || storedToken.revoked) {
        throw new Error('Invalid refresh token');
      }

      if (new Date() > storedToken.expiresAt) {
        throw new Error('Refresh token expired');
      }

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });

      if (!user) throw new Error('User not found');

      const newAccessToken = generateJwt({
        userId: user.id,
        email: user.email,
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new Error('Refresh Token expired or invalid!');
    }
  }

  async forgetPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });
    if (!user) throw new Error('User not found!');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const oldFotgetPasswordCode = await redisClient.get(
      `forgetPassword:${email}`
    );
    if (oldFotgetPasswordCode) {
      await redisClient.del(`forgetPassword:${oldFotgetPasswordCode}`);
    }
    await redisClient.set(`forgetPassword:${email}`, code, { EX: 15 * 60 });
    await redisClient.set(`forgetPasswordCode:${code}`, email, { EX: 15 * 60 });
    await this.emailService.sendForgotPasswordEmail(email, code);
    return { message: 'Verification code sent to your email' };
  }

  async resetPassword(email: string, newPassword: string, code: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error('User not found');
    const savedCode = await redisClient.get(`forgetPassword:${email}`);
    if (!savedCode) throw new Error('Code expired or invalid');
    if (savedCode !== code) throw new Error('Invalid code');
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new Error('New password must be different from the old password');
    }
    user.password = newHashedPassword;
    await this.userRepository.save(user);
    await redisClient.del(`forgetPassword:${email}`);
    return { message: 'Reset password successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'name',
        'email',
        'bio',
        'avatarUrl',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) throw new Error('User not found');
    return user;
  }

  async logout(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

      const storedToken = await this.refreshTokenRepository.findOne({
        where: { jti: decoded.jti },
      });

      if (storedToken) {
        storedToken.revoked = true;
        await this.refreshTokenRepository.save(storedToken);
      }

      return { message: 'Logout successful' };
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  private generateJti(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
