/**
 * 测试性能监控工具
 * 用于监控和优化测试执行性能
 */

export interface TestPerformanceMetrics {
  testName: string;
  duration: number;
  memoryUsage?: number;
  timestamp: number;
}

class TestPerformanceMonitor {
  private metrics: TestPerformanceMetrics[] = [];
  private startTime: number = 0;

  /**
   * 开始监控测试性能
   */
  startMonitoring(testName: string): void {
    this.startTime = performance.now();
    console.log(`🧪 开始测试: ${testName}`);
  }

  /**
   * 结束监控并记录性能指标
   */
  endMonitoring(testName: string): TestPerformanceMetrics {
    const duration = performance.now() - this.startTime;
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;
    
    const metric: TestPerformanceMetrics = {
      testName,
      duration,
      memoryUsage,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    
    // 如果测试时间超过5秒，发出警告
    if (duration > 5000) {
      console.warn(`⚠️  测试执行时间过长: ${testName} (${duration.toFixed(2)}ms)`);
    }

    console.log(`✅ 测试完成: ${testName} (${duration.toFixed(2)}ms)`);
    return metric;
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    totalTests: number;
    averageDuration: number;
    slowestTest: TestPerformanceMetrics | null;
    fastestTest: TestPerformanceMetrics | null;
    totalDuration: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalTests: 0,
        averageDuration: 0,
        slowestTest: null,
        fastestTest: null,
        totalDuration: 0,
      };
    }

    const totalDuration = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageDuration = totalDuration / this.metrics.length;
    
    const slowestTest = this.metrics.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
    
    const fastestTest = this.metrics.reduce((fastest, current) => 
      current.duration < fastest.duration ? current : fastest
    );

    return {
      totalTests: this.metrics.length,
      averageDuration,
      slowestTest,
      fastestTest,
      totalDuration,
    };
  }

  /**
   * 清除性能指标
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 打印性能报告
   */
  printPerformanceReport(): void {
    const report = this.getPerformanceReport();
    
    console.log('\n📊 测试性能报告');
    console.log('='.repeat(50));
    console.log(`总测试数: ${report.totalTests}`);
    console.log(`总执行时间: ${report.totalDuration.toFixed(2)}ms`);
    console.log(`平均执行时间: ${report.averageDuration.toFixed(2)}ms`);
    
    if (report.slowestTest) {
      console.log(`最慢测试: ${report.slowestTest.testName} (${report.slowestTest.duration.toFixed(2)}ms)`);
    }
    
    if (report.fastestTest) {
      console.log(`最快测试: ${report.fastestTest.testName} (${report.fastestTest.duration.toFixed(2)}ms)`);
    }
    
    console.log('='.repeat(50));
  }
}

// 创建全局实例
export const testPerformanceMonitor = new TestPerformanceMonitor();

/**
 * 测试性能装饰器
 */
export function monitorTestPerformance() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      testPerformanceMonitor.startMonitoring(propertyName);
      try {
        const result = await method.apply(this, args);
        testPerformanceMonitor.endMonitoring(propertyName);
        return result;
      } catch (error) {
        testPerformanceMonitor.endMonitoring(propertyName);
        throw error;
      }
    };
  };
}

/**
 * 测试性能包装器
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  testName: string,
  testFunction: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    testPerformanceMonitor.startMonitoring(testName);
    try {
      const result = await testFunction(...args);
      testPerformanceMonitor.endMonitoring(testName);
      return result;
    } catch (error) {
      testPerformanceMonitor.endMonitoring(testName);
      throw error;
    }
  }) as T;
}
