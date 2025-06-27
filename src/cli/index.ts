#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

// 导入命令
import { initCommand } from './commands/init';
import { extractCommand } from './commands/extract';
import { replaceCommand } from './commands/replace';
import { translateCommand } from './commands/translate';

// 获取包信息
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// 创建程序实例
const program = new Command();

// 设置基本信息
program
  .name('i18n-xy')
  .description('国际化提取替换翻译工具')
  .version(packageJson.version);

// 注册命令
initCommand(program);
extractCommand(program);
replaceCommand(program);
translateCommand(program);

// 添加全局选项
program
  .option('-c, --config <path>', '指定配置文件路径')
  .option('-d, --debug', '启用调试模式')
  .option('-v, --verbose', '显示详细输出');

// 自定义帮助信息
program.addHelpText('after', `
示例:
  $ i18n-xy init                     # 初始化配置文件
  $ i18n-xy extract                  # 提取中文文案
  $ i18n-xy replace                  # 替换中文为国际化函数
  $ i18n-xy translate --target en-US # 翻译到英语

更多信息请访问: ${chalk.cyan('https://github.com/yourusername/i18n-xy')}
`);

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 