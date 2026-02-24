# 迁移到 OPSX

本指南帮助您从旧版 OpenSpec 工作流迁移到 OPSX。迁移设计为平滑进行——您现有的工作会被保留，新系统提供更多灵活性。

## 有什么变化？

OPSX 用灵活的、基于行动的方法取代了旧的阶段锁定工作流。以下是关键变化：

| 方面 | 旧版 | OPSX |
|--------|--------|------|
| **命令** | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive` | 默认：`/opsx:propose`、`/opsx:apply`、`/opsx:archive`（扩展工作流命令可选） |
| **工作流** | 一次创建所有制品 | 增量创建或一次性创建——您选择 |
| **回退** | 尴尬的阶段门限 | 自然——随时更新任何制品 |
| **自定义** | 固定结构 | 模式驱动，完全可修改 |
| **配置** | 带标记的 `CLAUDE.md` + `project.md` | `openspec/config.yaml` 中的清洁配置 |

**理念变化：** 工作不是线性的。OPSX 不再假装它是。

---

## 开始之前

### 您现有的工作是安全的

迁移过程以保留为设计目标：

- **`openspec/changes/` 中的活动变更** — 完全保留。您可以使用 OPSX 命令继续它们。
- **已归档的变更** — 不受影响。您的历史保持完整。
- **`openspec/specs/` 中的主规范** — 不受影响。这是您的真相来源。
- **CLAUDE.md、AGENTS.md 等中您的内容** — 保留。只有 OpenSpec 标记块被移除；您写的所有内容都保留。

### 什么会被移除

只有正在被替换的 OpenSpec 管理的文件：

| 内容 | 原因 |
|------|-----|
| 旧版斜杠命令目录/文件 | 被新技能系统替代 |
| `openspec/AGENTS.md` | 过时的工作流触发器 |
| `CLAUDE.md`、`AGENTS.md` 等中的 OpenSpec 标记 | 不再需要 |

**按工具的旧版命令位置**（示例——您的工具可能不同）：

- Claude Code：`.claude/commands/openspec/`
- Cursor：`.cursor/commands/openspec-*.md`
- Windsurf：`.windsurf/workflows/openspec-*.md`
- Cline：`.clinerules/workflows/openspec-*.md`
- Roo：`.roo/commands/openspec-*.md`
- GitHub Copilot：`.github/prompts/openspec-*.prompt.md`（仅 IDE 扩展；Copilot CLI 不支持）
- 以及其他（Augment、Continue、Amazon Q 等）

迁移会检测您配置了哪些工具并清理它们的旧版文件。

移除列表可能看起来很长，但这些都是 OpenSpec 最初创建的文件。您自己的内容永远不会被删除。

### 需要您关注的内容

有一个文件需要手动迁移：

**`openspec/project.md`** — 此文件不会自动删除，因为它可能包含您编写的项目上下文。您需要：

1. 查看其内容
2. 将有用的上下文移动到 `openspec/config.yaml`（见下面的指南）
3. 准备好后删除该文件

**为什么我们做出这个改变：**

旧的 `project.md` 是被动的——智能体可能读取它，可能不读取，可能忘记读取的内容。我们发现可靠性不一致。

新的 `config.yaml` 上下文被**主动注入到每个 OpenSpec 规划请求中**。这意味着当 AI 创建制品时，您的项目约定、技术栈和规则始终存在。更高的可靠性。

**权衡：**

因为上下文被注入到每个请求中，您会想要简洁。专注于真正重要的内容：
- 技术栈和关键约定
- AI 需要知道的非显而易见的约束
- 以前经常被忽略的规则

不用担心做到完美。我们仍在学习什么最有效，随着实验我们会改进上下文注入的工作方式。

---

## 运行迁移

`openspec init` 和 `openspec update` 都会检测旧版文件并引导您完成相同的清理过程。根据您的情况使用合适的命令：

- 新安装默认使用配置文件 `core`（`propose`、`explore`、`apply`、`archive`）。
- 迁移的安装会在需要时写入 `custom` 配置文件来保留您之前安装的工作流。

### 使用 `openspec init`

如果您想添加新工具或重新配置设置哪些工具，运行此命令：

```bash
openspec init
```

init 命令检测旧版文件并引导您完成清理：

```
升级到新版 OpenSpec

