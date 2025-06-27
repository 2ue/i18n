/**
 * KeyValueManager 单元测试
 */

import fs from 'fs-extra';
import path from 'path';
import { KeyValueManager } from '../../../src/core/key-value-manager';

describe('KeyValueManager', () => {
  let keyValueManager: KeyValueManager;
  const testOutputDir = path.join(process.cwd(), 'test', 'output');

  beforeEach(() => {
    // 确保测试目录存在
    fs.ensureDirSync(testOutputDir);

    // 创建测试实例
    keyValueManager = new KeyValueManager({
      config: {
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
        locale: 'zh-CN',
        fallbackLocale: 'en-US',
        outputDir: testOutputDir
      },
      debug: true
    });
  });

  afterEach(() => {
    // 清理测试文件
    try {
      fs.emptyDirSync(testOutputDir);
    } catch (error) {
      console.error('清理测试目录失败:', error);
    }
  });

  describe('add', () => {
    it('应该正确添加键值对', () => {
      const value = '你好世界';
      const key = keyValueManager.add(value);

      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);

      // 验证是否可以通过值获取键
      const retrievedKey = keyValueManager.getKeyByValue(value);
      expect(retrievedKey).toBe(key);

      // 验证是否可以通过键获取值
      const retrievedValue = keyValueManager.getValueByKey(key);
      expect(retrievedValue).toBe(value);
    });

    it('应该重用已有键', () => {
      const value = '你好世界';
      const key1 = keyValueManager.add(value);
      const key2 = keyValueManager.add(value);

      expect(key1).toBe(key2);
    });

    it('应该生成拼音键', () => {
      const value = '你好';
      const key = keyValueManager.add(value);

      expect(key).toMatch(/^[a-z0-9_]+$/);
      expect(key).toContain('nihao');
    });

    it('应该为长文本生成哈希键', () => {
      const value = '这是一个非常长的中文文本，超过了最大中文长度限制';
      const key = keyValueManager.add(value);

      expect(key).toMatch(/^[a-z0-9_]+$/);
      expect(key.length).toBeGreaterThan(0);
    });

    it('应该处理重复键', () => {
      // 创建一个新的管理器，禁用重用键
      const nonReuseManager = new KeyValueManager({
        config: {
          keyGeneration: {
            maxChineseLength: 8,
            hashLength: 6,
            reuseExistingKey: false,
            duplicateKeySuffix: 'hash',
            keyPrefix: '',
            separator: '_',
            maxRetryCount: 5,
            pinyinOptions: {
              toneType: 'none',
              type: 'array'
            }
          },
          locale: 'zh-CN',
          fallbackLocale: 'en-US',
          outputDir: testOutputDir
        }
      });

      // 添加两个可能生成相同键的值
      const value1 = '测试';
      const value2 = '测试';
      const key1 = nonReuseManager.add(value1);
      const key2 = nonReuseManager.add(value2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('saveToFile', () => {
    it('应该将键值对保存到文件', () => {
      // 添加一些键值对
      keyValueManager.add('你好');
      keyValueManager.add('世界');

      // 保存到文件
      const result = keyValueManager.saveToFile();
      expect(result).toBe(true);

      // 验证文件是否存在
      const filePath = path.join(testOutputDir, 'zh-CN.json');
      expect(fs.existsSync(filePath)).toBe(true);

      // 验证文件内容
      const fileContent = fs.readJSONSync(filePath);
      expect(fileContent).toHaveProperty('nihao', '你好');
      expect(fileContent).toHaveProperty('shijie', '世界');
    });
  });

  describe('loadExistingData', () => {
    it('应该加载现有键值对数据', () => {
      // 创建测试数据
      const testData = {
        'test_key': '测试键',
        'hello_world': '你好世界'
      };

      // 写入测试文件
      const filePath = path.join(testOutputDir, 'zh-CN.json');
      fs.writeJSONSync(filePath, testData);

      // 加载数据
      const result = keyValueManager.loadExistingData();
      expect(result).toBe(true);

      // 验证数据是否正确加载
      expect(keyValueManager.getValueByKey('test_key')).toBe('测试键');
      expect(keyValueManager.getValueByKey('hello_world')).toBe('你好世界');
      expect(keyValueManager.getKeyByValue('测试键')).toBe('test_key');
      expect(keyValueManager.getKeyByValue('你好世界')).toBe('hello_world');
    });
  });

  describe('merge', () => {
    it('应该正确合并键值对数据', () => {
      // 添加一些初始数据
      keyValueManager.add('你好');

      // 合并新数据
      const newData = {
        'shijie': '世界',
        'test_key': '测试'
      };

      const mergeCount = keyValueManager.merge(newData);
      expect(mergeCount).toBe(2);

      // 验证合并结果
      expect(keyValueManager.getValueByKey('nihao')).toBe('你好');
      expect(keyValueManager.getValueByKey('shijie')).toBe('世界');
      expect(keyValueManager.getValueByKey('test_key')).toBe('测试');
    });
  });

  describe('generateKey', () => {
    it('应该生成有效的键', () => {
      const key1 = keyValueManager.generateKey('你好');
      const key2 = keyValueManager.generateKey('这是一个非常长的中文文本');

      expect(key1).toMatch(/^[a-z0-9_]+$/);
      expect(key2).toMatch(/^[a-z0-9_]+$/);
    });
  });
}); 