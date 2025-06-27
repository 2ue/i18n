import fs from 'fs-extra';
import path from 'path';
import { configManager } from '../config';
import { keyValueManager } from '../core/key-value-manager';
import { translationProcessor } from '../core/translation';

/**
 * 测试翻译处理器
 */
async function testTranslationProcessor() {
  console.log('测试翻译处理器...');

  // 重置配置并获取默认配置
  configManager.reset();
  const config = configManager.getOrDefault();

  // 设置测试配置
  config.translation.enabled = true;
  config.translation.provider = 'baidu';
  config.translation.defaultSourceLang = 'zh';
  config.translation.defaultTargetLang = 'en';
  config.translation.concurrency = 5;
  config.translation.retryTimes = 3;
  config.translation.retryDelay = 1000;
  config.translation.batchDelay = 500;

  // 注意：实际测试时需要设置有效的百度翻译API密钥
  config.translation.baidu.appid = 'YOUR_BAIDU_APPID';
  config.translation.baidu.key = 'YOUR_BAIDU_KEY';

  // 初始化配置
  configManager.init();

  // 输出可用的翻译提供者
  console.log('可用的翻译提供者:', translationProcessor.getAvailableProviders());

  // 准备测试数据
  const testDir = path.join(__dirname, '../../test-output');
  fs.mkdirpSync(testDir);

  const localeDir = path.join(testDir, 'locales');
  fs.mkdirpSync(localeDir);

  // 设置键值管理器使用测试目录
  const kvOptions = {
    config: {
      outputDir: localeDir,
      locale: 'zh-CN',
      fallbackLocale: 'en-US'
    }
  };

  // 创建测试数据
  const testData = {
    'greeting': '你好，世界！',
    'welcome': '欢迎使用我们的应用',
    'goodbye': '再见，感谢使用！',
    'error': '发生错误，请稍后再试',
    'success': '操作成功完成'
  };

  // 写入测试数据
  const zhFile = path.join(localeDir, 'zh-CN.json');
  fs.writeJSONSync(zhFile, testData, { spaces: 2 });

  console.log('测试数据已准备');

  try {
    // 初始化键值管理器
    keyValueManager.loadExistingData(['zh-CN', 'en-US']);

    console.log('开始翻译测试...');
    console.log('注意：此测试需要有效的百度翻译API密钥才能成功');

    // 测试单个文本翻译
    try {
      console.log('测试单个文本翻译:');
      const result = await translationProcessor.translateText('这是一个测试文本', {
        from: 'zh',
        to: 'en',
        debug: true,
        // 可以添加提供者特定的选项
        providerOptions: {
          // 百度翻译的特定选项
          salt: Date.now().toString()
        }
      });

      console.log('翻译结果:', result);
    } catch (error) {
      console.error('单个文本翻译失败:', error);
    }

    // 测试批量文本翻译
    try {
      console.log('\n测试批量文本翻译:');
      const texts = [
        '第一个测试文本',
        '第二个测试文本',
        '第三个测试文本'
      ];

      const result = await translationProcessor.translateTexts(texts, {
        from: 'zh',
        to: 'en',
        debug: true
      });

      console.log('批量翻译结果:', result);
    } catch (error) {
      console.error('批量文本翻译失败:', error);
    }

    // 测试键值对存储翻译
    try {
      console.log('\n测试键值对存储翻译:');
      const result = await translationProcessor.translateKeyValueStore('en-US');

      console.log('键值对翻译结果:', result);
      console.log('翻译后的文件已保存到:', path.join(localeDir, 'en-US.json'));

      // 显示翻译后的内容
      if (fs.existsSync(path.join(localeDir, 'en-US.json'))) {
        const enData = fs.readJSONSync(path.join(localeDir, 'en-US.json'));
        console.log('翻译后的内容:', enData);
      }
    } catch (error) {
      console.error('键值对存储翻译失败:', error);
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testTranslationProcessor().catch(console.error); 