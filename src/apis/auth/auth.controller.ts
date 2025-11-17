// backend/src/apis/auth/auth.controller.ts
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
    console.log('📥 [REGISTER] Incoming data:', data);

    if (!data.name || !data.email || !data.password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

    const checkedVerifyEmail = await redisClient.get(`verified:${data.email}`);
    if (!checkedVerifyEmail) {
      return res
        .status(400)
        .json({ message: 'Email has not been verified yet' });
    }

    if (data.password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    try {
      const result = await authService.register(data);
      const user = await authService.getMe(result.userId); // lấy lại user đầy đủ

      return res.status(201).json({
        success: true,
        message: 'Register successfully',
        responseObject: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
          },
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    const data: LoginDto = req.body;
    console.log('📥 [LOGIN] Incoming data:', data);

    if (!data.email || !data.password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!validateEmail(data.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    try {
      const userAgent = req.headers['user-agent'];
      const ip = req.ip || req.socket.remoteAddress;

      const result = await authService.login(data, userAgent, ip);
      const user = await authService.getMe(result.userId); // lấy lại user đầy đủ

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        responseObject: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
          },
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
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
      console.log('📥 [REFRESH] Token:', refreshToken);

      if (!refreshToken) {
        console.warn('⚠️ [REFRESH] No token provided');
        return res.status(401).json({ message: 'No refresh token provided' });
      }

      const token = await authService.refreshToken(refreshToken);
      console.log('✅ [REFRESH] New access token:', token.accessToken);
      return res.status(200).json({ accessToken: token.accessToken });
    } catch (error: any) {
      console.error('❌ [REFRESH] Error:', error.message);
      return res.status(401).json({ message: error.message });
    }
  }

  async forgetPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const lastSentRequestForgotPassword = await redisClient.get(
      `lastSentRequestForgotPassword:${email}`
    );
    if (lastSentRequestForgotPassword) {
      return res.status(429).json({
        message:
          'Too many requests. Please wait a few minutes before requesting again.',
      });
    }
    try {
      await authService.forgetPassword(email);
      await redisClient.set(
        `lastSentRequestForgotPassword:${email}`,
        Date.now().toString(),
        { EX: 60 }
      );
      return res.status(200).json({ message: 'Reset code sent to your email' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body;
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    try {
      await authService.resetPassword(email, newPassword, code);
      return res
        .status(200)
        .json({ message: 'Password has been reset successfully' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      console.log('📥 [GET ME] Auth header:', authHeader);

      if (!authHeader) {
        console.warn('⚠️ [GET ME] No token provided');
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      console.log('🔓 [GET ME] Decoded token:', decoded);

      const user = await authService.getMe(decoded.userId);
      console.log('✅ [GET ME] User:', user);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error('❌ [GET ME] Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log('📥 [LOGOUT] Token:', refreshToken);

      if (!refreshToken) {
        console.warn('⚠️ [LOGOUT] No token provided');
        return res.status(400).json({ message: 'No refresh token provided' });
      }

      const result = await authService.logout(refreshToken);
      console.log('✅ [LOGOUT] Success:', result);

      res.clearCookie('refreshToken');
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ [LOGOUT] Error:', error.message);
      return res.status(400).json({ message: error.message });
    }
  }

  // ✅ Update profile by :id
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const { name, bio } = req.body;

      const updatedUser = await authService.updateProfile(userId, { name, bio });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        responseObject: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl,
          bio: updatedUser.bio,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ✅ Update avatar by :id
  static async updateAvatar(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const updatedUser = await authService.updateAvatar(userId, file.path);

      return res.status(200).json({
        success: true,
        message: "Avatar updated successfully",
        responseObject: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl,
          bio: updatedUser.bio,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
