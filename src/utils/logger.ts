import chalk from 'chalk';
import { configManager } from '../config/manager';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  MINIMAL = 'minimal',
  NORMAL = 'normal',
  VERBOSE = 'verbose'
}

/**
 * 日志类型
 */
export enum LogType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

/**
 * 日志级别对应的类型可见性
 */
const LOG_LEVEL_VISIBILITY: Record<LogLevel, Record<LogType, boolean>> = {
  [LogLevel.MINIMAL]: {
    [LogType.INFO]: false,
    [LogType.SUCCESS]: true,
    [LogType.WARNING]: true,
    [LogType.ERROR]: true,
    [LogType.DEBUG]: false
  },
  [LogLevel.NORMAL]: {
    [LogType.INFO]: true,
    [LogType.SUCCESS]: true,
    [LogType.WARNING]: true,
    [LogType.ERROR]: true,
    [LogType.DEBUG]: false
  },
  [LogLevel.VERBOSE]: {
    [LogType.INFO]: true,
    [LogType.SUCCESS]: true,
    [LogType.WARNING]: true,
    [LogType.ERROR]: true,
    [LogType.DEBUG]: true
  }
};

/**
 * 日志类型对应的颜色
 */
const LOG_TYPE_COLORS: Record<LogType, (text: string) => string> = {
  [LogType.INFO]: chalk.blue,
  [LogType.SUCCESS]: chalk.green,
  [LogType.WARNING]: chalk.yellow,
  [LogType.ERROR]: chalk.red,
  [LogType.DEBUG]: chalk.magenta
};

/**
 * 日志类型对应的前缀
 */
const LOG_TYPE_PREFIX: Record<LogType, string> = {
  [LogType.INFO]: '[信息]',
  [LogType.SUCCESS]: '[成功]',
  [LogType.WARNING]: '[警告]',
  [LogType.ERROR]: '[错误]',
  [LogType.DEBUG]: '[调试]'
};

/**
 * 创建日志记录器选项
 */
export interface LoggerOptions {
  /**
   * 日志前缀
   */
  prefix?: string;
}

/**
 * 日志记录器类
 */
export class Logger {
  private static instance: Logger;
  private prefix: string = '';

  /**
   * 构造函数
   * @param options 日志选项
   */
  constructor(options?: LoggerOptions) {
    if (options?.prefix) {
      this.prefix = options.prefix;
    }
  }

  /**
   * 获取单例实例
   * @returns 日志记录器实例
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 创建一个新的日志记录器
   * @param options 日志选项
   * @returns 新的日志记录器实例
   */
  public static create(options: LoggerOptions): Logger {
    return new Logger(options);
  }

  /**
   * 检查是否应该记录指定类型的日志
   * @param type 日志类型
   * @returns 是否应该记录
   */
  private shouldLog(type: LogType): boolean {
    try {
      const config = configManager.getOrDefault();

      // 如果日志功能被禁用，则不记录任何日志
      if (!config.logging.enabled) {
        return false;
      }

      const currentLevel = config.logging.level as LogLevel;
      return LOG_LEVEL_VISIBILITY[currentLevel][type] || false;
    } catch (error) {
      // 如果获取配置失败，默认启用所有关键日志（错误和警告）
      return type === LogType.ERROR || type === LogType.WARNING;
    }
  }

  /**
   * 获取格式化的时间戳
   * @returns 格式化的时间戳
   */
  private getTimestamp(): string {
    const now = new Date();
    return `${now.toLocaleTimeString()}`;
  }

  /**
   * 记录日志
   * @param type 日志类型
   * @param message 日志消息
   * @param args 其他参数
   */
  private log(type: LogType, message: string, ...args: any[]): void {
    // 检查是否应该记录此类型的日志
    if (!this.shouldLog(type)) {
      return;
    }

    // 获取对应的控制台方法
    const consoleMethod = type === LogType.ERROR ? console.error :
      type === LogType.WARNING ? console.warn :
        console.log;

    // 格式化日志前缀
    let prefix = LOG_TYPE_COLORS[type](`${LOG_TYPE_PREFIX[type]} [${this.getTimestamp()}]`);

    // 添加自定义前缀（如果有）
    if (this.prefix) {
      prefix = `${prefix} ${chalk.cyan(`[${this.prefix}]`)}`;
    }

    // 输出日志
    consoleMethod(`${prefix} ${message}`, ...args);
  }

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param args 其他参数
   */
  info(message: string, ...args: any[]): void {
    this.log(LogType.INFO, message, ...args);
  }

  /**
   * 记录成功日志
   * @param message 日志消息
   * @param args 其他参数
   */
  success(message: string, ...args: any[]): void {
    this.log(LogType.SUCCESS, message, ...args);
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param args 其他参数
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogType.WARNING, message, ...args);
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param args 其他参数
   */
  error(message: string, ...args: any[]): void {
    this.log(LogType.ERROR, message, ...args);
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param args 其他参数
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogType.DEBUG, message, ...args);
  }
}

// 导出默认日志实例
export const logger = Logger.getInstance();

// 导出简化的日志方法
export const { info, success, warn, error, debug } = logger; 