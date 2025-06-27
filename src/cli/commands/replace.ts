import { Command } from 'commander';
import { handleExtractCommand, formatCommand } from '../utils';

/**
 * 注册replace命令
 * @param program Commander实例
 */
export function replaceCommand(program: Command): void {
  program
    .command('replace')
    .description('替换中文文案为国际化函数调用')
    .option('-p, --pattern <pattern>', '文件匹配模式（覆盖配置文件中的include）')
    .option('-o, --output <path>', '输出目录（覆盖配置文件中的outputDir）')
    .option('-i, --ignore <pattern>', '忽略的文件模式（覆盖配置文件中的exclude）')
    .option('--dry-run', '仅扫描不写入文件')
    .option('--auto-import', '自动添加国际化函数导入语句')
    .action(async (options) => {
      // 使用通用处理函数
      await handleExtractCommand({
        options,
        program,
        extractOnly: false, // 提取并替换
        autoImport: options.autoImport || false,
        successMessages: {
          normal: `替换完成，共替换 {replacedFiles} 个文件中的 {extractedTexts} 条中文文案`,
          dryRun: `扫描完成，将会替换 {replacedFiles} 个文件中的 {extractedTexts} 条中文文案（未写入文件）`,
          nextCommand: `运行 ${formatCommand('i18n-xy translate')} 翻译中文文案到其他语言`
        }
      });
    });
} 