import { Command } from 'commander';
import { handleTranslateCommand } from '../utils';
import { Config } from '../../types/config';

/**
 * 注册translate命令
 * @param program Commander实例
 */
export function translateCommand(program: Command): void {
  program
    .command('translate')
    .description('翻译中文文案到其他语言')
    .option('-l, --locale <locales>', '目标语言，多个语言用逗号分隔，如 en,ja,ko')
    .option('-o, --output <path>', '输出目录（覆盖配置文件中的outputDir）')
    .option('--dry-run', '仅扫描不写入文件')
    .action(async (options) => {
      // 使用通用处理函数
      await handleTranslateCommand({
        options,
        program,
        successMessages: {
          normal: `翻译完成，共翻译 {totalTranslated} 条文案`,
          dryRun: `扫描完成，需要翻译 {totalTranslated} 条文案（未执行翻译）`,
        },
        getTargetLocales: (config: Config, locale?: string): string[] => {
          let targetLocales: string[] = [];
          if (locale) {
            targetLocales = locale.split(',').map(loc => loc.trim());
          } else if (config.translation.defaultTargetLang) {
            // 如果没有指定目标语言，使用配置中的默认目标语言
            targetLocales = [config.translation.defaultTargetLang];
          }
          return targetLocales;
        }
      });
    });
} 