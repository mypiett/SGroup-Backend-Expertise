import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';
import { LoginDto, RegisterDto } from './auth.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private authRepository = AppDataSource.getRepository(User);

  async register(data: RegisterDto) {
    const existingEmail = await this.authRepository.findOne({
      where: { email: data.email },
    });

    if (existingEmail) throw new Error('Email already exists');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = this.authRepository.create({
      ...data,
      password: hashedPassword,
    });
    await this.authRepository.save(newUser);
    return {
      message: 'Register successfully',
      user: { fullname: newUser.fullName, email: newUser.email },
    };
  }

  async login(data: LoginDto) {
    const user = await this.authRepository.findOne({
      where: { email: data.email },
    });
    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await this.authRepository.save(user);
    return { message: 'Login successful', accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const decoded = jwt.verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET
      ) as any;
      const user = await this.authRepository.findOne({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== oldRefreshToken)
        throw new Error('Invalid refresh token');

      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      user.accessToken = newAccessToken;
      await this.authRepository.save(user);

      return { accessToken: newAccessToken };
    } catch {
      throw new Error('Refresh Token expired or invalid!');
    }
  }
}
