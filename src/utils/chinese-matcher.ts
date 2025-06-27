import { Logger } from './logger';

/**
 * 中文匹配规则模块
 * 提供中文文本匹配规则定义，支持全中文匹配和包含中文匹配两种模式
 */

// 创建专用日志记录器
const chineseMatcherLogger = Logger.create({ prefix: 'CHINESE-MATCHER' });

/**
 * 匹配模式枚举
 */
export enum ChineseMatchMode {
  /**
   * 全中文匹配模式 - 字符串必须全部由中文字符组成
   */
  ALL_CHINESE = 'all_chinese',

  /**
   * 包含中文匹配模式 - 字符串中包含至少一个中文字符
   */
  CONTAINS_CHINESE = 'contains_chinese'
}

/**
 * 中文字符Unicode范围
 */
const CHINESE_RANGES = {
  // 基本汉字
  BASE: '\u4e00-\u9fa5',
  // 扩展汉字
  EXT_A: '\u9fa6-\u9fef',
  // 兼容汉字
  COMPAT: '\ufa0c-\ufa29',
  // 中文标点符号
  PUNCT: '\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\u2000-\u206f'
};

/**
 * 中文字符Unicode范围正则表达式（包括标点符号）
 */
const CHINESE_CHAR_REGEX = new RegExp(`[${CHINESE_RANGES.BASE}${CHINESE_RANGES.EXT_A}${CHINESE_RANGES.COMPAT}${CHINESE_RANGES.PUNCT}]`);

/**
 * 全中文字符串正则表达式（包括中文标点符号和空白字符）
 */
const ALL_CHINESE_REGEX = new RegExp(`^[${CHINESE_RANGES.BASE}${CHINESE_RANGES.EXT_A}${CHINESE_RANGES.COMPAT}${CHINESE_RANGES.PUNCT}\\s]+$`);

/**
 * 检查字符串是否全部由中文字符组成
 * @param text 要检查的字符串
 * @returns 是否全部由中文字符组成
 */
export function isAllChinese(text: string): boolean {
  if (!text || text.trim() === '') {
    return false;
  }

  return ALL_CHINESE_REGEX.test(text);
}

/**
 * 检查字符串是否包含中文字符
 * @param text 要检查的字符串
 * @returns 是否包含中文字符
 */
export function containsChinese(text: string): boolean {
  if (!text || text.trim() === '') {
    return false;
  }

  return CHINESE_CHAR_REGEX.test(text);
}

/**
 * 匹配器选项接口
 */
export interface ChineseMatcherOptions {
  /**
   * 匹配模式，默认为包含中文匹配
   */
  mode?: ChineseMatchMode;

  /**
   * 是否排除注释中的中文，默认为false
   */
  excludeComments?: boolean;

  /**
   * 是否排除字符串字面量中的中文，默认为false
   */
  excludeStringLiterals?: boolean;

  /**
   * 自定义排除规则（正则表达式）
   */
  excludePatterns?: RegExp[];
}

/**
 * 中文匹配器类
 */
export class ChineseMatcher {
  private mode: ChineseMatchMode;
  private excludeComments: boolean;
  private excludeStringLiterals: boolean;
  private excludePatterns: RegExp[];

  /**
   * 构造函数
   * @param options 匹配器选项
   */
  constructor(options: ChineseMatcherOptions = {}) {
    this.mode = options.mode || ChineseMatchMode.CONTAINS_CHINESE;
    this.excludeComments = options.excludeComments || false;
    this.excludeStringLiterals = options.excludeStringLiterals || false;
    this.excludePatterns = options.excludePatterns || [];

    chineseMatcherLogger.debug(`创建中文匹配器: 模式=${this.mode}`);
  }

  /**
   * 检查文本是否匹配中文规则
   * @param text 要检查的文本
   * @returns 是否匹配
   */
  public match(text: string): boolean {
    // 空字符串不匹配
    if (!text || text.trim() === '') {
      return false;
    }

    // 检查是否应该排除
    if (this.shouldExclude(text)) {
      chineseMatcherLogger.debug(`文本被排除规则排除: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`);
      return false;
    }

    // 根据模式进行匹配
    let isMatch = false;

    if (this.mode === ChineseMatchMode.ALL_CHINESE) {
      isMatch = isAllChinese(text);
    } else {
      isMatch = containsChinese(text);
    }

    if (isMatch) {
      chineseMatcherLogger.debug(`匹配成功: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`);
    }

    return isMatch;
  }

  /**
   * 检查文本是否应该被排除
   * @param text 要检查的文本
   * @returns 是否应该被排除
   */
  private shouldExclude(text: string): boolean {
    // 检查自定义排除规则
    for (const pattern of this.excludePatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    // 排除注释中的中文
    if (this.excludeComments) {
      // 简单的注释检测
      if (text.trim().startsWith('//') || (text.includes('/*') && text.includes('*/'))) {
        return true;
      }

      // 对于行内注释，需要更复杂的检测
      // 这里的实现比较简单，实际项目中可能需要更复杂的AST分析
      if (text.includes('//')) {
        // 如果行内注释前有中文，则不排除
        const parts = text.split('//');
        if (parts.length > 1 && !containsChinese(parts[0])) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 提取文本中的所有中文片段
   * @param text 要提取的文本
   * @returns 中文片段数组
   */
  public extractChineseSegments(text: string): string[] {
    if (!text || text.trim() === '' || this.shouldExclude(text)) {
      return [];
    }

    // 使用正则表达式提取中文片段
    const segments: string[] = [];

    // 根据不同模式使用不同的正则表达式
    if (this.mode === ChineseMatchMode.ALL_CHINESE) {
      // 全中文模式下，只提取完全由中文组成的部分
      // 修复提取中文标点符号的问题
      const regex = new RegExp(`([${CHINESE_RANGES.BASE}${CHINESE_RANGES.EXT_A}${CHINESE_RANGES.COMPAT}${CHINESE_RANGES.PUNCT}]+)`, 'g');
      let match;
      while ((match = regex.exec(text)) !== null) {
        segments.push(match[0]);
      }
    } else {
      // 包含中文模式下，如果整个字符串包含中文，则返回整个字符串
      if (containsChinese(text)) {
        return [text];
      }
    }

    return segments;
  }

  /**
   * 设置匹配模式
   * @param mode 匹配模式
   */
  public setMode(mode: ChineseMatchMode): void {
    this.mode = mode;
    chineseMatcherLogger.debug(`设置匹配模式: ${mode}`);
  }

  /**
   * 获取当前匹配模式
   * @returns 当前匹配模式
   */
  public getMode(): ChineseMatchMode {
    return this.mode;
  }
}

/**
 * 创建中文匹配器工厂函数
 * @param options 匹配器选项
 * @returns 中文匹配器实例
 */
export function createChineseMatcher(options: ChineseMatcherOptions = {}): ChineseMatcher {
  return new ChineseMatcher(options);
}

/**
 * 默认中文匹配器实例（使用包含中文匹配模式）
 */
export const defaultChineseMatcher = createChineseMatcher(); 