/**
 * JSX复杂场景测试用例
 */
import React from 'react';

// 定义测试所需的变量
const isLoading = false;
const dataType = '用户';
const dataCount = 10;
const errorMessage = '网络错误';
const user = { name: '张三', points: 100, isVip: true };
const notifications = [
  { id: 1, type: 'success', message: '操作成功', time: new Date(), isUnread: true },
  { id: 2, type: 'error', message: '操作失败', time: new Date(), isUnread: false }
];
const formatTime = (time: Date) => time.toLocaleString();
const getTitle = (type: string, role: string) => `${type}页面 - ${role}`;
const getDescription = (type: string) => type === 'home' ? '首页描述' : '';
const formatStatus = (status: string) => status === 'online' ? '在线状态' : '离线状态';
const isOnline = true;
const step = 2;
const totalSteps = 3;
const order = {
  status: 'shipped',
  trackingNumber: 'SF123456789',
  cancelReason: ''
};

// JSX表达式容器中的字符串字面量
const TextContainer = () => (
  <p>{'内容详情'}</p>
);

// JSX中的条件渲染
const ConditionalText = ({ isVisible }: { isVisible: boolean }) => (
  <div>
    {isVisible && '显示内容'}
  </div>
);

// 条件渲染中的动态文本组合
const LoadingState = () => (
  <div>
    {isLoading ? (
      <span>正在加载 {dataType} 数据...</span>
    ) : errorMessage ? (
      <span>加载 {dataType} 失败：{errorMessage || '未知错误'}</span>
    ) : (
      <span>成功加载 {dataCount} 条 {dataType} 数据</span>
    )}
  </div>
);

// 多级嵌套条件的动态文本
const UserInfo = () => (
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
);

// 循环中的动态文本组合
const NotificationList = () => (
  <ul>
    {notifications.map((notification) => (
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
);

// 函数调用返回的动态文本
const PageHeader = () => (
  <div>
    <h1>{getTitle('用户', '管理员')}</h1>
    <p>{getDescription('home') || '暂无描述信息'}</p>
    <span>
      当前状态：{formatStatus('online')}
      {isOnline ? '在线' : '离线'}
    </span>
  </div>
);

// 状态驱动的复杂动态文本
const StepIndicator = () => (
  <div>
    {step === 1 && <p>第一步：请填写基本信息</p>}
    {step === 2 && <p>第二步：请上传必要文件</p>}
    {step === 3 && <p>第三步：请确认提交信息</p>}
    <div>
      进度：{step}/{totalSteps}
      ({Math.round((step / totalSteps) * 100)}% 完成)
    </div>
  </div>
);

// 嵌套三元运算符的动态文本
const OrderStatus = () => (
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
);

export const ComplexJSXExample = () => (
  <div className="complex-jsx-example">
    <TextContainer />
    <ConditionalText isVisible={true} />
    <LoadingState />
    <UserInfo />
    <NotificationList />
    <PageHeader />
    <StepIndicator />
    <OrderStatus />
  </div>
);

export const expectedKeys = {
  content_details: 'neirong_xiangqing',
  show_content: 'xianshi_neirong',
  loading: 'zhengzai_jiazai',
  data: 'shuju',
  loading_failed: 'jiazai_shiban',
  network_error: 'wangluo_cuowu',
  unknown_error: 'weizhi_cuowu',
  success_load: 'chenggong_jiazai',
  items: 'tiao',
  vip_user: 'zunguide_vip_yonghu',
  points: 'jifen',
  normal_user: 'putong_yonghu',
  login_prompt: 'qing_xian_denglu',
  success: 'chenggong',
  warning: 'jinggao',
  error: 'cuowu',
  info: 'xinxi',
  unread: 'weidu',
  user_page: 'yonghu_yemian',
  admin: 'guanliyuan',
  home_description: 'shouye_miaoshu',
  no_description: 'zanwu_miaoshu',
  current_status: 'dangqian_zhuangtai',
  online_status: 'zaixian_zhuangtai',
  offline_status: 'lixian_zhuangtai',
  online: 'zaixian',
  offline: 'lixian',
  step_one: 'diyi_bu',
  basic_info: 'qing_tianxie_jiben_xinxi',
  step_two: 'dier_bu',
  upload_files: 'qing_shangchuan_biyao_wenjian',
  step_three: 'disan_bu',
  confirm_submit: 'qing_queren_tijiao_xinxi',
  progress: 'jindu',
  complete: 'wancheng',
  order_status: 'dingdan_zhuangtai',
  pending: 'daichuli',
  processing: 'chulizhong',
  shipped: 'yifahuo',
  tracking_number: 'kuaidi_danhao',
  delivered: 'yisongda',
  cancelled: 'yiquxiao',
  reason: 'yuanyin',
  user_cancel: 'yonghu_quxiao',
  unknown_status: 'weizhi_zhuangtai'
}; 