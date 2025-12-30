import { CheckItemRepository } from './checkItem.repository';
import { ChecklistRepository } from '../checklists/checklist.repository';
import { CardRepository } from '../cards/card.repository';

export class CheckItemService {
  private checkItemRepo = new CheckItemRepository();
  private checklistRepo = new ChecklistRepository();
  private cardRepo = new CardRepository();

  async getCheckItems(cardId: string, checklistId: string) {
    await this.validateCardAndChecklist(cardId, checklistId);

    return this.checkItemRepo.getCheckItemsByChecklistId(checklistId);
  }

  async getCheckItem(cardId: string, checklistId: string, checkItemId: string) {
    await this.validateCardAndChecklist(cardId, checklistId);

    const item = await this.checkItemRepo.getCheckItemById(
      checklistId,
      checkItemId
    );

    if (!item) {
      throw new Error('CheckItem not found');
    }

    return item;
  }

  async createCheckItem(
    cardId: string,
    checklistId: string,
    data: {
      name: string;
      position?: number;
      isChecked?: boolean;
      due?: string;
      dueReminder?: string;
    }
  ) {
    await this.validateCardAndChecklist(cardId, checklistId);

    const maxPosition =
      data.position ??
      (await this.checkItemRepo.getMaxPosition(checklistId)) + 1;

    return this.checkItemRepo.createCheckItem({
      name: data.name.trim(),
      checklistId,
      position: maxPosition,
      isChecked: data.isChecked ?? false,
      due: data.due ? new Date(data.due) : null,
      dueReminder: data.dueReminder ? new Date(data.dueReminder) : null,
    });
  }

  async updateCheckItem(
    cardId: string,
    checklistId: string,
    checkItemId: string,
    updateData: {
      name?: string;
      position?: number;
      isChecked?: boolean;
      due?: string;
      dueReminder?: string;
      checklistId?: string;
    }
  ) {
    const [card, checklist, newChecklist] = await Promise.all([
      this.cardRepo.getCardById(cardId, {
        fields: 'id',
        checklist: true,
      }),
      this.checklistRepo.findChecklistById(checklistId),
      updateData.checklistId
        ? this.checklistRepo.findChecklistById(updateData.checklistId)
        : null,
    ]);

    if (!card) {
      throw new Error('Card not found');
    }

    if (!checklist) {
      throw new Error('Checklist not found');
    }

    if (updateData.checklistId && !newChecklist) {
      throw new Error('New checklist not found');
    }

    const dataToUpdate = {
      name: updateData.name?.trim(),
      position: updateData.position,
      isChecked: updateData.isChecked,
      due: updateData.due ? new Date(updateData.due) : undefined,
      dueReminder: updateData.dueReminder
        ? new Date(updateData.dueReminder)
        : undefined,
      checklistId: updateData.checklistId,
    };

    const updated = await this.checkItemRepo.updateCheckItem(
      checklistId,
      checkItemId,
      dataToUpdate
    );

    if (!updated) {
      throw new Error('CheckItem not found or update failed');
    }

    return updated;
  }

  async toggle(
    cardId: string,
    checklistId: string,
    checkItemId: string,
    isChecked: boolean
  ) {
    await this.validateCardAndChecklist(cardId, checklistId);

    const item = await this.checkItemRepo.toggleCheckItem(
      checklistId,
      checkItemId,
      isChecked
    );

    if (!item) {
      throw new Error('CheckItem not found');
    }

    return item;
  }

  async deleteCheckItem(
    cardId: string,
    checklistId: string,
    checkItemId: string
  ) {
    await this.validateCardAndChecklist(cardId, checklistId);

    const deleted = await this.checkItemRepo.deleteCheckItem(
      checklistId,
      checkItemId
    );

    if (!deleted) {
      throw new Error('CheckItem not found');
    }

    return true;
  }

  private async validateCardAndChecklist(cardId: string, checklistId: string) {
    const card = await this.cardRepo.getCardById(cardId, {
      fields: 'id',
      checklist: true,
    });
    if (!card) throw new Error('Card not found');

    const checklist = await this.checklistRepo.findChecklistById(checklistId);
    if (!checklist) throw new Error('Checklist not found');
  }
}
