import path from 'path';
import fs from 'fs-extra';
import { initConfig, getConfig, resetConfig } from '../config';

// 测试目录
const TEST_DIR = path.resolve(__dirname, '../../test-config');

// 测试配置文件路径
const TEST_CONFIG_PATH = path.resolve(TEST_DIR, 'i18n-xy.config.js');

/**
 * 准备测试环境
 */
function prepareTest() {
  // 创建测试目录
  fs.mkdirpSync(TEST_DIR);

  // 创建测试配置文件
  const configContent = `
module.exports = {
  locale: 'en-US',
  fallbackLocale: 'zh-CN',
  outputDir: 'custom-locales',
  include: ['custom/**/*.{js,jsx,ts,tsx}'],
  keyGeneration: {
    maxChineseLength: 15,
    hashLength: 8
  }
};
  `.trim();

  fs.writeFileSync(TEST_CONFIG_PATH, configContent, 'utf-8');

  console.log('测试环境准备完成');
}

/**
 * 清理测试环境
 */
function cleanupTest() {
  // 删除测试目录
  fs.removeSync(TEST_DIR);

  // 重置配置
  resetConfig();

  console.log('测试环境清理完成');
}

/**
 * 运行配置加载测试
 */
async function runConfigTest() {
  try {
    console.log('开始测试配置加载器...');

    // 准备测试环境
    prepareTest();

    // 测试默认配置
    console.log('测试获取默认配置...');
    const defaultConfig = getConfig();
    console.log('默认配置locale:', defaultConfig.locale);
    console.log('默认配置outputDir:', defaultConfig.outputDir);

    // 测试加载自定义配置
    console.log('\n测试加载自定义配置...');
    const customConfig = initConfig(TEST_CONFIG_PATH);
    console.log('自定义配置locale:', customConfig.locale);
    console.log('自定义配置outputDir:', customConfig.outputDir);
    console.log('自定义配置include:', customConfig.include);
    console.log('自定义配置keyGeneration.maxChineseLength:', customConfig.keyGeneration.maxChineseLength);

    // 测试配置单例
    console.log('\n测试配置单例...');
    const singletonConfig = getConfig();
    console.log('单例配置locale:', singletonConfig.locale);
    console.log('单例配置与自定义配置相同:', singletonConfig === customConfig);

    console.log('\n配置加载器测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 清理测试环境
    cleanupTest();
  }
}

// 运行测试
runConfigTest().catch(console.error); 