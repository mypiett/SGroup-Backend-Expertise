import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';
import { RefreshToken } from '../../common/entities/refresh-token.entity';
import { LoginDto, RegisterDto } from './auth.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateJwt } from '../../common/utils/jwtUtils';

// nên chuyển login tạo refresh token vào utils/jwtUtils.ts
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

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

    // Save refresh token to database first to get auto-generated UUID jti
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      hash: 'temporary', // Will be updated after JWT is created
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      revoked: false,
      userAgent,
      ip,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    // Use the shared JWT utility to ensure consistent secret
    const accessToken = generateJwt({
      userId: user.id,
      email: user.email,
    });

    const refreshTokenPayload = {
      userId: user.id,
      email: user.email,
      jti: refreshTokenEntity.jti, // Use the auto-generated UUID
    };

    const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    // Update with actual hashed refresh token
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

      // Generate new access token using shared utility
      const newAccessToken = generateJwt({
        userId: user.id,
        email: user.email,
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new Error('Refresh Token expired or invalid!');
    }
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
