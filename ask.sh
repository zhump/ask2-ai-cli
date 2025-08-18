#!/bin/bash

# 构建项目（如果需要）
if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
    echo "🔨 构建项目..."
    pnpm run build
fi

# 运行 ask 命令
node dist/bin/ask.js "$@"