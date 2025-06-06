import 'express';

declare global {
    namespace Express {
        // 扩展内置的User接口
        interface User {
            userId: string;
            username: string;
            roles: string[];
            refreshToken?: string;
        }
    }
}

// 需要导出某些内容才能被识别为模块
export { };

