import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 表单验证函数类型
 */
export type ValidateFunction<T> = (values: T) => Partial<Record<keyof T, string>>;

/**
 * 表单字段验证函数类型
 */
export type FieldValidateFunction<T> = (value: any, values: T) => string | undefined;

/**
 * 表单配置选项
 */
export interface UseFormOptions<T> {
    /** 表单初始值 */
    initialValues: T;
    /** 表单验证函数 */
    validate?: ValidateFunction<T>;
    /** 字段级验证函数映射 */
    fieldValidators?: Partial<Record<keyof T, FieldValidateFunction<T>>>;
    /** 表单提交处理函数 */
    onSubmit?: (values: T) => void | Promise<void>;
    /** 验证模式：'onChange' | 'onBlur' | 'onSubmit' */
    validateMode?: 'onChange' | 'onBlur' | 'onSubmit';
    /** 是否在提交失败时重新验证 */
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
    /** 是否自动聚焦到第一个错误字段 */
    focusFirstError?: boolean;
}

/**
 * useForm Hook 返回值
 */
export interface UseFormReturn<T> {
    /** 表单当前值 */
    values: T;
    /** 表单验证错误 */
    errors: Partial<Record<keyof T, string>>;
    /** 字段是否被触摸过 */
    touched: Partial<Record<keyof T, boolean>>;
    /** 是否正在提交 */
    isSubmitting: boolean;
    /** 表单是否有效（无验证错误） */
    isValid: boolean;
    /** 表单是否已修改 */
    isDirty: boolean;
    /** 是否验证过 */
    isValidated: boolean;
    /** 设置单个字段值 */
    setFieldValue: (name: keyof T, value: any) => void;
    /** 批量设置字段值 */
    setValues: (values: Partial<T>) => void;
    /** 设置字段错误 */
    setFieldError: (name: keyof T, error: string) => void;
    /** 批量设置错误 */
    setErrors: (errors: Partial<Record<keyof T, string>>) => void;
    /** 清除所有错误 */
    clearErrors: () => void;
    /** 设置字段触摸状态 */
    setFieldTouched: (name: keyof T, touched?: boolean) => void;
    /** 处理输入框变化事件 */
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    /** 处理输入框失焦事件 */
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    /** 处理表单提交 */
    handleSubmit: (e?: React.FormEvent) => void;
    /** 验证单个字段 */
    validateField: (name: keyof T) => Promise<string | undefined>;
    /** 验证整个表单 */
    validateForm: () => Promise<Partial<Record<keyof T, string>>>;
    /** 重置表单 */
    reset: () => void;
    /** 获取字段属性（用于绑定到输入组件） */
    getFieldProps: (name: keyof T) => {
        name: string;
        value: any;
        onChange: (e: React.ChangeEvent<any>) => void;
        onBlur: (e: React.FocusEvent<any>) => void;
        error?: string;
        touched?: boolean;
    };
}

