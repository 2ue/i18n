# 中文字符串处理测试用例文档

## 概述
此文档记录了i18n工具需要处理的所有中文字符串场景，用于全面的覆盖测试。包括基础场景、复杂嵌套场景和边界情况。

## 1. 已发现的问题场景

### 1.1 模板字符串嵌套
```jsx
// 问题：模板字符串中嵌套字符串字面量
<h1>{`标题：${'中文标题'}`}</h1>
// 期望：<h1>{`标题：${$t("zhong_wen_biao_ti")}`}</h1>

// 问题：多层嵌套
const message = `外层：${'内层：${\'最内层中文\'}'}`
// 期望：const message = `外层：${$t("nei_ceng")}：${$t("zui_nei_ceng_zhong_wen")}`
```

### 1.2 JSX表达式容器中的字符串
```jsx
// 问题：JSX表达式容器内的字符串字面量
<p>{'内容详情'}</p>
// 期望：<p>{$t("nei_rong_xiang_qing")}</p>

// 问题：JSX中的条件渲染
{isVisible && '显示内容'}
// 期望：{isVisible && $t("xian_shi_nei_rong")}
```

### 1.3 数组字面量中的字符串
```jsx
// 问题：数组中的中文字符串
['确定', '取消'].map(txt => <span key={txt}>{txt}</span>)
// 期望：[$t("que_ding"), $t("qu_xiao")].map(txt => <span key={txt}>{txt}</span>)

// 问题：复杂数组结构
const options = [
  { label: '选项一', value: 1 },
  { label: '选项二', value: 2 }
]
// 期望：const options = [
//   { label: $t("xuan_xiang_yi"), value: 1 },
//   { label: $t("xuan_xiang_er"), value: 2 }
// ]
```

## 2. 基础场景测试用例

### 2.1 字符串字面量
```js
// 单引号字符串
const message1 = '你好世界';

// 双引号字符串  
const message2 = "欢迎使用";

// 包含特殊字符的字符串
const message3 = '用户名不能为空！';

// 多行字符串（通过转义）
const message4 = '第一行\n第二行';
```

### 2.2 模板字符串
```js
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
```

### 2.3 JSX基础场景
```jsx
// JSX文本节点
<span>按钮文字</span>

// JSX属性值
<button title="点击按钮">Click</button>

// JSX属性中的表达式
<input placeholder={'请输入内容'} />

// aria标签
<button aria-label="关闭对话框">×</button>
```

## 3. 复杂嵌套场景

### 3.1 对象字面量
```js
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
```

### 3.2 函数场景
```js
// 函数参数默认值
function greet(name = '访客') {
  return `你好，${name}`;
}

// 箭头函数
const showMessage = (type) => type === 'error' ? '操作失败' : '操作成功';

// 高阶函数
const createValidator = (message = '验证失败') => (value) => value ? null : message;

// 函数调用参数
console.log('调试信息：数据加载完成');
alert('保存成功！');
```

### 3.3 条件表达式
```js
// 三元运算符
const status = isLoading ? '加载中...' : '加载完成';

// 逻辑运算符
const error = hasError && '发生错误';
const message = data || '暂无数据';

// 复杂条件嵌套
const result = user 
  ? user.isVip 
    ? '尊贵的VIP用户' 
    : '普通用户'
  : '未登录用户';
```

### 3.4 数组和集合操作
```js
// 数组字面量
const fruits = ['苹果', '香蕉', '橙子'];

// 数组方法链
const messages = errors
  .filter(err => err.type === 'validation')
  .map(err => `验证错误：${err.message}`)
  .join('，');

// Set和Map
const statusSet = new Set(['待处理', '处理中', '已完成']);
const errorMap = new Map([
  ['404', '页面未找到'],
  ['500', '服务器错误']
]);
```

### 3.5 动态属性和计算属性
```js
// 计算属性名
const dynamic = {
  ['用户_' + id]: '用户信息',
  [getKey('标题')]: '动态标题'
};

// 属性访问
const message = messages['错误信息'];
const text = obj[`动态_${type}`];

// 解构赋值
const { 用户名: username, 密码: password } = formData;
const [第一项, 第二项] = list;
```

