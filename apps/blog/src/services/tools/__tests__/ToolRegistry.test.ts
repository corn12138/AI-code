import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getRecommendedTools,
  getToolDefinitionsForAI,
  getToolUsageStatistics,
  searchTools,
} from '../ToolRegistry'
import { globalToolRegistry } from '../ToolProtocol'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ToolRegistry services', () => {
  it('transforms tool definitions for AI function calling', () => {
    vi.spyOn(globalToolRegistry, 'getToolDefinitions').mockReturnValue([
      {
        name: 'browser_navigate',
        description: 'Navigate to a page',
        category: 'browser',
        parameters: {
          url: {
            type: 'string',
            description: 'Target URL',
            required: true,
            pattern: '^https?://',
          },
          method: {
            type: 'string',
            description: 'HTTP method',
            required: false,
            enum: ['GET', 'POST'],
            default: 'GET',
          },
        },
        security: {
          level: 'restricted',
          permissions: ['browser:read'],
          sandbox: true,
          timeout: 5000,
        },
        examples: [],
      },
    ] as any)

    const definitions = getToolDefinitionsForAI()
    expect(definitions).toEqual([
      {
        type: 'function',
        function: {
          name: 'browser_navigate',
          description: 'Navigate to a page',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'Target URL',
                pattern: '^https?://',
              },
              method: {
                type: 'string',
                description: 'HTTP method',
                enum: ['GET', 'POST'],
                default: 'GET',
              },
            },
            required: ['url'],
          },
        },
      },
    ])
  })

  it('exposes usage statistics with expected keys', () => {
    const stats = getToolUsageStatistics()
    expect(stats).toMatchObject({
      totalExecutions: expect.any(Number),
      successRate: expect.any(Number),
      averageExecutionTime: expect.any(Number),
    })
    expect(stats.toolBreakdown).toHaveProperty('browser_navigate')
    expect(stats.categoryBreakdown).toHaveProperty('browser')
  })

  it('recommends tools based on role and task context', () => {
    const fakeTools = [
      { name: 'browser_navigate', description: 'Browser navigation', category: 'browser' },
      { name: 'file_read', description: 'Read files', category: 'file' },
      { name: 'shell_execute', description: 'Execute shell commands', category: 'shell' },
      { name: 'code_analyze', description: 'Analyze code', category: 'code' },
    ]

    vi.spyOn(globalToolRegistry, 'getAllTools').mockReturnValue(fakeTools as any)

    const developerRecommendations = getRecommendedTools({ userRole: 'developer' })
    expect(developerRecommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'file_read', category: 'file' }),
        expect.objectContaining({ name: 'shell_execute', category: 'shell' }),
        expect.objectContaining({ name: 'code_analyze', category: 'code' }),
      ]),
    )

    const automationRecommendations = getRecommendedTools({ currentTask: 'build automation pipeline' })
    expect(automationRecommendations[0].confidence).toBeGreaterThanOrEqual(automationRecommendations.at(-1)!.confidence)
    expect(automationRecommendations.some(rec => rec.name === 'shell_execute')).toBe(true)
  })

  it('searchTools ranks matches and applies filters', () => {
    const fakeTools = [
      {
        name: 'browser_navigate',
        description: 'Navigate the browser',
        category: 'browser',
        definition_: { security: { level: 'restricted', permissions: ['browser:read'] } },
      },
      {
        name: 'file_read',
        description: 'Read files from disk',
        category: 'file',
        definition_: { security: { level: 'safe', permissions: ['file:read'] } },
      },
      {
        name: 'shell_execute',
        description: 'Execute shell commands safely',
        category: 'shell',
        definition_: { security: { level: 'dangerous', permissions: ['shell:execute'] } },
      },
    ]

    vi.spyOn(globalToolRegistry, 'getAllTools').mockReturnValue(fakeTools as any)

    const results = searchTools('browser')
    expect(results[0].name).toBe('browser_navigate')

    const filtered = searchTools('read', { categories: ['file'], securityLevel: ['safe'] })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('file_read')
  })
})
