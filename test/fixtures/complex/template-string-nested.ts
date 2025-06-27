/**
 * 模板字符串嵌套测试用例
 */

// 定义测试所需的变量
const isActive = true;
const getGreeting = (name: string) => `你好，${name}`;
const user = { name: '张三', age: 30 };
const isVisible = true;

// 模板字符串中嵌套字符串字面量
const title = `标题：${'中文标题'}`;

// 多层嵌套
const message = `外层：${'内层：${\'最内层中文\'}'}`

// 模板字符串中的条件表达式
const status = `状态：${isActive ? '激活' : '未激活'}`;

// 模板字符串中的函数调用
const greeting = `问候：${getGreeting('访客')}`;

// 模板字符串中的对象属性
const userInfo = `用户：${user.name}，年龄：${user.age}`;

// 多行模板字符串
const html = `
  <div>
    <h1>标题</h1>
    <p>内容</p>
    <span>${isVisible ? '显示' : '隐藏'}</span>
  </div>
`;

export const expectedKeys = {
  title_prefix: 'biaoti',
  chinese_title: 'zhongwen_biaoti',
  outer_layer: 'wai_ceng',
  inner_layer: 'nei_ceng',
  innermost_chinese: 'zui_nei_ceng_zhongwen',
  status_prefix: 'zhuangtai',
  active: 'jihuo',
  inactive: 'wei_jihuo',
  greeting_prefix: 'wenhao',
  visitor: 'fangke',
  user_prefix: 'yonghu',
  age_prefix: 'nianling',
  title_tag: 'biaoti',
  content: 'neirong',
  show: 'xianshi',
  hide: 'yincang'
}; 