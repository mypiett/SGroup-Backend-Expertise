import { AppDataSource } from '@/config/data-source';
import { Label } from '@/common/entities/label.entity';

export class LabelRepository {
  private labelRepository = AppDataSource.getRepository(Label);

  async getLabelById(labelId: string, fields?: string): Promise<Label | null> {
    const query = this.labelRepository
      .createQueryBuilder('label')
      .where('label.id = :labelId', { labelId });

    if (fields) {
      const fieldsArray = fields.split(',').map((f) => f.trim());
      query.select(fieldsArray.map((f) => `label.${f}`));
    }

    return await query.getOne();
  }

  async getLabelsByBoardId(boardId: string, fields?: string): Promise<Label[]> {
    const query = this.labelRepository
      .createQueryBuilder('label')
      .where('label.boardId = :boardId', { boardId })
      .orderBy('label.createdAt', 'ASC');

    if (fields) {
      const fieldsArray = fields.split(',').map((f) => f.trim());
      query.select(fieldsArray.map((f) => `label.${f}`));
    }

    return await query.getMany();
  }

  async createLabel(
    boardId: string,
    labelData: { name: string; color: string }
  ): Promise<Label> {
    const result = await this.labelRepository
      .createQueryBuilder()
      .insert()
      .into(Label)
      .values({
        boardId,
        name: labelData.name,
        color: labelData.color,
      })
      .returning(['id', 'name', 'color', 'boardId'])
      .execute();

    return result.raw[0] as Label;
  }

  async updateLabel(
    labelId: string,
    updateData: { name?: string; color?: string }
  ): Promise<Label | null> {
    const result = await this.labelRepository
      .createQueryBuilder()
      .update(Label)
      .set(updateData)
      .where('id = :labelId', { labelId })
      .returning(['id', 'name', 'color', 'boardId'])
      .execute();

    return result.affected ? (result.raw[0] as Label) : null;
  }

  async deleteLabel(labelId: string): Promise<boolean> {
    const result = await this.labelRepository.delete(labelId);
    return result.affected !== undefined && result.affected > 0;
  }

  async isLabelInBoard(labelId: string, boardId: string): Promise<boolean> {
    const count = await this.labelRepository.count({
      where: { id: labelId, boardId },
    });
    return count > 0;
  }
}
