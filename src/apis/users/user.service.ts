import { AppDataSource } from '../../config/data-source';
import { User } from '../../common/entities/user.entity';
import { UpdateProfileDto } from './user.dto';

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

  // ⭐ Update thông tin cá nhân
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.bio !== undefined) user.bio = dto.bio;

    await this.userRepository.save(user);

    // Không trả password ra ngoài
    (user as any).password = undefined;
    return user;
  }

  // ⭐ Update avatar URL (Cloudinary trả URL, mình chỉ lưu vào DB)
  async updateAvatar(userId: string, avatarUrl: string) {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    user.avatarUrl = avatarUrl;
    await userRepository.save(user);
    return user;
  }
}
