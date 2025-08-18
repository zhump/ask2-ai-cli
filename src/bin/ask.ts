#!/usr/bin/env node

import { program } from 'commander';
import { askCommand } from '../commands/ask.js';
import { configCommand } from '../commands/config.js';
import { testCommand } from '../commands/test.js';
import { logCommand } from '../commands/log.js';

program
  .name('ask')
  .description('Convert natural language to executable commands')
  .version('1.0.2');

program
  .argument('[query...]', 'Natural language query to convert to command')
  .option('-d, --debug', 'Enable debug mode with detailed timing and prompt info')
  .option('-e, --explain', 'Provide detailed explanation of the generated command')
  .action(async (query: string[], options) => {
    if (query.length === 0) {
      program.help();
      return;
    }
    await askCommand(query.join(' '), { 
      debug: options.debug, 
      explain: options.explain 
    });
  });

program
  .command('config')
  .description('Open configuration file to set API key and preferences')
  .action(configCommand);

program
  .command('test')
  .description('Test AI API connectivity and configuration')
  .option('-d, --debug', 'Show detailed connection test information')
  .action(async (options) => {
    await testCommand({ debug: options.debug });
  });

program
  .command('log')
  .description('Show command history and execution logs')
  .option('--clear', 'Clear all command history')
  .option('--limit <number>', 'Limit number of entries to show', parseInt)
  .action(async (options) => {
    await logCommand({ clear: options.clear, limit: options.limit });
  });

program.parse();