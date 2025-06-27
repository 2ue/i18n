import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { configManager } from '../../config';
import { KeyValueManager } from '../../core/key-value-manager';
import { ImportManager } from '../../core/import-manager';
import { ASTProcessor } from '../../core/ast-processor';
import { glob } from 'glob';

/**
 * 注册replace命令
 * @param program Commander实例
 */
export function replaceCommand(program: Command): void {
  program
    .command('replace')
    .description('替换中文为国际化函数调用')
    .option('-p, --pattern <pattern>', '文件匹配模式（覆盖配置文件中的include）')
    .option('-i, --ignore <pattern>', '忽略的文件模式（覆盖配置文件中的exclude）')
    .option('--dry-run', '仅扫描不写入文件')
    .option('--no-auto-import', '禁用自动导入')
    .action(async (options) => {
      const spinner = ora('正在加载配置...').start();

      try {
        // 初始化配置
        const configPath = program.opts().config;
        const config = configManager.init(configPath);

        spinner.text = '正在扫描文件...';

        // 确定要扫描的文件模式
        const includePatterns = options.pattern ?
          [options.pattern] : config.include;

        const excludePatterns = options.ignore ?
          [options.ignore] : config.exclude;

        // 获取匹配的文件
        const files = await findFiles(includePatterns, excludePatterns);

        if (files.length === 0) {
          spinner.warn('未找到匹配的文件');
          return;
        }

        spinner.text = `找到 ${files.length} 个文件，正在替换中文文案...`;

        // 创建键值管理器
        const keyValueManager = new KeyValueManager({
          config: {
            keyGeneration: config.keyGeneration,
            locale: config.locale,
            fallbackLocale: config.fallbackLocale,
            outputDir: config.outputDir
          },
          debug: program.opts().debug
        });

        // 加载现有的键值对数据
        if (!keyValueManager.loadExistingData()) {
          spinner.fail(`未找到语言文件，请先运行 ${chalk.cyan('i18n-xy extract')} 提取中文文案`);
          return;
        }

        // 创建导入管理器
        const importManager = new ImportManager({
          config: config.replacement.autoImport,
          debug: program.opts().debug
        });

        // 创建AST处理器
        const astProcessor = new ASTProcessor({
          debug: program.opts().debug,
          replace: true,
          autoImport: options.autoImport !== false && config.replacement.autoImport.enabled
        });

        // 处理文件
        let replacedCount = 0;
        let replacedFiles = 0;

        for (const file of files) {
          try {
            // 读取文件内容
            const content = fs.readFileSync(file, 'utf-8');

            // 处理代码
            const result = astProcessor.processCode(content);

            if (result.hasReplaced) {
              replacedFiles++;
              replacedCount += result.extractedTexts.length;

              if (!options.dryRun) {
                // 写入替换后的内容
                fs.writeFileSync(file, result.code, 'utf-8');

                // 自动导入
                if (options.autoImport !== false && config.replacement.autoImport.enabled) {
                  importManager.addImportToFile(file, config.replacement.functionName);
                }
              }

              if (program.opts().verbose) {
                console.log(`\n${chalk.cyan(file)}`);
                result.extractedTexts.forEach((item, index) => {
                  const key = keyValueManager.getKeyByValue(item.text);
                  console.log(`  ${index + 1}. ${chalk.yellow(item.text)} => ${chalk.green(`${config.replacement.functionName}('${key}')`)}`);
                });
              }
            }
          } catch (error) {
            if (program.opts().verbose) {
              console.error(`\n处理文件失败: ${file}`);
              console.error(error);
            }
          }
        }

        if (!options.dryRun) {
          spinner.succeed(`替换完成，共替换 ${replacedCount} 处中文文案，影响 ${replacedFiles} 个文件`);
          console.log(`\n运行 ${chalk.cyan('i18n-xy translate')} 翻译到其他语言`);
        } else {
          spinner.succeed(`扫描完成，共发现 ${replacedCount} 处可替换的中文文案，影响 ${replacedFiles} 个文件（未写入文件）`);
        }
      } catch (error) {
        spinner.fail(`替换中文文案失败: ${error instanceof Error ? error.message : String(error)}`);
        if (program.opts().debug) {
          console.error(error);
        }
      }
    });
}

/**
 * 查找匹配的文件
 * @param includePatterns 包含模式
 * @param excludePatterns 排除模式
 * @returns 匹配的文件路径数组
 */
async function findFiles(includePatterns: string[], excludePatterns: string[]): Promise<string[]> {
  const files: string[] = [];

  for (const pattern of includePatterns) {
    const matches = await glob(pattern, {
      ignore: excludePatterns,
      nodir: true
    });

    files.push(...matches);
  }

  // 去重
  return [...new Set(files)];
} 