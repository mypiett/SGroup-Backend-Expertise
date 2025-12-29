import { AppDataSource } from '@/config/data-source';
import { List } from '@/common/entities/list.entity';
import { Card } from '@/common/entities/card.entity';
import { Board } from '@/common/entities/board.entity';
import { BoardRepository } from '../boards/board.repository';

export class ListRepository {
  private listRepository = AppDataSource.getRepository(List);
  private cardRepository = AppDataSource.getRepository(Card);
  private boardRepository = new BoardRepository();

  async getAllListsByBoard(boardId: string): Promise<List[]> {
    return await this.listRepository
      .createQueryBuilder('list')
      .select(['list.id', 'list.title', 'list.position'])
      .leftJoin('list.cards', 'cards', 'cards.isArchived = :isCardArchived', {
        isCardArchived: false,
      })
      .addSelect(['cards.id', 'cards.title', 'cards.position', 'cards.boardId'])
      .where('list.boardId = :boardId', { boardId })
      .andWhere('list.isArchived = :isArchived', { isArchived: false })
      .orderBy('list.position', 'ASC')
      .addOrderBy('cards.position', 'ASC')
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

  async updateList(
    listId: string,
    data: Partial<List>
  ): Promise<Partial<List> & { id: string }> {
    await this.listRepository.update(listId, data);
    return {
      id: listId,
      ...data,
    };
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

  async moveListToBoard(
    listId: string,
    boardId: string,
    targetPosition: number
  ): Promise<List> {
    const list = await this.findListById(listId);
    if (!list) throw new Error('List not found');

    const currentBoardId = list.board.id;
    const isSameBoardMove = currentBoardId === boardId;

    // Kiểm tra workspace nếu chuyển board khác
    if (!isSameBoardMove) {
      const isSameWorkspace = await this.boardRepository.isSameWorkspace(
        currentBoardId,
        boardId
      );
      if (!isSameWorkspace) {
        throw new Error('Cannot move list to a board in a different workspace');
      }
      list.board = { id: boardId } as any;
    }

    const [newPosition, cardIds] = await Promise.all([
      this.calculateNewPosition(
        boardId,
        targetPosition,
        isSameBoardMove ? listId : null
      ),
      !isSameBoardMove ? this.getCardIdsFromList(listId) : Promise.resolve([]),
    ]);

    if (!isSameBoardMove && cardIds.length > 0) {
      await this.updateCardsListAndBoard(cardIds, listId, boardId);
    }

    list.position = newPosition;

    return await this.listRepository.save(list);
  }

  private async calculateNewPosition(
    boardId: string,
    targetPosition: number,
    excludeListId: string | null
  ): Promise<number> {
    const countQuery = this.listRepository
      .createQueryBuilder('list')
      .where('list.boardId = :boardId', { boardId })
      .andWhere('list.isArchived = :isArchived', { isArchived: false });

    if (excludeListId) {
      countQuery.andWhere('list.id != :excludeListId', { excludeListId });
    }

    const totalLists = await countQuery.getCount();

    if (totalLists === 0 || targetPosition === 1) {
      if (totalLists === 0) return 1;

      const firstList = await this.listRepository
        .createQueryBuilder('list')
        .select(['list.position'])
        .where('list.boardId = :boardId', { boardId })
        .andWhere('list.isArchived = :isArchived', { isArchived: false })
        .orderBy('list.position', 'ASC')
        .limit(1)
        .getOne();

      return firstList ? firstList.position / 2 : 1;
    }

    if (targetPosition > totalLists) {
      const lastList = await this.listRepository
        .createQueryBuilder('list')
        .select(['list.position'])
        .where('list.boardId = :boardId', { boardId })
        .andWhere('list.isArchived = :isArchived', { isArchived: false })
        .orderBy('list.position', 'DESC')
        .limit(1)
        .getOne();

      return lastList ? lastList.position + 1 : 1;
    }

    const surroundingLists = await this.listRepository
      .createQueryBuilder('list')
      .select(['list.id', 'list.position'])
      .where('list.boardId = :boardId', { boardId })
      .andWhere('list.isArchived = :isArchived', { isArchived: false })
      .orderBy('list.position', 'ASC')
      .skip(targetPosition - 2)
      .take(2)
      .getMany();

    if (surroundingLists.length === 2) {
      return (surroundingLists[0].position + surroundingLists[1].position) / 2;
    }

    return totalLists + 1;
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
    targetBoardId?: string,
    startPosition?: number
  ): Promise<void> {
    if (cardIds.length === 0) return;

    const updateValues: any = {
      listId: targetListId,
    };

    if (targetBoardId) {
      updateValues.boardId = targetBoardId;
    }

    if (startPosition !== undefined) {
      const caseParts = cardIds
        .map(
          (id, index) => `WHEN id = '${id}' THEN ${startPosition + index + 1}`
        )
        .join(' ');

      updateValues.position = () => `CASE ${caseParts} ELSE position END`;
    }

    await this.cardRepository
      .createQueryBuilder()
      .update(Card)
      .set(updateValues)
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

  async getMaxPositionInList(listId: string): Promise<number> {
    // Tối ưu: Dùng MAX() thay vì ORDER BY + LIMIT
    const result = await this.cardRepository
      .createQueryBuilder('card')
      .select('MAX(card.position)', 'maxPosition')
      .where('card.listId = :listId', { listId })
      .cache(`max_position_list_${listId}`, 10000)
      .getRawOne();
    return result?.maxPosition ?? -1;
  }

  async getMaxPositionInBoard(boardId: string): Promise<number> {
    const result = await this.listRepository
      .createQueryBuilder('list')
      .select('MAX(list.position)', 'maxPosition')
      .where('list.boardId = :boardId', { boardId })
      // .cache(`max_position_board_${boardId}`, 10000)
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
        const newPosition = await this.calculateNewPosition(
          targetBoard.id,
          position,
          null
        );
        const newList = transactionalEntityManager.create(List, {
          title,
          position: newPosition,
          board: targetBoard,
          isArchived: false,
        });
        const savedList = await transactionalEntityManager.save(newList);

        if (sourceCards.length > 0) {
          const cardData = sourceCards.map((sourceCard) => ({
            title: sourceCard.title,
            description: sourceCard.description,
            position: sourceCard.position,
            coverUrl: sourceCard.coverUrl,
            start: sourceCard.start,
            due: sourceCard.due,
            isArchived: false,
            listId: savedList.id,
            boardId: targetBoard.id,
          }));

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
