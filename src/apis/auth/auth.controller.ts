import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response) {
    const data: RegisterDto = req.body;
    if (!data.fullName || !data.email || !data.password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (data.password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }
    try {
      const result = await authService.register(data);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    const data: LoginDto = req.body;
    if (!data.email || !data.password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    try {
      const result = await authService.login(data);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const token = await authService.refreshToken(refreshToken);
      return res.status(200).json(token);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
