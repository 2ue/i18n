# 使用指南

本文档将指导您如何使用 i18n-xy 工具进行国际化处理，包括安装、配置、提取、替换和翻译等操作。

## 目录

- [安装](#安装)
- [基本工作流程](#基本工作流程)
- [命令详解](#命令详解)
- [常见使用场景](#常见使用场景)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 安装

### 全局安装

```bash
# 使用 npm
npm install i18n-xy --global

# 使用 pnpm
pnpm add i18n-xy --global

# 使用 yarn
yarn global add i18n-xy
```

### 项目内安装

```bash
# 使用 npm
npm install i18n-xy --save-dev

# 使用 pnpm
pnpm add i18n-xy --save-dev

# 使用 yarn
yarn add i18n-xy --dev
```

## 基本工作流程

使用 i18n-xy 的基本工作流程如下：

1. **初始化配置**：创建配置文件
2. **提取中文文案**：扫描项目中的中文文案并生成语言文件
3. **替换中文文案**：将中文文案替换为国际化函数调用
4. **翻译文案**：将中文文案翻译为其他语言（可选）

## 命令详解

### init 命令

初始化配置文件。

```bash
i18n-xy init [options]
```

选项:
- `-o, --output <path>` - 指定配置文件输出路径，默认为`./i18n-xy.config.ts`
- `-f, --force` - 强制覆盖已存在的配置文件

示例:

```bash
# 在项目根目录创建默认配置文件
i18n-xy init

# 指定配置文件路径
i18n-xy init -o config/i18n.config.ts

# 强制覆盖已存在的配置文件
i18n-xy init --force
```

### extract 命令

提取中文文案，生成语言文件。

```bash
i18n-xy extract [options]
```

选项:
- `-o, --output <path>` - 指定输出目录
- `--dry-run` - 仅扫描不写入文件
- `--pattern <pattern>` - 指定文件匹配模式
- `--ignore <pattern>` - 指定忽略文件模式
- `--replace` - 提取的同时替换中文文案

示例:

```bash
# 提取中文文案
i18n-xy extract

# 指定输出目录
i18n-xy extract -o src/i18n/locales

# 仅扫描不写入文件
i18n-xy extract --dry-run

# 指定文件匹配模式
i18n-xy extract --pattern "src/**/*.tsx"

# 提取并替换中文文案
i18n-xy extract --replace
```

### replace 命令

替换中文文案为国际化函数调用。

```bash
i18n-xy replace [options]
```

选项:
- `--dry-run` - 仅扫描不写入文件
- `--pattern <pattern>` - 指定文件匹配模式
- `--ignore <pattern>` - 指定忽略文件模式
- `--auto-import` - 自动导入国际化函数

示例:

```bash
# 替换中文文案
i18n-xy replace

# 仅扫描不写入文件
i18n-xy replace --dry-run

# 替换并自动导入国际化函数
i18n-xy replace --auto-import
```

### translate 命令

翻译中文文案到其他语言。

```bash
i18n-xy translate [options]
```

选项:
- `--locale <locales>` - 指定目标语言，多个语言用逗号分隔
- `--dry-run` - 仅扫描不写入文件
- `-o, --output <path>` - 指定输出目录

示例:

```bash
# 翻译到默认目标语言（英语）
i18n-xy translate

# 翻译到多种语言
i18n-xy translate --locale en,ja,ko

# 仅扫描不写入文件
i18n-xy translate --dry-run

# 指定输出目录
i18n-xy translate -o public/locales
```

## 常见使用场景

### 场景1：React 项目国际化

对于 React 项目，通常使用 react-i18next 作为国际化库。以下是使用 i18n-xy 配合 react-i18next 的流程：

1. 安装依赖

```bash
# 安装 react-i18next 和相关依赖
npm install react-i18next i18next i18next-browser-languagedetector

# 安装 i18n-xy
npm install i18n-xy --save-dev
```

2. 初始化配置

```bash
i18n-xy init
```

3. 修改配置文件

```typescript
// i18n-xy.config.ts
import { Config } from 'i18n-xy';

const config: Config = {
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  outputDir: 'src/locales',
  include: ['src/**/*.{jsx,tsx}'],
  exclude: ['node_modules/**', 'src/**/*.test.{jsx,tsx}'],
  replacement: {
    functionName: 't',
    autoImport: {
      enabled: true,
      imports: {
        'src/**/*.{jsx,tsx}': {
          importStatement: "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        }
      }
    }
  }
};

export default config;
```

4. 提取并替换中文文案

```bash
i18n-xy extract --replace
```

5. 翻译文案（可选）

```bash
i18n-xy translate --locale en
```

6. 设置 react-i18next

```typescript
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言文件
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN
      },
      'en-US': {
        translation: enUS
      }
    },
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### 场景2：Next.js 项目国际化

对于 Next.js 项目，通常使用 next-i18next 作为国际化库。以下是使用 i18n-xy 配合 next-i18next 的流程：

1. 安装依赖

```bash
# 安装 next-i18next
npm install next-i18next

# 安装 i18n-xy
npm install i18n-xy --save-dev
```

2. 初始化配置

```bash
i18n-xy init
```

3. 修改配置文件

```typescript
// i18n-xy.config.ts
import { Config } from 'i18n-xy';

const config: Config = {
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  outputDir: 'public/locales/zh-CN',
  include: [
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}'
  ],
  exclude: [
    'node_modules/**',
    '.next/**'
  ],
  replacement: {
    functionName: 't',
    autoImport: {
      enabled: true,
      imports: {
        '**/*.{js,jsx,ts,tsx}': {
          importStatement: "import { useTranslation } from 'next-i18next';\nconst { t } = useTranslation('common');"
        }
      }
    }
  }
};

export default config;
```

4. 提取并替换中文文案

```bash
i18n-xy extract --replace
```

5. 翻译文案（可选）

```bash
i18n-xy translate --locale en --output public/locales/en
```

6. 设置 next-i18next

```typescript
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    localeDetection: true
  }
};
```

## 最佳实践

### 1. 使用 TypeScript 配置文件

推荐使用 TypeScript 配置文件，可以获得类型提示和自动补全。

```typescript
// i18n-xy.config.ts
import { Config } from 'i18n-xy';

const config: Config = {
  // 配置项...
};

export default config;
```

### 2. 合理设置文件匹配模式

精确的文件匹配模式可以显著提高处理速度。

```typescript
{
  include: [
    'src/components/**/*.{jsx,tsx}',
    'src/pages/**/*.{jsx,tsx}'
  ],
  exclude: [
    'node_modules/**',
    'src/**/*.test.{jsx,tsx}',
    'src/**/*.stories.{jsx,tsx}'
  ]
}
```

### 3. 使用临时目录

在生产环境中，建议使用临时目录，避免直接修改源文件。

```typescript
{
  tempDir: 'temp/i18n-output'
}
```

### 4. 启用重用已有 key

启用 `reuseExistingKey` 选项，可以确保相同的文本使用相同的 key。

```typescript
{
  keyGeneration: {
    reuseExistingKey: true
  }
}
```

### 5. 适当的日志级别

- 开发时使用 `verbose` 日志级别，可以获得更详细的信息
- 生产环境使用 `minimal` 日志级别，减少输出

```typescript
{
  logging: {
    level: process.env.NODE_ENV === 'development' ? 'verbose' : 'minimal'
  }
}
```

## 常见问题

### 1. 如何处理带有变量的文本？

对于带有变量的文本，i18n-xy 会将文本拆分为多个部分，并生成相应的 key。例如：

```jsx
// 原始代码
<p>当前用户：{username}，积分：{points}</p>

// 替换后
<p>{t('dangqian_yonghu')}：{username}，{t('jifen')}：{points}</p>
```

### 2. 如何处理 HTML 标签？

对于包含 HTML 标签的文本，i18n-xy 会将文本拆分为多个部分，并生成相应的 key。例如：

```jsx
// 原始代码
<p>请点击<a href="/login">登录</a>继续操作</p>

// 替换后
<p>{t('qing_dianji')}<a href="/login">{t('denglu')}</a>{t('jixu_caozuo')}</p>
```

### 3. 如何处理复杂的模板字符串？

对于复杂的模板字符串，i18n-xy 会尝试提取其中的中文部分。例如：

```javascript
// 原始代码
const message = `你好，${name}，今天是${date}`;

// 替换后
const message = `${t('nihao')}，${name}，${t('jintian_shi')}${date}`;
```

### 4. 如何处理已经国际化的代码？

i18n-xy 会自动跳过已经使用国际化函数的代码，不会重复替换。例如：

```jsx
// 已经国际化的代码
<p>{t('hello')}</p>

// 不会被替换
```

### 5. 如何处理不需要国际化的中文？

对于不需要国际化的中文，可以通过配置 `exclude` 选项来排除特定文件或目录。

```typescript
{
  exclude: [
    'src/constants/pinyin.ts',
    'src/data/chinese-cities.ts'
  ]
}
```

### 6. 百度翻译 API 配额用完怎么办？

当百度翻译 API 配额用完时，可以通过以下方式解决：

1. 使用环境变量指定新的 API 密钥

```bash
BAIDU_TRANSLATE_APPID=new_appid BAIDU_TRANSLATE_KEY=new_key i18n-xy translate
```

2. 调整并发数和延迟，避免触发 API 限制

```typescript
{
  translation: {
    concurrency: 5,
    retryDelay: 1000,
    batchDelay: 500
  }
}
```

### 7. 如何处理特定框架的特殊需求？

i18n-xy 支持通过配置自定义替换函数名和导入语句，可以适应不同框架的需求。例如：

```typescript
// Vue 项目
{
  replacement: {
    functionName: '$t',
    autoImport: {
      enabled: true,
      imports: {
        'src/**/*.vue': {
          importStatement: "import { useI18n } from 'vue-i18n';\nconst { t: $t } = useI18n();"
        }
      }
    }
  }
}
``` 