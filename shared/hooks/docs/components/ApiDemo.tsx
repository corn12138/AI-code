import { useCallback, useState } from 'react';

// API请求状态类型
interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// API配置类型
interface ApiConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

// 请求选项类型
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

// 简化的 useApi 实现
function useSimpleApi<T = any>(config: ApiConfig = {}) {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null
    });

    // 模拟API数据
    const mockData = {
        users: [
            { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
            { id: 2, name: '李四', email: 'lisi@example.com', status: 'inactive' },
            { id: 3, name: '王五', email: 'wangwu@example.com', status: 'active' },
        ],
        posts: [
            { id: 1, title: 'React Hooks 最佳实践', author: '张三', likes: 42 },
            { id: 2, title: 'TypeScript 高级技巧', author: '李四', likes: 38 },
            { id: 3, title: '前端性能优化指南', author: '王五', likes: 55 },
        ]
    };

    // 模拟网络延迟
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // 模拟API请求
    const request = useCallback(async (url: string, options: RequestOptions = {}) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // 模拟网络延迟
            await delay(800 + Math.random() * 1200);

            // 模拟错误
            if (url.includes('error')) {
                throw new Error('服务器内部错误');
            }

            if (url.includes('timeout')) {
                await delay(5000);
                throw new Error('请求超时');
            }

            // 模拟不同API端点
            let responseData: any;

            if (url.includes('users')) {
                responseData = mockData.users;
            } else if (url.includes('posts')) {
                responseData = mockData.posts;
            } else if (url.includes('user/') && options.method === 'PUT') {
                // 模拟更新用户
                const userId = parseInt(url.split('/').pop() || '1');
                const updatedUser = {
                    id: userId,
                    ...options.body,
                    email: `${options.body.name.toLowerCase()}@example.com`
                };
                responseData = updatedUser;
            } else if (options.method === 'POST') {
                // 模拟创建数据
                responseData = {
                    id: Date.now(),
                    ...options.body,
                    createdAt: new Date().toISOString()
                };
            } else {
                responseData = { message: '请求成功', data: options.body };
            }

            setState({
                data: responseData,
                loading: false,
                error: null
            });

            return responseData;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '请求失败';
            setState({
                data: null,
                loading: false,
                error: errorMessage
            });
            throw error;
        }
    }, []);

    // GET 请求
    const get = useCallback((url: string, options: Omit<RequestOptions, 'method'> = {}) => {
        return request(url, { ...options, method: 'GET' });
    }, [request]);

    // POST 请求
    const post = useCallback((url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
        return request(url, { ...options, method: 'POST', body: data });
    }, [request]);

    // PUT 请求
    const put = useCallback((url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) => {
        return request(url, { ...options, method: 'PUT', body: data });
    }, [request]);

    // DELETE 请求
    const del = useCallback((url: string, options: Omit<RequestOptions, 'method'> = {}) => {
        return request(url, { ...options, method: 'DELETE' });
    }, [request]);

    // 清除状态
    const clearState = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        request,
        get,
        post,
        put,
        delete: del,
        clearState
    };
}

