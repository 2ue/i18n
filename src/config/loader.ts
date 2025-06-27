import fs from 'fs-extra';
import path from 'path';
import * as _ from 'lodash';
import { Config } from '../types/config';
import { defaultConfig } from './defaults';

/**
 * 支持的配置文件类型
 */
const CONFIG_FILE_EXTENSIONS = ['.ts', '.js', '.json'];

/**
 * 配置文件名，按优先级顺序
 */
const CONFIG_FILE_NAMES = ['i18n-xy.config', '.i18n-xyrc'];

/**
 * 加载配置文件
 * @param configPath 可选的配置文件路径
 * @returns 合并后的配置
 */
export function loadConfig(configPath?: string): Config {
  let userConfig: Partial<Config> = {};

  // 如果提供了配置文件路径，直接尝试加载
  if (configPath) {
    userConfig = loadConfigFile(configPath);
    if (Object.keys(userConfig).length === 0) {
      throw new Error(`无法加载配置文件: ${configPath}`);
    }
  } else {
    // 否则按照优先级查找配置文件
    userConfig = findAndLoadConfig();
  }

  // 合并用户配置与默认配置
  const finalConfig = _.merge({}, defaultConfig, userConfig);

  // 处理环境变量覆盖
  applyEnvironmentVariables(finalConfig);

  return finalConfig;
}

/**
 * 查找并加载配置文件
 * @returns 用户配置对象
 */
function findAndLoadConfig(): Partial<Config> {
  const cwd = process.cwd();

  // 按优先级查找配置文件
  for (const fileName of CONFIG_FILE_NAMES) {
    for (const ext of CONFIG_FILE_EXTENSIONS) {
      const filePath = path.resolve(cwd, `${fileName}${ext}`);
      if (fs.existsSync(filePath)) {
        try {
          return loadConfigFile(filePath);
        } catch (error) {
          console.error(`读取配置文件 ${filePath} 失败:`, error);
        }
      }
    }
  }

  return {};
}

/**
 * 加载指定路径的配置文件
 * @param filePath 配置文件路径
 * @returns 配置对象
 */
function loadConfigFile(filePath: string): Partial<Config> {
  const ext = path.extname(filePath).toLowerCase();

  try {
    // 根据文件扩展名加载不同格式的配置文件
    if (ext === '.json') {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } else if (ext === '.js' || ext === '.ts') {
      // 对于 js/ts 文件，直接 require
      // 注意：对于 .ts 文件，需要确保已经安装和配置了 ts-node
      try {
        // 尝试使用 require
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const config = require(filePath);
        return config.default || config;
      } catch (error) {
        throw new Error(`加载 ${filePath} 失败，可能需要安装 ts-node: ${error}`);
      }
    }

    throw new Error(`不支持的配置文件格式: ${ext}`);
  } catch (error) {
    console.error(`读取配置文件 ${filePath} 失败:`, error);
    return {};
  }
}

/**
 * 应用环境变量覆盖配置
 * @param config 配置对象
 */
function applyEnvironmentVariables(config: Config): void {
  // 处理日志级别环境变量
  if (process.env.I18N_XY_LOG_LEVEL) {
    const level = process.env.I18N_XY_LOG_LEVEL.toLowerCase();
    if (['minimal', 'normal', 'verbose'].includes(level)) {
      config.logging.level = level as 'minimal' | 'normal' | 'verbose';
    }
  }

  // 处理输出目录环境变量
  if (process.env.I18N_XY_OUTPUT_DIR) {
    config.outputDir = process.env.I18N_XY_OUTPUT_DIR;
  }

  // 百度翻译 API 凭证
  if (process.env.BAIDU_TRANSLATE_APPID) {
    config.translation.baidu.appid = process.env.BAIDU_TRANSLATE_APPID;
  }
  if (process.env.BAIDU_TRANSLATE_KEY) {
    config.translation.baidu.key = process.env.BAIDU_TRANSLATE_KEY;
  }
} 