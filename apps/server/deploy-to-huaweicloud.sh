#!/bin/bash

# 显示执行的命令
set -x

# 设置环境变量
export NODE_ENV=production

# 使用环境变量
echo "正在连接到华为云数据库..."

# 运行迁移前检查数据库连接
echo "检查数据库连接..."
npx ts-node -r tsconfig-paths/register ./src/scripts/check-db-connection.ts

# 如果连接检查成功，则运行迁移
if [ $? -eq 0 ]; then
    echo "数据库连接成功，开始迁移..."
    
    # 运行迁移
    npm run migration:run
    
    # 如果迁移成功，则填充种子数据
    if [ $? -eq 0 ]; then
        echo "迁移成功，开始填充种子数据..."
        npm run db:seed
        
        echo "数据库设置完成！"
    else
        echo "迁移失败，请检查迁移文件和数据库配置"
        exit 1
    fi
else
    echo "数据库连接失败，请检查数据库配置"
    exit 1
fi
