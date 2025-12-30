import { AppDataSource } from '@/config/data-source';
import { CheckItem } from '@/common/entities/checkItem.entity';

export class CheckItemRepository {
  private repo = AppDataSource.getRepository(CheckItem);

  async getCheckItemsByChecklistId(checklistId: string): Promise<CheckItem[]> {
    return this.repo.find({
      where: { checklistId },
      order: { position: 'ASC' },
    });
  }

  async getCheckItemById(
    checklistId: string,
    checkItemId: string
  ): Promise<CheckItem | null> {
    return this.repo.findOne({
      where: {
        id: checkItemId,
        checklistId,
      },
    });
  }

  async getMaxPosition(checklistId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('checkItem')
      .select('MAX(checkItem.position)', 'max')
      .where('checkItem.checklistId = :checklistId', { checklistId })
      .getRawOne();

    return Number(result?.max ?? 0);
  }

  async createCheckItem(data: Partial<CheckItem>): Promise<CheckItem> {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  async updateCheckItem(
    checklistId: string,
    checkItemId: string,
    data: {
      name?: string;
      position?: number;
      isChecked?: boolean;
      due?: Date;
      dueReminder?: Date;
      checklistId?: string;
    }
  ): Promise<CheckItem | null> {
    const item = await this.repo.findOne({
      where: {
        id: checkItemId,
        checklistId,
      },
    });

    if (!item) return null;

    if (data.name !== undefined) {
      item.name = data.name;
    }

    if (data.position !== undefined) {
      item.position = data.position;
    }

    if (data.isChecked !== undefined) {
      item.isChecked = data.isChecked;
    }

    if (data.due !== undefined) {
      item.due = data.due;
    }

    if (data.dueReminder !== undefined) {
      item.dueReminder = data.dueReminder;
    }

    if (data.checklistId !== undefined) {
      item.checklistId = data.checklistId;
    }

    return await this.repo.save(item);
  }

  async toggleCheckItem(
    checklistId: string,
    checkItemId: string,
    isChecked: boolean
  ): Promise<CheckItem | null> {
    const item = await this.getCheckItemById(checklistId, checkItemId);
    if (!item) return null;

    item.isChecked = isChecked;
    return this.repo.save(item);
  }

  async deleteCheckItem(
    checklistId: string,
    checkItemId: string
  ): Promise<boolean> {
    const result = await this.repo.delete({
      id: checkItemId,
      checklistId,
    });

    return !!result.affected;
  }
}
