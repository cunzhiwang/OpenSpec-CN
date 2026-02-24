# 工作流

本指南涵盖 OpenSpec 的常见工作流模式以及何时使用每种模式。有关基本设置，请参阅 [快速入门](getting-started.md)。有关命令参考，请参阅 [命令](commands.md)。

## 理念：行动，而非阶段

传统工作流强制您经历各个阶段：规划，然后实施，然后完成。但实际工作并不整齐地装入盒子里。

OPSX 采用不同的方法：

```text
传统 (阶段锁定):

  规划 ────────► 实施 ────────► 完成
      │                    │
      │   "无法回头"       │
      └────────────────────┘

OPSX (灵活行动):

  proposal ──► specs ──► design ──► tasks ──► implement
```

**关键原则：**

- **行动，而非阶段** - 命令是您可以做的事情，而不是您被困住的阶段
- **依赖关系是启用器** - 它们显示什么是可能的，而不是接下来必须做什么

> **自定义:** OPSX 工作流由定义制品序列的模式驱动。有关创建自定义模式的详细信息，请参阅 [自定义](customization.md)。

## 两种模式

### 默认快速路径 (`core` 配置文件)

新安装默认为 `core`，它提供：
- `/opsx:propose`
- `/opsx:explore`
- `/opsx:apply`
- `/opsx:archive`

典型流程：

```text
/opsx:propose ──► /opsx:apply ──► /opsx:archive
```

### 扩展/完整工作流 (自定义选择)

如果您想要显式的脚手架和构建命令 (`/opsx:new`、`/opsx:continue`、`/opsx:ff`、`/opsx:verify`、`/opsx:sync`、`/opsx:bulk-archive`、`/opsx:onboard`)，请使用以下命令启用它们：

```bash
openspec config profile
openspec update
```

## 工作流模式 (扩展模式)

### 快速功能

当您知道要构建什么并且只需要执行时：

```text
/opsx:new ──► /opsx:ff ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

**示例对话：**

```text
您: /opsx:new add-logout-button

AI:  已创建 openspec/changes/add-logout-button/
     准备创建: proposal

您: /opsx:ff

AI:  正在创建所有规划制品...
     ✓ proposal.md
     ✓ specs/
     ✓ design.md
     ✓ tasks.md
     准备好实施了！

您: /opsx:apply

AI:  正在处理任务...
     ✓ 在 header 中添加了登出按钮
     ✓ 实现了会话清除
     ✓ 添加了确认对话框
     所有任务完成！

您: /opsx:archive

AI:  ✓ 已合并规范
     ✓ 已归档变更
```

**最适合：** 中小型功能、错误修复、简单的变更。

### 探索式

当需求不明确或您需要先调查时：

```text
/opsx:explore ──► /opsx:new ──► /opsx:continue ──► ... ──► /opsx:apply
```

**示例对话：**

```text
您: /opsx:explore

AI:  您想探索什么？

您: 我想改善页面加载性能，但我不确定瓶颈在哪里。

AI:  让我帮助调查...
     [分析包大小，识别慢查询，审查组件渲染模式]

     我发现了三个主要瓶颈：
     1. 大型未优化的图像
     2. ProductList 中的同步数据获取
     3. 来自 context 变化的重新渲染

     您想先解决哪个？

您: 让我们解决数据获取问题。

您: /opsx:new optimize-product-list-fetching

AI:  已创建变更。准备创建: proposal

您: /opsx:continue

AI:  根据我们的探索创建提案...
     [编写包含调查见解的提案]

     准备创建: specs, design
     您想要下一个哪个？

您: /opsx:continue

AI:  正在创建 specs...
```

**最适合：** 性能优化、调试、架构决策、不明确的需求。

### 并行变更

同时处理多个变更：

```text
变更 A: /opsx:new ──► /opsx:ff ──► /opsx:apply (进行中)
                                         │
                                    上下文切换
                                         │
变更 B: /opsx:new ──► /opsx:ff ──────► /opsx:apply
```

**示例对话：**

```text
您: 我正在处理 add-dark-mode 但被拉去修复一个 bug

您: /opsx:new fix-login-redirect

AI:  已创建 openspec/changes/fix-login-redirect/

