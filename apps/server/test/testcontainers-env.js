// Ensure process.env is visible inside tests
// Also speed up TypeORM/Nest boot for tests
jest.setTimeout(60_000);

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_SSL = process.env.DATABASE_SSL || 'false';


