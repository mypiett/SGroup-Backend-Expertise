import { AppDataSource } from '../../config/data-source';
import { User } from '../users/user.entity';
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
    user.accessToken = accessToken;
    await this.authRepository.save(user);
    return { message: 'Login successful', accessToken };
  }
}
