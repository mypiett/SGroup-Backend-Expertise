import { ListRepository } from './list.repository';

export class ListService {
  private listRepository = new ListRepository();

  async archiveList(listId: string) {
    // KHÔNG cần load full entity - chỉ update
    const result = await this.listRepository.updateList(listId, {
      isArchived: true,
    } as any);

    if (!result) {
      throw new Error('List not found');
    }

    return result;
  }

  async unarchiveList(listId: string) {
    const result = await this.listRepository.updateList(listId, {
      isArchived: false,
    } as any);

    if (!result) {
      throw new Error('List not found');
    }

    return result;
  }

  async archiveAllCardsInList(listId: string) {
    // Kiểm tra list tồn tại (không load cards)
    const list = await this.listRepository.findListById(listId, false);
    if (!list) {
      throw new Error('List not found');
    }

    // Lấy chỉ IDs - nhanh hơn nhiều
    const cardIds = await this.listRepository.getCardIdsFromList(listId);

    if (cardIds.length === 0) {
      return { archivedCount: 0 };
    }

    // Bulk update trong 1 query thay vì loop
    await this.listRepository.bulkArchiveCards(cardIds);

    return { archivedCount: cardIds.length };
  }

  async moveListToBoard(listId: string, boardId: string) {
    const list = await this.listRepository.findListById(listId);
    if (!list) {
      throw new Error('List not found');
    }

    const board = await this.listRepository.findBoardById(boardId);
    if (!board) {
      throw new Error('Target board not found');
    }

    return await this.listRepository.moveListToBoard(listId, boardId);
  }

  async moveAllCardsToAnotherList(
    sourceListId: string,
    targetListId: string,
    targetBoardId?: string
  ) {
    const [sourceList, targetList, targetBoard] = await Promise.all([
      this.listRepository.findListById(sourceListId, false),
      this.listRepository.findListById(targetListId, false),
      targetBoardId ? this.listRepository.findBoardById(targetBoardId) : null,
    ]);

    if (!sourceList) throw new Error('Source list not found');
    if (!targetList) throw new Error('Target list not found');
    if (targetBoardId && !targetBoard)
      throw new Error('Target board not found');

    // Lấy chỉ IDs thay vì full entities
    const cardIds = await this.listRepository.getCardIdsFromList(sourceListId);

    if (cardIds.length === 0) {
      return { movedCount: 0 };
    }

    // Bulk update trong 1 query
    await this.listRepository.updateCardsListAndBoard(
      cardIds,
      targetListId,
      targetBoardId
    );

    return { movedCount: cardIds.length };
  }

  async copyListToBoard(
    sourceListId: string,
    targetBoardId: string,
    title?: string,
    position?: number
  ) {
    // Parallel queries để tối ưu
    const [sourceList, targetBoard, sourceCards, maxPosition] =
      await Promise.all([
        this.listRepository.findListById(sourceListId, false),
        this.listRepository.findBoardById(targetBoardId),
        this.listRepository.getCardsByList(sourceListId, false),
        position === undefined
          ? this.listRepository.getMaxPositionInBoard(targetBoardId)
          : Promise.resolve(-1),
      ]);

    if (!sourceList) throw new Error('Source list not found');
    if (!targetBoard) throw new Error('Target board not found');

    const newPosition = position ?? maxPosition + 1;
    const newTitle = title || `${sourceList.title} (Copy)`;

    // Sử dụng transaction với bulk insert
    const result = await this.listRepository.copyListWithCards(
      sourceList,
      targetBoard,
      newTitle,
      newPosition,
      sourceCards
    );

    return {
      list: result.list,
      copiedCardsCount: result.copiedCount,
    };
  }
}
