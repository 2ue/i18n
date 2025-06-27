import path from 'path';
import fs from 'fs-extra';
import { configManager } from '../config/manager';
import { logger, Logger } from '../utils/logger';
import { Config } from '../types/config';

// 测试配置目录
const TEST_DIR = path.resolve(__dirname, '../../test-logger');

// 准备测试环境
function prepareTestConfigs() {
  // 创建测试目录
  fs.mkdirpSync(TEST_DIR);

  // 创建minimal级别配置
  const minimalConfig = {
    ...configManager.getOrDefault(),
    logging: {
      enabled: true,
      level: 'minimal'
    }
  };
  fs.writeJSONSync(path.join(TEST_DIR, 'minimal.json'), minimalConfig);

  // 创建verbose级别配置
  const verboseConfig = {
    ...configManager.getOrDefault(),
    logging: {
      enabled: true,
      level: 'verbose'
    }
  };
  fs.writeJSONSync(path.join(TEST_DIR, 'verbose.json'), verboseConfig);

  // 创建禁用日志配置
  const disabledConfig = {
    ...configManager.getOrDefault(),
    logging: {
      enabled: false,
      level: 'normal'
    }
  };
  fs.writeJSONSync(path.join(TEST_DIR, 'disabled.json'), disabledConfig);
}

// 清理测试环境
function cleanupTest() {
  if (fs.existsSync(TEST_DIR)) {
    fs.removeSync(TEST_DIR);
  }
}

// 测试各日志级别和类型
async function runLoggerTest() {
  try {
    console.log('开始测试日志模块...');
    console.log('===================================');

    // 准备测试配置文件
    prepareTestConfigs();

    // 初始化配置
    const defaultConfig = configManager.getOrDefault();
    console.log(`当前日志级别: ${defaultConfig.logging.level}`);
    console.log(`是否启用日志: ${defaultConfig.logging.enabled}`);
    console.log('');

    // 测试1: 默认配置下的日志输出
    console.log('测试1: 默认配置下的日志输出');
    console.log('-----------------------------------');
    logger.info('这是一条信息日志');
    logger.success('这是一条成功日志');
    logger.warn('这是一条警告日志');
    logger.error('这是一条错误日志');
    logger.debug('这是一条调试日志（默认配置下不应显示）');
    console.log('-----------------------------------\n');

    // 测试2: minimal日志级别
    console.log('测试2: minimal日志级别');
    console.log('-----------------------------------');
    configManager.init(path.join(TEST_DIR, 'minimal.json'));

    logger.info('这是一条信息日志（minimal级别下不应显示）');
    logger.success('这是一条成功日志');
    logger.warn('这是一条警告日志');
    logger.error('这是一条错误日志');
    logger.debug('这是一条调试日志（minimal级别下不应显示）');
    console.log('-----------------------------------\n');

    // 测试3: verbose日志级别
    console.log('测试3: verbose日志级别');
    console.log('-----------------------------------');
    configManager.init(path.join(TEST_DIR, 'verbose.json'));

    logger.info('这是一条信息日志');
    logger.success('这是一条成功日志');
    logger.warn('这是一条警告日志');
    logger.error('这是一条错误日志');
    logger.debug('这是一条调试日志（verbose级别下应显示）');
    console.log('-----------------------------------\n');

    // 测试4: 禁用日志
    console.log('测试4: 禁用日志');
    console.log('-----------------------------------');
    configManager.init(path.join(TEST_DIR, 'disabled.json'));

    logger.info('这是一条信息日志（禁用日志后不应显示）');
    logger.success('这是一条成功日志（禁用日志后不应显示）');
    logger.warn('这是一条警告日志（禁用日志后不应显示）');
    logger.error('这是一条错误日志（禁用日志后不应显示）');
    logger.debug('这是一条调试日志（禁用日志后不应显示）');
    console.log('-----------------------------------\n');

    // 测试5: 带前缀的日志记录器
    console.log('测试5: 带前缀的日志记录器');
    console.log('-----------------------------------');
    configManager.init(path.join(TEST_DIR, 'verbose.json'));

    const configLogger = Logger.create({ prefix: 'CONFIG' });
    const scannerLogger = Logger.create({ prefix: 'SCANNER' });
    const translatorLogger = Logger.create({ prefix: 'TRANSLATOR' });

    configLogger.info('加载配置文件');
    scannerLogger.warn('发现重复的文案');
    translatorLogger.success('翻译完成');
    console.log('-----------------------------------\n');

    // 重置配置
    configManager.reset();

    console.log('日志模块测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 清理测试环境
    cleanupTest();
  }
}

// 运行测试
runLoggerTest().catch(console.error); 