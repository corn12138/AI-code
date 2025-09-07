import { createMockUser, fireEvent, render, screen, waitFor } from '@/test/utils/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';



// 示例组件 - 用户卡片
interface UserCardProps {
    user: {
        id: string
        name: string
        email: string
        avatar?: string
    }
    onEdit?: (user: any) => void
    onDelete?: (userId: string) => void
}

const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
    return (
        <div className="user-card" data-testid="user-card">
            <div className="user-avatar">
                <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={`${user.name} avatar`}
                    data-testid="user-avatar"
                />
            </div>
            <div className="user-info">
                <h3 className="user-name" data-testid="user-name">{user.name}</h3>
                <p className="user-email" data-testid="user-email">{user.email}</p>
            </div>
            <div className="user-actions">
                {onEdit && (
                    <button
                        onClick={() => onEdit(user)}
                        className="edit-btn"
                        data-testid="edit-btn"
                    >
                        编辑
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(user.id)}
                        className="delete-btn"
                        data-testid="delete-btn"
                    >
                        删除
                    </button>
                )}
            </div>
        </div>
    )
}

describe('UserCard 组件', () => {
    const mockUser = createMockUser({
        id: '1',
        name: '张三',
        email: 'zhangsan@example.com',
        avatar: 'https://via.placeholder.com/150'
    })

    beforeEach(() => {
        // 清理之前的测试状态
        vi.clearAllMocks()
    })

    describe('渲染测试', () => {
        it('应该正确渲染用户信息', () => {
            render(<UserCard user={mockUser} />)

            // 检查用户卡片是否存在
            expect(screen.getByTestId('user-card')).toBeInTheDocument()

            // 检查用户头像
            const avatar = screen.getByTestId('user-avatar')
            expect(avatar).toBeInTheDocument()
            expect(avatar).toHaveAttribute('src', mockUser.avatar)
            expect(avatar).toHaveAttribute('alt', `${mockUser.name} avatar`)

            // 检查用户姓名
            expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.name)

            // 检查用户邮箱
            expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email)
        })

        it('应该在没有头像时显示默认头像', () => {
            const userWithoutAvatar = { ...mockUser, avatar: undefined }
            render(<UserCard user={userWithoutAvatar} />)

            const avatar = screen.getByTestId('user-avatar')
            expect(avatar).toHaveAttribute('src', '/default-avatar.png')
        })

        it('应该在没有操作按钮时不显示按钮区域', () => {
            render(<UserCard user={mockUser} />)

            expect(screen.queryByTestId('edit-btn')).not.toBeInTheDocument()
            expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument()
        })
    })

    describe('交互测试', () => {
        it('应该正确调用编辑回调函数', async () => {
            const mockOnEdit = vi.fn()
            render(<UserCard user={mockUser} onEdit={mockOnEdit} />)

            const editButton = screen.getByTestId('edit-btn')
            expect(editButton).toBeInTheDocument()

            fireEvent.click(editButton)

            await waitFor(() => {
                expect(mockOnEdit).toHaveBeenCalledTimes(1)
                expect(mockOnEdit).toHaveBeenCalledWith(mockUser)
            })
        })

        it('应该正确调用删除回调函数', async () => {
            const mockOnDelete = vi.fn()
            render(<UserCard user={mockUser} onDelete={mockOnDelete} />)

            const deleteButton = screen.getByTestId('delete-btn')
            expect(deleteButton).toBeInTheDocument()

            fireEvent.click(deleteButton)

            await waitFor(() => {
                expect(mockOnDelete).toHaveBeenCalledTimes(1)
                expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id)
            })
        })

        it('应该同时支持编辑和删除功能', async () => {
            const mockOnEdit = vi.fn()
            const mockOnDelete = vi.fn()

            render(
                <UserCard
                    user={mockUser}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            )

            // 测试编辑按钮
            fireEvent.click(screen.getByTestId('edit-btn'))
            await waitFor(() => {
                expect(mockOnEdit).toHaveBeenCalledWith(mockUser)
            })

            // 测试删除按钮
            fireEvent.click(screen.getByTestId('delete-btn'))
            await waitFor(() => {
                expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id)
            })

            // 验证两个回调都被调用了
            expect(mockOnEdit).toHaveBeenCalledTimes(1)
            expect(mockOnDelete).toHaveBeenCalledTimes(1)
        })
    })

    describe('样式测试', () => {
        it('应该包含正确的CSS类名', () => {
            render(<UserCard user={mockUser} onEdit={() => { }} onDelete={() => { }} />)

            const userCard = screen.getByTestId('user-card')
            expect(userCard).toHaveClass('user-card')

            const editButton = screen.getByTestId('edit-btn')
            expect(editButton).toHaveClass('edit-btn')

            const deleteButton = screen.getByTestId('delete-btn')
            expect(deleteButton).toHaveClass('delete-btn')
        })
    })

    describe('边界情况测试', () => {
        it('应该处理空用户数据', () => {
            const emptyUser = {
                id: '',
                name: '',
                email: ''
            }

            render(<UserCard user={emptyUser} />)

            expect(screen.getByTestId('user-name')).toHaveTextContent('')
            expect(screen.getByTestId('user-email')).toHaveTextContent('')
        })

        it('应该处理特殊字符的用户名', () => {
            const specialUser = {
                ...mockUser,
                name: '用户@#$%^&*()'
            }

            render(<UserCard user={specialUser} />)

            expect(screen.getByTestId('user-name')).toHaveTextContent('用户@#$%^&*()')
        })

        it('应该处理很长的用户信息', () => {
            const longUser = {
                ...mockUser,
                name: '这是一个非常非常非常非常非常非常非常非常非常非常长的用户名',
                email: 'very.long.email.address.that.exceeds.normal.length@example.com'
            }

            render(<UserCard user={longUser} />)

            expect(screen.getByTestId('user-name')).toHaveTextContent(longUser.name)
            expect(screen.getByTestId('user-email')).toHaveTextContent(longUser.email)
        })
    })

    describe('可访问性测试', () => {
        it('应该包含正确的alt文本', () => {
            render(<UserCard user={mockUser} />)

            const avatar = screen.getByTestId('user-avatar')
            expect(avatar).toHaveAttribute('alt', `${mockUser.name} avatar`)
        })

        it('按钮应该可以被键盘访问', () => {
            const mockOnEdit = vi.fn()
            const mockOnDelete = vi.fn()

            render(
                <UserCard
                    user={mockUser}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            )

            const editButton = screen.getByTestId('edit-btn')
            const deleteButton = screen.getByTestId('delete-btn')

            // 测试Tab键导航
            editButton.focus()
            expect(editButton).toHaveFocus()

            deleteButton.focus()
            expect(deleteButton).toHaveFocus()

            // 测试Enter键激活
            fireEvent.keyDown(editButton, { key: 'Enter', code: 'Enter' })
            fireEvent.click(editButton)
            expect(mockOnEdit).toHaveBeenCalledWith(mockUser)

            fireEvent.keyDown(deleteButton, { key: 'Enter', code: 'Enter' })
            fireEvent.click(deleteButton)
            expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id)
        })
    })
})