您: /opsx:ff

AI:  ✓ 已创建规划制品

您: /opsx:apply

AI:  正在处理 fix-login-redirect...
     [实施修复]
     所有任务完成！

您: /opsx:archive

AI:  ✓ 已归档 fix-login-redirect

您: 让我们回到深色模式

您: /opsx:apply add-dark-mode

AI:  正在恢复 add-dark-mode...
     从任务 2.3 继续: 更新 Header...
```

**最适合：** 并行工作流、紧急中断、团队协作。

当您有多个已完成的变更时，使用 `/opsx:bulk-archive`：

```text
您: /opsx:bulk-archive

AI:  找到 3 个已完成的变更：
     - add-dark-mode (所有任务已完成)
     - fix-login-redirect (所有任务已完成)
     - update-footer (所有任务已完成)

     检查规范冲突...
     ⚠ add-dark-mode 和 update-footer 都涉及 specs/ui/

     检查代码库以解决...
     两个变更都已实施。将按时间顺序应用。

     归档所有 3 个变更？

您: 是

AI:  ✓ 已归档 add-dark-mode
     ✓ 已归档 fix-login-redirect
     ✓ 已归档 update-footer
     规范按顺序合并: add-dark-mode → update-footer
```

批量归档检测何时多个变更涉及相同的规范，并通过检查实际实施的内容来解决冲突。

### 完成变更

推荐的完成流程：

```text
/opsx:apply ──► /opsx:verify ──► /opsx:archive
                    │                 │
              验证              提示同步
              实施              如果需要
```

#### 验证：检查您的工作

`/opsx:verify` 从三个维度验证实施是否符合您的制品：

```text
您: /opsx:verify

AI:  正在验证 add-auth...

     完整性
     ✓ tasks.md 中的所有 12 个任务都已检查
     ✓ 规范中的所有需求都有相应的代码
     ⚠ 场景 "不活动后会话超时" 没有测试覆盖

     正确性
     ✓ 实施符合规范意图
     ✓ 场景中的边缘情况已处理
     ✓ 错误状态符合规范定义

     一致性
     ✓ 设计决策反映在代码结构中
     ✓ 命名约定与 design.md 一致
     ⚠ 设计提到 "事件驱动" 但实施使用轮询

     摘要
     ─────────────────────────────
     严重问题: 0
     警告: 2
     准备归档: 是 (有警告)

     建议:
     1. 为会话超时场景添加测试
     2. 考虑按设计重构为事件驱动，或更新 design.md
```

**验证检查的内容：**

| 维度 | 验证内容 |
|------|----------|
| 完整性 | 所有任务完成，所有需求已实施，场景已覆盖 |
| 正确性 | 实施符合规范意图，边缘情况已处理 |
| 一致性 | 设计决策反映在代码中，模式一致 |

验证不会阻止归档，但会显示您可能想先解决的问题。

#### 归档：完成变更

`/opsx:archive` 完成变更并将其移动到存档：

```text
您: /opsx:archive

AI:  正在归档 add-auth...

     制品状态：
     ✓ proposal.md 存在
     ✓ specs/ 存在
     ✓ design.md 存在
     ✓ tasks.md 存在 (12/12 任务完成)

     增量规范: 尚未同步到主规范
     → 您想现在同步吗？

您: 是

AI:  ✓ 已将规范同步到 openspec/specs/auth/spec.md
     ✓ 已移动到 openspec/changes/archive/2025-01-24-add-auth/

     变更已成功归档。
