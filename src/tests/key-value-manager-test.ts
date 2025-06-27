import path from 'path';
import fs from 'fs-extra';
import { KeyValueManager, keyValueManager, createKeyValueManager } from '../core/key-value-manager';
import { configManager } from '../config';

// 测试目录
const TEST_DIR = path.resolve(__dirname, '../../test-kv');

/**
 * 准备测试环境
 */
function prepareTest() {
  // 创建测试目录
  fs.mkdirpSync(TEST_DIR);

  // 清空测试目录
  fs.emptyDirSync(TEST_DIR);

  console.log('测试环境准备完成');
}

/**
 * 清理测试环境
 */
function cleanupTest() {
  // 删除测试目录
  fs.removeSync(TEST_DIR);

  console.log('测试环境清理完成');
}

/**
 * 运行Key-Value管理器测试
 */
async function runKeyValueManagerTest() {
  try {
    console.log('开始测试Key-Value管理器...');
    console.log('===================================');

    // 准备测试环境
    prepareTest();

    // 测试1：创建自定义Key-Value管理器
    console.log('测试1: 创建自定义Key-Value管理器');
    console.log('-----------------------------------');

    const customConfig = {
      keyGeneration: {
        maxChineseLength: 5,
        hashLength: 4,
        maxRetryCount: 3,
        reuseExistingKey: true,
        duplicateKeySuffix: 'hash' as const,
        keyPrefix: 'test',
        separator: '.',
        pinyinOptions: {
          toneType: 'none' as const,
          type: 'array' as const
        }
      },
      locale: 'zh-CN',
      fallbackLocale: 'en-US',
      outputDir: TEST_DIR
    };

    const kvManager = createKeyValueManager({ config: customConfig });
    console.log('自定义Key-Value管理器创建成功');
    console.log('-----------------------------------\n');

    // 测试2：添加键值对
    console.log('测试2: 添加键值对');
    console.log('-----------------------------------');

    const testCases = [
      { value: '你好', expectedKeyPattern: /^test\.nihao$/ },
      { value: '世界', expectedKeyPattern: /^test\.shijie$/ },
      { value: '这是一个很长的中文字符串，超过了最大长度限制', expectedKeyPattern: /^test\.[0-9a-f]{4}$/ }
    ];

    for (const testCase of testCases) {
      const key = kvManager.add(testCase.value);
      const matchesPattern = testCase.expectedKeyPattern.test(key);

      console.log(`添加: "${testCase.value}" => "${key}" (${matchesPattern ? '符合预期' : '不符合预期'})`);
    }

    console.log(`当前键值对数量: ${kvManager.count()}`);
    console.log('-----------------------------------\n');

    // 测试3：查询键值对
    console.log('测试3: 查询键值对');
    console.log('-----------------------------------');

    const allKeys = kvManager.getAllKeys();
    console.log(`所有键: ${allKeys.join(', ')}`);

    for (const key of allKeys) {
      const value = kvManager.getValueByKey(key);
      console.log(`键 "${key}" 对应的值: "${value}"`);
    }

    const valueToFind = '你好';
    const keyForValue = kvManager.getKeyByValue(valueToFind);
    console.log(`值 "${valueToFind}" 对应的键: "${keyForValue}"`);

    console.log('-----------------------------------\n');

    // 测试4：重复键处理
    console.log('测试4: 重复键处理');
    console.log('-----------------------------------');

    // 先添加一个键值对
    const originalKey = kvManager.add('测试');
    console.log(`原始键值对: "${originalKey}" => "测试"`);

    // 尝试添加相同值但不同键的键值对
    const duplicateKey = kvManager.add('测试', 'test.duplicate');
    console.log(`重复值不同键: "${duplicateKey}" => "测试"`);

    // 尝试添加相同值不指定键的键值对（应该重用已有键）
    const reusedKey = kvManager.add('测试');
    console.log(`重用已有键: "${reusedKey}" => "测试" (${reusedKey === originalKey ? '重用成功' : '重用失败'})`);

    console.log('-----------------------------------\n');

    // 测试5：保存和加载
    console.log('测试5: 保存和加载');
    console.log('-----------------------------------');

    // 保存到文件
    const saveResult = kvManager.saveToFile();
    console.log(`保存结果: ${saveResult ? '成功' : '失败'}`);

    // 创建新的管理器并加载
    const newManager = createKeyValueManager({ config: customConfig });
    const loadResult = newManager.loadExistingData();
    console.log(`加载结果: ${loadResult ? '成功' : '失败'}`);
    console.log(`加载后的键值对数量: ${newManager.count()}`);

    // 验证加载的数据
    const loadedKeys = newManager.getAllKeys();
    console.log(`加载的键: ${loadedKeys.join(', ')}`);

    // 检查是否所有键都正确加载
    const allKeysLoaded = allKeys.every(key => loadedKeys.includes(key));
    console.log(`所有键都正确加载: ${allKeysLoaded ? '是' : '否'}`);

    console.log('-----------------------------------\n');

    // 测试6：多语言支持
    console.log('测试6: 多语言支持');
    console.log('-----------------------------------');

    // 添加英文翻译
    const enKey = kvManager.getAllKeys()[0]; // 获取第一个键
    const zhValue = kvManager.getValueByKey(enKey);
    kvManager.add('Hello', enKey, 'en-US');

    console.log(`添加英文翻译: "${enKey}" => "Hello" (en-US)`);
    console.log(`原中文值: "${enKey}" => "${zhValue}" (zh-CN)`);

    // 保存多语言文件
    kvManager.saveToFile(['zh-CN', 'en-US']);

    // 加载多语言文件
    const multiLangManager = createKeyValueManager({ config: customConfig });
    multiLangManager.loadExistingData(['zh-CN', 'en-US']);

    console.log(`zh-CN 键值对数量: ${multiLangManager.count('zh-CN')}`);
    console.log(`en-US 键值对数量: ${multiLangManager.count('en-US')}`);

    // 验证多语言值
    const multiLangKey = multiLangManager.getAllKeys()[0];
    const zhMultiLangValue = multiLangManager.getValueByKey(multiLangKey, 'zh-CN');
    const enMultiLangValue = multiLangManager.getValueByKey(multiLangKey, 'en-US');

    console.log(`多语言值 zh-CN: "${multiLangKey}" => "${zhMultiLangValue}"`);
    console.log(`多语言值 en-US: "${multiLangKey}" => "${enMultiLangValue}"`);

    console.log('-----------------------------------\n');

    // 测试7：删除和清空操作
    console.log('测试7: 删除和清空操作');
    console.log('-----------------------------------');

    // 删除一个键
    const keyToDelete = kvManager.getAllKeys()[0];
    const deleteResult = kvManager.remove(keyToDelete);
    console.log(`删除键 "${keyToDelete}": ${deleteResult ? '成功' : '失败'}`);
    console.log(`删除后的键值对数量: ${kvManager.count()}`);

    // 清空指定语言
    kvManager.clear('en-US');
    console.log(`清空 en-US 后的键值对数量: ${kvManager.count('en-US')}`);
    console.log(`zh-CN 键值对数量: ${kvManager.count('zh-CN')}`);

    // 清空所有语言
    kvManager.clear();
    console.log(`清空所有语言后的键值对数量: ${kvManager.count()}`);

    console.log('-----------------------------------\n');

    // 测试8：默认管理器
    console.log('测试8: 默认管理器');
    console.log('-----------------------------------');

    // 使用默认管理器添加键值对
    const defaultKey = keyValueManager.add('默认管理器测试');
    console.log(`默认管理器添加: "${defaultKey}" => "默认管理器测试"`);
    console.log(`默认管理器键值对数量: ${keyValueManager.count()}`);

    console.log('-----------------------------------\n');

    console.log('Key-Value管理器测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 清理测试环境
    cleanupTest();
  }
}

// 运行测试
runKeyValueManagerTest().catch(console.error); 