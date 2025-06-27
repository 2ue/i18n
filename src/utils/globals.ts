import { Logger } from './logger';

/**
 * 全局变量管理模块
 * 提供统一的全局变量存储和访问接口
 */

// 创建专用日志记录器
const globalLogger = Logger.create({ prefix: 'GLOBALS' });

/**
 * 全局存储对象类型
 */
type GlobalStore = Record<string, Record<string, unknown>>;

/**
 * 全局变量管理类
 */
export class GlobalManager {
  private static instance: GlobalManager;
  private store: GlobalStore = {};

  /**
   * 私有构造函数，防止外部直接实例化
   */
  private constructor() {
    // 初始化空存储
    this.store = {};
  }

  /**
   * 获取单例实例
   * @returns GlobalManager实例
   */
  public static getInstance(): GlobalManager {
    if (!GlobalManager.instance) {
      GlobalManager.instance = new GlobalManager();
    }
    return GlobalManager.instance;
  }

  /**
   * 设置全局变量
   * @param namespace 命名空间
   * @param key 变量键
   * @param value 变量值
   */
  public set<T>(namespace: string, key: string, value: T): void {
    // 确保命名空间存在
    if (!this.store[namespace]) {
      this.store[namespace] = {};
    }

    // 存储值
    this.store[namespace][key] = value;
    globalLogger.debug(`设置全局变量: ${namespace}.${key}`);
  }

  /**
   * 获取全局变量
   * @param namespace 命名空间
   * @param key 变量键
   * @param defaultValue 默认值（可选）
   * @returns 存储的值或默认值
   */
  public get<T>(namespace: string, key: string, defaultValue?: T): T | undefined {
    // 检查命名空间和键是否存在
    if (!this.store[namespace] || this.store[namespace][key] === undefined) {
      if (defaultValue !== undefined) {
        globalLogger.debug(`全局变量不存在，返回默认值: ${namespace}.${key}`);
        return defaultValue;
      }
      globalLogger.debug(`全局变量不存在: ${namespace}.${key}`);
      return undefined;
    }

    // 返回值
    return this.store[namespace][key] as T;
  }

  /**
   * 检查全局变量是否存在
   * @param namespace 命名空间
   * @param key 变量键
   * @returns 是否存在
   */
  public has(namespace: string, key: string): boolean {
    return this.store[namespace] !== undefined && this.store[namespace][key] !== undefined;
  }

  /**
   * 删除全局变量
   * @param namespace 命名空间
   * @param key 变量键
   * @returns 是否成功删除
   */
  public delete(namespace: string, key: string): boolean {
    if (!this.store[namespace] || this.store[namespace][key] === undefined) {
      return false;
    }

    delete this.store[namespace][key];
    globalLogger.debug(`删除全局变量: ${namespace}.${key}`);
    return true;
  }

  /**
   * 清除命名空间下的所有变量
   * @param namespace 命名空间
   */
  public clearNamespace(namespace: string): void {
    if (this.store[namespace]) {
      this.store[namespace] = {};
      globalLogger.debug(`清除命名空间: ${namespace}`);
    }
  }

  /**
   * 重置所有全局变量
   */
  public reset(): void {
    this.store = {};
    globalLogger.debug('重置所有全局变量');
  }

  /**
   * 获取命名空间下的所有键
   * @param namespace 命名空间
   * @returns 键数组
   */
  public getKeys(namespace: string): string[] {
    if (!this.store[namespace]) {
      return [];
    }

    return Object.keys(this.store[namespace]);
  }

  /**
   * 获取所有命名空间
   * @returns 命名空间数组
   */
  public getNamespaces(): string[] {
    return Object.keys(this.store);
  }

  /**
   * 初始化全局变量
   * @param initialData 初始数据
   */
  public init(initialData: GlobalStore = {}): void {
    this.store = { ...initialData };
    globalLogger.debug('初始化全局变量');
  }
}

/**
 * 全局变量管理器实例
 */
export const globalManager = GlobalManager.getInstance();

/**
 * 便捷全局变量访问函数
 */

/**
 * 设置全局变量
 * @param namespace 命名空间
 * @param key 变量键
 * @param value 变量值
 */
export function setGlobal<T>(namespace: string, key: string, value: T): void {
  globalManager.set(namespace, key, value);
}

/**
 * 获取全局变量
 * @param namespace 命名空间
 * @param key 变量键
 * @param defaultValue 默认值（可选）
 * @returns 存储的值或默认值
 */
export function getGlobal<T>(namespace: string, key: string, defaultValue?: T): T | undefined {
  return globalManager.get(namespace, key, defaultValue);
}

/**
 * 检查全局变量是否存在
 * @param namespace 命名空间
 * @param key 变量键
 * @returns 是否存在
 */
export function hasGlobal(namespace: string, key: string): boolean {
  return globalManager.has(namespace, key);
}

/**
 * 删除全局变量
 * @param namespace 命名空间
 * @param key 变量键
 * @returns 是否成功删除
 */
export function deleteGlobal(namespace: string, key: string): boolean {
  return globalManager.delete(namespace, key);
}

/**
 * 重置所有全局变量
 */
export function resetGlobals(): void {
  globalManager.reset();
}

/**
 * 常用的命名空间常量
 */
export const GlobalNamespaces = {
  CONFIG: 'config',
  EXTRACTION: 'extraction',
  TRANSLATION: 'translation',
  REPLACEMENT: 'replacement',
  CLI: 'cli'
}; 