import fs from 'fs-extra';
import path from 'path';
import { Config } from '../types/config';

/**
 * 验证配置对象
 * @param config 待验证的配置对象
 * @throws 如果配置无效，抛出错误
 */
export function validateConfig(config: Config): void {
  // 验证必填字段
  validateRequiredFields(config);

  // 验证路径
  validatePaths(config);

  // 验证翻译配置
  if (config.translation.enabled) {
    validateTranslationConfig(config);
  }
}

/**
 * 验证配置中的必填字段
 * @param config 配置对象
 * @throws 如果缺少必填字段，抛出错误
 */
function validateRequiredFields(config: Config): void {
  // 检查顶级必填属性
  const requiredTopFields = ['locale', 'fallbackLocale', 'outputDir', 'include', 'exclude'];
  for (const field of requiredTopFields) {
    if (!config[field as keyof Config]) {
      throw new Error(`缺少必填配置项: ${field}`);
    }
  }

  // 检查keyGeneration必填属性
  const requiredKeyGenFields = ['maxChineseLength', 'hashLength', 'duplicateKeySuffix', 'separator'];
  for (const field of requiredKeyGenFields) {
    if (config.keyGeneration && !config.keyGeneration[field as keyof typeof config.keyGeneration]) {
      throw new Error(`缺少必填配置项: keyGeneration.${field}`);
    }
  }

  // 检查文件匹配模式
  if (!Array.isArray(config.include) || config.include.length === 0) {
    throw new Error('include必须是一个非空数组');
  }

  if (!Array.isArray(config.exclude)) {
    throw new Error('exclude必须是一个数组');
  }
}

/**
 * 验证配置中的路径有效性
 * @param config 配置对象
 */
function validatePaths(config: Config): void {
  // 验证输出目录是否存在或可创建
  try {
    const outputDir = path.isAbsolute(config.outputDir)
      ? config.outputDir
      : path.resolve(process.cwd(), config.outputDir);

    if (!fs.existsSync(outputDir)) {
      // 尝试创建输出目录
      fs.mkdirpSync(outputDir);
    }
  } catch (error) {
    throw new Error(`输出目录 "${config.outputDir}" 无效或无法创建: ${error}`);
  }

  // 如果配置了临时目录，也进行验证
  if (config.tempDir) {
    try {
      const tempDir = path.isAbsolute(config.tempDir)
        ? config.tempDir
        : path.resolve(process.cwd(), config.tempDir);

      if (!fs.existsSync(tempDir)) {
        // 尝试创建临时目录
        fs.mkdirpSync(tempDir);
      }
    } catch (error) {
      throw new Error(`临时目录 "${config.tempDir}" 无效或无法创建: ${error}`);
    }
  }
}

/**
 * 验证翻译配置
 * @param config 配置对象
 */
function validateTranslationConfig(config: Config): void {
  const { translation } = config;

  // 验证翻译提供商
  if (translation.provider !== 'baidu') {
    throw new Error(`不支持的翻译提供商: ${translation.provider}`);
  }

  // 验证百度翻译配置
  if (translation.provider === 'baidu') {
    if (!translation.baidu.appid || !translation.baidu.key) {
      // 检查环境变量是否提供了凭证
      const envAppId = process.env.BAIDU_TRANSLATE_APPID;
      const envKey = process.env.BAIDU_TRANSLATE_KEY;

      if (!envAppId || !envKey) {
        throw new Error('启用百度翻译需要提供appid和key');
      }
    }
  }

  // 验证并发数
  if (typeof translation.concurrency !== 'number' || translation.concurrency <= 0) {
    throw new Error('translation.concurrency必须是大于0的数字');
  }

  // 验证重试次数
  if (typeof translation.retryTimes !== 'number' || translation.retryTimes < 0) {
    throw new Error('translation.retryTimes必须是不小于0的数字');
  }
} 