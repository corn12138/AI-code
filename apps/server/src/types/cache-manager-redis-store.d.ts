// 这是一个 TypeScript 声明文件，用于定义 'cache-manager-redis-store' 模块的类型。
// 该模块用于在 NestJS 中使用 Redis 作为缓存存储。
declare module 'cache-manager-redis-store' {
    import { Store } from 'cache-manager';

    function redisStore(config?: any): Store;

    export = redisStore;
}