## 4. JSX复杂场景

### 4.1 JSX文本节点复杂嵌套
```jsx
// 多层嵌套中的文本节点
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

// 文本节点与表达式混合
<div>
  开始文本 {variable} 中间文本 {anotherVar} 结束文本
</div>

// 包含换行和空白的文本节点
<pre>
  第一行文本
  第二行文本
    缩进的第三行
</pre>

// 列表项中的复杂文本
<ul>
  {items.map((item, index) => (
    <li key={index}>
      项目 {index + 1}：{item.name || '无名称项目'}
      {item.isNew && <span className="badge">新增</span>}
    </li>
  ))}
</ul>

// 表格中的文本节点
<table>
  <thead>
    <tr>
      <th>序号</th>
      <th>用户名</th>
      <th>操作</th>
    </tr>
  </thead>
  <tbody>
    {users.map(user => (
      <tr key={user.id}>
        <td>{user.id}</td>
        <td>{user.name || '匿名用户'}</td>
        <td>
          <button>编辑</button>
          <button>删除</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

// 动态文本嵌套场景
// 1. 条件渲染中的动态文本组合
<div>
  {isLoading ? (
    <span>正在加载 {dataType} 数据...</span>
  ) : hasError ? (
    <span>加载 {dataType} 失败：{errorMessage || '未知错误'}</span>
  ) : (
    <span>成功加载 {dataCount} 条 {dataType} 数据</span>
  )}
</div>

// 2. 多级嵌套条件的动态文本
<div>
  {user ? (
    user.isVip ? (
      <p>尊贵的VIP用户 {user.name}，您有 {user.points} 积分</p>
    ) : (
      <p>普通用户 {user.name}，您有 {user.points} 积分</p>
    )
  ) : (
    <p>请先登录以查看用户信息</p>
  )}
</div>

// 3. 循环中的动态文本组合
<ul>
  {notifications.map((notification, index) => (
    <li key={notification.id}>
      <span>
        {notification.type === 'success' ? '成功' : 
         notification.type === 'warning' ? '警告' : 
         notification.type === 'error' ? '错误' : '信息'}：
        {notification.message}
        {notification.time && ` (${formatTime(notification.time)})`}
      </span>
      {notification.isUnread && <span className="badge">未读</span>}
    </li>
  ))}
</ul>

// 4. 函数调用返回的动态文本
<div>
  <h1>{getTitle(pageType, userRole)}</h1>
  <p>{getDescription(pageType) || '暂无描述信息'}</p>
  <span>
    当前状态：{formatStatus(currentStatus)} 
    {isOnline ? '在线' : '离线'}
  </span>
</div>

// 5. 状态驱动的复杂动态文本
<div>
  {step === 1 && <p>第一步：请填写基本信息</p>}
  {step === 2 && <p>第二步：请上传必要文件</p>}
  {step === 3 && <p>第三步：请确认提交信息</p>}
  <div>
    进度：{step}/{totalSteps} 
    ({Math.round((step / totalSteps) * 100)}% 完成)
  </div>
</div>

// 6. 嵌套三元运算符的动态文本
<div>
  <p>
    订单状态：
    {order.status === 'pending' ? '待处理' :
     order.status === 'processing' ? '处理中' :
     order.status === 'shipped' ? `已发货 (快递单号: ${order.trackingNumber})` :
     order.status === 'delivered' ? '已送达' :
     order.status === 'cancelled' ? `已取消 (原因: ${order.cancelReason || '用户取消'})` :
     '未知状态'}
  </p>
</div>

// 7. 动态组件属性和文本结合
<Alert 
  type={alertType}
  message={`操作${isSuccess ? '成功' : '失败'}`}
  description={
    isSuccess 
      ? `已成功${actionType}${itemCount}项数据` 
      : `${actionType}失败：${errorDetails || '请稍后重试'}`
  }
>
  {showDetails && (
    <div>
      详细信息：{JSON.stringify(operationResult, null, 2)}
      {retryCount > 0 && <p>已重试 {retryCount} 次</p>}
    </div>
  )}
</Alert>

// 8. 表单动态验证文本
<Form>
  {formFields.map(field => (
    <Form.Item 
      key={field.name}
      label={field.label}
      validateStatus={field.error ? 'error' : ''}
      help={field.error || (field.showHelp ? field.helpText : '')}
    >
      <Input 
        placeholder={`请输入${field.label}`}
        onChange={(e) => validateField(field.name, e.target.value)}
      />
      {field.isValidating && <span>正在验证{field.label}...</span>}
    </Form.Item>
  ))}
  <div>
    表单状态：{isFormValid ? '验证通过' : `还有${invalidFieldCount}个字段需要修正`}
  </div>
</Form>

// 9. 异步数据加载的动态文本
<div>
  {isLoading ? (
    <div>
      <Spinner />
      <span>正在加载{currentLoadingStep}...</span>
      <progress value={loadingProgress} max="100" />
      <span>{loadingProgress}% 完成</span>
    </div>
  ) : data ? (
    <div>
      <h2>加载完成</h2>
      <p>共获取到 {data.length} 条数据</p>
      <small>最后更新时间：{formatDate(data.lastUpdated)}</small>
    </div>
  ) : (
    <div>
      <p>暂无数据</p>
      <button onClick={refetch}>点击重新加载</button>
    </div>
  )}
</div>

// 10. 实时更新的动态文本
<div>
  <p>当前时间：{currentTime.toLocaleString()}</p>
  <p>
    会话剩余时间：
    {sessionTimeLeft > 0 
      ? `${Math.floor(sessionTimeLeft / 60)}分${sessionTimeLeft % 60}秒`
      : '会话已过期，请重新登录'
    }
  </p>
  <div>
    在线用户：{onlineUsers.length} 人
    {onlineUsers.length > 0 && (
      <span>
        （包括：{onlineUsers.slice(0, 3).map(u => u.name).join('、')}
        {onlineUsers.length > 3 && `等${onlineUsers.length}人`}）
      </span>
    )}
  </div>
</div>

// 11. 嵌套组件中的动态文本传递
<Card 
  title={`${cardType}信息`}
  extra={
    <span>
      {isEditing ? '编辑模式' : '查看模式'}
      {hasChanges && ' (有未保存的更改)'}
    </span>
  }
>
  <Tabs>
    {tabs.map(tab => (
      <TabPane 
        key={tab.key} 
        tab={
          <span>
            {tab.title}
            {tab.hasError && <Icon type="error" style={{color: 'red'}} />}
            {tab.count > 0 && <Badge count={tab.count} />}
          </span>
        }
      >
        <div>
          {tab.loading ? (
            <p>正在加载{tab.title}数据...</p>
          ) : tab.data ? (
            <div>
              <p>{tab.title}共有 {tab.data.length} 项</p>
              {tab.data.map(item => (
                <div key={item.id}>
                  <strong>{item.name}</strong>
                  <span>状态：{item.status === 'active' ? '激活' : '禁用'}</span>
                  {item.lastModified && (
                    <small>最后修改：{formatDate(item.lastModified)}</small>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>暂无{tab.title}数据</p>
          )}
        </div>
      </TabPane>
    ))}
  </Tabs>
</Card>

// 12. 错误边界中的动态文本
<ErrorBoundary
  fallback={(error, errorInfo) => (
    <div>
      <h2>页面加载出错</h2>
      <p>错误类型：{error.name || '未知错误'}</p>
      <p>错误信息：{error.message || '系统异常，请稍后重试'}</p>
      {isDevelopment && (
        <details>
          <summary>详细错误信息（开发模式）</summary>
          <pre>{errorInfo.componentStack}</pre>
        </details>
      )}
      <button onClick={() => window.location.reload()}>
        重新加载页面
      </button>
    </div>
  )}
>
  {children}
</ErrorBoundary>
```

