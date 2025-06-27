import React from 'react';

// JSX文本节点测试场景

// 添加缺失的变量
const isVisible = true;
const variable = '变量1';
const anotherVar = '变量2';

function JsxTextNodesTest() {
  return (
    <div>
      {/* 简单文本节点 */}
      <span>按钮文字</span>

      {/* JSX属性值 */}
      <button title="点击按钮">Click</button>

      {/* JSX属性中的表达式 */}
      <input placeholder={'请输入内容'} />

      {/* aria标签 */}
      <button aria-label="关闭对话框">×</button>

      {/* 问题：JSX表达式容器内的字符串字面量 */}
      <p>{'内容详情'}</p>

      {/* 问题：JSX中的条件渲染 */}
      {isVisible && '显示内容'}

      {/* 多层嵌套中的文本节点 */}
      <div>
        <section>
          <article>
            <h1>深层嵌套标题</h1>
            <p>这是深层嵌套的段落文本</p>
            <div>
              <span>内嵌文本</span>
              {isVisible && <strong>条件显示的强调文本</strong>}
            </div>
          </article>
        </section>
      </div>

      {/* 文本节点与表达式混合 */}
      <div>
        开始文本 {variable} 中间文本 {anotherVar} 结束文本
      </div>

      {/* 包含换行和空白的文本节点 */}
      <pre>
        第一行文本
        第二行文本
          缩进的第三行
      </pre>
    </div>
  );
}

export default JsxTextNodesTest; 