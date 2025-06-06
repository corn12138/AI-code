import { SetMetadata } from '@nestjs/common';

// 这是一个公共装饰器
// 该装饰器用于标记某个路由或处理程序为公共的，不需要身份验证
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
