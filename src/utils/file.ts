import fs from 'fs-extra';
import path from 'path';
import glob from 'fast-glob';
import micromatch from 'micromatch';
import { Logger } from './logger';

/**
 * 文件操作模块
 * 封装常用文件操作，严格使用同步方法
 */

// 创建独立的日志记录器
const fileLogger = Logger.create({ prefix: 'FILE' });

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 文件是否存在
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    fileLogger.error(`检查文件存在性失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 检查路径是否是文件
 * @param filePath 文件路径
 * @returns 是否是文件
 */
export function isFile(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    fileLogger.error(`检查是否为文件失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 检查路径是否是目录
 * @param dirPath 目录路径
 * @returns 是否是目录
 */
export function isDirectory(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    fileLogger.error(`检查是否为目录失败: ${dirPath}`, error);
    return false;
  }
}

/**
 * 创建目录，如果目录已存在则跳过
 * @param dirPath 目录路径
 * @returns 操作是否成功
 */
export function ensureDir(dirPath: string): boolean {
  try {
    fs.ensureDirSync(dirPath);
    return true;
  } catch (error) {
    fileLogger.error(`创建目录失败: ${dirPath}`, error);
    return false;
  }
}

/**
 * 删除文件
 * @param filePath 文件路径
 * @returns 操作是否成功
 */
export function removeFile(filePath: string): boolean {
  try {
    if (fileExists(filePath) && isFile(filePath)) {
      fs.removeSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    fileLogger.error(`删除文件失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 删除目录及其内容
 * @param dirPath 目录路径
 * @returns 操作是否成功
 */
export function removeDir(dirPath: string): boolean {
  try {
    if (fileExists(dirPath) && isDirectory(dirPath)) {
      fs.removeSync(dirPath);
      return true;
    }
    return false;
  } catch (error) {
    fileLogger.error(`删除目录失败: ${dirPath}`, error);
    return false;
  }
}

/**
 * 读取文件内容
 * @param filePath 文件路径
 * @param encoding 编码，默认为utf-8
 * @returns 文件内容，失败返回null
 */
export function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): string | null {
  try {
    if (fileExists(filePath) && isFile(filePath)) {
      return fs.readFileSync(filePath, { encoding });
    }
    fileLogger.error(`文件不存在或不是有效文件: ${filePath}`);
    return null;
  } catch (error) {
    fileLogger.error(`读取文件失败: ${filePath}`, error);
    return null;
  }
}

/**
 * 写入文件内容
 * @param filePath 文件路径
 * @param content 文件内容
 * @param encoding 编码，默认为utf-8
 * @returns 操作是否成功
 */
export function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): boolean {
  try {
    // 确保目录存在
    const dirPath = path.dirname(filePath);
    ensureDir(dirPath);

    // 写入文件
    fs.writeFileSync(filePath, content, { encoding });
    return true;
  } catch (error) {
    fileLogger.error(`写入文件失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 读取JSON文件
 * @param filePath JSON文件路径
 * @returns 解析后的JSON对象，失败返回null
 */
export function readJSON<T = unknown>(filePath: string): T | null {
  try {
    if (fileExists(filePath) && isFile(filePath)) {
      return fs.readJSONSync(filePath);
    }
    fileLogger.error(`JSON文件不存在或不是有效文件: ${filePath}`);
    return null;
  } catch (error) {
    fileLogger.error(`读取JSON文件失败: ${filePath}`, error);
    return null;
  }
}

/**
 * 写入JSON文件
 * @param filePath JSON文件路径
 * @param data 要写入的JSON数据
 * @param pretty 是否格式化JSON，默认为true
 * @returns 操作是否成功
 */
export function writeJSON<T = unknown>(filePath: string, data: T, pretty = true): boolean {
  try {
    // 确保目录存在
    const dirPath = path.dirname(filePath);
    ensureDir(dirPath);

    // 写入JSON文件
    fs.writeJSONSync(filePath, data, { spaces: pretty ? 2 : 0 });
    return true;
  } catch (error) {
    fileLogger.error(`写入JSON文件失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 复制文件
 * @param src 源文件路径
 * @param dest 目标文件路径
 * @param overwrite 是否覆盖目标文件，默认为true
 * @returns 操作是否成功
 */
export function copyFile(src: string, dest: string, overwrite = true): boolean {
  try {
    if (!fileExists(src) || !isFile(src)) {
      fileLogger.error(`源文件不存在或不是有效文件: ${src}`);
      return false;
    }

    // 确保目标目录存在
    const destDir = path.dirname(dest);
    ensureDir(destDir);

    // 复制文件
    fs.copySync(src, dest, { overwrite });
    return true;
  } catch (error) {
    fileLogger.error(`复制文件失败: ${src} -> ${dest}`, error);
    return false;
  }
}

/**
 * 使用glob模式查找文件
 * @param patterns glob模式或模式数组
 * @param options glob选项
 * @returns 匹配的文件路径数组
 */
export function findFiles(patterns: string | string[], options?: glob.Options): string[] {
  try {
    return glob.sync(patterns, {
      dot: false,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      ...options
    });
  } catch (error) {
    fileLogger.error(`查找文件失败: ${patterns}`, error);
    return [];
  }
}

/**
 * 检查文件路径是否匹配指定的glob模式
 * @param filePath 文件路径
 * @param patterns glob模式或模式数组
 * @returns 是否匹配
 */
export function matchGlob(filePath: string, patterns: string | string[]): boolean {
  try {
    return micromatch.isMatch(filePath, patterns);
  } catch (error) {
    fileLogger.error(`匹配glob模式失败: ${filePath}`, error);
    return false;
  }
}

/**
 * 判断文件是否应该被包含（基于include和exclude模式）
 * @param filePath 文件路径
 * @param include 包含模式数组
 * @param exclude 排除模式数组
 * @returns 是否应该包含
 */
export function shouldIncludeFile(filePath: string, include: string[], exclude: string[]): boolean {
  // 规范化路径，确保使用正斜杠
  const normalizedPath = filePath.replace(/\\/g, '/');

  // 首先检查排除模式
  if (exclude.length > 0 && matchGlob(normalizedPath, exclude)) {
    return false;
  }

  // 然后检查包含模式
  return include.length === 0 || matchGlob(normalizedPath, include);
}

/**
 * 获取相对于工作目录的路径
 * @param filePath 文件路径
 * @returns 相对路径
 */
export function getRelativePath(filePath: string): string {
  const cwd = process.cwd();
  return path.relative(cwd, filePath);
}

/**
 * 解析路径，支持绝对路径和相对路径
 * @param filePath 文件路径
 * @returns 绝对路径
 */
export function resolvePath(filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(process.cwd(), filePath);
} 