import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
// 暂时注释掉缺失的控制器导入，直到创建相应文件
// import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    // 同时移除对缺失控制器的引用
    controllers: [], // 暂时为空，创建控制器后再添加UsersController
    providers: [UsersService],
    exports: [UsersService], // 确保导出UsersService
})
export class UsersModule { }
