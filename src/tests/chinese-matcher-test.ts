import {
  ChineseMatchMode,
  ChineseMatcher,
  containsChinese,
  createChineseMatcher,
  defaultChineseMatcher,
  isAllChinese
} from '../utils/chinese-matcher';

/**
 * 测试中文匹配规则模块
 */
async function runChineseMatcherTest() {
  try {
    console.log('开始测试中文匹配规则模块...');
    console.log('===================================');

    // 测试1：基本函数测试
    console.log('测试1: 基本函数测试');
    console.log('-----------------------------------');

    // 测试isAllChinese函数
    const allChineseTestCases = [
      { input: '你好世界', expected: true },
      { input: '你好world', expected: false },
      { input: '你好123', expected: false },
      { input: '你好！', expected: true }, // 中文标点符号
      { input: '', expected: false },
      { input: '   ', expected: false },
      { input: '你好\n世界', expected: true },
      { input: '你好\t世界', expected: true }
    ];

    console.log('isAllChinese函数测试:');
    for (const testCase of allChineseTestCases) {
      const result = isAllChinese(testCase.input);
      console.log(`  "${testCase.input}" => ${result} (期望: ${testCase.expected}) - ${result === testCase.expected ? '✓' : '✗'}`);
    }

    // 测试containsChinese函数
    const containsChineseTestCases = [
      { input: '你好世界', expected: true },
      { input: '你好world', expected: true },
      { input: 'hello世界', expected: true },
      { input: 'hello world', expected: false },
      { input: '123', expected: false },
      { input: '', expected: false },
      { input: '   ', expected: false },
      { input: '你好\nworld', expected: true }
    ];

    console.log('\ncontainsChinese函数测试:');
    for (const testCase of containsChineseTestCases) {
      const result = containsChinese(testCase.input);
      console.log(`  "${testCase.input}" => ${result} (期望: ${testCase.expected}) - ${result === testCase.expected ? '✓' : '✗'}`);
    }
    console.log('-----------------------------------\n');

    // 测试2：ChineseMatcher类测试 - 全中文模式
    console.log('测试2: ChineseMatcher类测试 - 全中文模式');
    console.log('-----------------------------------');

    const allChineseMatcher = createChineseMatcher({
      mode: ChineseMatchMode.ALL_CHINESE
    });

    const allChineseMatcherTestCases = [
      { input: '你好世界', expected: true },
      { input: '你好world', expected: false },
      { input: '你好123', expected: false },
      { input: '你好！', expected: true },
      { input: '', expected: false }
    ];

    console.log('全中文匹配模式测试:');
    for (const testCase of allChineseMatcherTestCases) {
      const result = allChineseMatcher.match(testCase.input);
      console.log(`  "${testCase.input}" => ${result} (期望: ${testCase.expected}) - ${result === testCase.expected ? '✓' : '✗'}`);
    }
    console.log('-----------------------------------\n');

    // 测试3：ChineseMatcher类测试 - 包含中文模式
    console.log('测试3: ChineseMatcher类测试 - 包含中文模式');
    console.log('-----------------------------------');

    const containsChineseMatcher = createChineseMatcher({
      mode: ChineseMatchMode.CONTAINS_CHINESE
    });

    const containsChineseMatcherTestCases = [
      { input: '你好世界', expected: true },
      { input: '你好world', expected: true },
      { input: 'hello世界', expected: true },
      { input: 'hello world', expected: false },
      { input: '123', expected: false },
      { input: '', expected: false }
    ];

    console.log('包含中文匹配模式测试:');
    for (const testCase of containsChineseMatcherTestCases) {
      const result = containsChineseMatcher.match(testCase.input);
      console.log(`  "${testCase.input}" => ${result} (期望: ${testCase.expected}) - ${result === testCase.expected ? '✓' : '✗'}`);
    }
    console.log('-----------------------------------\n');

    // 测试4：排除规则测试
    console.log('测试4: 排除规则测试');
    console.log('-----------------------------------');

    // 测试排除注释
    const excludeCommentsMatcher = createChineseMatcher({
      mode: ChineseMatchMode.CONTAINS_CHINESE,
      excludeComments: true
    });

    const commentTestCases = [
      { input: '// 这是一个注释', expected: false },
      { input: '/* 这是一个多行注释 */', expected: false },
      { input: 'const msg = "你好"; // 这是一个注释', expected: true }, // 非注释部分仍然匹配
      { input: '你好世界', expected: true }
    ];

    console.log('排除注释测试:');
    for (const testCase of commentTestCases) {
      const result = excludeCommentsMatcher.match(testCase.input);
      console.log(`  "${testCase.input}" => ${result} (期望: ${testCase.expected}) - ${result === testCase.expected ? '✓' : '✗'}`);
    }

    // 测试自定义排除规则
    const customExcludeMatcher = createChineseMatcher({
      mode: ChineseMatchMode.CONTAINS_CHINESE,
      excludePatterns: [/console\.log\(.+\)/]
    });

    const customExcludeTestCases = [
      { input: 'console.log("你好世界")', expected: false },
      { input: 'const msg = "你好";', expected: true },
      { input: '你好世界', expected: true }
    ];

    console.log('\n自定义排除规则测试:');
    for (const testCase of customExcludeTestCases) {
      const result = customExcludeMatcher.match(testCase.input);
      console.log(`  "${testCase.input}" => ${result} (期望: ${testCase.expected}) - ${result === testCase.expected ? '✓' : '✗'}`);
    }
    console.log('-----------------------------------\n');

    // 测试5：提取中文片段
    console.log('测试5: 提取中文片段');
    console.log('-----------------------------------');

    const extractTestCases = [
      {
        input: '你好世界，hello world',
        mode: ChineseMatchMode.ALL_CHINESE,
        expected: ['你好世界，']
      },
      {
        input: '你好world，hello世界',
        mode: ChineseMatchMode.ALL_CHINESE,
        expected: ['你好', '，', '世界']
      },
      {
        input: '你好世界，hello world',
        mode: ChineseMatchMode.CONTAINS_CHINESE,
        expected: ['你好世界，hello world']
      },
      {
        input: '你好world，hello世界',
        mode: ChineseMatchMode.CONTAINS_CHINESE,
        expected: ['你好world，hello世界']
      }
    ];

    console.log('提取中文片段测试:');
    for (const testCase of extractTestCases) {
      const matcher = createChineseMatcher({ mode: testCase.mode });
      const result = matcher.extractChineseSegments(testCase.input);
      console.log(`  模式: ${testCase.mode}`);
      console.log(`  输入: "${testCase.input}"`);
      console.log(`  结果: [${result.map(s => `"${s}"`).join(', ')}]`);
      console.log(`  期望: [${testCase.expected.map(s => `"${s}"`).join(', ')}]`);

      const isCorrect = JSON.stringify(result) === JSON.stringify(testCase.expected);
      console.log(`  ${isCorrect ? '✓' : '✗'}\n`);
    }
    console.log('-----------------------------------\n');

    // 测试6：动态切换模式
    console.log('测试6: 动态切换模式');
    console.log('-----------------------------------');

    const dynamicMatcher = createChineseMatcher();
    console.log(`初始模式: ${dynamicMatcher.getMode()}`);

    const testString = '你好world';
    console.log(`测试字符串: "${testString}"`);

    console.log(`包含中文模式匹配结果: ${dynamicMatcher.match(testString)}`);

    dynamicMatcher.setMode(ChineseMatchMode.ALL_CHINESE);
    console.log(`切换到全中文模式`);
    console.log(`全中文模式匹配结果: ${dynamicMatcher.match(testString)}`);

    dynamicMatcher.setMode(ChineseMatchMode.CONTAINS_CHINESE);
    console.log(`切换回包含中文模式`);
    console.log(`包含中文模式匹配结果: ${dynamicMatcher.match(testString)}`);
    console.log('-----------------------------------\n');

    // 测试7：边缘情况测试
    console.log('测试7: 边缘情况测试');
    console.log('-----------------------------------');

    const edgeCaseTestCases = [
      { input: null, expected: false },
      { input: undefined, expected: false },
      { input: '中', expected: true },
      { input: '中\n', expected: true },
      { input: '\n中', expected: true },
      { input: '  中  ', expected: true },
      { input: '中1', expected: false, mode: ChineseMatchMode.ALL_CHINESE },
      { input: '中1', expected: true, mode: ChineseMatchMode.CONTAINS_CHINESE }
    ];

    console.log('边缘情况测试:');
    for (const testCase of edgeCaseTestCases) {
      const mode = testCase.mode || ChineseMatchMode.CONTAINS_CHINESE;
      const matcher = createChineseMatcher({ mode });
      // @ts-ignore - 故意测试null/undefined
      const result = matcher.match(testCase.input);
      console.log(`  "${testCase.input}" (${mode}) => ${result} (期望: ${testCase.expected}) - ${result === testCase.expected ? '✓' : '✗'}`);
    }
    console.log('-----------------------------------\n');

    console.log('中文匹配规则模块测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
runChineseMatcherTest().catch(console.error); 