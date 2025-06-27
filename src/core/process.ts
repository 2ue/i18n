/**
 * 核心处理流程模块
 * 负责整合各个模块的功能，实现完整的处理流程
 */

import fs from 'fs-extra';
import path from 'path';
import { Config } from '../types/config';
import { configManager } from '../config';
import { Logger } from '../utils/logger';
import * as FileUtil from '../utils/file';
import { ASTProcessor } from './ast-processor';
import { KeyValueManager, keyValueManager } from './key-value-manager';
import { translationProcessor } from './translation';
import { globalManager, GlobalNamespaces } from '../utils/globals';

// 创建日志记录器
const logger = Logger.create({ prefix: 'PROCESS' });

/**
 * 处理结果接口
 */
export interface ProcessResult {
  /**
   * 扫描的文件数量
   */
  scannedFiles: number;

  /**
   * 提取的中文文本数量
   */
  extractedTexts: number;

  /**
   * 替换的文件数量
   */
  replacedFiles: number;

  /**
   * 成功处理的文件数量
   */
  successFiles: number;

  /**
   * 失败处理的文件数量
   */
  failedFiles: number;

  /**
   * 处理过程中的错误信息（如果有）
   */
  errors?: string[];
}

/**
 * 主流程处理选项
 */
export interface ProcessOptions {
  /**
   * 是否只提取，不替换
   */
  extractOnly?: boolean;

  /**
   * 是否自动添加导入语句
   */
  autoImport?: boolean;

  /**
   * 是否写入文件
   */
  dryRun?: boolean;

  /**
   * 是否打印详细日志
   */
  verbose?: boolean;

  /**
   * 是否处于调试模式
   */
  debug?: boolean;

  /**
   * 自定义文件匹配模式（覆盖配置文件中的include）
   */
  patterns?: string[];

  /**
   * 自定义忽略模式（覆盖配置文件中的exclude）
   */
  ignores?: string[];

  /**
   * 输出目录（覆盖配置文件中的outputDir）
   */
  output?: string;
}

/**
 * 核心处理流程类
 */
export class Process {
  private config: Config;
  private keyValueManager: KeyValueManager;
  private astProcessor: ASTProcessor;

  /**
   * 构造函数
   * @param configPath 配置文件路径（可选）
   */
  constructor(configPath?: string) {
    // 初始化配置
    this.config = configManager.init(configPath);
    logger.debug('配置初始化完成');

    // 初始化键值管理器
    this.keyValueManager = new KeyValueManager({
      config: {
        keyGeneration: this.config.keyGeneration,
        locale: this.config.locale,
        fallbackLocale: this.config.fallbackLocale,
        outputDir: this.config.outputDir
      }
    });
    logger.debug('键值管理器初始化完成');

    // 初始化AST处理器
    this.astProcessor = new ASTProcessor();
    logger.debug('AST处理器初始化完成');
  }

