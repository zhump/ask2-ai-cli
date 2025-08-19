import { promises as fs } from 'fs';
import chalk from 'chalk';
import config from '../config/index.js';

export async function configCommand(): Promise<void> {
  try {
    const configPath = config.getConfigPath();
    
    // Load current configuration
    const configData = await config.load();
    
    console.log(chalk.blue('📋 Configuration Information'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.yellow('Config file path:'));
    console.log(chalk.cyan(configPath));
    console.log();
    
    console.log(chalk.yellow('Current configuration:'));
    console.log(chalk.gray('─'.repeat(30)));
    
    // Display configuration with masked API key for security
    const displayConfig = {
      ...configData,
      apiKey: configData.apiKey ? 
        configData.apiKey.substring(0, 8) + '...' + configData.apiKey.slice(-4) : 
        'Not configured'
    };
    
    Object.entries(displayConfig).forEach(([key, value]) => {
      console.log(chalk.white(`${key}:`), chalk.cyan(String(value)));
    });
    
    console.log();
    console.log(chalk.yellow('To edit configuration:'));
    console.log(chalk.gray(`Edit the file: ${configPath}`));
    console.log();
    console.log(chalk.yellow('Required configuration format:'));
    console.log(chalk.gray(JSON.stringify({
      apiKey: 'your-api-key-here',
      apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-4.5',
      temperature: 0.3
    }, null, 2)));
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red('Error loading configuration:'), errorMessage);
    
    console.log(chalk.yellow('\nIf configuration file doesn\'t exist, it will be created automatically.'));
    console.log(chalk.yellow('Please ensure you have the required API key configured.'));
  }
}