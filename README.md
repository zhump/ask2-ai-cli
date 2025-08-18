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

# 启用调试模式
ask --debug "find all typescript files"
ask -d "check disk usage"

# 更多示例
ask "show running processes"
ask "install nodejs using package manager"
```

### 调试模式

使用 `--debug` 或 `-d` 参数启用调试模式，可以查看：

- 📝 发送给 AI 的完整提示词
- 🤖 AI 的原始响应
- ⏱️ 各阶段详细耗时统计

```bash
ask --debug "show disk usage"

🔧 [DEBUG] 开始阶段: 初始化
🔧 [DEBUG] 开始阶段: 获取系统信息
✅ [DEBUG] 完成阶段: 获取系统信息 (2ms)
🔧 [DEBUG] 开始阶段: 构建提示词
✅ [DEBUG] 完成阶段: 构建提示词 (1ms)

📝 [DEBUG] 发送给 AI 的提示词:
────────────────────────────────────────────────────────────
你是一个命令行助手。将自然语言转换为可执行的命令。
...
────────────────────────────────────────────────────────────

📊 [DEBUG] 执行耗时统计:
────────────────────────────────────
  获取系统信息: 2ms (0.1%)
  构建提示词: 1ms (0.1%)
  AI 生成命令: 1250ms (85.2%)
  显示结果: 1ms (0.1%)
  等待用户选择: 180ms (12.3%)
  执行命令: 32ms (2.2%)
────────────────────────────────────
  总耗时: 1466ms
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