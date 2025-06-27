import { Config } from '../types/config';
import { defaultConfig } from './defaults';
import { loadConfig } from './loader';
import { validateConfig } from './validator';

/**
 * 配置管理器类
 * 负责加载、验证和管理全局配置
 */
export class ConfigManager {
  private config: Config | null = null;

  /**
   * 初始化配置
   * @param configPath 可选的配置文件路径
   * @returns 配置对象
   */
  init(configPath?: string): Config {
    // 加载配置
    const loadedConfig = loadConfig(configPath);

    // 验证配置
    validateConfig(loadedConfig);

    // 保存配置
    this.config = loadedConfig;

    return this.config;
  }

  /**
   * 获取配置
   * 如果配置尚未初始化，抛出错误
   * @returns 配置对象
   */
  get(): Config {
    if (!this.config) {
      throw new Error('ConfigManager: 配置尚未初始化，请先调用 init() 方法');
    }
    return this.config;
  }

  /**
   * 获取配置，如果未初始化则返回默认配置
   * 适用于非关键路径，可以接受默认配置的场景
   * @returns 配置对象
   */
  getOrDefault(): Config {
    return this.config || defaultConfig;
  }

  /**
   * 重置配置（主要用于测试）
   */
  reset(): void {
    this.config = null;
  }

  /**
   * 检查配置是否已初始化
   * @returns 是否已初始化
   */
  isInitialized(): boolean {
    return this.config !== null;
  }
}

/**
 * 导出配置管理器单例
 */
export const configManager = new ConfigManager(); 