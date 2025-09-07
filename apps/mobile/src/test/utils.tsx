import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// 自定义渲染器，包含路由上下文
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <BrowserRouter>
            {children}
        </BrowserRouter>
    );
};

const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// 重新导出所有测试库函数
export * from '@testing-library/react';
export { customRender as render };

// Mock函数工具
export const createMockStore = (initialState = {}) => ({
    getState: vi.fn(() => initialState),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
});

// 异步工具函数
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户事件
export const mockUserEvent = {
    click: vi.fn(),
    type: vi.fn(),
    hover: vi.fn(),
    unhover: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    clear: vi.fn(),
    selectOptions: vi.fn(),
    deselectOptions: vi.fn(),
    upload: vi.fn(),
    tab: vi.fn(),
    keyboard: vi.fn(),
    paste: vi.fn(),
    cut: vi.fn(),
};

// 模拟API响应
export const createMockApiResponse = <T>(data: T, success = true) => ({
    data,
    success,
    message: success ? 'success' : 'error',
    code: success ? 200 : 500,
});

// 模拟错误
export const createMockError = (message = 'Network Error', status = 500) => ({
        message,
        status,
        response: {data: {message} },
});
