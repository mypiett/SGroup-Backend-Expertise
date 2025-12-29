import { AppDataSource } from '@/config/data-source';
import { Card } from '@/common/entities/card.entity';

export class CardRepository {
  private cardRepository = AppDataSource.getRepository(Card);

  async getCardById(cardId: string, queryParams: any): Promise<Card | null> {
    const query = this.cardRepository
      .createQueryBuilder('card')
      .where('card.id = :cardId', { cardId })
      .select([
        'card.id',
        'card.title',
        'card.description',
        'card.position',
        'card.coverUrl',
        'card.start',
        'card.due',
        'card.isCompleted',
      ])
      .leftJoinAndSelect('card.labels', 'label');
    const {
      fields,
      actions,
      attachments,
      attachment_fields,
      members,
      member_fields,
      checklist,
      checkItemFields,
      list,
      board,
      board_fields,
    } = queryParams;
    if (fields) {
      const fieldsArray = fields.split(',');
      query.select(fieldsArray.map((field: string) => `card.${field}`));
    }
    if (actions) {
      query.leftJoinAndSelect('card.actions', 'action');
    }
    if (attachments) {
      query.leftJoinAndSelect('card.attachments', 'attachment');
      if (attachment_fields) {
        const attachmentFieldsArray = attachment_fields.split(',');
        query.addSelect(
          attachmentFieldsArray.map((field: string) => `attachment.${field}`)
        );
      }
    }
    if (members) {
      query.leftJoinAndSelect('card.members', 'member');
      if (member_fields) {
        const memberFieldsArray = member_fields.split(',');
        query.addSelect(
          memberFieldsArray.map((field: string) => `member.${field}`)
        );
      }
    }
    if (checklist) {
      query
        .leftJoinAndSelect('card.checklists', 'checklist')
        .leftJoinAndSelect('checklist.checkItems', 'checkItem');
      if (checkItemFields) {
        const checkItemFieldsArray = checkItemFields.split(',');
        query.addSelect(
          checkItemFieldsArray.map((field: string) => `checklist.${field}`)
        );
      }
    }
    if (list) {
      query.leftJoinAndSelect('card.list', 'list');
    }
    if (board) {
      if (board_fields) {
        const boardFieldsArray = board_fields.split(',');
        query.leftJoin('card.board', 'board');
        query.addSelect(
          boardFieldsArray.map((field: string) => `board.${field}`)
        );
      } else {
        query.leftJoinAndSelect('card.board', 'board');
      }
    }
    return await query.getOne();
  }

  async createCard(
    listId: string,
    boardId: string,
    cardData: {
      title: string;
      description?: string;
      position?: number;
      coverUrl?: string;
      start?: Date;
      due?: Date;
      isCompleted?: boolean;
      cardSourceId?: string;
      keepFromSource?: string;
      memberIds?: string[];
      labelIds?: string[];
    }
  ): Promise<Card> {
    if (cardData.cardSourceId) {
      // implement here
      const sourceCard = await this.cardRepository.findOneBy({
        id: cardData.cardSourceId,
      });
      if (!sourceCard) {
        throw new Error('Source card not found');
      }

      if (cardData.keepFromSource === 'all' || !cardData.keepFromSource) {
        cardData.title = sourceCard.title;
        cardData.description = sourceCard.description;
        cardData.position = sourceCard.position;
        cardData.coverUrl = sourceCard.coverUrl;
        cardData.start = sourceCard.start;
        cardData.due = sourceCard.due;
        cardData.isCompleted = sourceCard.isCompleted;
      } else {
        const keepFields = cardData.keepFromSource.split(',');
        for (const field of keepFields) {
          switch (field.trim()) {
            case 'title':
              cardData.title = sourceCard.title;
              break;
            case 'description':
              cardData.description = sourceCard.description;
              break;
            case 'position':
              cardData.position = sourceCard.position;
              break;
            case 'coverUrl':
              cardData.coverUrl = sourceCard.coverUrl;
              break;
            case 'start':
              cardData.start = sourceCard.start;
              break;
            case 'due':
              cardData.due = sourceCard.due;
              break;
            case 'isCompleted':
              cardData.isCompleted = sourceCard.isCompleted;
              break;
          }
        }
      }
    }
    const result = await this.cardRepository
      .createQueryBuilder()
      .insert()
      .into(Card)
      .values({
        listId,
        boardId,
        title: cardData.title,
        description: cardData.description,
        position: cardData.position,
        coverUrl: cardData.coverUrl,
        start: cardData.start,
        due: cardData.due,
        isCompleted: cardData.isCompleted || false,
      })
      .returning([
        'id',
        'title',
        'description',
        'position',
        'coverUrl',
        'start',
        'due',
        'isCompleted',
      ])
      .execute();
    return result.raw[0] as Card;
  }

  async updateCard(
    cardId: string,
    updateData: {
      title?: string;
      description?: string;
      position?: number;
      isArchived?: boolean;
      listId?: string;
      boardId?: string;
      coverUrl?: string;
      start?: Date;
      due?: Date;
      isCompleted?: boolean;
    }
  ): Promise<Card | null> {
    const result = await this.cardRepository
      .createQueryBuilder()
      .update(Card)
      .set(updateData)
      .where('id = :cardId', { cardId })
      .returning([
        'id',
        'title',
        'description',
        'position',
        'isArchived',
        'listId',
        'boardId',
        'coverUrl',
        'start',
        'due',
        'isCompleted',
        'memberIds',
        'labelIds',
      ])
      .execute();
    return result.raw[0] as Card;
  }

  async deleteCard(cardId: string): Promise<boolean> {
    const result = await this.cardRepository.delete(cardId);
    return result.affected !== undefined && result.affected > 0;
  }
}