### 4.2 JSX嵌套和组合
```jsx
// 复杂JSX结构
<Modal title="确认删除">
  <p>确定要删除"{fileName}"吗？</p>
  <div>
    {items.map(item => (
      <Item key={item.id} label={item.name || '未命名项目'} />
    ))}
  </div>
</Modal>

// JSX片段
<>
  <h1>主标题</h1>
  <p>描述文字</p>
</>

// 条件渲染
{isError ? (
  <Alert type="error">操作失败，请重试</Alert>
) : (
  <Success>操作成功完成</Success>
)}

// 组件嵌套传递文本
<Layout>
  <Header>
    <Navigation>
      <Link to="/home">首页</Link>
      <Link to="/about">关于我们</Link>
    </Navigation>
  </Header>
  <Main>
    <Content>
      <Title level={1}>页面主标题</Title>
      <Paragraph>
        这是一个包含<strong>粗体文本</strong>和<em>斜体文本</em>的段落。
      </Paragraph>
    </Content>
  </Main>
</Layout>
```

### 4.3 JSX属性传递
```jsx
// 扩展属性
<Button {...props} title="默认标题" />

// 动态属性
<input 
  type="text"
  placeholder={isRequired ? '必填项目' : '可选项目'}
  title={`提示：${helpText || '无提示信息'}`}
/>

// 事件处理
<button onClick={() => showMessage('点击了按钮')}>
  点击我
</button>
```

