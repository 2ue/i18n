/**
 * 基本字符串测试用例
 */

// 单引号字符串
const message1 = '你好世界';

// 双引号字符串  
const message2 = "欢迎使用";

// 包含特殊字符的字符串
const message3 = '用户名不能为空！';

// 多行字符串（通过转义）
const message4 = '第一行\n第二行';

// 模板字符串
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

export const expectedKeys = {
  message1: 'nihao_shijie',
  message2: 'huanying_shiyong',
  message3: 'yonghu_ming_buneng_weikong',
  message4: 'diyi_hang_dier_hang',
  greeting_part: 'nihao',
  title: 'biaoti',
  content: 'neirong',
  normal: 'zhengchang',
  abnormal: 'yichang'
}; 