import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      select: [
        'id',
        'email',
        'name',
        'bio',
        'avatarUrl',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
    return users;
  }

  async getDetailUser(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'name',
        'bio',
        'avatarUrl',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
    return user;
  }
}
