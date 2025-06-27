import { Logger } from '../utils/logger';
import { configManager } from '../config';
import { ReplacementConfig } from '../config';

/**
 * 替换管理器日志记录器
 */
const replaceLogger = Logger.create({ prefix: 'REPLACE-MANAGER' });

/**
 * 引号类型枚举
 */
export enum QuoteType {
  SINGLE = "'",
  DOUBLE = '"',
  BACKTICK = '`'
}

/**
 * 替换上下文接口
 */
export interface ReplacementContext {
  /**
   * 文件路径
   */
  filePath: string;

  /**
   * 是否是JSX文件
   */
  isJSX?: boolean;

  /**
   * 是否是TypeScript文件
   */
  isTS?: boolean;
}

/**
 * 替换选项接口
 */
export interface ReplacementOptions {
  /**
   * 配置对象，如果不提供则使用全局配置
   */
  config?: Partial<ReplacementConfig>;

  /**
   * 是否启用调试模式
   */
  debug?: boolean;

  /**
   * 默认引号类型
   */
  defaultQuoteType?: QuoteType;
}

/**
 * 参数对象接口
 */
export interface ParamsObject {
  [key: string]: string | number | boolean;
}

/**
 * 替换管理器类
 * 负责将中文文本替换为国际化函数调用
 */
