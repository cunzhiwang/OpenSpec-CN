/**
 * 技能模板工作流模块
 *
 * 此文件是通过将旧的单体模板文件拆分为以工作流为中心的模块而生成的。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getFfChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-ff-change',
    description: '快进通过 OpenSpec 产物创建。当用户想要快速创建实现所需的所有产物而不需要逐个步进时使用。',
    instructions: `快进通过产物创建 - 一次性生成开始实现所需的一切。

**输入**：用户的请求应包含变更名称（kebab-case）或他们想要构建内容的描述。

**步骤**

1. **如果没有提供明确的输入，询问他们想构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）询问：
   > "你想处理什么变更？描述你想构建或修复的内容。"

   从他们的描述中派生一个 kebab-case 名称（例如，"添加用户认证" → \`add-user-auth\`）。

   **重要**：在理解用户想构建什么之前不要继续。

2. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   这会在 \`openspec/changes/<name>/\` 创建一个脚手架变更。

3. **获取产物构建顺序**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 获取：
   - \`applyRequires\`：实现前需要的产物 ID 数组（例如，\`["tasks"]\`）
   - \`artifacts\`：所有产物及其状态和依赖的列表

4. **按顺序创建产物直到准备好应用**

   使用 **TodoWrite 工具** 跟踪产物进度。

   按依赖顺序循环处理产物（先处理没有待处理依赖的产物）：

   a. **对于每个 \`ready\`（依赖已满足）的产物**：
      - 获取说明：
        \`\`\`bash
        openspec instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - 说明 JSON 包括：
        - \`context\`：项目背景（你的约束 - 不要包含在输出中）
        - \`rules\`：产物特定规则（你的约束 - 不要包含在输出中）
        - \`template\`：用于输出文件的结构
        - \`instruction\`：此产物类型的模式特定指导
        - \`outputPath\`：写入产物的位置
        - \`dependencies\`：已完成的产物用于上下文
      - 读取任何已完成的依赖文件获取上下文
      - 使用 \`template\` 作为结构创建产物文件
      - 应用 \`context\` 和 \`rules\` 作为约束 - 但不要将它们复制到文件中
      - 显示简短进度："✓ 已创建 <artifact-id>"

   b. **继续直到所有 \`applyRequires\` 产物完成**
      - 创建每个产物后，重新运行 \`openspec status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中的每个产物 ID 在 artifacts 数组中是否都有 \`status: "done"\`
      - 当所有 \`applyRequires\` 产物完成时停止

   c. **如果产物需要用户输入**（上下文不清楚）：
      - 使用 **AskUserQuestion 工具** 澄清
      - 然后继续创建

5. **显示最终状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

完成所有产物后，总结：
- 变更名称和位置
- 创建的产物列表及简要描述
- 准备就绪："所有产物已创建！准备好实现了。"
- 提示："运行 \`/opsx:apply\` 或要求我实现以开始处理任务。"

**产物创建指南**

- 遵循 \`openspec instructions\` 中每个产物类型的 \`instruction\` 字段
- 模式定义每个产物应包含什么 - 遵循它
- 创建新产物前读取依赖产物获取上下文
- 使用 \`template\` 作为输出文件的结构 - 填充其部分
- **重要**：\`context\` 和 \`rules\` 是你的约束，而非文件的内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到产物中
  - 这些指导你写什么，但永远不应出现在输出中

**护栏**
- 创建实现所需的所有产物（由模式的 \`apply.requires\` 定义）
- 创建新产物前始终读取依赖产物
- 如果上下文严重不清楚，询问用户 - 但倾向于做出合理决定以保持势头
- 如果该名称的变更已存在，建议继续该变更
- 写入后继续下一个前验证每个产物文件存在`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxFfCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: 快进',
    description: '创建变更并一次性生成实现所需的所有产物',
    category: '工作流',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `快进通过产物创建 - 生成开始实现所需的一切。

**输入**：\`/opsx:ff\` 后的参数是变更名称（kebab-case），或用户想要构建内容的描述。

**步骤**

1. **如果没有提供输入，询问他们想构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）询问：
   > "你想处理什么变更？描述你想构建或修复的内容。"

   从他们的描述中派生一个 kebab-case 名称（例如，"添加用户认证" → \`add-user-auth\`）。

   **重要**：在理解用户想构建什么之前不要继续。

2. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   这会在 \`openspec/changes/<name>/\` 创建一个脚手架变更。

3. **获取产物构建顺序**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 获取：
   - \`applyRequires\`：实现前需要的产物 ID 数组（例如，\`["tasks"]\`）
   - \`artifacts\`：所有产物及其状态和依赖的列表

4. **按顺序创建产物直到准备好应用**

   使用 **TodoWrite 工具** 跟踪产物进度。

   按依赖顺序循环处理产物（先处理没有待处理依赖的产物）：

   a. **对于每个 \`ready\`（依赖已满足）的产物**：
      - 获取说明：
        \`\`\`bash
        openspec instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - 说明 JSON 包括：
        - \`context\`：项目背景（你的约束 - 不要包含在输出中）
        - \`rules\`：产物特定规则（你的约束 - 不要包含在输出中）
        - \`template\`：用于输出文件的结构
        - \`instruction\`：此产物类型的模式特定指导
        - \`outputPath\`：写入产物的位置
        - \`dependencies\`：已完成的产物用于上下文
      - 读取任何已完成的依赖文件获取上下文
      - 使用 \`template\` 作为结构创建产物文件
      - 应用 \`context\` 和 \`rules\` 作为约束 - 但不要将它们复制到文件中
      - 显示简短进度："✓ 已创建 <artifact-id>"

   b. **继续直到所有 \`applyRequires\` 产物完成**
      - 创建每个产物后，重新运行 \`openspec status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中的每个产物 ID 在 artifacts 数组中是否都有 \`status: "done"\`
      - 当所有 \`applyRequires\` 产物完成时停止

   c. **如果产物需要用户输入**（上下文不清楚）：
      - 使用 **AskUserQuestion 工具** 澄清
      - 然后继续创建

5. **显示最终状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

完成所有产物后，总结：
- 变更名称和位置
- 创建的产物列表及简要描述
- 准备就绪："所有产物已创建！准备好实现了。"
- 提示："运行 \`/opsx:apply\` 开始实现。"

**产物创建指南**

- 遵循 \`openspec instructions\` 中每个产物类型的 \`instruction\` 字段
- 模式定义每个产物应包含什么 - 遵循它
- 创建新产物前读取依赖产物获取上下文
- 使用 \`template\` 作为输出文件的结构 - 填充其部分
- **重要**：\`context\` 和 \`rules\` 是你的约束，而非文件的内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到产物中
  - 这些指导你写什么，但永远不应出现在输出中

**护栏**
- 创建实现所需的所有产物（由模式的 \`apply.requires\` 定义）
- 创建新产物前始终读取依赖产物
- 如果上下文严重不清楚，询问用户 - 但倾向于做出合理决定以保持势头
- 如果该名称的变更已存在，询问用户是想继续它还是创建新的
- 写入后继续下一个前验证每个产物文件存在`
  };
}
