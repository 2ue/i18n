import fs from 'fs-extra';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { Logger } from '../../utils/logger';
import { parseCode, inferParserOptions } from './parser';
import { createVisitor, StringNode } from './visitor';
import { transformAST, TransformerOptions, TransformResult } from './transformer';
import { importManager } from '../import-manager';

/**
 * AST处理器日志记录器
 */
const astLogger = Logger.create({ prefix: 'AST-PROCESSOR' });

/**
 * AST处理器选项接口
 */
export interface ASTProcessorOptions {
  /**
   * 是否启用调试模式
   */
  debug?: boolean;

  /**
   * 是否执行替换操作，默认为true
   * 如果为false，则只提取不替换
   */
  replace?: boolean;

  /**
   * 是否自动添加导入语句，默认为false
   */
  autoImport?: boolean;
}

/**
 * 处理文件结果接口
 */
export interface ProcessFileResult extends TransformResult {
  /**
   * 文件路径
   */
  filePath: string;

  /**
   * 是否成功处理
   */
  success: boolean;
}

/**
 * AST处理器类
 * 负责解析代码文件，遍历AST寻找中文字符串，并执行替换操作
 */
export class ASTProcessor {
  private debug: boolean;
  private replace: boolean;
  private autoImport: boolean;

  /**
   * 构造函数
   * @param options 处理器选项
   */
  constructor(options: ASTProcessorOptions = {}) {
    this.debug = options.debug || false;
    this.replace = options.replace !== undefined ? options.replace : true;
    this.autoImport = options.autoImport || false;

    astLogger.debug('ASTProcessor初始化完成');
  }

  /**
   * 处理代码文件
   * @param filePath 文件路径
   * @returns 处理结果
   */
  public processFile(filePath: string): ProcessFileResult {
    try {
      // 读取文件内容
      const code = fs.readFileSync(filePath, 'utf-8');

      // 推断解析器选项
      const parserOptions = inferParserOptions(filePath);

      // 处理代码
      const result = this.processCode(code, {
        ...parserOptions,
        debug: this.debug,
        replace: this.replace,
        autoImport: this.autoImport
      });

      // 如果有中文文本被替换，则写入文件
      if (result.hasReplaced) {
        fs.writeFileSync(filePath, result.code, 'utf-8');

        // 如果启用了自动导入，则添加导入语句
        if (this.autoImport) {
          importManager.addImportToFile(filePath, '$t');
        }

        astLogger.debug(`文件处理完成: ${filePath}`);
      } else {
        astLogger.debug(`文件无需修改: ${filePath}`);
      }

      return {
        ...result,
        filePath,
        success: true
      };
    } catch (error) {
      astLogger.error(`处理文件失败: ${filePath}, ${error instanceof Error ? error.message : String(error)}`);

      return {
        filePath,
        code: '',
        extractedTexts: [],
        hasExtracted: false,
        hasReplaced: false,
        success: false
      };
    }
  }

  /**
   * 处理代码
   * @param code 源代码
   * @param options 转换器选项
   * @returns 处理结果
   */
  public processCode(code: string, options: TransformerOptions = {}): TransformResult {
    try {
      // 解析代码为AST
      const ast = parseCode(code, options);

      // 收集中文字符串节点
      const stringNodes: StringNode[] = [];

      // 创建访问器
      const visitor = createVisitor((node) => {
        stringNodes.push(node);
      }, options);

      // 遍历AST
      traverse(ast, visitor);

      if (this.debug) {
        astLogger.debug(`找到${stringNodes.length}个中文字符串节点`);
      }

      // 转换AST
      const result = transformAST(ast, stringNodes, options);

      return result;
    } catch (error) {
      astLogger.error(`处理代码失败: ${error instanceof Error ? error.message : String(error)}`);

      return {
        code,
        extractedTexts: [],
        hasExtracted: false,
        hasReplaced: false
      };
    }
  }
}

/**
 * 创建AST处理器
 * @param options 处理器选项
 * @returns AST处理器实例
 */
export function createASTProcessor(options: ASTProcessorOptions = {}): ASTProcessor {
  return new ASTProcessor(options);
}

/**
 * 默认AST处理器实例
 */
export const astProcessor = createASTProcessor();

// 导出子模块
export * from './parser';
export * from './visitor';
export * from './transformer'; 