import { redisClient } from '@/config/redisClient';

export class RBACCache {
  private readonly PREFIX = 'rbac:';
  private readonly DEFAULT_TTL = 60; // 60 seconds

  private getKey(type: string, ...parts: string[]): string {
    return `${this.PREFIX}${type}:${parts.join(':')}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data.toString()) as T;
    } catch (error) {
      console.error('RBAC Cache get error:', error);
      return null;
    }
  }

  async set(
    key: string,
    data: unknown,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('RBAC Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('RBAC Cache delete error:', error);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(`${this.PREFIX}${pattern}`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('RBAC Cache deleteByPattern error:', error);
    }
  }

  getWorkspaceMembershipKey(userId: string, workspaceId: string): string {
    return this.getKey('ws_member', userId, workspaceId);
  }

  async getWorkspaceMembership<T>(
    userId: string,
    workspaceId: string
  ): Promise<T | null> {
    const key = this.getWorkspaceMembershipKey(userId, workspaceId);
    return this.get<T>(key);
  }

  async setWorkspaceMembership(
    userId: string,
    workspaceId: string,
    data: unknown
  ): Promise<void> {
    const key = this.getWorkspaceMembershipKey(userId, workspaceId);
    await this.set(key, data);
  }

  getBoardMembershipKey(userId: string, boardId: string): string {
    return this.getKey('board_member', userId, boardId);
  }

  async getBoardMembership<T>(
    userId: string,
    boardId: string
  ): Promise<T | null> {
    const key = this.getBoardMembershipKey(userId, boardId);
    return this.get<T>(key);
  }

  async setBoardMembership(
    userId: string,
    boardId: string,
    data: unknown
  ): Promise<void> {
    const key = this.getBoardMembershipKey(userId, boardId);
    await this.set(key, data);
  }

  getBoardInfoKey(boardId: string): string {
    return this.getKey('board_info', boardId);
  }

  async getBoardInfo<T>(boardId: string): Promise<T | null> {
    const key = this.getBoardInfoKey(boardId);
    return this.get<T>(key);
  }

  async setBoardInfo(
    boardId: string,
    data: unknown,
    ttl: number = 120
  ): Promise<void> {
    const key = this.getBoardInfoKey(boardId);
    await this.set(key, data, ttl);
  }

  getWorkspaceInfoKey(workspaceId: string): string {
    return this.getKey('workspace_info', workspaceId);
  }

  async getWorkspaceInfo<T>(workspaceId: string): Promise<T | null> {
    const key = this.getWorkspaceInfoKey(workspaceId);
    return this.get<T>(key);
  }

  async setWorkspaceInfo(
    workspaceId: string,
    data: unknown,
    ttl: number = 120
  ): Promise<void> {
    const key = this.getWorkspaceInfoKey(workspaceId);
    await this.set(key, data, ttl);
  }

  async clearUserCache(userId: string): Promise<void> {
    await this.deleteByPattern(`*:${userId}:*`);
  }

  async clearWorkspaceMembershipCache(
    userId: string,
    workspaceId: string
  ): Promise<void> {
    await this.delete(this.getWorkspaceMembershipKey(userId, workspaceId));
  }

  async clearBoardMembershipCache(
    userId: string,
    boardId: string
  ): Promise<void> {
    await this.delete(this.getBoardMembershipKey(userId, boardId));
  }

  async clearBoardCache(boardId: string): Promise<void> {
    await Promise.all([
      this.delete(this.getBoardInfoKey(boardId)),
      this.deleteByPattern(`board_member:*:${boardId}`),
    ]);
  }

  async clearWorkspaceCache(workspaceId: string): Promise<void> {
    await Promise.all([
      this.delete(this.getWorkspaceInfoKey(workspaceId)),
      this.deleteByPattern(`ws_member:*:${workspaceId}`),
    ]);
  }

  getListBoardKey(listId: string): string {
    return this.getKey('list_board', listId);
  }

  async getListBoardId(listId: string): Promise<string | null> {
    const key = this.getListBoardKey(listId);
    return this.get<string>(key);
  }

  async setListBoardId(listId: string, boardId: string): Promise<void> {
    const key = this.getListBoardKey(listId);
    await this.set(key, boardId, 300); // 5 minutes TTL
  }

  getCardBoardKey(cardId: string): string {
    return this.getKey('card_board', cardId);
  }

  async getCardBoardId(cardId: string): Promise<string | null> {
    const key = this.getCardBoardKey(cardId);
    return this.get<string>(key);
  }

  async setCardBoardId(cardId: string, boardId: string): Promise<void> {
    const key = this.getCardBoardKey(cardId);
    await this.set(key, boardId, 300); // 5 minutes TTL
  }

  async clearAll(): Promise<void> {
    await this.deleteByPattern('*');
  }
}

export const rbacCache = new RBACCache();
