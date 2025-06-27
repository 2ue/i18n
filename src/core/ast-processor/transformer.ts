import * as t from '@babel/types';
import generate from '@babel/generator';
import { Logger } from '../../utils/logger';
import { StringNode, StringNodeType } from './visitor';
import { keyValueManager } from '../key-value-manager';
import { replacementManager, QuoteType } from '../replacement-manager';

/**
 * 转换器日志记录器
 */
const transformerLogger = Logger.create({ prefix: 'AST-TRANSFORMER' });

/**
 * 转换器选项接口
 */
export interface TransformerOptions {
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
 * 转换结果接口
 */
export interface TransformResult {
  /**
   * 转换后的代码
   */
  code: string;

  /**
   * 提取的中文文本和对应的键
   */
  extractedTexts: Array<{
    text: string;
    key: string;
  }>;

  /**
   * 是否有中文文本被提取
   */
  hasExtracted: boolean;

  /**
   * 是否有中文文本被替换
   */
  hasReplaced: boolean;
}

/**
 * 转换AST
 * @param ast AST
 * @param stringNodes 字符串节点列表
 * @param options 转换器选项
 * @returns 转换结果
 */
export function transformAST(ast: any, stringNodes: StringNode[], options: TransformerOptions = {}): TransformResult {
  const { debug = false, replace = true, jsx = false } = options;

  const extractedTexts: Array<{ text: string; key: string }> = [];
  let hasReplaced = false;

  // 处理每个字符串节点
  for (const stringNode of stringNodes) {
    try {
      // 提取中文文本
      const text = stringNode.value;

      // 生成或获取对应的key
      const key = keyValueManager.getKeyByValue(text) || keyValueManager.add(text);

      // 记录提取的文本和key
      extractedTexts.push({ text, key });

      if (debug) {
        transformerLogger.debug(`提取文本: "${text}" -> "${key}"`);
      }

      // 如果不需要替换，则跳过
      if (!replace) {
        continue;
      }

      // 替换节点
      if (replaceNode(stringNode, key, jsx)) {
        hasReplaced = true;
        if (debug) {
          transformerLogger.debug(`替换节点成功: "${text}" -> "${key}"`);
        }
      }
    } catch (error) {
      transformerLogger.error(`处理节点失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 生成代码
  const result = generate(ast, {
    retainLines: true,
    retainFunctionParens: true,
    compact: false
  });

  return {
    code: result.code,
    extractedTexts,
    hasExtracted: extractedTexts.length > 0,
    hasReplaced
  };
}

/**
 * 替换节点
 * @param stringNode 字符串节点
 * @param key 国际化键名
 * @param isJSX 是否为JSX文件
 * @returns 是否成功替换
 */
function replaceNode(stringNode: StringNode, key: string, isJSX: boolean): boolean {
  try {
    const { type, path } = stringNode;

    // 根据节点类型进行不同的替换
    switch (type) {
      case StringNodeType.STRING_LITERAL:
        return replaceStringLiteral(path, key);

      case StringNodeType.TEMPLATE_LITERAL:
        return replaceTemplateLiteral(path, key);

      case StringNodeType.JSX_TEXT:
        return replaceJSXText(path, key);

      case StringNodeType.JSX_ATTRIBUTE:
        return replaceJSXAttribute(path, key);

      default:
        transformerLogger.warn(`不支持的节点类型: ${type}`);
        return false;
    }
  } catch (error) {
    transformerLogger.error(`替换节点失败: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * 替换字符串字面量节点
 * @param path 节点路径
 * @param key 国际化键名
 * @returns 是否成功替换
 */
function replaceStringLiteral(path: any, key: string): boolean {
  try {
    const node = path.node;
    const quoteType = node.extra?.raw?.startsWith('"') ? QuoteType.DOUBLE : QuoteType.SINGLE;

    // 检查父节点类型，判断是否在JSX表达式容器中
    if (path.parent && t.isJSXExpressionContainer(path.parent)) {
      // 在JSX表达式容器中，不需要额外的花括号
      const replacement = replacementManager.replace(node.value, key, quoteType);
      const replacementAst = parseExpression(replacement);
      path.replaceWith(replacementAst);
    } else {
      // 普通字符串字面量
      const replacement = replacementManager.replace(node.value, key, quoteType);
      const replacementAst = parseExpression(replacement);
      path.replaceWith(replacementAst);
    }

    return true;
  } catch (error) {
    transformerLogger.error(`替换字符串字面量失败: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * 替换模板字面量节点
 * @param path 节点路径
 * @param key 国际化键名
 * @returns 是否成功替换
 */
function replaceTemplateLiteral(path: any, key: string): boolean {
  try {
    const { quasi } = path;

    if (!quasi) {
      // 处理整个模板字面量
      const node = path.node;

      // 如果模板字面量只有一个quasis且没有表达式，可以直接替换为字符串字面量
      if (node.quasis.length === 1 && node.expressions.length === 0) {
        const value = node.quasis[0].value.raw;
        const replacement = replacementManager.replace(value, key, QuoteType.BACKTICK);
        const replacementAst = parseExpression(replacement);
        path.replaceWith(replacementAst);
        return true;
      }

      // 否则需要处理复杂的模板字面量，这里简化处理
      transformerLogger.warn('复杂模板字面量替换暂不支持');
      return false;
    } else {
      // 处理模板字面量中的特定quasi
      const quasiNode = quasi;
      const value = quasiNode.value.raw;
      const replacement = replacementManager.replaceTemplate(value, key);

      // 创建一个新的模板元素
      const newQuasi = t.templateElement(
        { raw: replacement, cooked: replacement },
        quasiNode.tail
      );

      // 替换原来的quasi
      const index = path.node.quasis.indexOf(quasiNode);
      if (index !== -1) {
        path.node.quasis[index] = newQuasi;
      }

      return true;
    }
  } catch (error) {
    transformerLogger.error(`替换模板字面量失败: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * 替换JSX文本节点
 * @param path 节点路径
 * @param key 国际化键名
 * @returns 是否成功替换
 */
function replaceJSXText(path: any, key: string): boolean {
  try {
    const node = path.node;
    const value = node.value.trim();

    // 如果文本为空或只包含空白字符，则不替换
    if (!value) {
      return false;
    }

    // 创建JSX表达式容器
    const replacement = replacementManager.replaceJSX(value, key);
    const jsxExpressionContainer = parseJSXExpression(replacement);

    // 替换原节点
    path.replaceWith(jsxExpressionContainer);

    return true;
  } catch (error) {
    transformerLogger.error(`替换JSX文本失败: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * 替换JSX属性节点
 * @param path 节点路径
 * @param key 国际化键名
 * @returns 是否成功替换
 */
function replaceJSXAttribute(path: any, key: string): boolean {
  try {
    const node = path.node;

    // 只处理字符串值的属性
    if (!node.value || !t.isStringLiteral(node.value)) {
      return false;
    }

    const value = node.value.value;
    const quoteType = node.value.extra?.raw?.startsWith('"') ? QuoteType.DOUBLE : QuoteType.SINGLE;

    // 创建JSX表达式容器
    const replacement = replacementManager.replace(value, key, quoteType);
    const jsxExpressionContainer = t.jsxExpressionContainer(
      parseExpression(replacement)
    );

    // 替换属性值
    node.value = jsxExpressionContainer;

    return true;
  } catch (error) {
    transformerLogger.error(`替换JSX属性失败: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * 解析表达式
 * @param code 表达式代码
 * @returns 表达式AST
 */
function parseExpression(code: string): any {
  // 这里简化处理，实际应该使用@babel/parser
  // 但为了避免循环依赖，这里直接返回一个简单的标识符
  return t.identifier(code);
}

/**
 * 解析JSX表达式
 * @param code JSX表达式代码
 * @returns JSX表达式AST
 */
function parseJSXExpression(code: string): any {
  // 这里简化处理，实际应该使用@babel/parser
  // 但为了避免循环依赖，这里直接返回一个简单的JSX表达式容器
  return t.jsxExpressionContainer(t.identifier(code.slice(1, -1)));
} 