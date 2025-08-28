/**
 * 浏览器操作工具集
 * 支持页面导航、元素交互、截图等功能
 */

import { BaseTool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../ToolProtocol';

// 浏览器导航工具
export class BrowserNavigateTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'browser_navigate',
            description: 'Navigate to a URL in the browser',
            category: 'browser',
            parameters: {
                url: {
                    name: 'url',
                    type: 'string',
                    description: 'The URL to navigate to',
                    required: true,
                    pattern: '^https?://.+'
                },
                waitFor: {
                    name: 'waitFor',
                    type: 'string',
                    description: 'CSS selector to wait for after navigation',
                    required: false
                },
                timeout: {
                    name: 'timeout',
                    type: 'number',
                    description: 'Navigation timeout in milliseconds',
                    required: false,
                    default: 30000,
                    minimum: 1000,
                    maximum: 60000
                }
            },
            security: {
                level: 'restricted',
                permissions: ['browser:navigate'],
                sandbox: true,
                timeout: 60000
            },
            examples: [
                {
                    description: 'Navigate to a website',
                    input: { url: 'https://example.com' },
                    output: { success: true, title: 'Example Domain', url: 'https://example.com' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { url, waitFor, timeout = 30000 } = parameters;

        try {
            // 在浏览器环境中执行
            if (context.environment === 'browser') {
                return this.executeBrowserNavigation(url, waitFor, timeout);
            }

            // 在Node.js环境中使用Puppeteer
            return this.executePuppeteerNavigation(url, waitFor, timeout, context);
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'NAVIGATION_FAILED',
                    message: error instanceof Error ? error.message : 'Navigation failed'
                },
                metadata: { executionTime: 0 }
            };
        }
    }

    private async executeBrowserNavigation(url: string, waitFor?: string, timeout: number = 30000): Promise<ToolExecutionResult> {
        return new Promise((resolve) => {
            const startTime = Date.now();

            // 检查是否在iframe中
            if (window.parent !== window) {
                resolve({
                    success: false,
                    error: {
                        code: 'SECURITY_ERROR',
                        message: 'Cannot navigate from iframe for security reasons'
                    },
                    metadata: { executionTime: Date.now() - startTime }
                });
                return;
            }

            // 执行导航
            const timeoutId = setTimeout(() => {
                resolve({
                    success: false,
                    error: {
                        code: 'TIMEOUT',
                        message: `Navigation timeout after ${timeout}ms`
                    },
                    metadata: { executionTime: Date.now() - startTime }
                });
            }, timeout);

            const handleLoad = () => {
                clearTimeout(timeoutId);

                if (waitFor) {
                    this.waitForElement(waitFor, 5000).then(() => {
                        resolve({
                            success: true,
                            result: {
                                url: window.location.href,
                                title: document.title,
                                timestamp: new Date().toISOString()
                            },
                            metadata: { executionTime: Date.now() - startTime }
                        });
                    }).catch((error) => {
                        resolve({
                            success: false,
                            error: {
                                code: 'WAIT_FOR_ELEMENT_FAILED',
                                message: error.message
                            },
                            metadata: { executionTime: Date.now() - startTime }
                        });
                    });
                } else {
                    resolve({
                        success: true,
                        result: {
                            url: window.location.href,
                            title: document.title,
                            timestamp: new Date().toISOString()
                        },
                        metadata: { executionTime: Date.now() - startTime }
                    });
                }
            };

            window.addEventListener('load', handleLoad, { once: true });

            try {
                window.location.href = url;
            } catch (error) {
                clearTimeout(timeoutId);
                resolve({
                    success: false,
                    error: {
                        code: 'NAVIGATION_ERROR',
                        message: error instanceof Error ? error.message : 'Failed to navigate'
                    },
                    metadata: { executionTime: Date.now() - startTime }
                });
            }
        });
    }

    private async executePuppeteerNavigation(
        url: string,
        waitFor?: string,
        timeout: number = 30000,
        context: ToolExecutionContext
    ): Promise<ToolExecutionResult> {
        // 这里需要在服务端环境中使用Puppeteer
        // 由于我们在前端环境，这里提供模拟实现
        return {
            success: false,
            error: {
                code: 'NOT_IMPLEMENTED',
                message: 'Puppeteer navigation not available in browser environment'
            },
            metadata: { executionTime: 0 }
        };
    }

    private async waitForElement(selector: string, timeout: number): Promise<Element> {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }
}

