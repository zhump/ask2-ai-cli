# Ask CLI

A command-line assistant based on custom AI models that converts natural language into executable commands.

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

Or manually edit the configuration file to add your AI API key.

## Usage

```bash
# Basic usage
ask "list all files"

# Enable debug mode
ask --debug "find all typescript files"
ask -d "check disk usage"

# More examples
ask "show running processes"
ask "install nodejs using package manager"

# Test AI connection
ask test
ask test --debug
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

### Usage Example

```bash
$ ask "show disk usage"

Suggested command:
df -h

⚠️  Please review the command carefully before execution!

Choose action:
  Enter - Execute command
  N - Exit
  C - Change answer

Please choose (Enter/N/C): [Enter]

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
- `-d, --debug` - Enable debug mode

**Examples:**
```bash
ask "find all .js files"
ask --debug "kill process on port 3000"
```

### `ask config`
Open configuration file to set up API key and other settings.

### `ask test`
Test AI API connectivity and configuration.

**Options:**
- `-d, --debug` - Show detailed connection test information

**Examples:**
```bash
ask test
ask test --debug
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
- Warnings for potentially dangerous operations
- Interactive confirmation before execution
- Debug mode for transparency

## License

MIT

---

[中文文档](README.md) | **English Documentation**