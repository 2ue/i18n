/**
 * 测试全局设置
 */

import path from 'path';
import fs from 'fs-extra';

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 创建测试输出目录
const testOutputDir = path.join(process.cwd(), 'test', 'output');
fs.ensureDirSync(testOutputDir);

// 清理测试输出目录
beforeAll(() => {
  try {
    fs.emptyDirSync(testOutputDir);
  } catch (error) {
    console.error('清理测试输出目录失败:', error);
  }
});

// 全局超时设置
jest.setTimeout(10000);

// 导出工具函数
export const getFixturePath = (fixtureName: string): string => {
  return path.join(process.cwd(), 'test', 'fixtures', fixtureName);
};

export const getOutputPath = (fileName: string): string => {
  return path.join(testOutputDir, fileName);
};

export const readFixture = (fixtureName: string): string => {
  return fs.readFileSync(getFixturePath(fixtureName), 'utf-8');
}; 