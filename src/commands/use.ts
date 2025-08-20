import chalk from 'chalk';
import config from '../config/index.js';

export async function useCommand(modelName: string): Promise<void> {
  if (!modelName || modelName.trim() === '') {
    console.log(chalk.red('❌ Model name is required'));
    console.log(chalk.yellow('Usage: ask use <model-name>'));
    console.log(chalk.gray('Example: ask use "GLM Model"'));
    console.log(chalk.gray('Use "ask ls" to see available models'));
    return;
  }

  try {
    const result = await config.useModel(modelName);
    
    if (result.success) {
      console.log(chalk.green('✅'), result.message);
      
      if (result.model) {
        console.log(chalk.blue('\n📋 Active model details:'));
        console.log(chalk.gray('─'.repeat(30)));
        console.log(chalk.white('  Name:'), chalk.cyan(result.model.name));
        console.log(chalk.white('  Model:'), chalk.cyan(result.model.model));
        console.log(chalk.white('  Temperature:'), chalk.cyan(result.model.temperature.toString()));
        console.log(chalk.white('  API URL:'), chalk.cyan(result.model.apiUrl));
      }
      
      console.log(chalk.gray('\n💡 You can now use "ask" commands with this model'));
    } else {
      console.log(chalk.red('❌'), result.message);
      console.log(chalk.yellow('\n💡 Use "ask ls" to see available models'));
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red('❌ Error switching model:'), errorMessage);
  }
}
