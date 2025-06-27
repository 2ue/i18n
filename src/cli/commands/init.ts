import { Command } from 'commander';
import { handleInitCommand, formatCommand } from '../utils';
import { defaultConfig } from '../../config';

/**
 * 注册init命令
 * @param program Commander实例
 */
export function initCommand(program: Command): void {
  program
    .command('init')
    .description('初始化配置文件')
    .option('-f, --force', '强制覆盖已存在的配置文件')
    .option('-o, --output <path>', '指定配置文件输出路径', './i18n-xy.config.js')
    .action(async (options) => {
      // 使用通用处理函数
      await handleInitCommand({
        options,
        program,
        successMessages: {
          normal: '配置文件已生成',
          dryRun: '配置文件已生成（模拟）',
          nextCommand: `编辑配置文件以满足您的需求，然后运行 ${formatCommand('i18n-xy extract')} 开始提取中文文案`
        },
        generateConfigContent: (config) => generateConfigFileContent(config)
      });
    });
}

/**
 * 生成配置文件内容
 * @param config 配置对象
 * @returns 配置文件内容
 */
function generateConfigFileContent(config: any): string {
  return `/**
 * i18n-xy配置文件
 * 生成时间: ${new Date().toISOString()}
 */

module.exports = ${JSON.stringify(config, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // 将"key": 转换为 key:
      .replace(/"/g, '\'') // 将双引号转换为单引号
    };
`;
} 