import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileDoc } from './entities/mobile-doc.entity';
import { MobileController } from './mobile.controller';
import { MobileService } from './mobile.service';

@Module({
    imports: [TypeOrmModule.forFeature([MobileDoc])],
    controllers: [MobileController],
    providers: [MobileService],
    exports: [MobileService],
})
export class MobileModule { }
