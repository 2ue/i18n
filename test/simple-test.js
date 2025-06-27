/**
 * 简单测试脚本
 * 直接使用fs模块操作文件进行对比
 */
const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

// 目录配置
const examplesDir = path.join(__dirname, '../examples');
const tempDir = path.join(__dirname, '../temp');

// 确保temp目录存在
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * 查找所有测试文件
 */
function findTestFiles() {
  return glob.sync('**/*.{js,jsx,ts,tsx}', {
    cwd: examplesDir,
    absolute: true,
    ignore: ['**/*.replaced.*']
  });
}

/**
 * 简单扫描文件中的中文字符串
 * @param {string} content 
 * @returns {string[]} 
 */
function scanChineseStrings(content) {
  // 移除注释后检查中文字符串
  const uncommentedContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');

  // 移除$t函数调用中的中文字符串
  const contentWithoutTFuncs = uncommentedContent.replace(/\$t\(['"](.*?)['"]\)/g, '');

  const chineseStringRegex = /(['"])[^'"]*[一-龥]+[^'"]*\1/g;
  return contentWithoutTFuncs.match(chineseStringRegex) || [];
}

/**
 * 获取未替换的中文字符串及其位置
 * @param {string} content 
 * @returns {{string: string, line: number}[]} 
 */
function findUnreplacedChineseStrings(content) {
  // 移除$t函数调用中的中文字符串
  const contentWithoutTFuncs = content.replace(/\$t\(['"](.*?)['"]\)/g, '');

  const result = [];
  const chineseStringRegex = /(['"])[^'"]*[一-龥]+[^'"]*\1/g;
  const lines = contentWithoutTFuncs.split('\n');

  // 检查每行是否含有中文字符串
  lines.forEach((line, index) => {
    let match;
    while ((match = chineseStringRegex.exec(line)) !== null) {
      const str = match[0];
      // 排除注释中的中文
      const lineContent = line.substring(0, match.index);
      if (!lineContent.includes('//') && !lineContent.includes('/*')) {
        result.push({
          string: str,
          line: index + 1
        });
      }
    }
  });

  return result;
}

/**
 * 简单替换中文字符串
 * @param {string} content 
 * @returns {string}
 */
function replaceChineseStrings(content) {
  // 创建替换后的内容
  let replacedContent = content;

  // 注释正则表达式，用于跳过注释中的内容
  const commentRegex = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
  // 替换注释为空格，以保持行号一致
  let codeWithoutComments = replacedContent.replace(commentRegex, match => ' '.repeat(match.length));

  // 正则表达式用于识别中文字符串
  const chineseStringRegex = /(['"])[^'"]*[一-龥]+[^'"]*\1/g;

  // 查找代码中所有的中文字符串（不含注释中的）
  let match;
  // 收集所有需要替换的位置和内容
  const replacements = [];
  while ((match = chineseStringRegex.exec(codeWithoutComments)) !== null) {
    const str = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + str.length;

    // 检查这个匹配是否在注释中
    let inComment = false;
    let commentMatch;
    commentRegex.lastIndex = 0;
    while ((commentMatch = commentRegex.exec(content)) !== null) {
      const commentStart = commentMatch.index;
      const commentEnd = commentStart + commentMatch[0].length;
      if (startIndex >= commentStart && endIndex <= commentEnd) {
        inComment = true;
        break;
      }
    }

    if (!inComment) {
      // 提取字符串的引号类型
      const quote = str[0];
      // 提取字符串内容（不含引号）
      const textContent = str.substring(1, str.length - 1);
      // 创建一个简单的key
      const key = textContent
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '_') // 非中英文数字替换为下划线
        .replace(/_{2,}/g, '_') // 多个下划线合并为一个
        .substring(0, 20); // 限制长度

      replacements.push({
        str,
        replacement: `$t(${quote}${key}${quote})`,
        index: startIndex
      });
    }
  }

  // 从后向前替换，这样索引不会变化
  replacements.sort((a, b) => b.index - a.index);
  for (const { str, replacement } of replacements) {
    replacedContent = replacedContent.replace(str, replacement);
  }

  return replacedContent;
}

/**
 * 主函数
 */
async function main() {
  const testFiles = findTestFiles();
  console.log(`找到 ${testFiles.length} 个测试文件`);

  // 扫描并替换每个文件
  for (const file of testFiles) {
    const relativePath = path.relative(examplesDir, file);
    const outputFile = path.join(tempDir, relativePath);

    // 确保输出目录存在
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 读取原文件内容
    const content = fs.readFileSync(file, 'utf8');

    // 扫描中文字符串
    const chineseStrings = scanChineseStrings(content);
    console.log(`文件 ${relativePath} 包含 ${chineseStrings.length} 个中文字符串`);

    // 替换中文字符串
    const replacedContent = replaceChineseStrings(content);

    // 写入替换后的文件
    fs.writeFileSync(outputFile, replacedContent);
    console.log(`已生成替换后的文件: ${outputFile}`);

    // 简单对比
    const afterChineseStrings = scanChineseStrings(replacedContent);
    console.log(`替换后的文件包含 ${afterChineseStrings.length} 个中文字符串`);

    // 检查未替换的中文字符串
    if (afterChineseStrings.length > 0) {
      console.log('未替换的中文字符串:');
      const unreplaced = findUnreplacedChineseStrings(replacedContent);
      unreplaced.forEach(item => {
        console.log(`  第 ${item.line} 行: ${item.string}`);
      });
    }

    if (afterChineseStrings.length < chineseStrings.length) {
      console.log('替换成功！');
    } else {
      console.log('替换失败，请检查原因！');
    }

    console.log('-'.repeat(50));
  }

  console.log('\n测试完成！');
}

// 执行测试
main().catch(error => {
  console.error('测试出错:', error);
  process.exit(1);
}); 