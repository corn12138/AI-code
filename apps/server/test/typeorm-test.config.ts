import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testTypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'test',
  password: process.env.DB_PASSWORD || 'test',
  database: process.env.DB_DATABASE || 'test_db',
  entities: [],
  synchronize: false,
  logging: false,
  dropSchema: true,
};

export const mockRepository = {
  findOne: vi.fn(),
  save: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  find: vi.fn(),
  count: vi.fn(),
  query: vi.fn(),
};
