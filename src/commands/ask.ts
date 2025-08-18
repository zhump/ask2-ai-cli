import chalk from 'chalk';
import ora from 'ora';
import { getSystemInfo, buildPrompt } from '../utils/system.js';
import { askUserChoice } from '../utils/input.js';
import { executeCommand } from '../utils/executor.js';
import { DebugTimer, type DebugOptions } from '../utils/debug.js';
import logger from '../utils/logger.js';
import aiService from '../services/ai.js';

export async function askCommand(query: string, options: DebugOptions = {}): Promise<void> {
  const debugTimer = new DebugTimer(options.debug);
  let currentCommand = '';
  let attempts = 0;
  const maxAttempts = 5; // 防止无限循环
  
  debugTimer.startStage('初始化');
  
  while (attempts < maxAttempts) {
    attempts++;
    
    const spinner = ora(attempts === 1 ? 'AI 正在思考中...' : 'AI 重新思考中...').start();
    
    try {
      // 获取系统信息
      debugTimer.startStage('获取系统信息');
      const systemInfo = getSystemInfo();
      
      // 构建带系统上下文的提示
      debugTimer.startStage('构建提示词');
      let prompt = buildPrompt(query, systemInfo);
      
      // 如果是重新生成，添加提示避免重复
      if (attempts > 1 && currentCommand) {
        prompt += `\n\n注意：请提供与之前不同的解决方案。之前的建议是: ${currentCommand}`;
      }
      
      debugTimer.showPrompt(prompt);
      
      // 从 AI 获取命令
      debugTimer.startStage('AI 生成命令');
      currentCommand = await aiService.generateCommand(prompt);
      
      debugTimer.showResponse(currentCommand);
      spinner.stop();
      
      // 显示建议的命令
      debugTimer.startStage('显示结果');
      console.log(chalk.green('\n建议的命令:'));
      console.log(chalk.cyan(currentCommand));
      console.log(chalk.yellow('\n⚠️  请仔细检查命令后再执行!'));
      
      // 询问用户选择
      debugTimer.startStage('等待用户选择');
      const choice = await askUserChoice();
      
      switch (choice.action) {
        case 'execute':
          try {
            debugTimer.startStage('执行命令');
            await executeCommand(currentCommand);
            
            // 记录成功执行的命令
            await logger.addLog({
              timestamp: new Date().toISOString(),
              query,
              command: currentCommand,
              executed: true,
              systemInfo: {
                os: systemInfo.systemName,
                arch: systemInfo.arch,
                shell: systemInfo.shell
              }
            });
            
            debugTimer.showSummary();
            return; // 执行完成，退出循环
          } catch (error) {
            console.error(chalk.red('\n执行命令时出错，但程序继续运行'));
            
            // 记录执行失败的命令
            await logger.addLog({
              timestamp: new Date().toISOString(),
              query,
              command: currentCommand,
              executed: false,
              systemInfo: {
                os: systemInfo.systemName,
                arch: systemInfo.arch,
                shell: systemInfo.shell
              }
            });
            
            debugTimer.showSummary();
            return;
          }
          
        case 'exit':
          console.log(chalk.gray('\n已取消执行'));
          
          // 记录取消的命令
          await logger.addLog({
            timestamp: new Date().toISOString(),
            query,
            command: currentCommand,
            executed: false,
            systemInfo: {
              os: systemInfo.systemName,
              arch: systemInfo.arch,
              shell: systemInfo.shell
            }
          });
          
          debugTimer.showSummary();
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
      debugTimer.showSummary();
      return; // 出错时退出
    }
  }
  
  console.log(chalk.yellow(`\n已达到最大尝试次数 (${maxAttempts})，程序退出`));
  debugTimer.showSummary();
}