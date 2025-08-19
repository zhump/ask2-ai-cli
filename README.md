**English** | [中文文档](https://github.com/zhump/ask2-ai-cli/blob/main/README.zh.md)

# Ask CLI

A command-line assistant based on custom AI models that converts natural language into executable commands.

# DEMO
![Demo GIF](https://636c-cloudbase-9g52ks1b1d834b1a-1364764776.tcb.qcloud.la/case.gif)

## Repository

🔗 GitHub: [https://github.com/zhump/ask2-ai-cli](https://github.com/zhump/ask2-ai-cli)

## Features

- 🤖 Custom AI model support
- 🖥️ Cross-platform support (macOS, Linux, Windows)
- 🔧 Intelligent system environment detection
- ⚡ TypeScript implementation with type safety
- 🎯 Simple and intuitive command-line interface
- 🔍 Debug mode with detailed timing analysis
- 📦 Smart package manager detection
- 📋 Command history and logging
- 🛡️ Advanced safety checks for dangerous operations
- 📚 Command explanation and educational features
- 🔐 Privilege escalation detection and suggestions

## Installation

```bash
# Install globally
npm install ask2-ai-cli -g
```

## Configuration

Configure your API key on first use:

```bash
ask config
```

Based on the configuration file path printed out by the config command, manually edit the configuration file to add your AI API key.

```json
{
  "apiKey": "your-api-key-here",
  "apiUrl": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  "model": "glm-4.5",
  "temperature": 0.6
}
```

Run `ask test` to verify whether the configuration has taken effect.

## Usage

```bash
# Basic usage
ask "list all files"

# Enable debug mode
ask --debug "find all typescript files"
ask -d "check disk usage"

# Get command explanation
ask --explain "find all typescript files"
ask -e "delete old log files"

# More examples
ask "show running processes"
ask "install nodejs using package manager"

# Test AI connection
ask test
ask test --debug

# View command history
ask log
ask log --limit 10
ask log --clear
```

### Debug Mode

Use `--debug` or `-d` flag to enable debug mode and see:

- 📝 Complete prompt sent to AI
- 🤖 Raw AI response
- ⏱️ Detailed timing statistics for each stage

```bash
ask --debug "show disk usage"

🔧 [DEBUG] Starting stage: initialization
🔧 [DEBUG] Starting stage: get system info
✅ [DEBUG] Completed stage: get system info (2ms)
🔧 [DEBUG] Starting stage: build prompt
✅ [DEBUG] Completed stage: build prompt (1ms)

📝 [DEBUG] Prompt sent to AI:
────────────────────────────────────────────────────────────
You are a command-line assistant. Convert natural language to executable commands.
...
────────────────────────────────────────────────────────────

📊 [DEBUG] Execution timing statistics:
────────────────────────────────────
  get system info: 2ms (0.1%)
  build prompt: 1ms (0.1%)
  AI generate command: 1250ms (85.2%)
  display result: 1ms (0.1%)
  wait user choice: 180ms (12.3%)
  execute command: 32ms (2.2%)
────────────────────────────────────
  Total time: 1466ms
```

### Interactive Options

After AI generates a command, you can choose:

- **Enter** - Execute the suggested command immediately
- **N** - Cancel execution and exit
- **C** - Let AI regenerate a different solution
- **E** - Get detailed explanation of the command

### Safety Features

The tool includes advanced safety mechanisms:

- **🛡️ Dangerous Operation Detection**: Automatically detects potentially harmful commands (rm -rf, dd, etc.)
- **🔒 Double Confirmation**: Requires explicit confirmation for dangerous operations
- **👑 Privilege Detection**: Warns when commands need elevated privileges and suggests proper escalation
- **📚 Command Education**: Provides detailed explanations to help users understand what commands do

### Usage Example

```bash
$ ask "show disk usage"

Suggested command:
df -h

⚠️  Please review the command carefully before execution!

⚠️  This command may require elevated privileges.
Consider using: sudo df -h

Choose action:
  Enter - Execute command
  N - Exit
  C - Change answer
  E - Explain command

Please choose (Enter/N/C/E): [Enter]

Executing command: df -h
──────────────────────────────────────────────────
Filesystem      Size   Used  Avail Capacity iused      ifree %iused  Mounted on
/dev/disk3s1s1  460Gi   14Gi  168Gi     8%  553648 1759775352    0%   /
...
──────────────────────────────────────────────────
✅ Command executed successfully
```

## Commands

### `ask [query]`
Convert natural language to executable commands.

**Options:**
- `-d, --debug` - Enable debug mode with detailed timing and prompt info
- `-e, --explain` - Provide detailed explanation of the generated command

**Examples:**
```bash
ask "find all .js files"
ask --debug "kill process on port 3000"
ask --explain "delete old log files"
ask -de "install nodejs"  # Both debug and explain
```

### `ask config`
Display current configuration and file path. Shows API settings and configuration location.

### `ask test`
Test AI API connectivity and configuration.

**Options:**
- `-d, --debug` - Show detailed connection test information

**Examples:**
```bash
ask test
ask test --debug
```

### `ask log`
Show command history and execution logs.

**Options:**
- `--clear` - Clear all command history
- `--limit <number>` - Limit number of entries to show

**Examples:**
```bash
ask log                # Show all history
ask log --limit 10     # Show last 10 entries
ask log --clear        # Clear history
```

## System Support

The tool automatically detects and adapts to your system:

- **Operating Systems**: macOS, Linux, Windows, WSL
- **Package Managers**: brew, apt, yum, dnf, pacman, winget, choco, etc.
- **Project Types**: Node.js, Python, Java, Go, Rust, Git repositories
- **Shells**: bash, zsh, fish, PowerShell, cmd

## Safety Notes

⚠️ Always review AI-suggested commands before execution to ensure they are safe and appropriate.

The tool includes built-in safety features:
- **Dangerous Command Detection**: Identifies potentially harmful operations
- **Double Confirmation**: Requires "YES I AM SURE" for dangerous commands
- **Privilege Escalation Warnings**: Suggests sudo/admin when needed
- **Interactive Confirmation**: Always asks before execution
- **Command Explanations**: Educational features to understand commands
- **Debug Mode Transparency**: Full visibility into AI decision-making
- **Command History**: Complete audit trail for accountability

## License

MIT

