import path from 'path';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { Command } from 'commander';
import { Config } from '../types/config';
import { configManager } from '../config';
import { findFiles } from '../utils/file';
import { Logger } from '../utils/logger';
import { Process, ProcessOptions, ProcessResult } from '../core/process';
import fs from 'fs-extra';

// 创建独立的日志记录器
const cliLogger = Logger.create({ prefix: 'CLI' });

/**
 * CLI辅助模块
 * 提供CLI命令共享逻辑，减少重复代码
 */

/**
 * 查找匹配的文件
 * @param includePatterns 包含模式
 * @param excludePatterns 排除模式
 * @returns 匹配的文件路径数组
 */
export function findMatchingFiles(includePatterns: string[], excludePatterns: string[]): string[] {
  try {
    // 使用file.ts模块的findFiles函数
    const matches = findFiles(includePatterns, {
      ignore: excludePatterns,
      // fast-glob选项，只匹配文件而非目录
      onlyFiles: true
    });

    // 去重
    return [...new Set(matches)];
  } catch (error) {
    cliLogger.error(`查找匹配文件失败`, error);
    return [];
  }
}

/**
 * 加载配置
 * @param configPath 可选的配置文件路径
 * @param options 命令行选项，可能覆盖配置项
 * @returns 加载并合并后的配置
 */
