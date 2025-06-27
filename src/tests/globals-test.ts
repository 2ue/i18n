import {
  globalManager,
  setGlobal,
  getGlobal,
  hasGlobal,
  deleteGlobal,
  resetGlobals,
  GlobalNamespaces
} from '../utils/globals';

/**
 * 测试全局变量管理模块
 */
async function runGlobalManagerTest() {
  try {
    console.log('开始测试全局变量管理模块...');
    console.log('===================================');

    // 重置全局变量，确保干净的测试环境
    resetGlobals();

    // 测试1：基本的设置和获取
    console.log('测试1: 基本的设置和获取');
    console.log('-----------------------------------');

    // 设置全局变量
    setGlobal('test', 'count', 10);
    setGlobal('test', 'message', 'Hello World');
    setGlobal('config', 'debug', true);

    // 获取全局变量
    const count = getGlobal<number>('test', 'count');
    const message = getGlobal<string>('test', 'message');
    const debug = getGlobal<boolean>('config', 'debug');

    console.log(`test.count = ${count}`);
    console.log(`test.message = ${message}`);
    console.log(`config.debug = ${debug}`);
    console.log('-----------------------------------\n');

    // 测试2：检查变量存在性
    console.log('测试2: 检查变量存在性');
    console.log('-----------------------------------');

    console.log(`test.count 是否存在: ${hasGlobal('test', 'count')}`);
    console.log(`test.unknown 是否存在: ${hasGlobal('test', 'unknown')}`);
    console.log(`unknown.key 是否存在: ${hasGlobal('unknown', 'key')}`);
    console.log('-----------------------------------\n');

    // 测试3：获取不存在的值和默认值
    console.log('测试3: 获取不存在的值和默认值');
    console.log('-----------------------------------');

    const unknownValue = getGlobal<string>('test', 'unknown');
    console.log(`test.unknown = ${unknownValue}`);

    const defaultValue = getGlobal<string>('test', 'unknown', 'DEFAULT');
    console.log(`test.unknown (带默认值) = ${defaultValue}`);
    console.log('-----------------------------------\n');

    // 测试4：删除全局变量
    console.log('测试4: 删除全局变量');
    console.log('-----------------------------------');

    console.log(`删除 test.count: ${deleteGlobal('test', 'count')}`);
    console.log(`test.count 是否存在: ${hasGlobal('test', 'count')}`);
    console.log(`删除不存在的变量: ${deleteGlobal('test', 'unknown')}`);
    console.log('-----------------------------------\n');

    // 测试5：命名空间操作
    console.log('测试5: 命名空间操作');
    console.log('-----------------------------------');

    // 添加更多值到test命名空间
    setGlobal('test', 'value1', 100);
    setGlobal('test', 'value2', 200);

    // 获取test命名空间下的所有键
    const testKeys = globalManager.getKeys('test');
    console.log(`test命名空间的键: ${testKeys.join(', ')}`);

    // 获取所有命名空间
    const namespaces = globalManager.getNamespaces();
    console.log(`所有命名空间: ${namespaces.join(', ')}`);

    // 清除test命名空间
    globalManager.clearNamespace('test');
    console.log(`清除test命名空间后的键数量: ${globalManager.getKeys('test').length}`);
    console.log(`config命名空间仍然存在: ${hasGlobal('config', 'debug')}`);
    console.log('-----------------------------------\n');

    // 测试6：类型安全
    console.log('测试6: 类型安全');
    console.log('-----------------------------------');

    // 设置不同类型的值
    setGlobal('types', 'number', 42);
    setGlobal('types', 'string', 'hello');
    setGlobal('types', 'boolean', true);
    setGlobal('types', 'object', { name: 'test', value: 123 });
    setGlobal('types', 'array', [1, 2, 3, 4]);

    // 使用类型安全的方式获取
    const numValue = getGlobal<number>('types', 'number');
    const strValue = getGlobal<string>('types', 'string');
    const boolValue = getGlobal<boolean>('types', 'boolean');
    const objValue = getGlobal<{ name: string, value: number }>('types', 'object');
    const arrValue = getGlobal<number[]>('types', 'array');

    console.log(`数字类型: ${numValue} (${typeof numValue})`);
    console.log(`字符串类型: ${strValue} (${typeof strValue})`);
    console.log(`布尔类型: ${boolValue} (${typeof boolValue})`);
    console.log(`对象类型: ${objValue?.name} (${typeof objValue})`);
    console.log(`数组类型: [${arrValue?.join(', ')}] (${Array.isArray(arrValue)})`);
    console.log('-----------------------------------\n');

    // 测试7：初始化和重置
    console.log('测试7: 初始化和重置');
    console.log('-----------------------------------');

    // 重置所有全局变量
    resetGlobals();
    console.log(`重置后的命名空间数量: ${globalManager.getNamespaces().length}`);

    // 用初始数据初始化
    const initialData = {
      'app': {
        'version': '1.0.0',
        'name': 'i18n-xy'
      },
      'settings': {
        'theme': 'dark'
      }
    };

    globalManager.init(initialData);

    console.log(`初始化后的命名空间: ${globalManager.getNamespaces().join(', ')}`);
    console.log(`app.version = ${getGlobal<string>('app', 'version')}`);
    console.log(`settings.theme = ${getGlobal<string>('settings', 'theme')}`);
    console.log('-----------------------------------\n');

    // 测试8：使用常量命名空间
    console.log('测试8: 使用常量命名空间');
    console.log('-----------------------------------');

    setGlobal(GlobalNamespaces.CONFIG, 'language', 'zh-CN');
    setGlobal(GlobalNamespaces.EXTRACTION, 'count', 42);

    console.log(`CONFIG.language = ${getGlobal<string>(GlobalNamespaces.CONFIG, 'language')}`);
    console.log(`EXTRACTION.count = ${getGlobal<number>(GlobalNamespaces.EXTRACTION, 'count')}`);
    console.log('-----------------------------------\n');

    console.log('全局变量管理模块测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 测试完成后重置全局变量
    resetGlobals();
  }
}

// 运行测试
runGlobalManagerTest().catch(console.error); 