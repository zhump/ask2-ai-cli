# Ask CLI

基于AI的强大命令行助手，将自然语言转换为可执行命令。支持多模型管理、智能切换和全面的安全检查。

![Demo GIF](https://636c-cloudbase-9g52ks1b1d834b1a-1364764776.tcb.qcloud.la/case.gif)

## 🔗 仓库地址

GitHub: [https://github.com/zhump/ask2-ai-cli](https://github.com/zhump/ask2-ai-cli)

## ✨ 核心特性

### 🎯 多AI模型支持
- **配置多个AI模型**，支持不同设置（温度参数、API端点）
- **简单切换模型**，使用简单命令即可
- **智能模型管理**，带有可视化状态指示器


### 🛡️ 高级安全保护
- **危险命令检测**，双重确认机制
- **权限提升警告**和建议
- **交互式确认**，执行前人工审核
- **命令解释**，教育性功能

### 🔧 开发者友好
- **调试模式**，详细时间统计和提示词可见性
- **命令历史记录**，执行跟踪
- **跨平台支持**（macOS、Linux、Windows、WSL）
- **智能环境检测**（Shell、包管理器、项目类型）

## 🚀 安装

```bash
npm install ask2-ai-cli -g
```

## ⚙️ 配置

### 初始设置
```bash
ask config
```
显示配置文件路径，编辑文件添加API配置：

### 配置格式
```json
{
  "models": [
    {
      "name": "moonshotai/kimi-k2:free",
      "apiKey": "your-api-key-here",
      "apiUrl": "https://openrouter.ai/api/v1/chat/completions",
      "model": "moonshotai/kimi-k2:free",
      "temperature": 0.3,
      "enabled": true
    },
    {
      "name": "Creative Mode",
      "apiKey": "your-api-key-here",
      "apiUrl": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      "model": "glm-4.5",
      "temperature": 0.3,
      "enabled": false
    }
  ]
}
```
> 推荐使用openrouter免费的模型API和您内网的模型API，避免信息泄漏，增强安全性。

### 测试配置
```bash
ask test
```

## 📖 使用方法

### 基本命令
```bash
# 生成并执行命令
ask 列出所有文件
ask 查找大于100MB的大文件
ask 杀死3000端口的进程

# 模型管理
ask ls                     # 列出所有模型
ask use xxx                # 切换模型
ask config                 # 查看配置

# 高级选项
ask --debug "复杂查询"      # 调试模式
ask --explain "rm -rf 文件夹" # 获取解释
```

### 模型管理工作流

**1. 列出可用模型**
```bash
ask ls
```
```
📋 Available Models
──────────────────────────────────────────────────
✅ GLM-4.5 主要
   Model: glm-4.5 | Temperature: 0.3 | API: open.bigmodel.cn
⚪ 创意模式  
   Model: glm-4.5 | Temperature: 0.8 | API: open.bigmodel.cn
──────────────────────────────────────────────────
🎯 Current: GLM-4.5 主要
```

**2. 切换模型**
```bash
ask use qwen3
```
```
✅ Successfully switched to model qwen3

📋 Active model details:
──────────────────────────────
  Name: qwen3
  Model: qwen3
  Temperature: 0.8
```

### 交互式命令流程

Ask生成命令后，你可以选择：

- **回车** → 立即执行
- **N** → 取消并退出  
- **C** → 生成不同解决方案
- **E** → 获取详细解释

```bash
$ ask 检查磁盘空间

建议的命令:
df -h

⚠️  请仔细检查命令后再执行!

选择操作:
  回车 - 执行命令
  N - 退出
  C - 换个答案
  E - 解释命令

请选择 (回车/N/C/E): [E]

📚 命令解释
──────────────────────────────────────────────────
命令: df -h

解释:
• df: 显示文件系统磁盘空间使用情况
• -h: 人类可读格式（KB、MB、GB而不是字节）
• 显示可用空间、已用空间和挂载点
• 安全的只读操作，不会改变系统
```

## 🔧 命令参考

| 命令 | 描述 | 示例 |
|------|------|------|
| `ask [查询]` | 将自然语言转换为命令，无需双引号 | `ask 安装docker` |
| `ask ls` | 列出所有模型配置 | `ask ls` |
| `ask use <名称>` | 切换到指定模型 | `ask use "创意模式"` |
| `ask config` | 显示配置文件路径和内容 | `ask config` |
| `ask test` | 测试AI连接 | `ask test --debug` |
| `ask log` | 查看命令历史 | `ask log --limit 10` |

### 命令选项

**全局选项:**
- `--debug, -d` → 启用带时间信息的调试模式
- `--explain, -e` → 获取命令解释

**日志选项:**
- `--clear` → 清除命令历史
- `--limit <n>` → 显示最近N条记录

## 🛡️ 安全特性

### 危险命令保护
```bash
$ ask 删除当前目录下的所有文件

⚠️  检测到危险操作！
此命令可能对您的系统造成不可逆的损害:
rm -rf *

您确定要执行此命令吗？

按回车键明确确认（其他任何输入将取消）: [取消]

✅ 为安全起见，操作已取消。
```

### 权限提升检测
```bash
$ ask 安装nginx

建议的命令:
apt install nginx

⚠️  此命令可能需要提升权限。
建议使用: sudo apt install nginx
```


## 🌍 系统支持

**操作系统:** macOS、Linux、Windows、WSL  
**包管理器:** brew、apt、yum、dnf、pacman、winget、choco  
**项目类型:** Node.js、Python、Java、Go、Rust、Git仓库  
**Shell:** bash、zsh、fish、PowerShell、cmd  

## 📝 许可证

MIT
