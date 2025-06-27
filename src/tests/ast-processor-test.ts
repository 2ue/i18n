import { describe, it, expect, beforeEach } from 'vitest';
import { ASTProcessor } from '../core/ast-processor';

describe('ASTProcessor', () => {
  let processor: ASTProcessor;

  beforeEach(() => {
    processor = new ASTProcessor({
      debug: true,
      replace: true,
      autoImport: false
    });
  });

  describe('processCode', () => {
    it('应该提取并替换普通字符串字面量', () => {
      const code = `
        const message = '你好世界';
        console.log(message);
      `;

      const result = processor.processCode(code);

      expect(result.hasExtracted).toBe(true);
      expect(result.extractedTexts.length).toBe(1);
      expect(result.extractedTexts[0].text).toBe('你好世界');
      expect(result.code).toContain('$t(');
    });

    it('应该提取并替换模板字符串', () => {
      const code = `
        const name = 'John';
        const greeting = \`你好，\${name}\`;
        console.log(greeting);
      `;

      const result = processor.processCode(code);

      expect(result.hasExtracted).toBe(true);
      expect(result.extractedTexts.length).toBeGreaterThan(0);
      expect(result.code).toContain('$t(');
    });

    it('应该提取并替换JSX文本', () => {
      const code = `
        function App() {
          return (
            <div>
              <h1>欢迎使用</h1>
              <p>这是一个示例</p>
            </div>
          );
        }
      `;

      const result = processor.processCode(code, { jsx: true });

      expect(result.hasExtracted).toBe(true);
      expect(result.extractedTexts.length).toBe(2);
      expect(result.code).toContain('{$t(');
    });

    it('应该提取并替换JSX属性', () => {
      const code = `
        function App() {
          return (
            <div>
              <input placeholder="请输入内容" />
              <button title="点击提交">提交</button>
            </div>
          );
        }
      `;

      const result = processor.processCode(code, { jsx: true });

      expect(result.hasExtracted).toBe(true);
      expect(result.extractedTexts.length).toBe(3);
      expect(result.code).toContain('{$t(');
    });

    it('应该处理复杂的嵌套场景', () => {
      const code = `
        const config = {
          title: '系统配置',
          messages: {
            welcome: '欢迎使用系统',
            error: '发生错误'
          }
        };
        
        function renderMessage(type) {
          return type === 'success' ? '操作成功' : '操作失败';
        }
      `;

      const result = processor.processCode(code);

      expect(result.hasExtracted).toBe(true);
      expect(result.extractedTexts.length).toBe(5);
      expect(result.code).toContain('$t(');
    });

    it('如果设置replace为false，则只提取不替换', () => {
      const extractOnlyProcessor = new ASTProcessor({
        debug: true,
        replace: false
      });

      const code = `
        const message = '你好世界';
        console.log(message);
      `;

      const result = extractOnlyProcessor.processCode(code);

      expect(result.hasExtracted).toBe(true);
      expect(result.hasReplaced).toBe(false);
      expect(result.extractedTexts.length).toBe(1);
      expect(result.code).toBe(code);
    });
  });
}); 