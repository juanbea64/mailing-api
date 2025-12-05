import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailingModule } from './mailing/mailing.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { Mailing } from './mailing/entities/mailing.entity';
import { ItemMailing } from './mailing/entities/item-mailing.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'tiendana',
      entities: [Mailing, ItemMailing],
      synchronize: false, // En producción usar migraciones
    }),
    MailingModule,
    WebhooksModule,
  ],
})
export class AppModule {}
