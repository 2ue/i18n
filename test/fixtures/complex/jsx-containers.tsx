/**
 * JSX表达式容器测试用例
 */
import React from 'react';

// 定义测试所需的变量
const isVisible = true;
const count = 5;

// JSX表达式容器中的字符串字面量
const TextContainer = () => (
  <p>{'内容详情'}</p>
);

// JSX中的条件渲染
const ConditionalText = () => (
  <div>
    {isVisible && '显示内容'}
    {!isVisible && '隐藏内容'}
  </div>
);

// 三元表达式
const StatusText = () => (
  <div>
    {count > 0 ? '有数据' : '无数据'}
  </div>
);

// 数组映射
const ItemList = () => (
  <ul>
    {['项目一', '项目二', '项目三'].map(item => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

export const JSXContainersExample = () => (
  <div className="jsx-containers-example">
    <TextContainer />
    <ConditionalText />
    <StatusText />
    <ItemList />
  </div>
);

export const expectedKeys = {
  content_details: 'neirong_xiangqing',
  show_content: 'xianshi_neirong',
  hide_content: 'yincang_neirong',
  has_data: 'you_shuju',
  no_data: 'wu_shuju',
  item_one: 'xiangmu_yi',
  item_two: 'xiangmu_er',
  item_three: 'xiangmu_san'
}; 