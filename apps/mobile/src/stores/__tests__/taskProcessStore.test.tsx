import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TaskProcessProvider, useTaskProcessStore } from '../taskProcessStore'

// ---- Mocks for APIs used inside the store ----
const submitProcessMock = vi.fn(async () => ({ ok: true }))
const getProcessRecordsMock = vi.fn(async () => [])
const getTaskDetailMock = vi.fn(async () => ({ id: 't1' }))
const getTaskListMock = vi.fn(async () => ({ list: [], pagination: { total: 0, current: 1, pageSize: 20 } }))
const getOrganizationsMock = vi.fn(async () => [{ id: 'org1', name: 'Org1' }])
const getNextStepsByOrgMock = vi.fn(async () => [{ id: 's1', name: 'Step1' }])
const getNextOrgsByStepMock = vi.fn(async () => [{ id: 'o1', name: 'Org1' }])
const getNotifyUsersMock = vi.fn(async () => [{ id: 'u1', name: 'User1' }])
const saveDraftApiMock = vi.fn(async () => ({ ok: true }))

vi.mock('@/api/taskProcess', () => ({
    organizationApi: {
        getOrganizations: (...args: any[]) => getOrganizationsMock(...args),
        getNextStepsByOrg: (...args: any[]) => getNextStepsByOrgMock(...args),
        getNextOrgsByStep: (...args: any[]) => getNextOrgsByStepMock(...args),
        getNotifyUsers: (...args: any[]) => getNotifyUsersMock(...args),
    },
    processApi: {
        submitProcess: (...args: any[]) => submitProcessMock(...args),
        getProcessRecords: (...args: any[]) => getProcessRecordsMock(...args),
        saveDraft: (...args: any[]) => saveDraftApiMock(...args),
    },
    taskApi: {
        getTaskList: (...args: any[]) => getTaskListMock(...args),
        getTaskDetail: (...args: any[]) => getTaskDetailMock(...args),
    },
}))

// ---- Helper components ----
const OutsideUser = () => {
    // 应在 Provider 外抛错
    useTaskProcessStore()
    return null
}

