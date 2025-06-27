/**
 * i18n-xy - 国际化提取替换翻译工具
 * @version 1.0.0
 */

// 导出版本号
export const version = '1.0.0';

// 导出配置相关
export * from './config';

// 导出核心模块
export * from './core/ast-processor';
export * from './core/key-value-manager';
export * from './core/import-manager';
export * from './core/translation';
export * from './core/process';

// 导出CLI
export * from './cli';

/**
 * 主入口函数
 * @returns {string} 版本信息
 */
export function main(): string {
  return `i18n-xy v${version}`;
} 