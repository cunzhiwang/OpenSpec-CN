# 命令参考

这是 OpenSpec 斜杠命令的参考文档。这些命令在 AI 编码助手的聊天界面中调用（如 Claude Code、Cursor、Windsurf）。

有关工作流模式和何时使用每个命令，请参阅 [工作流](workflows.md)。有关 CLI 命令，请参阅 [CLI](cli.md)。

## 快速参考

### 默认快速路径 (`core` 配置文件)

| 命令 | 用途 |
|---------|---------|
| `/opsx:propose` | 一步创建变更并生成规划制品 |
| `/opsx:explore` | 在承诺变更之前思考想法 |
| `/opsx:apply` | 从变更中实现任务 |
| `/opsx:archive` | 归档已完成的变更 |

### 扩展工作流命令（自定义工作流选择）

| 命令 | 用途 |
|---------|---------|
| `/opsx:new` | 开始新变更脚手架 |
| `/opsx:continue` | 根据依赖创建下一个制品 |
| `/opsx:ff` | 快进：一次创建所有规划制品 |
| `/opsx:verify` | 验证实现是否匹配制品 |
| `/opsx:sync` | 将增量规范合并到主规范 |
| `/opsx:bulk-archive` | 一次归档多个变更 |
| `/opsx:onboard` | 完整工作流的引导式教程 |

默认全局配置文件是 `core`。要启用扩展工作流命令，运行 `openspec config profile`，选择工作流，然后在项目中运行 `openspec update`。

---

## 命令参考

### `/opsx:propose`

一步创建新变更并生成规划制品。这是 `core` 配置文件中的默认起始命令。

**语法：**
```text
/opsx:propose [change-name-or-description]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-name-or-description` | 否 | 短横线命名或纯文本变更描述 |

**功能：**
- 创建 `openspec/changes/<change-name>/`
- 生成实现前所需的制品（对于 `spec-driven`：提案、规范、设计、任务）
- 在变更准备好 `/opsx:apply` 时停止

**示例：**
```text
You: /opsx:propose add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     ✓ proposal.md
     ✓ specs/ui/spec.md
     ✓ design.md
     ✓ tasks.md
     Ready for implementation. Run /opsx:apply.
```

**技巧：**
- 用于最快的端到端路径
- 如果想逐步控制制品，启用扩展工作流并使用 `/opsx:new` + `/opsx:continue`

---

### `/opsx:explore`

在承诺变更之前思考想法、调查问题和澄清需求。

**语法：**
```
/opsx:explore [topic]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `topic` | 否 | 您想探索或调查的内容 |

**功能：**
- 开启无需结构的探索性对话
- 调查代码库以回答问题
- 比较选项和方案
- 创建可视化图表以澄清思路
- 当见解结晶时可转换到 `/opsx:propose`（默认）或 `/opsx:new`（扩展工作流）

**示例：**
```text
You: /opsx:explore

AI:  What would you like to explore?

You: How should we handle authentication for the mobile app?

AI:  Let me investigate your current auth setup...
     [Analyzes codebase]

     I see you're using session-based auth for the web app.
     For mobile, we have three main options:

     1. JWT tokens (stateless, works offline)
     2. OAuth2 (if you need third-party login)
     3. Extend current sessions (simpler, but requires connectivity)

     Your API already has CORS configured. Which direction interests you?

You: Let's go with JWT. Can we start a change for that?

AI:  Ready when you are. Run /opsx:propose add-jwt-auth to begin.
```

**技巧：**
- 当需求不清晰或需要调查时使用
- 探索期间不创建制品
- 适合在决定前比较多种方案
- 可以读取文件和搜索代码库

---

### `/opsx:new`

开始新变更脚手架。创建变更文件夹，等待您使用 `/opsx:continue` 或 `/opsx:ff` 生成制品。

此命令是扩展工作流集的一部分（不包含在默认 `core` 配置文件中）。

**语法：**
```
/opsx:new [change-name] [--schema <schema-name>]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 变更文件夹的名称（如未提供则提示） |
| `--schema` | 否 | 使用的工作流模式（默认：从配置或 `spec-driven`） |

**功能：**
- 创建 `openspec/changes/<change-name>/` 目录
- 在变更文件夹中创建 `.openspec.yaml` 元数据文件
- 显示准备创建的第一个制品模板
- 如未提供则提示变更名称和模式

**创建内容：**
```
openspec/changes/<change-name>/
└── .openspec.yaml    # 变更元数据（模式、创建日期）
```

**示例：**
```
You: /opsx:new add-dark-mode

AI:  Created openspec/changes/add-dark-mode/
     Schema: spec-driven

     Ready to create: proposal
     Use /opsx:continue to create it, or /opsx:ff to create all artifacts.
```

