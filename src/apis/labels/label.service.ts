import { Label } from '@/common/entities/label.entity';
import { LabelRepository } from './label.repository';
import { BoardRepository } from '@/apis/boards/board.repository';

export class LabelService {
  private labelRepository = new LabelRepository();
  private boardRepository = new BoardRepository();

  async getLabelsByBoard(boardId: string): Promise<Label[]> {
    const labels = await this.labelRepository.getLabelsByBoardId(boardId);
    if (!labels) {
      throw new Error('Label not found');
    }
    return labels;
  }

  async getLabelById(labelId: string): Promise<any> {
    const label = await this.labelRepository.getLabelById(labelId);
    if (!label) {
      throw new Error('Label not found');
    }
    return label;
  }

  async createLabel(
    boardId: string,
    name: string,
    color: string
  ): Promise<any> {
    const board = await this.boardRepository.findBoardById(boardId);
    if (!board) {
      throw new Error('Board not found');
    }

    const label = await this.labelRepository.createLabel(boardId, {
      name,
      color,
    });

    return label;
  }

  async updateLabel(
    labelId: string,
    updateData: {
      name?: string;
      color?: string;
    }
  ): Promise<any> {
    const label = await this.labelRepository.getLabelById(labelId);
    if (!label) {
      throw new Error('Label not found');
    }

    const updated = await this.labelRepository.updateLabel(labelId, updateData);

    if (!updated) {
      throw new Error('Update label failed');
    }

    return updated;
  }

  async updateLabelField(
    labelId: string,
    field: string,
    value: any
  ): Promise<any> {
    const label = await this.labelRepository.getLabelById(labelId);
    if (!label) {
      throw new Error('Label not found');
    }

    const allowedFields = ['name', 'color'];
    if (!allowedFields.includes(field)) {
      throw new Error('Invalid label field');
    }

    const updated = await this.labelRepository.updateLabel(labelId, {
      [field]: value,
    });

    if (!updated) {
      throw new Error('Update label field failed');
    }

    return updated;
  }

  async deleteLabel(labelId: string): Promise<void> {
    const label = await this.labelRepository.getLabelById(labelId);
    if (!label) {
      throw new Error('Label not found');
    }

    const deleted = await this.labelRepository.deleteLabel(labelId);
    if (!deleted) {
      throw new Error('Delete label failed');
    }
  }
}
