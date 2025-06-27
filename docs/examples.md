# 场景示例

本文档提供了一些常见场景下使用 i18n-xy 的详细示例，帮助您理解如何在实际项目中应用这个工具。

## 目录

- [React 项目国际化](#react-项目国际化)
- [Next.js 项目国际化](#nextjs-项目国际化)
- [Vue 项目国际化](#vue-项目国际化)
- [复杂 JSX 结构处理](#复杂-jsx-结构处理)
- [模板字符串处理](#模板字符串处理)
- [处理带有变量的文本](#处理带有变量的文本)
- [大型项目分批处理](#大型项目分批处理)

## React 项目国际化

### 项目结构

```
my-react-app/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── App.tsx
│   └── index.tsx
└── package.json
```

### 步骤 1: 安装依赖

```bash
# 安装 i18n-xy
npm install i18n-xy --save-dev

# 安装 react-i18next
npm install react-i18next i18next i18next-browser-languagedetector
```

### 步骤 2: 初始化配置

```bash
npx i18n-xy init
```

修改生成的配置文件 `i18n-xy.config.ts`:

```typescript
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

### 步骤 3: 提取并替换中文文案

```bash
npx i18n-xy extract --replace
```

### 步骤 4: 设置 i18n 实例

创建 `src/i18n.ts`:

```typescript
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

### 步骤 5: 在入口文件中初始化 i18n

修改 `src/index.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './i18n'; // 导入 i18n 配置

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

### 步骤 6: 添加语言切换功能

在 `src/components/Header.tsx` 中添加语言切换组件:

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <header>
      <h1>{t('header_title')}</h1>
      <div>
        <button onClick={() => changeLanguage('zh-CN')}>中文</button>
        <button onClick={() => changeLanguage('en-US')}>English</button>
      </div>
    </header>
  );
};

export default Header;
```

## Next.js 项目国际化

### 项目结构

```
my-nextjs-app/
├── pages/
│   ├── _app.tsx
│   ├── index.tsx
│   └── about.tsx
├── components/
│   ├── Header.tsx
│   └── Footer.tsx
├── public/
│   └── locales/
└── next.config.js
```

### 步骤 1: 安装依赖

```bash
# 安装 i18n-xy
npm install i18n-xy --save-dev

# 安装 next-i18next
npm install next-i18next
```

### 步骤 2: 初始化配置

```bash
npx i18n-xy init
```

修改生成的配置文件 `i18n-xy.config.ts`:

```typescript
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

### 步骤 3: 提取并替换中文文案

```bash
npx i18n-xy extract --replace
```

### 步骤 4: 翻译到其他语言

```bash
npx i18n-xy translate --locale en --output public/locales/en
```

### 步骤 5: 配置 Next.js

创建 `next-i18next.config.js`:

```javascript
module.exports = {
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    localeDetection: true
  }
};
```

修改 `next.config.js`:

```javascript
const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n
};
```

### 步骤 6: 设置 _app.tsx

```tsx
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default appWithTranslation(MyApp);
```

### 步骤 7: 在页面中使用

修改 `pages/index.tsx`:

```tsx
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Header from '../components/Header';

const Home = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <Header />
      <h1>{t('welcome_message')}</h1>
      <p>{t('home_description')}</p>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'zh-CN', ['common']))
    }
  };
};

export default Home;
```

## Vue 项目国际化

### 项目结构

```
my-vue-app/
├── src/
│   ├── components/
│   │   ├── Header.vue
│   │   └── Footer.vue
│   ├── views/
│   │   ├── Home.vue
│   │   └── About.vue
│   ├── App.vue
│   └── main.js
└── package.json
```

### 步骤 1: 安装依赖

```bash
# 安装 i18n-xy
npm install i18n-xy --save-dev

# 安装 vue-i18n
npm install vue-i18n@next
```

### 步骤 2: 初始化配置

```bash
npx i18n-xy init
```

修改生成的配置文件 `i18n-xy.config.ts`:

```typescript
import { Config } from 'i18n-xy';

const config: Config = {
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  outputDir: 'src/locales',
  include: ['src/**/*.vue'],
  exclude: ['node_modules/**'],
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
};