```

如果规范未同步，归档会提示。它不会阻止不完整的任务，但会警告您。

## 何时使用什么

### `/opsx:ff` vs `/opsx:continue`

| 情况 | 使用 |
|------|-----|
| 明确的需求，准备构建 | `/opsx:ff` |
| 探索，想要审查每一步 | `/opsx:continue` |
| 想在规范之前迭代提案 | `/opsx:continue` |
| 时间紧迫，需要快速移动 | `/opsx:ff` |
| 复杂变更，想要控制 | `/opsx:continue` |

**经验法则：** 如果您可以预先描述完整范围，使用 `/opsx:ff`。如果您在进行中弄清楚，使用 `/opsx:continue`。

### 何时更新 vs 重新开始

一个常见问题：何时更新现有变更是可以的，何时应该开始新的？

**更新现有变更当：**

- 相同意图，改进执行
- 范围缩小 (先 MVP，其余稍后)
- 学习驱动的修正 (代码库不是您预期的那样)
- 基于实施发现的设计调整

**开始新变更当：**

- 意图根本改变
- 范围扩展到完全不同的工作
- 原始变更可以独立标记为 "完成"
- 补丁会比澄清更混乱

```text
                     ┌─────────────────────────────────────┐
                     │     这是相同的工作吗？              │
                     └──────────────┬──────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          相同意图？          >50% 重叠？       原始变更可以
          相同问题？          相同范围？        在没有这些变更
                 │                  │          的情况下 "完成"？
                 │                  │                  │
       ┌────────┴────────┐  ┌──────┴──────┐   ┌───────┴───────┐
       │                 │  │             │   │               │
      是                否  是           否   否              是
       │                 │  │             │   │               │
       ▼                 ▼  ▼             ▼   ▼               ▼
    更新               新  更新          新  更新            新
```

**示例："添加深色模式"**

- "还需要支持自定义主题" → 新变更 (范围扩展)
- "系统偏好检测比预期更难" → 更新 (相同意图)
- "让我们先发布切换，稍后添加偏好" → 更新然后归档，然后新变更

## 最佳实践

### 保持变更聚焦

每个变更一个逻辑工作单元。如果您正在做 "添加功能 X 并且还重构 Y"，考虑两个单独的变更。

**为什么重要：**
- 更容易审查和理解
- 更干净的存档历史
- 可以独立发布
- 如果需要更简单的回滚

### 对不明确的需求使用 `/opsx:explore`

在提交变更之前，探索问题空间：

```text
您: /opsx:explore

AI:  您想探索什么？

您: 我们应该如何处理 API 的速率限制？

AI:  让我调查您当前的设置和选项...
     [研究代码库，考虑模式]

     我看到三种方法我们可以采用：
     1. 基于中间件 (简单，每端点)
     2. Redis 支持 (可扩展，共享状态)
     3. 每用户令牌桶 (公平，复杂)

     您当前的技术栈建议 #1 或 #2。您的规模是什么？
```

探索在您创建制品之前澄清思维。

### 归档前验证

使用 `/opsx:verify` 检查实施是否与制品匹配：

```text
您: /opsx:verify

AI:  正在验证 add-dark-mode...

     ✓ tasks.md 中的所有任务都已检查
     ✓ 规范中的需求有相应的代码
     ✓ 设计决策反映在实施中

     准备好归档了！
```

在您关闭变更之前捕获不匹配。

### 清晰命名变更

好的名称使 `openspec list` 有用：

```text
好:                            避免:
add-dark-mode                  feature-1
fix-login-redirect             update
optimize-product-query         changes
implement-2fa                  wip
```

## 命令快速参考

有关完整的命令详细信息和选项，请参阅 [命令](commands.md)。

| 命令 | 用途 | 何时使用 |
|------|------|---------|
| `/opsx:propose` | 创建变更 + 规划制品 | 快速默认路径 (`core` 配置文件) |
| `/opsx:explore` | 思考想法 | 不明确的需求，调查 |
| `/opsx:new` | 启动变更脚手架 | 扩展模式，显式制品控制 |
| `/opsx:continue` | 创建下一个制品 | 扩展模式，逐步制品创建 |
| `/opsx:ff` | 创建所有规划制品 | 扩展模式，明确范围 |
| `/opsx:apply` | 实施任务 | 准备写代码 |
| `/opsx:verify` | 验证实施 | 扩展模式，归档前 |
| `/opsx:sync` | 合并增量规范 | 扩展模式，可选 |
| `/opsx:archive` | 完成变更 | 所有工作完成 |
| `/opsx:bulk-archive` | 归档多个变更 | 扩展模式，并行工作 |

## 后续步骤

- [命令](commands.md) - 带选项的完整命令参考
- [概念](concepts.md) - 深入了解规范、制品和模式
- [自定义](customization.md) - 创建自定义工作流