**技巧：**
- 使用描述性名称：`add-feature`、`fix-bug`、`refactor-module`
- 避免通用名称如 `update`、`changes`、`wip`
- 模式也可以在项目配置中设置（`openspec/config.yaml`）

---

### `/opsx:continue`

在依赖链中创建下一个制品。每次创建一个制品，实现增量进展。

**语法：**
```
/opsx:continue [change-name]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要继续的变更（如未提供则从上下文推断） |

**功能：**
- 查询制品依赖图
- 显示哪些制品已就绪与被阻塞
- 创建第一个就绪的制品
- 读取依赖文件获取上下文
- 显示创建后解锁的内容

**示例：**
```
You: /opsx:continue

AI:  Change: add-dark-mode

     Artifact status:
     ✓ proposal    (done)
     ◆ specs       (ready)
     ◆ design      (ready)
     ○ tasks       (blocked - needs: specs)

     Creating specs...

     [Reads proposal.md, creates specs based on requirements]

     ✓ Created openspec/changes/add-dark-mode/specs/ui/spec.md

     Now available: tasks
     Run /opsx:continue to create the next artifact.
```

**技巧：**
- 当您想在继续之前审查每个制品时使用
- 适合想要控制的复杂变更
- 多个制品可能同时就绪
- 您可以在继续之前编辑创建的制品

---

### `/opsx:ff`

快进制品创建。一次创建所有规划制品。

**语法：**
```
/opsx:ff [change-name]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要快进的变更（如未提供则从上下文推断） |

**功能：**
- 按依赖顺序创建所有制品
- 通过待办列表跟踪进度
- 当所有 `apply-required` 制品完成时停止
- 在创建下一个制品前读取每个依赖

**示例：**
```
You: /opsx:ff add-dark-mode

AI:  Fast-forwarding add-dark-mode...

     ✓ Creating proposal.md
     ✓ Creating specs/ui/spec.md
     ✓ Creating design.md
     ✓ Creating tasks.md

     All planning artifacts complete!
     Ready for implementation. Run /opsx:apply to begin.
```

**技巧：**
- 当您清楚要构建什么时使用
- 对于直接的变更比 `/opsx:continue` 更快
- 之后仍可以编辑制品
- 适合中小型功能

---

### `/opsx:apply`

从变更中实现任务。执行任务列表，编写代码并勾选项目。

**语法：**
```
/opsx:apply [change-name]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要实现的变更（如未提供则从上下文推断） |

**功能：**
- 读取 `tasks.md` 并识别未完成的任务
- 逐个执行任务
- 根据需要编写代码、创建文件、运行测试
- 使用复选框 `[x]` 标记任务完成

**示例：**
```
You: /opsx:apply

AI:  Implementing add-dark-mode...

     Reading tasks.md:
     - [ ] 1.1 Create ThemeContext
     - [ ] 1.2 Add CSS custom properties
     - [ ] 1.3 Implement localStorage persistence

     Working on 1.1: Create ThemeContext...
     [Creates src/context/ThemeContext.tsx]

     ✓ 1.1 Complete

     Working on 1.2: Add CSS custom properties...
     [Updates src/styles/globals.css]

     ✓ 1.2 Complete
     ...
```

**技巧：**
- 如果中断可以从中断处恢复
- 通过指定变更名称用于并行变更
- 完成状态在 `tasks.md` 复选框中跟踪

---

### `/opsx:verify`

验证实现是否匹配变更制品。检查完整性、正确性和一致性。

**语法：**
```
/opsx:verify [change-name]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要验证的变更（如未提供则从上下文推断） |

**功能：**
- 从三个维度检查实现质量
- 在代码库中搜索实现证据
- 将问题分类为 CRITICAL、WARNING 或 SUGGESTION
- 不阻止归档，但会显示问题

**验证维度：**

| 维度 | 验证内容 |
|-----------|-------------------|
| **完整性** | 所有任务完成，所有需求已实现，场景已覆盖 |
| **正确性** | 实现匹配规范意图，边缘情况已处理 |
| **一致性** | 设计决策反映在代码中，模式一致 |

**示例：**
```
You: /opsx:verify

AI:  Verifying add-dark-mode...

     COMPLETENESS
     ✓ All 8 tasks in tasks.md are checked
     ✓ All requirements in specs have corresponding code
     ⚠ Scenario "System preference detection" has no test coverage

     CORRECTNESS
     ✓ Implementation matches spec intent
     ✓ Edge cases from scenarios are handled
     ✓ Error states match spec definitions

     COHERENCE
     ✓ Design decisions reflected in code structure
     ✓ Naming conventions consistent with design.md
     ⚠ Design mentions "CSS variables" but implementation uses Tailwind classes

     SUMMARY
     ─────────────────────────────
     Critical issues: 0
     Warnings: 2
     Ready to archive: Yes (with warnings)

     Recommendations:
     1. Add test for system preference detection
     2. Update design.md to reflect Tailwind usage, or refactor to use CSS variables
```

