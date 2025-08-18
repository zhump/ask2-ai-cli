#!/usr/bin/env node

import { program } from 'commander';
import { askCommand } from '../commands/ask.js';
import { configCommand } from '../commands/config.js';

program
  .name('ask')
  .description('将自然语言转换为可执行命令')
  .version('1.0.0');

program
  .argument('[query...]', '要转换为命令的自然语言查询')
  .action(async (query: string[]) => {
    if (query.length === 0) {
      program.help();
      return;
    }
    await askCommand(query.join(' '));
  });

program
  .command('config')
  .description('打开配置文件')
  .action(configCommand);

program.parse();