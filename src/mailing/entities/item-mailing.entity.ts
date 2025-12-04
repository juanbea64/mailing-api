import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mailing } from './mailing.entity';

export enum MailingType {
  Newsletter = 1,
  Promotions = 2,
  Updates = 3,
}

@Entity('item_mailing')
export class ItemMailing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  mailing_id: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'enum', enum: MailingType, default: MailingType.Newsletter })
  mailing_type: MailingType;

  @ManyToOne(() => Mailing, (mailing) => mailing.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mailing_id' })
  mailing: Mailing;
}
