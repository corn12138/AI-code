'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionConfig {
    continuous?: boolean;
    interimResults?: boolean;
    maxAlternatives?: number;
    lang?: string;
    grammars?: SpeechGrammarList;
    serviceURI?: string;
}

interface UseSpeechRecognitionReturn {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    isListening: boolean;
    isSupported: boolean;
    startListening: (config?: SpeechRecognitionConfig) => void;
    stopListening: () => void;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    confidence: number;
    error: string | null;
    lang: string;
    setLang: (language: string) => void;
}

// 声明 SpeechRecognition 接口
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const useSpeechRecognition = (
    initialConfig: SpeechRecognitionConfig = {}
): UseSpeechRecognitionReturn => {
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [lang, setLang] = useState(initialConfig.lang || 'en-US');

    const recognitionRef = useRef<any>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 检查浏览器支持
    const browserSupportsSpeechRecognition =
        typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const isSupported = browserSupportsSpeechRecognition;

    // 清理定时器
    const clearTimeouts = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
    }, []);

    // 初始化语音识别
    const initializeRecognition = useCallback((config: SpeechRecognitionConfig = {}) => {
        if (!browserSupportsSpeechRecognition) {
            setError('Speech recognition is not supported in this browser');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // 配置识别器
        recognition.continuous = config.continuous ?? true;
        recognition.interimResults = config.interimResults ?? true;
        recognition.maxAlternatives = config.maxAlternatives ?? 1;
        recognition.lang = config.lang || lang;

        if (config.grammars) {
            recognition.grammars = config.grammars;
        }

        if (config.serviceURI) {
            recognition.serviceURI = config.serviceURI;
        }

        return recognition;
    }, [browserSupportsSpeechRecognition, lang]);

    // 开始监听
    const startListening = useCallback((config: SpeechRecognitionConfig = {}) => {
        if (!browserSupportsSpeechRecognition) {
            setError('Speech recognition not supported');
            return;
        }

        if (isListening) {
            return; // 已经在监听
        }

        setError(null);
        clearTimeouts();

        const recognition = initializeRecognition({ ...initialConfig, ...config });
        if (!recognition) return;

        recognitionRef.current = recognition;

        // 事件处理器
        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            console.log('Speech recognition started');
        };

        recognition.onresult = (event: any) => {
            let interimTranscriptValue = '';
            let finalTranscriptValue = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;

                if (event.results[i].isFinal) {
                    finalTranscriptValue += transcript;
                    setConfidence(confidence);
                } else {
                    interimTranscriptValue += transcript;
                }
            }

            setInterimTranscript(interimTranscriptValue);
            setFinalTranscript(prev => prev + finalTranscriptValue);
            setTranscript(prev => prev + finalTranscriptValue + interimTranscriptValue);

            // 重置静音定时器
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            // 如果没有持续输入，10秒后自动停止
            silenceTimeoutRef.current = setTimeout(() => {
                if (isListening) {
                    stopListening();
                }
            }, 10000);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);

            let errorMessage = 'Speech recognition error';
            switch (event.error) {
                case 'network':
                    errorMessage = 'Network error during speech recognition';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone access denied';
                    break;
                case 'no-speech':
                    errorMessage = 'No speech detected';
                    break;
                case 'audio-capture':
                    errorMessage = 'Audio capture failed';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Speech recognition service not allowed';
                    break;
                default:
                    errorMessage = `Speech recognition error: ${event.error}`;
            }

            setError(errorMessage);
            setIsListening(false);
            clearTimeouts();
        };

        recognition.onend = () => {
            setIsListening(false);
            clearTimeouts();
            console.log('Speech recognition ended');

            // 如果是连续模式且没有错误，自动重启
            if (config.continuous && !error) {
                // 短暂延迟后重启，避免过于频繁
                timeoutRef.current = setTimeout(() => {
                    if (recognitionRef.current && isListening) {
                        recognition.start();
                    }
                }, 100);
            }
        };

        recognition.onnomatch = () => {
            console.log('No speech was recognized');
            setError('No speech was recognized');
        };

        recognition.onsoundstart = () => {
            console.log('Sound detected');
        };

        recognition.onsoundend = () => {
            console.log('Sound ended');
        };

        recognition.onspeechstart = () => {
            console.log('Speech detected');
            setError(null);
        };

        recognition.onspeechend = () => {
            console.log('Speech ended');
        };

        // 开始识别
        try {
            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setError('Failed to start speech recognition');
            setIsListening(false);
        }
    }, [
        browserSupportsSpeechRecognition,
        isListening,
        initialConfig,
        initializeRecognition,
        error,
        clearTimeouts
    ]);

    // 停止监听
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        setIsListening(false);
        setInterimTranscript('');
        clearTimeouts();
    }, [clearTimeouts]);

    // 重置转录
    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setFinalTranscript('');
        setConfidence(0);
        setError(null);
    }, []);

    // 语言设置更新时重启识别（如果正在监听）
    useEffect(() => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.lang = lang;
        }
    }, [lang, isListening]);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            clearTimeouts();
        };
    }, [clearTimeouts]);

    // 页面可见性变化处理
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isListening) {
                // 页面隐藏时停止监听以节省资源
                stopListening();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isListening, stopListening]);

    // 权限检查
    const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
        if (!navigator.permissions) {
            return true; // 假设有权限如果无法检查
        }

        try {
            const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            return result.state === 'granted';
        } catch {
            return true; // 假设有权限如果检查失败
        }
    }, []);

    // 请求麦克风权限
    const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // 立即停止流
            return true;
        } catch {
            return false;
        }
    }, []);

    // 获取支持的语言列表
    const getSupportedLanguages = useCallback((): string[] => {
        // 常见的语音识别支持语言
        return [
            'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
            'zh-CN', 'zh-TW', 'zh-HK',
            'ja-JP',
            'ko-KR',
            'fr-FR', 'fr-CA',
            'de-DE',
            'es-ES', 'es-MX',
            'it-IT',
            'pt-BR', 'pt-PT',
            'ru-RU',
            'ar-SA',
            'hi-IN',
            'th-TH',
            'vi-VN'
        ];
    }, []);

    // 语言自动检测
    const detectLanguage = useCallback(async (text: string): Promise<string> => {
        // 简单的语言检测逻辑（实际应用中可能需要更复杂的实现）
        const chineseRegex = /[\u4e00-\u9fff]/;
        const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
        const koreanRegex = /[\uac00-\ud7af]/;
        const arabicRegex = /[\u0600-\u06ff]/;

        if (chineseRegex.test(text)) return 'zh-CN';
        if (japaneseRegex.test(text)) return 'ja-JP';
        if (koreanRegex.test(text)) return 'ko-KR';
        if (arabicRegex.test(text)) return 'ar-SA';

        return 'en-US'; // 默认英语
    }, []);

    return {
        transcript,
        interimTranscript,
        finalTranscript,
        isListening,
        isSupported,
        startListening,
        stopListening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        confidence,
        error,
        lang,
        setLang
    };
};
