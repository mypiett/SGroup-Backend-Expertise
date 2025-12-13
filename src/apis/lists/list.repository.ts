import { AppDataSource } from '@/config/data-source';
import { List } from '@/common/entities/list.entity';
import { Card } from '@/common/entities/card.entity';
import { Board } from '@/common/entities/board.entity';

export class ListRepository {
  private listRepository = AppDataSource.getRepository(List);
  private cardRepository = AppDataSource.getRepository(Card);
  private boardRepository = AppDataSource.getRepository(Board);

  async getAllListsByBoard(boardId: string): Promise<List[]> {
    return await this.listRepository
      .createQueryBuilder('list')
      .select(['list.id', 'list.title', 'list.position'])
      .where('list.boardId = :boardId', { boardId })
      .getMany();
  }

  async findListById(
    listId: string,
    includeCards = false
  ): Promise<List | null> {
    const query = this.listRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.board', 'board')
      .where('list.id = :listId', { listId });

    if (includeCards) {
      query.leftJoinAndSelect('list.cards', 'cards');
    }

    return await query.getOne();
  }

  async findBoardById(boardId: string): Promise<Board | null> {
    return await this.boardRepository
      .createQueryBuilder('board')
      .select(['board.id', 'board.title', 'board.isClosed'])
      .where('board.id = :boardId', { boardId })
      .getOne();
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
    // Bulk update thay vì loop
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
      .where('card.listId = :listId', { listId })
      .cache(`cards_list_${listId}_${includeArchived}`, 30000);

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
      .cache(`card_ids_list_${listId}`, 15000)
      .getMany();
    return cards.map((c) => c.id);
  }

  async updateCardsListAndBoard(
    cardIds: string[],
    targetListId: string,
    targetBoardId?: string
  ): Promise<void> {
    if (cardIds.length === 0) return;

    // Use raw column names for better performance
    const updateData: any = { listId: targetListId };
    if (targetBoardId) {
      updateData.boardId = targetBoardId;
    }

    await this.cardRepository
      .createQueryBuilder()
      .update(Card)
      .set(updateData)
      .whereInIds(cardIds)
      .execute();
  }

  async createList(data: {
    title: string;
    position: number;
    boardId: string;
  }): Promise<List> {
    const result = await this.listRepository
      .createQueryBuilder()
      .insert()
      .into(List)
      .values({
        title: data.title,
        position: data.position,
        board: { id: data.boardId } as any,
      })
      .returning(['id', 'title', 'position', 'boardId'])
      .execute();

    return result.raw[0] as List;
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
      .cache(`max_position_board_${boardId}`, 10000)
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

        // Bulk insert cards with boardId if any exist
        if (sourceCards.length > 0) {
          const cardData = sourceCards.map((sourceCard) => ({
            title: sourceCard.title,
            description: sourceCard.description,
            position: sourceCard.position,
            coverUrl: sourceCard.coverUrl,
            priority: sourceCard.priority,
            dueDate: sourceCard.dueDate,
            isArchived: false,
            listId: savedList.id,
            boardId: targetBoard.id,
          }));

          // Bulk insert in one query
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
