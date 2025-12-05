import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { Mailing } from '../mailing/entities/mailing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mailing])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
