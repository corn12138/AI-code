import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LowcodePage } from './entities/lowcode-page.entity';
import { LowcodeController } from './lowcode.controller';
import { LowcodeService } from './lowcode.service';

@Module({
    imports: [TypeOrmModule.forFeature([LowcodePage])],
    controllers: [LowcodeController],
    providers: [LowcodeService],
    exports: [LowcodeService],
})
export class LowcodeModule { }