export default config;
```

### 步骤 3: 提取并替换中文文案

```bash
npx i18n-xy extract --replace
```

### 步骤 4: 设置 Vue I18n

创建 `src/i18n.js`:

```javascript
import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

export default i18n;
```

### 步骤 5: 在入口文件中初始化 i18n

修改 `src/main.js`:

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

### 步骤 6: 在组件中使用

修改 `src/components/Header.vue`:

```vue
<template>
  <header>
    <h1>{{ $t('header_title') }}</h1>
    <div>
      <button @click="changeLanguage('zh-CN')">中文</button>
      <button @click="changeLanguage('en-US')">English</button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const changeLanguage = (lang) => {
  locale.value = lang;
};
</script>
```

## 复杂 JSX 结构处理

### 原始代码

```tsx
// UserProfile.tsx
const UserProfile = ({ user }) => {
  return (
    <div className="profile">
      <h2>用户信息</h2>
      <div className="info-card">
        <p>姓名: <span className="highlight">{user.name}</span></p>
        <p>年龄: <span className="highlight">{user.age}</span>岁</p>
        <p>职业: <span className="highlight">{user.occupation}</span></p>
        <div className="bio">
          <h3>个人简介</h3>
          <p>{user.bio || '这个用户很懒，还没有填写个人简介。'}</p>
        </div>
        <div className="actions">
          <button className="primary">编辑资料</button>
          <button className="secondary">更改密码</button>
        </div>
      </div>
      <div className="footer">
        最后更新时间: {user.lastUpdated}
      </div>
    </div>
  );
};
```

### 替换后代码

```tsx
// UserProfile.tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

const UserProfile = ({ user }) => {
  return (
    <div className="profile">
      <h2>{t('yonghu_xinxi')}</h2>
      <div className="info-card">
        <p>{t('xingming')}: <span className="highlight">{user.name}</span></p>
        <p>{t('nianling')}: <span className="highlight">{user.age}</span>{t('sui')}</p>
        <p>{t('zhiye')}: <span className="highlight">{user.occupation}</span></p>
        <div className="bio">
          <h3>{t('geren_jianjie')}</h3>
          <p>{user.bio || t('zhege_yonghu_henlan')}</p>
        </div>
        <div className="actions">
          <button className="primary">{t('bianji_ziliao')}</button>
          <button className="secondary">{t('genggai_mima')}</button>
        </div>
      </div>
      <div className="footer">
        {t('zuihou_gengxin_shijian')}: {user.lastUpdated}
      </div>
    </div>
  );
};
```

## 模板字符串处理

### 原始代码

```typescript
// notification.ts
const createNotification = (user, count) => {
  const message = `亲爱的${user.name}，您有${count}条未读消息，请及时查看。如果您对我们的服务有任何疑问，请联系客服：${supportPhone}`;
  return {
    title: `${user.name}的通知`,
    message,
    time: new Date().toLocaleString('zh-CN')
  };
};
```

### 替换后代码

```typescript
// notification.ts
import { t } from 'i18next';

const createNotification = (user, count) => {
  const message = `${t('qinaide')}${user.name}，${t('ninyou')}${count}${t('tiao_weidu_xiaoxi')}${t('ruguonindui')}${supportPhone}`;
  return {
    title: `${user.name}${t('de_tongzhi')}`,
    message,
    time: new Date().toLocaleString('zh-CN')
  };
};
```

## 处理带有变量的文本

### 原始代码

```tsx
// OrderSummary.tsx
const OrderSummary = ({ order }) => {
  return (
    <div className="order-summary">
      <h3>订单摘要 #{order.id}</h3>
      <p>订单状态: {order.status}</p>
      <p>订单总额: ¥{order.total}</p>
      <p>下单时间: {order.createdAt}</p>
      <p>预计送达时间: {order.estimatedDelivery}</p>
      <div className="shipping-address">
        <h4>收货地址</h4>
        <p>{order.shippingAddress.name}</p>
        <p>{order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.address}</p>
      </div>
      <div className="payment-info">
        <h4>支付信息</h4>
        <p>支付方式: {order.paymentMethod}</p>
        <p>支付状态: {order.paymentStatus}</p>
      </div>
    </div>
  );
};
```

### 配置插值替换

```typescript
// i18n-xy.config.ts
const config: Config = {
  // 其他配置...
  replacement: {
    functionName: 't',
    interpolation: {
      enabled: true,
      pattern: '{{$1}}',
      variableNameTransform: 'camelCase'
    }
  }
};
```

### 替换后代码

```tsx
// OrderSummary.tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

