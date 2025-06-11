'use client';

// 导出共享库中的 useAuth 和 AuthProvider
export { AuthProviderWrapper as AuthProvider, useAuth } from '../../../../shared/auth/src';

// 如果需要在此基础上扩展功能，可以这样做：
// import { useAuth as useSharedAuth, AuthProvider as BaseAuthProvider } from '../../../../shared/auth/src';
// import { AUTH_TOKEN_KEY } from '../../../../shared/auth/src/constants';
// import React from 'react';
// 
// export function useAuth() {
//   const auth = useSharedAuth();
//   
//   // 添加额外的功能或钩子
//   
//   return auth;
// }
