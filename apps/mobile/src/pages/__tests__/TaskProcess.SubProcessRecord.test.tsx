import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SubProcessRecord from '../TaskProcess/SubProcessRecord'

// mock store with sample data
const mockState = {
    parentRecord: { id: '1', step: '审核（会办）' },
    subProcessRecords: [
        {
            id: '1-1',
            step: '会办（提交会办结果）',
            handler: { name: '张三', userId: '1001', department: '技术部', time: '2023-08-15 16:39:20' },
            opinion: '请审核',
        },
    ],
}

vi.mock('@/stores/taskProcessStore', () => ({
    useTaskProcessStore: () => ({
        state: mockState,
        clearSubProcessData: vi.fn(),
    }),
}))

// mock umi
vi.mock('umi', () => ({
    history: { back: vi.fn() },
    useParams: () => ({ id: '1' }),
}))

describe('TaskProcess - SubProcessRecord', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('应渲染“会办记录”标题与时间线条目', () => {
        render(<SubProcessRecord />)

        const titles = screen.getAllByText('会办记录')
        expect(titles.length).toBeGreaterThan(0)
        expect(screen.getByText('会办（提交会办结果）')).toBeInTheDocument()
    })
})
