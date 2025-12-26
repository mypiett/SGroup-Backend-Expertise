import { ListRepository } from '@/apis/lists/list.repository';
import { CardRepository } from './card.repository';

export class CardService {
  private cardRepository = new CardRepository();
  private listRepository = new ListRepository();
  async getCard(cardId: string, query: any): Promise<any> {
    const card = await this.cardRepository.getCardById(cardId, query);
    if (!card) {
      throw new Error('Card not found');
    }
    return card;
  }

  async createCard(cardData: any): Promise<any> {
    const {
      listId,
      title,
      description,
      position,
      coverUrl,
      start,
      due,
      isCompleted,
      cardSourceId,
      keepFromSource,
      memberIds,
      labelIds,
    } = cardData;
    const list = await this.listRepository.findListById(listId, false);
    if (!list) {
      throw new Error('List not found');
    }
    const boardId = list.boardId;
    const newCard = await this.cardRepository.createCard(listId, boardId, {
      title,
      description,
      position,
      coverUrl,
      start,
      due,
      isCompleted,
      cardSourceId,
      keepFromSource,
      memberIds,
      labelIds,
    });
    return newCard;
  }

  async updateCard(cardId: string, updateData: any): Promise<any> {
    const {
      title,
      description,
      position,
      isArchived,
      listId,
      boardId,
      coverUrl,
      start,
      due,
      isCompleted,
    } = updateData;
    const updatedCard = await this.cardRepository.updateCard(cardId, {
      title,
      description,
      position,
      isArchived,
      listId,
      boardId,
      coverUrl,
      start,
      due,
      isCompleted,
    });
    if (!updatedCard) {
      throw new Error('Card not found or update failed');
    }
    return updatedCard;
  }
  async deleteCard(cardId: string): Promise<void> {
    const result = await this.cardRepository.deleteCard(cardId);
    if (!result) {
      throw new Error('Card not found or delete failed');
    }
  }
}
