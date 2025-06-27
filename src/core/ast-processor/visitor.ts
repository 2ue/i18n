import * as t from '@babel/types';
import { Logger } from '../../utils/logger';
import { ChineseMatcher, ChineseMatchMode } from '../../utils/chinese-matcher';

/**
 * 访问器日志记录器
 */
const visitorLogger = Logger.create({ prefix: 'AST-VISITOR' });

/**
 * 字符串节点类型
 */
export enum StringNodeType {
  // 字符串字面量
  STRING_LITERAL = 'StringLiteral',
  // 模板字面量
  TEMPLATE_LITERAL = 'TemplateLiteral',
  // JSX文本
  JSX_TEXT = 'JSXText',
  // JSX属性
  JSX_ATTRIBUTE = 'JSXAttribute'
}

/**
 * 字符串节点接口
 */
export interface StringNode {
  /**
   * 节点类型
   */
  type: StringNodeType;

  /**
   * 节点路径
   */
  path: any; // 实际上是NodePath类型，但为了避免引入@babel/traverse的依赖，这里使用any

  /**
   * 节点值
   */
  value: string;

  /**
   * 节点位置
   */
  loc?: t.SourceLocation | null;

  /**
   * 父节点类型
   */
  parentType?: string;
}

/**
 * 访问器选项接口
 */
export interface VisitorOptions {
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
   * 中文匹配模式
   */
  chineseMode?: ChineseMatchMode;

  /**
   * 是否排除注释中的中文
   */
  excludeComments?: boolean;
}

/**
 * 创建访问器配置
 * @param callback 回调函数，用于处理找到的中文字符串节点
 * @param options 访问器选项
 * @returns 访问器配置对象
 */
export function createVisitor(callback: (node: StringNode) => void, options: VisitorOptions = {}) {
  const {
    debug = false,
    chineseMode = ChineseMatchMode.CONTAINS_CHINESE,
    excludeComments = true
  } = options;

  // 创建中文匹配器
  const chineseMatcher = new ChineseMatcher({
    mode: chineseMode,
    excludeComments
  });

  // 用于记录已处理的节点，避免重复处理
  const processedNodes = new WeakSet();

  /**
   * 处理字符串字面量节点
   * @param path 节点路径
   */
  const handleStringLiteral = (path: any) => {
    const node = path.node;

    // 避免重复处理
    if (processedNodes.has(node)) {
      return;
    }

    processedNodes.add(node);

    // 获取字符串值
    const value = node.value;

    // 检查是否包含中文
    if (chineseMatcher.match(value)) {
      if (debug) {
        visitorLogger.debug(`找到中文字符串: "${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`);
      }

      // 调用回调函数
      callback({
        type: StringNodeType.STRING_LITERAL,
        path,
        value,
        loc: node.loc,
        parentType: path.parent?.type
      });
    }
  };

  /**
   * 处理模板字面量节点
   * @param path 节点路径
   */
  const handleTemplateLiteral = (path: any) => {
    const node = path.node;

    // 避免重复处理
    if (processedNodes.has(node)) {
      return;
    }

    processedNodes.add(node);

    // 处理模板字面量的quasis部分（静态文本）
    node.quasis.forEach((quasi: any) => {
      const value = quasi.value.raw;

      // 检查是否包含中文
      if (chineseMatcher.match(value)) {
        if (debug) {
          visitorLogger.debug(`找到模板字面量中的中文: "${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`);
        }

        // 调用回调函数
        callback({
          type: StringNodeType.TEMPLATE_LITERAL,
          path: { ...path, quasi },
          value,
          loc: quasi.loc,
          parentType: path.parent?.type
        });
      }
    });
  };

  /**
   * 处理JSX文本节点
   * @param path 节点路径
   */
  const handleJSXText = (path: any) => {
    const node = path.node;

    // 避免重复处理
    if (processedNodes.has(node)) {
      return;
    }

    processedNodes.add(node);

    // 获取文本值并去除前后空白
    const value = node.value.trim();

    // 检查是否包含中文
    if (value && chineseMatcher.match(value)) {
      if (debug) {
        visitorLogger.debug(`找到JSX文本中的中文: "${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`);
      }

      // 调用回调函数
      callback({
        type: StringNodeType.JSX_TEXT,
        path,
        value,
        loc: node.loc,
        parentType: path.parent?.type
      });
    }
  };

  /**
   * 处理JSX属性节点
   * @param path 节点路径
   */
  const handleJSXAttribute = (path: any) => {
    const node = path.node;

    // 避免重复处理
    if (processedNodes.has(node)) {
      return;
    }

    processedNodes.add(node);

    // 只处理字符串值的属性
    if (node.value && t.isStringLiteral(node.value)) {
      const value = node.value.value;

      // 检查是否包含中文
      if (chineseMatcher.match(value)) {
        if (debug) {
          visitorLogger.debug(`找到JSX属性中的中文: "${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`);
        }

        // 调用回调函数
        callback({
          type: StringNodeType.JSX_ATTRIBUTE,
          path,
          value,
          loc: node.loc,
          parentType: path.parent?.type
        });
      }
    }
  };

  // 返回访问器配置对象
  return {
    StringLiteral: handleStringLiteral,
    TemplateLiteral: handleTemplateLiteral,
    JSXText: handleJSXText,
    JSXAttribute: handleJSXAttribute
  };
} 