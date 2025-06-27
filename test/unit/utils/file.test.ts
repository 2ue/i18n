/**
 * 文件操作模块单元测试
 */

import fs from 'fs-extra';
import path from 'path';
import * as FileUtil from '../../../src/utils/file';

describe('File Utils', () => {
  const testDir = path.join(process.cwd(), 'test', 'output', 'file-utils');
  const testFile = path.join(testDir, 'test.txt');
  const testJsonFile = path.join(testDir, 'test.json');

  beforeEach(() => {
    // 确保测试目录存在
    fs.ensureDirSync(testDir);
  });

  afterEach(() => {
    // 清理测试目录
    try {
      fs.removeSync(testDir);
    } catch (error) {
      console.error('清理测试目录失败:', error);
    }
  });

  describe('fileExists', () => {
    it('应该正确检测文件是否存在', () => {
      // 创建测试文件
      fs.writeFileSync(testFile, 'test content');

      expect(FileUtil.fileExists(testFile)).toBe(true);
      expect(FileUtil.fileExists(path.join(testDir, 'non-existent.txt'))).toBe(false);
    });
  });

  describe('isFile', () => {
    it('应该正确检测路径是否为文件', () => {
      // 创建测试文件
      fs.writeFileSync(testFile, 'test content');

      expect(FileUtil.isFile(testFile)).toBe(true);
      expect(FileUtil.isFile(testDir)).toBe(false);
      expect(FileUtil.isFile(path.join(testDir, 'non-existent.txt'))).toBe(false);
    });
  });

  describe('isDirectory', () => {
    it('应该正确检测路径是否为目录', () => {
      expect(FileUtil.isDirectory(testDir)).toBe(true);
      expect(FileUtil.isDirectory(testFile)).toBe(false);
      expect(FileUtil.isDirectory(path.join(testDir, 'non-existent'))).toBe(false);
    });
  });

  describe('ensureDir', () => {
    it('应该创建目录', () => {
      const nestedDir = path.join(testDir, 'nested', 'dir');

      expect(FileUtil.ensureDir(nestedDir)).toBe(true);
      expect(fs.existsSync(nestedDir)).toBe(true);
    });
  });

  describe('readFile/writeFile', () => {
    it('应该读写文件内容', () => {
      const content = 'test content';

      // 写入文件
      expect(FileUtil.writeFile(testFile, content)).toBe(true);

      // 读取文件
      expect(FileUtil.readFile(testFile)).toBe(content);

      // 读取不存在的文件
      expect(FileUtil.readFile(path.join(testDir, 'non-existent.txt'))).toBeNull();
    });
  });

  describe('readJSON/writeJSON', () => {
    it('应该读写JSON文件', () => {
      const data = { key: 'value', number: 123 };

      // 写入JSON文件
      expect(FileUtil.writeJSON(testJsonFile, data)).toBe(true);

      // 读取JSON文件
      const readData = FileUtil.readJSON(testJsonFile);
      expect(readData).toEqual(data);

      // 读取不存在的JSON文件
      expect(FileUtil.readJSON(path.join(testDir, 'non-existent.json'))).toBeNull();
    });
  });

  describe('findFiles', () => {
    it('应该使用fast-glob查找匹配的文件', () => {
      // 创建测试文件
      fs.writeFileSync(path.join(testDir, 'test1.txt'), 'test content');
      fs.writeFileSync(path.join(testDir, 'test2.txt'), 'test content');
      fs.ensureDirSync(path.join(testDir, 'subdir'));
      fs.writeFileSync(path.join(testDir, 'subdir', 'test3.txt'), 'test content');

      // 查找所有txt文件
      const files = FileUtil.findFiles(path.join(testDir, '**/*.txt'));
      expect(files.length).toBe(3);

      // 使用排除选项
      const filteredFiles = FileUtil.findFiles(path.join(testDir, '**/*.txt'), {
        ignore: [path.join(testDir, 'subdir/**')]
      });
      expect(filteredFiles.length).toBe(2);
    });
  });

  describe('matchGlob', () => {
    it('应该正确匹配glob模式', () => {
      expect(FileUtil.matchGlob('test/file.txt', '**/*.txt')).toBe(true);
      expect(FileUtil.matchGlob('test/file.txt', '**/*.js')).toBe(false);
      expect(FileUtil.matchGlob('test/file.txt', ['**/*.js', '**/*.txt'])).toBe(true);
    });
  });

  describe('shouldIncludeFile', () => {
    it('应该根据include和exclude模式判断文件是否应该包含', () => {
      expect(FileUtil.shouldIncludeFile(
        'src/file.ts',
        ['src/**/*.ts'],
        ['**/node_modules/**']
      )).toBe(true);

      expect(FileUtil.shouldIncludeFile(
        'src/file.ts',
        ['src/**/*.js'],
        ['**/node_modules/**']
      )).toBe(false);

      expect(FileUtil.shouldIncludeFile(
        'node_modules/file.ts',
        ['**/*.ts'],
        ['**/node_modules/**']
      )).toBe(false);
    });
  });
}); 