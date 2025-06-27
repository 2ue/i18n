import { Logger } from '../../utils/logger';
import { configManager } from '../../config';
import { keyValueManager, KeyValueStore } from '../key-value-manager';
import { TranslationOptions, TranslationResult, TranslationProviderRegistry } from './providers';
import { TranslationQueue } from './queue';

// 导入所有翻译提供者，确保它们被注册
import './providers/baidu';

/**
 * 翻译处理器日志记录器
 */
const translationLogger = Logger.create({ prefix: 'TRANSLATION-PROCESSOR' });

/**
 * 翻译处理器选项接口
 */
export interface TranslationProcessorOptions {
  /**
   * 是否启用调试模式
   */
  debug?: boolean;
}

/**
 * 翻译结果接口
 */
export interface TranslateResult {
  /**
   * 翻译的文本数量
   */
  count: number;

  /**
   * 成功翻译的文本数量
   */
  successCount: number;

  /**
   * 失败的文本数量
   */
  failCount: number;

  /**
   * 翻译结果
   */
  results: TranslationResult[];

  /**
   * 错误信息
   */
  errors: Array<{
    text: string;
    error: any;
  }>;
}

/**
 * 翻译处理器类
 * 负责调用翻译API，将中文文本翻译为其他语言
 */
export class TranslationProcessor {
  private debug: boolean;
  private queue: TranslationQueue | null = null;
  private providerRegistry: TranslationProviderRegistry;

  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options: TranslationProcessorOptions = {}) {
    this.debug = options.debug || false;
    this.providerRegistry = TranslationProviderRegistry.getInstance();
    translationLogger.debug('翻译处理器初始化完成');
  }

  /**
   * 初始化翻译队列
   * @returns 是否成功初始化
   */
  public initQueue(): boolean {
    try {
      // 获取配置
      const config = configManager.getOrDefault();
      const { translation } = config;

      // 检查是否启用翻译
      if (!translation.enabled) {
        translationLogger.warn('翻译功能未启用，请在配置中启用');
        return false;
      }

      // 检查提供者是否已注册
      const providerName = translation.provider;
      if (!this.providerRegistry.hasProvider(providerName)) {
        translationLogger.error(`未注册的翻译提供者: ${providerName}`);
        return false;
      }

      try {
        // 创建翻译提供者
        const provider = this.providerRegistry.create(providerName, {
          name: providerName,
          enabled: true,
          retryTimes: translation.retryTimes,
          retryDelay: translation.retryDelay,
          concurrency: translation.concurrency,
          batchDelay: translation.batchDelay,
          defaultSourceLang: translation.defaultSourceLang,
          defaultTargetLang: translation.defaultTargetLang,
          ...translation[providerName] // 添加特定提供者的配置
        });

        // 创建翻译队列
        this.queue = new TranslationQueue(provider, {
          concurrency: translation.concurrency,
          retryTimes: translation.retryTimes,
          retryDelay: translation.retryDelay,
          batchDelay: translation.batchDelay,
          debug: this.debug
        });

        translationLogger.debug(`${providerName}翻译队列初始化完成`);
        return true;
      } catch (error) {
        translationLogger.error(`创建翻译提供者失败: ${error instanceof Error ? error.message : String(error)}`);
        return false;
      }
    } catch (error) {
      translationLogger.error(`初始化翻译队列失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 翻译文本
   * @param text 要翻译的文本
   * @param options 翻译选项
   * @returns 翻译结果
   */
  public async translateText(text: string, options?: TranslationOptions): Promise<TranslationResult> {
    try {
      // 确保队列已初始化
      if (!this.queue) {
        if (!this.initQueue()) {
          throw new Error('翻译队列初始化失败');
        }
      }

      // 添加翻译任务
      return await this.queue!.addTask(text, options);
    } catch (error) {
      translationLogger.error(`翻译文本失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * 批量翻译文本
   * @param texts 要翻译的文本数组
   * @param options 翻译选项
   * @returns 翻译结果
   */
  public async translateTexts(texts: string[], options?: TranslationOptions): Promise<TranslateResult> {
    try {
      // 确保队列已初始化
      if (!this.queue) {
        if (!this.initQueue()) {
          throw new Error('翻译队列初始化失败');
        }
      }

      const results: TranslationResult[] = [];
      const errors: Array<{ text: string; error: any }> = [];

      // 批量添加翻译任务
      try {
        const batchResults = await this.queue!.addBatchTasks(texts, options);
        results.push(...batchResults);
      } catch (error) {
        // 如果批量翻译失败，尝试逐个翻译
        translationLogger.warn('批量翻译失败，尝试逐个翻译');

        for (const text of texts) {
          try {
            const result = await this.queue!.addTask(text, options);
            results.push(result);
          } catch (error) {
            errors.push({ text, error });
          }
        }
      }

      return {
        count: texts.length,
        successCount: results.length,
        failCount: errors.length,
        results,
        errors
      };
    } catch (error) {
      translationLogger.error(`批量翻译文本失败: ${error instanceof Error ? error.message : String(error)}`);

      return {
        count: texts.length,
        successCount: 0,
        failCount: texts.length,
        results: [],
        errors: texts.map(text => ({ text, error }))
      };
    }
  }

  /**
   * 翻译键值对存储
   * @param targetLocale 目标语言
   * @param sourceLocale 源语言，默认为配置中的locale
   * @returns 翻译结果
   */
  public async translateKeyValueStore(targetLocale: string, sourceLocale?: string): Promise<TranslateResult> {
    try {
      // 获取配置
      const config = configManager.getOrDefault();
      const sourceLocaleCode = sourceLocale || config.locale;

      // 加载键值对数据
      keyValueManager.loadExistingData([sourceLocaleCode, targetLocale]);

      // 获取源语言的键值对
      const sourceStore = keyValueManager.getAll(sourceLocaleCode);
      const sourceKeys = Object.keys(sourceStore);

      if (sourceKeys.length === 0) {
        translationLogger.warn(`源语言${sourceLocaleCode}没有可翻译的文本`);
        return {
          count: 0,
          successCount: 0,
          failCount: 0,
          results: [],
          errors: []
        };
      }

      // 获取目标语言的键值对
      const targetStore = keyValueManager.getAll(targetLocale);

      // 找出需要翻译的键
      const keysToTranslate = sourceKeys.filter(key => !targetStore[key]);
      const textsToTranslate = keysToTranslate.map(key => sourceStore[key]);

      if (textsToTranslate.length === 0) {
        translationLogger.info(`目标语言${targetLocale}已包含所有键，无需翻译`);
        return {
          count: 0,
          successCount: 0,
          failCount: 0,
          results: [],
          errors: []
        };
      }

      translationLogger.info(`开始翻译${textsToTranslate.length}个文本，从${sourceLocaleCode}到${targetLocale}`);

      // 翻译文本
      const translateResult = await this.translateTexts(textsToTranslate, {
        from: this.mapLocaleToLangCode(sourceLocaleCode),
        to: this.mapLocaleToLangCode(targetLocale),
        debug: this.debug
      });

      // 更新键值对存储
      const newTargetStore: KeyValueStore = { ...targetStore };

      translateResult.results.forEach((result, index) => {
        const key = keysToTranslate[index];
        newTargetStore[key] = result.target;
      });

      // 合并到键值对管理器
      keyValueManager.merge(newTargetStore, targetLocale);

      // 保存到文件
      keyValueManager.saveToFile([targetLocale]);

      translationLogger.info(`翻译完成，成功翻译${translateResult.successCount}个文本，失败${translateResult.failCount}个`);

      return translateResult;
    } catch (error) {
      translationLogger.error(`翻译键值对存储失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * 将语言区域代码映射到翻译API使用的语言代码
   * @param locale 语言区域代码
   * @returns 翻译API使用的语言代码
   */
  private mapLocaleToLangCode(locale: string): string {
    // 简单处理，取语言代码部分
    return locale.split('-')[0];
  }

  /**
   * 获取已注册的翻译提供者列表
   * @returns 提供者名称数组
   */
  public getAvailableProviders(): string[] {
    return this.providerRegistry.getProviderNames();
  }
}

/**
 * 创建翻译处理器
 * @param options 选项
 * @returns 翻译处理器实例
 */
export function createTranslationProcessor(options: TranslationProcessorOptions = {}): TranslationProcessor {
  return new TranslationProcessor(options);
}

/**
 * 默认翻译处理器实例
 */
export const translationProcessor = createTranslationProcessor();

// 导出子模块
export * from './providers';
export * from './queue'; 