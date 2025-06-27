import { describe, it, expect, beforeEach } from 'vitest';
import { ImportManager, ImportInsertPosition } from '../core/import-manager';

describe('ImportManager', () => {
  let importManager: ImportManager;

  beforeEach(() => {
    // 创建一个测试用的导入管理器实例
    importManager = new ImportManager({
      config: {
        enabled: true,
        insertPosition: ImportInsertPosition.AFTER_IMPORTS,
        imports: {
          '$t': {
            importStatement: "import { useTranslation } from 'react-i18next';"
          },
          'i18n': {
            importStatement: "import i18n from 'i18next';"
          }
        }
      },
      debug: true
    });
  });

  describe('hasImport', () => {
    it('应该检测到默认导入', () => {
      const code = `
        import i18n from 'i18next';
        
        function App() {
          return <div>Hello</div>;
        }
      `;

      expect(importManager.hasImport(code, 'i18n')).toBe(true);
      expect(importManager.hasImport(code, '$t')).toBe(false);
    });

    it('应该检测到命名导入', () => {
      const code = `
        import { useTranslation } from 'react-i18next';
        
        function App() {
          const { t } = useTranslation();
          return <div>{t('hello')}</div>;
        }
      `;

      expect(importManager.hasImport(code, 'useTranslation')).toBe(true);
      expect(importManager.hasImport(code, 't')).toBe(false);
    });

    it('应该检测到重命名导入', () => {
      const code = `
        import { useTranslation as useT } from 'react-i18next';
        
        function App() {
          const { t } = useT();
          return <div>{t('hello')}</div>;
        }
      `;

      expect(importManager.hasImport(code, 'useT')).toBe(true);
      expect(importManager.hasImport(code, 'useTranslation')).toBe(false);
    });

    it('应该检测到require语句', () => {
      const code = `
        const i18n = require('i18next');
        
        function App() {
          return <div>Hello</div>;
        }
      `;

      expect(importManager.hasImport(code, 'i18n')).toBe(true);
    });
  });

  describe('addImport', () => {
    it('应该在文件顶部添加导入', () => {
      const code = `
function App() {
  return <div>Hello</div>;
}
      `;

      const result = importManager.addImport(code, '$t');
      expect(result).toContain("import { useTranslation } from 'react-i18next';");
    });

    it('应该在导入语句之后添加导入', () => {
      const code = `
import React from 'react';

function App() {
  return <div>Hello</div>;
}
      `;

      const result = importManager.addImport(code, '$t');
      const lines = result.split('\n');
      const reactImportIndex = lines.findIndex(line => line.includes("import React"));
      const i18nImportIndex = lines.findIndex(line => line.includes("import { useTranslation }"));

      expect(reactImportIndex).toBeLessThan(i18nImportIndex);
    });

    it('如果已存在导入则不应添加', () => {
      const code = `
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  return <div>{t('hello')}</div>;
}
      `;

      const result = importManager.addImport(code, '$t');
      expect(result).toBe(code);
    });

    it('如果自动导入被禁用则不应添加', () => {
      const disabledManager = new ImportManager({
        config: {
          enabled: false,
          imports: {
            '$t': {
              importStatement: "import { useTranslation } from 'react-i18next';"
            }
          }
        }
      });

      const code = `function App() { return <div>Hello</div>; }`;
      const result = disabledManager.addImport(code, '$t');
      expect(result).toBe(code);
    });
  });

  describe('insertPosition', () => {
    it('应该在所有导入之前添加导入', () => {
      const beforeImportsManager = new ImportManager({
        config: {
          enabled: true,
          insertPosition: ImportInsertPosition.BEFORE_IMPORTS,
          imports: {
            '$t': {
              importStatement: "import { useTranslation } from 'react-i18next';"
            }
          }
        }
      });

      const code = `
import React from 'react';
import { useState } from 'react';

function App() {
  return <div>Hello</div>;
}
      `;

      const result = beforeImportsManager.addImport(code, '$t');
      const lines = result.split('\n');
      const i18nImportIndex = lines.findIndex(line => line.includes("import { useTranslation }"));
      const reactImportIndex = lines.findIndex(line => line.includes("import React"));

      expect(i18nImportIndex).toBeLessThan(reactImportIndex);
    });

    it('应该在文件顶部添加导入', () => {
      const topOfFileManager = new ImportManager({
        config: {
          enabled: true,
          insertPosition: ImportInsertPosition.TOP_OF_FILE,
          imports: {
            '$t': {
              importStatement: "import { useTranslation } from 'react-i18next';"
            }
          }
        }
      });

      const code = `
// 这是一个注释
import React from 'react';

function App() {
  return <div>Hello</div>;
}
      `;

      const result = topOfFileManager.addImport(code, '$t');
      const lines = result.split('\n');
      const i18nImportIndex = lines.findIndex(line => line.includes("import { useTranslation }"));

      expect(i18nImportIndex).toBeLessThanOrEqual(1);
    });
  });
}); 