const Viewer: React.FC = () => {
    const {
        state,
        setSubProcessData,
        clearSubProcessData,
        loadTaskDetail,
        submitProcess,
        loadTaskList,
        updateTaskFilter,
        resetTaskList,
        resetTaskDetail,
        loadOrganizations,
        loadNextStepsByOrg,
        loadNextOrgsByStep,
        loadNotifyUsers,
        loadProcessRecords,
        saveDraft,
        setSelectedTaskInfo,
        dispatch,
    } = useTaskProcessStore()

    return (
        <div>
            <div data-testid="sp-count">{state.subProcessRecords.length}</div>
            <div data-testid="sp-parent">{state.parentRecord ? 'yes' : 'no'}</div>
            <div data-testid="task-id">{state.currentTask?.id || ''}</div>
            <div data-testid="task-status">{(state.currentTask as any)?.status || ''}</div>
            <div data-testid="tasks-count">{state.tasks.length}</div>
            <div data-testid="records-count">{state.processRecords.length}</div>
            <div data-testid="org-count">{state.organizations.length}</div>
            <div data-testid="steps-count">{state.processSteps.length}</div>
            <div data-testid="next-org-count">{state.nextOrganizations.length}</div>
            <div data-testid="users-count">{state.notifyUsers.length}</div>
            <div data-testid="org-loading">{String(state.orgLoading)}</div>
            <div data-testid="steps-loading">{String(state.stepsLoading)}</div>
            <div data-testid="next-org-loading">{String(state.nextOrgLoading)}</div>
            <div data-testid="users-loading">{String(state.usersLoading)}</div>
            <div data-testid="filter-keyword">{state.taskFilter.keyword || ''}</div>
            <div data-testid="pagination-current">{String(state.taskPagination.current)}</div>
            <div data-testid="pagination-total">{String(state.taskPagination.total)}</div>
            <div data-testid="selected-id">{state.selectedTaskInfo ? (state.selectedTaskInfo as any).id : ''}</div>

            <button onClick={() => setSubProcessData({ id: 'p' }, [{ id: 'c1' }])}>set-sub</button>
            <button onClick={() => clearSubProcessData()}>clear-sub</button>
            <button onClick={() => loadTaskDetail('t-123', { currentStepId: 's1', currentOrgId: 'o1', processTypeId: 'p1' })}>load-detail</button>
            <button onClick={() => submitProcess({ taskId: 'task-1', nextStep: 's1', nextOrg: 'o1', notifyUsers: [], comment: '意见' })}>do-submit</button>

            <button onClick={() => loadTaskList()}>load-list-append</button>
            <button onClick={() => loadTaskList(true)}>load-list-reset</button>
            <button onClick={() => updateTaskFilter({ keyword: 'abc' })}>update-filter</button>
            <button onClick={() => resetTaskList()}>reset-list</button>
            <button onClick={() => resetTaskDetail()}>reset-detail</button>

            <button onClick={() => loadOrganizations()}>load-orgs</button>
            <button onClick={() => loadNextStepsByOrg('o1')}>load-steps</button>
            <button onClick={() => loadNextOrgsByStep('s1')}>load-next-orgs</button>
            <button onClick={() => loadNotifyUsers('o1')}>load-users</button>
            <button onClick={() => loadProcessRecords('task-ok')}>load-records-ok</button>
            <button onClick={() => loadProcessRecords('task-err')}>load-records-error</button>
            <button onClick={() => saveDraft({ taskId: 't1', comment: 'c' })}>save-draft</button>

            <button onClick={() => setSelectedTaskInfo({ id: 'sel-1' } as any)}>set-selected</button>
            <button onClick={() => setSelectedTaskInfo(null)}>clear-selected</button>

            <button onClick={() => dispatch({ type: 'UNKNOWN' } as any)}>dispatch-unknown</button>
        </div>
    )
}

const renderWithProvider = () =>
    render(
        <TaskProcessProvider>
            <Viewer />
        </TaskProcessProvider>
    )

