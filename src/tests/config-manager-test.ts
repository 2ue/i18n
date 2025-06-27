import path from 'path';
import fs from 'fs-extra';
import { configManager } from '../config';

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
  configManager.reset();

  console.log('测试环境清理完成');
}

/**
 * 运行配置管理器测试
 */
async function runConfigManagerTest() {
  try {
    console.log('开始测试配置管理器...');

    // 准备测试环境
    prepareTest();

    // 测试1: 配置未初始化时的状态
    console.log('测试1: 配置未初始化状态...');
    console.log('配置是否初始化:', configManager.isInitialized());

    try {
      // 尝试获取未初始化的配置，应该抛出错误
      configManager.get();
      console.error('错误: 应该抛出"配置未初始化"错误');
    } catch (error) {
      console.log('成功捕获未初始化错误:', (error as Error).message);
    }

    // 获取默认配置
    const defaultConfig = configManager.getOrDefault();
    console.log('默认配置locale:', defaultConfig.locale);

    // 测试2: 初始化配置
    console.log('\n测试2: 初始化配置...');
    const customConfig = configManager.init(TEST_CONFIG_PATH);
    console.log('配置是否初始化:', configManager.isInitialized());
    console.log('自定义配置locale:', customConfig.locale);
    console.log('自定义配置outputDir:', customConfig.outputDir);

    // 测试3: 获取已初始化的配置
    console.log('\n测试3: 获取已初始化的配置...');
    const retrievedConfig = configManager.get();
    console.log('获取的配置locale:', retrievedConfig.locale);
    console.log('获取的配置与初始化时相同:', retrievedConfig === customConfig);

    // 测试4: 重置配置
    console.log('\n测试4: 重置配置...');
    configManager.reset();
    console.log('重置后配置是否初始化:', configManager.isInitialized());

    try {
      // 重置后尝试获取配置，应该抛出错误
      configManager.get();
      console.error('错误: 重置后应该抛出"配置未初始化"错误');
    } catch (error) {
      console.log('成功捕获重置后未初始化错误:', (error as Error).message);
    }

    console.log('\n配置管理器测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 清理测试环境
    cleanupTest();
  }
}

// 运行测试
runConfigManagerTest().catch(console.error); 