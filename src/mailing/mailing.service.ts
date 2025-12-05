import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mailing } from './entities/mailing.entity';
import { ItemMailing } from './entities/item-mailing.entity';
import { CreateMailingDto, BulkCreateMailingDto } from './dto/create-mailing.dto';

interface BulkCreateResult {
  created: number;
  skipped: number;
  errors: string[];
}

@Injectable()
export class MailingService {
  constructor(
    @InjectRepository(Mailing)
    private readonly mailingRepository: Repository<Mailing>,
    @InjectRepository(ItemMailing)
    private readonly itemMailingRepository: Repository<ItemMailing>,
  ) {}

  async create(createMailingDto: CreateMailingDto): Promise<Mailing> {
    // Verificar si el email ya existe
    const existingMailing = await this.mailingRepository.findOne({
      where: { email: createMailingDto.email },
    });

    if (existingMailing) {
      throw new ConflictException(`El email ${createMailingDto.email} ya está registrado`);
    }

    // Crear el mailing
    const mailing = this.mailingRepository.create({
      email: createMailingDto.email,
      is_lock: createMailingDto.is_lock ?? false,
      user_id: createMailingDto.user_id,
    });

    const savedMailing = await this.mailingRepository.save(mailing);

    // Crear los items si existen
    if (createMailingDto.items && createMailingDto.items.length > 0) {
      const items = createMailingDto.items.map((item) =>
        this.itemMailingRepository.create({
          mailing_id: savedMailing.id,
          is_active: item.is_active ?? true,
          mailing_type: item.mailing_type,
        }),
      );
      await this.itemMailingRepository.save(items);
    }

    // Retornar el mailing con sus items
    const result = await this.mailingRepository.findOne({
      where: { id: savedMailing.id },
      relations: ['items'],
    });
    
    return result!;
  }

  async bulkCreate(bulkDto: BulkCreateMailingDto): Promise<BulkCreateResult> {
    const result: BulkCreateResult = {
      created: 0,
      skipped: 0,
      errors: [],
    };

    for (const email of bulkDto.emails) {
      try {
        const existing = await this.mailingRepository.findOne({
          where: { email: email.toLowerCase() },
        });

        if (existing) {
          result.skipped++;
          result.errors.push(`${email} ya existe`);
          continue;
        }

        const mailing = this.mailingRepository.create({
          email: email.toLowerCase(),
          is_lock: false,
        });

        await this.mailingRepository.save(mailing);
        result.created++;
      } catch (error) {
        result.errors.push(`Error con ${email}: ${error.message}`);
      }
    }

    return result;
  }

  async findAll(): Promise<Mailing[]> {
    return this.mailingRepository.find({ relations: ['items'] });
  }

  async findByEmail(email: string): Promise<Mailing | null> {
    return this.mailingRepository.findOne({
      where: { email },
      relations: ['items'],
    });
  }
}