**技巧：**
- 在归档前运行以尽早发现不匹配
- 警告不阻止归档但表示潜在问题
- 适合在提交前审查 AI 的工作
- 可以揭示制品与实现之间的偏差

---

### `/opsx:sync`

**可选命令。** 将变更中的增量规范合并到主规范。归档会在需要时提示同步，所以通常不需要手动运行。

**语法：**
```
/opsx:sync [change-name]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要同步的变更（如未提供则从上下文推断） |

**功能：**
- 从变更文件夹读取增量规范
- 解析 ADDED/MODIFIED/REMOVED/RENAMED 部分
- 将变更合并到主 `openspec/specs/` 目录
- 保留增量中未提及的现有内容
- 不归档变更（保持活动状态）

**示例：**
```text
You: /opsx:sync

AI:  Syncing add-dark-mode delta specs...

     Reading: openspec/changes/add-dark-mode/specs/ui/spec.md
     Target:  openspec/specs/ui/spec.md

     Changes to apply:
     ✓ ADDED: Theme Selection requirement (2 scenarios)
     ✓ ADDED: Accessibility requirement (1 scenario)

     Merging...
     ✓ openspec/specs/ui/spec.md updated

     Change remains active. Run /opsx:archive when ready to complete.
```

**何时手动使用：**

| 场景 | 使用 sync？ |
|----------|-----------|
| 长期运行的变更，想在归档前将规范放入主分支 | 是 |
| 多个并行变更需要更新的基础规范 | 是 |
| 想单独预览/审查合并 | 是 |
| 快速变更，直接归档 | 否（归档会处理） |

**技巧：**
- 同步是智能的，不是复制粘贴
- 可以向现有需求添加场景而不重复
- 同步后变更保持活动（不归档）
- 大多数用户永远不需要直接调用这个命令 — 归档会在需要时提示

---

### `/opsx:archive`

归档已完成的变更。完成变更并将其移动到归档文件夹。

**语法：**
```
/opsx:archive [change-name]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要归档的变更（如未提供则从上下文推断） |

**功能：**
- 检查制品完成状态
- 检查任务完成状态（如未完成则警告）
- 如果尚未同步则提供同步增量规范
- 将变更文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`
- 保留所有制品用于审计追踪

**示例：**
```text
You: /opsx:archive

AI:  Archiving add-dark-mode...

     Artifact status:
     ✓ proposal.md exists
     ✓ specs/ exists
     ✓ design.md exists
     ✓ tasks.md exists (8/8 tasks complete)

     Delta specs: Not yet synced
     → Sync now? (recommended)

You: Yes

AI:  ✓ Synced specs to openspec/specs/ui/spec.md
     ✓ Moved to openspec/changes/archive/2025-01-24-add-dark-mode/

     Change archived successfully.
```

**技巧：**
- 归档不会因未完成的任务而阻塞，但会警告
- 增量规范可以在归档期间或之前同步
- 归档的变更被保留用于历史记录
- 先使用 `/opsx:verify` 以发现问题

---

### `/opsx:bulk-archive`

一次归档多个已完成的变更。处理变更之间的规范冲突。

**语法：**
```
/opsx:bulk-archive [change-names...]
```

**参数：**
| 参数 | 必需 | 描述 |
|----------|----------|-------------|
| `change-names` | 否 | 要归档的特定变更（如未提供则提示选择） |

**功能：**
- 列出所有已完成的变更
- 归档前验证每个变更
- 检测变更之间的规范冲突
- 通过检查实际实现来解决冲突
- 按时间顺序归档

**示例：**
```
You: /opsx:bulk-archive

AI:  Found 3 completed changes:
     - add-dark-mode (8/8 tasks complete)
     - fix-login-bug (3/3 tasks complete)
     - update-footer (2/2 tasks complete)

     Checking for spec conflicts...
     ⚠ add-dark-mode and update-footer both touch specs/ui/

     Inspecting codebase to resolve...
     Both changes are implemented. Will merge in chronological order:
     1. add-dark-mode (created Jan 20)
     2. update-footer (created Jan 22)

     Archive all 3 changes?

You: Yes

AI:  ✓ Archived add-dark-mode
     ✓ Archived fix-login-bug
     ✓ Archived update-footer
     Specs merged: add-dark-mode → update-footer
