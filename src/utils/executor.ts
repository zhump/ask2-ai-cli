import { spawn } from 'child_process';
import chalk from 'chalk';

export function executeCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue('\nExecuting command:'), chalk.cyan(command));
    console.log(chalk.gray('─'.repeat(50)));
    
    // 根据系统选择合适的 shell，优先使用用户当前的 shell
    const isWindows = process.platform === 'win32';
    let shell: string;
    let shellArgs: string[];
    
    if (isWindows) {
      shell = 'cmd';
      shellArgs = ['/c', command];
    } else {
      // 使用用户当前的 shell，并强制加载配置文件
      shell = process.env.SHELL || '/bin/sh';
      
      if (shell.includes('zsh')) {
        // 对于 zsh，加载 .zshrc 然后执行命令
        shellArgs = ['-c', `source ~/.zshrc 2>/dev/null; ${command}`];
      } else if (shell.includes('bash')) {
        // 对于 bash，加载 .bashrc 然后执行命令
        shellArgs = ['-c', `source ~/.bashrc 2>/dev/null; ${command}`];
      } else {
        // 其他 shell，直接执行
        shellArgs = ['-c', command];
      }
    }
    
    const child = spawn(shell, shellArgs, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      console.log(chalk.gray('─'.repeat(50)));
      if (code === 0) {
        console.log(chalk.green('✅ Command executed successfully'));
      } else {
        console.log(chalk.red(`❌ Command execution failed, exit code: ${code}`));
      }
      resolve();
    });
    
    child.on('error', (error) => {
      console.log(chalk.gray('─'.repeat(50)));
      console.error(chalk.red('❌ Execution error:'), error.message);
      reject(error);
    });
  });
}