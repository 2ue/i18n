import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
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
      const spinner = ora('正在初始化配置文件...').start();

      try {
        const outputPath = path.resolve(process.cwd(), options.output);

        // 检查文件是否已存在
        if (fs.existsSync(outputPath) && !options.force) {
          spinner.fail(`配置文件已存在: ${outputPath}`);
          console.log(`使用 ${chalk.cyan('--force')} 选项覆盖已存在的配置文件`);
          return;
        }

        // 确保目录存在
        fs.ensureDirSync(path.dirname(outputPath));

        // 生成配置文件内容
        const configContent = generateConfigFileContent(defaultConfig);

        // 写入配置文件
        fs.writeFileSync(outputPath, configContent, 'utf-8');

        spinner.succeed(`配置文件已生成: ${outputPath}`);
        console.log(`\n编辑配置文件以满足您的需求，然后运行 ${chalk.cyan('i18n-xy extract')} 开始提取中文文案`);
      } catch (error) {
        spinner.fail(`初始化配置文件失败: ${error instanceof Error ? error.message : String(error)}`);
        if (program.opts().debug) {
          console.error(error);
        }
      }
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