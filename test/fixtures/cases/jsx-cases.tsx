 * JSX测试用例
  */
import React from 'react';

// JSX文本节点
const SimpleComponent = () => (
  <span>按钮文字</span>
);

// JSX属性值
const ButtonWithTitle = () => (
  <button title="点击按钮">Click</button>
);

// JSX属性中的表达式
const InputWithPlaceholder = () => (
  <input placeholder={'请输入内容'} />
);

// JSX表达式容器中的字符串字面量
const TextContainer = () => (
  <p>{'内容详情'}</p>
);

// JSX中的条件渲染
const ConditionalText = ({ isVisible }: { isVisible: boolean }) => (
  <div>
    {isVisible && '显示内容'}
  </div>
);

// 数组字面量中的字符串
const ButtonList = () => (
  <div>
    {['确定', '取消'].map(txt => <span key={txt}>{txt}</span>)}
  </div>
);

export const expectedKeys = {
  button_text: 'anniu_wenzi',
  click_button: 'dianji_anniu',
  input_content: 'qing_shuru_neirong',
  content_details: 'neirong_xiangqing',
  show_content: 'xianshi_neirong',
  confirm: 'queding',
  cancel: 'quxiao'
};
/**
 