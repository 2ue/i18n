// 模板字符串测试场景

// 添加缺失的变量
const name = '张三';
const status = true;
const dataType = '用户';

// 简单模板字符串
const greeting = `你好，${name}`;

// 多行模板字符串
const html = `
  <div>
    <h1>标题</h1>
    <p>内容</p>
  </div>
`;

// 嵌套表达式的模板字符串
const complex = `状态：${status ? '正常' : '异常'}`;

// 问题：模板字符串中嵌套字符串字面量
const title = `标题：${'中文标题'}`;

// 问题：多层嵌套
const message = `外层：${'内层：${\'最内层中文\'}'}`;

// 动态文本嵌套
const loadingText = `正在加载 ${dataType} 数据...`;

// 复杂模板字符串
const orderStatus = `订单状态：${'已发货'} (快递单号: ${12345})`; 