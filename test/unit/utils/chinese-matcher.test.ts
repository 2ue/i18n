/**
 * 中文匹配器测试
 */
import { isAllChinese, containsChinese, ChineseMatcher, ChineseMatchMode } from '../../../src/utils/chinese-matcher';

describe('中文匹配器', () => {
  describe('isAllChinese', () => {
    it('应该识别纯中文文本', () => {
      expect(isAllChinese('你好世界')).toBe(true);
      expect(isAllChinese('测试用例')).toBe(true);
    });

    it('应该识别包含标点符号的中文文本', () => {
      expect(isAllChinese('你好，世界！')).toBe(true);
      expect(isAllChinese('测试：用例。')).toBe(true);
    });

    it('应该拒绝包含非中文字符的文本', () => {
      expect(isAllChinese('你好world')).toBe(false);
      expect(isAllChinese('测试123')).toBe(false);
      expect(isAllChinese('Hello世界')).toBe(false);
    });

    it('应该拒绝空字符串', () => {
      expect(isAllChinese('')).toBe(false);
    });
  });

  describe('containsChinese', () => {
    it('应该识别包含中文的文本', () => {
      expect(containsChinese('你好world')).toBe(true);
      expect(containsChinese('Hello世界')).toBe(true);
      expect(containsChinese('测试123')).toBe(true);
    });

    it('应该拒绝不包含中文的文本', () => {
      expect(containsChinese('Hello world')).toBe(false);
      expect(containsChinese('123')).toBe(false);
      expect(containsChinese('')).toBe(false);
    });
  });

  describe('ChineseMatcher', () => {
    it('默认应该使用包含中文匹配模式', () => {
      const matcher = new ChineseMatcher();
      expect(matcher.getMode()).toBe(ChineseMatchMode.CONTAINS_CHINESE);
      expect(matcher.match('你好world')).toBe(true);
      expect(matcher.match('Hello world')).toBe(false);
    });

    it('应该支持全中文匹配模式', () => {
      const matcher = new ChineseMatcher({
        mode: ChineseMatchMode.ALL_CHINESE
      });
      expect(matcher.match('你好世界')).toBe(true);
      expect(matcher.match('你好world')).toBe(false);
    });

    it('应该能够提取中文片段', () => {
      const matcher = new ChineseMatcher();
      const segments = matcher.extractChineseSegments('你好world和测试');
      expect(segments).toEqual(['你好world和测试']);
    });
  });
}); 