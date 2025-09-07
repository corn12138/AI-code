/**
 * 表单验证Hook
 * 提供统一的表单验证逻辑，支持实时验证和提交验证
 */

import { useCallback, useRef, useState } from 'react'

export interface ValidationRule {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => boolean | string
    message?: string
}

export interface ValidationRules {
    [fieldName: string]: ValidationRule | ValidationRule[]
}

export interface ValidationError {
    field: string
    message: string
    rule: string
}

export interface UseFormValidationOptions {
    validateOnChange?: boolean // 是否在值变化时验证
    validateOnBlur?: boolean // 是否在失焦时验证
    showFirstErrorOnly?: boolean // 是否只显示第一个错误
}

/**
 * 表单验证Hook
 * 
 * 使用场景：
 * - ProcessPanel: 流程处理表单验证
 * - TaskInfo: 任务信息表单验证
 * - 其他表单组件的统一验证
 */
export const useFormValidation = (
    rules: ValidationRules,
    options: UseFormValidationOptions = {}
) => {
    const {
        validateOnChange = true,
        validateOnBlur = true,
        showFirstErrorOnly = false
    } = options

    const [errors, setErrors] = useState<ValidationError[]>([])
    const [touched, setTouched] = useState<Set<string>>(new Set())
    const validationTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

    // 获取字段的验证规则
    const getFieldRules = useCallback((fieldName: string): ValidationRule[] => {
        const fieldRules = rules[fieldName]
        if (!fieldRules) return []
        return Array.isArray(fieldRules) ? fieldRules : [fieldRules]
    }, [rules])

    // 验证单个字段
    const validateField = useCallback((
        fieldName: string,
        value: any,
        allValues?: Record<string, any>
    ): ValidationError[] => {
        const fieldRules = getFieldRules(fieldName)
        const fieldErrors: ValidationError[] = []

        for (const rule of fieldRules) {
            let isValid = true
            let errorMessage = rule.message || '验证失败'

            // 必填验证
            if (rule.required && (value === undefined || value === null || value === '')) {
                isValid = false
                errorMessage = rule.message || '此字段为必填项'
            }
            // 最小长度验证
            else if (rule.minLength && value && value.toString().length < rule.minLength) {
                isValid = false
                errorMessage = rule.message || `最少需要${rule.minLength}个字符`
            }
            // 最大长度验证
            else if (rule.maxLength && value && value.toString().length > rule.maxLength) {
                isValid = false
                errorMessage = rule.message || `最多允许${rule.maxLength}个字符`
            }
            // 正则验证
            else if (rule.pattern && value && !rule.pattern.test(value.toString())) {
                isValid = false
                errorMessage = rule.message || '格式不正确'
            }
            // 自定义验证
            else if (rule.custom && value !== undefined && value !== null) {
                const customResult = rule.custom(value)
                if (typeof customResult === 'boolean') {
                    isValid = customResult
                } else if (typeof customResult === 'string') {
                    isValid = false
                    errorMessage = customResult
                }
            }

            if (!isValid) {
                fieldErrors.push({
                    field: fieldName,
                    message: errorMessage,
                    rule: Object.keys(rule)[0] || 'custom'
                })

                if (showFirstErrorOnly) {
                    break
                }
            }
        }

        return fieldErrors
    }, [getFieldRules, showFirstErrorOnly])

    // 验证所有字段
    const validateAll = useCallback((values: Record<string, any>): ValidationError[] => {
        const allErrors: ValidationError[] = []

        Object.keys(rules).forEach(fieldName => {
            const fieldErrors = validateField(fieldName, values[fieldName], values)
            allErrors.push(...fieldErrors)
        })

        setErrors(allErrors)
        return allErrors
    }, [rules, validateField])

    // 验证特定字段（带防抖）
    const validateFieldWithDebounce = useCallback((
        fieldName: string,
        value: any,
        delay: number = 300
    ) => {
        // 清除之前的定时器
        const existingTimer = validationTimersRef.current.get(fieldName)
        if (existingTimer) {
            clearTimeout(existingTimer)
        }

        // 设置新的定时器
        const timer = setTimeout(() => {
            const fieldErrors = validateField(fieldName, value)

            setErrors(prevErrors => {
                // 移除该字段之前的错误
                const otherErrors = prevErrors.filter(error => error.field !== fieldName)
                // 添加新的错误
                return [...otherErrors, ...fieldErrors]
            })

            validationTimersRef.current.delete(fieldName)
        }, delay)

        validationTimersRef.current.set(fieldName, timer)
    }, [validateField])

    // 处理字段值变化
    const handleFieldChange = useCallback((fieldName: string, value: any) => {
        if (validateOnChange) {
            validateFieldWithDebounce(fieldName, value)
        }
    }, [validateOnChange, validateFieldWithDebounce])

    // 处理字段失焦
    const handleFieldBlur = useCallback((fieldName: string, value: any) => {
        setTouched(prev => new Set(prev).add(fieldName))

        if (validateOnBlur) {
            const fieldErrors = validateField(fieldName, value)

            setErrors(prevErrors => {
                const otherErrors = prevErrors.filter(error => error.field !== fieldName)
                return [...otherErrors, ...fieldErrors]
            })
        }
    }, [validateOnBlur, validateField])

    // 清除字段错误
    const clearFieldError = useCallback((fieldName: string) => {
        setErrors(prevErrors => prevErrors.filter(error => error.field !== fieldName))
    }, [])

    // 清除所有错误
    const clearAllErrors = useCallback(() => {
        setErrors([])
        setTouched(new Set())
    }, [])

    // 获取字段错误
    const getFieldError = useCallback((fieldName: string): ValidationError | null => {
        const fieldErrors = errors.filter(error => error.field === fieldName)
        return fieldErrors.length > 0 ? fieldErrors[0] : null
    }, [errors])

    // 获取字段错误消息
    const getFieldErrorMessage = useCallback((fieldName: string): string | null => {
        const error = getFieldError(fieldName)
        return error ? error.message : null
    }, [getFieldError])

    // 检查字段是否有错误
    const hasFieldError = useCallback((fieldName: string): boolean => {
        return errors.some(error => error.field === fieldName)
    }, [errors])

    // 检查字段是否被触摸过
    const isFieldTouched = useCallback((fieldName: string): boolean => {
        return touched.has(fieldName)
    }, [touched])

    // 检查表单是否有效
    const isValid = errors.length === 0

    // 检查表单是否被修改过
    const isDirty = touched.size > 0

    // 重置验证状态
    const reset = useCallback(() => {
        setErrors([])
        setTouched(new Set())

        // 清除所有定时器
        validationTimersRef.current.forEach(timer => clearTimeout(timer))
        validationTimersRef.current.clear()
    }, [])

    return {
        // 验证方法
        validateField,
        validateAll,
        validateFieldWithDebounce,

        // 事件处理
        handleFieldChange,
        handleFieldBlur,

        // 错误管理
        clearFieldError,
        clearAllErrors,

        // 状态查询
        getFieldError,
        getFieldErrorMessage,
        hasFieldError,
        isFieldTouched,

        // 状态
        errors,
        isValid,
        isDirty,
        touched: Array.from(touched),

        // 工具方法
        reset
    }
}

