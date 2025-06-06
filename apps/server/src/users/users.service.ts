import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findOne(id: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({ where: { id } });
        return user || undefined;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({ where: { email } });
        return user || undefined;
    }

    async findByUsername(username: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({ where: { username } });
        return user || undefined;
    }

    async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({
            where: [
                { username: usernameOrEmail },
                { email: usernameOrEmail },
            ],
        });
        return user || undefined;
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
        if (refreshToken) {
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
            await this.usersRepository.update(userId, { refreshToken: hashedRefreshToken });
        } else {
            await this.usersRepository.update(userId, { refreshToken: null });
        }
    }
}
