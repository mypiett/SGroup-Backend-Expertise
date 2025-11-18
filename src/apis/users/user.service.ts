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

  async updateProfile(
    userId: string,
    data: { name?: string; bio?: string }
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    if (data.name && typeof data.name === 'string') {
      user.name = data.name.trim();
    }
    if (data.bio && typeof data.bio === 'string') {
      user.bio = data.bio;
    }

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      avatarUrl: savedUser.avatarUrl,
      bio: savedUser.bio,
    };
  }

  async updateAvatar(userId: string, avatarPath: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    if (!avatarPath || typeof avatarPath !== 'string') {
      throw new Error('Invalid avatar path');
    }

    user.avatarUrl = avatarPath;

    const savedUser = await this.userRepository.save(user);
    return {
      id: savedUser.id,
      name: savedUser.name,
      avatarUrl: savedUser.avatarUrl,
    };
  }
}
