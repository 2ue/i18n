import { Config } from '../types/config';

/**
 * 默认配置对象
 */
export const defaultConfig: Config = {
  // 基础配置
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  outputDir: 'locales',
  tempDir: undefined,

  // 文件处理配置
  include: [
    'src/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}'
  ],
  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}'
  ],

  // key生成配置
  keyGeneration: {
    maxChineseLength: 10,
    hashLength: 6,
    maxRetryCount: 5,
    reuseExistingKey: true,
    duplicateKeySuffix: 'hash',
    keyPrefix: '',
    separator: '_',
    pinyinOptions: {
      toneType: 'none',
      type: 'array'
    }
  },

  // 输出配置
  output: {
    prettyJson: true,
    localeFileName: '{locale}.json'
  },

  // 日志配置
  logging: {
    enabled: true,
    level: 'normal'
  },

  // 替换配置
  replacement: {
    functionName: '$t',
    autoImport: {
      enabled: false,
      insertPosition: 'afterImports',
      imports: {}
    }
  },

  // 翻译配置
  translation: {
    enabled: false,
    provider: 'baidu',
    defaultSourceLang: 'zh',
    defaultTargetLang: 'en',
    concurrency: 10,
    retryTimes: 3,
    retryDelay: 0,
    batchDelay: 0,
    baidu: {
      appid: '',
      key: ''
    }
  }
};