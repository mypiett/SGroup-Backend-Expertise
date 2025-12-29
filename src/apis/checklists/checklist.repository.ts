import { Card } from '@/common/entities/card.entity';
import { Checklist } from '@/common/entities/checklist.entity';
import { AppDataSource } from '@/config/data-source';

export class ChecklistRepository {
  private checklistRepo = AppDataSource.getRepository(Checklist);
  private cardRepo = AppDataSource.getRepository(Card);

  async getAllChecklistByCard(cardId: string): Promise<Checklist[]> {
    return await this.checklistRepo
      .createQueryBuilder('checklist')
      .select(['checklist.id', 'checklist.name', 'checklist.position'])
      .leftJoin('checklist.checkItems', 'checkItems')
      .addSelect(['checkItems.id', 'checkItems.name', 'checkItems.position'])
      .where('checklist.cardId = :cardId', { cardId })
      .orderBy('checklist.position', 'ASC')
      .addOrderBy('checkItems.position', 'ASC')
      .getMany();
  }

  async findChecklistById(checklistId: string): Promise<Checklist | null> {
    return await this.checklistRepo
      .createQueryBuilder('checklist')
      .leftJoinAndSelect('checklist.card', 'card')
      .leftJoinAndSelect('checklist.checkItems', 'checkItems')
      .where('checklist.id = :checklistId', { checklistId })
      .getOne();
  }

  async createChecklist(data: {
    name: string;
    position: number;
    cardId: string;
  }): Promise<Checklist> {
    const card = await this.cardRepo.findOneBy({ id: data.cardId });
    if (!card) {
      throw new Error('Card not found');
    }

    const checklist = this.checklistRepo.create({
      name: data.name,
      position: data.position,
      card,
    });

    return await this.checklistRepo.save(checklist);
  }

  async updateChecklist(
    checklistId: string,
    data: Partial<Checklist>
  ): Promise<Checklist> {
    await this.checklistRepo.update(checklistId, data);

    const updated = await this.findChecklistById(checklistId);
    if (!updated) {
      throw new Error('Checklist not found');
    }

    return updated;
  }

  async deleteChecklist(checklistId: string): Promise<void> {
    await this.checklistRepo.delete(checklistId);
  }
}
