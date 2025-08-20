import { promises as fs } from 'fs';
import chalk from 'chalk';
import config from '../config/index.js';

export async function configCommand(): Promise<void> {
  try {
    const configPath = config.getConfigPath();
    
    console.log(chalk.blue('📋 Configuration Information'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.yellow('Config file path:'));
    console.log(chalk.cyan(configPath));
    console.log();
    
    // 直接读取并显示配置文件的原始内容
    try {
      const rawConfigData = await fs.readFile(configPath, 'utf8');
      console.log(chalk.yellow('Current configuration:'));
      console.log(chalk.gray('─'.repeat(30)));
      console.log(chalk.white(rawConfigData));
    } catch (error) {
      console.log(chalk.yellow('Configuration file not found or empty.'));
      console.log(chalk.gray('It will be created automatically when you first use the app.'));
    }
    
    console.log();
    console.log(chalk.blue('💡 Commands:'));
    console.log(chalk.gray('  ask ls                 - List all available models'));
    console.log(chalk.gray('  ask use "<model-name>" - Switch to a specific model'));
    console.log(chalk.gray('  ask test               - Test current model connection'));
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red('Error loading configuration:'), errorMessage);
  }
}