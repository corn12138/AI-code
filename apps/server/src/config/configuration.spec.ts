import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import configuration from './configuration'

const ORIGINAL_ENV = { ...process.env }

describe('configuration', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('provides sensible defaults when env vars missing', () => {
    delete process.env.PORT
    delete process.env.DATABASE_PORT
    delete process.env.JWT_SECRET

    const config = configuration()
    expect(config.port).toBe(3001)
    expect(config.database.port).toBe(6543)
    expect(config.jwt.secret).toBe('supersecret-dev-only-jwt')
    expect(config.database.synchronize).toBe(true)
  })

  it('reads values from environment variables', () => {
    process.env.PORT = '8080'
    process.env.DATABASE_HOST = 'db.example.com'
    process.env.DATABASE_PORT = '5433'
    process.env.DATABASE_USER = 'dbuser'
    process.env.DATABASE_PASSWORD = 'dbpass'
    process.env.DATABASE_NAME = 'dbname'
    process.env.DATABASE_SSL = 'true'
    process.env.JWT_SECRET = 'jwt-secret'
    process.env.JWT_ACCESS_EXPIRATION = '30m'
    process.env.JWT_REFRESH_EXPIRATION = '30d'
    process.env.THROTTLE_TTL = '120'
    process.env.THROTTLE_LIMIT = '200'
    process.env.BCRYPT_SALT_ROUNDS = '14'
    process.env.CSRF_ENABLED = 'true'
    process.env.CSRF_SECRET = 'csrf-secret'

    const config = configuration()

    expect(config.port).toBe(8080)
    expect(config.database).toMatchObject({
      host: 'db.example.com',
      port: 5433,
      username: 'dbuser',
      password: 'dbpass',
      name: 'dbname',
      ssl: true,
    })
    expect(config.jwt).toEqual({
      secret: 'jwt-secret',
      accessTokenExpiration: '30m',
      refreshTokenExpiration: '30d',
    })
    expect(config.throttle).toEqual({ ttl: 120, limit: 200 })
    expect(config.security).toEqual({
      bcryptSaltRounds: 14,
      csrfEnabled: true,
      csrfSecret: 'csrf-secret',
    })
  })
})