  /**
   * 执行完整处理流程
   * @param options 处理选项
   * @returns 处理结果
   */
  public execute(options: ProcessOptions = {}): ProcessResult {
    // 初始化结果对象
    const result: ProcessResult = {
      scannedFiles: 0,
      extractedTexts: 0,
      replacedFiles: 0,
      successFiles: 0,
      failedFiles: 0,
      errors: []
    };

    try {
      // 应用命令行选项覆盖配置
      if (options.output) {
        this.config.outputDir = options.output;
      }

      // 加载已有的键值对数据
      this.keyValueManager.loadExistingData();

      // 查找匹配的文件
      const files = this.findMatchingFiles(options);
      result.scannedFiles = files.length;

      logger.info(`找到 ${files.length} 个匹配的文件`);

      if (files.length === 0) {
        return result;
      }

      // 配置AST处理器
      const replace = !options.extractOnly;
      const autoImport = options.autoImport === true;

      this.astProcessor = new ASTProcessor({
        debug: options.debug,
        replace,
        autoImport
      });

      // 处理每个文件
      for (const file of files) {
        try {
          // 读取文件内容
          const content = fs.readFileSync(file, 'utf8');

          // 处理代码
          const processResult = this.astProcessor.processCode(content);

          if (processResult.extractedTexts.length > 0) {
            // 添加提取的文本到键值管理器
            processResult.extractedTexts.forEach(item => {
              this.keyValueManager.add(item.text);
            });

            result.extractedTexts += processResult.extractedTexts.length;

            if (options.verbose) {
              logger.info(`从文件 ${file} 中提取了 ${processResult.extractedTexts.length} 条中文文本`);
              processResult.extractedTexts.forEach((item, index) => {
                const key = this.keyValueManager.getKeyByValue(item.text);
                logger.info(`  ${index + 1}. "${item.text}" => ${key}`);
              });
            }
          }

          // 如果需要替换且有替换结果，写入文件
          if (replace && processResult.hasReplaced && !options.dryRun) {
            fs.writeFileSync(file, processResult.code, 'utf8');
            result.replacedFiles++;

            // 如果需要自动导入，处理导入语句
            if (autoImport) {
              // 注意：实际的导入处理由ASTProcessor的processFile方法完成
              // 这里单独处理是因为我们使用了processCode方法
              const importResult = this.handleImport(file);
              if (!importResult) {
                logger.warn(`自动导入失败: ${file}`);
              }
            }
          }

          result.successFiles++;
        } catch (error) {
          result.failedFiles++;
          const errorMessage = `处理文件 ${file} 失败: ${error instanceof Error ? error.message : String(error)}`;
          logger.error(errorMessage);

          if (options.debug && error instanceof Error) {
            logger.debug(error.stack || error.message);
          }

          result.errors?.push(errorMessage);
        }
      }

      // 保存提取的文案
      if (!options.dryRun && result.extractedTexts > 0) {
        this.keyValueManager.saveToFile();
        logger.info(`提取完成，共提取 ${result.extractedTexts} 条中文文案，保存到 ${this.config.outputDir}`);
      } else if (options.dryRun) {
        logger.info(`扫描完成，共发现 ${result.extractedTexts} 条中文文案（未写入文件）`);
      }

      return result;
    } catch (error) {
      const errorMessage = `处理过程中发生错误: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);

      if (options.debug && error instanceof Error) {
        logger.debug(error.stack || error.message);
      }

      result.errors?.push(errorMessage);
      return result;
    }
  }

  /**
   * 执行翻译流程
   * @param targetLocales 目标语言列表
   * @param options 处理选项
   * @returns 翻译结果
   */
  public async translate(targetLocales: string[], options: ProcessOptions = {}): Promise<Record<string, number>> {
    // 记录每种语言翻译的条数
    const translationCounts: Record<string, number> = {};

    try {
      // 应用命令行选项覆盖配置
      if (options.output) {
        this.config.outputDir = options.output;
      }

      // 对每种目标语言进行翻译
      for (const locale of targetLocales) {
        if (locale === this.config.locale) {
          logger.warn(`跳过源语言: ${locale}`);
          continue;
        }

        try {
          // 使用翻译处理器的translateKeyValueStore方法
          const result = await translationProcessor.translateKeyValueStore(locale, this.config.locale);
          translationCounts[locale] = result.successCount;
        } catch (error) {
          logger.error(`翻译 ${locale} 失败: ${error instanceof Error ? error.message : String(error)}`);
          translationCounts[locale] = 0;
        }
      }

      return translationCounts;
    } catch (error) {
      logger.error(`翻译过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
      if (options.debug && error instanceof Error) {
        logger.debug(error.stack || error.message);
      }
      return translationCounts;
    }
  }

  /**
   * 查找匹配的文件
   * @param options 处理选项
   * @returns 匹配的文件路径数组
   */
  private findMatchingFiles(options: ProcessOptions): string[] {
    // 确定要扫描的文件模式
    const includePatterns = options.patterns || this.config.include;
    const excludePatterns = options.ignores || this.config.exclude;

    // 使用FileUtil查找文件
    return FileUtil.findFiles(includePatterns, {
      ignore: excludePatterns
    });
  }

  /**
   * 处理导入语句
   * @param filePath 文件路径
   * @returns 处理结果
   */
  private handleImport(filePath: string): boolean {
    try {
      const { importManager } = require('./import-manager');
      return importManager.addImportToFile(filePath, this.config.replacement.functionName);
    } catch (error) {
      logger.error(`处理导入语句失败: ${filePath}, ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}

/**
 * 创建处理流程实例
 * @param configPath 配置文件路径（可选）
 */
export function createProcess(configPath?: string): Process {
  return new Process(configPath);
}

/**
 * 默认处理流程实例
 */
export const process = createProcess(); 