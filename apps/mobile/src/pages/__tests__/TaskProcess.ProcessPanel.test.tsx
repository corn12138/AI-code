import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// 被测组件
import ProcessPanel from '../TaskProcess/TaskDetail/components/ProcessPanel'

// mock 路由（不引用实际模块，减少打包依赖）
const pushMock = vi.fn()
vi.mock('umi', () => ({ history: { push: (...args: any[]) => pushMock(...args) } }))

// mock 全局状态 store（最小实现）
vi.mock('@/stores/taskProcessStore', () => ({
    useTaskProcessStore: () => ({
        submitProcess: vi.fn(async () => Promise.resolve()),
    }),
}))

// 使用 spy 方式处理 Toast
import * as Antd from 'antd-mobile'


describe('TaskProcess - ProcessPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('应渲染基本结构与文案', () => {
        render(<ProcessPanel />)

        expect(screen.getByText('下一处理步骤')).toBeInTheDocument()
        expect(screen.getByText('处理意见')).toBeInTheDocument()
        // 快速意见按钮
        expect(screen.getByText('同意')).toBeInTheDocument()
        expect(screen.getByText('请办理')).toBeInTheDocument()
        expect(screen.getByText('请审核')).toBeInTheDocument()
    })

    it('未选择步骤时点击提交应提示', async () => {
        const toastSpy = vi.spyOn(Antd.Toast, 'show').mockImplementation(() => { })
        render(<ProcessPanel />)

        const submitBtn = screen.getByText('提交')
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(toastSpy).toHaveBeenCalledWith('请选择下一处理步骤')
        })
    })

    it('快速填入意见按钮工作正常', () => {
        render(<ProcessPanel />)

        fireEvent.click(screen.getByText('同意'))
        const opinion = screen.getByPlaceholderText('请输入') as HTMLTextAreaElement
        expect(opinion.value).toBe('同意')
    })
})
