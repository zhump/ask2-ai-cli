import chalk from 'chalk';
import ora from 'ora';
import { getSystemInfo } from '../utils/system.js';
import { DebugTimer, type DebugOptions } from '../utils/debug.js';
import aiService from '../services/ai.js';

export async function testCommand(options: DebugOptions = {}): Promise<void> {
  const debugTimer = new DebugTimer(options.debug);
  
  console.log(chalk.blue('🔧 测试 AI 接口连通性...\n'));
  
  debugTimer.startStage('初始化测试');
  
  const spinner = ora('正在测试 AI 连接...').start();
  
  try {
    // 获取系统信息
    debugTimer.startStage('获取系统信息');
    const systemInfo = getSystemInfo();
    
    // 构建简单的测试提示
    debugTimer.startStage('构建测试提示');
    const testPrompt = `你是一个命令行助手。请回复"连接成功"来确认接口正常工作。

系统信息:
- 操作系统: ${systemInfo.systemName}
- 架构: ${systemInfo.arch}

测试请求: 请确认连接状态

只需回复"连接成功"即可:`;

    debugTimer.showPrompt(testPrompt);
    
    // 测试 AI 连接
    debugTimer.startStage('测试 AI 连接');
    const startTime = Date.now();
    const response = await aiService.generateCommand(testPrompt);
    const responseTime = Date.now() - startTime;
    
    debugTimer.showResponse(response);
    spinner.stop();
    
    // 检查响应
    debugTimer.startStage('验证响应');
    const isValidResponse = response.toLowerCase().includes('连接成功') || 
                           response.toLowerCase().includes('success') ||
                           response.toLowerCase().includes('connected');
    
    if (isValidResponse) {
      console.log(chalk.green('✅ AI 接口连接成功!'));
      console.log(chalk.gray(`   响应时间: ${responseTime}ms`));
      console.log(chalk.gray(`   AI 响应: ${response.trim()}`));
    } else {
      console.log(chalk.yellow('⚠️  AI 接口已连接，但响应异常'));
      console.log(chalk.gray(`   响应时间: ${responseTime}ms`));
      console.log(chalk.gray(`   AI 响应: ${response.trim()}`));
      console.log(chalk.yellow('   建议检查 AI 模型配置'));
    }
    
    // 显示配置信息
    console.log(chalk.blue('\n📋 当前配置信息:'));
    const config = (await import('../config/index.js')).default;
    const configData = await config.load();
    console.log(chalk.gray(`   API URL: ${configData.apiUrl}`));
    console.log(chalk.gray(`   模型: ${configData.model}`));
    console.log(chalk.gray(`   温度: ${configData.temperature}`));
    
    debugTimer.showSummary();
    
  } catch (error) {
    spinner.stop();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.log(chalk.red('❌ AI 接口连接失败!'));
    console.log(chalk.red(`   错误信息: ${errorMessage}`));
    
    if (errorMessage.includes('API key not configured')) {
      console.log(chalk.yellow('\n💡 解决方案:'));
      console.log(chalk.cyan('   ask config  # 配置 API key'));
    } else if (errorMessage.includes('fetch')) {
      console.log(chalk.yellow('\n💡 可能的原因:'));
      console.log(chalk.gray('   - 网络连接问题'));
      console.log(chalk.gray('   - API URL 配置错误'));
      console.log(chalk.gray('   - 服务器暂时不可用'));
    } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
      console.log(chalk.yellow('\n💡 可能的原因:'));
      console.log(chalk.gray('   - API key 无效或已过期'));
      console.log(chalk.gray('   - API key 权限不足'));
    }
    
    debugTimer.showSummary();
    process.exit(1);
  }
}