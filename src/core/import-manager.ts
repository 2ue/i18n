import fs from 'fs-extra';
import * as parser from '@babel/parser';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { Logger } from '../utils/logger';
import { configManager } from '../config';
import { AutoImportConfig } from '../config';

/**
 * 导入管理器日志记录器
 */
const importLogger = Logger.create({ prefix: 'IMPORT-MANAGER' });

/**
 * 导入位置枚举
 */
export enum ImportInsertPosition {
  AFTER_IMPORTS = 'afterImports',
  BEFORE_IMPORTS = 'beforeImports',
  TOP_OF_FILE = 'topOfFile'
}

/**
 * 导入管理器选项接口
 */
export interface ImportManagerOptions {
  /**
   * 配置对象，如果不提供则使用全局配置
   */
  config?: Partial<AutoImportConfig>;

  /**
   * 是否启用调试模式
   */
  debug?: boolean;
}

/**
 * 导入管理器类
 * 负责处理国际化函数导入语句的自动添加
 */
export class ImportManager {
  private config: AutoImportConfig;
  private debug: boolean;

  /**
   * 构造函数
   * @param options 选项
   */
  constructor(options: ImportManagerOptions = {}) {
    this.debug = options.debug || false;

    // 获取全局配置
    const globalConfig = configManager.getOrDefault();
    const globalAutoImportConfig = globalConfig.replacement.autoImport;

    // 使用提供的配置或全局配置
    // 严格遵循AutoImportConfig结构
    this.config = {
      enabled: options.config?.enabled !== undefined ? options.config.enabled : globalConfig.replacement.autoImport.enabled,
      insertPosition: options.config?.insertPosition || globalConfig.replacement.autoImport.insertPosition,
      imports: options.config?.imports || globalConfig.replacement.autoImport.imports
    };

    importLogger.debug('ImportManager初始化完成');
  }

  /**
   * 检查文件是否已包含指定的导入语句
   * @param code 源代码
   * @param importName 导入名称
   * @returns 是否已包含导入
   */
  public hasImport(code: string, importName: string): boolean {
    try {
      // 解析代码为AST
      const ast = this.parseCode(code);

      // 检查导入语句
      const hasImport = ast.program.body.some(node => {
        // 检查导入声明
        if (t.isImportDeclaration(node)) {
          // 检查默认导入
          if (node.specifiers.some(specifier =>
            t.isImportDefaultSpecifier(specifier) &&
            specifier.local.name === importName
          )) {
            return true;
          }

          // 检查命名导入
          if (node.specifiers.some(specifier =>
            t.isImportSpecifier(specifier) &&
            specifier.local.name === importName
          )) {
            return true;
          }
        }

        // 检查变量声明（如 const i18n = require('i18n')）
        if (t.isVariableDeclaration(node)) {
          return node.declarations.some(declaration => {
            if (t.isVariableDeclarator(declaration) &&
              t.isIdentifier(declaration.id) &&
              declaration.id.name === importName) {
              return true;
            }
            return false;
          });
        }

        return false;
      });

      if (this.debug) {
        importLogger.debug(`检查导入 ${importName}: ${hasImport ? '已存在' : '不存在'}`);
      }

      return hasImport;
    } catch (error) {
      importLogger.error(`检查导入失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 添加导入语句到代码
   * @param code 源代码
   * @param importName 导入名称
   * @returns 添加导入后的代码
   */
  public addImport(code: string, importName: string): string {
    if (!this.config.enabled) {
      importLogger.debug('自动导入已禁用，跳过添加导入');
      return code;
    }

    // 如果已经包含导入，则不需要添加
    if (this.hasImport(code, importName)) {
      return code;
    }

    try {
      // 获取导入配置
      const importConfig = this.config.imports[importName];
      if (!importConfig) {
        importLogger.warn(`未找到导入配置: ${importName}`);
        return code;
      }

      // 解析代码为AST
      const ast = this.parseCode(code);

      // 创建导入语句
      const importStatement = importConfig.importStatement;
      const importAst = this.parseCode(importStatement);
      const importNode = importAst.program.body[0];

      // 确定插入位置
      const position = this.determineInsertPosition(ast);

      // 插入导入语句
      ast.program.body.splice(position, 0, importNode);

      // 生成代码
      const result = generate(ast, {
        retainLines: true,
        retainFunctionParens: true,
        compact: false
      });

      importLogger.debug(`已添加导入: ${importName}`);

      return result.code;
    } catch (error) {
      importLogger.error(`添加导入失败: ${error instanceof Error ? error.message : String(error)}`);
      return code;
    }
  }

  /**
   * 解析代码为AST
   * @param code 源代码
   * @returns AST
   */
  private parseCode(code: string) {
    return parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties'
      ]
    });
  }

  /**
   * 确定导入语句的插入位置
   * @param ast AST
   * @returns 插入位置索引
   */
  private determineInsertPosition(ast: parser.ParseResult<t.File>): number {
    const { insertPosition } = this.config;
    const { body } = ast.program;

    // 如果是空文件或指定在文件顶部，则返回0
    if (body.length === 0 || insertPosition === ImportInsertPosition.TOP_OF_FILE) {
      return 0;
    }

    // 如果指定在导入语句之前
    if (insertPosition === ImportInsertPosition.BEFORE_IMPORTS) {
      // 找到第一个导入语句的位置
      for (let i = 0; i < body.length; i++) {
        if (t.isImportDeclaration(body[i])) {
          return i;
        }
      }
      // 如果没有导入语句，则返回0
      return 0;
    }

    // 如果指定在导入语句之后
    if (insertPosition === ImportInsertPosition.AFTER_IMPORTS) {
      // 找到最后一个导入语句的位置
      let lastImportIndex = -1;
      for (let i = 0; i < body.length; i++) {
        if (t.isImportDeclaration(body[i])) {
          lastImportIndex = i;
        }
      }
      // 如果有导入语句，则返回其后的位置，否则返回0
      return lastImportIndex >= 0 ? lastImportIndex + 1 : 0;
    }

    // 默认返回文件顶部
    return 0;
  }

  /**
   * 添加导入语句到文件
   * @param filePath 文件路径
   * @param importName 导入名称
   * @returns 是否成功添加
   */
  public addImportToFile(filePath: string, importName: string): boolean {
    try {
      // 读取文件内容
      const code = fs.readFileSync(filePath, 'utf-8');

      // 添加导入语句
      const newCode = this.addImport(code, importName);

      // 如果代码没有变化，则不需要写入
      if (newCode === code) {
        return false;
      }

      // 写入文件
      fs.writeFileSync(filePath, newCode, 'utf-8');

      importLogger.debug(`已添加导入到文件: ${filePath}`);

      return true;
    } catch (error) {
      importLogger.error(`添加导入到文件失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 获取当前配置
   * @returns 自动导入配置
   */
  public getConfig(): AutoImportConfig {
    return { ...this.config };
  }
}

/**
 * 创建导入管理器
 * @param options 选项
 * @returns 导入管理器实例
 */
export function createImportManager(options: ImportManagerOptions = {}): ImportManager {
  return new ImportManager(options);
}

/**
 * 默认导入管理器实例
 */
export const importManager = createImportManager(); 