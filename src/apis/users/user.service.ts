import { AppDataSource } from '../../config/data-source';
import { User } from './users.entity';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async getDetailUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user;
  }
}