export function loadConfiguration(configPath?: string, options: Record<string, any> = {}): Config {
  try {
    // 初始化配置
    const config = configManager.init(configPath);

    // 应用命令行选项覆盖配置
    if (options.output) {
      config.outputDir = options.output;
    }

    return config;
  } catch (error) {
    cliLogger.error(`加载配置失败`, error);
    throw new Error(`配置加载失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 创建进度显示器
 * @param text 初始文本
 * @returns ora实例
 */
export function createSpinner(text: string): Ora {
  return ora(text).start();
}

/**
 * 格式化输出路径
 * @param filePath 文件路径
 * @returns 格式化后的路径字符串
 */
export function formatPath(filePath: string): string {
  return chalk.cyan(filePath);
}

/**
 * 格式化数量统计
 * @param count 数量
 * @param unit 单位
 * @returns 格式化后的数量字符串
 */
export function formatCount(count: number, unit: string): string {
  return `${chalk.yellow(count.toString())} ${unit}`;
}

/**
 * 格式化命令提示
 * @param command 命令
 * @returns 格式化后的命令字符串
 */
export function formatCommand(command: string): string {
  return chalk.cyan(command);
}

/**
 * 获取命令行选项中的通用选项
 * @param program Commander实例
 * @returns 通用选项对象
 */
export function getCommonOptions(program: any): { debug: boolean; verbose: boolean; config?: string } {
  return {
    debug: program.opts().debug || false,
    verbose: program.opts().verbose || false,
    config: program.opts().config
  };
}

/**
 * 处理命令错误
 * @param spinner spinner实例
 * @param error 错误对象
 * @param isDebug 是否处于调试模式
 */
export function handleCommandError(spinner: Ora, error: unknown, isDebug = false): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  spinner.fail(`操作失败: ${errorMessage}`);

  if (isDebug) {
    console.error(error instanceof Error ? error.stack || error.message : error);
  }
}

/**
 * 格式化消息，替换占位符
 * @param message 消息模板
 * @param data 替换数据
 * @returns 格式化后的消息
 */
function formatMessage(message: string, data: Record<string, any>): string {
  return message.replace(/\{(\w+)\}/g, (_, key) => {
    if (key in data) {
      if (typeof data[key] === 'number') {
        return formatCount(data[key], ''); // 数字格式化
      }
      return String(data[key]);
    }
    return `{${key}}`;
  });
}

export function displayProcessResult(
  spinner: Ora,
  result: ProcessResult,
  options: { dryRun?: boolean; output?: string },
  successMessages: {
    dryRun: string;
    normal: string;
    nextCommand?: string;
  }
): void {
  // 处理扫描结果为空的情况
  if (result.scannedFiles === 0) {
    spinner.warn('未找到匹配的文件');
    return;
  }

  // 显示处理失败信息
  if (result.failedFiles > 0) {
    spinner.warn(`处理过程中有 ${result.failedFiles} 个文件失败`);

    if (result.errors && result.errors.length > 0) {
      console.log('\n错误详情:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
  }

  // 格式化消息数据
  const messageData = {
    scannedFiles: result.scannedFiles,
    extractedTexts: result.extractedTexts,
    replacedFiles: result.replacedFiles,
    successFiles: result.successFiles,
    failedFiles: result.failedFiles
  };

  // 显示成功信息
  if (options.dryRun) {
    spinner.succeed(formatMessage(successMessages.dryRun, messageData));
  } else {
    spinner.succeed(formatMessage(successMessages.normal, messageData));

    if (result.extractedTexts > 0) {
      console.log(`\n中文文案已保存到: ${formatPath(path.join(options.output || 'locales'))}`);

      if (successMessages.nextCommand && result.replacedFiles > 0) {
        console.log(`\n${formatMessage(successMessages.nextCommand, messageData)}`);
      }
    }
  }
}

/**
 * 通用命令处理流程接口
 */
export interface CommandHandlerOptions {
  /**
   * 命令选项
   */
  options: Record<string, any>;

  /**
   * Commander程序实例
   */
  program: Command;

  /**
   * 处理初始文本
   */
  initialText?: string;

  /**
   * 处理进行中文本
   */
  processingText?: string;

  /**
   * 成功消息配置
   */
  successMessages: {
    /**
     * 正常模式成功消息
     */
    normal: string;

    /**
     * 仅测试模式成功消息
     */
    dryRun: string;

    /**
     * 下一步命令提示（可选）
     */
    nextCommand?: string;
  };
}

/**
 * 提取命令处理函数接口
 */
export interface ExtractCommandHandler extends CommandHandlerOptions {
  /**
   * 是否只提取不替换
   */
  extractOnly: boolean;

  /**
   * 是否自动添加导入语句
   */
  autoImport?: boolean;
}

/**
 * 通用提取/替换命令处理流程
 * @param options 命令处理选项
 * @returns 处理结果
 */
export async function handleExtractCommand(options: ExtractCommandHandler): Promise<void> {
  const {
    options: cmdOptions,
    program,
    initialText = '正在加载配置...',
    processingText = '正在扫描文件...',
    successMessages,
    extractOnly,
    autoImport = false
  } = options;

  const spinner = createSpinner(initialText);

  try {
    // 获取配置路径
    const configPath = program.opts().config;

    // 创建处理流程实例
    const processManager = new Process(configPath);

    spinner.text = processingText;

    // 转换选项
    const processOptions: ProcessOptions = {
      extractOnly,
      autoImport: cmdOptions.autoImport || autoImport,
      dryRun: cmdOptions.dryRun || false,
      verbose: program.opts().verbose || false,
      debug: program.opts().debug || false,
      output: cmdOptions.output,
      patterns: cmdOptions.pattern ? [cmdOptions.pattern] : undefined,
      ignores: cmdOptions.ignore ? [cmdOptions.ignore] : undefined
    };

    // 执行处理流程
    const result = processManager.execute(processOptions);

    // 显示结果
    displayProcessResult(spinner, result, cmdOptions, successMessages);

  } catch (error) {
    handleCommandError(spinner, error, program.opts().debug);
  }
}

/**
 * 翻译命令选项接口
 */
export interface TranslateCommandHandler extends CommandHandlerOptions {
  /**
   * 获取目标语言的函数
   * @param config 配置对象
   * @param locale 命令行选项中的locale参数
   * @returns 目标语言数组
   */
  getTargetLocales: (config: Config, locale?: string) => string[];
}

/**
 * 通用翻译命令处理流程
 * @param options 命令处理选项
 * @returns 处理结果
 */
export async function handleTranslateCommand(options: TranslateCommandHandler): Promise<void> {
  const {
    options: cmdOptions,
    program,
    initialText = '正在加载配置...',
    processingText = '正在翻译中文文案...',
    successMessages,
    getTargetLocales
  } = options;

  const spinner = createSpinner(initialText);

  try {
    // 获取配置路径
    const configPath = program.opts().config;

    // 加载配置
    const config = loadConfiguration(configPath, cmdOptions);

    // 获取目标语言列表
    const targetLocales = getTargetLocales(config, cmdOptions.locale);

    // 检查是否有目标语言
    if (!targetLocales || targetLocales.length === 0) {
      spinner.fail('未指定目标语言，请使用 --locale 选项指定，或在配置中设置 translation.defaultTargetLang');
      return;
    }

    spinner.text = `正在准备翻译，目标语言: ${targetLocales.join(', ')}...`;

    // 创建处理流程实例
    const processManager = new Process(configPath);

    // 转换选项
    const processOptions: ProcessOptions = {
      dryRun: cmdOptions.dryRun || false,
      verbose: program.opts().verbose || false,
      debug: program.opts().debug || false,
      output: cmdOptions.output
    };

    spinner.text = processingText;

    // 执行翻译流程
    const result = await processManager.translate(targetLocales, processOptions);

    // 计算总翻译数
    const totalTranslated = Object.values(result).reduce((sum, count) => sum + count, 0);

    // 格式化消息数据
    const messageData = {
      totalTranslated
    };

    if (totalTranslated === 0) {
      spinner.info('没有需要翻译的内容，或翻译过程未产生翻译结果');
    } else if (cmdOptions.dryRun) {
      spinner.succeed(formatMessage(successMessages.dryRun, messageData));
    } else {
      spinner.succeed(formatMessage(successMessages.normal, messageData));

      // 显示各语言的翻译结果
      console.log('\n翻译结果:');
      Object.entries(result).forEach(([locale, count]) => {
        console.log(`  ${locale}: ${chalk.green(count)} 条`);
      });

      console.log(`\n翻译文件已保存到: ${formatPath(path.join(cmdOptions.output || config.outputDir))}`);
    }
  } catch (error) {
    handleCommandError(spinner, error, program.opts().debug);
  }
}

/**
 * 初始化命令处理选项接口
 */
export interface InitCommandHandler extends CommandHandlerOptions {
  /**
   * 配置文件生成函数
   */
  generateConfigContent: (config: any) => string;
}

/**
 * 通用初始化命令处理流程
 * @param options 命令处理选项
 * @returns 处理结果
 */
export async function handleInitCommand(options: InitCommandHandler): Promise<void> {
  const {
    options: cmdOptions,
    program,
    initialText = '正在初始化配置文件...',
    successMessages,
    generateConfigContent
  } = options;

  const spinner = createSpinner(initialText);

  try {
    const outputPath = path.resolve(process.cwd(), cmdOptions.output);

    // 检查文件是否已存在
    if (fs.existsSync(outputPath) && !cmdOptions.force) {
      spinner.fail(`配置文件已存在: ${outputPath}`);
      console.log(`使用 ${formatCommand('--force')} 选项覆盖已存在的配置文件`);
      return;
    }

    // 确保目录存在
    fs.ensureDirSync(path.dirname(outputPath));

    // 获取配置对象
    const config = configManager.getOrDefault();

    // 生成配置文件内容
    const configContent = generateConfigContent(config);

    // 写入配置文件
    fs.writeFileSync(outputPath, configContent, 'utf-8');

    spinner.succeed(`配置文件已生成: ${outputPath}`);

    if (successMessages.nextCommand) {
      console.log(`\n${successMessages.nextCommand}`);
    }
  } catch (error) {
    handleCommandError(spinner, error, program.opts().debug);
  }
}

/**
 * 格式化帮助文本
 * @param command 命令名称
 * @param description 命令描述
 * @param examples 命令示例数组，每个元素格式为 [command, description]
 * @returns 格式化的帮助文本
 */
export function formatHelpText(
  command: string,
  description: string,
  examples: Array<[string, string]>
): string {
  let helpText = `\n${chalk.bold(command)} - ${description}\n\n${chalk.bold('示例:')}\n`;

  examples.forEach(([cmd, desc]) => {
    helpText += `  ${chalk.cyan(cmd.padEnd(40))} ${desc}\n`;
  });

  return helpText;
} 