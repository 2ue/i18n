# 配置详解

本文档详细介绍了 i18n-xy 的所有配置选项，帮助您根据项目需求进行精确配置。

## 配置文件结构

配置文件采用 JSON 格式，包含以下主要部分：

```json
{
  "locale": "zh-CN",
  "fallbackLocale": "en-US",
  "outputDir": "locales",
  "tempDir": "temp",
  "include": ["src/**/*.{js,jsx,ts,tsx}"],
  "exclude": ["node_modules/**"],
  "keyGeneration": {
    "maxChineseLength": 10,
    "hashLength": 6,
    "maxRetryCount": 5,
    "reuseExistingKey": true,
    "duplicateKeySuffix": "hash",
    "keyPrefix": "",
    "separator": "_",
    "pinyinOptions": {}
  },
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  },
  "logging": {
    "enabled": true,
    "level": "normal"
  },
  "replacement": {
    "functionName": "$t",
    "autoImport": {
      "enabled": true,
      "insertPosition": "afterImports",
      "imports": {}
    }
  },
  "translation": {
    "enabled": false,
    "provider": "baidu",
    "defaultSourceLang": "zh",
    "defaultTargetLang": "en",
    "concurrency": 10,
    "retryTimes": 3,
    "retryDelay": 0,
    "batchDelay": 0,
    "baidu": {
      "appid": "",
      "key": ""
    }
  }
}
```

## 基础配置

### 语言设置

#### `locale`
- **类型**: `string`
- **默认值**: `"zh-CN"`
- **描述**: 主要语言代码，用于生成语言文件名

#### `fallbackLocale`
- **类型**: `string`
- **默认值**: `"en-US"`
- **描述**: 回退语言代码，在翻译失败时使用

#### `outputDir`
- **类型**: `string`
- **默认值**: `"locales"`
- **描述**: 国际化文件输出目录

#### `tempDir`
- **类型**: `string | undefined`
- **默认值**: `undefined`
- **描述**: 临时目录路径。设置后会将处理后的文件输出到此目录，而不是直接修改源文件

**示例**:
```json
{
  "locale": "zh-CN",
  "fallbackLocale": "en-US",
  "outputDir": "public/locales",
  "tempDir": "temp/i18n-output"
}
```

## 文件处理配置

### `include`
- **类型**: `string[]`
- **默认值**: `["src/**/*.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}", "components/**/*.{js,jsx,ts,tsx}"]`
- **描述**: 要处理的文件匹配模式，支持 glob 语法

### `exclude`
- **类型**: `string[]`
- **默认值**: `["node_modules/**", "dist/**", "build/**", "**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"]`
- **描述**: 要排除的文件匹配模式

**常见配置示例**:

```json
{
  "include": [
    "src/**/*.{js,jsx,ts,tsx}",
    "pages/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,ts}"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.stories.*",
    "**/*.d.ts",
    "**/vendor/**"
  ]
}
```

## Key 生成配置

### `keyGeneration`

#### `maxChineseLength`
- **类型**: `number`
- **默认值**: `10`
- **描述**: 最大中文字符长度，超过此长度将使用哈希值

#### `hashLength`
- **类型**: `number`
- **默认值**: `6`
- **描述**: 哈希后缀长度

#### `maxRetryCount`
- **类型**: `number`
- **默认值**: `5`
- **描述**: 生成唯一 key 的最大重试次数

#### `reuseExistingKey`
- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 是否重复使用相同文案的 key

#### `duplicateKeySuffix`
- **类型**: `"hash" | "counter"`
- **默认值**: `"hash"`
- **描述**: 重复 key 后缀模式
  - `"hash"`: 使用哈希值后缀
  - `"counter"`: 使用数字后缀

#### `keyPrefix`
- **类型**: `string`
- **默认值**: `""`
- **描述**: key 前缀，用于命名空间

#### `separator`
- **类型**: `string`
- **默认值**: `"_"`
- **描述**: 连接符，用于连接拼音和前缀

#### `pinyinOptions`
- **类型**: `object`
- **默认值**: `{ toneType: 'none', type: 'array' }`
- **描述**: 拼音转换选项

**示例**:
```json
{
  "keyGeneration": {
    "maxChineseLength": 15,
    "hashLength": 8,
    "keyPrefix": "app",
    "separator": ".",
    "reuseExistingKey": false,
    "duplicateKeySuffix": "counter",
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  }
}
```

## 输出配置

### `output`

#### `prettyJson`
- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 是否格式化 JSON 输出

#### `localeFileName`
- **类型**: `string`
- **默认值**: `"{locale}.json"`
- **描述**: 语言文件名格式，`{locale}` 会被替换为实际的语言代码

**示例**:
```json
{
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  }
}
```

## 日志配置

### `logging`

#### `enabled`
- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 是否启用日志输出

#### `level`
- **类型**: `"minimal" | "normal" | "verbose"`
- **默认值**: `"normal"`
- **描述**: 日志级别
  - `"minimal"`: 仅显示关键信息和错误
  - `"normal"`: 显示一般处理信息
  - `"verbose"`: 显示详细的调试信息

