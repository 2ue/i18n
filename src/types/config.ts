/**
 * 拼音配置选项
 */
export interface PinyinOptions {
  toneType?: 'none';
  type?: 'array';
}

/**
 * 键生成配置
 */
export interface KeyGenerationConfig {
  maxChineseLength: number;
  hashLength: number;
  maxRetryCount: number;
  reuseExistingKey: boolean;
  duplicateKeySuffix: 'hash' | 'counter';
  keyPrefix: string;
  separator: string;
  pinyinOptions: PinyinOptions;
}

/**
 * 输出配置
 */
export interface OutputConfig {
  prettyJson: boolean;
  localeFileName: string;
}

/**
 * 日志配置
 */
export interface LoggingConfig {
  enabled: boolean;
  level: 'minimal' | 'normal' | 'verbose';
}

/**
 * 自动导入配置
 */
export interface AutoImportConfig {
  enabled: boolean;
  insertPosition: 'afterImports' | 'beforeImports' | 'topOfFile';
  imports: Record<string, { importStatement: string }>;
}

/**
 * 替换配置
 */
export interface ReplacementConfig {
  functionName: string;
  autoImport: AutoImportConfig;
}

/**
 * 百度翻译配置
 */
export interface BaiduTranslateConfig {
  appid: string;
  key: string;
}

/**
 * 翻译配置
 */
export interface TranslationConfig {
  enabled: boolean;
  provider: 'baidu';
  defaultSourceLang: string;
  defaultTargetLang: string;
  concurrency: number;
  retryTimes: number;
  retryDelay: number;
  batchDelay: number;
  baidu: BaiduTranslateConfig;
}

/**
 * 主配置接口
 */
export interface Config {
  locale: string;
  fallbackLocale: string;
  outputDir: string;
  tempDir?: string;
  include: string[];
  exclude: string[];
  keyGeneration: KeyGenerationConfig;
  output: OutputConfig;
  logging: LoggingConfig;
  replacement: ReplacementConfig;
  translation: TranslationConfig;
}
