import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProfileClient from '@/components/ProfileClient'

import userEvent from '@testing-library/user-event'


// 模拟用户数据
const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
}

// 模拟更新用户函数
const mockUpdateUser = vi.fn()

describe('ProfileClient 组件', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('应该正确渲染用户资料显示模式', async () => {
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 检查显示模式的元素是否存在
        expect(screen.getByText(mockUser.username)).toBeInTheDocument()
        expect(screen.getByText(mockUser.email)).toBeInTheDocument()
        expect(screen.getByText(mockUser.bio)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /编辑个人资料/i })).toBeInTheDocument()
    })

    it('应该显示用户的当前信息', async () => {
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 检查显示模式的用户信息
        expect(screen.getByText(mockUser.username)).toBeInTheDocument()
        expect(screen.getByText(mockUser.email)).toBeInTheDocument()
        expect(screen.getByText(mockUser.bio)).toBeInTheDocument()
    })

    it('应该显示用户头像', async () => {
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        const avatar = screen.getByAltText(/用户头像/i)
        expect(avatar).toBeInTheDocument()
        expect(avatar).toHaveAttribute('src', mockUser.avatar)
    })

    it('应该显示默认头像当用户没有头像时', async () => {
        const userWithoutAvatar = { ...mockUser, avatar: undefined }
        render(<ProfileClient initialUser={userWithoutAvatar} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        const avatar = screen.getByAltText(/用户头像/i)
        expect(avatar).toBeInTheDocument()
        expect(avatar).toHaveAttribute('src', '/default-avatar.svg')
    })

    it('应该允许用户编辑表单字段', async () => {
        const user = userEvent.setup()
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 点击编辑资料按钮进入编辑模式
        const editButton = screen.getByRole('button', { name: /编辑个人资料/i })
        await user.click(editButton)

        // 等待编辑模式加载
        await waitFor(() => {
            expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument()
        })

        const usernameInput = screen.getByLabelText(/用户名/i)
        const bioInput = screen.getByLabelText(/个人简介/i)

        await user.clear(usernameInput)
        await user.type(usernameInput, 'newusername')

        await user.clear(bioInput)
        await user.type(bioInput, 'New bio')

        expect(usernameInput).toHaveValue('newusername')
        expect(bioInput).toHaveValue('New bio')
    })

    it('应该在提交表单时更新用户信息', async () => {
        const user = userEvent.setup()
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 点击编辑资料按钮进入编辑模式
        const editButton = screen.getByRole('button', { name: /编辑个人资料/i })
        await user.click(editButton)

        // 等待编辑模式加载
        await waitFor(() => {
            expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument()
        })

        const usernameInput = screen.getByLabelText(/用户名/i)
        const bioInput = screen.getByLabelText(/个人简介/i)

        await user.clear(usernameInput)
        await user.type(usernameInput, 'newusername')

        await user.clear(bioInput)
        await user.type(bioInput, 'New bio')

        const submitButton = screen.getByRole('button', { name: /保存/i })
        await user.click(submitButton)

        // 等待保存完成，回到显示模式
        await waitFor(() => {
            expect(screen.getByText('newusername')).toBeInTheDocument()
        })

        // 验证表单提交后的行为
        expect(screen.getByText('newusername')).toBeInTheDocument()
        expect(screen.getByText('New bio')).toBeInTheDocument()
    })

    it('应该显示加载状态当表单提交时', async () => {
        const user = userEvent.setup()
        const mockUpdateUserWithLoading = vi.fn().mockImplementation(() =>
            new Promise(resolve => setTimeout(resolve, 100))
        )

        render(<ProfileClient initialUser={mockUser} />)

        const submitButton = screen.getByRole('button', { name: /保存更改/i })
        await user.click(submitButton)

        expect(submitButton).toBeDisabled()
        expect(screen.getByText(/保存中/i)).toBeInTheDocument()
    })

    it('应该显示成功消息当更新成功时', async () => {
        const user = userEvent.setup()
        const mockUpdateUserSuccess = vi.fn().mockResolvedValue(undefined)

        render(<ProfileClient initialUser={mockUser} />)

        const submitButton = screen.getByRole('button', { name: /保存更改/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/资料更新成功/i)).toBeInTheDocument()
        })
    })

    it('应该显示错误消息当更新失败时', async () => {
        const user = userEvent.setup()
        const mockUpdateUserError = vi.fn().mockRejectedValue(new Error('更新失败'))

        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        // 首先等待ClientPageWrapper的mounted状态为true，然后等待ProfileClient组件
        await waitFor(() => {
            // 检查是否有加载动画或者ProfileClient组件
            const loadingSpinner = screen.queryByRole('generic', { name: /loading/i })
            const profileClient = screen.queryByTestId('profile-client')
            expect(loadingSpinner || profileClient).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待ProfileClient组件出现
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待编辑资料按钮出现
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /编辑个人资料/i })).toBeInTheDocument()
        }, { timeout: 5000 })

        // 点击编辑资料按钮进入编辑模式
        const editButton = screen.getByRole('button', { name: /编辑个人资料/i })
        await user.click(editButton)

        // 等待编辑模式加载
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument()
        }, { timeout: 5000 })

        const submitButton = screen.getByRole('button', { name: /保存/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/更新失败/i)).toBeInTheDocument()
        })
    })

    it('应该验证必填字段', async () => {
        const user = userEvent.setup()
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        // 首先等待ClientPageWrapper的mounted状态为true，然后等待ProfileClient组件
        await waitFor(() => {
            // 检查是否有加载动画或者ProfileClient组件
            const loadingSpinner = screen.queryByRole('generic', { name: /loading/i })
            const profileClient = screen.queryByTestId('profile-client')
            expect(loadingSpinner || profileClient).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待ProfileClient组件出现
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待编辑资料按钮出现
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /编辑个人资料/i })).toBeInTheDocument()
        }, { timeout: 5000 })

        // 点击编辑资料按钮进入编辑模式
        const editButton = screen.getByRole('button', { name: /编辑个人资料/i })
        await user.click(editButton)

        // 等待编辑模式加载
        await waitFor(() => {
            expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument()
        })

        const usernameInput = screen.getByLabelText(/用户名/i)
        const bioInput = screen.getByLabelText(/个人简介/i)

        // 清空必填字段
        await user.clear(usernameInput)
        await user.clear(bioInput)

        const submitButton = screen.getByRole('button', { name: /保存/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/用户名是必填项/i)).toBeInTheDocument()
        })
    })

    it('应该验证邮箱格式', async () => {
        const user = userEvent.setup()
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        // 首先等待ClientPageWrapper的mounted状态为true，然后等待ProfileClient组件
        await waitFor(() => {
            // 检查是否有加载动画或者ProfileClient组件
            const loadingSpinner = screen.queryByRole('generic', { name: /loading/i })
            const profileClient = screen.queryByTestId('profile-client')
            expect(loadingSpinner || profileClient).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待ProfileClient组件出现
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待编辑资料按钮出现
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /编辑个人资料/i })).toBeInTheDocument()
        }, { timeout: 5000 })

        // 点击编辑资料按钮进入编辑模式
        const editButton = screen.getByRole('button', { name: /编辑个人资料/i })
        await user.click(editButton)

        // 等待编辑模式加载
        await waitFor(() => {
            expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument()
        })

        const usernameInput = screen.getByLabelText(/用户名/i)
        await user.clear(usernameInput)
        await user.type(usernameInput, 'a'.repeat(51)) // 超过50个字符

        const submitButton = screen.getByRole('button', { name: /保存/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/用户名长度不能超过50个字符/i)).toBeInTheDocument()
        })
    })

    it('应该应用正确的CSS类名', async () => {
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        // 首先等待ClientPageWrapper的mounted状态为true，然后等待ProfileClient组件
        await waitFor(() => {
            // 检查是否有加载动画或者ProfileClient组件
            const loadingSpinner = screen.queryByRole('generic', { name: /loading/i })
            const profileClient = screen.queryByTestId('profile-client')
            expect(loadingSpinner || profileClient).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待ProfileClient组件出现
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待编辑资料按钮出现
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /编辑个人资料/i })).toBeInTheDocument()
        }, { timeout: 5000 })

        const container = screen.getByTestId('profile-client')
        expect(container).toHaveClass(
            'bg-space-900/40',
            'backdrop-blur-xl',
            'rounded-2xl',
            'border',
            'border-cosmic-500/20',
            'shadow-cosmic'
        )

        const header = screen.getByTestId('profile-header')
        expect(header).toHaveClass(
            'bg-gradient-to-r',
            'from-cosmic-600',
            'to-nebula-600',
            'h-32',
            'relative'
        )
    })

    it('应该为输入字段应用正确的样式', async () => {
        const user = userEvent.setup()
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        // 首先等待ClientPageWrapper的mounted状态为true，然后等待ProfileClient组件
        await waitFor(() => {
            // 检查是否有加载动画或者ProfileClient组件
            const loadingSpinner = screen.queryByRole('generic', { name: /loading/i })
            const profileClient = screen.queryByTestId('profile-client')
            expect(loadingSpinner || profileClient).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待ProfileClient组件出现
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待编辑资料按钮出现
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /编辑个人资料/i })).toBeInTheDocument()
        }, { timeout: 5000 })

        // 点击编辑资料按钮进入编辑模式
        const editButton = screen.getByRole('button', { name: /编辑个人资料/i })
        await user.click(editButton)

        // 等待编辑模式加载
        await waitFor(() => {
            expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument()
        })

        const inputs = screen.getAllByRole('textbox')
        inputs.forEach(input => {
            expect(input).toHaveClass(
                'border',
                'border-cosmic-500/30',
                'bg-space-800/60',
                'text-space-200',
                'placeholder-space-500',
                'focus:border-cosmic-400/50',
                'focus:ring-2',
                'focus:ring-cosmic-500/20',
                'backdrop-blur-sm'
            )
        })
    })

    it('应该为按钮应用正确的样式', async () => {
        const user = userEvent.setup()
        render(<ProfileClient initialUser={mockUser} />)

        // 由于组件被ClientPageWrapper包装，我们需要等待组件完全加载
        // 首先等待ClientPageWrapper的mounted状态为true，然后等待ProfileClient组件
        await waitFor(() => {
            // 检查是否有加载动画或者ProfileClient组件
            const loadingSpinner = screen.queryByRole('generic', { name: /loading/i })
            const profileClient = screen.queryByTestId('profile-client')
            expect(loadingSpinner || profileClient).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待ProfileClient组件出现
        await waitFor(() => {
            expect(screen.getByTestId('profile-client')).toBeInTheDocument()
        }, { timeout: 5000 })

        // 等待编辑资料按钮出现
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /编辑个人资料/i })).toBeInTheDocument()
        }, { timeout: 5000 })

        // 点击编辑资料按钮进入编辑模式
        const editButton = screen.getByRole('button', { name: /编辑个人资料/i })
        await user.click(editButton)

        // 等待编辑模式加载
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument()
        })

        const submitButton = screen.getByRole('button', { name: /保存/i })
        expect(submitButton).toHaveClass(
            'bg-gradient-to-r',
            'from-cosmic-600',
            'to-nebula-600',
            'shadow-cosmic'
        )
    })
})
