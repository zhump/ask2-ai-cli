# Ask CLI

一个基于 自定义AI模型 的命令行助手，可以将自然语言转换为可执行的命令。

## 仓库地址

🔗 GitHub: [https://github.com/zhump/ask2-ai-cli](https://github.com/zhump/ask2-ai-cli)

## 功能特性

- 🤖 使用自定义AI模型
- 🖥️ 支持 macOS、Linux 和 Windows
- 🔧 智能识别系统环境
- ⚡ TypeScript 编写，类型安全
- 🎯 简单易用的命令行界面

## 安装

```bash
# 安装依赖
npm install ask2-ai-cli -g
```

## 配置

首次使用需要配置 API key：

```bash
 ask config
```

或者手动编辑配置文件，添加你的 AI API key。

## 使用方法

```bash
# 基本用法
 ask "list all files"

# 更多示例
 ask "find all typescript files"
 ask "check disk usage"
 ask "show running processes"
```

### 交互选项

当 AI 生成命令后，你可以选择：

- **回车键** - 立即执行建议的命令
- **N** - 取消执行，退出程序
- **C** - 让 AI 重新生成一个不同的解决方案

### 使用示例

```bash
$ ask "show disk usage"

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

## 注意事项

⚠️ 请在执行 AI 建议的命令前仔细检查，确保命令安全可靠。

## License

MIT