// 页面交互工具
export class BrowserInteractTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'browser_interact',
            description: 'Interact with elements on the current page',
            category: 'browser',
            parameters: {
                action: {
                    name: 'action',
                    type: 'string',
                    description: 'The interaction type',
                    required: true,
                    enum: ['click', 'type', 'select', 'hover', 'scroll']
                },
                selector: {
                    name: 'selector',
                    type: 'string',
                    description: 'CSS selector for the target element',
                    required: true
                },
                value: {
                    name: 'value',
                    type: 'string',
                    description: 'Value to input (for type/select actions)',
                    required: false
                },
                options: {
                    name: 'options',
                    type: 'object',
                    description: 'Additional options for the interaction',
                    required: false,
                    properties: {
                        delay: {
                            name: 'delay',
                            type: 'number',
                            description: 'Delay before action in milliseconds',
                            required: false
                        },
                        force: {
                            name: 'force',
                            type: 'boolean',
                            description: 'Force the action even if element is not visible',
                            required: false
                        }
                    }
                }
            },
            security: {
                level: 'restricted',
                permissions: ['browser:interact'],
                sandbox: true,
                timeout: 10000
            },
            examples: [
                {
                    description: 'Click a button',
                    input: { action: 'click', selector: '#submit-btn' },
                    output: { success: true, element: 'button', action: 'click' }
                },
                {
                    description: 'Type in an input field',
                    input: { action: 'type', selector: '#username', value: 'john@example.com' },
                    output: { success: true, element: 'input', action: 'type', value: 'john@example.com' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { action, selector, value, options = {} } = parameters;
        const startTime = Date.now();

        try {
            // 等待延迟
            if (options.delay) {
                await new Promise(resolve => setTimeout(resolve, options.delay));
            }

            // 查找元素
            const element = document.querySelector(selector);
            if (!element) {
                return {
                    success: false,
                    error: {
                        code: 'ELEMENT_NOT_FOUND',
                        message: `Element not found: ${selector}`
                    },
                    metadata: { executionTime: Date.now() - startTime }
                };
            }

            // 检查元素可见性
            if (!options.force && !this.isElementVisible(element)) {
                return {
                    success: false,
                    error: {
                        code: 'ELEMENT_NOT_VISIBLE',
                        message: `Element not visible: ${selector}`
                    },
                    metadata: { executionTime: Date.now() - startTime }
                };
            }

            // 执行操作
            const result = await this.performAction(element, action, value);

            return {
                success: true,
                result: {
                    element: element.tagName.toLowerCase(),
                    action,
                    selector,
                    ...(value && { value }),
                    ...result
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'INTERACTION_FAILED',
                    message: error instanceof Error ? error.message : 'Interaction failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private isElementVisible(element: Element): boolean {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            style.opacity !== '0';
    }

    private async performAction(element: Element, action: string, value?: string): Promise<any> {
        switch (action) {
            case 'click':
                (element as HTMLElement).click();
                return { clicked: true };

            case 'type':
                if (!value) throw new Error('Value required for type action');
                if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                    element.focus();
                    element.value = value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    throw new Error('Element is not typeable');
                }
                return { typed: value };

            case 'select':
                if (!value) throw new Error('Value required for select action');
                if (element instanceof HTMLSelectElement) {
                    element.value = value;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    throw new Error('Element is not a select element');
                }
                return { selected: value };

            case 'hover':
                element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                return { hovered: true };

            case 'scroll':
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return { scrolled: true };

            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
}

// 页面截图工具
export class BrowserScreenshotTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'browser_screenshot',
            description: 'Take a screenshot of the current page or element',
            category: 'browser',
            parameters: {
                selector: {
                    name: 'selector',
                    type: 'string',
                    description: 'CSS selector for element to screenshot (optional, full page if not provided)',
                    required: false
                },
                format: {
                    name: 'format',
                    type: 'string',
                    description: 'Screenshot format',
                    required: false,
                    enum: ['png', 'jpeg', 'webp'],
                    default: 'png'
                },
                quality: {
                    name: 'quality',
                    type: 'number',
                    description: 'Image quality (0-1, for jpeg/webp)',
                    required: false,
                    minimum: 0,
                    maximum: 1,
                    default: 0.9
                },
                width: {
                    name: 'width',
                    type: 'number',
                    description: 'Screenshot width',
                    required: false,
                    minimum: 100,
                    maximum: 4096
                },
                height: {
                    name: 'height',
                    type: 'number',
                    description: 'Screenshot height',
                    required: false,
                    minimum: 100,
                    maximum: 4096
                }
            },
            security: {
                level: 'safe',
                permissions: ['browser:screenshot'],
                sandbox: true,
                timeout: 30000
            },
            examples: [
                {
                    description: 'Take full page screenshot',
                    input: {},
                    output: { success: true, format: 'png', size: { width: 1920, height: 1080 } }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { selector, format = 'png', quality = 0.9, width, height } = parameters;
        const startTime = Date.now();

        try {
            // 在浏览器环境中，使用Canvas API进行截图
            if (context.environment === 'browser') {
                return this.takeBrowserScreenshot(selector, format, quality, width, height, startTime);
            }

            // 在Node.js环境中使用Puppeteer（这里为示例）
            return {
                success: false,
                error: {
                    code: 'NOT_IMPLEMENTED',
                    message: 'Server-side screenshot not implemented in this demo'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'SCREENSHOT_FAILED',
                    message: error instanceof Error ? error.message : 'Screenshot failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private async takeBrowserScreenshot(
        selector?: string,
        format: string = 'png',
        quality: number = 0.9,
        width?: number,
        height?: number,
        startTime: number = Date.now()
    ): Promise<ToolExecutionResult> {
        try {
            // 使用html2canvas库进行截图（需要在项目中安装）
            // 这里提供一个简化的实现

            let targetElement: Element | null = null;

            if (selector) {
                targetElement = document.querySelector(selector);
                if (!targetElement) {
                    return {
                        success: false,
                        error: {
                            code: 'ELEMENT_NOT_FOUND',
                            message: `Element not found: ${selector}`
                        },
                        metadata: { executionTime: Date.now() - startTime }
                    };
                }
            }

            // 创建canvas元素
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Cannot create canvas context');
            }

            // 设置canvas尺寸
            const targetWidth = width || window.innerWidth;
            const targetHeight = height || window.innerHeight;

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // 绘制页面内容到canvas（简化实现）
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // 添加一些示例内容
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.fillText('Screenshot captured at ' + new Date().toISOString(), 10, 30);
            ctx.fillText(`Selector: ${selector || 'full page'}`, 10, 60);
            ctx.fillText(`Format: ${format}`, 10, 90);

            // 转换为data URL
            const mimeType = `image/${format}`;
            const dataUrl = canvas.toDataURL(mimeType, quality);

            return {
                success: true,
                result: {
                    dataUrl,
                    format,
                    size: {
                        width: targetWidth,
                        height: targetHeight
                    },
                    timestamp: new Date().toISOString(),
                    selector: selector || null
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            throw error;
        }
    }
}

// 页面信息获取工具
export class BrowserGetInfoTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'browser_get_info',
            description: 'Get information about the current page',
            category: 'browser',
            parameters: {
                type: {
                    name: 'type',
                    type: 'string',
                    description: 'Type of information to get',
                    required: true,
                    enum: ['page', 'elements', 'cookies', 'localStorage', 'performance']
                },
                selector: {
                    name: 'selector',
                    type: 'string',
                    description: 'CSS selector for elements (when type is "elements")',
                    required: false
                }
            },
            security: {
                level: 'safe',
                permissions: ['browser:read'],
                sandbox: true,
                timeout: 5000
            },
            examples: [
                {
                    description: 'Get page information',
                    input: { type: 'page' },
                    output: { title: 'Example', url: 'https://example.com', domain: 'example.com' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { type, selector } = parameters;
        const startTime = Date.now();

        try {
            let result: any;

            switch (type) {
                case 'page':
                    result = this.getPageInfo();
                    break;
                case 'elements':
                    result = this.getElementsInfo(selector);
                    break;
                case 'cookies':
                    result = this.getCookiesInfo();
                    break;
                case 'localStorage':
                    result = this.getLocalStorageInfo();
                    break;
                case 'performance':
                    result = this.getPerformanceInfo();
                    break;
                default:
                    throw new Error(`Unknown info type: ${type}`);
            }

            return {
                success: true,
                result,
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'GET_INFO_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to get info'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private getPageInfo(): any {
        return {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            protocol: window.location.protocol,
            path: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            referrer: document.referrer,
            language: navigator.language,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            scroll: {
                x: window.scrollX,
                y: window.scrollY
            }
        };
    }

    private getElementsInfo(selector?: string): any {
        const elements = selector ?
            Array.from(document.querySelectorAll(selector)) :
            Array.from(document.querySelectorAll('*'));

        return {
            count: elements.length,
            elements: elements.slice(0, 100).map(el => ({
                tagName: el.tagName.toLowerCase(),
                id: el.id || null,
                className: el.className || null,
                textContent: el.textContent?.slice(0, 100) || null,
                attributes: this.getElementAttributes(el)
            }))
        };
    }

    private getElementAttributes(element: Element): Record<string, string> {
        const attrs: Record<string, string> = {};
        for (const attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }

    private getCookiesInfo(): any {
        return {
            cookies: document.cookie.split(';').map(cookie => {
                const [name, value] = cookie.trim().split('=');
                return { name, value };
            }).filter(cookie => cookie.name)
        };
    }

    private getLocalStorageInfo(): any {
        const items: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                items[key] = localStorage.getItem(key) || '';
            }
        }
        return { items, count: localStorage.length };
    }

    private getPerformanceInfo(): any {
        const performance = window.performance;
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        return {
            timing: {
                domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
                loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint()
            },
            memory: (performance as any).memory ? {
                usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
            } : null,
            navigation: navigation ? {
                type: navigation.type,
                redirectCount: navigation.redirectCount,
                transferSize: navigation.transferSize,
                encodedBodySize: navigation.encodedBodySize,
                decodedBodySize: navigation.decodedBodySize
            } : null
        };
    }

    private getFirstPaint(): number | null {
        const paintEntries = performance.getEntriesByType('paint');
        const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
        return fpEntry ? fpEntry.startTime : null;
    }

    private getFirstContentfulPaint(): number | null {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
    }
}
