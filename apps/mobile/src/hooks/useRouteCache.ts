/**
 * 路由缓存管理Hook
 * 用于管理页面间的数据缓存，优化用户体验
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { history } from 'umi'

interface CacheItem<T = any> {
    data: T
    timestamp: number
    ttl: number // 缓存生存时间（毫秒）
    key: string
}

interface RouteCacheOptions {
    defaultTTL?: number // 默认缓存时间，默认5分钟
    maxCacheSize?: number // 最大缓存条目数，默认50
    enableAutoCleanup?: boolean // 是否启用自动清理过期缓存
}

/**
 * 路由缓存Hook
 * 
 * TODO: 数据请求预留接口 - 路由缓存策略分析
 * 
 * 缓存策略说明：
 * 1. 前进导航（列表 -> 详情）：
 *    - 列表数据：保持缓存，用户返回时直接显示
 *    - 详情数据：新请求，确保数据最新
 *    - 筛选状态：保持用户的筛选条件
 * 
 * 2. 后退导航（详情 -> 列表）：
 *    - 列表数据：使用缓存，除非数据已过期
 *    - 滚动位置：恢复用户离开时的位置
 *    - 筛选状态：恢复用户的筛选条件
 * 
 * 3. 刷新操作：
 *    - 强制清除相关缓存
 *    - 重新请求最新数据
 * 
 * 4. 数据更新：
 *    - 提交操作后：清除相关缓存
 *    - 状态变更后：清除相关缓存
 * 
 * 使用场景：
 * - TaskList: 缓存任务列表数据、筛选条件、滚动位置
 * - TaskDetail: 缓存任务详情数据、流程记录
 * - ProcessPanel: 缓存表单数据（草稿功能）
 */
export const useRouteCache = <T = any>(options: RouteCacheOptions = {}) => {
    const {
        defaultTTL = 5 * 60 * 1000, // 5分钟
        maxCacheSize = 50,
        enableAutoCleanup = true
    } = options

    const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map())
    const [cacheKeys, setCacheKeys] = useState<string[]>([])
    const cleanupTimerRef = useRef<NodeJS.Timeout>()

    // 生成缓存key
    const generateCacheKey = useCallback((route: string, params?: Record<string, any>) => {
        if (!params) return route
        const paramStr = Object.entries(params)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('&')
        return `${route}?${paramStr}`
    }, [])

    // 检查缓存是否过期
    const isCacheExpired = useCallback((item: CacheItem<T>) => {
        return Date.now() - item.timestamp > item.ttl
    }, [])

    // 清理过期缓存
    const cleanupExpiredCache = useCallback(() => {
        const cache = cacheRef.current
        const keysToDelete: string[] = []

        cache.forEach((item, key) => {
            if (isCacheExpired(item)) {
                keysToDelete.push(key)
            }
        })

        keysToDelete.forEach(key => {
            cache.delete(key)
        })

        if (keysToDelete.length > 0) {
            setCacheKeys(Array.from(cache.keys()))
        }
    }, [isCacheExpired])

    // 设置缓存
    const setCache = useCallback((
        route: string,
        data: T,
        params?: Record<string, any>,
        customTTL?: number
    ) => {
        const key = generateCacheKey(route, params)
        const cache = cacheRef.current

        // 如果缓存已满，删除最老的条目
        if (cache.size >= maxCacheSize) {
            const oldestKey = cache.keys().next().value
            cache.delete(oldestKey)
        }

        const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            ttl: customTTL || defaultTTL,
            key
        }

        cache.set(key, cacheItem)
        setCacheKeys(Array.from(cache.keys()))

        console.log(`🗄️ 缓存数据: ${key}`, { data, ttl: cacheItem.ttl })
    }, [generateCacheKey, maxCacheSize, defaultTTL])

    // 获取缓存
    const getCache = useCallback((
        route: string,
        params?: Record<string, any>
    ): T | null => {
        const key = generateCacheKey(route, params)
        const cache = cacheRef.current
        const item = cache.get(key)

        if (!item) {
            console.log(`🗄️ 缓存未命中: ${key}`)
            return null
        }

        if (isCacheExpired(item)) {
            cache.delete(key)
            setCacheKeys(Array.from(cache.keys()))
            console.log(`🗄️ 缓存已过期: ${key}`)
            return null
        }

        console.log(`🗄️ 缓存命中: ${key}`, item.data)
        return item.data
    }, [generateCacheKey, isCacheExpired])

    // 删除特定缓存
    const removeCache = useCallback((
        route: string,
        params?: Record<string, any>
    ) => {
        const key = generateCacheKey(route, params)
        const cache = cacheRef.current

        if (cache.has(key)) {
            cache.delete(key)
            setCacheKeys(Array.from(cache.keys()))
            console.log(`🗄️ 删除缓存: ${key}`)
        }
    }, [generateCacheKey])

    // 清除所有缓存
    const clearAllCache = useCallback(() => {
        cacheRef.current.clear()
        setCacheKeys([])
        console.log('🗄️ 清除所有缓存')
    }, [])

    // 清除匹配模式的缓存
    const clearCacheByPattern = useCallback((pattern: string | RegExp) => {
        const cache = cacheRef.current
        const keysToDelete: string[] = []

        cache.forEach((_, key) => {
            const matches = typeof pattern === 'string'
                ? key.includes(pattern)
                : pattern.test(key)

            if (matches) {
                keysToDelete.push(key)
            }
        })

        keysToDelete.forEach(key => {
            cache.delete(key)
        })

        if (keysToDelete.length > 0) {
            setCacheKeys(Array.from(cache.keys()))
            console.log(`🗄️ 清除匹配缓存: ${pattern}`, keysToDelete)
        }
    }, [])

    // 获取缓存统计信息
    const getCacheStats = useCallback(() => {
        const cache = cacheRef.current
        let expiredCount = 0
        let totalSize = 0

        cache.forEach(item => {
            if (isCacheExpired(item)) {
                expiredCount++
            }
            totalSize += JSON.stringify(item.data).length
        })

        return {
            total: cache.size,
            expired: expiredCount,
            active: cache.size - expiredCount,
            totalSizeKB: Math.round(totalSize / 1024),
            keys: Array.from(cache.keys())
        }
    }, [isCacheExpired])

    // 路由变化时的缓存处理
    const handleRouteChange = useCallback((action: 'push' | 'pop' | 'replace', location: any) => {
        console.log(`🧭 路由变化: ${action}`, location)

        // 根据路由变化类型决定缓存策略
        switch (action) {
            case 'push':
                // 前进导航，保持当前页面缓存
                console.log('🧭 前进导航，保持缓存')
                break
            case 'pop':
                // 后退导航，清理不必要的缓存
                console.log('🧭 后退导航，清理缓存')
                cleanupExpiredCache()
                break
            case 'replace':
                // 替换导航，清理当前页面缓存
                console.log('🧭 替换导航，清理当前页面缓存')
                if (location?.pathname) {
                    clearCacheByPattern(location.pathname)
                }
                break
        }
    }, [cleanupExpiredCache, clearCacheByPattern])

    // 监听路由变化
    useEffect(() => {
        const unlisten = history.listen(({ location, action }) => {
            handleRouteChange(action.toLowerCase() as any, location)
        })

        return unlisten
    }, [handleRouteChange])

    // 自动清理过期缓存
    useEffect(() => {
        if (enableAutoCleanup) {
            cleanupTimerRef.current = setInterval(cleanupExpiredCache, 60000) // 每分钟清理一次

            return () => {
                if (cleanupTimerRef.current) {
                    clearInterval(cleanupTimerRef.current)
                }
            }
        }
    }, [enableAutoCleanup, cleanupExpiredCache])

    return {
        // 基础操作
        setCache,
        getCache,
        removeCache,
        clearAllCache,
        clearCacheByPattern,

        // 工具方法
        getCacheStats,
        cleanupExpiredCache,

        // 状态
        cacheKeys,

        // 路由处理
        handleRouteChange
    }
}

