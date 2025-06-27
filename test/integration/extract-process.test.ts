/**
 * 提取流程集成测试
 */
import fs from 'fs-extra';
import path from 'path';
import { Process } from '../../src/core/process';
import { Config } from '../../src/types/config';

describe('提取流程集成测试', () => {
  const testDir = path.join(process.cwd(), 'test', 'output', 'integration');
  const testSourceDir = path.join(testDir, 'src');
  const testOutputDir = path.join(testDir, 'locales');

  beforeEach(() => {
    // 确保测试目录存在
    fs.ensureDirSync(testDir);
    fs.ensureDirSync(testSourceDir);
    fs.ensureDirSync(testOutputDir);

    // 创建测试文件
    const testFile = path.join(testSourceDir, 'test.ts');
    fs.writeFileSync(testFile, `
      // 测试文件
      const message1 = '你好世界';
      const message2 = "欢迎使用";
      
      function greet(name: string) {
        return \`你好，\${name}\`;
      }
      
      const config = {
        title: '系统配置',
        description: '这是系统配置页面'
      };
    `);
  });

  afterEach(() => {
    // 清理测试目录
    try {
      fs.removeSync(testDir);
    } catch (error) {
      console.error('清理测试目录失败:', error);
    }
  });

  it('应该提取中文文案并生成键值对', () => {
    // 创建测试配置
    const config: Config = {
      locale: 'zh-CN',
      fallbackLocale: 'en-US',
      outputDir: testOutputDir,
      include: [
        path.join(testSourceDir, '**/*.ts')
      ],
      exclude: [
        'node_modules/**'
      ],
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
      output: {
        prettyJson: true,
        localeFileName: '{locale}.json'
      },
      logging: {
        enabled: true,
        level: 'normal'
      },
      replacement: {
        functionName: '$t',
        autoImport: {
          enabled: false,
          insertPosition: 'afterImports',
          imports: {}
        }
      },
      translation: {
        enabled: false,
        provider: 'baidu',
        defaultSourceLang: 'zh',
        defaultTargetLang: 'en',
        concurrency: 10,
        retryTimes: 3,
        retryDelay: 0,
        batchDelay: 0,
        baidu: {
          appid: '',
          key: ''
        }
      }
    };

    // 创建处理流程实例
    const processManager = new Process();

    // 注入配置
    (processManager as any).config = config;

    // 执行提取流程
    const result = processManager.execute({
      extractOnly: true,
      dryRun: false
    });

    // 验证结果
    expect(result.scannedFiles).toBeGreaterThan(0);
    expect(result.extractedTexts).toBeGreaterThan(0);

    // 验证输出文件
    const outputFile = path.join(testOutputDir, 'zh-CN.json');
    expect(fs.existsSync(outputFile)).toBe(true);

    // 验证输出内容
    const outputContent = fs.readJSONSync(outputFile);
    expect(outputContent).toBeDefined();

    // 验证提取的文本
    expect(Object.values(outputContent)).toContain('你好世界');
    expect(Object.values(outputContent)).toContain('欢迎使用');
    expect(Object.values(outputContent)).toContain('你好，');
    expect(Object.values(outputContent)).toContain('系统配置');
    expect(Object.values(outputContent)).toContain('这是系统配置页面');
  });

  it('应该支持替换模式', () => {
    // 创建测试配置
    const config: Config = {
      locale: 'zh-CN',
      fallbackLocale: 'en-US',
      outputDir: testOutputDir,
      include: [
        path.join(testSourceDir, '**/*.ts')
      ],
      exclude: [
        'node_modules/**'
      ],
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
      output: {
        prettyJson: true,
        localeFileName: '{locale}.json'
      },
      logging: {
        enabled: true,
        level: 'normal'
      },
      replacement: {
        functionName: '$t',
        autoImport: {
          enabled: false,
          insertPosition: 'afterImports',
          imports: {}
        }
      },
      translation: {
        enabled: false,
        provider: 'baidu',
        defaultSourceLang: 'zh',
        defaultTargetLang: 'en',
        concurrency: 10,
        retryTimes: 3,
        retryDelay: 0,
        batchDelay: 0,
        baidu: {
          appid: '',
          key: ''
        }
      }
    };

    // 创建处理流程实例
    const processManager = new Process();

    // 注入配置
    (processManager as any).config = config;

    // 执行替换流程
    const result = processManager.execute({
      extractOnly: false,
      dryRun: false
    });

    // 验证结果
    expect(result.scannedFiles).toBeGreaterThan(0);
    expect(result.extractedTexts).toBeGreaterThan(0);
    expect(result.replacedFiles).toBeGreaterThan(0);

    // 验证输出文件
    const outputFile = path.join(testOutputDir, 'zh-CN.json');
    expect(fs.existsSync(outputFile)).toBe(true);

    // 验证替换后的文件内容
    const testFile = path.join(testSourceDir, 'test.ts');
    const fileContent = fs.readFileSync(testFile, 'utf-8');

    // 验证替换是否成功
    expect(fileContent).toContain('$t(');
    expect(fileContent).not.toContain('\'你好世界\'');
    expect(fileContent).not.toContain('"欢迎使用"');
  });
}); 