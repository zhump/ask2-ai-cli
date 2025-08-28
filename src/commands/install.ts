import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export async function installCommand(): Promise<void> {
  const homeDir = homedir();
  const shell = process.env.SHELL || '';
  
  let rcFile = '';
  if (shell.includes('zsh')) {
    rcFile = join(homeDir, '.zshrc');
  } else if (shell.includes('bash')) {
    rcFile = join(homeDir, '.bashrc');
  } else {
    console.log(chalk.red('❌ Unsupported shell. Only zsh and bash are supported.'));
    return;
  }

  let functionCode = '';
  
  if (shell.includes('zsh')) {
    functionCode = `
# ============ Ask AI CLI helper function - START ============
askx() {
  local cmd=$(ask --print "$@")
  if [ $? -eq 0 ] && [ -n "$cmd" ]; then
    echo -n "Execute this command? (Enter/n): \\033[36m$cmd\\033[0m " >&2
    read -r response
    if [[ -z "$response" || "$response" =~ ^[Yy]$ ]]; then
      # Add command to zsh history before execution
      print -s "$cmd"
      echo -n "Executing..." >&2
      if eval "$cmd"; then
        echo -e "\\r✅ Command executed successfully and added to history" >&2
      else
        echo -e "\\r❌ Command execution failed                           " >&2
      fi
    else
      echo "Command cancelled." >&2
    fi
  fi
}
# ============ Ask AI CLI helper function - END ============
`;
  } else if (shell.includes('bash')) {
    functionCode = `
# ============ Ask AI CLI helper function - START ============
askx() {
  local cmd=$(ask --print "$@")
  if [ $? -eq 0 ] && [ -n "$cmd" ]; then
    echo -n "Execute this command? (Enter/n): \\033[36m$cmd\\033[0m " >&2
    read -r response
    if [[ -z "$response" || "$response" =~ ^[Yy]$ ]]; then
      # Add command to bash history before execution
      history -s "$cmd"
      echo -n "Executing..." >&2
      if eval "$cmd"; then
        echo -e "\\r✅ Command executed successfully and added to history" >&2
      else
        echo -e "\\r❌ Command execution failed                           " >&2
      fi
    else
      echo "Command cancelled." >&2
    fi
  fi
}
# ============ Ask AI CLI helper function - END ============
`;
  }

  try {
    let content = '';
    if (existsSync(rcFile)) {
      content = readFileSync(rcFile, 'utf8');
    }

    // 检查是否已经安装
    if (content.includes('# ============ Ask AI CLI helper function - START ============')) {
      console.log(chalk.yellow('⚠️  askx function is already installed.'));
      console.log(chalk.gray('To reinstall, run:'), chalk.cyan('ask uninstall && ask install'));
      return;
    }

    // 添加函数到文件末尾
    content += functionCode;
    writeFileSync(rcFile, content);

    console.log(chalk.green('✅ Successfully installed askx function!'));
    console.log(chalk.yellow('\nTo use it:'));
    console.log(chalk.gray('1. Reload your shell:'), chalk.cyan(`source ${rcFile}`));
    console.log(chalk.gray('2. Use askx instead of ask:'), chalk.cyan('askx "your question"'));
    console.log(chalk.gray('\nThe askx command will:'));
    console.log(chalk.gray('  - Get command suggestion from AI'));
    console.log(chalk.gray('  - Ask for your confirmation'));
    console.log(chalk.gray('  - Execute in current shell (with history)'));

  } catch (error) {
    console.error(chalk.red('❌ Failed to install askx function:'), error instanceof Error ? error.message : 'Unknown error');
  }
}