/**
 * 表单状态管理Hook
 * 提供完整的表单状态管理、验证和提交处理
 * 
 * @param options 表单配置选项
 * @returns Hook返回值对象
 * 
 * @example
 * ```tsx
 * interface LoginForm {
 *   email: string;
 *   password: string;
 * }
 * 
 * function LoginComponent() {
 *   const form = useForm<LoginForm>({
 *     initialValues: { email: '', password: '' },
 *     validate: (values) => {
 *       const errors: Partial<Record<keyof LoginForm, string>> = {};
 *       if (!values.email) {
 *         errors.email = '邮箱不能为空';
 *       } else if (!/\S+@\S+\.\S+/.test(values.email)) {
 *         errors.email = '邮箱格式不正确';
 *       }
 *       if (!values.password) {
 *         errors.password = '密码不能为空';
 *       } else if (values.password.length < 6) {
 *         errors.password = '密码长度至少6位';
 *       }
 *       return errors;
 *     },
 *     onSubmit: async (values) => {
 *       await login(values);
 *     }
 *   });
 * 
 *   return (
 *     <form onSubmit={form.handleSubmit}>
 *       <input {...form.getFieldProps('email')} placeholder="邮箱" />
 *       {form.touched.email && form.errors.email && (
 *         <div className="error">{form.errors.email}</div>
 *       )}
 *       
 *       <input {...form.getFieldProps('password')} type="password" placeholder="密码" />
 *       {form.touched.password && form.errors.password && (
 *         <div className="error">{form.errors.password}</div>
 *       )}
 *       
 *       <button type="submit" disabled={form.isSubmitting || !form.isValid}>
 *         {form.isSubmitting ? '登录中...' : '登录'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<T extends Record<string, any>>(
    options: UseFormOptions<T>
): UseFormReturn<T> {
    // 参数校验
    if (!options.initialValues || typeof options.initialValues !== 'object') {
        throw new Error('useForm: initialValues is required and must be an object');
    }

    const {
        initialValues,
        validate,
        fieldValidators,
        onSubmit,
        validateMode = 'onSubmit',
        reValidateMode = 'onChange',
        focusFirstError = true,
    } = options;

    // 状态管理
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidated, setIsValidated] = useState(false);

    // 引用管理
    const initialValuesRef = useRef(initialValues);
    const formRef = useRef<HTMLFormElement>(null);

    // 计算派生状态
    const isDirty = Object.keys(values).some(
        key => values[key] !== initialValuesRef.current[key]
    );
    const isValid = Object.keys(errors).length === 0;

    // 验证单个字段
    const validateField = useCallback(async (name: keyof T): Promise<string | undefined> => {
        let error: string | undefined;

        // 字段级验证
        const fieldValidator = fieldValidators?.[name];
        if (fieldValidator) {
            error = fieldValidator(values[name], values);
        }

        // 表单级验证
        if (!error && validate) {
            const formErrors = validate(values);
            error = formErrors[name];
        }

        return error;
    }, [values, validate, fieldValidators]);

    // 验证整个表单
    const validateForm = useCallback(async (): Promise<Partial<Record<keyof T, string>>> => {
        const newErrors: Partial<Record<keyof T, string>> = {};

        // 表单级验证
        if (validate) {
            const formErrors = validate(values);
            Object.assign(newErrors, formErrors);
        }

        // 字段级验证
        if (fieldValidators) {
            for (const [fieldName, validator] of Object.entries(fieldValidators)) {
                if (validator) {
                    const fieldError = validator(values[fieldName as keyof T], values);
                    if (fieldError) {
                        newErrors[fieldName as keyof T] = fieldError;
                    }
                }
            }
        }

        return newErrors;
    }, [values, validate, fieldValidators]);

    // 设置字段值
    const setFieldValue = useCallback((name: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // 根据验证模式决定是否立即验证
        if (isValidated && (validateMode === 'onChange' || reValidateMode === 'onChange')) {
            validateField(name).then(error => {
                setErrors(prev => ({ ...prev, [name]: error }));
            });
        }
    }, [validateField, validateMode, reValidateMode, isValidated]);

    // 批量设置值
    const setFormValues = useCallback((newValues: Partial<T>) => {
        setValues(prev => ({ ...prev, ...newValues }));
    }, []);

    // 设置字段错误
    const setFieldError = useCallback((name: keyof T, error: string) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    // 批量设置错误
    const setFormErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
        setErrors(newErrors);
    }, []);

    // 清除错误
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    // 设置字段触摸状态
    const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    // 处理输入变化
    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFieldValue(name as keyof T, finalValue);
    }, [setFieldValue]);

    // 处理失焦
    const handleBlur = useCallback((
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name } = e.target;
        setFieldTouched(name as keyof T, true);

        // 根据验证模式决定是否验证
        if (validateMode === 'onBlur' || (isValidated && reValidateMode === 'onBlur')) {
            validateField(name as keyof T).then(error => {
                setErrors(prev => ({ ...prev, [name]: error }));
            });
        }
    }, [setFieldTouched, validateField, validateMode, reValidateMode, isValidated]);

    // 聚焦到第一个错误字段
    const focusFirstErrorField = useCallback(() => {
        if (!focusFirstError || !formRef.current) return;

        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
            const element = formRef.current.querySelector(
                `[name="${firstErrorField}"]`
            ) as HTMLElement;
            element?.focus();
        }
    }, [errors, focusFirstError]);

    // 处理表单提交
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsValidated(true);

        // 验证表单
        const formErrors = await validateForm();
        setErrors(formErrors);

        // 标记所有字段为已触摸
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key as keyof T] = true;
            return acc;
        }, {} as Record<keyof T, boolean>);
        setTouched(allTouched);

        if (Object.keys(formErrors).length === 0) {
            if (onSubmit) {
                setIsSubmitting(true);
                try {
                    await onSubmit(values);
                } catch (error) {
                    console.error('Form submission error:', error);
                } finally {
                    setIsSubmitting(false);
                }
            }
        } else {
            // 聚焦到第一个错误字段
            setTimeout(focusFirstErrorField, 0);
        }
    }, [values, validateForm, onSubmit, focusFirstErrorField]);

    // 重置表单
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
        setIsValidated(false);
    }, [initialValues]);

    // 获取字段属性
    const getFieldProps = useCallback((name: keyof T) => {
        return {
            name: String(name),
            value: values[name] ?? '',
            onChange: handleChange,
            onBlur: handleBlur,
            error: errors[name],
            touched: touched[name],
        };
    }, [values, handleChange, handleBlur, errors, touched]);

    // 当初始值改变时重置表单
    useEffect(() => {
        if (initialValues !== initialValuesRef.current) {
            initialValuesRef.current = initialValues;
            setValues(initialValues);
        }
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        isDirty,
        isValidated,
        setFieldValue,
        setValues: setFormValues,
        setFieldError,
        setErrors: setFormErrors,
        clearErrors,
        setFieldTouched,
        handleChange,
        handleBlur,
        handleSubmit,
        validateField,
        validateForm,
        reset,
        getFieldProps,
    };
} 