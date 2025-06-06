// 这是 关于 角色权限的装饰器
// 该装饰器用于在控制器或处理程序上定义所需的角色
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
