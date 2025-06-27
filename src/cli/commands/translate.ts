import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { configManager } from '../../config';
import { keyValueManager } from '../../core/key-value-manager';
import { translationProcessor } from '../../core/translation';

/**
 * 注册translate命令
 * @param program Commander实例
 */
export function translateCommand(program: Command): void {
  program
    .command('translate')
    .description('翻译到其他语言')
    .option('-s, --source <locale>', '源语言，默认为配置中的locale')
    .option('-t, --target <locale>', '目标语言，默认为配置中的fallbackLocale')
    .option('--dry-run', '仅扫描不写入文件')
    .action(async (options) => {
      const spinner = ora('正在加载配置...').start();

      try {
        // 初始化配置
        const configPath = program.opts().config;
        const config = configManager.init(configPath);

        // 检查翻译功能是否启用
        if (!config.translation.enabled) {
          spinner.fail('翻译功能未启用，请在配置文件中启用');
          console.log(`\n在配置文件中设置 ${chalk.cyan('translation.enabled = true')} 并配置翻译API密钥`);
          return;
        }

        // 获取源语言和目标语言
        const sourceLocale = options.source || config.locale;
        const targetLocale = options.target || config.fallbackLocale;

        spinner.text = `正在翻译，从 ${sourceLocale} 到 ${targetLocale}...`;

        // 加载键值对数据
        if (!keyValueManager.loadExistingData([sourceLocale, targetLocale])) {
          spinner.fail(`未找到源语言文件，请先运行 ${chalk.cyan('i18n-xy extract')} 提取中文文案`);
          return;
        }

        // 获取源语言的键值对数量
        const sourceCount = keyValueManager.count(sourceLocale);
        if (sourceCount === 0) {
          spinner.fail(`源语言 ${sourceLocale} 没有可翻译的文本`);
          return;
        }

        // 获取目标语言已有的键值对数量
        const targetCount = keyValueManager.count(targetLocale);

        // 如果是调试模式，显示详细信息
        if (program.opts().debug) {
          console.log(`\n源语言 ${sourceLocale} 有 ${sourceCount} 条文本`);
          console.log(`目标语言 ${targetLocale} 已有 ${targetCount} 条文本`);
        }

        // 如果是dry-run模式，只显示统计信息
        if (options.dryRun) {
          const needTranslateCount = sourceCount - targetCount;
          spinner.succeed(`扫描完成，需要翻译 ${needTranslateCount} 条文本（未执行翻译）`);
          return;
        }

        // 执行翻译
        const result = await translationProcessor.translateKeyValueStore(targetLocale, sourceLocale);

        if (result.count === 0) {
          spinner.succeed('所有文本已翻译完成，无需额外翻译');
        } else {
          spinner.succeed(`翻译完成，成功翻译 ${result.successCount} 条文本，失败 ${result.failCount} 条`);
        }

        // 如果有失败的翻译，显示详细信息
        if (result.failCount > 0 && program.opts().verbose) {
          console.log('\n翻译失败的文本:');
          result.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${chalk.yellow(error.text)}: ${chalk.red(error.error.message || String(error.error))}`);
          });
        }
      } catch (error) {
        spinner.fail(`翻译失败: ${error instanceof Error ? error.message : String(error)}`);
        if (program.opts().debug) {
          console.error(error);
        }
      }
    });
} 