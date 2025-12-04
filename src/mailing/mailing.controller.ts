import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { CreateMailingDto } from './dto/create-mailing.dto';
import { Mailing } from './entities/mailing.entity';

@Controller('mailing')
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMailingDto: CreateMailingDto): Promise<Mailing> {
    return this.mailingService.create(createMailingDto);
  }

  @Get()
  async findAll(): Promise<Mailing[]> {
    return this.mailingService.findAll();
  }
}
