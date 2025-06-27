import * as parser from '@babel/parser';
import { Logger } from '../../utils/logger';

/**
 * 解析器日志记录器
 */
const parserLogger = Logger.create({ prefix: 'AST-PARSER' });

/**
 * 解析器选项接口
 */
export interface ParserOptions {
  /**
   * 是否为JSX文件
   */
  jsx?: boolean;

  /**
   * 是否为TypeScript文件
   */
  typescript?: boolean;

  /**
   * 是否启用调试模式
   */
  debug?: boolean;
}

/**
 * 根据文件扩展名推断解析器选项
 * @param filePath 文件路径
 * @returns 解析器选项
 */
export function inferParserOptions(filePath: string): ParserOptions {
  const ext = filePath.toLowerCase().split('.').pop() || '';

  return {
    jsx: ext === 'jsx' || ext === 'tsx',
    typescript: ext === 'ts' || ext === 'tsx'
  };
}

/**
 * 将代码解析为AST
 * @param code 源代码
 * @param options 解析器选项
 * @returns 解析后的AST
 */
export function parseCode(code: string, options: ParserOptions = {}): parser.ParseResult<any> {
  try {
    const { jsx = false, typescript = false, debug = false } = options;

    // 构建解析器插件列表
    const plugins: parser.ParserPlugin[] = [];

    if (jsx) {
      plugins.push('jsx');
    }

    if (typescript) {
      plugins.push('typescript');
      // TypeScript装饰器支持
      plugins.push('decorators-legacy');
      // TypeScript类属性支持
      plugins.push('classProperties');
    }

    // 确保支持动态导入
    plugins.push('dynamicImport');

    // 确保支持可选链和空值合并
    plugins.push('optionalChaining');
    plugins.push('nullishCoalescingOperator');

    if (debug) {
      parserLogger.debug(`解析代码，启用插件: ${plugins.join(', ')}`);
    }

    // 解析代码
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins
    });

    if (debug) {
      parserLogger.debug('代码解析成功');
    }

    return ast;
  } catch (error) {
    parserLogger.error(`代码解析失败: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 将代码解析为表达式
 * @param code 源代码
 * @param options 解析器选项
 * @returns 解析后的表达式AST
 */
export function parseExpression(code: string, options: ParserOptions = {}): any {
  try {
    const { jsx = false, typescript = false, debug = false } = options;

    // 构建解析器插件列表
    const plugins: parser.ParserPlugin[] = [];

    if (jsx) {
      plugins.push('jsx');
    }

    if (typescript) {
      plugins.push('typescript');
    }

    if (debug) {
      parserLogger.debug(`解析表达式，启用插件: ${plugins.join(', ')}`);
    }

    // 解析表达式
    const ast = parser.parseExpression(code, {
      plugins
    });

    if (debug) {
      parserLogger.debug('表达式解析成功');
    }

    return ast;
  } catch (error) {
    parserLogger.error(`表达式解析失败: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 