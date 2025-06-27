import { Logger } from '../../../utils/logger';
import { 
  BaseTranslationProvider, 
  TranslationOptions, 
  TranslationProviderConfig, 
  TranslationResult,
  TranslationProviderFactory,
  TranslationProviderRegistry
} from './index';
import * as baiduTranslate from 'baidu-translate-service';

/**
 * 百度翻译日志记录器
 */
const baiduLogger = Logger.create({ prefix: 'BAIDU-TRANSLATOR' });

/**
 * 百度翻译配置接口
 */
export interface BaiduTranslationConfig extends TranslationProviderConfig {
  /**
   * 百度翻译API应用ID
   */
  appid: string;
  
  /**
   * 百度翻译API密钥
   */
  key: string;
}

/**
 * 百度翻译提供者工厂
 */
export class BaiduTranslationProviderFactory implements TranslationProviderFactory {
  public readonly providerName = 'baidu';
  
  /**
   * 创建百度翻译提供者实例
   * @param config 提供者配置
   * @returns 百度翻译提供者实例
   */
  public create(config: TranslationProviderConfig): BaiduTranslationProvider {
    return new BaiduTranslationProvider(config as BaiduTranslationConfig);
  }
}

/**
 * 百度翻译提供者
 * 使用baidu-translate-service包实现百度翻译API调用
 */
export class BaiduTranslationProvider extends BaseTranslationProvider {
  /**
   * 构造函数
   * @param config 百度翻译配置
   */
  constructor(config: BaiduTranslationConfig) {
    super('baidu', config);
    baiduLogger.debug('百度翻译提供者初始化完成');
  }
  
  /**
   * 检查配置是否有效
   * @returns 是否有效
   */
  public isConfigValid(): boolean {
    const config = this.config as BaiduTranslationConfig;
    return Boolean(config.appid && config.key);
  }
  
  /**
   * 翻译单个文本
   * @param text 要翻译的文本
   * @param options 翻译选项
   * @returns 翻译结果
   */
  public async translate(text: string, options?: TranslationOptions): Promise<TranslationResult> {
    try {
      if (!this.isConfigValid()) {
        throw new Error('百度翻译配置无效，请检查appid和key');
      }
      
      const config = this.config as BaiduTranslationConfig;
      this.debug = options?.debug || false;
      
      const from = options?.from || config.defaultSourceLang;
      const to = options?.to || config.defaultTargetLang;
      
      if (this.debug) {
        baiduLogger.debug(`开始翻译: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" 从 ${from} 到 ${to}`);
      }
      
      // 使用baidu-translate-service包进行翻译
      const result = await baiduTranslate.default({
        q: text,
        from,
        to,
        appid: config.appid,
        key: config.key,
        ...(options?.providerOptions || {}) // 支持额外的提供者特定选项
      });
      
      if (result.error_code) {
        throw new Error(`百度翻译API错误: ${result.error_code} - ${result.error_msg}`);
      }
      
      if (!result.trans_result || result.trans_result.length === 0) {
        throw new Error('百度翻译API返回空结果');
      }
      
      const translationResult = result.trans_result[0];
      
      if (this.debug) {
        baiduLogger.debug(`翻译成功: "${text}" -> "${translationResult.dst}"`);
      }
      
      return this.createResult(text, translationResult.dst, from, to, {
        raw: result // 保存原始响应，以便需要时访问
      });
    } catch (error) {
      throw this.handleError(error, text, options);
    }
  }
  
  /**
   * 批量翻译文本
   * @param texts 要翻译的文本数组
   * @param options 翻译选项
   * @returns 翻译结果数组
   */
  public async batchTranslate(texts: string[], options?: TranslationOptions): Promise<TranslationResult[]> {
    // 百度翻译API不支持真正的批量翻译，这里我们将文本合并为一个请求
    // 使用特殊分隔符，然后在响应中拆分
    try {
      if (texts.length === 0) {
        return [];
      }
      
      if (texts.length === 1) {
        return [await this.translate(texts[0], options)];
      }
      
      // 使用\n分隔多个文本，这样在响应中可以按原顺序拆分
      const combinedText = texts.join('\n');
      const result = await this.translate(combinedText, options);
      
      // 拆分翻译结果
      const translatedTexts = result.target.split('\n');
      
      // 确保结果数量与输入一致
      if (translatedTexts.length !== texts.length) {
        throw new Error('翻译结果数量与输入不匹配');
      }
      
      // 为每个文本创建翻译结果
      return texts.map((text, index) => 
        this.createResult(
          text,
          translatedTexts[index],
          result.from,
          result.to
        )
      );
    } catch (error) {
      throw this.handleError(error, texts.join(', '), options);
    }
  }
  
  /**
   * 获取百度翻译支持的语言
   * @returns 支持的语言代码数组
   */
  public async getSupportedLanguages(): Promise<string[]> {
    // 百度翻译支持的语言列表
    // 参考: https://fanyi-api.baidu.com/doc/21
    return [
      'zh', 'en', 'yue', 'wyw', 'jp', 'kor', 'fra', 'spa', 'th', 'ara', 'ru', 'pt',
      'de', 'it', 'el', 'nl', 'pl', 'bul', 'est', 'dan', 'fin', 'cs', 'rom', 'slo',
      'swe', 'hu', 'cht', 'vie'
    ];
  }
}

// 注册百度翻译提供者工厂
TranslationProviderRegistry.getInstance().register(new BaiduTranslationProviderFactory()); 