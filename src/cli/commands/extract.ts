import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { Process } from '../../core/process';

/**
 * 注册extract命令
 * @param program Commander实例
 */
export function extractCommand(program: Command): void {
  program
    .command('extract')
    .description('扫描并提取中文文案')
    .option('-p, --pattern <pattern>', '文件匹配模式（覆盖配置文件中的include）')
    .option('-o, --output <path>', '输出目录（覆盖配置文件中的outputDir）')
    .option('-i, --ignore <pattern>', '忽略的文件模式（覆盖配置文件中的exclude）')
    .option('--dry-run', '仅扫描不写入文件')
    .action(async (options) => {
      const spinner = ora('正在加载配置...').start();

      try {
        // 获取配置路径
        const configPath = program.opts().config;

        // 创建处理流程实例
        const processManager = new Process(configPath);

        spinner.text = '正在扫描文件...';

        // 转换选项
        const processOptions = {
          extractOnly: true, // 只提取不替换
          dryRun: options.dryRun || false,
          verbose: program.opts().verbose || false,
          debug: program.opts().debug || false,
          output: options.output,
          patterns: options.pattern ? [options.pattern] : undefined,
          ignores: options.ignore ? [options.ignore] : undefined
        };

        // 执行提取流程
        const result = processManager.execute(processOptions);

        if (result.scannedFiles === 0) {
          spinner.warn('未找到匹配的文件');
          return;
        }

        if (result.failedFiles > 0) {
          spinner.warn(`提取过程中有 ${result.failedFiles} 个文件处理失败`);

          if (program.opts().verbose && result.errors && result.errors.length > 0) {
            console.log('\n错误详情:');
            result.errors.forEach((error, index) => {
              console.log(`  ${index + 1}. ${error}`);
            });
          }
        }

        // 处理结果
        if (!options.dryRun) {
          spinner.succeed(`提取完成，共提取 ${result.extractedTexts} 条中文文案`);
          if (result.extractedTexts > 0) {
            console.log(`\n中文文案已保存到: ${chalk.cyan(path.join(options.output || 'locales'))}`);
            console.log(`\n运行 ${chalk.cyan('i18n-xy replace')} 替换中文为国际化函数调用`);
          }
        } else {
          spinner.succeed(`扫描完成，共发现 ${result.extractedTexts} 条中文文案（未写入文件）`);
        }
      } catch (error) {
        spinner.fail(`提取中文文案失败: ${error instanceof Error ? error.message : String(error)}`);
        if (program.opts().debug) {
          console.error(error);
        }
      }
    });
} 