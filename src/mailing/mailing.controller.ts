import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { CreateMailingDto, BulkCreateMailingDto } from './dto/create-mailing.dto';
import { Mailing } from './entities/mailing.entity';

@Controller('mailing')
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMailingDto: CreateMailingDto): Promise<Mailing> {
    return this.mailingService.create(createMailingDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Body() bulkDto: BulkCreateMailingDto) {
    return this.mailingService.bulkCreate(bulkDto);
  }

  @Get()
  async findAll(): Promise<Mailing[]> {
    return this.mailingService.findAll();
  }
}
