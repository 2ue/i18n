/**
 * 对象和数组测试用例
 */

// 简单对象
const config = {
  title: '系统配置',
  description: '这是系统配置页面'
};

// 嵌套对象
const form = {
  fields: {
    username: {
      label: '用户名',
      placeholder: '请输入用户名',
      error: '用户名不能为空'
    },
    password: {
      label: '密码',
      placeholder: '请输入密码'
    }
  }
};

// 数组字面量
const fruits = ['苹果', '香蕉', '橙子'];

// 复杂数组结构
const options = [
  { label: '选项一', value: 1 },
  { label: '选项二', value: 2 }
];

export const expectedKeys = {
  system_config: 'xitong_peizhi',
  description: 'zheshi_xitong_peizhi_yemian',
  username: 'yonghuming',
  enter_username: 'qing_shuru_yonghuming',
  username_required: 'yonghuming_buneng_weikong',
  password: 'mima',
  enter_password: 'qing_shuru_mima',
  apple: 'pingguo',
  banana: 'xiangjiao',
  orange: 'chengzi',
  option_one: 'xuanxiang_yi',
  option_two: 'xuanxiang_er'
}; 