/**
 * 测试i18n扫描替换功能
 */
const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');
const { execSync } = require('child_process');

// 测试配置
const config = {
  sourceDir: 'examples',
  outputDir: 'temp',
  localesDir: 'locales',
  patterns: ['**/*.{js,jsx,ts,tsx}'],
  excludePatterns: ['**/*.replaced.*'],
  configFile: 'test-i18n.config.ts',
  cliPath: './bin/cli.js'
};

/**
 * 读取文件内容
 * @param {string} filePath 
 * @returns {string}
 */
function readFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

/**
 * 获取替换后的文件路径
 * @param {string} originalPath 
 * @param {string} outputDir 
 * @returns {string}
 */
function getReplacedFilePath(originalPath) {
  const relativePath = path.relative(config.sourceDir, originalPath);
  return path.join(config.outputDir, relativePath);
}

/**
 * 检查是否有中文字符串
 * @param {string} content 
 * @returns {boolean}
 */
function hasChineseString(content) {
  // 移除注释后检查是否有中文字符串
  const uncommentedContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  const chineseStringRegex = /(['"])[^'"]*[一-龥]+[^'"]*\1/g;
  const match = uncommentedContent.match(chineseStringRegex);
  return match !== null && match.length > 0;
}

/**
 * 检查是否有$t函数调用
 * @param {string} content 
 * @returns {boolean}
 */
function hasTranslationFunction(content) {
  const tFunctionRegex = /\$t\(['"][^'"]+['"]\)/g;
  const match = content.match(tFunctionRegex);
  return match !== null && match.length > 0;
}

// 在所有测试前清理环境
beforeAll(() => {
  // 清理目录
  try {
    execSync('npm run test:clean');
  } catch (error) {
    console.warn('清理目录失败，可能不存在:', error.message);
  }

  // 构建项目
  try {
    execSync('npm run build');
  } catch (error) {
    throw new Error(`构建项目失败: ${error.message}`);
  }
});

describe('i18n扫描替换功能测试', () => {
  test('扫描中文字符串', () => {
    // 运行扫描命令
    try {
      execSync(`node ${config.cliPath} scan -c ${config.configFile}`);
    } catch (error) {
      throw new Error(`执行扫描命令失败: ${error.message}`);
    }

    // 检查是否生成了翻译文件
    const localeFiles = glob.sync(`${config.localesDir}/*.json`);
    expect(localeFiles.length).toBeGreaterThan(0);

    // 读取翻译文件并检查内容
    const zhFile = path.join(config.localesDir, 'zh-CN.json');
    expect(fs.existsSync(zhFile)).toBe(true);

    const translations = JSON.parse(readFile(zhFile));
    expect(Object.keys(translations).length).toBeGreaterThan(0);
  });

  test('替换中文字符串', () => {
    // 运行替换命令
    try {
      execSync(`node ${config.cliPath} replace -c ${config.configFile}`);
    } catch (error) {
      throw new Error(`执行替换命令失败: ${error.message}`);
    }

    // 查找原始文件
    const originalFiles = glob.sync(config.patterns, {
      cwd: config.sourceDir,
      ignore: config.excludePatterns,
      absolute: true
    });
    expect(originalFiles.length).toBeGreaterThan(0);

    // 检查每个文件的替换结果
    originalFiles.forEach(originalFile => {
      const replacedFile = getReplacedFilePath(originalFile);
      expect(fs.existsSync(replacedFile)).toBe(true);

      const originalContent = readFile(originalFile);
      const replacedContent = readFile(replacedFile);

      // 检查原始文件有中文字符串
      expect(hasChineseString(originalContent)).toBe(true);

      // 检查替换后的文件有$t函数调用
      expect(hasTranslationFunction(replacedContent)).toBe(true);
    });
  });

  // 测试特定场景
  describe('特定场景测试', () => {
    test('JSX表达式容器内的字符串替换', () => {
      const jsxFile = path.join(config.outputDir, 'jsx', 'text-nodes.jsx');
      expect(fs.existsSync(jsxFile)).toBe(true);

      const content = readFile(jsxFile);
      // 检查原来的{'内容详情'}是否被替换为{$t("nei_rong_xiang_qing")}或类似形式
      expect(content).toMatch(/\{\$t\(['"].*?['"]\)\}/);

      // 检查原来的{isVisible && '显示内容'}是否被替换为{isVisible && $t("xian_shi_nei_rong")}或类似形式
      expect(content).toMatch(/\{isVisible && \$t\(['"].*?['"]\)\}/);
    });

    test('对象字面量中的字符串替换', () => {
      const objFile = path.join(config.outputDir, 'complex', 'object-array.jsx');
      expect(fs.existsSync(objFile)).toBe(true);

      const content = readFile(objFile);
      // 检查对象中的中文值是否被替换
      expect(content).toMatch(/title: \$t\(['"].*?['"]\)/);
      expect(content).toMatch(/description: \$t\(['"].*?['"]\)/);
    });

    test('数组字面量中的字符串替换', () => {
      const arrFile = path.join(config.outputDir, 'complex', 'object-array.jsx');
      expect(fs.existsSync(arrFile)).toBe(true);

      const content = readFile(arrFile);
      // 检查数组中的中文值是否被替换
      expect(content).toMatch(/\[\$t\(['"].*?['"]\), \$t\(['"].*?['"]\), \$t\(['"].*?['"]\)\]/);
    });

    test('模板字符串中的中文替换', () => {
      const tplFile = path.join(config.outputDir, 'basic', 'template-string.js');
      expect(fs.existsSync(tplFile)).toBe(true);

      const content = readFile(tplFile);
      // 检查模板字符串是否正确替换
      expect(content).toMatch(/`\$\{status \? \$t\(['"].*?['"]\) : \$t\(['"].*?['"]\)\}`/);
    });

    test('TypeScript场景中的中文替换', () => {
      const tsFile = path.join(config.outputDir, 'typescript', 'types.ts');
      expect(fs.existsSync(tsFile)).toBe(true);

      const content = readFile(tsFile);
      // 检查TypeScript中的值是否被替换，而类型定义没有被替换
      expect(content).toMatch(/name: \$t\(['"].*?['"]\)/);

      // 确保枚举值被正确替换
      expect(content).toMatch(/LOADING = \$t\(['"].*?['"]\)/);
    });
  });
}); 