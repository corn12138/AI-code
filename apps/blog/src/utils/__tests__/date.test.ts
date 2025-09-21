import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  calculateReadingTime,
  daysBetween,
  formatDate,
  formatDateLocale,
  formatDateToPattern,
  formatRelativeDate,
  getRelativeTimeString,
} from '../date'

const FIXED_NOW = new Date('2024-01-02T00:00:00.000Z')

describe('utils/date', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formatRelativeDate returns relative string in Chinese locale', () => {
    const value = formatRelativeDate('2024-01-01T00:00:00.000Z')
    expect(value).toMatch(/1\s*天前|1\s*天以前/)
  })

  it('formatDate returns formatted date for valid input', () => {
    const formatted = formatDate('2024-01-01T00:00:00.000Z')
    // Intl 在 zh-CN locale 下返回 “2024年1月1日” 形式
    expect(formatted).toBe('2024年1月1日')
  })

  it('formatDate returns fallback for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('无效日期')
    expect(formatDate(null)).toBe('未知时间')
  })

  it('formatDateToPattern formats using custom pattern', () => {
    expect(formatDateToPattern('2024-01-01T12:34:56Z', 'YYYY/MM/DD')).toBe('2024/01/01')
  })

  it('daysBetween calculates difference correctly', () => {
    const diff = daysBetween('2024-01-05', '2024-01-01')
    expect(diff).toBe(4)
  })

  it('formatDateLocale handles client formatting', () => {
    const value = formatDateLocale('2024-01-01T00:00:00.000Z')
    expect(value).toBe('2024年1月1日')
  })

  it('getRelativeTimeString returns bucketed strings', () => {
    expect(getRelativeTimeString('2024-01-01T23:59:30.000Z')).toBe('刚刚')
    expect(getRelativeTimeString('2024-01-01T23:00:00.000Z')).toBe('1小时前')
    expect(getRelativeTimeString('2024-01-01T10:00:00.000Z')).toBe('14小时前')
    expect(getRelativeTimeString('2023-12-31T00:00:00.000Z')).toBe('2天前')
  })

  it('calculateReadingTime estimates reading minutes', () => {
    const article = 'word '.repeat(450) // 450 words => 2.25 minutes => 3 minutes
    expect(calculateReadingTime(article)).toBe('3 分钟阅读')
  })
})
