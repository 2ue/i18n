# i18n-xy

国际化提取替换翻译工具，用于扫描项目中的中文文案，提取并替换为国际化函数（如`$t('key')`），同时生成对应的多语言JSON文件。

[![npm version](https://img.shields.io/npm/v/i18n-xy.svg)](https://www.npmjs.com/package/i18n-xy)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yourusername/i18n-xy/blob/main/LICENSE)

## 功能特点

- 🔍 **智能扫描**：自动扫描项目中的中文文案，支持js/jsx/ts/tsx文件
- 🔑 **自动提取**：提取中文文案并生成唯一key，支持拼音和哈希两种模式
- 🔄 **自动替换**：将中文替换为国际化函数调用，如`$t('key')`
- 📦 **自动导入**：根据配置自动导入国际化函数
- 📝 **多语言生成**：生成多语言JSON文件，支持多种语言
- 🌐 **自动翻译**：支持百度翻译API自动翻译
- ⚙️ **高度可配置**：提供丰富的配置选项，满足不同项目需求

## 安装

```bash
# 全局安装
npm install i18n-xy --global

# 或使用pnpm
pnpm add i18n-xy --global

# 项目内安装
npm install i18n-xy --save-dev

# 或使用pnpm
pnpm add i18n-xy --save-dev
```

## 快速开始

### 步骤1: 初始化配置

```bash
# 生成默认配置文件
i18n-xy init
```

这将在项目根目录创建`i18n-xy.config.ts`文件。

### 步骤2: 提取中文文案

```bash
# 扫描并提取中文文案
i18n-xy extract
```

这将扫描项目中的文件，提取中文文案，并生成语言文件。

### 步骤3: 替换中文文案

```bash
# 替换中文文案为国际化函数调用
i18n-xy replace
```

这将替换项目中的中文文案为国际化函数调用。

### 步骤4: 翻译文案（可选）

```bash
# 翻译中文文案到其他语言
i18n-xy translate --locale en,ja
```

这将翻译中文文案到英语和日语。

## 命令行选项

### 全局选项

- `-c, --config <path>` - 指定配置文件路径
- `-d, --debug` - 启用调试模式
- `-v, --verbose` - 显示详细输出
- `--help` - 显示帮助信息
- `--version` - 显示版本信息

### init 命令

初始化配置文件。

```bash
i18n-xy init [options]
```

选项:
- `-o, --output <path>` - 指定配置文件输出路径，默认为`./i18n-xy.config.ts`
- `-f, --force` - 强制覆盖已存在的配置文件

### extract 命令

提取中文文案。

```bash
i18n-xy extract [options]
```

选项:
- `-o, --output <path>` - 指定输出目录
- `--dry-run` - 仅扫描不写入文件
- `--pattern <pattern>` - 指定文件匹配模式
- `--ignore <pattern>` - 指定忽略文件模式
- `--replace` - 提取的同时替换中文文案

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

### translate 命令

翻译中文文案到其他语言。

```bash
i18n-xy translate [options]
```

选项:
- `--locale <locales>` - 指定目标语言，多个语言用逗号分隔
- `--dry-run` - 仅扫描不写入文件
- `-o, --output <path>` - 指定输出目录

## 配置文件

i18n-xy使用配置文件来控制其行为。默认配置文件名为`i18n-xy.config.ts`，也支持`.js`和`.json`格式。

配置文件示例:

```typescript
import { Config } from 'i18n-xy';

const config: Config = {
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  outputDir: 'locales',
  include: ['src/**/*.{js,jsx,ts,tsx}'],
  exclude: ['node_modules/**'],
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
  }
};

export default config;
```

详细配置选项请参考[配置文档](./docs/config.md)。

## 使用示例

详细使用示例请查看[使用指南](./docs/guide.md)和[示例目录](./examples)。

## 支持的场景

i18n-xy支持多种中文文案提取和替换场景，包括但不限于：

- 字符串字面量（单引号、双引号）
- 模板字符串（包括嵌套模板）
- JSX文本节点
- JSX属性值
- 对象和数组中的中文字符串
- 条件表达式中的中文字符串
- 函数参数中的中文字符串

详细支持的场景请参考[场景文档](./docs/scenarios.md)。

## 开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/i18n-xy.git
cd i18n-xy

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

## 贡献指南

欢迎贡献代码、报告问题或提出建议！请参考[贡献指南](./CONTRIBUTING.md)。

## 变更日志

查看[变更日志](./CHANGELOG.md)了解各版本的变化。

## 许可证

[MIT](./LICENSE) 