OpenSpec 现在使用智能体技能，这是编码智能体中新兴的标准。
这简化了您的设置，同时保持一切照常工作。

要移除的文件
无用户内容需要保留：
  • .claude/commands/openspec/
  • openspec/AGENTS.md

要更新的文件
OpenSpec 标记将被移除，您的内容会保留：
  • CLAUDE.md
  • AGENTS.md

需要您关注
  • openspec/project.md
    我们不会删除此文件。它可能包含有用的项目上下文。

    新的 openspec/config.yaml 有一个用于规划上下文的 "context:" 部分。
    这包含在每个 OpenSpec 请求中，比旧的 project.md 方法
    更可靠。

    查看 project.md，将任何有用的内容移动到 config.yaml 的 context
    部分，然后在准备好后删除该文件。

? 升级并清理旧文件？(Y/n)
```

**当您同意后会发生什么：**

1. 移除旧版斜杠命令目录
2. 从 `CLAUDE.md`、`AGENTS.md` 等中剥离 OpenSpec 标记（您的内容保留）
3. 删除 `openspec/AGENTS.md`
4. 在 `.claude/skills/` 中安装新技能
5. 创建带默认模式的 `openspec/config.yaml`

### 使用 `openspec update`

如果您只想迁移并刷新现有工具到最新版本，运行此命令：

```bash
openspec update
```

update 命令也会检测和清理旧版制品，然后刷新生成的技能/命令以匹配您当前的配置文件和交付设置。

### 非交互式 / CI 环境

对于脚本化迁移：

```bash
openspec init --force --tools claude
```

`--force` 标志跳过提示并自动接受清理。

---

## 将 project.md 迁移到 config.yaml

旧的 `openspec/project.md` 是用于项目上下文的自由格式 markdown 文件。新的 `openspec/config.yaml` 是结构化的——关键是——**注入到每个规划请求中**，所以当 AI 工作时您的约定始终存在。

### 之前（project.md）

```markdown
# 项目上下文

这是一个使用 React 和 Node.js 的 TypeScript 单体仓库。
我们使用 Jest 进行测试并遵循严格的 ESLint 规则。
我们的 API 是 RESTful 的，文档在 docs/api.md。

## 约定

- 所有公共 API 必须保持向后兼容
- 新功能应包含测试
- 使用 Given/When/Then 格式编写规范
```

### 之后（config.yaml）

```yaml
schema: spec-driven

context: |
  技术栈：TypeScript、React、Node.js
  测试：Jest 配合 React Testing Library
  API：RESTful，文档在 docs/api.md
  我们为所有公共 API 保持向后兼容

rules:
  proposal:
    - 为风险变更包含回滚计划
  specs:
    - 使用 Given/When/Then 格式编写场景
    - 在发明新模式之前参考现有模式
  design:
    - 为复杂流程包含序列图
```

### 关键差异

| project.md | config.yaml |
|------------|-------------|
| 自由格式 markdown | 结构化 YAML |
| 一大块文本 | 分离的上下文和每个制品的规则 |
| 不清楚何时使用 | 上下文出现在所有制品中；规则仅出现在匹配的制品中 |
| 无模式选择 | 明确的 `schema:` 字段设置默认工作流 |

### 保留什么，舍弃什么

迁移时要有选择性。问自己："AI 在*每个*规划请求中都需要这个吗？"

**适合放入 `context:` 的内容**
- 技术栈（语言、框架、数据库）
- 关键架构模式（单体仓库、微服务等）
- 非显而易见的约束（"我们不能使用库 X 因为..."）
- 经常被忽略的关键约定

**改为移动到 `rules:` 的内容**
- 制品特定的格式（"在规范中使用 Given/When/Then"）
- 审查标准（"提案必须包含回滚计划"）
- 这些仅出现在匹配的制品中，使其他请求更轻量

**完全省略的内容**
- AI 已经知道的一般最佳实践
- 可以总结的冗长解释
- 不影响当前工作的历史上下文

### 迁移步骤

1. **创建 config.yaml**（如果 init 还没有创建）：
   ```yaml
   schema: spec-driven
   ```

2. **添加您的上下文**（简洁——这会进入每个请求）：
   ```yaml
   context: |
     您的项目背景在这里。
     专注于 AI 真正需要知道的内容。
   ```

3. **添加每个制品的规则**（可选）：
   ```yaml
   rules:
     proposal:
       - 您的提案特定指导
     specs:
       - 您的规范编写规则
   ```

4. **删除 project.md** 一旦您移动了所有有用的内容。

**不要想太多。** 从必要的内容开始并迭代。如果您注意到 AI 遗漏了重要的东西，添加它。如果上下文感觉臃肿，精简它。这是一个活文档。

### 需要帮助？使用这个提示

如果您不确定如何提炼 project.md，询问您的 AI 助手：

```
我正在从 OpenSpec 旧的 project.md 迁移到新的 config.yaml 格式。

