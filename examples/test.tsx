import React from 'react';

// 简单组件，包含多种形式的中文字符串
function TestComponent() {
  // 添加缺失的变量
  const user = { name: '张三' };
  const isLoading = false;

  // 1. 字符串字面量
  const message1 = '你好世界';
  const message2 = "欢迎使用";

  // 2. 模板字符串
  const greeting = `你好，${user.name}`;

  // 3. JSX文本节点
  return (
    <div className="container">
      <h1>测试组件</h1>
      <p>{message1}</p>
      <p>{message2}</p>
      <p>{greeting}</p>

      {/* 4. JSX属性 */}
      <button title="点击按钮">确定</button>

      {/* 5. JSX表达式容器 */}
      <div>{isLoading ? '加载中...' : '加载完成'}</div>

      {/* 6. 数组 */}
      {['确定', '取消'].map(text => (
        <button key={text}>{text}</button>
      ))}

      {/* 7. 对象 */}
      <select>
        {[
          { label: '选项一', value: '1' },
          { label: '选项二', value: '2' }
        ].map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TestComponent; 