import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProcessRecord from '../TaskProcess/TaskDetail/components/ProcessRecord'

// 直接 mock umi
const pushMock = vi.fn()
vi.mock('umi', () => ({ history: { push: (...args: any[]) => pushMock(...args) } }))

// mock store
const setSubProcessData = vi.fn()
vi.mock('@/stores/taskProcessStore', () => ({
    useTaskProcessStore: () => ({ setSubProcessData }),
}))

// mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
    },
})

describe('TaskProcess - ProcessRecord', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('应渲染当前步骤与时间线', () => {
        render(<ProcessRecord taskId="t-1" />)

        expect(screen.getByText('当前处理步骤：')).toBeInTheDocument()
        expect(screen.getByText('部门审核')).toBeInTheDocument()
        expect(screen.getByText('审核（会办）')).toBeInTheDocument()
    })

    it('点击“会办记录”应跳转子流程页面', () => {
        render(<ProcessRecord taskId="t-1" />)

        const links = screen.getAllByText('会办记录')
        fireEvent.click(links[0])

        expect(setSubProcessData).toHaveBeenCalled()
        expect(pushMock).toHaveBeenCalled()
    })

    it('复制意见按钮可用', async () => {
        render(<ProcessRecord taskId="t-1" />)

        const copyBtns = screen.getAllByText('📋')
        fireEvent.click(copyBtns[0])

        expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
})
