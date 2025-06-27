import { Command } from 'commander';
import { handleExtractCommand, formatCommand } from '../utils';

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
      // 使用通用处理函数
      await handleExtractCommand({
        options,
        program,
        extractOnly: true,
        successMessages: {
          normal: `提取完成，共提取 {extractedTexts} 条中文文案`,
          dryRun: `扫描完成，共发现 {extractedTexts} 条中文文案（未写入文件）`,
          nextCommand: `运行 ${formatCommand('i18n-xy replace')} 替换中文为国际化函数调用`
        }
      });
    });
} 