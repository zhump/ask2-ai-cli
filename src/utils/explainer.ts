import chalk from 'chalk';
import aiService from '../services/ai.js';

export async function explainCommand(command: string, systemInfo: any): Promise<string> {
  const explainPrompt = `You are a command-line expert. Please explain the following command in detail, breaking down each parameter and option.

Command to explain: ${command}

System: ${systemInfo.systemName} (${systemInfo.platform})
Shell: ${systemInfo.shell}

Please provide:
1. Overall purpose of the command
2. Breakdown of each parameter/option and what it does
3. Any potential risks or important notes
4. Alternative approaches if applicable

Format your response in a clear, educational manner. Use bullet points for parameter explanations.

Explanation:`;

  try {
    const explanation = await aiService.generateCommand(explainPrompt);
    return explanation;
  } catch (error) {
    return `Unable to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export function displayCommandExplanation(command: string, explanation: string): void {
  console.log(chalk.blue('\n📚 Command Explanation'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.yellow('Command:'), chalk.cyan(command));
  console.log();
  console.log(chalk.white('Explanation:'));
  console.log(chalk.gray(explanation));
  console.log(chalk.gray('─'.repeat(50)));
}