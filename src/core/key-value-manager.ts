import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { merge } from 'lodash';
import { pinyin } from 'pinyin-pro';
import { Logger } from '../utils/logger';
import { configManager } from '../config';
import { Config, KeyGenerationConfig, PinyinOptions } from '../config';
import { fileExists, readJSON, writeJSON } from '../utils/file';

/**
 * Key-Value管理器日志记录器
 */
const kvLogger = Logger.create({ prefix: 'KV-MANAGER' });

/**
 * 键值对存储接口
 */
export interface KeyValueStore {
  [key: string]: string;
}

/**
 * 多语言键值对存储接口
 */
export interface LocaleKeyValueStore {
  [locale: string]: KeyValueStore;
}

/**
 * 键值对管理器配置接口
 */
export interface KeyValueManagerConfig {
  keyGeneration: KeyGenerationConfig;
  locale: string;
  fallbackLocale: string;
  outputDir: string;
}

/**
 * 键值对管理器选项接口
 */
export interface KeyValueManagerOptions {
  /**
   * 配置对象，如果不提供则使用全局配置
   */
  config?: Partial<KeyValueManagerConfig>;

  /**
   * 是否启用调试模式
   */
  debug?: boolean;
}

/**
 * 键值对管理器类
 * 负责处理中文文本和对应key的生成、存储、查询和去重
 */
