import { spawn } from 'child_process';
import chalk from 'chalk';
import config from '../config/index.js';

export async function configCommand(): Promise<void> {
  try {
    const configPath = config.getConfigPath();
    
    // 确保配置文件存在
    await config.load();
    
    console.log(chalk.blue('打开配置文件:'));
    console.log(chalk.gray(configPath));
    console.log();
    
    // 尝试用默认编辑器打开
    const editor = process.env.EDITOR || process.env.VISUAL || getDefaultEditor();
    
    const child = spawn(editor, [configPath], {
      stdio: 'inherit',
      detached: true
    });
    
    child.on('error', (error) => {
      console.error(chalk.red('无法打开编辑器:'), error.message);
      console.log(chalk.yellow('\n你可以手动编辑配置文件:'));
      console.log(chalk.cyan(configPath));
      console.log();
      console.log(chalk.yellow('需要的配置:'));
      console.log(chalk.gray(JSON.stringify({
        apiKey: 'your-zhipu-api-key',
        apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'glm-4.5',
        temperature: 0.6
      }, null, 2)));
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red('错误:'), errorMessage);
  }
}

function getDefaultEditor(): string {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    return 'open';
  } else if (platform === 'win32') {
    return 'notepad';
  } else {
    return 'nano';
  }
}