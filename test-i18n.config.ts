/**
 * i18n-xy测试专用配置文件
 */
import { Config } from './src/types/config';

const config: Config = {
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  outputDir: 'locales',
  tempDir: 'temp', // 临时目录，用于存放替换后的文件
  include: [
    'examples/**/*.{js,jsx,ts,tsx}'
  ],
  exclude: [
    'node_modules/**',
    'dist/**',
    'examples/**/*.replaced.*' // 排除已经处理过的文件
  ],
  keyGeneration: {
    maxChineseLength: 8,
    hashLength: 6,
    reuseExistingKey: true,
    duplicateKeySuffix: 'hash',
    keyPrefix: '',
    separator: '_',
    maxRetryCount: 5,
    pinyinOptions: {
      toneType: 'none',
      type: 'array'
    }
  },
  output: {
    prettyJson: true,
    localeFileName: '{locale}.json'
  },
  replacement: {
    functionName: '$t',
    autoImport: {
      enabled: true,
      insertPosition: 'afterImports',
      imports: {
        '**/*.{jsx,tsx}': {
          importStatement: "import { useTranslation } from 'react-i18next';\nconst { t: $t } = useTranslation();"
        }
      }
    }
  },
  logging: {
    enabled: true,
    level: 'normal'
  },
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

export default config; 