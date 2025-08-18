# Ask CLI

一个基于 ZhipuAI 的命令行助手，可以将自然语言转换为可执行的命令。

## 功能特性

- 🤖 使用 ZhipuAI GLM-4.5 模型
- 🖥️ 支持 macOS、Linux 和 Windows
- 🔧 智能识别系统环境
- ⚡ TypeScript 编写，类型安全
- 🎯 简单易用的命令行界面

## 安装

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build
```

## 配置

首次使用需要配置 API key：

```bash
node dist/bin/ask.js config
```

或者手动编辑配置文件，添加你的 ZhipuAI API key。

## 使用方法

```bash
# 基本用法
node dist/bin/ask.js "list all files"

# 更多示例
node dist/bin/ask.js "find all typescript files"
node dist/bin/ask.js "check disk usage"
node dist/bin/ask.js "show running processes"
```

### 交互选项

当 AI 生成命令后，你可以选择：

- **回车键** - 立即执行建议的命令
- **N** - 取消执行，退出程序
- **C** - 让 AI 重新生成一个不同的解决方案

### 使用示例

```bash
$ node dist/bin/ask.js "show disk usage"

建议的命令:
df -h

⚠️  请仔细检查命令后再执行!

选择操作:
  回车键 - 执行命令
  N - 退出
  C - 换个答案

请选择 (回车/N/C): [回车]

执行命令: df -h
──────────────────────────────────────────────────
Filesystem      Size   Used  Avail Capacity iused      ifree %iused  Mounted on
/dev/disk3s1s1  460Gi   14Gi  168Gi     8%  553648 1759775352    0%   /
...
──────────────────────────────────────────────────
✅ 命令执行完成
```

## 开发

```bash
# 监听模式编译
npm run dev

# 构建
npm run build
```

## 项目结构

```
src/
├── bin/           # CLI 入口文件
├── commands/      # 命令处理
├── config/        # 配置管理
├── services/      # AI 服务
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数
```

## 注意事项

⚠️ 请在执行 AI 建议的命令前仔细检查，确保命令安全可靠。

## License

MIT