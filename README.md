**English** | [中文文档](https://github.com/zhump/ask2-ai-cli/blob/main/README.zh.md)

# Ask CLI

A powerful command-line assistant that converts natural language into executable commands using AI. Features multiple model management, intelligent switching, and comprehensive safety checks.

![Demo GIF](https://636c-cloudbase-9g52ks1b1d834b1a-1364764776.tcb.qcloud.la/case.gif)

## 🔗 Repository

GitHub: [https://github.com/zhump/ask2-ai-cli](https://github.com/zhump/ask2-ai-cli)

## ✨ Key Features

### 🎯 Multiple AI Model Support
- **Configure multiple AI models** with different settings (temperature, API endpoints)
- **Easy switching** between models with simple commands
- **Smart model management** with visual status indicators
- **Automatic upgrade** from single-model to multi-model configurations

### 🛡️ Advanced Safety
- **Dangerous command detection** with double confirmation
- **Privilege escalation warnings** and suggestions
- **Interactive confirmation** before command execution
- **Command explanations** for educational purposes

### � Developer-Friendly
- **Debug mode** with detailed timing and prompt visibility
- **Command history** with execution tracking
- **Cross-platform support** (macOS, Linux, Windows, WSL)
- **Smart environment detection** (shells, package managers, project types)

## 🚀 Installation

```bash
npm install ask2-ai-cli -g
```

## ⚙️ Configuration

### Initial Setup
```bash
ask config
```
This shows your configuration file path. Edit the file to add your API configuration:

### Configuration Format
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
      "name": "glm-4.5",
      "apiKey": "your-api-key-here",
      "apiUrl": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      "model": "glm-4.5",
      "temperature": 0.3,
      "enabled": false
    }
  ]
}
```
> Recommend using openrouter's free model API and your internal model API to avoid information leakage and enhance security.


### Test Your Setup
```bash
ask test
```

## 📖 Usage

### Basic Commands
```bash
# Generate and execute commands
ask list all files
ask find large files over 100MB
ask kill process on port 3000

# Model management
ask ls                     # List all models
ask use qwen3    # Switch models
ask config                 # View configuration

# Advanced options
ask --debug complex query       # Debug mode
ask --explain rm -rf folder     # Get explanations
```

### Model Management Workflow

**1. List Available Models**
```bash
ask ls
```
```
📋 Available Models
──────────────────────────────────────────────────
✅ GLM-4.5 Main
   Model: glm-4.5 | Temperature: 0.3 | API: open.bigmodel.cn
⚪ Creative Mode  
   Model: glm-4.5 | Temperature: 0.8 | API: open.bigmodel.cn
──────────────────────────────────────────────────
🎯 Current: GLM-4.5 Main
```

**2. Switch Models**
```bash
ask use qwen3
```
```
✅ Successfully switched to model 'Creative Mode'

📋 Active model details:
──────────────────────────────
  Name: Creative Mode
  Model: qwen3
  Temperature: 0.3
```


### Interactive Command Flow

When Ask generates a command, you can:

- **Enter** → Execute immediately
- **N** → Cancel and exit  
- **C** → Generate different solution
- **E** → Get detailed explanation

```bash
$ ask check disk space

Suggested command:
df -h

⚠️  Please review the command carefully before execution!

Choose action:
  Enter - Execute command
  N - Exit
  C - Change answer
  E - Explain command

Please choose (Enter/N/C/E): [E]

📚 Command Explanation
──────────────────────────────────────────────────
Command: df -h

Explanation:
• df: Display filesystem disk space usage
• -h: Human-readable format (KB, MB, GB instead of bytes)
• Shows available space, used space, and mount points
• Safe read-only operation with no system changes
```

## 🔧 Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `ask [query]` | Convert natural language to commands | `ask install docker` |
| `ask ls` | List all model configurations | `ask ls` |
| `ask use <name>` | Switch to specific model | `ask use "Creative Mode"` |
| `ask config` | Show configuration file path and content | `ask config` |
| `ask test` | Test AI connectivity | `ask test --debug` |
| `ask log` | View command history | `ask log --limit 10` |

### Command Options

**Global Options:**
- `--debug, -d` → Enable debug mode with timing info
- `--explain, -e` → Get command explanations

**Log Options:**
- `--clear` → Clear command history
- `--limit <n>` → Show last N entries

## 🛡️ Safety Features

### Dangerous Command Protection
```bash
$ ask "delete all files in current directory"

⚠️  DANGEROUS OPERATION DETECTED!
This command may cause irreversible damage to your system:
rm -rf *

Are you absolutely sure you want to execute this command?

Press Enter to confirm explicitly (anything else will cancel): [Cancel]

✅ Operation cancelled for safety.
```

### Privilege Escalation Detection
```bash
$ ask "install nginx"

Suggested command:
apt install nginx

⚠️  This command may require elevated privileges.
Consider using: sudo apt install nginx
```

## 🌍 System Support

**Operating Systems:** macOS, Linux, Windows, WSL  
**Package Managers:** brew, apt, yum, dnf, pacman, winget, choco  
**Project Types:** Node.js, Python, Java, Go, Rust, Git repositories  
**Shells:** bash, zsh, fish, PowerShell, cmd  

## 📝 License

MIT

