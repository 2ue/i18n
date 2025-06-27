import { Logger } from '../../utils/logger';
import { TranslationProvider, TranslationOptions, TranslationResult } from './providers';

/**
 * 翻译队列日志记录器
 */
const queueLogger = Logger.create({ prefix: 'TRANSLATION-QUEUE' });

/**
 * 翻译任务接口
 */
export interface TranslationTask {
  /**
   * 任务ID
   */
  id: string;

  /**
   * 要翻译的文本
   */
  text: string;

  /**
   * 翻译选项
   */
  options?: TranslationOptions;

  /**
   * 解析函数
   */
  resolve: (result: TranslationResult) => void;

  /**
   * 拒绝函数
   */
  reject: (error: any) => void;

  /**
   * 重试次数
   */
  retries: number;
}

/**
 * 翻译队列配置接口
 */
export interface TranslationQueueConfig {
  /**
   * 并发数量
   */
  concurrency: number;

  /**
   * 重试次数
   */
  retryTimes: number;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay: number;

  /**
   * 批次延迟（毫秒）
   */
  batchDelay: number;

  /**
   * 是否启用调试模式
   */
  debug?: boolean;
}

/**
 * 翻译队列管理器
 */
export class TranslationQueue {
  private provider: TranslationProvider;
  private config: TranslationQueueConfig;
  private queue: TranslationTask[] = [];
  private processing: boolean = false;
  private activeCount: number = 0;
  private debug: boolean;

  /**
   * 构造函数
   * @param provider 翻译提供者
   * @param config 队列配置
   */
  constructor(provider: TranslationProvider, config: TranslationQueueConfig) {
    this.provider = provider;
    this.config = config;
    this.debug = config.debug || false;

    queueLogger.debug(`翻译队列初始化完成，使用提供者: ${provider.name}，并发数: ${config.concurrency}`);
  }

  /**
   * 添加翻译任务
   * @param text 要翻译的文本
   * @param options 翻译选项
   * @returns 翻译结果Promise
   */
  public async addTask(text: string, options?: TranslationOptions): Promise<TranslationResult> {
    return new Promise<TranslationResult>((resolve, reject) => {
      // 创建任务
      const task: TranslationTask = {
        id: this.generateTaskId(),
        text,
        options,
        resolve,
        reject,
        retries: 0
      };

      // 添加到队列
      this.queue.push(task);

      if (this.debug) {
        queueLogger.debug(`添加翻译任务: ${task.id}, 文本: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);
      }

      // 启动处理
      this.processQueue();
    });
  }

  /**
   * 批量添加翻译任务
   * @param texts 要翻译的文本数组
   * @param options 翻译选项
   * @returns 翻译结果Promise数组
   */
  public async addBatchTasks(texts: string[], options?: TranslationOptions): Promise<TranslationResult[]> {
    // 创建任务Promise数组
    const promises = texts.map(text => this.addTask(text, options));

    // 等待所有任务完成
    return Promise.all(promises);
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    // 如果已经在处理或队列为空，则返回
    if (this.processing || this.queue.length === 0) {
      return;
    }

    // 标记为处理中
    this.processing = true;

    try {
      // 处理队列中的任务
      while (this.queue.length > 0 && this.activeCount < this.config.concurrency) {
        // 取出任务
        const task = this.queue.shift();
        if (!task) continue;

        // 增加活动计数
        this.activeCount++;

        // 处理任务
        this.processTask(task)
          .catch(error => {
            queueLogger.error(`处理任务失败: ${error instanceof Error ? error.message : String(error)}`);
          })
          .finally(() => {
            // 减少活动计数
            this.activeCount--;

            // 继续处理队列
            if (this.queue.length > 0) {
              // 如果配置了批次延迟，则延迟处理
              if (this.config.batchDelay > 0) {
                setTimeout(() => this.processQueue(), this.config.batchDelay);
              } else {
                this.processQueue();
              }
            } else {
              // 队列为空，标记为未处理
              this.processing = false;
            }
          });
      }
    } catch (error) {
      queueLogger.error(`处理队列失败: ${error instanceof Error ? error.message : String(error)}`);
      this.processing = false;
    }
  }

  /**
   * 处理任务
   * @param task 翻译任务
   */
  private async processTask(task: TranslationTask): Promise<void> {
    try {
      if (this.debug) {
        queueLogger.debug(`处理任务: ${task.id}, 重试次数: ${task.retries}`);
      }

      // 调用翻译提供者
      const result = await this.provider.translate(task.text, task.options);

      // 解析任务
      task.resolve(result);

      if (this.debug) {
        queueLogger.debug(`任务完成: ${task.id}`);
      }
    } catch (error) {
      // 检查是否可以重试
      if (task.retries < this.config.retryTimes) {
        // 增加重试次数
        task.retries++;

        if (this.debug) {
          queueLogger.debug(`任务失败，准备重试: ${task.id}, 重试次数: ${task.retries}/${this.config.retryTimes}`);
        }

        // 延迟重试
        setTimeout(() => {
          // 重新加入队列
          this.queue.push(task);

          // 继续处理队列
          if (!this.processing) {
            this.processQueue();
          }
        }, this.config.retryDelay);
      } else {
        // 超过重试次数，拒绝任务
        queueLogger.error(`任务失败，超过最大重试次数: ${task.id}`);
        task.reject(error);
      }
    }
  }

  /**
   * 生成任务ID
   * @returns 任务ID
   */
  private generateTaskId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  /**
   * 获取队列长度
   * @returns 队列长度
   */
  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * 获取活动任务数
   * @returns 活动任务数
   */
  public getActiveCount(): number {
    return this.activeCount;
  }

  /**
   * 清空队列
   */
  public clearQueue(): void {
    const count = this.queue.length;
    this.queue = [];
    queueLogger.debug(`清空队列，共${count}个任务被移除`);
  }
} 