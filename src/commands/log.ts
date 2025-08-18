import chalk from 'chalk';
import logger, { type LogEntry } from '../utils/logger.js';

export interface LogOptions {
  clear?: boolean;
  limit?: number;
}

export async function logCommand(options: LogOptions = {}): Promise<void> {
  try {
    if (options.clear) {
      await logger.clearLogs();
      console.log(chalk.green('✅ Command history cleared successfully'));
      return;
    }

    const logs = await logger.loadLogs();
    
    if (logs.length === 0) {
      console.log(chalk.yellow('📝 No command history found'));
      console.log(chalk.gray('   Start using ask commands to build your history'));
      return;
    }

    const limit = options.limit || logs.length;
    const displayLogs = logs.slice(-limit).reverse(); // Reverse to show newest first

    console.log(chalk.blue(`📋 Command History (showing last ${displayLogs.length} entries)`));
    console.log(chalk.gray('─'.repeat(80)));

    displayLogs.forEach((entry, index) => {
      const date = new Date(entry.timestamp);
      const timeStr = date.toLocaleString();
      const status = entry.executed ? chalk.green('✅ EXECUTED') : chalk.red('❌ CANCELLED');
      
      console.log(chalk.cyan(`\n[${index + 1}] ${timeStr}`));
      console.log(chalk.white(`Query: "${entry.query}"`));
      console.log(chalk.yellow(`Command: ${entry.command}`));
      console.log(`Status: ${status}`);
      console.log(chalk.gray(`System: ${entry.systemInfo.os} (${entry.systemInfo.arch}) - ${entry.systemInfo.shell}`));
    });

    console.log(chalk.gray('\n─'.repeat(80)));
    console.log(chalk.blue(`Total entries: ${logs.length}`));
    
    if (logs.length > displayLogs.length) {
      console.log(chalk.gray(`Use --limit to show more entries (max: ${logs.length})`));
    }
    
    console.log(chalk.gray('\nTip: Use "ask log --clear" to clear history'));
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red('❌ Failed to load command history:'), errorMessage);
    process.exit(1);
  }
}