```

**技巧：**
- 适合并行工作流
- 冲突解决是智能的（检查代码库）
- 按创建顺序归档变更
- 覆盖规范内容前会提示

---

### `/opsx:onboard`

完整 OpenSpec 工作流的引导式入门。使用您的实际代码库的交互式教程。

**语法：**
```
/opsx:onboard
```

**功能：**
- 带讲解地完整执行一个工作流周期
- 扫描您的代码库寻找真实的改进机会
- 创建包含真实制品的实际变更
- 实现实际工作（小的、安全的变更）
- 归档完成的变更
- 在每个步骤发生时解释

**阶段：**
1. 欢迎和代码库分析
2. 寻找改进机会
3. 创建变更（`/opsx:new`）
4. 编写提案
5. 创建规范
6. 编写设计
7. 创建任务
8. 实现任务（`/opsx:apply`）
9. 验证实现
10. 归档变更
11. 总结和后续步骤

**示例：**
```
You: /opsx:onboard

AI:  Welcome to OpenSpec!

     I'll walk you through the complete workflow using your actual codebase.
     We'll find something small to improve, create a proper change for it,
     implement it, and archive it.

     Let me scan your codebase for opportunities...

     [Analyzes codebase]

     I found a few things we could work on:
     1. Add input validation to the contact form
     2. Improve error messages in the auth flow
     3. Add loading states to async buttons

     Which interests you? (or suggest something else)
```

**技巧：**
- 最适合学习工作流的新用户
- 使用真实代码，不是示例
- 创建您可以保留或丢弃的真实变更
- 完成需要 15-30 分钟

---

## 按 AI 工具的命令语法

不同的 AI 工具使用略有不同的命令语法。使用与您的工具匹配的格式：

| 工具 | 语法示例 |
|------|----------------|
| Claude Code | `/opsx:propose`、`/opsx:apply` |
| Cursor | `/opsx-propose`、`/opsx-apply` |
| Windsurf | `/opsx-propose`、`/opsx-apply` |
| Copilot (IDE) | `/opsx-propose`、`/opsx-apply` |
| Trae | 基于技能的调用如 `/openspec-propose`、`/openspec-apply-change`（无生成的 `opsx-*` 命令文件） |

意图在各工具中相同，但命令的呈现方式可能因集成而异。

> **注意：** GitHub Copilot 命令（`.github/prompts/*.prompt.md`）仅在 IDE 扩展中可用（VS Code、JetBrains、Visual Studio）。GitHub Copilot CLI 目前不支持自定义提示文件 — 详情和解决方法请参阅 [支持的工具](supported-tools.md)。

---

## 旧版命令

这些命令使用较旧的"一次性"工作流。它们仍然有效，但推荐使用 OPSX 命令。

| 命令 | 功能 |
|---------|--------------|
| `/openspec:proposal` | 一次创建所有制品（提案、规范、设计、任务） |
| `/openspec:apply` | 实现变更 |
| `/openspec:archive` | 归档变更 |

**何时使用旧版命令：**
- 使用旧工作流的现有项目
- 不需要增量制品创建的简单变更
- 偏好一次性方法

**迁移到 OPSX：**
旧版变更可以继续使用 OPSX 命令。制品结构是兼容的。

---

## 故障排除

### "变更未找到"

命令无法识别要处理的变更。

**解决方案：**
- 明确指定变更名称：`/opsx:apply add-dark-mode`
- 检查变更文件夹是否存在：`openspec list`
- 验证您在正确的项目目录中

### "没有就绪的制品"

所有制品要么已完成，要么因缺少依赖而被阻塞。

**解决方案：**
- 运行 `openspec status --change <name>` 查看阻塞原因
- 检查所需制品是否存在
- 先创建缺少的依赖制品

### "模式未找到"

指定的模式不存在。

**解决方案：**
- 列出可用模式：`openspec schemas`
- 检查模式名称拼写
- 如果是自定义模式则创建：`openspec schema init <name>`

### 命令未被识别

AI 工具不识别 OpenSpec 命令。

**解决方案：**
- 确保 OpenSpec 已初始化：`openspec init`
- 重新生成技能：`openspec update`
- 检查 `.claude/skills/` 目录是否存在（对于 Claude Code）
- 重启 AI 工具以获取新技能

### 制品未正确生成

AI 创建了不完整或不正确的制品。

**解决方案：**
- 在 `openspec/config.yaml` 中添加项目上下文
- 为特定指导添加每个制品的规则
- 在变更描述中提供更多细节
- 使用 `/opsx:continue` 而非 `/opsx:ff` 以获得更多控制

---

## 后续步骤

- [工作流](workflows.md) - 常见模式及何时使用每个命令
- [CLI](cli.md) - 管理和验证的终端命令
- [自定义](customization.md) - 创建自定义模式和工作流
