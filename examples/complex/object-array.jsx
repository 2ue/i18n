import React from 'react';

// 对象和数组场景测试

function ObjectArrayTest() {
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

  // 方法对象
  const validators = {
    required: (value) => value ? null : '此字段为必填项',
    minLength: (min) => (value) => value.length >= min ? null : `最少需要${min}个字符`
  };

  // 数组字面量
  const fruits = ['苹果', '香蕉', '橙子'];

  // 问题：数组中的中文字符串
  const buttons = ['确定', '取消'].map(txt => <span key={txt}>{txt}</span>);

  // 问题：复杂数组结构
  const options = [
    { label: '选项一', value: 1 },
    { label: '选项二', value: 2 }
  ];

  // 数组和Set、Map
  const statusSet = new Set(['待处理', '处理中', '已完成']);
  const errorMap = new Map([
    ['404', '页面未找到'],
    ['500', '服务器错误']
  ]);

  return (
    <div>
      <h1>{config.title}</h1>
      <p>{config.description}</p>

      <form>
        <div>
          <label>{form.fields.username.label}</label>
          <input placeholder={form.fields.username.placeholder} />
          <span>{form.fields.username.error}</span>
        </div>
      </form>

      <div>
        {buttons}
      </div>

      <select>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div>
        <h3>水果列表</h3>
        <ul>
          {fruits.map((fruit, index) => (
            <li key={index}>{fruit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ObjectArrayTest; 