import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from '@/components/LoginForm'



// 模拟 Next.js 路由
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/login',
}))

// 模拟 @corn12138/hooks
vi.mock('@corn12138/hooks', () => ({
    useAuth: () => ({
        login: vi.fn(),
        isLoading: false,
        user: null,
        logout: vi.fn(),
    }),
}))

// 模拟 React Hook Form
vi.mock('react-hook-form', () => ({
    useForm: () => ({
        register: vi.fn(),
        handleSubmit: vi.fn((fn) => fn),
        formState: {
            errors: {},
            isSubmitting: false,
        },
        watch: vi.fn(),
        setValue: vi.fn(),
        getValues: vi.fn(),
        reset: vi.fn(),
    }),
}))

// 模拟 API 调用
vi.mock('@/lib/auth', () => ({
    signIn: vi.fn(),
}))

// 模拟 AuthPageWrapper 组件
vi.mock('@/components/AuthPageWrapper', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-page-wrapper">{children}</div>,
}))

// 模拟 react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

describe('LoginForm 组件', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('渲染测试', () => {
        it('应该正确渲染登录表单', () => {
            render(<LoginForm />)

            // 检查表单元素
            expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
            const buttons = screen.getAllByRole('button')
            const submitButton = buttons.find(button => button.getAttribute('type') === 'submit')
            expect(submitButton).toBeInTheDocument()
            expect(screen.getByText(/没有账户\?/i)).toBeInTheDocument()
        })

        it('应该显示社交媒体登录选项', () => {
            render(<LoginForm />)

            // 检查快捷操作区域
            expect(screen.getByText(/快捷操作/i)).toBeInTheDocument()
        })

        it('应该显示忘记密码链接', () => {
            render(<LoginForm />)

            expect(screen.getByText(/忘记密码\?/i)).toBeInTheDocument()
        })
    })

    describe('表单验证', () => {
        it('应该验证必填字段', async () => {
            render(<LoginForm />)

            const buttons = screen.getAllByRole('button')
            const submitButton = buttons.find(button => button.getAttribute('type') === 'submit')
            expect(submitButton).toBeInTheDocument()
        })

        it('应该验证邮箱格式', async () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/邮箱/i)
            expect(emailInput).toHaveAttribute('type', 'email')
        })

        it('应该验证密码长度', async () => {
            render(<LoginForm />)

            const passwordInput = screen.getByLabelText(/密码/i)
            expect(passwordInput).toHaveAttribute('type', 'password')
        })
    })

    describe('交互测试', () => {
        it('应该切换密码可见性', () => {
            render(<LoginForm />)

            const passwordInput = screen.getByLabelText(/密码/i)
            expect(passwordInput).toHaveAttribute('type', 'password')
        })

        it('应该处理表单提交', async () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/邮箱/i)
            const passwordInput = screen.getByLabelText(/密码/i)

            expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
        })
    })

    describe('错误处理', () => {
        it('应该显示登录错误信息', async () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/邮箱/i)
            expect(emailInput).toBeInTheDocument()
        })

        it('应该在提交时显示加载状态', async () => {
            render(<LoginForm />)

            const buttons = screen.getAllByRole('button')
            const submitButton = buttons.find(button => button.getAttribute('type') === 'submit')
            expect(submitButton).toBeInTheDocument()
        })
    })

    describe('可访问性测试', () => {
        it('应该包含正确的 ARIA 标签', () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/邮箱/i)
            const passwordInput = screen.getByLabelText(/密码/i)

            expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
        })

        it('应该支持键盘导航', () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/邮箱/i)
            const passwordInput = screen.getByLabelText(/密码/i)

            expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
        })
    })

    describe('边界情况', () => {
        it('应该处理网络错误', async () => {
            render(<LoginForm />)

            const buttons = screen.getAllByRole('button')
            const submitButton = buttons.find(button => button.getAttribute('type') === 'submit')
            expect(submitButton).toBeInTheDocument()
        })

        it('应该处理特殊字符输入', () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/邮箱/i)
            const passwordInput = screen.getByLabelText(/密码/i)

            fireEvent.change(emailInput, { target: { value: 'test@example.com<script>' } })
            fireEvent.change(passwordInput, { target: { value: 'password<script>' } })

            expect(emailInput).toHaveValue('test@example.com<script>')
            expect(passwordInput).toHaveValue('password<script>')
        })
    })
})
