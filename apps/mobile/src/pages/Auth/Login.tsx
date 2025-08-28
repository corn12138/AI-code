import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import {
    Button,
    Card,
    CheckList,
    Divider,
    Form,
    Input,
    Space,
    Toast
} from 'antd-mobile'
import {
    EyeInvisibleOutline,
    EyeOutline,
    LockOutline,
    UserOutline
} from 'antd-mobile-icons'
import { useState } from 'react'
import './Login.css'

export default function Login() {
    const { isMobile, isTablet } = useDeviceInfo()

    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const handleLogin = async (values: any) => {
        setLoading(true)
        try {
            // TODO: 实现登录逻辑
            console.log('Login values:', values)
            await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用

            Toast.show({
                icon: 'success',
                content: '登录成功',
            })

            history.push('/')
        } catch (error) {
            Toast.show({
                icon: 'fail',
                content: '登录失败，请检查用户名和密码',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = () => {
        Toast.show('忘记密码功能待开发')
    }

    const handleRegister = () => {
        Toast.show('注册功能待开发')
    }

    const handleQuickLogin = (type: string) => {
        Toast.show(`${type}登录待开发`)
    }

    return (
        <div className={`login-page ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
            <div className="login-container">
                {/* 头部Logo */}
                <div className="login-header">
                    <div className="logo">
                        <div className="logo-icon">📱</div>
                        <h1 className="logo-text">移动端应用</h1>
                    </div>
                    <p className="login-subtitle">欢迎回来，请登录您的账户</p>
                </div>

                {/* 登录表单 */}
                <Card className="login-card">
                    <Form
                        form={form}
                        onFinish={handleLogin}
                        layout="vertical"
                        footer={
                            <Space direction="vertical" block>
                                <Button
                                    block
                                    type="submit"
                                    color="primary"
                                    size="large"
                                    loading={loading}
                                >
                                    登录
                                </Button>

                                <div className="login-options">
                                    <CheckList
                                        value={rememberMe ? ['remember'] : []}
                                        onChange={(val) => setRememberMe(val.includes('remember'))}
                                    >
                                        <CheckList.Item value="remember">记住密码</CheckList.Item>
                                    </CheckList>
                                    <Button
                                        fill="none"
                                        size="small"
                                        onClick={handleForgotPassword}
                                    >
                                        忘记密码？
                                    </Button>
                                </div>
                            </Space>
                        }
                    >
                        <Form.Item
                            name="username"
                            label="用户名"
                            rules={[
                                { required: true, message: '请输入用户名' },
                                { min: 3, message: '用户名至少3个字符' }
                            ]}
                        >
                            <Input
                                placeholder="请输入用户名"
                                prefix={<UserOutline />}
                                clearable
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[
                                { required: true, message: '请输入密码' },
                                { min: 6, message: '密码至少6个字符' }
                            ]}
                        >
                            <Input
                                placeholder="请输入密码"
                                type={showPassword ? 'text' : 'password'}
                                prefix={<LockOutline />}
                                suffix={
                                    <div onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
                                    </div>
                                }
                                clearable
                            />
                        </Form.Item>
                    </Form>
                </Card>

                {/* 分割线 */}
                <Divider className="login-divider">或</Divider>

                {/* 快捷登录 */}
                <Card className="quick-login-card">
                    <div className="quick-login-title">快捷登录</div>
                    <Space direction="vertical" block>
                        <Button
                            block
                            color="success"
                            size="large"
                            onClick={() => handleQuickLogin('微信')}
                        >
                            微信登录
                        </Button>
                        <Button
                            block
                            size="large"
                            onClick={() => handleQuickLogin('手机号')}
                        >
                            手机号登录
                        </Button>
                    </Space>
                </Card>

                {/* 注册链接 */}
                <div className="register-link">
                    <span>还没有账户？</span>
                    <Button
                        fill="none"
                        color="primary"
                        onClick={handleRegister}
                    >
                        立即注册
                    </Button>
                </div>

                {/* 底部信息 */}
                <div className="login-footer">
                    <p>登录即表示同意用户协议和隐私政策</p>
                </div>
            </div>
        </div>
    )
}
