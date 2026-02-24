# 快速入门

本指南介绍安装和初始化 OpenSpec 后的使用方法。有关安装说明，请参阅 [主 README](../README.md#快速开始)。

## 工作原理

OpenSpec 帮助您和您的 AI 编码助手在编写任何代码之前就要构建的内容达成一致。

**默认快速路径 (核心配置文件):**

```text
/opsx:propose ──► /opsx:apply ──► /opsx:archive
```

**扩展路径 (自定义工作流选择):**

```text
/opsx:new ──► /opsx:ff 或 /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

默认的全局配置文件是 `core`，包括 `propose`、`explore`、`apply` 和 `archive`。您可以使用 `openspec config profile` 启用扩展工作流命令，然后运行 `openspec update`。

## OpenSpec 创建的内容

运行 `openspec init` 后，您的项目将具有以下结构:

```
openspec/
├── specs/              # 事实来源 (您的系统行为)
│   └── <domain>/
│       └── spec.md
├── changes/            # 提议的更新 (每个变更一个文件夹)
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/      # 增量规范 (正在变更的内容)
│           └── <domain>/
│               └── spec.md
└── config.yaml         # 项目配置 (可选)
```

**两个关键目录:**

- **`specs/`** - 事实来源。这些规范描述了您的系统当前的行为方式。按领域组织 (例如 `specs/auth/`、`specs/payments/`)。

- **`changes/`** - 提议的修改。每个变更都有自己的文件夹，包含所有相关制品。当变更完成后，其规范会合并到主 `specs/` 目录中。

## 理解制品

每个变更文件夹包含指导工作的制品:

| 制品 | 用途 |
|------|------|
| `proposal.md` | "为什么"和"是什么" - 捕捉意图、范围和方法 |
| `specs/` | 显示 ADDED/MODIFIED/REMOVED 需求的增量规范 |
| `design.md` | "如何" - 技术方法和架构决策 |
| `tasks.md` | 带复选框的实施清单 |

**制品相互构建:**

```
proposal ──► specs ──► design ──► tasks ──► implement
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            在学习过程中更新
```

在实施过程中学到更多内容时，您随时可以返回并完善早期的制品。

## 增量规范工作原理

增量规范是 OpenSpec 中的关键概念。它们显示相对于当前规范的变更内容。

### 格式

增量规范使用章节来指示变更类型:

```markdown
# Auth 增量

## ADDED Requirements

### Requirement: 双因素认证
系统必须在登录时要求第二因素。

#### Scenario: 需要 OTP
- GIVEN 启用了 2FA 的用户
- WHEN 用户提交有效凭据
- THEN 显示 OTP 挑战

## MODIFIED Requirements

### Requirement: 会话超时
系统应在 30 分钟不活动后使会话过期。
(之前: 60 分钟)

#### Scenario: 空闲超时
- GIVEN 已认证的会话
- WHEN 30 分钟过去没有活动
- THEN 会话被使无效

## REMOVED Requirements

### Requirement: 记住我
(已弃用，改用 2FA)
```

### 归档时发生什么

当您归档变更时:

1. **ADDED** 需求被追加到主规范
2. **MODIFIED** 需求替换现有版本
3. **REMOVED** 需求从主规范中删除

变更文件夹移动到 `openspec/changes/archive/` 以供审计历史。

## 示例: 您的第一个变更

让我们演示如何向应用程序添加深色模式。

### 1. 开始变更 (默认)

```text
您: /opsx:propose add-dark-mode

AI:  已创建 openspec/changes/add-dark-mode/
     ✓ proposal.md — 我们为什么这样做，什么在变更
     ✓ specs/       — 需求和场景
     ✓ design.md    — 技术方法
     ✓ tasks.md     — 实施清单
     准备好实施了！
```

如果您启用了扩展工作流配置文件，您也可以分两步执行: `/opsx:new` 然后 `/opsx:ff` (或逐步 `/opsx:continue`)。

### 2. 创建的内容

**proposal.md** - 捕捉意图:

```markdown
# 提案: 添加深色模式

## 意图
用户请求深色模式选项以减少夜间使用时的眼睛疲劳。

## 范围
- 在设置中添加主题切换
- 支持系统偏好检测
- 在 localStorage 中持久化偏好

## 方法
使用 CSS 自定义属性进行主题化，使用 React context 进行状态管理。
```

**specs/ui/spec.md** - 显示新需求的增量:

```markdown
# UI 增量

## ADDED Requirements

### Requirement: 主题选择
系统应允许用户在浅色和深色主题之间选择。

#### Scenario: 手动切换
- GIVEN 任何页面上的用户
- WHEN 用户点击主题切换
- THEN 主题立即切换
- AND 偏好在会话之间持久化

#### Scenario: 系统偏好
- GIVEN 没有保存偏好的用户
- WHEN 应用程序加载
- THEN 使用系统的首选颜色方案
```

**tasks.md** - 实施清单:

```markdown
# 任务

## 1. 主题基础设施
- [ ] 1.1 创建具有浅色/深色状态的 ThemeContext
- [ ] 1.2 添加颜色的 CSS 自定义属性
- [ ] 1.3 实现 localStorage 持久化

## 2. UI 组件
- [ ] 2.1 创建 ThemeToggle 组件
- [ ] 2.2 将切换添加到设置页面
- [ ] 2.3 更新 Header 以包含快速切换

## 3. 样式
- [ ] 3.1 定义深色主题调色板
- [ ] 3.2 更新组件以使用 CSS 变量
```

### 3. 实施

```
您: /opsx:apply

AI:  正在处理任务...
     ✓ 1.1 创建了具有浅色/深色状态的 ThemeContext
     ✓ 1.2 在 globals.css 中添加了 CSS 自定义属性
     ✓ 1.3 实现了 localStorage 持久化
     ✓ 2.1 创建了 ThemeToggle 组件
     ...
     所有任务完成！
```

在实施过程中，如果您发现设计需要调整，只需更新制品并继续。

### 4. 归档

```
您: /opsx:archive

AI:  正在归档 add-dark-mode...
     ✓ 将规范合并到 openspec/specs/ui/spec.md
     ✓ 已移动到 openspec/changes/archive/2025-01-24-add-dark-mode/
     完成！准备好进行下一个功能了。
```

您的增量规范现在是主规范的一部分，记录了您的系统的工作方式。

## 验证和审查

使用 CLI 检查您的变更:

```bash
# 列出活动变更
openspec list

# 查看变更详情
openspec show add-dark-mode

# 验证规范格式
openspec validate add-dark-mode

# 交互式仪表板
openspec view
```

## 后续步骤

- [工作流](workflows.md) - 常见模式以及何时使用每个命令
- [命令](commands.md) - 所有斜杠命令的完整参考
- [概念](concepts.md) - 更深入地理解规范、变更和模式
- [自定义](customization.md) - 让 OpenSpec 按您的方式工作
