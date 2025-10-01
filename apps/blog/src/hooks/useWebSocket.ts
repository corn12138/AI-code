'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
    type: string;
    content?: string;
    metadata?: any;
    error?: string;
}

interface UseWebSocketReturn {
    sendMessage: (event: string, data: any) => Promise<void>;
    isConnected: boolean;
    lastMessage: WebSocketMessage | null;
    connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
    connect: () => void;
    disconnect: () => void;
    resetLastMessage: () => void;
}

interface WebSocketConfig {
    url?: string;
    autoConnect?: boolean;
    reconnectAttempts?: number;
    reconnectDelay?: number;
    enableHeartbeat?: boolean;
    heartbeatInterval?: number;
}

export const useWebSocket = (config: WebSocketConfig = {}): UseWebSocketReturn => {
    const {
        url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
        autoConnect = true,
        reconnectAttempts = 5,
        reconnectDelay = 1000,
        enableHeartbeat = true,
        heartbeatInterval = 30000
    } = config;

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

    const socketRef = useRef<Socket | null>(null);
    const reconnectCountRef = useRef(0);
    const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 清理定时器
    const clearTimers = useCallback(() => {
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }, []);

    // 开始心跳
    const startHeartbeat = useCallback(() => {
        if (!enableHeartbeat || heartbeatTimerRef.current) return;

        heartbeatTimerRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('ping', { timestamp: Date.now() });
            }
        }, heartbeatInterval);
    }, [enableHeartbeat, heartbeatInterval]);

    // 重连逻辑
    const attemptReconnect = useCallback(() => {
        if (reconnectCountRef.current >= reconnectAttempts) {
            console.error('Max reconnection attempts reached');
            setConnectionState('error');
            return;
        }

        const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current);
        console.log(`Attempting to reconnect in ${delay}ms... (${reconnectCountRef.current + 1}/${reconnectAttempts})`);

        reconnectTimerRef.current = setTimeout(() => {
            reconnectCountRef.current++;
            connect();
        }, delay);
    }, [reconnectAttempts, reconnectDelay]);

    // 连接WebSocket
    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        setConnectionState('connecting');
        clearTimers();

        const socket = io(url, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            timeout: 20000,
            forceNew: true
        });

        socket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setConnectionState('connected');
            reconnectCountRef.current = 0;
            startHeartbeat();
        });

        socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            setIsConnected(false);
            setConnectionState('disconnected');
            clearTimers();

            // 只在非主动断开时重连
            if (reason !== 'io client disconnect') {
                attemptReconnect();
            }
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setIsConnected(false);
            setConnectionState('error');
            clearTimers();
            attemptReconnect();
        });

        // 监听所有消息
        socket.onAny((event, data) => {
            setLastMessage({
                type: event,
                content: data?.content,
                metadata: data?.metadata,
                error: data?.error
            });
        });

        // 心跳响应
        socket.on('pong', (data) => {
            const latency = Date.now() - data.timestamp;
            console.log(`WebSocket latency: ${latency}ms`);
        });

        // 错误处理
        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            setLastMessage({
                type: 'error',
                error: error.message || 'Unknown error'
            });
        });

        socketRef.current = socket;
    }, [url, startHeartbeat, attemptReconnect, clearTimers]);

    // 断开连接
    const disconnect = useCallback(() => {
        clearTimers();

        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setIsConnected(false);
        setConnectionState('disconnected');
        reconnectCountRef.current = 0;
    }, [clearTimers]);

    // 发送消息
    const sendMessage = useCallback(async (event: string, data: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current?.connected) {
                reject(new Error('WebSocket not connected'));
                return;
            }

            const timeout = setTimeout(() => {
                reject(new Error('Message timeout'));
            }, 30000);

            socketRef.current.emit(event, data, (response: any) => {
                clearTimeout(timeout);

                if (response?.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            });
        });
    }, []);

    // 重置最后消息
    const resetLastMessage = useCallback(() => {
        setLastMessage(null);
    }, []);

    // 自动连接
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    // 页面可见性变化处理
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearTimers();
            } else if (socketRef.current?.connected) {
                startHeartbeat();
            } else if (autoConnect) {
                connect();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [autoConnect, connect, startHeartbeat, clearTimers]);

    // 网络状态变化处理
    useEffect(() => {
        const handleOnline = () => {
            if (autoConnect && !socketRef.current?.connected) {
                console.log('Network back online, attempting to reconnect...');
                connect();
            }
        };

        const handleOffline = () => {
            console.log('Network offline');
            setConnectionState('disconnected');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [autoConnect, connect]);

    return {
        sendMessage,
        isConnected,
        lastMessage,
        connectionState,
        connect,
        disconnect,
        resetLastMessage
    };
};