**示例**:
```json
{
  "logging": {
    "enabled": true,
    "level": "verbose"
  }
}
```

## 替换配置

### `replacement`

#### `functionName`
- **类型**: `string`
- **默认值**: `"$t"`
- **描述**: 替换函数名

#### `autoImport`

##### `enabled`
- **类型**: `boolean`
- **默认值**: `false`
- **描述**: 是否启用自动引入功能

##### `insertPosition`
- **类型**: `"afterImports" | "beforeImports" | "topOfFile"`
- **默认值**: `"afterImports"`
- **描述**: 插入位置

##### `imports`
- **类型**: `object`
- **描述**: 文件模式到 import 语句的映射

**示例**:
```json
{
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "insertPosition": "afterImports",
      "imports": {
        "src/**/*.{jsx,tsx}": {
          "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        },
        "src/**/*.{js,ts}": {
          "importStatement": "import i18n from '@/utils/i18n';\nconst t = i18n.t;"
        }
      }
    }
  }
}
```

## 翻译配置

### `translation`

#### `enabled`
- **类型**: `boolean`
- **默认值**: `false`
- **描述**: 是否启用翻译功能

#### `provider`
- **类型**: `"baidu"`
- **默认值**: `"baidu"`
- **描述**: 翻译服务提供商

#### `defaultSourceLang`
- **类型**: `string`
- **默认值**: `"zh"`
- **描述**: 默认源语言

#### `defaultTargetLang`
- **类型**: `string`
- **默认值**: `"en"`
- **描述**: 默认目标语言

#### `concurrency`
- **类型**: `number`
- **默认值**: `10`
- **描述**: 并发翻译数量

#### `retryTimes`
- **类型**: `number`
- **默认值**: `3`
- **描述**: 重试次数

#### `retryDelay`
- **类型**: `number`
- **默认值**: `0`
- **描述**: 重试延迟（毫秒）

#### `batchDelay`
- **类型**: `number`
- **默认值**: `0`
- **描述**: 批次延迟（毫秒）

#### `baidu`
- **类型**: `object`
- **描述**: 百度翻译配置

**示例**:
```json
{
  "translation": {
    "enabled": true,
    "provider": "baidu",
    "defaultSourceLang": "zh",
    "defaultTargetLang": "en",
    "concurrency": 5,
    "retryTimes": 3,
    "retryDelay": 1000,
    "batchDelay": 500,
    "baidu": {
      "appid": "your_baidu_app_id",
      "key": "your_baidu_api_key"
    }
  }
}
```

## 框架特定配置

### React 项目

```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": ["src/**/*.{jsx,tsx}"],
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.{jsx,tsx}": {
          "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        }
      }
    }
  }
}
```

### Next.js 项目

```json
{
  "locale": "zh-CN",
  "outputDir": "public/locales",
  "include": [
    "pages/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    ".next/**",
    "out/**"
  ],
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "**/*.{js,jsx,ts,tsx}": {
          "importStatement": "import { useTranslation } from 'next-i18next';\nconst { t } = useTranslation('common');"
        }
      }
    }
  }
}
```

### Vue 3 项目

```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": ["src/**/*.{vue,ts,js}"],
  "replacement": {
    "functionName": "$t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.vue": {
          "importStatement": "import { useI18n } from 'vue-i18n';\nconst { t: $t } = useI18n();"
        },
        "src/**/*.{ts,js}": {
          "importStatement": "import i18n from '@/utils/i18n';\nconst $t = i18n.global.t;"
        }
      }
    }
  }
}
```

## 环境变量

可以通过环境变量覆盖配置文件中的某些设置：

- `I18N_XY_LOG_LEVEL`: 覆盖日志级别
- `I18N_XY_OUTPUT_DIR`: 覆盖输出目录
- `BAIDU_TRANSLATE_APPID`: 百度翻译 APP ID
- `BAIDU_TRANSLATE_KEY`: 百度翻译 API 密钥

**示例**:
```bash
I18N_XY_LOG_LEVEL=verbose i18n-xy extract
BAIDU_TRANSLATE_APPID=your_id BAIDU_TRANSLATE_KEY=your_key i18n-xy translate --batch
```

## 配置验证

工具会自动验证配置文件的正确性，包括：

- 必需字段检查
- 类型验证
- 路径有效性检查
- 翻译服务配置检查

如果配置无效，工具会显示详细的错误信息并终止执行。

## 最佳实践

1. **使用 tempDir**: 在生产环境中建议设置 `tempDir`，避免直接修改源文件
2. **合理设置 include/exclude**: 精确的文件匹配可以显著提高处理速度
3. **启用 reuseExistingKey**: 相同的文本使用相同的 key，符合国际化最佳实践
4. **适当的日志级别**: 开发时使用 `verbose`，生产使用 `minimal`
5. **翻译服务配置**: 根据 API 限制合理设置并发数和延迟 