## 5. TypeScript特有场景

### 5.1 类型注解和断言
```ts
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
```

### 5.2 泛型和枚举
```ts
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
```

## 6. 边界情况和特殊场景

### 6.1 字符串拼接和处理
```js
// 字符串拼接
const fullMessage = '前缀：' + message + '后缀';

// 字符串方法
const processed = '原始文本'.replace(/\s/g, '').toLowerCase();

// 正则表达式
const pattern = /错误信息：(.+)/;
const regex = new RegExp('匹配模式');
```

### 6.2 注释和字符串混合
```js
// 注释中的中文（不应替换）
/* 这是中文注释 */

// 但代码中的字符串应该替换
const message = '这是要替换的中文'; // 行尾注释：不替换

/**
 * 文档注释中的中文（不应替换）
 * @param message 消息内容
 */
function showAlert(message = '默认消息') { // 参数默认值应该替换
  // ...
}
```

### 6.3 模块导入导出
```js
// import语句（不应替换）
import { message as 消息 } from './constants';

// 但是值应该替换
export const DEFAULT_MESSAGE = '默认消息';
export { message as '中文别名' }; // 这种情况需要特殊处理
```

## 7. 高级复杂场景

### 7.1 闭包和作用域
```js
function createMessageHandler() {
  const prefix = '系统消息：';
  
  return function(type) {
    const messages = {
      success: '操作成功',
      error: '操作失败',
      warning: '警告信息'
    };
    
    return prefix + messages[type];
  };
}
```

### 7.2 异步场景
```js
// Promise
const fetchData = () => Promise.resolve('数据加载成功');

// async/await
async function loadUser() {
  try {
    const user = await api.getUser();
    return user || '用户不存在';
  } catch (error) {
    throw new Error('加载用户失败');
  }
}
```

### 7.3 类和装饰器
```js
class UserService {
  static defaultMessage = '默认服务消息';
  
  private errorMessage = '服务错误';
  
  @log('用户服务')
  async getUser(id) {
    if (!id) {
      throw new Error('用户ID不能为空');
    }
    // ...
  }
}
```

## 8. 其他文件场景

### 8.1 CSS-in-JS 场景
```js
// styled-components
const Button = styled.button`
  &::before {
    content: '按钮前缀';
  }
  &::after {
    content: "按钮后缀";
  }
`;

// 样式对象
const styles = {
  error: {
    '&::before': {
      content: '"错误："'
    }
  }
};

// Emotion CSS
const errorStyle = css`
  &::after {
    content: '请检查输入';
  }
