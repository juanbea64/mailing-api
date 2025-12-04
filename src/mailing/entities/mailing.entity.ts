import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ItemMailing } from './item-mailing.entity';

@Entity('mailing')
export class Mailing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 512, nullable: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  is_lock: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  create_date: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  update_date: Date;

  @OneToMany(() => ItemMailing, (item) => item.mailing, { cascade: true })
  items: ItemMailing[];
}