/**
 * 任务列表专用缓存Hook
 */
export const useTaskListCache = () => {
    const routeCache = useRouteCache<{
        tasks: any[]
        pagination: any
        filters: any
        scrollPosition: number
        selectedTab: string
    }>({
        defaultTTL: 3 * 60 * 1000, // 任务列表缓存3分钟
    })

    const CACHE_KEY = '/task-process'

    const cacheListData = useCallback((data: {
        tasks: any[]
        pagination: any
        filters: any
        scrollPosition?: number
        selectedTab?: string
    }) => {
        const cacheData = {
            tasks: data.tasks,
            pagination: data.pagination,
            filters: data.filters,
            scrollPosition: data.scrollPosition || 0,
            selectedTab: data.selectedTab || 'all'
        }
        routeCache.setCache(CACHE_KEY, cacheData)
    }, [routeCache])

    const getCachedListData = useCallback(() => {
        return routeCache.getCache(CACHE_KEY)
    }, [routeCache])

    const clearListCache = useCallback(() => {
        routeCache.removeCache(CACHE_KEY)
    }, [routeCache])

    return {
        cacheListData,
        getCachedListData,
        clearListCache,
        ...routeCache
    }
}

/**
 * 任务详情专用缓存Hook
 */
export const useTaskDetailCache = () => {
    const routeCache = useRouteCache<{
        task: any
        processRecords: any[]
        formData?: any
    }>({
        defaultTTL: 2 * 60 * 1000, // 任务详情缓存2分钟
    })

    const cacheDetailData = useCallback((taskId: string, data: {
        task: any
        processRecords: any[]
        formData?: any
    }) => {
        const cacheKey = `/task-process/detail/${taskId}`
        routeCache.setCache(cacheKey, data)
    }, [routeCache])

    const getCachedDetailData = useCallback((taskId: string) => {
        const cacheKey = `/task-process/detail/${taskId}`
        return routeCache.getCache(cacheKey)
    }, [routeCache])

    const clearDetailCache = useCallback((taskId?: string) => {
        if (taskId) {
            const cacheKey = `/task-process/detail/${taskId}`
            routeCache.removeCache(cacheKey)
        } else {
            routeCache.clearCacheByPattern('/task-process/detail/')
        }
    }, [routeCache])

    return {
        cacheDetailData,
        getCachedDetailData,
        clearDetailCache,
        ...routeCache
    }
}

export default useRouteCache
