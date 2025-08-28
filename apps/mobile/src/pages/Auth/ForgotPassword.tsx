import { apiClient } from '@/api/client'
import { Button, Form, Input, NavBar, Space, Steps, Toast } from 'antd-mobile'
import React, { useState } from 'react'
import { history } from 'umi'
import './Auth.css'

interface ForgotPasswordForm {
    email: string
    verificationCode: string
    newPassword: string
    confirmPassword: string
}

const ForgotPassword: React.FC = () => {
    const [form] = Form.useForm<ForgotPasswordForm>()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [countdown, setCountdown] = useState(0)
    const [email, setEmail] = useState('')

    // 发送验证码
    const sendVerificationCode = async () => {
        try {
            const emailValue = form.getFieldValue('email')
            if (!emailValue) {
                Toast.show({ content: '请先输入邮箱地址', position: 'top' })
                return
            }

            setLoading(true)
            await apiClient.post('/auth/send-reset-code', { email: emailValue })

            setEmail(emailValue)
            setCountdown(60)
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            Toast.show({ content: '验证码已发送到您的邮箱', position: 'top' })
            setCurrentStep(1)
        } catch (error) {
            console.error('Send verification code failed:', error)
            Toast.show({ content: '发送验证码失败，请重试', position: 'top' })
        } finally {
            setLoading(false)
        }
    }

    // 验证验证码
    const verifyCode = async () => {
        try {
            const values = form.getFieldsValue(['verificationCode'])
            if (!values.verificationCode) {
                Toast.show({ content: '请输入验证码', position: 'top' })
                return
            }

            setLoading(true)
            await apiClient.post('/auth/verify-reset-code', {
                email,
                code: values.verificationCode,
            })

            Toast.show({ content: '验证码验证成功', position: 'top' })
            setCurrentStep(2)
        } catch (error) {
            console.error('Verify code failed:', error)
            Toast.show({ content: '验证码错误，请重试', position: 'top' })
        } finally {
            setLoading(false)
        }
    }

    // 重置密码
    const resetPassword = async () => {
        try {
            const values = form.getFieldsValue(['newPassword', 'confirmPassword'])

            if (values.newPassword !== values.confirmPassword) {
                Toast.show({ content: '两次输入的密码不一致', position: 'top' })
                return
            }

            setLoading(true)
            await apiClient.post('/auth/reset-password', {
                email,
                code: form.getFieldValue('verificationCode'),
                newPassword: values.newPassword,
            })

            Toast.show({ content: '密码重置成功！', position: 'top' })

            setTimeout(() => {
                history.push('/login')
            }, 1000)
        } catch (error) {
            console.error('Reset password failed:', error)
            Toast.show({ content: '密码重置失败，请重试', position: 'top' })
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        if (currentStep === 0) {
            sendVerificationCode()
        } else if (currentStep === 1) {
            verifyCode()
        } else if (currentStep === 2) {
            resetPassword()
        }
    }

    const steps = [
        { title: '验证邮箱', description: '输入您的邮箱地址' },
        { title: '输入验证码', description: '请查收邮箱验证码' },
        { title: '重置密码', description: '设置新密码' },
    ]

    return (
        <div className="auth-container">
            <NavBar onBack={() => history.back()}>忘记密码</NavBar>

            <div className="auth-content">
                <div className="auth-header">
                    <h1 className="auth-title">重置密码</h1>
                    <p className="auth-subtitle">通过邮箱验证来重置您的密码</p>
                </div>

                <div className="forgot-password-steps">
                    <Steps current={currentStep} direction="horizontal">
                        {steps.map((step, index) => (
                            <Steps.Step
                                key={index}
                                title={step.title}
                                description={step.description}
                            />
                        ))}
                    </Steps>
                </div>

                <Form form={form} layout="vertical" className="auth-form">
                    {currentStep === 0 && (
                        <Form.Item
                            name="email"
                            label="邮箱地址"
                            rules={[
                                { required: true, message: '请输入邮箱地址' },
                                { type: 'email', message: '请输入有效的邮箱地址' },
                            ]}
                        >
                            <Input placeholder="请输入您的邮箱地址" />
                        </Form.Item>
                    )}

                    {currentStep === 1 && (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div className="verification-info">
                                <p>验证码已发送到：{email}</p>
                                {countdown > 0 && <p className="countdown">重新发送 ({countdown}s)</p>}
                            </div>
                            <Form.Item
                                name="verificationCode"
                                label="验证码"
                                rules={[
                                    { required: true, message: '请输入验证码' },
                                    { len: 6, message: '验证码为6位数字' },
                                ]}
                            >
                                <Input placeholder="请输入6位验证码" maxLength={6} />
                            </Form.Item>
                            {countdown === 0 && (
                                <Button
                                    fill="none"
                                    color="primary"
                                    onClick={sendVerificationCode}
                                    loading={loading}
                                >
                                    重新发送验证码
                                </Button>
                            )}
                        </Space>
                    )}

                    {currentStep === 2 && (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Form.Item
                                name="newPassword"
                                label="新密码"
                                rules={[
                                    { required: true, message: '请输入新密码' },
                                    { min: 6, message: '密码至少6个字符' },
                                    { max: 20, message: '密码最多20个字符' },
                                ]}
                            >
                                <Input placeholder="请输入新密码" type="password" />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="确认新密码"
                                rules={[
                                    { required: true, message: '请确认新密码' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve()
                                            }
                                            return Promise.reject(new Error('两次输入的密码不一致'))
                                        },
                                    }),
                                ]}
                            >
                                <Input placeholder="请再次输入新密码" type="password" />
                            </Form.Item>
                        </Space>
                    )}

                    <div className="auth-actions">
                        <Button
                            color="primary"
                            size="large"
                            loading={loading}
                            onClick={handleNext}
                            block
                        >
                            {currentStep === 0 && '发送验证码'}
                            {currentStep === 1 && '验证'}
                            {currentStep === 2 && '重置密码'}
                        </Button>
                    </div>
                </Form>

                <div className="auth-footer">
                    <Button
                        fill="none"
                        color="primary"
                        onClick={() => history.push('/login')}
                        className="auth-link"
                    >
                        返回登录
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
