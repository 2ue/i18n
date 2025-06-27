# 贡献指南

感谢您对 i18n-xy 项目的关注！我们欢迎各种形式的贡献，包括但不限于功能请求、问题报告、代码贡献、文档改进等。本指南将帮助您了解如何参与项目开发。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [提交代码](#提交代码)
- [测试](#测试)
- [文档](#文档)
- [版本发布流程](#版本发布流程)

## 行为准则

请确保您的行为符合我们的行为准则：

- 尊重所有参与者
- 接受建设性批评
- 关注项目的最佳利益
- 表现出对社区其他成员的同理心

## 如何贡献

### 报告问题

如果您发现了 bug 或有新功能建议，请通过 GitHub Issues 提交：

1. 搜索现有 issues，确保没有重复报告
2. 使用清晰的标题和详细描述创建新 issue
3. 包含重现步骤、预期行为和实际行为
4. 如果可能，提供示例代码或截图

### 提交 Pull Request

1. Fork 项目仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 开发环境设置

### 前提条件

- Node.js (>= 14.x)
- pnpm (>= 7.x)

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/yourusername/i18n-xy.git
cd i18n-xy

# 安装依赖
pnpm install
```

### 项目结构

```
i18n-xy/
├── src/                  # 源代码
│   ├── cli/              # CLI 命令实现
│   ├── core/             # 核心功能模块
│   ├── utils/            # 工具函数
│   └── index.ts          # 入口文件
├── test/                 # 测试文件
├── docs/                 # 文档
├── examples/             # 示例
└── scripts/              # 构建和发布脚本
```

### 本地开发

```bash
# 构建项目
pnpm build

# 链接到全局
pnpm link --global

# 现在可以在任何地方使用 i18n-xy 命令
i18n-xy --help
```

## 提交代码

### 代码风格

我们使用 ESLint 和 Prettier 来保持代码风格一致。提交前请确保您的代码通过了 lint 检查：

```bash
# 运行 lint 检查
pnpm lint

# 自动修复 lint 问题
pnpm lint:fix
```

### 提交消息规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型包括：

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更改
- `style`: 不影响代码含义的更改（空格、格式等）
- `refactor`: 既不修复错误也不添加功能的代码更改
- `perf`: 提高性能的代码更改
- `test`: 添加或修正测试
- `chore`: 对构建过程或辅助工具的更改

示例：

```
feat(cli): 添加新的 translate 命令选项

添加 --format 选项以支持不同的翻译输出格式

Closes #123
```

## 测试

在提交代码前，请确保所有测试都能通过：

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test -- -t "test name pattern"

# 生成测试覆盖率报告
pnpm test:coverage
```

### 添加新测试

为新功能或 bug 修复添加测试。我们使用 Jest 作为测试框架：

- 单元测试放在 `test/unit/` 目录
- 集成测试放在 `test/integration/` 目录
- 测试文件命名为 `*.test.ts`

## 文档

文档是项目的重要组成部分。如果您添加了新功能或更改了现有功能，请确保更新相应的文档：

- `README.md`: 项目概述和基本用法
- `docs/`: 详细文档
  - `config.md`: 配置选项
  - `guide.md`: 用户指南
  - `advanced.md`: 高级用法
  - `examples.md`: 示例

## 版本发布流程

我们使用 [semantic-release](https://github.com/semantic-release/semantic-release) 来自动化版本发布流程：

1. 合并到 `main` 分支的提交会触发 CI 流程
2. 根据提交消息，自动确定版本号
3. 生成变更日志
4. 发布到 npm
5. 创建 GitHub release

### 手动发布（仅限维护者）

```bash
# 确保在 main 分支上
git checkout main
git pull

# 更新版本号
pnpm version [patch|minor|major]

# 发布到 npm
pnpm publish

# 推送标签
git push --follow-tags
```

## 感谢

再次感谢您的贡献！您的参与对于项目的发展至关重要。如有任何问题，请随时在 GitHub Issues 中提问或联系维护者。 