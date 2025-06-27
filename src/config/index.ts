import { Config } from '../types/config';
import { defaultConfig } from './defaults';
import { loadConfig } from './loader';
import { validateConfig } from './validator';
import { configManager, ConfigManager } from './manager';

/**
 * 导出配置管理器单例
 */
export { configManager };

/**
 * 导出配置管理器类 (用于扩展或测试)
 */
export { ConfigManager };

/**
 * 导出配置相关功能
 * 这些直接导出的函数保留向后兼容性，但推荐使用configManager
 */
export { loadConfig, validateConfig, defaultConfig };

/**
 * @deprecated 使用 configManager.init 替代
 * 初始化配置
 * @param configPath 可选的配置文件路径
 * @returns 配置对象
 */
export function initConfig(configPath?: string): Config {
  return configManager.init(configPath);
}

/**
 * @deprecated 使用 configManager.get 或 configManager.getOrDefault 替代
 * 获取配置
 * 如果配置尚未初始化，则使用默认配置
 * @returns 配置对象
 */
export function getConfig(): Config {
  return configManager.getOrDefault();
}

/**
 * @deprecated 使用 configManager.reset 替代
 * 重置配置（主要用于测试）
 */
export function resetConfig(): void {
  configManager.reset();
}

/**
 * 配置模块类型导出
 */
export type { Config } from '../types/config';
export type {
  PinyinOptions,
  KeyGenerationConfig,
  OutputConfig,
  LoggingConfig,
  AutoImportConfig,
  ReplacementConfig,
  BaiduTranslateConfig,
  TranslationConfig
} from '../types/config'; 