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
- 🔍 调试模式，详细耗时分析
- 📦 智能包管理器检测
- 📋 命令历史记录和日志
- 🛡️ 危险操作高级安全检查
- 📚 命令解释和教育功能
- 🔐 权限提升检测和建议

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

# 获取命令解释
ask --explain "find all typescript files"
ask -e "delete old log files"

# 更多示例
ask "show running processes"
ask "install nodejs using package manager"

# 测试 AI 连接
ask test
ask test --debug

# 查看命令历史
ask log
ask log --limit 10
ask log --clear
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

## 命令说明

### `ask [查询]`
将自然语言转换为可执行命令。

**选项:**
- `-d, --debug` - 启用调试模式，显示详细时间和提示信息
- `-e, --explain` - 提供生成命令的详细解释

**示例:**
```bash
ask "查找所有 .js 文件"
ask --debug "杀死 3000 端口的进程"
ask --explain "删除旧日志文件"
ask -de "安装 nodejs"  # 同时启用调试和解释
```

### `ask config`
显示当前配置和文件路径。展示 API 设置和配置位置。

### `ask test`
测试 AI 接口连通性和配置。

**选项:**
- `-d, --debug` - 显示详细的连接测试信息

**示例:**
```bash
ask test
ask test --debug
```

### `ask log`
显示命令历史和执行日志。

**选项:**
- `--clear` - 清空所有命令历史
- `--limit <数量>` - 限制显示的条目数量

**示例:**
```bash
ask log                # 显示所有历史
ask log --limit 10     # 显示最近 10 条
ask log --clear        # 清空历史
```

## 系统支持

工具会自动检测并适配你的系统：

- **操作系统**: macOS, Linux, Windows, WSL
- **包管理器**: brew, apt, yum, dnf, pacman, winget, choco 等
- **项目类型**: Node.js, Python, Java, Go, Rust, Git 仓库
- **Shell**: bash, zsh, fish, PowerShell, cmd

## 注意事项

⚠️ 请在执行 AI 建议的命令前仔细检查，确保命令安全可靠。

工具内置安全特性：
- 对潜在危险操作的警告
- 执行前的交互式确认
- 调试模式提供透明度
- 命令历史记录便于追溯

## License

MIT

---

[English](./README.md) | **中文文档**