const OrderSummary = ({ order }) => {
  return (
    <div className="order-summary">
      <h3>{t('dingdan_zhaiyao_id', { id: order.id })}</h3>
      <p>{t('dingdan_zhuangtai', { status: order.status })}</p>
      <p>{t('dingdan_zonge', { total: order.total })}</p>
      <p>{t('xiadan_shijian', { createdAt: order.createdAt })}</p>
      <p>{t('yuji_songda_shijian', { estimatedDelivery: order.estimatedDelivery })}</p>
      <div className="shipping-address">
        <h4>{t('shouhuo_dizhi')}</h4>
        <p>{order.shippingAddress.name}</p>
        <p>{order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.address}</p>
      </div>
      <div className="payment-info">
        <h4>{t('zhifu_xinxi')}</h4>
        <p>{t('zhifu_fangshi', { paymentMethod: order.paymentMethod })}</p>
        <p>{t('zhifu_zhuangtai', { paymentStatus: order.paymentStatus })}</p>
      </div>
    </div>
  );
};
```

## 大型项目分批处理

对于大型项目，可以采用分批处理的策略。

### 步骤 1: 按模块划分

```
my-large-project/
├── src/
│   ├── components/
│   ├── pages/
│   ├── features/
│   │   ├── user/
│   │   ├── product/
│   │   ├── order/
│   │   └── payment/
│   └── shared/
```

### 步骤 2: 创建处理脚本

创建 `scripts/i18n-process.js`:

```javascript
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 模块列表
const modules = [
  { name: 'components', pattern: 'src/components/**/*.{tsx,jsx}' },
  { name: 'pages', pattern: 'src/pages/**/*.{tsx,jsx}' },
  { name: 'user', pattern: 'src/features/user/**/*.{tsx,jsx,ts,js}' },
  { name: 'product', pattern: 'src/features/product/**/*.{tsx,jsx,ts,js}' },
  { name: 'order', pattern: 'src/features/order/**/*.{tsx,jsx,ts,js}' },
  { name: 'payment', pattern: 'src/features/payment/**/*.{tsx,jsx,ts,js}' },
  { name: 'shared', pattern: 'src/shared/**/*.{tsx,jsx,ts,js}' }
];

// 创建输出目录
const outputDir = path.join(__dirname, '../temp/i18n');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 处理每个模块
modules.forEach(module => {
  console.log(`Processing module: ${module.name}`);
  
  // 提取中文文案
  const extractCmd = `npx i18n-xy extract --pattern "${module.pattern}" --output temp/i18n/${module.name} --dry-run`;
  execSync(extractCmd, { stdio: 'inherit' });
  
  console.log(`Extracted keys for module: ${module.name}`);
});

// 合并所有模块的键
console.log('Merging all keys...');
const mergeCmd = `npx i18n-xy merge --input "temp/i18n/*" --output locales/zh-CN.json`;
execSync(mergeCmd, { stdio: 'inherit' });

// 替换中文文案
console.log('Replacing Chinese text...');
const replaceCmd = `npx i18n-xy replace --key-file locales/zh-CN.json`;
execSync(replaceCmd, { stdio: 'inherit' });

// 翻译到其他语言
console.log('Translating to other languages...');
const translateCmd = `npx i18n-xy translate --locale en,ja --key-file locales/zh-CN.json`;
execSync(translateCmd, { stdio: 'inherit' });

console.log('All done!');
```

### 步骤 3: 执行处理脚本

```bash
node scripts/i18n-process.js
```

### 步骤 4: 审核和调整

处理完成后，可以审核生成的语言文件，调整翻译和键名。

## 总结

通过以上示例，您可以看到 i18n-xy 在不同框架和场景下的应用方式。根据项目的具体需求，您可以灵活配置和使用 i18n-xy，实现高效的国际化处理。

无论是简单的 React 应用还是复杂的大型项目，i18n-xy 都能提供强大的支持，帮助您轻松实现国际化。 