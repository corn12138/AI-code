#!/usr/bin/env node

/**
 * Vitest 性能测试脚本
 * 用于测试和监控 Vitest 配置的性能表现
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class PerformanceMonitor {
    constructor() {
        this.results = {
            startTime: null,
            endTime: null,
            duration: 0,
            memoryUsage: [],
            cpuUsage: [],
            testResults: null,
        };
    }

    async runPerformanceTest() {
        console.log('🚀 开始 Vitest 性能测试...');

        // 清理缓存和旧结果
        await this.cleanup();

        // 开始监控
        this.startMonitoring();

        // 运行测试
        await this.runTests();

        // 停止监控
        this.stopMonitoring();

        // 生成报告
        await this.generateReport();
    }

    async cleanup() {
        console.log('🧹 清理缓存和旧结果...');

        const dirsToClean = [
            './.vitest-cache',
            './coverage',
            './test-results',
        ];

        for (const dir of dirsToClean) {
            if (fs.existsSync(dir)) {
                await exec(`rm -rf ${dir}`);
            }
        }
    }

    startMonitoring() {
        console.log('📊 开始性能监控...');
        this.results.startTime = Date.now();

        // 监控内存使用
        this.memoryInterval = setInterval(() => {
            const usage = process.memoryUsage();
            this.results.memoryUsage.push({
                timestamp: Date.now(),
                rss: usage.rss,
                heapUsed: usage.heapUsed,
                heapTotal: usage.heapTotal,
                external: usage.external,
            });
        }, 1000);

        // 监控 CPU 使用
        this.cpuInterval = setInterval(() => {
            const cpus = os.cpus();
            const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
            const totalTick = cpus.reduce((acc, cpu) =>
                acc + Object.values(cpu.times).reduce((a, b) => a + b, 0), 0
            );
            const idle = totalIdle / cpus.length;
            const total = totalTick / cpus.length;
            const usage = 100 - ~~(100 * idle / total);

            this.results.cpuUsage.push({
                timestamp: Date.now(),
                usage,
                cores: cpus.length,
            });
        }, 1000);
    }

    async runTests() {
        console.log('🧪 运行测试套件...');

        return new Promise((resolve, reject) => {
            const vitest = spawn('npx', ['vitest', 'run', '--reporter=json'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, NODE_ENV: 'test' },
            });

            let output = '';
            let errorOutput = '';

            vitest.stdout.on('data', (data) => {
                output += data.toString();
                process.stdout.write(data);
            });

            vitest.stderr.on('data', (data) => {
                errorOutput += data.toString();
                process.stderr.write(data);
            });

            vitest.on('close', (code) => {
                this.results.endTime = Date.now();
                this.results.duration = this.results.endTime - this.results.startTime;

                try {
                    this.results.testResults = JSON.parse(output);
                } catch (e) {
                    console.warn('⚠️  无法解析测试结果 JSON');
                }

                if (code === 0) {
                    console.log('✅ 测试完成');
                    resolve();
                } else {
                    console.error('❌ 测试失败');
                    reject(new Error(`测试退出码: ${code}`));
                }
            });
        });
    }

    stopMonitoring() {
        console.log('⏹️  停止性能监控...');

        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
        }

        if (this.cpuInterval) {
            clearInterval(this.cpuInterval);
        }
    }

    async generateReport() {
        console.log('📋 生成性能报告...');

        const report = {
            summary: {
                duration: this.results.duration,
                startTime: new Date(this.results.startTime).toISOString(),
                endTime: new Date(this.results.endTime).toISOString(),
                memoryPeak: Math.max(...this.results.memoryUsage.map(m => m.heapUsed)),
                memoryAverage: this.results.memoryUsage.reduce((acc, m) => acc + m.heapUsed, 0) / this.results.memoryUsage.length,
                cpuAverage: this.results.cpuUsage.reduce((acc, c) => acc + c.usage, 0) / this.results.cpuUsage.length,
            },
            testResults: this.results.testResults,
            systemInfo: {
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
            },
            performance: {
                memoryUsage: this.results.memoryUsage,
                cpuUsage: this.results.cpuUsage,
            },
        };

        // 保存报告
        const reportPath = './test-results/performance-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // 打印摘要
        console.log('\n📊 性能测试摘要:');
        console.log(`⏱️  总耗时: ${(report.summary.duration / 1000).toFixed(2)}s`);
        console.log(`💾 峰值内存: ${(report.summary.memoryPeak / 1024 / 1024).toFixed(2)}MB`);
        console.log(`💾 平均内存: ${(report.summary.memoryAverage / 1024 / 1024).toFixed(2)}MB`);
        console.log(`🖥️  平均 CPU: ${report.summary.cpuAverage.toFixed(2)}%`);

        if (this.results.testResults) {
            console.log(`✅ 测试通过: ${this.results.testResults.numPassedTests || 0}`);
            console.log(`❌ 测试失败: ${this.results.testResults.numFailedTests || 0}`);
            console.log(`📊 测试总数: ${this.results.testResults.numTotalTests || 0}`);
        }

        console.log(`📄 详细报告已保存到: ${reportPath}`);
    }
}

// 运行性能测试
if (require.main === module) {
    const monitor = new PerformanceMonitor();
    monitor.runPerformanceTest().catch(console.error);
}

module.exports = PerformanceMonitor;
