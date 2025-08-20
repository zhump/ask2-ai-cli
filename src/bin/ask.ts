#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import { askCommand } from '../commands/ask.js';
import { configCommand } from '../commands/config.js';
import { testCommand } from '../commands/test.js';
import { logCommand } from '../commands/log.js';
import { useCommand } from '../commands/use.js';
import { lsCommand } from '../commands/ls.js';

program
  .name('ask')
  .description('Convert natural language to executable commands');

// Read version from package.json so `ask -V` reflects package.json
let pkgVersion = '0.0.0';
try {
  const pkgText = fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8');
  const pkg = JSON.parse(pkgText);
  if (pkg && pkg.version) pkgVersion = pkg.version;
} catch (e) {
  // fallback kept as default
}

program.version(pkgVersion);

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
  .command('test [modelName]')
  .description('Test AI API connectivity and configuration for a specific model or current active model')
  .option('-d, --debug', 'Show detailed connection test information')
  .action(async (modelName, options) => {
    await testCommand({ debug: options.debug, modelName });
  });

program
  .command('log')
  .description('Show command history and execution logs')
  .option('--clear', 'Clear all command history')
  .option('--limit <number>', 'Limit number of entries to show', parseInt)
  .action(async (options) => {
    await logCommand({ clear: options.clear, limit: options.limit });
  });

program
  .command('use')
  .description('Switch to a specific model configuration')
  .argument('<model-name>', 'Name of the model to switch to')
  .action(async (modelName: string) => {
    await useCommand(modelName);
  });

program
  .command('ls')
  .description('List all available model configurations')
  .action(async () => {
    await lsCommand();
  });

program.parse();