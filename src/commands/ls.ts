import chalk from 'chalk';
import config from '../config/index.js';

export async function lsCommand(): Promise<void> {
  try {
    const arrayConfigData = await config.loadArray();
    
    console.log(chalk.blue('📋 Available Models'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (arrayConfigData.models.length === 0) {
      console.log(chalk.yellow('No models configured'));
      console.log(chalk.gray('Run "ask config" to set up your first model'));
      return;
    }

    const enabledModel = arrayConfigData.models.find(m => m.enabled);
    
    arrayConfigData.models.forEach((model, index) => {
      const statusIcon = model.enabled ? chalk.green('✅') : chalk.gray('⚪');
      const nameColor = model.enabled ? chalk.green : chalk.white;
      
      console.log(`${statusIcon} ${nameColor(model.name)}`);
      console.log(chalk.gray(`   Model: ${model.model} | Temperature: ${model.temperature} | API: ${model.apiUrl.split('/')[2] || model.apiUrl}`));
    });

    console.log(chalk.gray('─'.repeat(50)));
    
    if (enabledModel) {
      console.log(chalk.green(`🎯 Current: ${enabledModel.name}`));
    } else {
      console.log(chalk.red('⚠️  No model is currently active'));
    }
    
    console.log();
    console.log(chalk.blue('💡 Commands:'));
    console.log(chalk.gray('  ask use "<model-name>"  - Switch to a different model'));
    console.log(chalk.gray('  ask config             - View detailed configuration'));
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red('❌ Error loading models:'), errorMessage);
  }
}
