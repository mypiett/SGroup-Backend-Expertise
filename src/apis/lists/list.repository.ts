import { AppDataSource } from '@/config/data-source';
import { List } from '@/common/entities/list.entity';
import { Card } from '@/common/entities/card.entity';
import { Board } from '@/common/entities/board.entity';

export class ListRepository {
  private listRepository = AppDataSource.getRepository(List);
  private cardRepository = AppDataSource.getRepository(Card);
  private boardRepository = AppDataSource.getRepository(Board);

  async findListById(
    listId: string,
    includeCards = false
  ): Promise<List | null> {
    const relations = ['board'];
    if (includeCards) {
      relations.push('cards');
    }
    return await this.listRepository.findOne({
      where: { id: listId },
      relations,
      cache: 5000,
    });
  }

  async findBoardById(boardId: string): Promise<Board | null> {
    return await this.boardRepository.findOne({
      where: { id: boardId },
    });
  }

  async updateList(listId: string, data: Partial<List>): Promise<List> {
    await this.listRepository.update(listId, data);
    return await this.findListById(listId);
  }

  async findCardsByListId(listId: string): Promise<Card[]> {
    return await this.cardRepository.find({
      where: { list: { id: listId } },
    });
  }

  async updateCard(cardId: string, data: Partial<Card>): Promise<void> {
    await this.cardRepository.update(cardId, data);
  }

  async bulkArchiveCards(cardIds: string[]): Promise<void> {
    if (cardIds.length === 0) return;
    // Bulk update thay vì loop - CRITICAL OPTIMIZATION
    await this.cardRepository
      .createQueryBuilder()
      .update(Card)
      .set({ isArchived: true })
      .whereInIds(cardIds)
      .execute();
  }

  async updateMultipleCards(
    cardIds: string[],
    data: Partial<Card>
  ): Promise<void> {
    await this.cardRepository.update(cardIds, data);
  }

  async moveListToBoard(listId: string, boardId: string): Promise<List> {
    const list = await this.findListById(listId);
    if (!list) throw new Error('List not found');

    const board = await this.findBoardById(boardId);
    if (!board) throw new Error('Target board not found');

    list.board = board;
    return await this.listRepository.save(list);
  }

  async getCardsByList(
    listId: string,
    includeArchived = false
  ): Promise<Card[]> {
    const query = this.cardRepository
      .createQueryBuilder('card')
      .where('card.listId = :listId', { listId });

    if (!includeArchived) {
      query.andWhere('card.isArchived = :isArchived', { isArchived: false });
    }

    return await query.getMany();
  }

  async getCardIdsFromList(listId: string): Promise<string[]> {
    // Chỉ lấy IDs - nhanh hơn nhiều so với load full entity
    const cards = await this.cardRepository
      .createQueryBuilder('card')
      .select('card.id')
      .where('card.listId = :listId', { listId })
      .getMany();
    return cards.map((c) => c.id);
  }

  async updateCardsListAndBoard(
    cardIds: string[],
    targetListId: string,
    targetBoardId?: string
  ): Promise<void> {
    if (cardIds.length === 0) return;

    // Bulk update trong 1 query thay vì loop - TỐI ƯU TỪ N queries -> 1 query
    const updateData: any = { list: { id: targetListId } };
    if (targetBoardId) {
      updateData.board = { id: targetBoardId };
    }

    await this.cardRepository
      .createQueryBuilder()
      .update(Card)
      .set(updateData)
      .whereInIds(cardIds)
      .execute();
  }

  async createList(data: Partial<List>): Promise<List> {
    const newList = this.listRepository.create(data);
    return await this.listRepository.save(newList);
  }

  async createCard(data: Partial<Card>): Promise<Card> {
    const newCard = this.cardRepository.create(data);
    return await this.cardRepository.save(newCard);
  }

  async getMaxPositionInBoard(boardId: string): Promise<number> {
    // Tối ưu: Dùng MAX() thay vì ORDER BY + LIMIT
    const result = await this.listRepository
      .createQueryBuilder('list')
      .select('MAX(list.position)', 'maxPosition')
      .where('list.boardId = :boardId', { boardId })
      .getRawOne();
    return result?.maxPosition ?? -1;
  }

  async copyListWithCards(
    sourceList: List,
    targetBoard: Board,
    title: string,
    position: number,
    sourceCards: Card[]
  ): Promise<{ list: List; copiedCount: number }> {
    // TRANSACTION - đảm bảo ACID và performance
    return await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        // Create list
        const newList = transactionalEntityManager.create(List, {
          title,
          position,
          board: targetBoard,
          isArchived: false,
        });
        const savedList = await transactionalEntityManager.save(newList);

        // Bulk insert cards nếu có - NHANH HƠN NHIỀU
        if (sourceCards.length > 0) {
          const cardData = sourceCards.map((sourceCard) => ({
            title: sourceCard.title,
            description: sourceCard.description,
            position: sourceCard.position,
            coverUrl: sourceCard.coverUrl,
            priority: sourceCard.priority,
            dueDate: sourceCard.dueDate,
            isArchived: false,
            list: savedList,
          }));

          // Bulk insert trong 1 query
          await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(Card)
            .values(cardData)
            .execute();
        }

        return { list: savedList, copiedCount: sourceCards.length };
      }
    );
  }
}
