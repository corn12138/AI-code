import 'express';

// 确保RequestWithUser接口正确扩展Request接口
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                username: string;
                roles: string[];
                refreshToken?: string;
            };
        }
    }
}

export { };

