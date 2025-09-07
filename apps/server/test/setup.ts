import { config } from 'dotenv'
import 'reflect-metadata'
import { afterAll, beforeAll } from 'vitest'
import { register } from 'prom-client'

// 加载测试环境变量
config({ path: '.env.test' })

// 全局测试设置
beforeAll(async () => {
  // 清理Prometheus注册表，避免重复注册错误
  register.clear()
  
  // 设置测试环境
  process.env.NODE_ENV = 'test'
  process.env.TYPEORM_LOGGING = 'false'

  // 禁用TypeORM日志
  process.env.TYPEORM_LOGGING = 'false'
  process.env.TYPEORM_SYNCHRONIZE = 'false'

  console.log('🧪 测试环境初始化完成')
})

afterAll(async () => {
  // 清理测试数据
  // 关闭数据库连接
  console.log('🧹 测试环境清理完成')
})

// 全局测试配置
export const testConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'test',
    password: process.env.DB_PASSWORD || 'test',
    database: process.env.DB_DATABASE || 'test_db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'test-secret',
    expiresIn: '1h'
  }
}
