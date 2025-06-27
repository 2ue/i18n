import { Logger } from '../../../utils/logger';

/**
 * 翻译提供者日志记录器
 */
const providerLogger = Logger.create({ prefix: 'TRANSLATION-PROVIDER' });

/**
 * 翻译结果接口
 */
export interface TranslationResult {
  /**
   * 原始文本
   */
  source: string;

  /**
   * 翻译后的文本
   */
  target: string;

  /**
   * 源语言代码
   */
  from: string;

  /**
   * 目标语言代码
   */
  to: string;

  /**
   * 翻译提供者
   */
  provider: string;

  /**
   * 额外信息
   */
  extra?: Record<string, any>;
}

/**
 * 翻译错误接口
 */
export interface TranslationError {
  /**
   * 错误代码
   */
  code: string | number;

  /**
   * 错误消息
   */
  message: string;

  /**
   * 原始错误
   */
  originalError?: any;
}

/**
 * 翻译提供者配置接口
 */
export interface TranslationProviderConfig {
  /**
   * 提供者名称
   */
  name: string;

  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 重试次数
   */
  retryTimes: number;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay: number;

  /**
   * 并发数量
   */
  concurrency: number;

  /**
   * 批次延迟（毫秒）
   */
  batchDelay: number;

  /**
   * 默认源语言
   */
  defaultSourceLang: string;

  /**
   * 默认目标语言
   */
  defaultTargetLang: string;

  /**
   * 其他配置项
   */
  [key: string]: any;
}

/**
 * 翻译选项接口
 */
export interface TranslationOptions {
  /**
   * 源语言代码
   */
  from?: string;

  /**
   * 目标语言代码
   */
  to?: string;

  /**
   * 是否启用调试模式
   */
  debug?: boolean;

  /**
   * 特定翻译提供者的额外选项
   */
  providerOptions?: Record<string, any>;
}

/**
 * 翻译提供者工厂接口
 * 用于注册和创建翻译提供者
 */
export interface TranslationProviderFactory {
  /**
   * 创建翻译提供者
   * @param config 提供者配置
   * @returns 翻译提供者实例
   */
  create(config: TranslationProviderConfig): TranslationProvider;

  /**
   * 提供者名称
   */
  readonly providerName: string;
}

/**
 * 翻译提供者接口
 */
export interface TranslationProvider {
  /**
   * 提供者名称
   */
  readonly name: string;

  /**
   * 配置
   */
  readonly config: TranslationProviderConfig;

  /**
   * 翻译单个文本
   * @param text 要翻译的文本
   * @param options 翻译选项
   * @returns 翻译结果
   */
  translate(text: string, options?: TranslationOptions): Promise<TranslationResult>;

  /**
   * 批量翻译文本
   * @param texts 要翻译的文本数组
   * @param options 翻译选项
   * @returns 翻译结果数组
   */
  batchTranslate(texts: string[], options?: TranslationOptions): Promise<TranslationResult[]>;

  /**
   * 检查配置是否有效
   * @returns 是否有效
   */
  isConfigValid(): boolean;

  /**
   * 获取提供者支持的语言
   * @returns 支持的语言代码数组
   */
  getSupportedLanguages?(): Promise<string[]>;

  /**
   * 获取提供者特定功能
   * @param featureName 功能名称
   * @returns 功能实现
   */
  getFeature?<T>(featureName: string): T | undefined;
}

/**
 * 翻译提供者注册表
 * 用于管理所有可用的翻译提供者
 */
export class TranslationProviderRegistry {
  private static instance: TranslationProviderRegistry;
  private factories: Map<string, TranslationProviderFactory> = new Map();

  /**
   * 获取单例实例
   */
  public static getInstance(): TranslationProviderRegistry {
    if (!TranslationProviderRegistry.instance) {
      TranslationProviderRegistry.instance = new TranslationProviderRegistry();
    }
    return TranslationProviderRegistry.instance;
  }

  /**
   * 注册翻译提供者工厂
   * @param factory 提供者工厂
   */
  public register(factory: TranslationProviderFactory): void {
    this.factories.set(factory.providerName, factory);
    providerLogger.debug(`注册翻译提供者: ${factory.providerName}`);
  }

  /**
   * 创建翻译提供者实例
   * @param providerName 提供者名称
   * @param config 提供者配置
   * @returns 翻译提供者实例
   */
  public create(providerName: string, config: TranslationProviderConfig): TranslationProvider {
    const factory = this.factories.get(providerName);
    if (!factory) {
      throw new Error(`未找到翻译提供者: ${providerName}`);
    }
    return factory.create(config);
  }

  /**
   * 获取所有已注册的提供者名称
   * @returns 提供者名称数组
   */
  public getProviderNames(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * 检查提供者是否已注册
   * @param providerName 提供者名称
   * @returns 是否已注册
   */
  public hasProvider(providerName: string): boolean {
    return this.factories.has(providerName);
  }
}

/**
 * 抽象翻译提供者基类
 */
export abstract class BaseTranslationProvider implements TranslationProvider {
  public readonly name: string;
  public readonly config: TranslationProviderConfig;
  protected debug: boolean;

  /**
   * 构造函数
   * @param name 提供者名称
   * @param config 提供者配置
   */
  constructor(name: string, config: TranslationProviderConfig) {
    this.name = name;
    this.config = config;
    this.debug = false;

    providerLogger.debug(`${name}翻译提供者初始化完成`);
  }

  /**
   * 翻译单个文本
   * @param text 要翻译的文本
   * @param options 翻译选项
   * @returns 翻译结果
   */
  public abstract translate(text: string, options?: TranslationOptions): Promise<TranslationResult>;

  /**
   * 批量翻译文本
   * @param texts 要翻译的文本数组
   * @param options 翻译选项
   * @returns 翻译结果数组
   */
  public abstract batchTranslate(texts: string[], options?: TranslationOptions): Promise<TranslationResult[]>;

  /**
   * 检查配置是否有效
   * @returns 是否有效
   */
  public abstract isConfigValid(): boolean;

  /**
   * 处理翻译错误
   * @param error 错误对象
   * @param text 原文本
   * @param options 翻译选项
   * @returns 翻译错误
   */
  protected handleError(error: any, text?: string, options?: TranslationOptions): TranslationError {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    const errorMessage = error.message || String(error);

    providerLogger.error(`${this.name}翻译失败: ${errorCode} - ${errorMessage}`);

    if (this.debug && text) {
      providerLogger.debug(`失败的翻译文本: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    }

    return {
      code: errorCode,
      message: errorMessage,
      originalError: error
    };
  }

  /**
   * 创建翻译结果
   * @param source 源文本
   * @param target 目标文本
   * @param from 源语言
   * @param to 目标语言
   * @param extra 额外信息
   * @returns 翻译结果
   */
  protected createResult(
    source: string,
    target: string,
    from: string,
    to: string,
    extra?: Record<string, any>
  ): TranslationResult {
    return {
      source,
      target,
      from,
      to,
      provider: this.name,
      extra
    };
  }
} 