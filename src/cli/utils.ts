import path from 'path';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { Config } from '../types/config';
import { configManager } from '../config';
import { findFiles } from '../utils/file';
import { Logger } from '../utils/logger';

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
export async function findMatchingFiles(includePatterns: string[], excludePatterns: string[]): Promise<string[]> {
  try {
    // 使用file.ts模块的findFiles函数
    const matches = findFiles(includePatterns, {
      ignore: excludePatterns,
      nodir: true
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
    console.error(error);
  }
} 