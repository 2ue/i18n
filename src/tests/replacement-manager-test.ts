import { describe, it, expect, beforeEach } from 'vitest';
import { ReplacementManager, QuoteType, ParamsObject } from '../core/replacement-manager';

describe('ReplacementManager', () => {
  let replacer: ReplacementManager;

  beforeEach(() => {
    // 创建一个默认的替换管理器实例
    replacer = new ReplacementManager({
      config: {
        functionName: '$t'
      },
      defaultQuoteType: QuoteType.SINGLE
    });
  });

  describe('基本替换功能', () => {
    it('应该正确替换普通字符串', () => {
      const result = replacer.replace('你好世界', 'ni_hao_shi_jie');
      expect(result).toBe("$t('ni_hao_shi_jie')");
    });

    it('应该使用指定的引号类型', () => {
      const result = replacer.replace('你好世界', 'ni_hao_shi_jie', QuoteType.DOUBLE);
      expect(result).toBe('$t("ni_hao_shi_jie")');
    });

    it('应该正确替换带参数的字符串', () => {
      const params: ParamsObject = { name: '张三', age: 25 };
      const result = replacer.replaceWithParams('你好，{name}，你今年{age}岁了', 'greeting', params);
      expect(result).toBe("$t('greeting', {name: '张三', age: 25})");
    });
  });

  describe('JSX替换功能', () => {
    it('应该正确替换JSX文本', () => {
      const result = replacer.replaceJSX('提交', 'submit');
      expect(result).toBe("{$t('submit')}");
    });

    it('应该正确替换带参数的JSX文本', () => {
      const params: ParamsObject = { count: 5 };
      const result = replacer.replaceJSXWithParams('已选择{count}项', 'selected_items', params);
      expect(result).toBe("{$t('selected_items', {count: 5})}");
    });
  });

  describe('模板字符串替换功能', () => {
    it('应该正确替换模板字符串', () => {
      const result = replacer.replaceTemplate('欢迎', 'welcome');
      expect(result).toBe("${$t('welcome')}");
    });

    it('应该正确替换带参数的模板字符串', () => {
      const params: ParamsObject = { user: '用户' };
      const result = replacer.replaceTemplateWithParams('欢迎{user}', 'welcome_user', params);
      expect(result).toBe("${$t('welcome_user', {user: '用户'})}");
    });
  });

  describe('引号处理功能', () => {
    it('应该正确检测引号类型', () => {
      expect(replacer.detectQuoteType("'文本'")).toBe(QuoteType.SINGLE);
      expect(replacer.detectQuoteType('"文本"')).toBe(QuoteType.DOUBLE);
      expect(replacer.detectQuoteType('`文本`')).toBe(QuoteType.BACKTICK);
      expect(replacer.detectQuoteType('文本')).toBe(QuoteType.SINGLE); // 默认值
    });

    it('应该正确处理引号转义', () => {
      expect(replacer.getQuotedString("it's")).toBe("'it\\'s'");
      expect(replacer.getQuotedString('say "hello"', QuoteType.DOUBLE)).toBe('"say \\"hello\\""');
      expect(replacer.getQuotedString('use `code`', QuoteType.BACKTICK)).toBe('`use \\`code\\``');
    });
  });

  describe('参数处理功能', () => {
    it('应该正确处理不同类型的参数', () => {
      const params: ParamsObject = {
        name: '张三',
        age: 25,
        isVIP: true,
        score: 0
      };
      const result = replacer.replaceWithParams('用户信息', 'user_info', params);
      expect(result).toBe("$t('user_info', {name: '张三', age: 25, isVIP: true, score: 0})");
    });
  });

  describe('配置功能', () => {
    it('应该使用自定义函数名', () => {
      const customReplacer = new ReplacementManager({
        config: {
          functionName: 'i18n.t'
        }
      });
      const result = customReplacer.replace('你好', 'hello');
      expect(result).toBe("i18n.t('hello')");
    });
  });

  describe('复杂场景测试', () => {
    it('应该处理包含特殊字符的文本', () => {
      const text = '包含"引号"和\'单引号\'和换行符\n的文本';
      const result = replacer.replace(text, 'special_text');
      expect(result).toBe("$t('special_text')");
    });

    it('应该处理JSX中的嵌套表达式', () => {
      const params: ParamsObject = { count: 5 };
      const result = replacer.replaceJSXWithParams('已选择{count}项，点击"确定"继续', 'confirm_selection', params);
      expect(result).toBe("{$t('confirm_selection', {count: 5})}");
    });
  });
}); 