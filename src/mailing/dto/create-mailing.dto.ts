import {
  IsEmail,
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MailingType } from '../entities/item-mailing.entity';

export class CreateItemMailingDto {
  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @IsEnum(MailingType)
  mailing_type: MailingType;
}

export class CreateMailingDto {
  @IsEmail()
  @MaxLength(512)
  email: string;

  @IsBoolean()
  @IsOptional()
  is_lock?: boolean = false;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  user_id?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateItemMailingDto)
  items?: CreateItemMailingDto[];
}
