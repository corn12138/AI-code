import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as net from 'net';
import * as path from 'path';

// 加载环境变量
const envPath = process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env.prod')
    : path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

const logger = new Logger('SSH-Tunnel');

// 检查隧道端口是否开放
function checkTunnelPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        // 设置超时时间
        socket.setTimeout(5000);

        // 监听连接成功事件
        socket.on('connect', () => {
            logger.log(`端口 ${port} 连接成功，SSH隧道正常工作`);
            socket.destroy();
            resolve(true);
        });

        // 监听错误事件
        socket.on('error', (err) => {
            logger.error(`端口 ${port} 连接失败: ${err.message}`);
            resolve(false);
        });

        // 监听超时事件
        socket.on('timeout', () => {
            logger.error(`端口 ${port} 连接超时`);
            socket.destroy();
            resolve(false);
        });

        // 尝试连接
        socket.connect(port, 'localhost');
    });
}

async function main() {
    const tunnelPort = parseInt(process.env.DATABASE_PORT || '6543', 10);

    logger.log(`检查PostgreSQL SSH隧道 (localhost:${tunnelPort})...`);

    const isConnected = await checkTunnelPort(tunnelPort);

    if (!isConnected) {
        logger.error(`
=====================================
SSH隧道连接失败!
请确保您的Termius SSH隧道已经正确设置并运行。
步骤:
1. 打开Termius
2. 确认远程SSH连接已建立
3. 检查本地端口${tunnelPort}是否正确转发到远程${tunnelPort}端口
4. 重启应用程序
=====================================
`);
        process.exit(1);
    }

    logger.log('SSH隧道检查完成，连接正常');
    process.exit(0);
}

main();
