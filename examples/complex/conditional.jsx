import React from 'react';

// 条件表达式场景测试

function ConditionalTest() {
  // 变量定义
  const isLoading = false;
  const hasError = false;
  const data = null;
  const user = { isVip: true, name: '李四' };
  const order = { 
    status: 'shipped', 
    trackingNumber: '123456',
    cancelReason: '用户取消'
  };
  
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

  // 条件渲染中的动态文本组合
  const dataType = '订单';
  const dataCount = 10;
  const errorMessage = '网络错误';
  
  return (
    <div>
      <h1>条件表达式测试</h1>
      
      {/* 基本条件表达式 */}
      <p>状态：{status}</p>
      <p>错误：{error || '无错误'}</p>
      <p>消息：{message}</p>
      <p>结果：{result}</p>
      
      {/* 嵌套三元运算符的动态文本 */}
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
      
      {/* 条件渲染中的动态文本组合 */}
      <div>
        {isLoading ? (
          <span>正在加载 {dataType} 数据...</span>
        ) : hasError ? (
          <span>加载 {dataType} 失败：{errorMessage || '未知错误'}</span>
        ) : (
          <span>成功加载 {dataCount} 条 {dataType} 数据</span>
        )}
      </div>
      
      {/* 多级嵌套条件的动态文本 */}
      <div>
        {user ? (
          user.isVip ? (
            <p>尊贵的VIP用户 {user.name}，您有 {100} 积分</p>
          ) : (
            <p>普通用户 {user.name}，您有 {50} 积分</p>
          )
        ) : (
          <p>请先登录以查看用户信息</p>
        )}
      </div>
    </div>
  );
}

export default ConditionalTest; 