这是我当前的 project.md：
[粘贴您的 project.md 内容]

请帮我创建一个 config.yaml，包含：
1. 简洁的 `context:` 部分（这会注入到每个规划请求中，所以保持紧凑——
   专注于技术栈、关键约束和经常被忽略的约定）
2. 如果任何内容是制品特定的，则为特定制品添加 `rules:`（例如，
   "使用 Given/When/Then" 属于 specs 规则，而不是全局上下文）

省略 AI 模型已经知道的任何通用内容。对简洁要无情。
```

AI 会帮助您识别什么是必要的，什么可以精简。

---

## 新命令

命令可用性取决于配置文件：

**默认（`core` 配置文件）：**

| 命令 | 用途 |
|---------|---------|
| `/opsx:propose` | 一步创建变更并生成规划制品 |
| `/opsx:explore` | 无结构地思考想法 |
| `/opsx:apply` | 从 tasks.md 实现任务 |
| `/opsx:archive` | 完成并归档变更 |

**扩展工作流（自定义选择）：**

| 命令 | 用途 |
|---------|---------|
| `/opsx:new` | 开始新变更脚手架 |
| `/opsx:continue` | 创建下一个制品（一次一个） |
| `/opsx:ff` | 快进——一次创建规划制品 |
| `/opsx:verify` | 验证实现是否匹配规范 |
| `/opsx:sync` | 预览/规范合并而不归档 |
| `/opsx:bulk-archive` | 一次归档多个变更 |
| `/opsx:onboard` | 引导式端到端入门工作流 |

使用 `openspec config profile` 启用扩展命令，然后运行 `openspec update`。

### 从旧版的命令映射

| 旧版 | OPSX 等效 |
|--------|-----------------|
| `/openspec:proposal` | `/opsx:propose`（默认）或 `/opsx:new` 然后 `/opsx:ff`（扩展） |
| `/openspec:apply` | `/opsx:apply` |
| `/openspec:archive` | `/opsx:archive` |

### 新功能

这些功能是扩展工作流命令集的一部分。

**细粒度制品创建：**
```
/opsx:continue
```
基于依赖一次创建一个制品。当您想审查每个步骤时使用。

**探索模式：**
```
/opsx:explore
```
在承诺变更之前与伙伴一起思考想法。

---

## 理解新架构

### 从阶段锁定到灵活

旧版工作流强制线性进展：

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   规划       │ ───► │   实现       │ ───► │   归档       │
│   阶段       │      │   阶段       │      │   阶段       │
└──────────────┘      └──────────────┘      └──────────────┘

如果您在实现中发现设计是错误的？
太糟糕了。阶段门限不允许您轻易回退。
```

OPSX 使用行动，而非阶段：

```
         ┌───────────────────────────────────────────────┐
         │           行动（不是阶段）                    │
         │                                               │
         │     new ◄──► continue ◄──► apply ◄──► archive │
         │      │          │           │             │   │
         │      └──────────┴───────────┴─────────────┘   │
         │                    任意顺序                   │
         └───────────────────────────────────────────────┘
```

### 依赖图

制品形成有向图。依赖是启用器，不是门限：

```
                        proposal
                       (根节点)
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
           specs                       design
        (requires:                  (requires:
         proposal)                   proposal)
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                         tasks
                     (requires:
                     specs, design)
```

当您运行 `/opsx:continue` 时，它检查什么就绪并提供下一个制品。您也可以按任意顺序创建多个就绪的制品。

### 技能 vs 命令

旧版系统使用工具特定的命令文件：

```
.claude/commands/openspec/
├── proposal.md
├── apply.md
└── archive.md
```

OPSX 使用新兴的**技能**标准：

```
.claude/skills/
├── openspec-explore/SKILL.md
├── openspec-new-change/SKILL.md
├── openspec-continue-change/SKILL.md
├── openspec-apply-change/SKILL.md
└── ...
```