export class ReplacementManager {
  private config: ReplacementConfig;
  private debug: boolean;
  private defaultQuoteType: QuoteType;

  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options: ReplacementOptions = {}) {
    this.debug = options.debug || false;
    this.defaultQuoteType = options.defaultQuoteType || QuoteType.SINGLE;

    // 获取全局配置
    const globalConfig = configManager.getOrDefault();

    // 使用提供的配置或全局配置
    this.config = {
      functionName: options.config?.functionName || globalConfig.replacement.functionName,
      autoImport: options.config?.autoImport || globalConfig.replacement.autoImport
    };

    replaceLogger.debug('ReplacementManager初始化完成');
  }

  /**
   * 替换字符串
   * @param text 原始中文文本
   * @param key 国际化键名
   * @param quoteType 引号类型，默认使用构造函数中设置的默认引号类型
   * @param context 替换上下文
   * @returns 替换后的国际化函数调用
   */
  public replace(text: string, key: string, quoteType?: QuoteType, context?: ReplacementContext): string {
    const quote = quoteType || this.defaultQuoteType;
    const functionName = this.config.functionName;

    // 构建基本替换字符串
    const replacement = `${functionName}(${quote}${key}${quote})`;

    if (this.debug) {
      replaceLogger.debug(`替换文本: "${text}" -> ${replacement}`);
    }

    return replacement;
  }

  /**
   * 带参数替换字符串
   * @param text 原始中文文本
   * @param key 国际化键名
   * @param params 参数对象
   * @param quoteType 引号类型，默认使用构造函数中设置的默认引号类型
   * @param context 替换上下文
   * @returns 替换后的国际化函数调用
   */
  public replaceWithParams(
    text: string,
    key: string,
    params: ParamsObject,
    quoteType?: QuoteType,
    context?: ReplacementContext
  ): string {
    const quote = quoteType || this.defaultQuoteType;
    const functionName = this.config.functionName;

    // 将参数对象转换为字符串
    const paramsString = this.stringifyParams(params);

    // 构建带参数的替换字符串
    const replacement = `${functionName}(${quote}${key}${quote}, ${paramsString})`;

    if (this.debug) {
      replaceLogger.debug(`替换带参数文本: "${text}" -> ${replacement}`);
    }

    return replacement;
  }

  /**
   * 替换JSX文本
   * @param text 原始中文文本
   * @param key 国际化键名
   * @param quoteType 引号类型，默认使用构造函数中设置的默认引号类型
   * @returns 替换后的JSX中的国际化函数调用
   */
  public replaceJSX(text: string, key: string, quoteType?: QuoteType): string {
    const quote = quoteType || this.defaultQuoteType;
    const functionName = this.config.functionName;

    // 在JSX中，国际化函数调用需要用花括号包裹
    const replacement = `{${functionName}(${quote}${key}${quote})}`;

    if (this.debug) {
      replaceLogger.debug(`替换JSX文本: "${text}" -> ${replacement}`);
    }

    return replacement;
  }

  /**
   * 替换JSX带参数文本
   * @param text 原始中文文本
   * @param key 国际化键名
   * @param params 参数对象
   * @param quoteType 引号类型，默认使用构造函数中设置的默认引号类型
   * @returns 替换后的JSX中的带参数国际化函数调用
   */
  public replaceJSXWithParams(
    text: string,
    key: string,
    params: ParamsObject,
    quoteType?: QuoteType
  ): string {
    const quote = quoteType || this.defaultQuoteType;
    const functionName = this.config.functionName;

    // 将参数对象转换为字符串
    const paramsString = this.stringifyParams(params);

    // 在JSX中，国际化函数调用需要用花括号包裹
    const replacement = `{${functionName}(${quote}${key}${quote}, ${paramsString})}`;

    if (this.debug) {
      replaceLogger.debug(`替换JSX带参数文本: "${text}" -> ${replacement}`);
    }

    return replacement;
  }

  /**
   * 替换模板字符串
   * @param text 原始中文文本
   * @param key 国际化键名
   * @param quoteType 引号类型，默认使用构造函数中设置的默认引号类型
   * @returns 替换后的模板字符串中的国际化函数调用
   */
  public replaceTemplate(text: string, key: string, quoteType?: QuoteType): string {
    const quote = quoteType || this.defaultQuoteType;
    const functionName = this.config.functionName;

    // 在模板字符串中，国际化函数调用需要用${}包裹
    const replacement = `\${${functionName}(${quote}${key}${quote})}`;

    if (this.debug) {
      replaceLogger.debug(`替换模板字符串文本: "${text}" -> ${replacement}`);
    }

    return replacement;
  }

  /**
   * 替换模板字符串带参数
   * @param text 原始中文文本
   * @param key 国际化键名
   * @param params 参数对象
   * @param quoteType 引号类型，默认使用构造函数中设置的默认引号类型
   * @returns 替换后的模板字符串中的带参数国际化函数调用
   */
  public replaceTemplateWithParams(
    text: string,
    key: string,
    params: ParamsObject,
    quoteType?: QuoteType
  ): string {
    const quote = quoteType || this.defaultQuoteType;
    const functionName = this.config.functionName;

    // 将参数对象转换为字符串
    const paramsString = this.stringifyParams(params);

    // 在模板字符串中，国际化函数调用需要用${}包裹
    const replacement = `\${${functionName}(${quote}${key}${quote}, ${paramsString})}`;

    if (this.debug) {
      replaceLogger.debug(`替换模板字符串带参数文本: "${text}" -> ${replacement}`);
    }

    return replacement;
  }

  /**
   * 根据引号类型获取字符串字面量
   * @param text 文本内容
   * @param quoteType 引号类型
   * @returns 带引号的字符串字面量
   */
  public getQuotedString(text: string, quoteType: QuoteType = this.defaultQuoteType): string {
    // 处理特殊字符转义
    let escapedText = text;

    if (quoteType === QuoteType.SINGLE) {
      // 单引号需要转义单引号
      escapedText = text.replace(/'/g, "\\'");
      return `'${escapedText}'`;
    } else if (quoteType === QuoteType.DOUBLE) {
      // 双引号需要转义双引号
      escapedText = text.replace(/"/g, '\\"');
      return `"${escapedText}"`;
    } else {
      // 反引号需要转义反引号
      escapedText = text.replace(/`/g, '\\`');
      return `\`${escapedText}\``;
    }
  }

  /**
   * 将参数对象转换为字符串
   * @param params 参数对象
   * @returns 参数对象字符串表示
   */
  private stringifyParams(params: ParamsObject): string {
    // 简单实现，可以根据需要扩展
    return `{${Object.entries(params)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          // 字符串值需要加引号
          return `${key}: ${this.getQuotedString(value)}`;
        } else {
          // 数字、布尔值等直接使用
          return `${key}: ${value}`;
        }
      })
      .join(', ')}}`;
  }

  /**
   * 检测字符串的引号类型
   * @param text 带引号的字符串
   * @returns 引号类型，如果无法检测则返回默认引号类型
   */
  public detectQuoteType(text: string): QuoteType {
    if (text.startsWith("'") && text.endsWith("'")) {
      return QuoteType.SINGLE;
    } else if (text.startsWith('"') && text.endsWith('"')) {
      return QuoteType.DOUBLE;
    } else if (text.startsWith('`') && text.endsWith('`')) {
      return QuoteType.BACKTICK;
    } else {
      return this.defaultQuoteType;
    }
  }

  /**
   * 获取当前配置
   * @returns 替换配置
   */
  public getConfig(): ReplacementConfig {
    return { ...this.config };
  }
}

/**
 * 创建替换管理器
 * @param options 选项
 * @returns 替换管理器实例
 */
export function createReplacementManager(options: ReplacementOptions = {}): ReplacementManager {
  return new ReplacementManager(options);
}

/**
 * 默认替换管理器实例
 */
export const replacementManager = createReplacementManager(); 