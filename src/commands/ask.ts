import chalk from 'chalk';
import ora from 'ora';
import { getSystemInfo, buildPrompt } from '../utils/system.js';
import { askUserChoice } from '../utils/input.js';
import { executeCommand } from '../utils/executor.js';
import { DebugTimer, type DebugOptions } from '../utils/debug.js';
import { isDangerousCommand, requiresPrivileges, isCurrentUserPrivileged, confirmDangerousOperation, suggestPrivilegeEscalation } from '../utils/safety.js';
import { explainCommand, displayCommandExplanation } from '../utils/explainer.js';
import logger from '../utils/logger.js';
import aiService from '../services/ai.js';

export interface AskOptions extends DebugOptions {
  explain?: boolean;
}

export async function askCommand(query: string, options: AskOptions = {}): Promise<void> {
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
      
      // Check for privilege requirements
      if (requiresPrivileges(currentCommand) && !isCurrentUserPrivileged()) {
        console.log(chalk.yellow('\n⚠️  This command may require elevated privileges.'));
        console.log(chalk.gray('Consider using:'), chalk.cyan(suggestPrivilegeEscalation(currentCommand, systemInfo)));
      }
      
      // Show explanation if requested
      if (options.explain) {
        debugTimer.startStage('Generate explanation');
        const spinner2 = ora('Generating command explanation...').start();
        try {
          const explanation = await explainCommand(currentCommand, systemInfo);
          spinner2.stop();
          displayCommandExplanation(currentCommand, explanation);
        } catch (error) {
          spinner2.stop();
          console.log(chalk.red('\nFailed to generate explanation:'), error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      console.log(chalk.yellow('\n⚠️  Please review the command carefully before execution!'));

      // Ask user choice
      debugTimer.startStage('Wait user choice');
      const choice = await askUserChoice();

      switch (choice.action) {
        case 'execute':
          try {
            // Check for dangerous operations and require double confirmation
            if (isDangerousCommand(currentCommand)) {
              const confirmed = await confirmDangerousOperation(currentCommand);
              if (!confirmed) {
                console.log(chalk.green('\n✅ Execution cancelled for safety.'));
                
                // Log cancelled dangerous command
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
            }
            
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
          
        case 'explain':
          debugTimer.startStage('Generate explanation');
          const spinner3 = ora('Generating command explanation...').start();
          try {
            const explanation = await explainCommand(currentCommand, systemInfo);
            spinner3.stop();
            displayCommandExplanation(currentCommand, explanation);
            
            // After showing explanation, ask user choice again
            const newChoice = await askUserChoice();
            if (newChoice.action === 'execute') {
              // Check for dangerous operations again
              if (isDangerousCommand(currentCommand)) {
                const confirmed = await confirmDangerousOperation(currentCommand);
                if (!confirmed) {
                  console.log(chalk.green('\n✅ Execution cancelled for safety.'));
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
              }
              
              await executeCommand(currentCommand);
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
              return;
            } else if (newChoice.action === 'exit') {
              console.log(chalk.gray('\nExecution cancelled'));
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
            } else if (newChoice.action === 'change') {
              console.log(chalk.blue('\nGenerating new solution...'));
              continue;
            }
          } catch (error) {
            spinner3.stop();
            console.log(chalk.red('\nFailed to generate explanation:'), error instanceof Error ? error.message : 'Unknown error');
            // Continue to ask user choice again
            const newChoice = await askUserChoice();
            // Handle the choice similar to above...
            continue;
          }
          break;
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