技能在多个 AI 编码工具中被识别并提供更丰富的元数据。

---

## 继续现有变更

您进行中的变更与 OPSX 命令无缝工作。

**有来自旧版工作流的活动变更？**

```
/opsx:apply add-my-feature
```

OPSX 读取现有制品并从您离开的地方继续。

**想给现有变更添加更多制品？**

```
/opsx:continue add-my-feature
```

根据已存在的内容显示准备创建的内容。

**需要查看状态？**

```bash
openspec status --change add-my-feature
```

---

## 新配置系统

### config.yaml 结构

```yaml
# 必需：新变更的默认模式
schema: spec-driven

# 可选：项目上下文（最大 50KB）
# 注入到所有制品指令中
context: |
  您的项目背景、技术栈、
  约定和约束。

# 可选：每个制品的规则
# 仅注入到匹配的制品中
rules:
  proposal:
    - 包含回滚计划
  specs:
    - 使用 Given/When/Then 格式
  design:
    - 记录回退策略
  tasks:
    - 分解为最多 2 小时的块
```

### 模式解析

确定使用哪个模式时，OPSX 按顺序检查：

1. **CLI 标志**：`--schema <name>`（最高优先级）
2. **变更元数据**：变更目录中的 `.openspec.yaml`
3. **项目配置**：`openspec/config.yaml`
4. **默认**：`spec-driven`

### 可用模式

| 模式 | 制品 | 最适合 |
|--------|-----------|----------|
| `spec-driven` | proposal → specs → design → tasks | 大多数项目 |

列出所有可用模式：

```bash
openspec schemas
```

### 自定义模式

创建您自己的工作流：

```bash
openspec schema init my-workflow
```

或派生现有的：

```bash
openspec schema fork spec-driven my-workflow
```

详情请参阅 [自定义](customization.md)。

---

## 故障排除

### "在非交互模式下检测到旧版文件"

您在 CI 或非交互环境中运行。使用：

```bash
openspec init --force
```

### 迁移后命令未出现

重启您的 IDE。技能在启动时检测。

### "rules 中未知的制品 ID"

检查您的 `rules:` 键是否与模式的制品 ID 匹配：

- **spec-driven**：`proposal`、`specs`、`design`、`tasks`

运行此命令查看有效的制品 ID：

```bash
openspec schemas --json
```

### 配置未被应用

1. 确保文件位于 `openspec/config.yaml`（不是 `.yml`）
2. 验证 YAML 语法
3. 配置更改立即生效——无需重启

### project.md 未迁移

系统有意保留 `project.md`，因为它可能包含您的自定义内容。手动查看它，将有用的部分移动到 `config.yaml`，然后删除它。

### 想看看会清理什么？

运行 init 并拒绝清理提示——您会看到完整的检测摘要而不会进行任何更改。

---

## 快速参考

### 迁移后的文件

```
project/
├── openspec/
│   ├── specs/                    # 未更改
│   ├── changes/                  # 未更改
│   │   └── archive/              # 未更改
│   └── config.yaml               # 新：项目配置
├── .claude/
│   └── skills/                   # 新：OPSX 技能
│       ├── openspec-propose/     # 默认 core 配置文件
│       ├── openspec-explore/
│       ├── openspec-apply-change/
│       └── ...                   # 扩展配置文件添加 new/continue/ff/etc.
├── CLAUDE.md                     # OpenSpec 标记已移除，您的内容保留
└── AGENTS.md                     # OpenSpec 标记已移除，您的内容保留
```

### 已移除的内容

- `.claude/commands/openspec/` — 被 `.claude/skills/` 替代
- `openspec/AGENTS.md` — 过时
- `openspec/project.md` — 迁移到 `config.yaml`，然后删除
- `CLAUDE.md`、`AGENTS.md` 等中的 OpenSpec 标记块

### 命令速查

```text
/opsx:propose      快速开始（默认 core 配置文件）
/opsx:apply        实现任务
/opsx:archive      完成并归档

# 扩展工作流（如果启用）：
/opsx:new          脚手架变更
/opsx:continue     创建下一个制品
/opsx:ff           创建规划制品
```

---

## 获取帮助

- **Discord**：[discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues**：[github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)
- **文档**：[docs/opsx.md](opsx.md) 获取完整的 OPSX 参考