`;
```

### 8.2 配置和常量文件
```js
// 配置常量
export const CONFIG = {
  APP_NAME: '我的应用',
  VERSION: '1.0.0',
  MESSAGES: {
    LOADING: '正在加载...',
    ERROR: '加载失败',
    SUCCESS: '加载成功'
  }
};

// 路由配置
export const routes = [
  { path: '/home', name: '首页' },
  { path: '/user', name: '用户管理' },
  { path: '/settings', name: '系统设置' }
];

// 表单验证规则
export const validationRules = {
  required: { message: '此字段为必填项' },
  email: { message: '请输入有效的邮箱地址' },
  minLength: (min) => ({ message: `最少需要${min}个字符` })
};
```

### 8.3 API和网络请求
```js
// API错误处理
const apiClient = {
  get: async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      return response.json();
    } catch (error) {
      console.error('API请求错误：', error.message);
      throw new Error('服务器连接失败，请稍后重试');
    }
  }
};

// 请求拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || '请求失败';
    notification.error({ message: '操作失败', description: message });
    return Promise.reject(error);
  }
);
```

### 8.4 测试代码场景
```js
// 单元测试
describe('用户管理模块', () => {
  test('应该正确显示用户信息', () => {
    const user = { name: '张三', age: 25 };
    const result = formatUser(user);
    expect(result).toBe('用户：张三，年龄：25岁');
  });
  
  test('空用户名应该显示默认值', () => {
    const user = { name: '', age: 25 };
    expect(formatUser(user)).toContain('匿名用户');
  });
});

// 端到端测试
it('用户登录流程', () => {
  cy.visit('/login');
  cy.get('[data-testid="username"]').type('testuser');
  cy.get('[data-testid="password"]').type('password');
  cy.get('button').contains('登录').click();
  cy.contains('登录成功').should('be.visible');
});
```

### 8.5 日志和调试
```js
// 日志记录
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
  error: (message) => console.error(`[ERROR] 系统错误: ${message}`),
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] 调试信息: ${message}`);
    }
  }
};

// 性能监控
performance.mark('开始加载用户数据');
await loadUserData();
performance.mark('完成加载用户数据');
performance.measure('用户数据加载时间', '开始加载用户数据', '完成加载用户数据');
```

### 8.6 表单和验证
```js
// 表单字段配置
const formFields = [
  {
    name: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
    rules: [{ required: true, message: '用户名不能为空' }]
  },
  {
    name: 'email',
    label: '邮箱地址',
    placeholder: '请输入邮箱地址',
    rules: [
      { required: true, message: '邮箱不能为空' },
      { type: 'email', message: '邮箱格式不正确' }
    ]
  }
];

// 动态表单验证
const validateField = (field, value) => {
  const errors = [];
  if (field.required && !value) {
    errors.push(`${field.label}不能为空`);
  }
  if (field.minLength && value.length < field.minLength) {
    errors.push(`${field.label}至少需要${field.minLength}个字符`);
  }
  return errors;
};
```

## 9. 不需要翻译的场景

### 9.1 技术标识符和关键词
```js
// HTML/CSS 属性名和值（不翻译）
const element = document.createElement('div');
element.className = 'container';
element.setAttribute('data-testid', 'user-list');

// 但是用户可见的内容需要翻译
element.textContent = '用户列表'; // 需要翻译

// CSS 类名和选择器（不翻译）
const styles = `
  .header { color: red; }
  #main-content { display: flex; }
`;
```

### 9.2 API 路径和技术配置
```js
// API 端点（不翻译）
const API_ENDPOINTS = {
  USERS: '/api/users',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout'
};

// 环境变量和配置键（不翻译）
const config = {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.REACT_APP_API_URL,
  DEBUG_MODE: process.env.DEBUG === 'true'
};

