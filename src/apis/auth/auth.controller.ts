import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
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

  static async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader)
        return res.status(401).json({ message: 'No token provided' });

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

      const user = await authService.getMe(decoded.userId);
      return res.status(200).json(user);
    } catch (error: any) {
      return res
        .status(401)
        .json({ message: 'Invalid or expired token', error });
    }
  }
}
