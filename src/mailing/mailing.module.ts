import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailingController } from './mailing.controller';
import { MailingService } from './mailing.service';
import { Mailing } from './entities/mailing.entity';
import { ItemMailing } from './entities/item-mailing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mailing, ItemMailing])],
  controllers: [MailingController],
  providers: [MailingService],
  exports: [MailingService],
})
export class MailingModule {}
