/**
 * CLI模块导出点
 */
export * from './cli/index';

// 如果直接执行
if (require.main === module) {
  const { cli } = require('./cli/index');
  cli();
} 