export default function ApiDemo() {
    const api = useSimpleApi({ baseURL: 'https://api.example.com' });
    const [selectedEndpoint, setSelectedEndpoint] = useState('users');
    const [requestMethod, setRequestMethod] = useState<'GET' | 'POST' | 'PUT'>('GET');
    const [requestBody, setRequestBody] = useState('{"name": "新用户", "email": "newuser@example.com"}');
    const [requestHistory, setRequestHistory] = useState<Array<{
        id: number;
        method: string;
        url: string;
        status: 'success' | 'error';
        timestamp: string;
        duration: number;
    }>>([]);

    // 预定义的API端点
    const endpoints = [
        { value: 'users', label: '获取用户列表', method: 'GET' },
        { value: 'posts', label: '获取文章列表', method: 'GET' },
        { value: 'users', label: '创建用户', method: 'POST' },
        { value: 'user/1', label: '更新用户', method: 'PUT' },
        { value: 'error', label: '模拟错误', method: 'GET' },
        { value: 'timeout', label: '模拟超时', method: 'GET' },
    ];

    const handleRequest = async () => {
        const startTime = Date.now();
        const url = `/api/${selectedEndpoint}`;

        try {
            let result;
            switch (requestMethod) {
                case 'GET':
                    result = await api.get(url);
                    break;
                case 'POST':
                    const postData = JSON.parse(requestBody);
                    result = await api.post(url, postData);
                    break;
                case 'PUT':
                    const putData = JSON.parse(requestBody);
                    result = await api.put(url, putData);
                    break;
            }

            // 记录请求历史
            const duration = Date.now() - startTime;
            setRequestHistory(prev => [{
                id: Date.now(),
                method: requestMethod,
                url,
                status: 'success',
                timestamp: new Date().toLocaleTimeString(),
                duration
            }, ...prev].slice(0, 10));

        } catch (error) {
            const duration = Date.now() - startTime;
            setRequestHistory(prev => [{
                id: Date.now(),
                method: requestMethod,
                url,
                status: 'error',
                timestamp: new Date().toLocaleTimeString(),
                duration
            }, ...prev].slice(0, 10));
        }
    };

    const clearHistory = () => {
        setRequestHistory([]);
        api.clearState();
    };

    const selectEndpoint = (endpoint: any) => {
        setSelectedEndpoint(endpoint.value);
        setRequestMethod(endpoint.method);

        // 根据方法设置默认请求体
        if (endpoint.method === 'POST') {
            setRequestBody('{"name": "新用户", "status": "active"}');
        } else if (endpoint.method === 'PUT') {
            setRequestBody('{"name": "更新的用户名", "status": "inactive"}');
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>🌐 API请求封装演示</h4>

            {/* 请求配置 */}
            <div style={{ marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0' }}>请求配置</h5>

                {/* 快速选择端点 */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        快速选择：
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {endpoints.map((endpoint, index) => (
                            <button
                                key={index}
                                onClick={() => selectEndpoint(endpoint)}
                                style={{
                                    padding: '6px 12px',
                                    background: selectedEndpoint === endpoint.value && requestMethod === endpoint.method ? '#1890ff' : '#f5f5f5',
                                    color: selectedEndpoint === endpoint.value && requestMethod === endpoint.method ? 'white' : '#666',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {endpoint.method} {endpoint.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 手动配置 */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px', gap: '12px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                            请求方法
                        </label>
                        <select
                            value={requestMethod}
                            onChange={(e) => setRequestMethod(e.target.value as any)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                            API端点
                        </label>
                        <input
                            type="text"
                            value={selectedEndpoint}
                            onChange={(e) => setSelectedEndpoint(e.target.value)}
                            placeholder="例如: users, posts"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleRequest}
                        disabled={api.loading}
                        style={{
                            padding: '8px 16px',
                            background: api.loading ? '#f5f5f5' : '#1890ff',
                            color: api.loading ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: api.loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {api.loading ? '请求中...' : '发送请求'}
                    </button>
                </div>

                {/* 请求体（POST/PUT时显示） */}
                {(requestMethod === 'POST' || requestMethod === 'PUT') && (
                    <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                            请求体 (JSON)
                        </label>
                        <textarea
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            placeholder='{"key": "value"}'
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* 请求状态显示 */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                }}>
                    <h5 style={{ margin: 0 }}>请求状态</h5>
                    <button
                        onClick={clearHistory}
                        style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            color: '#666',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        清除历史
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        padding: '12px',
                        background: api.loading ? '#fff7e6' : (api.error ? '#fff2f0' : '#f6ffed'),
                        border: `1px solid ${api.loading ? '#ffc53d' : (api.error ? '#ffb3b3' : '#b7eb8f')}`,
                        borderRadius: '6px'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>状态</div>
                        <div style={{ fontWeight: 'bold' }}>
                            {api.loading ? '⏳ 请求中' : (api.error ? '❌ 请求失败' : (api.data ? '✅ 请求成功' : '⭕ 等待请求'))}
                        </div>
                    </div>

                    {api.error && (
                        <div style={{
                            padding: '12px',
                            background: '#fff2f0',
                            border: '1px solid #ffb3b3',
                            borderRadius: '6px'
                        }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>错误信息</div>
                            <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '12px' }}>
                                {api.error}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 响应数据 */}
            {api.data && (
                <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ margin: '0 0 12px 0' }}>响应数据</h5>
                    <div style={{
                        background: '#f5f5f5',
                        padding: '16px',
                        borderRadius: '8px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        <pre style={{
                            margin: 0,
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {JSON.stringify(api.data, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* 请求历史 */}
            <div>
                <h5 style={{ margin: '0 0 12px 0' }}>请求历史</h5>
                <div style={{
                    background: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {requestHistory.length > 0 ? (
                        requestHistory.map((record) => (
                            <div
                                key={record.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 0',
                                    borderBottom: '1px solid #eee',
                                    fontSize: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        background: record.status === 'success' ? '#52c41a' : '#ff4d4f',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '10px'
                                    }}>
                                        {record.method}
                                    </span>
                                    <span>{record.url}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666' }}>
                                    <span>{record.duration}ms</span>
                                    <span>{record.timestamp}</span>
                                    <span>{record.status === 'success' ? '✅' : '❌'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                            暂无请求历史
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                💡 提示：尝试不同的API端点和请求方法，观察loading状态、错误处理和响应数据的变化！
            </div>
        </div>
    );
} 