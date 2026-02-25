/**
 * 技能模板工作流模块
 *
 * 此文件是通过将旧的单体模板文件拆分为以工作流为中心的模块而生成的。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getArchiveChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-archive-change',
    description: '在实验性工作流中归档已完成的变更。当用户想要在实现完成后最终确定并归档变更时使用。',
    instructions: `在实验性工作流中归档已完成的变更。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文推断。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具** 让用户选择。

   只显示活跃变更（尚未归档的）。
   如果可用，包括每个变更使用的模式。

   **重要**：不要猜测或自动选择变更。始终让用户选择。

2. **检查产物完成状态**

   运行 \`openspec status --change "<name>" --json\` 检查产物完成情况。

   解析 JSON 以理解：
   - \`schemaName\`：使用的工作流
   - \`artifacts\`：产物列表及其状态（\`done\` 或其他）

   **如果有产物未 \`done\`：**
   - 显示警告列出未完成的产物
   - 使用 **AskUserQuestion 工具** 确认用户是否要继续
   - 如果用户确认则继续

3. **检查任务完成状态**

   读取任务文件（通常是 \`tasks.md\`）检查未完成的任务。

   计算标记为 \`- [ ]\`（未完成）与 \`- [x]\`（完成）的任务。

   **如果发现未完成的任务：**
   - 显示警告显示未完成任务数量
   - 使用 **AskUserQuestion 工具** 确认用户是否要继续
   - 如果用户确认则继续

   **如果没有任务文件：** 无需任务相关警告继续。

4. **评估增量规范同步状态**

   检查 \`openspec/changes/<name>/specs/\` 中的增量规范。如果不存在，无需同步提示继续。

   **如果存在增量规范：**
   - 将每个增量规范与其对应的主规范在 \`openspec/specs/<capability>/spec.md\` 比较
   - 确定将应用什么更改（添加、修改、删除、重命名）
   - 在提示前显示组合摘要

   **提示选项：**
   - 如果需要更改："立即同步（推荐）"、"不同步直接归档"
   - 如果已同步："立即归档"、"仍然同步"、"取消"

   如果用户选择同步，使用 Task 工具（subagent_type: "general-purpose", prompt: "使用 Skill 工具为变更 '<name>' 调用 openspec-sync-specs。增量规范分析：<包含分析的增量规范摘要>"）。无论选择如何都继续归档。

5. **执行归档**

   如果归档目录不存在则创建：
   \`\`\`bash
   mkdir -p openspec/changes/archive
   \`\`\`

   使用当前日期生成目标名称：\`YYYY-MM-DD-<change-name>\`

   **检查目标是否已存在：**
   - 如果是：失败并显示错误，建议重命名现有归档或使用不同日期
   - 如果否：将变更目录移动到归档

   \`\`\`bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

6. **显示摘要**

   显示归档完成摘要，包括：
   - 变更名称
   - 使用的模式
   - 归档位置
   - 规范是否已同步（如适用）
   - 关于任何警告的说明（未完成的产物/任务）

**成功时的输出**

\`\`\`
## 归档完成

**变更：** <change-name>
**模式：** <schema-name>
**归档到：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** ✓ 已同步到主规范（或"无增量规范"或"跳过同步"）

所有产物完成。所有任务完成。
\`\`\`

**护栏**
- 如果未提供则始终提示变更选择
- 使用产物图（openspec status --json）进行完成检查
- 不要因警告阻止归档 - 只是通知并确认
- 移动到归档时保留 .openspec.yaml（它随目录移动）
- 显示清晰的发生了什么的摘要
- 如果请求同步，使用 openspec-sync-specs 方法（代理驱动）
- 如果存在增量规范，始终运行同步评估并在提示前显示组合摘要`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: 归档',
    description: '在实验性工作流中归档已完成的变更',
    category: '工作流',
    tags: ['workflow', 'archive', 'experimental'],
    content: `在实验性工作流中归档已完成的变更。

**输入**：可选在 \`/opsx:archive\` 后指定变更名称（例如，\`/opsx:archive add-auth\`）。如果省略，检查是否可以从对话上下文推断。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具** 让用户选择。

   只显示活跃变更（尚未归档的）。
   如果可用，包括每个变更使用的模式。

   **重要**：不要猜测或自动选择变更。始终让用户选择。

2. **检查产物完成状态**

   运行 \`openspec status --change "<name>" --json\` 检查产物完成情况。

   解析 JSON 以理解：
   - \`schemaName\`：使用的工作流
   - \`artifacts\`：产物列表及其状态（\`done\` 或其他）

   **如果有产物未 \`done\`：**
   - 显示警告列出未完成的产物
   - 提示用户确认是否继续
   - 如果用户确认则继续

3. **检查任务完成状态**

   读取任务文件（通常是 \`tasks.md\`）检查未完成的任务。

   计算标记为 \`- [ ]\`（未完成）与 \`- [x]\`（完成）的任务。

   **如果发现未完成的任务：**
   - 显示警告显示未完成任务数量
   - 提示用户确认是否继续
   - 如果用户确认则继续

   **如果没有任务文件：** 无需任务相关警告继续。

4. **评估增量规范同步状态**

   检查 \`openspec/changes/<name>/specs/\` 中的增量规范。如果不存在，无需同步提示继续。

   **如果存在增量规范：**
   - 将每个增量规范与其对应的主规范在 \`openspec/specs/<capability>/spec.md\` 比较
   - 确定将应用什么更改（添加、修改、删除、重命名）
   - 在提示前显示组合摘要

   **提示选项：**
   - 如果需要更改："立即同步（推荐）"、"不同步直接归档"
   - 如果已同步："立即归档"、"仍然同步"、"取消"

   如果用户选择同步，使用 Task 工具（subagent_type: "general-purpose", prompt: "使用 Skill 工具为变更 '<name>' 调用 openspec-sync-specs。增量规范分析：<包含分析的增量规范摘要>"）。无论选择如何都继续归档。

5. **执行归档**

   如果归档目录不存在则创建：
   \`\`\`bash
   mkdir -p openspec/changes/archive
   \`\`\`

   使用当前日期生成目标名称：\`YYYY-MM-DD-<change-name>\`

   **检查目标是否已存在：**
   - 如果是：失败并显示错误，建议重命名现有归档或使用不同日期
   - 如果否：将变更目录移动到归档

   \`\`\`bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

6. **显示摘要**

   显示归档完成摘要，包括：
   - 变更名称
   - 使用的模式
   - 归档位置
   - 规范同步状态（已同步/跳过同步/无增量规范）
   - 关于任何警告的说明（未完成的产物/任务）

**成功时的输出**

\`\`\`
## 归档完成

**变更：** <change-name>
**模式：** <schema-name>
**归档到：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** ✓ 已同步到主规范

所有产物完成。所有任务完成。
\`\`\`

**成功时的输出（无增量规范）**

\`\`\`
## 归档完成

**变更：** <change-name>
**模式：** <schema-name>
**归档到：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** 无增量规范

所有产物完成。所有任务完成。
\`\`\`

**带警告的成功输出**

\`\`\`
## 归档完成（带警告）

**变更：** <change-name>
**模式：** <schema-name>
**归档到：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** 跳过同步（用户选择跳过）

**警告：**
- 归档时有 2 个未完成的产物
- 归档时有 3 个未完成的任务
- 增量规范同步已跳过（用户选择跳过）

如果这不是有意的，请检查归档。
\`\`\`

**错误时的输出（归档已存在）**

\`\`\`
## 归档失败

**变更：** <change-name>
**目标：** openspec/changes/archive/YYYY-MM-DD-<name>/

目标归档目录已存在。

**选项：**
1. 重命名现有归档
2. 如果是重复的则删除现有归档
3. 等到不同的日期再归档
\`\`\`

**护栏**
- 如果未提供则始终提示变更选择
- 使用产物图（openspec status --json）进行完成检查
- 不要因警告阻止归档 - 只是通知并确认
- 移动到归档时保留 .openspec.yaml（它随目录移动）
- 显示清晰的发生了什么的摘要
- 如果请求同步，使用 Skill 工具调用 \`openspec-sync-specs\`（代理驱动）
- 如果存在增量规范，始终运行同步评估并在提示前显示组合摘要`
  };
}
