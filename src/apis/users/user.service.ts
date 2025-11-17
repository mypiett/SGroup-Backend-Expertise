// backend/src/apis/users/user.service.ts
import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
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
  }

  async getDetailUser(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
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
  }

  // ✅ Update profile
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    Object.assign(user, data);
    return await this.userRepository.save(user);
  }

  // ✅ Update avatar
  async updateAvatar(userId: string, avatarPath: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    user.avatarUrl = avatarPath;
    return await this.userRepository.save(user);
  }
}