// 常用的验证规则
export const commonRules = {
    required: (message?: string): ValidationRule => ({
        required: true,
        message: message || '此字段为必填项'
    }),

    minLength: (length: number, message?: string): ValidationRule => ({
        minLength: length,
        message: message || `最少需要${length}个字符`
    }),

    maxLength: (length: number, message?: string): ValidationRule => ({
        maxLength: length,
        message: message || `最多允许${length}个字符`
    }),

    email: (message?: string): ValidationRule => ({
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: message || '请输入有效的邮箱地址'
    }),

    phone: (message?: string): ValidationRule => ({
        pattern: /^1[3-9]\d{9}$/,
        message: message || '请输入有效的手机号码'
    }),

    idCard: (message?: string): ValidationRule => ({
        pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
        message: message || '请输入有效的身份证号码'
    }),

    url: (message?: string): ValidationRule => ({
        pattern: /^https?:\/\/.+/,
        message: message || '请输入有效的URL地址'
    }),

    number: (message?: string): ValidationRule => ({
        pattern: /^\d+$/,
        message: message || '请输入数字'
    }),

    decimal: (message?: string): ValidationRule => ({
        pattern: /^\d+(\.\d+)?$/,
        message: message || '请输入有效的数字'
    }),

    chinese: (message?: string): ValidationRule => ({
        pattern: /^[\u4e00-\u9fa5]+$/,
        message: message || '请输入中文'
    }),

    custom: (validator: (value: any) => boolean | string, message?: string): ValidationRule => ({
        custom: validator,
        message: message || '验证失败'
    })
}

export default useFormValidation
