'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ==================== 类型定义 ====================

export type ValidationRule<T = any> = {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    url?: boolean;
    number?: boolean;
    integer?: boolean;
    custom?: (value: T) => string | null;
};

export type FieldConfig<T = any> = {
    defaultValue?: T;
    validation?: ValidationRule<T>;
    transform?: (value: any) => T;
    format?: (value: T) => string;
    dependencies?: string[];
    debounceMs?: number;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    persistValue?: boolean;
};

export type FormConfig<T extends Record<string, any> = Record<string, any>> = {
    [K in keyof T]?: FieldConfig<T[K]>;
} & {
    $form?: {
        validateOnSubmit?: boolean;
        resetOnSubmit?: boolean;
        persistForm?: boolean;
        autoSave?: boolean;
        autoSaveDelay?: number;
        onSubmit?: (data: T) => Promise<void> | void;
        onValidate?: (data: T, errors: Record<string, string>) => void;
        onAutoSave?: (data: T) => void;
    };
};

export type FieldError = string | null;
export type FormErrors<T> = Partial<Record<keyof T, FieldError>>;

export type FieldState = {
    value: any;
    error: FieldError;
    touched: boolean;
    dirty: boolean;
    focused: boolean;
    validating: boolean;
};

export type FormState<T = Record<string, any>> = {
    values: T;
    errors: FormErrors<T>;
    touched: Partial<Record<keyof T, boolean>>;
    dirty: Partial<Record<keyof T, boolean>>;
    focused: Partial<Record<keyof T, boolean>>;
    validating: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValidating: boolean;
    isValid: boolean;
    isDirty: boolean;
    submitCount: number;
};

export type UseFormEnhancedReturn<T = Record<string, any>> = {
    // 表单状态
    state: FormState<T>;
    values: T;
    errors: FormErrors<T>;

    // 字段方法
    getFieldProps: (name: keyof T) => {
        value: any;
        onChange: (value: any) => void;
        onBlur: () => void;
        onFocus: () => void;
        error: FieldError;
        touched: boolean;
        dirty: boolean;
        name: string;
    };

    getFieldState: (name: keyof T) => FieldState;
    setFieldValue: (name: keyof T, value: any) => void;
    setFieldError: (name: keyof T, error: FieldError) => void;
    setFieldTouched: (name: keyof T, touched?: boolean) => void;
    validateField: (name: keyof T) => Promise<FieldError>;

    // 表单方法
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    reset: (values?: Partial<T>) => void;
    validate: () => Promise<boolean>;
    setValues: (values: Partial<T>) => void;
    setErrors: (errors: FormErrors<T>) => void;

    // 实用方法
    isDirtyField: (name: keyof T) => boolean;
    isTouchedField: (name: keyof T) => boolean;
    isValidField: (name: keyof T) => boolean;
    getFormProps: () => {
        onSubmit: (e: React.FormEvent) => Promise<void>;
        noValidate: boolean;
    };
};

// ==================== 默认验证规则 ====================

const defaultValidators = {
    required: (value: any): string | null => {
        if (value === null || value === undefined || value === '') {
            return 'This field is required';
        }
        return null;
    },

    email: (value: string): string | null => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Please enter a valid email address';
    },

    url: (value: string): string | null => {
        if (!value) return null;
        try {
            new URL(value);
            return null;
        } catch {
            return 'Please enter a valid URL';
        }
    },

    number: (value: any): string | null => {
        if (!value) return null;
        return isNaN(Number(value)) ? 'Please enter a valid number' : null;
    },

    integer: (value: any): string | null => {
        if (!value) return null;
        const num = Number(value);
        return isNaN(num) || !Number.isInteger(num) ? 'Please enter a valid integer' : null;
    },

    min: (value: any, min: number): string | null => {
        if (!value) return null;
        const num = Number(value);
        return isNaN(num) || num < min ? `Value must be at least ${min}` : null;
    },

    max: (value: any, max: number): string | null => {
        if (!value) return null;
        const num = Number(value);
        return isNaN(num) || num > max ? `Value must be at most ${max}` : null;
    },

    minLength: (value: string, minLength: number): string | null => {
        if (!value) return null;
        return value.length < minLength ? `Must be at least ${minLength} characters` : null;
    },

    maxLength: (value: string, maxLength: number): string | null => {
        if (!value) return null;
        return value.length > maxLength ? `Must be at most ${maxLength} characters` : null;
    },

    pattern: (value: string, pattern: RegExp): string | null => {
        if (!value) return null;
        return pattern.test(value) ? null : 'Please enter a valid format';
    },
};

