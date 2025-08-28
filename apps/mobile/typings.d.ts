import 'umi/typings';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

// 模块声明
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

// 环境变量
declare const UMI_ENV: string;
