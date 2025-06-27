// 字符串字面量测试场景

// 单引号字符串
const message1 = '你好世界';

// 双引号字符串  
const message2 = "欢迎使用";

// 包含特殊字符的字符串
const message3 = '用户名不能为空！';

// 多行字符串（通过转义）
const message4 = '第一行\n第二行';

// 字符串拼接
const fullMessage = '前缀：' + message1 + '后缀';

function testFunction() {
  // 函数参数默认值
  function greet(name = '访客') {
    return `你好，${name}`;
  }

  // 函数调用参数
  console.log('调试信息：数据加载完成');

  return greet();
} 