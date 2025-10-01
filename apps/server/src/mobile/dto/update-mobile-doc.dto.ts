import { PartialType } from '@nestjs/swagger';
import { CreateMobileDocDto } from './create-mobile-doc.dto';

export class UpdateMobileDocDto extends PartialType(CreateMobileDocDto) { }
