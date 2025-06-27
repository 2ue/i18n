import React from 'react';

// 边界和特殊情况测试

// 注释中的中文（不应替换）
/* 这是中文注释 */

/**
 * 文档注释中的中文（不应替换）
 * @param message 消息内容
 */
function showAlert(message = '默认消息') { // 参数默认值应该替换
  // ...
  return message;
}

// 空字符串处理
const emptyString = '';

// 只包含空白字符的字符串
const whiteSpaceString = '   ';

// 混合中英文的字符串
const mixedString = 'Hello 世界！This is a 测试 string.';

// 包含特殊字符的字符串
const specialCharsString = '特殊字符：!@#$%^&*()_+{}:"<>?[];\',./';

// 处理特殊转义序列
const escapeString = '引号\'转义"以及\\反斜杠和\n换行符';

// 模块导入导出
// import { message as 消息 } from './constants';

// 但是值应该替换
export const DEFAULT_MESSAGE = '默认消息';
export { specialCharsString as '中文别名' }; // 这种情况需要特殊处理

// React组件测试
function EdgeCasesTest() {
  // 动态属性
  const dynamicProps = {
    ['用户_id']: '用户信息',
    ['label_' + 1]: '动态标题'
  };

  // 属性访问
  const dynamicMessage = dynamicProps['用户_id'];

  // 解构赋值
  const { 用户_id: userId } = dynamicProps;

  return (
    <div>
      <h1>边界情况测试</h1>

      {/* 空字符串和空白字符串 */}
      <p title={emptyString}>空字符串测试</p>
      <p title={whiteSpaceString}>空白字符串测试</p>

      {/* 混合内容和特殊字符 */}
      <p>{mixedString}</p>
      <p>{specialCharsString}</p>
      <p>{escapeString}</p>

      {/* 动态属性访问 */}
      <p>{dynamicMessage}</p>
      <p>{userId}</p>

      {/* 使用函数返回值 */}
      <p>{showAlert('自定义消息')}</p>
      <p>{showAlert()}</p>
    </div>
  );
}

export default EdgeCasesTest; 