# i18n-xy

国际化提取替换翻译工具，用于扫描项目中的中文文案，提取并替换为国际化函数（如`$t('key')`），同时生成对应的多语言JSON文件。

## 功能特点

- 扫描项目中的中文文案，支持js/jsx/ts/tsx文件
- 提取中文文案并生成唯一key
- 替换中文为国际化函数调用
- 自动导入国际化函数
- 生成多语言JSON文件
- 支持百度翻译API自动翻译

## 安装

```bash
npm install i18n-xy --global
# 或
pnpm add i18n-xy --global
```

## 使用方法

详细使用方法请查看[使用指南](./docs/guide.md)。

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

## 许可证

MIT 