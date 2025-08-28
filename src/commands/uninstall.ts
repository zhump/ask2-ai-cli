import chalk from 'chalk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export async function uninstallCommand(): Promise<void> {
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

  try {
    if (!existsSync(rcFile)) {
      console.log(chalk.yellow('⚠️  RC file not found. Nothing to uninstall.'));
      return;
    }

    let content = readFileSync(rcFile, 'utf8');

    // 检查是否已经安装
    if (!content.includes('# ============ Ask AI CLI helper function - START ============')) {
      console.log(chalk.yellow('⚠️  askx function is not installed.'));
      return;
    }

    // 移除 askx 函数块
    const startMarker = '# ============ Ask AI CLI helper function - START ============';
    const endMarker = '# ============ Ask AI CLI helper function - END ============';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
      // 移除整个函数块（包括前后的空行）
      const beforeFunction = content.substring(0, startIndex);
      const afterFunction = content.substring(endIndex + endMarker.length);
      
      // 清理多余的空行
      content = beforeFunction.trim() + '\n' + afterFunction.trim() + '\n';
      
      writeFileSync(rcFile, content);
      
      console.log(chalk.green('✅ Successfully uninstalled askx function!'));
      console.log(chalk.yellow('\nTo apply changes:'));
      console.log(chalk.gray('1. Reload your shell:'), chalk.cyan(`source ${rcFile}`));
      console.log(chalk.gray('2. Or restart your terminal'));
      console.log(chalk.gray('\nThe askx command will no longer be available.'));
    } else {
      console.log(chalk.red('❌ Could not locate askx function markers for removal.'));
    }

  } catch (error) {
    console.error(chalk.red('❌ Failed to uninstall askx function:'), error instanceof Error ? error.message : 'Unknown error');
  }
}
