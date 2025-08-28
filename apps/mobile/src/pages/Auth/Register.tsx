import { useAuthStore } from '@/stores/auth/useAuthStore'
import { Button, Form, Input, NavBar, Toast } from 'antd-mobile'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import React, { useState } from 'react'
import { history } from 'umi'
import './Auth.css'

interface RegisterForm {
    username: string
    email: string
    password: string
    confirmPassword: string
    phone?: string
}

const Register: React.FC = () => {
    const [form] = Form.useForm<RegisterForm>()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { register } = useAuthStore()

    const handleSubmit = async (values: RegisterForm) => {
        try {
            setLoading(true)

            // 验证密码一致性
            if (values.password !== values.confirmPassword) {
                Toast.show({
                    content: '两次输入的密码不一致',
                    position: 'top',
                })
                return
            }

            // 调用注册接口
            await register({
                username: values.username,
                email: values.email,
                password: values.password,
                phone: values.phone,
            })

            Toast.show({
                content: '注册成功！',
                position: 'top',
            })

            // 注册成功后跳转到登录页
            setTimeout(() => {
                history.push('/login')
            }, 1000)
        } catch (error) {
            console.error('Registration failed:', error)
            Toast.show({
                content: '注册失败，请重试',
                position: 'top',
            })
        } finally {
            setLoading(false)
        }
    }

    const goToLogin = () => {
        history.push('/login')
    }

    return (
        <div className="auth-container">
            <NavBar onBack={() => history.back()}>注册</NavBar>

            <div className="auth-content">
                <div className="auth-header">
                    <h1 className="auth-title">创建账户</h1>
                    <p className="auth-subtitle">请填写以下信息完成注册</p>
                </div>

                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                    className="auth-form"
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 3, message: '用户名至少3个字符' },
                            { max: 20, message: '用户名最多20个字符' },
                            { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
                        ]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' },
                        ]}
                    >
                        <Input placeholder="请输入邮箱地址" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="手机号（可选）"
                        rules={[
                            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                        ]}
                    >
                        <Input placeholder="请输入手机号" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[
                            { required: true, message: '请输入密码' },
                            { min: 6, message: '密码至少6个字符' },
                            { max: 20, message: '密码最多20个字符' },
                        ]}
                    >
                        <Input
                            placeholder="请输入密码"
                            type={showPassword ? 'text' : 'password'}
                            suffix={
                                <div
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
                                </div>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        rules={[
                            { required: true, message: '请确认密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'))
                                },
                            }),
                        ]}
                    >
                        <Input
                            placeholder="请再次输入密码"
                            type={showConfirmPassword ? 'text' : 'password'}
                            suffix={
                                <div
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
                                </div>
                            }
                        />
                    </Form.Item>

                    <div className="auth-actions">
                        <Button
                            type="submit"
                            color="primary"
                            size="large"
                            loading={loading}
                            block
                        >
                            注册
                        </Button>
                    </div>
                </Form>

                <div className="auth-footer">
                    <span>已有账户？</span>
                    <Button
                        fill="none"
                        color="primary"
                        onClick={goToLogin}
                        className="auth-link"
                    >
                        立即登录
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Register