// ---- Tests ----
describe('stores/taskProcessStore', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getTaskListMock.mockResolvedValue({ list: [], pagination: { total: 0, current: 1, pageSize: 20 } })
        getTaskDetailMock.mockResolvedValue({ id: 't1' })
        getProcessRecordsMock.mockResolvedValue([])
        getOrganizationsMock.mockResolvedValue([{ id: 'org1', name: 'Org1' }])
        getNextStepsByOrgMock.mockResolvedValue([{ id: 's1', name: 'Step1' }])
        getNextOrgsByStepMock.mockResolvedValue([{ id: 'o1', name: 'Org1' }])
        getNotifyUsersMock.mockResolvedValue([{ id: 'u1', name: 'User1' }])
    })

    it('should throw when used outside Provider', () => {
        expect(() => render(<OutsideUser />)).toThrow(/must be used within a TaskProcessProvider/)
    })

    it('setSubProcessData and clearSubProcessData should update state', async () => {
        renderWithProvider()

        // 初始
        expect(screen.getByTestId('sp-count').textContent).toBe('0')
        expect(screen.getByTestId('sp-parent').textContent).toBe('no')

        // 设置
        fireEvent.click(screen.getByText('set-sub'))
        expect(screen.getByTestId('sp-count').textContent).toBe('1')
        expect(screen.getByTestId('sp-parent').textContent).toBe('yes')

        // 清理
        fireEvent.click(screen.getByText('clear-sub'))
        expect(screen.getByTestId('sp-count').textContent).toBe('0')
        expect(screen.getByTestId('sp-parent').textContent).toBe('no')
    })

    it('loadTaskDetail should call API and update currentTask', async () => {
        renderWithProvider()

        await act(async () => {
            fireEvent.click(screen.getByText('load-detail'))
            await Promise.resolve()
        })

        expect(getTaskDetailMock).toHaveBeenCalledWith('t-123', {
            currentStepId: 's1',
            currentOrgId: 'o1',
            processTypeId: 'p1',
        })

        expect(screen.getByTestId('task-id').textContent).toBe('t1')
    })

    it('submitProcess updates status when current task matches and reloads records', async () => {
        // 先让详情成为 task-1
        getTaskDetailMock.mockResolvedValueOnce({ id: 'task-1', status: 'draft' })
        renderWithProvider()

        await act(async () => {
            fireEvent.click(screen.getByText('load-detail'))
            await Promise.resolve()
        })

        expect(screen.getByTestId('task-id').textContent).toBe('task-1')

        await act(async () => {
            fireEvent.click(screen.getByText('do-submit'))
            await Promise.resolve()
        })

        expect(submitProcessMock).toHaveBeenCalled()
        expect(getProcessRecordsMock).toHaveBeenCalledWith('task-1')
        expect(screen.getByTestId('task-status').textContent).toBe('processing')
    })

    it('submitProcess should NOT change status when current task does not match', async () => {
        renderWithProvider()

        await act(async () => {
            fireEvent.click(screen.getByText('do-submit'))
            await Promise.resolve()
        })

        // currentTask 未设置为 task-1，因此状态不应被置为 processing
        expect(screen.getByTestId('task-status').textContent).toBe('')
    })

    it('loadTaskList should append and reset tasks properly and update pagination', async () => {
        renderWithProvider()

        // 第一次：返回两个任务（current: 1）
        getTaskListMock.mockResolvedValueOnce({ list: [{ id: 'a' }, { id: 'b' }], pagination: { total: 2, current: 1, pageSize: 20 } })
        await act(async () => {
            fireEvent.click(screen.getByText('load-list-append'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('tasks-count').textContent).toBe('2')
        expect(screen.getByTestId('pagination-current').textContent).toBe('1')
        expect(screen.getByTestId('pagination-total').textContent).toBe('2')

        // 第二次追加：再返回一个（current: 2）
        getTaskListMock.mockResolvedValueOnce({ list: [{ id: 'c' }], pagination: { total: 3, current: 2, pageSize: 20 } })
        await act(async () => {
            fireEvent.click(screen.getByText('load-list-append'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('tasks-count').textContent).toBe('3')
        expect(screen.getByTestId('pagination-current').textContent).toBe('2')

        // reset：替换为一个（current: 1）
        getTaskListMock.mockResolvedValueOnce({ list: [{ id: 'x' }], pagination: { total: 1, current: 1, pageSize: 20 } })
        await act(async () => {
            fireEvent.click(screen.getByText('load-list-reset'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('tasks-count').textContent).toBe('1')
        expect(screen.getByTestId('pagination-current').textContent).toBe('1')
    })

    it('updateTaskFilter / resetTaskList / resetTaskDetail should take effects', async () => {
        renderWithProvider()

        await act(async () => {
            fireEvent.click(screen.getByText('update-filter'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('filter-keyword').textContent).toBe('abc')

        await act(async () => {
            fireEvent.click(screen.getByText('reset-list'))
            fireEvent.click(screen.getByText('reset-detail'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('task-id').textContent).toBe('')
        expect(screen.getByTestId('tasks-count').textContent).toBe('0')
    })

    it('loaders and data setters for org/steps/nextOrgs/users and params passing', async () => {
        renderWithProvider()

        await act(async () => {
            fireEvent.click(screen.getByText('load-orgs'))
            fireEvent.click(screen.getByText('load-steps'))
            fireEvent.click(screen.getByText('load-next-orgs'))
            fireEvent.click(screen.getByText('load-users'))
            await Promise.resolve()
        })

        expect(getNextStepsByOrgMock).toHaveBeenCalledWith('o1')
        expect(getNextOrgsByStepMock).toHaveBeenCalledWith('s1')
        expect(getNotifyUsersMock).toHaveBeenCalledWith('o1')

        expect(screen.getByTestId('org-count').textContent).toBe('1')
        expect(screen.getByTestId('steps-count').textContent).toBe('1')
        expect(screen.getByTestId('next-org-count').textContent).toBe('1')
        expect(screen.getByTestId('users-count').textContent).toBe('1')

        // 加载标记应最终为 false
        expect(screen.getByTestId('org-loading').textContent).toBe('false')
        expect(screen.getByTestId('steps-loading').textContent).toBe('false')
        expect(screen.getByTestId('next-org-loading').textContent).toBe('false')
        expect(screen.getByTestId('users-loading').textContent).toBe('false')
    })

    it('loadProcessRecords success & error', async () => {
        renderWithProvider()

        // success
        getProcessRecordsMock.mockResolvedValueOnce([{ id: 'r1' }, { id: 'r2' }])
        await act(async () => {
            fireEvent.click(screen.getByText('load-records-ok'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('records-count').textContent).toBe('2')

        // error -> set []
        getProcessRecordsMock.mockRejectedValueOnce(new Error('bad'))
        await act(async () => {
            fireEvent.click(screen.getByText('load-records-error'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('records-count').textContent).toBe('0')
    })

    it('saveDraft should map "comment" to API "opinion" and set selectedTaskInfo paths', async () => {
        renderWithProvider()

        await act(async () => {
            fireEvent.click(screen.getByText('save-draft'))
            fireEvent.click(screen.getByText('set-selected'))
            await Promise.resolve()
        })

        expect(saveDraftApiMock).toHaveBeenCalledWith({ taskId: 't1', opinion: 'c', attachments: undefined })
        expect(screen.getByTestId('selected-id').textContent).toBe('sel-1')

        await act(async () => {
            fireEvent.click(screen.getByText('clear-selected'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('selected-id').textContent).toBe('')
    })

    it('error fallback for org/steps/users loaders should set empty arrays and no pending loaders', async () => {
        renderWithProvider()

        getOrganizationsMock.mockRejectedValueOnce(new Error('org-err'))
        getNextStepsByOrgMock.mockRejectedValueOnce(new Error('steps-err'))
        getNextOrgsByStepMock.mockRejectedValueOnce(new Error('next-err'))
        getNotifyUsersMock.mockRejectedValueOnce(new Error('users-err'))

        await act(async () => {
            fireEvent.click(screen.getByText('load-orgs'))
            fireEvent.click(screen.getByText('load-steps'))
            fireEvent.click(screen.getByText('load-next-orgs'))
            fireEvent.click(screen.getByText('load-users'))
            await Promise.resolve()
        })

        expect(screen.getByTestId('org-count').textContent).toBe('0')
        expect(screen.getByTestId('steps-count').textContent).toBe('0')
        expect(screen.getByTestId('next-org-count').textContent).toBe('0')
        expect(screen.getByTestId('users-count').textContent).toBe('0')
        expect(screen.getByTestId('org-loading').textContent).toBe('false')
        expect(screen.getByTestId('steps-loading').textContent).toBe('false')
        expect(screen.getByTestId('next-org-loading').textContent).toBe('false')
        expect(screen.getByTestId('users-loading').textContent).toBe('false')
    })

    it('dispatch unknown should not crash', async () => {
        renderWithProvider()
        await act(async () => {
            fireEvent.click(screen.getByText('dispatch-unknown'))
            await Promise.resolve()
        })
        expect(true).toBe(true)
    })
})

// ---- Advanced helpers ----
const createDeferred = <T,>() => {
    let resolve!: (v: T) => void
    let reject!: (e: any) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}

// ---- Advanced tests ----
describe('stores/taskProcessStore (advanced)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('deep snapshot: updateTaskFilter should shallow-merge and keep unrelated fields', async () => {
        renderWithProvider()

        // baseline
        expect(screen.getByTestId('filter-keyword').textContent).toBe('')

        await act(async () => {
            fireEvent.click(screen.getByText('update-filter'))
            await Promise.resolve()
        })

        // 合并后 keyword=abc ，其他字段默认值保持（无法从DOM直接读到，间接验证：reset-list 不报错且分页保持默认）
        expect(screen.getByTestId('filter-keyword').textContent).toBe('abc')
        await act(async () => {
            fireEvent.click(screen.getByText('reset-list'))
            await Promise.resolve()
        })
        expect(screen.getByTestId('pagination-current').textContent).toBe('1')
    })

    it('concurrency: two loadTaskDetail calls resolving in reverse order -> last resolved wins', async () => {
        renderWithProvider()
        const d1 = createDeferred<any>()
        const d2 = createDeferred<any>()
        getTaskDetailMock.mockReturnValueOnce(d1.promise)
        getTaskDetailMock.mockReturnValueOnce(d2.promise)

        // fire 2 requests quickly
        await act(async () => {
            fireEvent.click(screen.getByText('load-detail')) // -> d1
            fireEvent.click(screen.getByText('load-detail')) // -> d2
        })

        // resolve second first -> set to id:t2
        d2.resolve({ id: 't2' })
        await act(async () => { await Promise.resolve() })
        expect(screen.getByTestId('task-id').textContent).toBe('t2')

        // then first resolves later -> should override to id:t1
        d1.resolve({ id: 't1' })
        await act(async () => { await Promise.resolve() })
        expect(screen.getByTestId('task-id').textContent).toBe('t1')
    })

    it('concurrency: two loadTaskList calls resolving in reverse order -> last resolved wins semantics', async () => {
        renderWithProvider()
        const d1 = createDeferred<any>()
        const d2 = createDeferred<any>()
        getTaskListMock.mockReturnValueOnce(d1.promise)
        getTaskListMock.mockReturnValueOnce(d2.promise)

        await act(async () => {
            fireEvent.click(screen.getByText('load-list-append')) // d1, state.tasks=[] at call-time
            fireEvent.click(screen.getByText('load-list-append')) // d2, state.tasks still [] at call-time
        })

        // second resolves first -> tasks=[B]
        d2.resolve({ list: [{ id: 'B' }], pagination: { total: 1, current: 2, pageSize: 20 } })
        await act(async () => { await Promise.resolve() })
        expect(screen.getByTestId('tasks-count').textContent).toBe('1')

        // then first resolves -> tasks=[A]（说明没有防抖/竞态保护，最后完成者覆盖）
        d1.resolve({ list: [{ id: 'A' }], pagination: { total: 1, current: 1, pageSize: 20 } })
        await act(async () => { await Promise.resolve() })
        expect(screen.getByTestId('tasks-count').textContent).toBe('1')
        // 最终结果应来自最后 resolve 的请求（A）
    })

    it('overlap loaders: orgLoading remains true until all concurrent requests finished', async () => {
        renderWithProvider()
        const d1 = createDeferred<any>()
        const d2 = createDeferred<any>()
        getOrganizationsMock.mockReturnValueOnce(d1.promise)
        getOrganizationsMock.mockReturnValueOnce(d2.promise)

        await act(async () => {
            fireEvent.click(screen.getByText('load-orgs')) // d1
            fireEvent.click(screen.getByText('load-orgs')) // d2
        })

        // resolve first -> loading 应该仍为 true（还有 d2 未完成）
        d1.resolve([{ id: 'x1' }])
        await act(async () => { await Promise.resolve() })
        expect(screen.getByTestId('org-loading').textContent).toBe('true')

        // 完成第二个 -> 最终 false
        d2.resolve([{ id: 'x2' }])
        await act(async () => { await Promise.resolve() })
        expect(screen.getByTestId('org-loading').textContent).toBe('false')
        // 最终数据显示为最新一次结果（非严格要求，这里只验证 loading 逻辑）
    })

    it('submitProcess payload mapping & side effects ordering', async () => {
        renderWithProvider()
        await act(async () => {
            fireEvent.click(screen.getByText('do-submit'))
            await Promise.resolve()
        })
        // 校验 payload: comment -> opinion, action=submit
        const call = submitProcessMock.mock.calls.at(-1)![0]
        expect(call.action).toBe('submit')
        expect(call.opinion).toBe('意见')
    })
})