// 但是配置的描述性值需要翻译
const configDescriptions = {
  NODE_ENV: '运行环境', // 需要翻译
  API_BASE_URL: 'API基础地址', // 需要翻译
  DEBUG_MODE: '调试模式' // 需要翻译
};
```

### 9.3 纯英文内容和国际化代码
```js
// 英文单词或句子（通常不翻译，除非明确要求）
const statusTexts = {
  loading: 'Loading...',    // 可能不翻译
  error: 'Error occurred',  // 可能不翻译
  success: 'Success'        // 可能不翻译
};

// 但中文内容需要翻译
const chineseStatusTexts = {
  loading: '加载中...',     // 需要翻译
  error: '发生错误',        // 需要翻译
  success: '操作成功'       // 需要翻译
};

// 已经是i18n key的内容（不翻译）
const messages = {
  welcome: t('welcome_message'),
  error: t('error_occurred')
};
```

### 9.4 数据格式和模式
```js
// 正则表达式（不翻译）
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^1[3-9]\d{9}$/,
  url: /^https?:\/\/.+/
};

// JSON Schema（属性名不翻译）
const userSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: '姓名' }, // title 需要翻译
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email']
};

// 数据库字段名（不翻译）
const query = `
  SELECT user_id, user_name, created_at 
  FROM users 
  WHERE status = 'active'
`;
```

### 9.5 注释和文档字符串
```js
/**
 * 计算用户年龄 - 这种注释通常不翻译，但也可能需要
 * @param {Date} birthDate 出生日期
 * @returns {number} 年龄
 */
function calculateAge(birthDate) {
  // 这是行内注释 - 通常不翻译
  const today = new Date();
  
  // 但是用户可见的错误信息需要翻译
  if (!birthDate) {
    throw new Error('出生日期不能为空'); // 需要翻译
  }
  
  return Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
}
```

### 9.6 调试和开发工具
```js
// 控制台调试信息（开发用，通常不翻译）
console.log('User data loaded:', userData);
console.warn('Deprecated function used');
console.error('Network request failed');

// 但是面向用户的错误提示需要翻译
if (error) {
  showUserMessage('网络连接失败，请检查网络设置'); // 需要翻译
}

// 性能标记（开发用，不翻译）
performance.mark('start-render');
performance.mark('end-render');
```

## 10. 测试验证要点

### 10.1 替换正确性
- ✅ 所有中文字符串都被正确识别
- ✅ 生成的key符合命名规范
- ✅ 替换后的代码语法正确
- ✅ 引号类型符合配置要求

### 10.2 不应替换的场景验证
- ❌ TypeScript类型定义中的字面量
- ❌ 注释中的中文内容
- ❌ import/export语句中的标识符
- ❌ 对象属性名（除非是计算属性）
- ❌ CSS类名和选择器
- ❌ API端点和路径
- ❌ 环境变量和配置键
- ❌ 正则表达式模式
- ❌ 数据库字段名
- ❌ 调试信息和性能标记
- ❌ 已经是i18n函数调用的内容

### 10.3 边界情况验证
- 🔍 空字符串处理
- 🔍 只包含空白字符的字符串
- 🔍 混合中英文的字符串
- 🔍 包含特殊字符的字符串
- 🔍 Unicode字符处理
- 🔍 换行和缩进处理
- 🔍 嵌套层级深度处理
- 🔍 大文件性能表现

### 10.4 文件类型覆盖验证
- 📁 .js/.jsx 文件
- 📁 .ts/.tsx 文件  
- 📁 .vue 文件（如果支持）
- 📁 配置文件处理
- 📁 测试文件处理
- 📁 样式文件中的字符串

## 11. 测试文件组织建议

建议创建以下测试文件结构：
```
test/cases/
├── basic/                 # 基础场景
│   ├── string-literal.js
│   ├── template-string.js
│   └── jsx-basic.jsx
├── complex/               # 复杂场景  
│   ├── nested.js
│   ├── object.js
│   ├── array.js
│   └── conditional.js
├── jsx/                   # JSX专项
│   ├── text-nodes.jsx     # 文本节点复杂嵌套
│   ├── components.jsx     # 组件嵌套
│   ├── attributes.jsx     # 属性处理
│   ├── expressions.jsx    # 表达式容器
│   └── tables-lists.jsx   # 表格和列表
├── typescript/            # TypeScript专项
│   ├── types.ts           # 类型定义
│   ├── interfaces.ts      # 接口
│   ├── generics.ts        # 泛型
│   └── enums.ts          # 枚举
├── css-in-js/            # 样式相关
│   ├── styled-components.js
│   ├── emotion.js
│   └── css-modules.js
├── api-config/           # API和配置
│   ├── constants.js       # 常量配置
│   ├── routes.js          # 路由配置
│   ├── api-client.js      # API客户端
│   └── validation.js      # 验证规则
├── forms-validation/     # 表单和验证
│   ├── form-fields.js
│   ├── validation-rules.js
│   └── error-messages.js
├── testing/              # 测试代码
│   ├── unit-tests.js
│   ├── e2e-tests.js
│   └── assertions.js
├── logging-debug/        # 日志和调试
│   ├── logger.js
│   ├── performance.js
│   └── error-handling.js
├── no-translate/         # 不应翻译的场景
│   ├── technical-ids.js   # 技术标识符
│   ├── api-paths.js       # API路径
│   ├── english-content.js # 英文内容
│   ├── regex-patterns.js  # 正则表达式
│   ├── comments.js        # 注释
│   └── debug-info.js      # 调试信息
└── edge-cases/           # 边界情况
    ├── mixed-content.js   # 混合内容
    ├── special-chars.js   # 特殊字符
    ├── unicode.js         # Unicode字符
    ├── whitespace.js      # 空白字符
    ├── performance.js     # 性能测试
    └── large-files.js     # 大文件测试
