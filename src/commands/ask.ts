import chalk from 'chalk';
import ora from 'ora';
import { getSystemInfo, buildPrompt } from '../utils/system.js';
import { askUserChoice } from '../utils/input.js';
import { executeCommand } from '../utils/executor.js';
import aiService from '../services/ai.js';

export async function askCommand(query: string): Promise<void> {
  let currentCommand = '';
  let attempts = 0;
  const maxAttempts = 5; // 防止无限循环
  
  while (attempts < maxAttempts) {
    attempts++;
    
    const spinner = ora(attempts === 1 ? 'AI 正在思考中...' : 'AI 重新思考中...').start();
    
    try {
      // 获取系统信息
      const systemInfo = getSystemInfo();
      
      // 构建带系统上下文的提示
      let prompt = buildPrompt(query, systemInfo);
      
      // 如果是重新生成，添加提示避免重复
      if (attempts > 1 && currentCommand) {
        prompt += `\n\n注意：请提供与之前不同的解决方案。之前的建议是: ${currentCommand}`;
      }
      
      // 从 AI 获取命令
      currentCommand = await aiService.generateCommand(prompt);
      
      spinner.stop();
      
      // 显示建议的命令
      console.log(chalk.green('\n建议的命令:'));
      console.log(chalk.cyan(currentCommand));
      console.log(chalk.yellow('\n⚠️  请仔细检查命令后再执行!'));
      
      // 询问用户选择
      const choice = await askUserChoice();
      
      switch (choice.action) {
        case 'execute':
          try {
            await executeCommand(currentCommand);
            return; // 执行完成，退出循环
          } catch (error) {
            console.error(chalk.red('\n执行命令时出错，但程序继续运行'));
            return;
          }
          
        case 'exit':
          console.log(chalk.gray('\n已取消执行'));
          return; // 用户选择退出
          
        case 'change':
          console.log(chalk.blue('\n正在生成新的解决方案...'));
          continue; // 继续循环，重新生成
      }
      
    } catch (error) {
      spinner.stop();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red('错误:'), errorMessage);
      
      if (errorMessage.includes('API key not configured')) {
        console.log(chalk.yellow('\n要配置你的 API key，请运行:'));
        console.log(chalk.cyan('ask config'));
      }
      return; // 出错时退出
    }
  }
  
  console.log(chalk.yellow(`\n已达到最大尝试次数 (${maxAttempts})，程序退出`));
}