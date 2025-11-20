//backend/src/common/entities/base/dateTimeEntity.ts
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class DateTimeEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