```

每个测试文件都应包含：
1. 原始代码示例
2. 期望的替换结果
3. 生成的JSON键值对
4. 特殊注意事项

## 12. 实施优先级建议

### 12.1 高优先级（必须支持）
1. **基础字符串场景**
   - 字符串字面量（单/双引号）
   - 模板字符串基础用法
   - JSX文本节点和属性

2. **常见复杂场景**
   - 对象字面量中的值
   - 数组字面量中的元素
   - 函数参数和返回值

### 12.2 中优先级（重要支持）  
1. **JSX复杂嵌套**
   - 表达式容器中的字符串
   - 条件渲染中的字符串
   - 多层组件嵌套中的文本

2. **TypeScript场景**
   - 正确区分类型定义和值
   - 枚举值处理
   - 接口默认值

### 12.3 低优先级（可选支持）
1. **CSS-in-JS场景**
   - styled-components content属性
   - 样式对象中的字符串值

2. **高级场景**
   - 动态属性名
   - 复杂解构赋值
   - 装饰器参数

### 12.4 特殊处理场景
1. **明确不翻译**
   - 确保技术标识符不被错误处理
   - 注释内容的正确识别
   - API路径和配置键的保护

2. **可配置翻译**
   - 测试代码中的字符串（可选）
   - 日志信息（可选）
   - 英文内容（基于配置决定）

## 13. 质量保证检查单

### 13.1 功能正确性
- [ ] 所有中文字符串都被识别
- [ ] 生成的key命名规范一致
- [ ] 引号类型配置正确生效
- [ ] 不应翻译的内容被正确跳过

### 13.2 代码质量
- [ ] 替换后代码语法正确
- [ ] 不破坏原有代码格式
- [ ] 不影响代码的运行逻辑
- [ ] 处理速度在可接受范围内

### 13.3 边界情况
- [ ] 空文件处理正常
- [ ] 大文件处理正常
- [ ] 特殊字符处理正确
- [ ] 嵌套层级深度处理正常

### 13.4 配置兼容性
- [ ] 不同引号类型配置正确
- [ ] 不同函数名配置正确
- [ ] 不同输出目录配置正确
- [ ] 不同模式（提取/替换/混合）正确 