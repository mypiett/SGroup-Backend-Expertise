// checklist.service.ts
import { AppDataSource } from '@/config/data-source';
import { Checklist } from '@/common/entities/checklist.entity';
import { Card } from '@/common/entities/card.entity';

export class ChecklistService {
  private checklistRepo = AppDataSource.getRepository(Checklist);
  private cardRepo = AppDataSource.getRepository(Card);

  async getByCard(cardId: string) {
    return this.checklistRepo
      .createQueryBuilder('checklist')
      .leftJoinAndSelect('checklist.checkItems', 'checkItem')
      .where('checklist.cardId = :cardId', { cardId })
      .orderBy('checklist.position', 'ASC')
      .addOrderBy('checkItem.position', 'ASC')
      .getMany();
  }

  async getChecklistById(id: string) {
    const checklist = await this.checklistRepo
      .createQueryBuilder('checklist')
      .leftJoinAndSelect('checklist.checkItems', 'checkItem')
      .where('checklist.id = :id', { id })
      .orderBy('checkItem.position', 'ASC')
      .getOne();

    if (!checklist) {
      throw new Error('Checklist not found');
    }

    return checklist;
  }

  async create(cardId: string, name: string) {
    const card = await this.cardRepo.findOne({
      where: { id: cardId },
    });
    if (!card) throw new Error('Card not found');

    const maxPos = await this.checklistRepo
      .createQueryBuilder('c')
      .select('MAX(c.position)', 'max')
      .where('c.cardId = :cardId', { cardId })
      .getRawOne();

    const checklist = this.checklistRepo.create({
      name: name.trim(),
      cardId,
      position: (maxPos?.max ?? 0) + 1,
    });

    return this.checklistRepo.save(checklist);
  }

  async rename(id: string, name: string) {
    const checklist = await this.checklistRepo.findOneBy({ id });
    if (!checklist) throw new Error('Checklist not found');

    checklist.name = name.trim();
    return this.checklistRepo.save(checklist);
  }

  async delete(id: string) {
    const result = await this.checklistRepo.delete(id);
    if (!result.affected) throw new Error('Checklist not found');
    return true;
  }
}
