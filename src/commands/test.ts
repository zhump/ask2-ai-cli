import chalk from 'chalk';
import ora from 'ora';
import { getSystemInfo } from '../utils/system.js';
import { DebugTimer, type DebugOptions } from '../utils/debug.js';
import aiService from '../services/ai.js';

export async function testCommand(options: DebugOptions = {}): Promise<void> {
    const debugTimer = new DebugTimer(options.debug);

    console.log(chalk.blue('🔧 Testing AI API connectivity...\n'));

    // Show which model is being tested
    if (options.modelName) {
        console.log(chalk.cyan(`🎯 Testing specific model: ${options.modelName}\n`));
    }

    debugTimer.startStage('Test initialization');

    const spinner = ora('Testing AI connection...').start();

    try {
        // Get system information
        debugTimer.startStage('Get system info');
        const systemInfo = getSystemInfo();

        // Build simple test prompt
        debugTimer.startStage('Build test prompt');
        const testPrompt = `You are a command-line assistant. Please reply "Connection successful" to confirm the interface is working properly.

System information:
- Operating System: ${systemInfo.systemName}
- Architecture: ${systemInfo.arch}

Test request: Please confirm connection status

Just reply "Connection successful":`;

        debugTimer.showPrompt(testPrompt);

        // Test AI connection
        debugTimer.startStage('Test AI connection');
        const startTime = Date.now();
        
        let response: string;
        let testConfig: any;
        
        if (options.modelName) {
            // Test specific model
            const config = (await import('../config/index.js')).default;
            const modelConfig = await config.getModelByName(options.modelName);
            
            if (!modelConfig) {
                spinner.stop();
                console.log(chalk.red(`❌ Model '${options.modelName}' not found!`));
                console.log(chalk.yellow('\n💡 Available models:'));
                const configArray = await config.loadArray();
                configArray.models.forEach(model => {
                    console.log(chalk.gray(`   - ${model.name}`));
                });
                process.exit(1);
            }
            
            response = await aiService.generateCommandWithConfig(testPrompt, modelConfig);
            testConfig = modelConfig;
        } else {
            // Test current active model
            response = await aiService.generateCommand(testPrompt);
            const config = (await import('../config/index.js')).default;
            const configArray = await config.loadArray();
            // Find the currently enabled model
            const activeModel = configArray.models.find(model => model.enabled);
            testConfig = activeModel || await config.load(); // Fallback to old format if no active model found
        }
        
        const responseTime = Date.now() - startTime;

        debugTimer.showResponse(response);
        spinner.stop();

        // Check response
        debugTimer.startStage('Validate response');
        const isValidResponse = response.toLowerCase().includes('connection successful') ||
            response.toLowerCase().includes('success') ||
            response.toLowerCase().includes('connected');

        if (isValidResponse) {
            console.log(chalk.green('✅ AI API connection successful!'));
            console.log(chalk.gray(`   Response time: ${responseTime}ms`));
            console.log(chalk.gray(`   AI response: ${response.trim()}`));
        } else {
            console.log(chalk.yellow('⚠️  AI API connected, but response is abnormal'));
            console.log(chalk.gray(`   Response time: ${responseTime}ms`));
            console.log(chalk.gray(`   AI response: ${response.trim()}`));
            console.log(chalk.yellow('   Suggest checking AI model configuration'));
        }

        // Show configuration information
        console.log(chalk.blue('\n📋 Tested configuration:'));
        if (options.modelName) {
            console.log(chalk.gray(`   Model Name: ${testConfig.name}`));
        } else {
            // For current active model, show the real name if available
            const modelName = testConfig.name || '(Current Active Model)';
            console.log(chalk.gray(`   Model Name: ${modelName}`));
        }
        console.log(chalk.gray(`   API URL: ${testConfig.apiUrl}`));
        console.log(chalk.gray(`   Model: ${testConfig.model}`));
        console.log(chalk.gray(`   Temperature: ${testConfig.temperature}`));

        debugTimer.showSummary();

    } catch (error) {
        spinner.stop();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.log(chalk.red('❌ AI API connection failed!'));
        console.log(chalk.red(`   Error message: ${errorMessage}`));

        if (errorMessage.includes('API key not configured')) {
            console.log(chalk.yellow('\n💡 Solution:'));
            console.log(chalk.cyan('   ask config  # Configure API key'));
        } else if (errorMessage.includes('fetch')) {
            console.log(chalk.yellow('\n💡 Possible causes:'));
            console.log(chalk.gray('   - Network connection issues'));
            console.log(chalk.gray('   - Incorrect API URL configuration'));
            console.log(chalk.gray('   - Server temporarily unavailable'));
        } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
            console.log(chalk.yellow('\n💡 Possible causes:'));
            console.log(chalk.gray('   - Invalid or expired API key'));
            console.log(chalk.gray('   - Insufficient API key permissions'));
        }

        debugTimer.showSummary();
        process.exit(1);
    }
}