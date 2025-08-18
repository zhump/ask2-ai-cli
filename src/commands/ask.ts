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

  debugTimer.startStage('Initialization');

  while (attempts < maxAttempts) {
    attempts++;

    const spinner = ora(attempts === 1 ? 'AI is thinking...' : 'AI is rethinking...').start();

    try {
      // Get system information
      debugTimer.startStage('Get system info');
      const systemInfo = getSystemInfo();

      // Build prompt with system context
      debugTimer.startStage('Build prompt');
      let prompt = buildPrompt(query, systemInfo);

      // If regenerating, add prompt to avoid repetition
      if (attempts > 1 && currentCommand) {
        prompt += `\n\nNote: Please provide a different solution from the previous one. Previous suggestion was: ${currentCommand}`;
      }

      debugTimer.showPrompt(prompt);

      // Get command from AI
      debugTimer.startStage('AI generate command');
      currentCommand = await aiService.generateCommand(prompt);

      debugTimer.showResponse(currentCommand);
      spinner.stop();

      // Show suggested command
      debugTimer.startStage('Display result');
      console.log(chalk.green('\nSuggested command:'));
      console.log(chalk.cyan(currentCommand));
      console.log(chalk.yellow('\n⚠️  Please review the command carefully before execution!'));

      // Ask user choice
      debugTimer.startStage('Wait user choice');
      const choice = await askUserChoice();

      switch (choice.action) {
        case 'execute':
          try {
            debugTimer.startStage('Execute command');
            await executeCommand(currentCommand);

            // Log successfully executed command
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
            return; // Execution completed, exit loop
          } catch (error) {
            console.error(chalk.red('\nError occurred while executing command, but program continues'));

            // Log failed command execution
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
          console.log(chalk.gray('\nExecution cancelled'));

          // Log cancelled command
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
          return; // User chose to exit

        case 'change':
          console.log(chalk.blue('\nGenerating new solution...'));
          continue; // Continue loop, regenerate
      }

    } catch (error) {
      spinner.stop();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red('Error:'), errorMessage);

      if (errorMessage.includes('API key not configured')) {
        console.log(chalk.yellow('\nTo configure your API key, run:'));
        console.log(chalk.cyan('ask config'));
      }
      debugTimer.showSummary();
      return; // Exit on error
    }
  }

  console.log(chalk.yellow(`\nReached maximum attempts (${maxAttempts}), program exiting`));
  debugTimer.showSummary();
}