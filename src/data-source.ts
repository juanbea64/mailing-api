import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Mailing } from './mailing/entities/mailing.entity';
import { ItemMailing } from './mailing/entities/item-mailing.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'tiendana',
  entities: [Mailing, ItemMailing],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
