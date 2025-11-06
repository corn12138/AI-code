import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT 认证守卫
 * 暂时禁用，后续可以集成实际的认证逻辑
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    /**
     * 可以重写这个方法来实现自定义的认证逻辑
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // 暂时允许所有请求通过
        // 后续可以在这里添加实际的认证逻辑
        return true;
    }
}
