import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
        try {
            this.logger.debug(`查找用户: ${usernameOrEmail}`);

            const user = await this.usersRepository.findOne({
                where: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail }
                ],
            });

            if (user) {
                this.logger.debug(`找到用户: ${user.username} (ID: ${user.id})`);
            } else {
                this.logger.debug(`未找到用户: ${usernameOrEmail}`);
            }

            return user;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`查找用户时出错: ${usernameOrEmail} - ${errorMessage}`, errorStack);
            throw error;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.usersRepository.findOne({ where: { email } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`通过邮箱查找用户时出错: ${email} - ${errorMessage}`, errorStack);
            throw error;
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        try {
            return await this.usersRepository.findOne({ where: { username } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`通过用户名查找用户时出错: ${username} - ${errorMessage}`, errorStack);
            throw error;
        }
    }

    async findOne(id: string): Promise<User | null> {
        try {
            const user = await this.usersRepository.findOne({ where: { id } });
            if (!user) {
                this.logger.warn(`用户不存在: ${id}`);
            }
            return user;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`通过ID查找用户时出错: ${id} - ${errorMessage}`, errorStack);
            throw error;
        }
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
        try {
            this.logger.debug(`更新刷新令牌: ${userId}`);

            const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;

            await this.usersRepository.update(userId, {
                refreshToken: hashedRefreshToken,
            });

            this.logger.debug(`刷新令牌更新成功: ${userId}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`更新刷新令牌时出错: ${userId} - ${errorMessage}`, errorStack);
            throw error;
        }
    }
}
