import { Request, Response } from 'express';
import { UserService } from './user.service';
import {
  ServiceResponse,
  ResponseStatus,
} from '@/common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

const userService = new UserService();

export class UserController {
  static async getAllUsers(): Promise<ServiceResponse<any>> {
    try {
      const users = await userService.getAllUsers();
      return new ServiceResponse(
        ResponseStatus.Success,
        'Users retrieved successfully',
        users,
        StatusCodes.OK
      );
    } catch {
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Error fetching users',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getDetailUser(req: Request): Promise<ServiceResponse<any>> {
    try {
      const userId = req.params.id;
      const user = await userService.getDetailUser(userId);

      if (!user) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'User not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return new ServiceResponse(
        ResponseStatus.Success,
        'User retrieved successfully',
        user,
        StatusCodes.OK
      );
    } catch {
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Error fetching user detail',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

static async updateProfile(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const { name, bio } = req.body;

    if (name && typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid name format' });
    }
    if (bio && typeof bio !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid bio format' });
    }

    const updatedUser = await userService.updateProfile(userId, { name, bio });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
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

static async uploadAvatar(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Invalid file type' });
    }

    const updatedUser = await userService.updateAvatar(userId, file.path);

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
}