export class KeyValueManager {
  private keyValueStore: LocaleKeyValueStore = {};
  private valueToKeyMap: Map<string, string> = new Map();
  private config: KeyValueManagerConfig;
  private debug: boolean;

  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options: KeyValueManagerOptions = {}) {
    this.debug = options.debug || false;

    // 获取全局配置
    const globalConfig = configManager.getOrDefault();

    // 使用提供的配置或全局配置
    this.config = {
      keyGeneration: options.config?.keyGeneration || globalConfig.keyGeneration,
      locale: options.config?.locale || globalConfig.locale,
      fallbackLocale: options.config?.fallbackLocale || globalConfig.fallbackLocale,
      outputDir: options.config?.outputDir || globalConfig.outputDir
    };

    kvLogger.debug('KeyValueManager初始化完成');
  }

  /**
   * 加载现有的键值对数据
   * @param locales 语言列表，不提供则使用配置中的locale和fallbackLocale
   * @returns 是否成功加载
   */
  public loadExistingData(locales?: string[]): boolean {
    try {
      const targetLocales = locales || [this.config.locale, this.config.fallbackLocale];
      let loadedAny = false;

      for (const locale of targetLocales) {
        const filePath = this.getLocaleFilePath(locale);

        if (fileExists(filePath)) {
          const data = readJSON<KeyValueStore>(filePath);

          if (data) {
            this.keyValueStore[locale] = data;

            // 只对主语言建立value到key的映射
            if (locale === this.config.locale) {
              Object.entries(data).forEach(([key, value]) => {
                this.valueToKeyMap.set(value, key);
              });
            }

            loadedAny = true;
            kvLogger.debug(`已加载${locale}语言文件: ${filePath}, 共${Object.keys(data).length}条记录`);
          }
        } else {
          // 如果文件不存在，初始化为空对象
          this.keyValueStore[locale] = {};
          kvLogger.debug(`${locale}语言文件不存在，已初始化为空对象`);
        }
      }

      return loadedAny;
    } catch (error) {
      kvLogger.error(`加载现有键值对数据失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 保存键值对数据到文件
   * @param locales 语言列表，不提供则保存所有已加载的语言
   * @returns 是否成功保存
   */
  public saveToFile(locales?: string[]): boolean {
    try {
      const targetLocales = locales || Object.keys(this.keyValueStore);

      if (targetLocales.length === 0) {
        kvLogger.error('没有可保存的语言数据');
        return false;
      }

      // 确保输出目录存在
      fs.mkdirpSync(this.config.outputDir);

      for (const locale of targetLocales) {
        const localeData = this.keyValueStore[locale];
        if (localeData) {
          const filePath = this.getLocaleFilePath(locale);
          const sortedData = this.getSortedKeyValueStore(locale);

          writeJSON(filePath, sortedData, true);
          kvLogger.debug(`已保存${locale}语言文件: ${filePath}, 共${Object.keys(sortedData).length}条记录`);
        }
      }

      return true;
    } catch (error) {
      kvLogger.error(`保存键值对数据失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 获取排序后的键值对存储
   * @param locale 语言代码
   * @returns 排序后的键值对存储
   */
  private getSortedKeyValueStore(locale: string): KeyValueStore {
    const store = this.keyValueStore[locale] || {};
    const sortedKeys = Object.keys(store).sort();
    const sortedStore: KeyValueStore = {};

    for (const key of sortedKeys) {
      sortedStore[key] = store[key];
    }

    return sortedStore;
  }

  /**
   * 获取语言文件路径
   * @param locale 语言代码
   * @returns 文件路径
   */
  private getLocaleFilePath(locale: string): string {
    const config = configManager.getOrDefault();
    const fileName = config.output.localeFileName.replace('{locale}', locale);
    return path.join(this.config.outputDir, fileName);
  }

  /**
   * 添加键值对
   * @param value 中文文本
   * @param key 可选的自定义key，不提供则自动生成
   * @param locale 语言代码，默认为配置中的locale
   * @returns 使用的key
   */
  public add(value: string, key?: string, locale?: string): string {
    const targetLocale = locale || this.config.locale;

    // 确保目标语言的存储对象存在
    if (!this.keyValueStore[targetLocale]) {
      this.keyValueStore[targetLocale] = {};
    }

    // 如果没有提供key，尝试查找已有key或生成新key
    if (!key) {
      // 如果配置允许重用已有key且存在相同value的key，则重用
      if (this.config.keyGeneration.reuseExistingKey && this.valueToKeyMap.has(value)) {
        key = this.valueToKeyMap.get(value)!;
        kvLogger.debug(`重用现有key: ${key} => ${value}`);
      } else {
        // 否则生成新key
        key = this.generateKey(value);
        kvLogger.debug(`生成新key: ${key} => ${value}`);
      }
    }

    // 保存键值对
    const localeStore = this.keyValueStore[targetLocale];
    if (localeStore) {
      localeStore[key] = value;
    }

    // 更新value到key的映射
    if (targetLocale === this.config.locale) {
      this.valueToKeyMap.set(value, key);
    }

    return key;
  }

  /**
   * 批量添加键值对
   * @param entries 键值对条目数组 [value, key?][]
   * @param locale 语言代码，默认为配置中的locale
   * @returns 添加的键值对数量
   */
  public addBatch(entries: [string, string?][], locale?: string): number {
    let count = 0;

    for (const [value, key] of entries) {
      if (value) {
        this.add(value, key, locale);
        count++;
      }
    }

    return count;
  }

  /**
   * 根据value获取key
   * @param value 中文文本
   * @returns 对应的key，如果不存在则返回undefined
   */
  public getKeyByValue(value: string): string | undefined {
    return this.valueToKeyMap.get(value);
  }

  /**
   * 根据key获取value
   * @param key 键
   * @param locale 语言代码，默认为配置中的locale
   * @returns 对应的value，如果不存在则返回undefined
   */
  public getValueByKey(key: string, locale?: string): string | undefined {
    const targetLocale = locale || this.config.locale;
    const localeStore = this.keyValueStore[targetLocale];
    return localeStore ? localeStore[key] : undefined;
  }

  /**
   * 检查键是否存在
   * @param key 键
   * @param locale 语言代码，默认为配置中的locale
   * @returns 是否存在
   */
  public hasKey(key: string, locale?: string): boolean {
    const targetLocale = locale || this.config.locale;
    const localeStore = this.keyValueStore[targetLocale];
    return Boolean(localeStore && key in localeStore);
  }

  /**
   * 检查值是否存在
   * @param value 值
   * @param locale 语言代码，默认为配置中的locale
   * @returns 是否存在
   */
  public hasValue(value: string, locale?: string): boolean {
    const targetLocale = locale || this.config.locale;

    if (targetLocale === this.config.locale) {
      return this.valueToKeyMap.has(value);
    }

    // 对于非主语言，需要遍历查找
    const localeStore = this.keyValueStore[targetLocale];
    return localeStore ? Object.values(localeStore).includes(value) : false;
  }

  /**
   * 删除键值对
   * @param key 键
   * @param locale 语言代码，默认为所有语言
   * @returns 是否成功删除
   */
  public remove(key: string, locale?: string): boolean {
    if (locale) {
      // 删除指定语言的键值对
      const localeStore = this.keyValueStore[locale];
      if (localeStore && key in localeStore) {
        // 如果是主语言，还需要更新value到key的映射
        if (locale === this.config.locale) {
          const value = localeStore[key];
          this.valueToKeyMap.delete(value);
        }

        delete localeStore[key];
        return true;
      }
      return false;
    } else {
      // 删除所有语言的键值对
      let deleted = false;

      for (const lang of Object.keys(this.keyValueStore)) {
        const langStore = this.keyValueStore[lang];
        if (langStore && key in langStore) {
          // 如果是主语言，还需要更新value到key的映射
          if (lang === this.config.locale) {
            const value = langStore[key];
            this.valueToKeyMap.delete(value);
          }

          delete langStore[key];
          deleted = true;
        }
      }

      return deleted;
    }
  }

  /**
   * 清空键值对存储
   * @param locale 语言代码，默认为所有语言
   */
  public clear(locale?: string): void {
    if (locale) {
      // 清空指定语言
      this.keyValueStore[locale] = {};

      // 如果是主语言，还需要清空value到key的映射
      if (locale === this.config.locale) {
        this.valueToKeyMap.clear();
      }
    } else {
      // 清空所有语言
      this.keyValueStore = {};
      this.valueToKeyMap.clear();
    }

    kvLogger.debug(`已清空${locale || '所有'}语言的键值对存储`);
  }

  /**
   * 获取键值对数量
   * @param locale 语言代码，默认为配置中的locale
   * @returns 键值对数量
   */
  public count(locale?: string): number {
    const targetLocale = locale || this.config.locale;
    const localeStore = this.keyValueStore[targetLocale];
    return localeStore ? Object.keys(localeStore).length : 0;
  }

  /**
   * 获取所有键
   * @param locale 语言代码，默认为配置中的locale
   * @returns 键数组
   */
  public getAllKeys(locale?: string): string[] {
    const targetLocale = locale || this.config.locale;
    const localeStore = this.keyValueStore[targetLocale];
    return localeStore ? Object.keys(localeStore) : [];
  }

  /**
   * 获取所有值
   * @param locale 语言代码，默认为配置中的locale
   * @returns 值数组
   */
  public getAllValues(locale?: string): string[] {
    const targetLocale = locale || this.config.locale;
    const localeStore = this.keyValueStore[targetLocale];
    return localeStore ? Object.values(localeStore) : [];
  }

  /**
   * 获取所有键值对
   * @param locale 语言代码，默认为配置中的locale
   * @returns 键值对对象
   */
  public getAll(locale?: string): KeyValueStore {
    const targetLocale = locale || this.config.locale;
    const localeStore = this.keyValueStore[targetLocale];
    return localeStore ? { ...localeStore } : {};
  }

  /**
   * 获取所有已加载的语言
   * @returns 语言代码数组
   */
  public getLocales(): string[] {
    return Object.keys(this.keyValueStore);
  }

  /**
   * 合并键值对数据
   * @param data 要合并的数据
   * @param locale 语言代码，默认为配置中的locale
   * @returns 合并后的键值对数量
   */
  public merge(data: KeyValueStore, locale?: string): number {
    const targetLocale = locale || this.config.locale;

    // 确保目标语言的存储对象存在
    if (!this.keyValueStore[targetLocale]) {
      this.keyValueStore[targetLocale] = {};
    }

    // 合并数据
    const localeStore = this.keyValueStore[targetLocale];
    const originalCount = localeStore ? Object.keys(localeStore).length : 0;

    this.keyValueStore[targetLocale] = merge({}, localeStore || {}, data);

    // 如果是主语言，还需要更新value到key的映射
    if (targetLocale === this.config.locale) {
      Object.entries(data).forEach(([key, value]) => {
        this.valueToKeyMap.set(value, key);
      });
    }

    const newCount = Object.keys(this.keyValueStore[targetLocale]).length;
    return newCount - originalCount;
  }

  /**
   * 生成key
   * @param value 中文文本
   * @returns 生成的key
   */
  public generateKey(value: string): string {
    const { keyGeneration } = this.config;
    let key = '';

    // 如果中文文本长度超过最大长度，使用哈希值
    if (value.length > keyGeneration.maxChineseLength) {
      key = this.generateHashKey(value);
    } else {
      // 否则使用拼音
      key = this.generatePinyinKey(value);
    }

    // 处理重复key
    if (this.hasKey(key)) {
      key = this.handleDuplicateKey(key, value);
    }

    return key;
  }

  /**
   * 生成拼音key
   * @param value 中文文本
   * @returns 拼音key
   */
  private generatePinyinKey(value: string): string {
    const { keyGeneration } = this.config;

    // 转换为拼音
    const pinyinResult = pinyin(value, keyGeneration.pinyinOptions as any);

    // 根据拼音选项类型处理结果
    let pinyinStr = '';
    if (Array.isArray(pinyinResult)) {
      // 如果结果是数组，连接成字符串
      pinyinStr = pinyinResult.join('');
    } else {
      // 否则直接使用结果
      pinyinStr = String(pinyinResult);
    }

    // 移除非字母数字字符
    pinyinStr = pinyinStr.replace(/[^a-zA-Z0-9]/g, '');

    // 转换为小写
    pinyinStr = pinyinStr.toLowerCase();

    // 添加前缀
    let prefix = keyGeneration.keyPrefix;
    if (prefix && prefix.length > 0) {
      prefix += keyGeneration.separator;
    }

    return prefix + pinyinStr;
  }

  /**
   * 生成哈希key
   * @param value 中文文本
   * @returns 哈希key
   */
  private generateHashKey(value: string): string {
    const { keyGeneration } = this.config;

    // 计算哈希值
    const hash = crypto
      .createHash('md5')
      .update(value)
      .digest('hex')
      .substring(0, keyGeneration.hashLength);

    // 添加前缀
    let prefix = keyGeneration.keyPrefix;
    if (prefix && prefix.length > 0) {
      prefix += keyGeneration.separator;
    }

    return prefix + hash;
  }

  /**
   * 处理重复key
   * @param key 原始key
   * @param value 中文文本
   * @returns 处理后的key
   */
  private handleDuplicateKey(key: string, value: string): string {
    const { keyGeneration } = this.config;
    let newKey = key;
    let retryCount = 0;

    while (this.hasKey(newKey) && this.getValueByKey(newKey) !== value && retryCount < keyGeneration.maxRetryCount) {
      if (keyGeneration.duplicateKeySuffix === 'hash') {
        // 使用哈希后缀
        const hash = crypto
          .createHash('md5')
          .update(value + retryCount)
          .digest('hex')
          .substring(0, keyGeneration.hashLength);
        newKey = `${key}${keyGeneration.separator}${hash}`;
      } else {
        // 使用计数后缀
        newKey = `${key}${keyGeneration.separator}${retryCount + 1}`;
      }

      retryCount++;
    }

    // 如果达到最大重试次数仍然有冲突，使用时间戳确保唯一性
    if (this.hasKey(newKey) && this.getValueByKey(newKey) !== value) {
      newKey = `${key}${keyGeneration.separator}${Date.now()}`;
    }

    return newKey;
  }
}

/**
 * 创建键值对管理器
 * @param options 选项
 * @returns 键值对管理器实例
 */
export function createKeyValueManager(options: KeyValueManagerOptions = {}): KeyValueManager {
  return new KeyValueManager(options);
}

/**
 * 默认键值对管理器实例
 */
export const keyValueManager = createKeyValueManager(); 