// TypeScript类型测试

// 类型注解（不应替换）
interface User {
  name: string; // 这是类型，不应替换
  title: "管理员" | "用户"; // 这是字面量类型，不应替换
}

// 但是值应该替换
const defaultUser: User = {
  name: '默认用户',  // 应该替换
  title: "用户"     // 应该替换
};

// 类型断言
const message = getValue() as '成功信息';

// 枚举值
enum Status {
  LOADING = '加载中',
  SUCCESS = '成功',
  ERROR = '失败'
}

// 泛型约束
function processMessage<T extends '警告' | '错误'>(type: T, message: string) {
  return `${type}：${message}`;
}

// 函数声明，包含类型
function showUserInfo(user: { name: string, age: number }, showDetail: boolean = false): string {
  return showDetail
    ? `用户：${user.name}，年龄：${user.age}岁`
    : `用户：${user.name}`;
}

// 模拟函数，用于测试
function getValue(): string {
  return '成功信息';
}

// 类型测试使用
const result = processMessage('警告', '操作有风险');
const userInfo = showUserInfo({ name: '张三', age: 30 }, true);

// 导出
export { Status, defaultUser, result, userInfo }; 