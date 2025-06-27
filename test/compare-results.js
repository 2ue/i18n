/**
 * 对比源文件和替换后文件的工具
 */
const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');
const chalk = require('chalk');

// 默认配置
const config = {
  sourceDir: 'examples',
  outputDir: 'temp',
  patterns: ['**/*.{js,jsx,ts,tsx}'],
  excludePatterns: ['**/*.replaced.*'],
  localesDir: 'locales'
};

/**
 * 读取文件内容
 * @param {string} filePath 
 * @returns {string}
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return '';
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath 
 * @returns {boolean}
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 获取替换后的文件路径
 * @param {string} originalPath 
 * @param {string} outputDir 
 * @returns {string}
 */
function getReplacedFilePath(originalPath, outputDir) {
  // 从examples/basic/string-literal.js变为temp/basic/string-literal.js
  const relativePath = path.relative(config.sourceDir, originalPath);
  return path.join(outputDir, relativePath);
}

/**
 * 对比两个文件内容
 * @param {string} originalContent 
 * @param {string} replacedContent 
 * @returns {boolean} 是否符合预期
 */
function compareContents(originalContent, replacedContent) {
  // 检查是否所有中文字符串都被替换为$t调用
  const chineseRegex = /[一-龥]/;
  const chineseStringRegex = /(['"])[^'"]*[一-龥]+[^'"]*\1/g;
  const tFunctionRegex = /\$t\(['"][^'"]+['"]\)/g;

  // 如果替换后的文件中仍然包含直接的中文字符串文字，则可能是未替换
  const chineseStringsInOriginal = originalContent.match(chineseStringRegex) || [];
  const chineseStringsInReplaced = replacedContent.match(chineseStringRegex) || [];
  const tFunctionsInReplaced = replacedContent.match(tFunctionRegex) || [];

  // 简单检查：替换后的文件应该没有原始中文字符串但有$t函数调用
  console.log(`- 原始文件中的中文字符串数量: ${chineseStringsInOriginal.length}`);
  console.log(`- 替换后文件中的中文字符串数量: ${chineseStringsInReplaced.length}`);
  console.log(`- 替换后文件中的$t函数调用数量: ${tFunctionsInReplaced.length}`);

  // 检查是否有中文字符串未被替换（忽略注释中的中文）
  const uncommentedContent = replacedContent.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  const remainingChinese = uncommentedContent.match(chineseStringRegex) || [];

  if (remainingChinese.length > 0) {
    console.log(chalk.yellow('警告: 有未替换的中文字符串:'));
    remainingChinese.forEach(str => console.log(`  ${str}`));
  }

  // 如果替换后的文件有适当数量的$t函数调用，基本可认为替换成功
  return tFunctionsInReplaced.length >= 1 && remainingChinese.length < chineseStringsInOriginal.length;
}

/**
 * 检查翻译文件
 */
function checkTranslationFiles() {
  const localeFiles = glob.sync(`${config.localesDir}/*.json`);

  if (localeFiles.length === 0) {
    console.log(chalk.red('警告: 未找到任何翻译文件'));
    return;
  }

  console.log(chalk.green(`\n找到 ${localeFiles.length} 个翻译文件:`));

  localeFiles.forEach(file => {
    const content = readFile(file);
    try {
      const json = JSON.parse(content);
      const keyCount = Object.keys(json).length;
      console.log(`- ${path.basename(file)}: ${keyCount} 个翻译键`);
    } catch (error) {
      console.log(chalk.red(`- ${path.basename(file)}: 无效的JSON`));
    }
  });
}

/**
 * 主函数
 */
async function main() {
  // 查找原始文件
  const originalFiles = glob.sync(config.patterns, {
    cwd: config.sourceDir,
    ignore: config.excludePatterns,
    absolute: true
  });

  console.log(chalk.blue(`找到 ${originalFiles.length} 个原始文件`));

  let successCount = 0;
  let failCount = 0;
  let missingCount = 0;

  // 对比每个文件
  for (const originalFile of originalFiles) {
    const replacedFile = getReplacedFilePath(originalFile, config.outputDir);

    console.log(chalk.blue(`\n对比文件: ${path.relative(process.cwd(), originalFile)}`));

    if (!fileExists(replacedFile)) {
      console.log(chalk.yellow(`替换后的文件不存在: ${path.relative(process.cwd(), replacedFile)}`));
      missingCount++;
      continue;
    }

    const originalContent = readFile(originalFile);
    const replacedContent = readFile(replacedFile);

    const success = compareContents(originalContent, replacedContent);

    if (success) {
      console.log(chalk.green('✓ 替换结果符合预期'));
      successCount++;
    } else {
      console.log(chalk.red('✗ 替换结果不符合预期'));
      failCount++;
    }
  }

  // 检查翻译文件
  checkTranslationFiles();

  // 输出统计结果
  console.log(chalk.blue('\n测试统计:'));
  console.log(`- 总文件数: ${originalFiles.length}`);
  console.log(`- 成功替换: ${successCount}`);
  console.log(`- 替换失败: ${failCount}`);
  console.log(`- 文件缺失: ${missingCount}`);
}

// 执行主函数
main().catch(error => {
  console.error('运行出错:', error);
  process.exit(1);
}); 