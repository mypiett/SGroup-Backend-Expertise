import { Request, Response } from 'express';
import { UserService } from './user.service';

// import { User } from './users.entity';

const userService = new UserService();

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    const users = await userService.getAllUsers();
    res.json(users);
  }

  static async getDetailUser(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const user = await userService.getDetailUser(userId);
    res.json(user);
  }
}