// ==================== 工具函数 ====================

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// 深克隆
const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
    if (typeof obj === 'object') {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
};

// 获取嵌套对象值
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
};

// 设置嵌套对象值
const setNestedValue = (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
        if (!(key in current)) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
};

// 存储管理
const storage = {
    get: (key: string): any => {
        if (typeof window === 'undefined') return null;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },

    set: (key: string, value: any): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save form data to localStorage:', error);
        }
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove form data from localStorage:', error);
        }
    },
};

// ==================== Hook实现 ====================

export const useFormEnhanced = <T extends Record<string, any> = Record<string, any>>(
    config: FormConfig<T> = {} as FormConfig<T>,
    formId?: string
): UseFormEnhancedReturn<T> => {
    const { $form: formConfig, ...fieldConfigs } = config;

    // 初始化状态
    const getInitialValues = useCallback((): T => {
        const initialValues = {} as T;

        // 从配置中获取默认值
        Object.keys(fieldConfigs).forEach(key => {
            const fieldConfig = fieldConfigs[key as keyof T];
            if (fieldConfig?.defaultValue !== undefined) {
                initialValues[key as keyof T] = fieldConfig.defaultValue;
            }
        });

        // 如果启用持久化，尝试从存储中恢复
        if (formConfig?.persistForm && formId) {
            const storedValues = storage.get(`form_${formId}`);
            if (storedValues) {
                return { ...initialValues, ...storedValues };
            }
        }

        return initialValues;
    }, [fieldConfigs, formConfig?.persistForm, formId]);

    // 状态管理
    const [state, setState] = useState<FormState<T>>(() => {
        const initialValues = getInitialValues();
        return {
            values: initialValues,
            errors: {} as FormErrors<T>,
            touched: {},
            dirty: {},
            focused: {},
            validating: {},
            isSubmitting: false,
            isValidating: false,
            isValid: true,
            isDirty: false,
            submitCount: 0,
        };
    });

    // 引用管理
    const validationTimeoutsRef = useRef<Map<keyof T, NodeJS.Timeout>>(new Map());
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initialValuesRef = useRef<T>(getInitialValues());

    // ==================== 验证逻辑 ====================

    const validateFieldValue = useCallback(async (name: keyof T, value: any): Promise<FieldError> => {
        const fieldConfig = fieldConfigs[name];
        if (!fieldConfig?.validation) return null;

        const validation = fieldConfig.validation;

        // 基础验证
        if (validation.required) {
            const error = defaultValidators.required(value);
            if (error) return error;
        }

        // 跳过其他验证如果值为空且不是必需的
        if (!validation.required && (value === null || value === undefined || value === '')) {
            return null;
        }

        // 邮箱验证
        if (validation.email) {
            const error = defaultValidators.email(value);
            if (error) return error;
        }

        // URL验证
        if (validation.url) {
            const error = defaultValidators.url(value);
            if (error) return error;
        }

        // 数字验证
        if (validation.number) {
            const error = defaultValidators.number(value);
            if (error) return error;
        }

        // 整数验证
        if (validation.integer) {
            const error = defaultValidators.integer(value);
            if (error) return error;
        }

        // 最小值验证
        if (validation.min !== undefined) {
            const error = defaultValidators.min(value, validation.min);
            if (error) return error;
        }

        // 最大值验证
        if (validation.max !== undefined) {
            const error = defaultValidators.max(value, validation.max);
            if (error) return error;
        }

        // 最小长度验证
        if (validation.minLength !== undefined) {
            const error = defaultValidators.minLength(value, validation.minLength);
            if (error) return error;
        }

        // 最大长度验证
        if (validation.maxLength !== undefined) {
            const error = defaultValidators.maxLength(value, validation.maxLength);
            if (error) return error;
        }

        // 正则验证
        if (validation.pattern) {
            const error = defaultValidators.pattern(value, validation.pattern);
            if (error) return error;
        }

        // 自定义验证
        if (validation.custom) {
            const error = validation.custom(value);
            if (error) return error;
        }

        return null;
    }, [fieldConfigs]);

    const validateField = useCallback(async (name: keyof T): Promise<FieldError> => {
        setState(prev => ({
            ...prev,
            validating: { ...prev.validating, [name]: true }
        }));

        try {
            const value = state.values[name];
            const error = await validateFieldValue(name, value);

            setState(prev => ({
                ...prev,
                errors: { ...prev.errors, [name]: error },
                validating: { ...prev.validating, [name]: false },
            }));

            return error;
        } catch (error) {
            setState(prev => ({
                ...prev,
                validating: { ...prev.validating, [name]: false }
            }));
            return 'Validation failed';
        }
    }, [state.values, validateFieldValue]);

    const validate = useCallback(async (): Promise<boolean> => {
        setState(prev => ({ ...prev, isValidating: true }));

        const fieldNames = Object.keys(fieldConfigs) as (keyof T)[];
        const validationPromises = fieldNames.map(name => validateFieldValue(name, state.values[name]));

        try {
            const errors = await Promise.all(validationPromises);
            const errorMap = {} as FormErrors<T>;
            let hasErrors = false;

            fieldNames.forEach((name, index) => {
                errorMap[name] = errors[index];
                if (errors[index]) hasErrors = true;
            });

            setState(prev => ({
                ...prev,
                errors: errorMap,
                isValid: !hasErrors,
                isValidating: false,
            }));

            if (formConfig?.onValidate) {
                formConfig.onValidate(state.values, errorMap);
            }

            return !hasErrors;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isValidating: false,
                isValid: false,
            }));
            return false;
        }
    }, [fieldConfigs, state.values, validateFieldValue, formConfig]);

    // ==================== 字段操作 ====================

    const setFieldValue = useCallback((name: keyof T, value: any) => {
        const fieldConfig = fieldConfigs[name];

        // 应用转换函数
        const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value;

        setState(prev => {
            const newValues = { ...prev.values, [name]: transformedValue };
            const isDirty = transformedValue !== initialValuesRef.current[name];

            return {
                ...prev,
                values: newValues,
                dirty: { ...prev.dirty, [name]: isDirty },
                isDirty: Object.keys(newValues).some(key =>
                    newValues[key as keyof T] !== initialValuesRef.current[key as keyof T]
                ),
            };
        });

        // 验证字段（如果启用）
        if (fieldConfig?.validateOnChange) {
            const existingTimeout = validationTimeoutsRef.current.get(name);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            const debounceMs = fieldConfig.debounceMs || 300;
            const timeout = setTimeout(() => {
                validateField(name);
                validationTimeoutsRef.current.delete(name);
            }, debounceMs);

            validationTimeoutsRef.current.set(name, timeout);
        }

        // 自动保存
        if (formConfig?.autoSave && formId) {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            autoSaveTimeoutRef.current = setTimeout(() => {
                const currentValues = { ...state.values, [name]: transformedValue };
                storage.set(`form_${formId}`, currentValues);
                formConfig.onAutoSave?.(currentValues);
            }, formConfig.autoSaveDelay || 1000);
        }
    }, [fieldConfigs, formConfig, formId, state.values, validateField]);

    const setFieldError = useCallback((name: keyof T, error: FieldError) => {
        setState(prev => ({
            ...prev,
            errors: { ...prev.errors, [name]: error },
        }));
    }, []);

    const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
        setState(prev => ({
            ...prev,
            touched: { ...prev.touched, [name]: touched },
        }));
    }, []);

    // ==================== 表单操作 ====================

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();

        setState(prev => ({
            ...prev,
            isSubmitting: true,
            submitCount: prev.submitCount + 1
        }));

        try {
            // 验证表单
            if (formConfig?.validateOnSubmit !== false) {
                const isValid = await validate();
                if (!isValid) {
                    setState(prev => ({ ...prev, isSubmitting: false }));
                    return;
                }
            }

            // 调用提交处理器
            if (formConfig?.onSubmit) {
                await formConfig.onSubmit(state.values);
            }

            // 重置表单（如果启用）
            if (formConfig?.resetOnSubmit) {
                reset();
            }

            setState(prev => ({ ...prev, isSubmitting: false }));
        } catch (error) {
            console.error('Form submission failed:', error);
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    }, [formConfig, validate, state.values]);

    const reset = useCallback((values?: Partial<T>) => {
        const newValues = values ? { ...initialValuesRef.current, ...values } : initialValuesRef.current;

        setState({
            values: newValues,
            errors: {} as FormErrors<T>,
            touched: {},
            dirty: {},
            focused: {},
            validating: {},
            isSubmitting: false,
            isValidating: false,
            isValid: true,
            isDirty: false,
            submitCount: 0,
        });

        // 清除持久化数据
        if (formConfig?.persistForm && formId) {
            storage.remove(`form_${formId}`);
        }
    }, [formConfig?.persistForm, formId]);

    const setValues = useCallback((values: Partial<T>) => {
        setState(prev => ({
            ...prev,
            values: { ...prev.values, ...values },
        }));
    }, []);

    const setErrors = useCallback((errors: FormErrors<T>) => {
        setState(prev => ({
            ...prev,
            errors: { ...prev.errors, ...errors },
        }));
    }, []);

    // ==================== 实用方法 ====================

    const getFieldProps = useCallback((name: keyof T) => ({
        value: state.values[name],
        onChange: (value: any) => setFieldValue(name, value),
        onBlur: () => {
            setFieldTouched(name, true);
            const fieldConfig = fieldConfigs[name];
            if (fieldConfig?.validateOnBlur) {
                validateField(name);
            }
        },
        onFocus: () => {
            setState(prev => ({
                ...prev,
                focused: { ...prev.focused, [name]: true },
            }));
        },
        error: state.errors[name] || null,
        touched: state.touched[name] || false,
        dirty: state.dirty[name] || false,
        name: String(name),
    }), [state, setFieldValue, setFieldTouched, validateField, fieldConfigs]);

    const getFieldState = useCallback((name: keyof T): FieldState => ({
        value: state.values[name],
        error: state.errors[name] || null,
        touched: state.touched[name] || false,
        dirty: state.dirty[name] || false,
        focused: state.focused[name] || false,
        validating: state.validating[name] || false,
    }), [state]);

    const isDirtyField = useCallback((name: keyof T): boolean => {
        return state.dirty[name] || false;
    }, [state.dirty]);

    const isTouchedField = useCallback((name: keyof T): boolean => {
        return state.touched[name] || false;
    }, [state.touched]);

    const isValidField = useCallback((name: keyof T): boolean => {
        return !state.errors[name];
    }, [state.errors]);

    const getFormProps = useCallback(() => ({
        onSubmit: handleSubmit,
        noValidate: true,
    }), [handleSubmit]);

    // ==================== 清理 ====================

    useEffect(() => {
        return () => {
            // 清理验证定时器
            validationTimeoutsRef.current.forEach(timeout => {
                clearTimeout(timeout);
            });
            validationTimeoutsRef.current.clear();

            // 清理自动保存定时器
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    // ==================== 返回值 ====================

    return {
        // 表单状态
        state,
        values: state.values,
        errors: state.errors,

        // 字段方法
        getFieldProps,
        getFieldState,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        validateField,

        // 表单方法
        handleSubmit,
        reset,
        validate,
        setValues,
        setErrors,

        // 实用方法
        isDirtyField,
        isTouchedField,
        isValidField,
        getFormProps,
    };
};

// ==================== 工具函数导出 ====================

export { debounce, deepClone, defaultValidators, getNestedValue, setNestedValue };

// ==================== 类型导出 ====================

export type { FieldConfig, FieldError, FieldState, FormConfig, FormErrors, FormState, ValidationRule };

