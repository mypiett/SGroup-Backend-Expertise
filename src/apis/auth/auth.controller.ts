import { validateEmail } from '@/common/utils/validateEmail';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { redisClient } from '@/config/redisClient';
import crypto from 'crypto';
const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const data: RegisterDto = req.body;
    if (!data.name || !data.email || !data.password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!validateEmail(data.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const checkedVerifyEmail = await redisClient.get(`verified:${data.email}`);
    if (!checkedVerifyEmail) {
      return res
        .status(400)
        .json({ message: 'Email has not been verified yet' });
    }

    if (data.password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    try {
      const result = await authService.register(data);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    const data: LoginDto = req.body;
    if (!data.email || !data.password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const userAgent = req.headers['user-agent'];
      const ip = req.ip || req.socket.remoteAddress;

      const result = await authService.login(data, userAgent, ip);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        message: 'Login successful',
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  oauthRedirect(req: Request, res: Response) {
    const state = crypto.randomBytes(16).toString('hex');
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&state=${state}`;
    res.redirect(url);
  }

  async oauthCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    try {
      const userAgent = req.headers['user-agent'];
      const ip = req.ip || req.socket.remoteAddress;

      const result = await authService.loginOAuth2(code, userAgent, ip);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Login successful',
        accessToken: result.accessToken,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }

      const token = await authService.refreshToken(refreshToken);
      return res.status(200).json({ accessToken: token.accessToken });
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

      const user = await authService.getMe(decoded.userId);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
      }

      const result = await authService.logout(refreshToken);

      res.clearCookie('refreshToken');

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
