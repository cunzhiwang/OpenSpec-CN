/**
 * 技能模板工作流模块
 *
 * 此文件是通过将旧的单体模板文件拆分为以工作流为中心的模块而生成的。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getSyncSpecsSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-sync-specs',
    description: '将变更中的增量规范同步到主规范。当用户想要用增量规范的变更更新主规范而不归档变更时使用。',
    instructions: `将变更中的增量规范同步到主规范。

这是一个**代理驱动**的操作 - 你将读取增量规范并直接编辑主规范以应用更改。这允许智能合并（例如，添加场景而不复制整个需求）。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文推断。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具** 让用户选择。

   显示有增量规范的变更（在 \`specs/\` 目录下）。

   **重要**：不要猜测或自动选择变更。始终让用户选择。

2. **查找增量规范**

   在 \`openspec/changes/<name>/specs/*/spec.md\` 查找增量规范文件。

   每个增量规范文件包含以下部分：
   - \`## ADDED Requirements\` - 要添加的新需求
   - \`## MODIFIED Requirements\` - 对现有需求的更改
   - \`## REMOVED Requirements\` - 要删除的需求
   - \`## RENAMED Requirements\` - 要重命名的需求（FROM:/TO: 格式）

   如果没有找到增量规范，通知用户并停止。

3. **对于每个增量规范，将更改应用到主规范**

   对于在 \`openspec/changes/<name>/specs/<capability>/spec.md\` 有增量规范的每个能力：

   a. **读取增量规范** 以理解预期的更改

   b. **读取主规范** 在 \`openspec/specs/<capability>/spec.md\`（可能还不存在）

   c. **智能应用更改**：

      **ADDED Requirements（添加的需求）：**
      - 如果需求在主规范中不存在 → 添加它
      - 如果需求已存在 → 更新它以匹配（视为隐式 MODIFIED）

      **MODIFIED Requirements（修改的需求）：**
      - 在主规范中找到需求
      - 应用更改 - 这可以是：
        - 添加新场景（不需要复制现有的）
        - 修改现有场景
        - 更改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements（删除的需求）：**
      - 从主规范中删除整个需求块

      **RENAMED Requirements（重命名的需求）：**
      - 找到 FROM 需求，重命名为 TO

   d. **创建新的主规范** 如果能力还不存在：
      - 创建 \`openspec/specs/<capability>/spec.md\`
      - 添加 Purpose 部分（可以简短，标记为 TBD）
      - 添加包含 ADDED 需求的 Requirements 部分

4. **显示摘要**

   应用所有更改后，总结：
   - 更新了哪些能力
   - 做了什么更改（添加/修改/删除/重命名的需求）

**增量规范格式参考**

\`\`\`markdown
## ADDED Requirements

### Requirement: 新功能
系统应当做一些新的事情。

#### Scenario: 基本情况
- **WHEN** 用户做 X
- **THEN** 系统做 Y

## MODIFIED Requirements

### Requirement: 现有功能
#### Scenario: 要添加的新场景
- **WHEN** 用户做 A
- **THEN** 系统做 B

## REMOVED Requirements

### Requirement: 废弃的功能

## RENAMED Requirements

- FROM: \`### Requirement: 旧名称\`
- TO: \`### Requirement: 新名称\`
\`\`\`

**关键原则：智能合并**

与程序化合并不同，你可以应用**部分更新**：
- 要添加场景，只需在 MODIFIED 下包含该场景 - 不要复制现有场景
- 增量代表*意图*，而非批量替换
- 使用你的判断来合理合并更改

**成功时的输出**

\`\`\`
## 规范已同步：<change-name>

更新的主规范：

**<capability-1>**：
- 添加需求："新功能"
- 修改需求："现有功能"（添加了 1 个场景）

**<capability-2>**：
- 创建新的规范文件
- 添加需求："另一个功能"

主规范现已更新。变更保持活跃 - 实现完成后归档。
\`\`\`

**护栏**
- 在进行更改前读取增量和主规范
- 保留增量中未提及的现有内容
- 如果不清楚，要求澄清
- 在进行时显示你正在更改什么
- 操作应该是幂等的 - 运行两次应该给出相同的结果`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxSyncCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: 同步',
    description: '将变更中的增量规范同步到主规范',
    category: '工作流',
    tags: ['workflow', 'specs', 'experimental'],
    content: `将变更中的增量规范同步到主规范。

这是一个**代理驱动**的操作 - 你将读取增量规范并直接编辑主规范以应用更改。这允许智能合并（例如，添加场景而不复制整个需求）。

**输入**：可选在 \`/opsx:sync\` 后指定变更名称（例如，\`/opsx:sync add-auth\`）。如果省略，检查是否可以从对话上下文推断。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具** 让用户选择。

   显示有增量规范的变更（在 \`specs/\` 目录下）。

   **重要**：不要猜测或自动选择变更。始终让用户选择。

2. **查找增量规范**

   在 \`openspec/changes/<name>/specs/*/spec.md\` 查找增量规范文件。

   每个增量规范文件包含以下部分：
   - \`## ADDED Requirements\` - 要添加的新需求
   - \`## MODIFIED Requirements\` - 对现有需求的更改
   - \`## REMOVED Requirements\` - 要删除的需求
   - \`## RENAMED Requirements\` - 要重命名的需求（FROM:/TO: 格式）

   如果没有找到增量规范，通知用户并停止。

3. **对于每个增量规范，将更改应用到主规范**

   对于在 \`openspec/changes/<name>/specs/<capability>/spec.md\` 有增量规范的每个能力：

   a. **读取增量规范** 以理解预期的更改

   b. **读取主规范** 在 \`openspec/specs/<capability>/spec.md\`（可能还不存在）

   c. **智能应用更改**：

      **ADDED Requirements（添加的需求）：**
      - 如果需求在主规范中不存在 → 添加它
      - 如果需求已存在 → 更新它以匹配（视为隐式 MODIFIED）

      **MODIFIED Requirements（修改的需求）：**
      - 在主规范中找到需求
      - 应用更改 - 这可以是：
        - 添加新场景（不需要复制现有的）
        - 修改现有场景
        - 更改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements（删除的需求）：**
      - 从主规范中删除整个需求块

      **RENAMED Requirements（重命名的需求）：**
      - 找到 FROM 需求，重命名为 TO

   d. **创建新的主规范** 如果能力还不存在：
      - 创建 \`openspec/specs/<capability>/spec.md\`
      - 添加 Purpose 部分（可以简短，标记为 TBD）
      - 添加包含 ADDED 需求的 Requirements 部分

4. **显示摘要**

   应用所有更改后，总结：
   - 更新了哪些能力
   - 做了什么更改（添加/修改/删除/重命名的需求）

**增量规范格式参考**

\`\`\`markdown
## ADDED Requirements

### Requirement: 新功能
系统应当做一些新的事情。

#### Scenario: 基本情况
- **WHEN** 用户做 X
- **THEN** 系统做 Y

## MODIFIED Requirements

### Requirement: 现有功能
#### Scenario: 要添加的新场景
- **WHEN** 用户做 A
- **THEN** 系统做 B

## REMOVED Requirements

### Requirement: 废弃的功能

## RENAMED Requirements

- FROM: \`### Requirement: 旧名称\`
- TO: \`### Requirement: 新名称\`
\`\`\`

**关键原则：智能合并**

与程序化合并不同，你可以应用**部分更新**：
- 要添加场景，只需在 MODIFIED 下包含该场景 - 不要复制现有场景
- 增量代表*意图*，而非批量替换
- 使用你的判断来合理合并更改

**成功时的输出**

\`\`\`
## 规范已同步：<change-name>

更新的主规范：

**<capability-1>**：
- 添加需求："新功能"
- 修改需求："现有功能"（添加了 1 个场景）

**<capability-2>**：
- 创建新的规范文件
- 添加需求："另一个功能"

主规范现已更新。变更保持活跃 - 实现完成后归档。
\`\`\`

**护栏**
- 在进行更改前读取增量和主规范
- 保留增量中未提及的现有内容
- 如果不清楚，要求澄清
- 在进行时显示你正在更改什么
- 操作应该是幂等的 - 运行两次应该给出相同的结果`
  };
}
