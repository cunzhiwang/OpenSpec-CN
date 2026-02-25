/**
 * 技能模板工作流模块
 *
 * 此文件是通过将旧的单体模板文件拆分为以工作流为中心的模块而生成的。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getContinueChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-continue-change',
    description: '通过创建下一个产物继续处理 OpenSpec 变更。当用户想要推进变更、创建下一个产物或继续工作流时使用。',
    instructions: `通过创建下一个产物继续处理变更。

**输入**：可选指定变更名称。如果省略，检查是否可以从对话上下文推断。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec list --json\` 获取按最近修改排序的可用变更。然后使用 **AskUserQuestion 工具** 让用户选择要处理哪个变更。

   显示最近修改的前 3-4 个变更，包括：
   - 变更名称
   - 模式（来自 \`schema\` 字段，如果存在，否则为 "spec-driven"）
   - 状态（例如，"0/5 任务"，"完成"，"无任务"）
   - 最近修改时间（来自 \`lastModified\` 字段）

   将最近修改的变更标记为 "(推荐)"，因为这可能是用户想继续的。

   **重要**：不要猜测或自动选择变更。始终让用户选择。

2. **检查当前状态**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 以理解当前状态。响应包括：
   - \`schemaName\`：使用的工作流模式（例如，"spec-driven"）
   - \`artifacts\`：产物数组及其状态（"done"、"ready"、"blocked"）
   - \`isComplete\`：布尔值指示所有产物是否完成

3. **根据状态采取行动**：

   ---

   **如果所有产物都完成（\`isComplete: true\`）**：
   - 祝贺用户
   - 显示包括使用模式的最终状态
   - 建议："所有产物已创建！你现在可以实现此变更或归档它。"
   - 停止

   ---

   **如果有产物准备好创建**（状态显示 \`status: "ready"\` 的产物）：
   - 从状态输出中选择第一个 \`status: "ready"\` 的产物
   - 获取其说明：
     \`\`\`bash
     openspec instructions <artifact-id> --change "<name>" --json
     \`\`\`
   - 解析 JSON。关键字段是：
     - \`context\`：项目背景（你的约束 - 不要包含在输出中）
     - \`rules\`：产物特定规则（你的约束 - 不要包含在输出中）
     - \`template\`：用于输出文件的结构
     - \`instruction\`：模式特定指导
     - \`outputPath\`：写入产物的位置
     - \`dependencies\`：已完成的产物用于上下文
   - **创建产物文件**：
     - 读取任何已完成的依赖文件获取上下文
     - 使用 \`template\` 作为结构 - 填充其部分
     - 应用 \`context\` 和 \`rules\` 作为编写约束 - 但不要将它们复制到文件中
     - 写入说明中指定的输出路径
   - 显示创建了什么以及现在解锁了什么
   - 创建一个产物后停止

   ---

   **如果没有产物准备好（全部阻塞）**：
   - 这在有效模式下不应该发生
   - 显示状态并建议检查问题

4. **创建产物后，显示进度**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

每次调用后，显示：
- 创建了哪个产物
- 使用的模式工作流
- 当前进度（N/M 完成）
- 现在解锁了哪些产物
- 提示："想继续吗？只需要求我继续或告诉我接下来做什么。"

**产物创建指南**

产物类型及其目的取决于模式。使用说明输出中的 \`instruction\` 字段来理解要创建什么。

常见产物模式：

**spec-driven 模式**（proposal → specs → design → tasks）：
- **proposal.md**：如果不清楚，询问用户关于变更的信息。填写 Why、What Changes、Capabilities、Impact。
  - Capabilities 部分很关键 - 列出的每个能力都需要一个规范文件。
- **specs/<capability>/spec.md**：为提案 Capabilities 部分列出的每个能力创建一个规范（使用能力名称，而非变更名称）。
- **design.md**：记录技术决策、架构和实现方法。
- **tasks.md**：将实现分解为带复选框的任务。

对于其他模式，遵循 CLI 输出中的 \`instruction\` 字段。

**护栏**
- 每次调用创建一个产物
- 创建新产物前始终读取依赖产物
- 永远不要跳过产物或乱序创建
- 如果上下文不清楚，创建前询问用户
- 写入后标记进度前验证产物文件存在
- 使用模式的产物序列，不要假设特定的产物名称
- **重要**：\`context\` 和 \`rules\` 是你的约束，而非文件的内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到产物中
  - 这些指导你写什么，但永远不应出现在输出中`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxContinueCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: 继续',
    description: '继续处理变更 - 创建下一个产物（实验性）',
    category: '工作流',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `通过创建下一个产物继续处理变更。

**输入**：可在 \`/opsx:continue\` 后选择性指定变更名称（例如，\`/opsx:continue add-auth\`）。如果省略，检查是否可以从对话上下文推断。如果模糊或不明确，你必须提示可用的变更。

**步骤**

1. **如果没有提供变更名称，提示选择**

   运行 \`openspec list --json\` 获取按最近修改排序的可用变更。然后使用 **AskUserQuestion 工具** 让用户选择要处理哪个变更。

   显示最近修改的前 3-4 个变更，包括：
   - 变更名称
   - 模式（来自 \`schema\` 字段，如果存在，否则为 "spec-driven"）
   - 状态（例如，"0/5 任务"，"完成"，"无任务"）
   - 最近修改时间（来自 \`lastModified\` 字段）

   将最近修改的变更标记为 "(推荐)"，因为这可能是用户想继续的。

   **重要**：不要猜测或自动选择变更。始终让用户选择。

2. **检查当前状态**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 以理解当前状态。响应包括：
   - \`schemaName\`：使用的工作流模式（例如，"spec-driven"）
   - \`artifacts\`：产物数组及其状态（"done"、"ready"、"blocked"）
   - \`isComplete\`：布尔值指示所有产物是否完成

3. **根据状态采取行动**：

   ---

   **如果所有产物都完成（\`isComplete: true\`）**：
   - 祝贺用户
   - 显示包括使用模式的最终状态
   - 建议："所有产物已创建！你现在可以用 \`/opsx:apply\` 实现此变更或用 \`/opsx:archive\` 归档它。"
   - 停止

   ---

   **如果有产物准备好创建**（状态显示 \`status: "ready"\` 的产物）：
   - 从状态输出中选择第一个 \`status: "ready"\` 的产物
   - 获取其说明：
     \`\`\`bash
     openspec instructions <artifact-id> --change "<name>" --json
     \`\`\`
   - 解析 JSON。关键字段是：
     - \`context\`：项目背景（你的约束 - 不要包含在输出中）
     - \`rules\`：产物特定规则（你的约束 - 不要包含在输出中）
     - \`template\`：用于输出文件的结构
     - \`instruction\`：模式特定指导
     - \`outputPath\`：写入产物的位置
     - \`dependencies\`：已完成的产物用于上下文
   - **创建产物文件**：
     - 读取任何已完成的依赖文件获取上下文
     - 使用 \`template\` 作为结构 - 填充其部分
     - 应用 \`context\` 和 \`rules\` 作为编写约束 - 但不要将它们复制到文件中
     - 写入说明中指定的输出路径
   - 显示创建了什么以及现在解锁了什么
   - 创建一个产物后停止

   ---

   **如果没有产物准备好（全部阻塞）**：
   - 这在有效模式下不应该发生
   - 显示状态并建议检查问题

4. **创建产物后，显示进度**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

每次调用后，显示：
- 创建了哪个产物
- 使用的模式工作流
- 当前进度（N/M 完成）
- 现在解锁了哪些产物
- 提示："运行 \`/opsx:continue\` 创建下一个产物"

**产物创建指南**

产物类型及其目的取决于模式。使用说明输出中的 \`instruction\` 字段来理解要创建什么。

常见产物模式：

**spec-driven 模式**（proposal → specs → design → tasks）：
- **proposal.md**：如果不清楚，询问用户关于变更的信息。填写 Why、What Changes、Capabilities、Impact。
  - Capabilities 部分很关键 - 列出的每个能力都需要一个规范文件。
- **specs/<capability>/spec.md**：为提案 Capabilities 部分列出的每个能力创建一个规范（使用能力名称，而非变更名称）。
- **design.md**：记录技术决策、架构和实现方法。
- **tasks.md**：将实现分解为带复选框的任务。

对于其他模式，遵循 CLI 输出中的 \`instruction\` 字段。

**护栏**
- 每次调用创建一个产物
- 创建新产物前始终读取依赖产物
- 永远不要跳过产物或乱序创建
- 如果上下文不清楚，创建前询问用户
- 写入后标记进度前验证产物文件存在
- 使用模式的产物序列，不要假设特定的产物名称
- **重要**：\`context\` 和 \`rules\` 是你的约束，而非文件的内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到产物中
  - 这些指导你写什么，但永远不应出现在输出中`
  };
}
