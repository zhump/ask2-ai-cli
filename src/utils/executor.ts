import { spawn } from 'child_process';
import chalk from 'chalk';

export function executeCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue('\n执行命令:'), chalk.cyan(command));
    console.log(chalk.gray('─'.repeat(50)));
    
    // 根据系统选择合适的 shell
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : 'sh';
    const shellFlag = isWindows ? '/c' : '-c';
    
    const child = spawn(shell, [shellFlag, command], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      console.log(chalk.gray('─'.repeat(50)));
      if (code === 0) {
        console.log(chalk.green('✅ 命令执行完成'));
      } else {
        console.log(chalk.red(`❌ 命令执行失败，退出码: ${code}`));
      }
      resolve();
    });
    
    child.on('error', (error) => {
      console.log(chalk.gray('─'.repeat(50)));
      console.error(chalk.red('❌ 执行错误:'), error.message);
      reject(error);
    });
  });
}