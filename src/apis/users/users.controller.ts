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
}
