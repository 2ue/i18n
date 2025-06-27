# 高级用法

本文档介绍 i18n-xy 的一些高级用法和技巧，帮助您更有效地处理复杂的国际化场景。

## 目录

- [自定义 Key 生成策略](#自定义-key-生成策略)
- [处理复杂文本结构](#处理复杂文本结构)
- [批量处理大型项目](#批量处理大型项目)
- [与 CI/CD 集成](#与-cicd-集成)
- [多语言项目管理](#多语言项目管理)
- [自定义翻译服务](#自定义翻译服务)

## 自定义 Key 生成策略

i18n-xy 提供了灵活的 key 生成策略配置，可以根据项目需求进行自定义。

### 基于命名空间

通过设置 `keyPrefix` 和 `separator`，可以实现基于命名空间的 key 生成：

```typescript
{
  keyGeneration: {
    keyPrefix: 'common',
    separator: '.',
    // 生成的 key 形如：common.ni_hao
  }
}
```

您还可以根据文件路径动态生成命名空间：

```typescript
const getKeyPrefix = (filePath: string) => {
  if (filePath.includes('/components/')) {
    return 'components';
  } else if (filePath.includes('/pages/')) {
    return 'pages';
  }
  return 'common';
};

// 在 CLI 命令中使用
i18n-xy extract --key-prefix-fn "filePath => filePath.includes('/components/') ? 'components' : 'common'"
```

### 自定义 Key 格式

对于特殊的 key 格式需求，可以通过配置实现：

```typescript
{
  keyGeneration: {
    // 使用计数器作为重复 key 的后缀
    duplicateKeySuffix: 'counter',
    
    // 自定义拼音选项
    pinyinOptions: {
      toneType: 'none',
      type: 'array'
    },
    
    // 限制中文长度，超过部分使用哈希
    maxChineseLength: 15,
    hashLength: 8
  }
}
```

## 处理复杂文本结构

### 嵌套的 JSX 结构

对于复杂的 JSX 结构，i18n-xy 会智能拆分文本节点：

```jsx
// 原始代码
<div>
  这是<strong>重要</strong>信息，请<a href="/link">点击这里</a>查看详情。
</div>

// 替换后
<div>
  {t('zheshi')}<strong>{t('zhongyao')}</strong>{t('xinxi_qing')}
  <a href="/link">{t('dianji_zheli')}</a>{t('chakan_xiangqing')}
</div>
```

### 带有插值的文本

对于带有插值的文本，可以使用特殊的替换模式：

```typescript
// 配置
{
  replacement: {
    functionName: 't',
    interpolation: {
      pattern: '{{$1}}',  // 使用 {{变量}} 格式
      variableNameTransform: 'camelCase'  // 变量名转为驼峰式
    }
  }
}

// 原始代码
<p>你好，{userName}，你有{messageCount}条新消息</p>

// 替换后
<p>{t('nihao_yougeren_tiaoxinxiaoxi', { userName, messageCount })}</p>

// 生成的语言文件
{
  "nihao_yougeren_tiaoxinxiaoxi": "你好，{{userName}}，你有{{messageCount}}条新消息"
}
```

### 条件渲染中的文本

对于条件渲染中的文本，i18n-xy 会保留条件结构：

```jsx
// 原始代码
<div>
  {isLoggedIn ? '欢迎回来' : '请先登录'}
  {count > 0 && `你有${count}条新消息`}
</div>

// 替换后
<div>
  {isLoggedIn ? t('huanying_huilai') : t('qing_xian_denglu')}
  {count > 0 && `${t('ni_you')}${count}${t('tiao_xinxiaoxi')}`}
</div>
```

## 批量处理大型项目

### 增量处理

对于大型项目，可以使用增量处理策略：

```bash
# 第一步：提取所有中文文案，但不替换
i18n-xy extract --dry-run --output temp/i18n-keys.json

# 第二步：审核和调整生成的 key
# (手动编辑 temp/i18n-keys.json)

# 第三步：使用审核后的 key 文件进行替换
i18n-xy replace --key-file temp/i18n-keys.json

# 第四步：翻译到其他语言
i18n-xy translate --locale en,ja,ko
```

### 分模块处理

对于模块化的大型项目，可以按模块分别处理：

```bash
# 处理组件模块
i18n-xy extract --pattern "src/components/**/*.tsx" --output locales/components

# 处理页面模块
i18n-xy extract --pattern "src/pages/**/*.tsx" --output locales/pages

# 处理工具模块
i18n-xy extract --pattern "src/utils/**/*.ts" --output locales/utils
```

### 性能优化

处理大型项目时的性能优化建议：

1. **使用精确的文件匹配模式**：减少不必要的文件扫描
2. **调整并发数**：根据机器性能调整并发处理数量
3. **使用临时文件**：避免直接修改源文件，便于审核和回滚
4. **分批处理**：将大型项目分成多个小批次处理

```typescript
{
  // 精确的文件匹配模式
  include: ['src/specific-module/**/*.tsx'],
  exclude: ['**/*.test.tsx', '**/*.stories.tsx'],
  
  // 使用临时目录
  tempDir: 'temp/i18n-output',
  
  // 性能调优
  performance: {
    concurrency: 4,  // 并发处理文件数
    batchSize: 100   // 批处理大小
  }
}
```

## 与 CI/CD 集成

### GitHub Actions 集成

在 GitHub Actions 中集成 i18n-xy，实现自动化国际化处理：

```yaml
# .github/workflows/i18n.yml
name: I18n Processing

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  i18n-process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install i18n-xy
        run: npm install -g i18n-xy
        
      - name: Extract i18n keys
        run: i18n-xy extract --dry-run --output temp/i18n-keys.json
        
      - name: Check for new keys
        id: check-keys
        run: |
          if [ -s temp/i18n-keys.json ]; then
            echo "::set-output name=has_new_keys::true"
          else
            echo "::set-output name=has_new_keys::false"
          fi
          
      - name: Create PR with new i18n keys
        if: steps.check-keys.outputs.has_new_keys == 'true'
        uses: peter-evans/create-pull-request@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: 'chore: update i18n keys'
          title: 'chore: update i18n keys'
          body: 'This PR adds new i18n keys extracted from the codebase.'
          branch: i18n-key-update
```

### GitLab CI 集成

在 GitLab CI 中集成 i18n-xy：

```yaml
# .gitlab-ci.yml
stages:
  - i18n

i18n-extract:
  stage: i18n
  image: node:16
  script:
    - npm ci
    - npm install -g i18n-xy
    - i18n-xy extract --output locales/zh-CN.json
    - i18n-xy translate --locale en,ja,ko
  artifacts:
    paths:
      - locales/
```

### 自动化检查

在 CI 中添加国际化检查，确保所有中文文本都被正确国际化：

```yaml
i18n-check:
  stage: test
  image: node:16
  script:
    - npm ci
    - npm install -g i18n-xy
    - i18n-xy check --fail-on-missing
  only:
    - merge_requests
```

## 多语言项目管理

### 多语言文件组织

对于支持多种语言的项目，可以采用以下文件组织结构：

```
locales/
├── zh-CN/
│   ├── common.json
│   ├── components.json
│   └── pages.json
├── en-US/
│   ├── common.json
│   ├── components.json
│   └── pages.json
└── ja-JP/
    ├── common.json
    ├── components.json
    └── pages.json
```

配置示例：

```typescript
{
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  outputDir: 'locales/{locale}',
  output: {
    localeFileName: '{namespace}.json'
  },
  keyGeneration: {
    keyPrefix: '{namespace}',
    separator: '.'
  }
}
```

### 语言切换和回退策略

在多语言项目中，合理设置语言回退策略非常重要：

```typescript
// i18n 初始化配置
{
  resources: {
    'zh-CN': { /* 中文资源 */ },
    'en-US': { /* 英文资源 */ },
    'ja-JP': { /* 日文资源 */ }
  },
  fallbackLng: {
    'zh-HK': ['zh-CN', 'en-US'],
    'zh-TW': ['zh-CN', 'en-US'],
    'ja': ['ja-JP', 'en-US'],
    'default': ['en-US']
  },
  load: 'currentOnly'
}
```

### 多语言版本管理

使用 Git 标签或分支管理不同语言版本：

```bash
# 创建语言版本分支
git checkout -b i18n/zh-CN
git checkout -b i18n/en-US

# 合并语言更新
git checkout i18n/zh-CN
i18n-xy extract
git commit -am "Update zh-CN translations"

git checkout i18n/en-US
git merge i18n/zh-CN
i18n-xy translate --locale en-US
git commit -am "Update en-US translations"
```

## 自定义翻译服务

### 集成其他翻译 API

除了内置的百度翻译 API，您还可以集成其他翻译服务：

```typescript
// 配置示例
{
  translation: {
    provider: 'custom',
    custom: {
      translate: async (text, sourceLang, targetLang) => {
        // 调用自定义翻译 API
        const response = await fetch('https://your-translation-api.com/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, from: sourceLang, to: targetLang })
        });
        const data = await response.json();
        return data.translatedText;
      }
    }
  }
}
```

### 离线翻译

对于无法访问在线翻译 API 的环境，可以使用离线翻译模式：

```typescript
{
  translation: {
    provider: 'offline',
    offline: {
      dictionaryPath: './translation-dictionary.json'
    }
  }
}
```

字典文件格式示例：

```json
{
  "你好": {
    "en": "Hello",
    "ja": "こんにちは",
    "ko": "안녕하세요"
  },
  "欢迎": {
    "en": "Welcome",
    "ja": "ようこそ",
    "ko": "환영합니다"
  }
}
```

### 人工翻译工作流

对于需要高质量翻译的项目，可以设置人工翻译工作流：

1. 提取中文文案，生成待翻译文件
   ```bash
   i18n-xy extract --output-format csv --output translations/pending.csv
   ```

2. 将 CSV 文件发送给翻译团队

3. 导入已翻译的 CSV 文件
   ```bash
   i18n-xy import --format csv --input translations/completed.csv --locale en,ja,ko
   ```

4. 应用翻译到项目
   ```bash
   i18n-xy apply-translations
   ```

## 高级替换策略

### 自定义替换模板

对于特定框架或库，可能需要自定义替换模板：

```typescript
{
  replacement: {
    functionName: 't',
    template: {
      // React 组件形式
      react: '{{functionName}}("{{key}}", { defaultValue: "{{defaultValue}}" })',
      
      // Vue 指令形式
      vue: 'v-t="\'{{key}}\'"',
      
      // Angular 管道形式
      angular: '{{key}} | translate'
    }
  }
}
```

### 上下文感知替换

根据代码上下文调整替换策略：

```typescript
{
  replacement: {
    contextAware: true,
    contextRules: [
      {
        // 在 JSX 属性中
        pattern: /<[^>]+ \w+=[{"]([^}"]+)[}"]/, 
        template: '{{functionName}}("{{key}}")'
      },
      {
        // 在 console.log 中
        pattern: /console\.log\(([^)]+)\)/,
        template: '/* i18n-disable */ {{text}} /* i18n-enable */'
      }
    ]
  }
}
```

### 条件替换

根据条件决定是否替换特定文本：

```typescript
{
  replacement: {
    conditionalRules: [
      {
        // 不替换短文本
        condition: text => text.length <= 2,
        action: 'skip'
      },
      {
        // 特定格式文本使用特殊模板
        condition: text => /^\d+月\d+日$/.test(text),
        template: 'formatDate("{{text}}")'
      }
    ]
  }
}
```

## 总结

通过本文档介绍的高级用法，您可以更灵活地使用 i18n-xy 处理各种复杂的国际化场景。根据项目的具体需求，合理配置和使用这些高级特性，可以显著提高国际化处理的效率和质量。 