import { Request, Response } from 'express';
import { UserService } from './user.service';

const userService = new UserService();

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message,
      });
    }
  }

  static async getDetailUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await userService.getDetailUser(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user detail',
        error: error.message,
      });
    }
  }

  // ✅ Update profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const data = req.body; // { name, bio, ... }

      const updatedUser = await userService.updateProfile(userId, data);
      res.status(200).json({ success: true, message: 'Profile updated', data: updatedUser });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ✅ Upload avatar
  static async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const file = req.file; // multer sẽ gắn file vào req.file

      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const updatedUser = await userService.updateAvatar(userId, file.path);
      res.status(200).json({ success: true, message: 'Avatar updated', data: updatedUser });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
