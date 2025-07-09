import React, { useCallback, useState } from 'react';

// 简化的 useForm 实现
type ValidateFunction<T> = (values: T) => Partial<Record<keyof T, string>>;

interface UseFormOptions<T> {
    initialValues: T;
    validate?: ValidateFunction<T>;
    onSubmit?: (values: T) => void | Promise<void>;
}

function useSimpleForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
    const { initialValues, validate, onSubmit } = options;

    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = useCallback(() => {
        if (!validate) return {};
        return validate(values);
    }, [values, validate]);

    const setFieldValue = useCallback((name: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // 清除该字段的错误
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const setFieldTouched = useCallback((name: keyof T, isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();

        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            setIsSubmitting(true);
            try {
                await onSubmit?.(values);
            } catch (error) {
                console.error('表单提交失败:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [values, validateForm, onSubmit]);

    const getFieldProps = useCallback((name: keyof T) => ({
        name: String(name),
        value: values[name] || '',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setFieldValue(name, e.target.value);
        },
        onBlur: () => {
            setFieldTouched(name, true);
            if (validate) {
                const formErrors = validate(values);
                setErrors(prev => ({ ...prev, [name]: formErrors[name] }));
            }
        }
    }), [values, setFieldValue, setFieldTouched, validate]);

    const isValid = Object.keys(errors).length === 0;

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        setFieldValue,
        setFieldTouched,
        handleSubmit,
        getFieldProps
    };
}

interface LoginForm {
    email: string;
    password: string;
    rememberMe: boolean;
}

export default function FormDemo() {
    const [submitResult, setSubmitResult] = useState<string>('');

    const form = useSimpleForm<LoginForm>({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false
        },
        validate: (values) => {
            const errors: Partial<Record<keyof LoginForm, string>> = {};

            if (!values.email?.trim()) {
                errors.email = '邮箱不能为空';
            } else if (!/\S+@\S+\.\S+/.test(values.email)) {
                errors.email = '邮箱格式不正确';
            }

            if (!values.password?.trim()) {
                errors.password = '密码不能为空';
            } else if (values.password.length < 6) {
                errors.password = '密码长度至少6位';
            }

            return errors;
        },
        onSubmit: async (values) => {
            // 模拟登录API调用
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (values.email === 'demo@example.com' && values.password === '123456') {
                setSubmitResult('✅ 登录成功！欢迎回来！');
            } else {
                setSubmitResult('❌ 登录失败：邮箱或密码错误');
            }
        }
    });

    const handleReset = () => {
        form.setFieldValue('email', '');
        form.setFieldValue('password', '');
        form.setFieldValue('rememberMe', false);
        setSubmitResult('');
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h4>📝 表单状态管理演示</h4>

            <form onSubmit={form.handleSubmit} style={{ maxWidth: '400px' }}>
                {/* 邮箱字段 */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        邮箱地址 *
                    </label>
                    <input
                        {...form.getFieldProps('email')}
                        type="email"
                        placeholder="请输入邮箱地址"
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: `1px solid ${form.touched.email && form.errors.email ? '#ff4d4f' : '#ccc'}`,
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                    {form.touched.email && form.errors.email && (
                        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                            {form.errors.email}
                        </div>
                    )}
                </div>

                {/* 密码字段 */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        密码 *
                    </label>
                    <input
                        {...form.getFieldProps('password')}
                        type="password"
                        placeholder="请输入密码"
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: `1px solid ${form.touched.password && form.errors.password ? '#ff4d4f' : '#ccc'}`,
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                    {form.touched.password && form.errors.password && (
                        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                            {form.errors.password}
                        </div>
                    )}
                </div>

                {/* 记住我 */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            checked={form.values.rememberMe}
                            onChange={(e) => form.setFieldValue('rememberMe', e.target.checked)}
                            style={{ marginRight: '8px' }}
                        />
                        记住我
                    </label>
                </div>

                {/* 提交按钮 */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <button
                        type="submit"
                        disabled={form.isSubmitting || !form.isValid}
                        style={{
                            padding: '10px 20px',
                            background: form.isSubmitting || !form.isValid ? '#f5f5f5' : '#1890ff',
                            color: form.isSubmitting || !form.isValid ? '#999' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: form.isSubmitting || !form.isValid ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {form.isSubmitting ? '登录中...' : '登录'}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            color: '#666',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        重置
                    </button>
                </div>
            </form>

            {/* 状态显示 */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 12px 0' }}>表单状态：</h5>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    <div><strong>表单值：</strong> {JSON.stringify(form.values, null, 2)}</div>
                    <div style={{ marginTop: '8px' }}><strong>验证错误：</strong> {JSON.stringify(form.errors, null, 2)}</div>
                    <div style={{ marginTop: '8px' }}><strong>字段状态：</strong> {JSON.stringify(form.touched, null, 2)}</div>
                    <div style={{ marginTop: '8px' }}><strong>表单有效：</strong> {form.isValid ? 'true' : 'false'}</div>
                    <div style={{ marginTop: '8px' }}><strong>提交中：</strong> {form.isSubmitting ? 'true' : 'false'}</div>
                </div>
            </div>

            {/* 提交结果 */}
            {submitResult && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: submitResult.includes('成功') ? '#f6ffed' : '#fff2f0',
                    border: `1px solid ${submitResult.includes('成功') ? '#b7eb8f' : '#ffb3b3'}`,
                    borderRadius: '4px',
                    color: submitResult.includes('成功') ? '#52c41a' : '#ff4d4f'
                }}>
                    {submitResult}
                </div>
            )}

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                💡 提示：尝试输入 demo@example.com / 123456 进行登录测试！
            </div>
        </div>
    );
} 