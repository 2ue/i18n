import path from 'path';
import * as fileUtils from '../utils/file';
import { logger } from '../utils/logger';

// 测试目录
const TEST_DIR = path.resolve(__dirname, '../../test-files');
const TEST_SUBDIR = path.join(TEST_DIR, 'subdir');
const TEST_FILE = path.join(TEST_DIR, 'test.txt');
const TEST_JSON_FILE = path.join(TEST_DIR, 'test.json');
const TEST_COPY_FILE = path.join(TEST_SUBDIR, 'test-copy.txt');

// 测试数据
const TEST_CONTENT = 'Hello, 世界!';
const TEST_JSON_DATA = { name: 'i18n-xy', version: '1.0.0', config: { enabled: true } };

// 定义测试JSON数据的类型，以便TypeScript进行类型检查
interface TestJsonData {
  name: string;
  version: string;
  config: {
    enabled: boolean;
  };
}

/**
 * 准备测试环境
 */
function setupTest(): void {
  // 清理可能存在的测试目录
  if (fileUtils.fileExists(TEST_DIR)) {
    fileUtils.removeDir(TEST_DIR);
  }
}

/**
 * 清理测试环境
 */
function cleanupTest(): void {
  if (fileUtils.fileExists(TEST_DIR)) {
    fileUtils.removeDir(TEST_DIR);
  }
}

/**
 * 运行文件操作测试
 */
async function runFileTest() {
  try {
    console.log('开始测试文件操作模块...');
    console.log('===================================');

    // 准备测试环境
    setupTest();

    // 测试1：目录操作
    console.log('测试1: 目录操作');
    console.log('-----------------------------------');

    // 创建目录
    console.log(`创建目录: ${TEST_DIR}`);
    const dirCreated = fileUtils.ensureDir(TEST_DIR);
    console.log(`目录创建结果: ${dirCreated}`);
    console.log(`目录存在: ${fileUtils.fileExists(TEST_DIR)}`);
    console.log(`是目录: ${fileUtils.isDirectory(TEST_DIR)}`);

    // 创建子目录
    console.log(`创建子目录: ${TEST_SUBDIR}`);
    fileUtils.ensureDir(TEST_SUBDIR);
    console.log(`子目录存在: ${fileUtils.fileExists(TEST_SUBDIR)}`);
    console.log('-----------------------------------\n');

    // 测试2：文件写入和读取
    console.log('测试2: 文件写入和读取');
    console.log('-----------------------------------');

    // 写入文件
    console.log(`写入文件: ${TEST_FILE}`);
    const writeResult = fileUtils.writeFile(TEST_FILE, TEST_CONTENT);
    console.log(`文件写入结果: ${writeResult}`);
    console.log(`文件存在: ${fileUtils.fileExists(TEST_FILE)}`);
    console.log(`是文件: ${fileUtils.isFile(TEST_FILE)}`);

    // 读取文件
    console.log(`读取文件: ${TEST_FILE}`);
    const content = fileUtils.readFile(TEST_FILE);
    console.log(`文件内容: "${content}"`);
    console.log(`内容匹配: ${content === TEST_CONTENT}`);
    console.log('-----------------------------------\n');

    // 测试3：JSON文件操作
    console.log('测试3: JSON文件操作');
    console.log('-----------------------------------');

    // 写入JSON
    console.log(`写入JSON文件: ${TEST_JSON_FILE}`);
    const jsonWriteResult = fileUtils.writeJSON(TEST_JSON_FILE, TEST_JSON_DATA);
    console.log(`JSON文件写入结果: ${jsonWriteResult}`);

    // 读取JSON
    console.log(`读取JSON文件: ${TEST_JSON_FILE}`);
    const jsonData = fileUtils.readJSON<TestJsonData>(TEST_JSON_FILE);
    console.log('读取的JSON数据:', jsonData);
    console.log(`JSON数据name匹配: ${jsonData?.name === TEST_JSON_DATA.name}`);
    console.log('-----------------------------------\n');

    // 测试4：文件复制
    console.log('测试4: 文件复制');
    console.log('-----------------------------------');

    // 复制文件
    console.log(`复制文件: ${TEST_FILE} -> ${TEST_COPY_FILE}`);
    const copyResult = fileUtils.copyFile(TEST_FILE, TEST_COPY_FILE);
    console.log(`文件复制结果: ${copyResult}`);
    console.log(`目标文件存在: ${fileUtils.fileExists(TEST_COPY_FILE)}`);

    // 读取复制后的文件
    const copiedContent = fileUtils.readFile(TEST_COPY_FILE);
    console.log(`复制后的文件内容匹配: ${copiedContent === TEST_CONTENT}`);
    console.log('-----------------------------------\n');

    // 测试5：glob文件查找
    console.log('测试5: glob文件查找');
    console.log('-----------------------------------');

    // 使用glob模式查找文件
    const txtFiles = fileUtils.findFiles(`${TEST_DIR}/**/*.txt`);
    console.log(`找到的.txt文件数量: ${txtFiles.length}`);
    console.log('找到的.txt文件:', txtFiles);

    const jsonFiles = fileUtils.findFiles(`${TEST_DIR}/**/*.json`);
    console.log(`找到的.json文件数量: ${jsonFiles.length}`);

    // 测试glob匹配判断
    console.log(`${TEST_FILE}匹配"**/*.txt": ${fileUtils.matchGlob(TEST_FILE, '**/*.txt')}`);
    console.log(`${TEST_JSON_FILE}匹配"**/*.json": ${fileUtils.matchGlob(TEST_JSON_FILE, '**/*.json')}`);
    console.log(`${TEST_JSON_FILE}匹配"**/*.txt": ${fileUtils.matchGlob(TEST_JSON_FILE, '**/*.txt')}`);
    console.log('-----------------------------------\n');

    // 测试6：文件包含/排除规则
    console.log('测试6: 文件包含/排除规则');
    console.log('-----------------------------------');

    // 测试shouldIncludeFile
    const include = ['**/*.txt', '**/*.json'];
    const exclude = ['**/subdir/**'];

    console.log(`${TEST_FILE}是否应包含: ${fileUtils.shouldIncludeFile(TEST_FILE, include, exclude)}`);
    console.log(`${TEST_JSON_FILE}是否应包含: ${fileUtils.shouldIncludeFile(TEST_JSON_FILE, include, exclude)}`);
    console.log(`${TEST_COPY_FILE}是否应包含(应排除): ${fileUtils.shouldIncludeFile(TEST_COPY_FILE, include, exclude)}`);
    console.log('-----------------------------------\n');

    // 测试7：路径处理
    console.log('测试7: 路径处理');
    console.log('-----------------------------------');

    // 相对路径
    const relPath = fileUtils.getRelativePath(TEST_FILE);
    console.log(`${TEST_FILE}的相对路径: ${relPath}`);

    // 解析路径
    const absPath = fileUtils.resolvePath(relPath);
    console.log(`解析后的绝对路径: ${absPath}`);
    console.log(`绝对路径匹配: ${absPath === TEST_FILE}`);
    console.log('-----------------------------------\n');

    console.log('文件操作模块测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 清理测试环境
    cleanupTest();
  }
}

// 运行测试
runFileTest().catch(console.error); 