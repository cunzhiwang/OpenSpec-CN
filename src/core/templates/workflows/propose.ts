/**
 * 技能模板工作流模块
 *
 * 此文件是将旧版单体模板文件拆分为
 * 以工作流为中心的模块后生成的。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpsxProposeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-propose',
    description: '一步完成新变更提案及所有工件的生成。当用户想快速描述他们想要构建的内容并获得包含设计、规范和任务的完整提案时使用。',
    instructions: `提出新变更 - 一步完成创建变更和生成所有工件。

我将创建一个包含工件的变更：
- proposal.md（什么和为什么）
- design.md（如何）
- tasks.md（实现步骤）

准备实现时，运行 /opsx:apply

---

**输入**：用户的请求应包含变更名称（kebab-case）或他们想要构建的描述。

**步骤**

1. **如果没有提供明确的输入，询问他们想构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）询问：
   > "你想处理什么变更？描述你想构建或修复的内容。"

   从他们的描述中派生一个 kebab-case 名称（例如，"添加用户认证" → \`add-user-auth\`）。

   **重要**：在不了解用户想要构建什么之前不要继续。

2. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   这将在 \`openspec/changes/<name>/\` 创建一个脚手架变更，包含 \`.openspec.yaml\`。

3. **获取工件构建顺序**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 以获取：
   - \`applyRequires\`：实现前需要的工件 ID 数组（例如，\`["tasks"]\`）
   - \`artifacts\`：所有工件的列表及其状态和依赖项

4. **按顺序创建工件直到可以应用**

   使用 **TodoWrite 工具** 跟踪工件的进度。

   按依赖顺序循环工件（先处理没有待处理依赖项的工件）：

   a. **对于每个处于 \`ready\` 状态（依赖项已满足）的工件**：
      - 获取指令：
        \`\`\`bash
        openspec instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - 指令 JSON 包含：
        - \`context\`：项目背景（对你的约束 - 不要包含在输出中）
        - \`rules\`：工件特定规则（对你的约束 - 不要包含在输出中）
        - \`template\`：用于输出文件的结构
        - \`instruction\`：此工件类型的 schema 特定指导
        - \`outputPath\`：写入工件的位置
        - \`dependencies\`：需要读取以获取上下文的已完成工件
      - 读取任何已完成的依赖文件以获取上下文
      - 使用 \`template\` 作为结构创建工件文件
      - 将 \`context\` 和 \`rules\` 作为约束应用 - 但不要将它们复制到文件中
      - 显示简短进度："已创建 <artifact-id>"

   b. **继续直到所有 \`applyRequires\` 工件完成**
      - 创建每个工件后，重新运行 \`openspec status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中的每个工件 ID 在工件数组中是否具有 \`status: "done"\`
      - 当所有 \`applyRequires\` 工件完成时停止

   c. **如果工件需要用户输入**（上下文不清楚）：
      - 使用 **AskUserQuestion 工具** 澄清
      - 然后继续创建

5. **显示最终状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

完成所有工件后，总结：
- 变更名称和位置
- 已创建工件列表及简要描述
- 就绪状态："所有工件已创建！准备实现。"
- 提示："运行 \`/opsx:apply\` 或让我开始实现任务。"

**工件创建指南**

- 遵循 \`openspec instructions\` 中每种工件类型的 \`instruction\` 字段
- schema 定义每个工件应包含的内容 - 遵循它
- 在创建新工件之前读取依赖工件以获取上下文
- 使用 \`template\` 作为输出文件的结构 - 填写其部分
- **重要**：\`context\` 和 \`rules\` 是对你的约束，不是文件的内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到工件中
  - 这些指导你写什么，但不应出现在输出中

**护栏**
- 创建实现所需的所有工件（由 schema 的 \`apply.requires\` 定义）
- 在创建新工件之前始终读取依赖工件
- 如果上下文严重不清楚，询问用户 - 但更倾向于做出合理决定以保持动力
- 如果该名称的变更已存在，询问用户是否要继续它或创建新的
- 在继续下一个之前验证每个工件文件是否存在`,
    license: 'MIT 许可证',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxProposeCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: 提案',
    description: '提出新变更 - 一步完成创建变更和生成所有工件',
    category: '工作流',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `提出新变更 - 一步完成创建变更和生成所有工件。

我将创建一个包含工件的变更：
- proposal.md（什么和为什么）
- design.md（如何）
- tasks.md（实现步骤）

准备实现时，运行 /opsx:apply

---

**输入**：\`/opsx:propose\` 后的参数是变更名称（kebab-case），或用户想要构建的描述。

**步骤**

1. **如果没有提供输入，询问他们想构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）询问：
   > "你想处理什么变更？描述你想构建或修复的内容。"

   从他们的描述中派生一个 kebab-case 名称（例如，"添加用户认证" → \`add-user-auth\`）。

   **重要**：在不了解用户想要构建什么之前不要继续。

2. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   这将在 \`openspec/changes/<name>/\` 创建一个脚手架变更，包含 \`.openspec.yaml\`。

3. **获取工件构建顺序**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 以获取：
   - \`applyRequires\`：实现前需要的工件 ID 数组（例如，\`["tasks"]\`）
   - \`artifacts\`：所有工件的列表及其状态和依赖项

4. **按顺序创建工件直到可以应用**

   使用 **TodoWrite 工具** 跟踪工件的进度。

   按依赖顺序循环工件（先处理没有待处理依赖项的工件）：

   a. **对于每个处于 \`ready\` 状态（依赖项已满足）的工件**：
      - 获取指令：
        \`\`\`bash
        openspec instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - 指令 JSON 包含：
        - \`context\`：项目背景（对你的约束 - 不要包含在输出中）
        - \`rules\`：工件特定规则（对你的约束 - 不要包含在输出中）
        - \`template\`：用于输出文件的结构
        - \`instruction\`：此工件类型的 schema 特定指导
        - \`outputPath\`：写入工件的位置
        - \`dependencies\`：需要读取以获取上下文的已完成工件
      - 读取任何已完成的依赖文件以获取上下文
      - 使用 \`template\` 作为结构创建工件文件
      - 将 \`context\` 和 \`rules\` 作为约束应用 - 但不要将它们复制到文件中
      - 显示简短进度："已创建 <artifact-id>"

   b. **继续直到所有 \`applyRequires\` 工件完成**
      - 创建每个工件后，重新运行 \`openspec status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中的每个工件 ID 在工件数组中是否具有 \`status: "done"\`
      - 当所有 \`applyRequires\` 工件完成时停止

   c. **如果工件需要用户输入**（上下文不清楚）：
      - 使用 **AskUserQuestion 工具** 澄清
      - 然后继续创建

5. **显示最终状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

完成所有工件后，总结：
- 变更名称和位置
- 已创建工件列表及简要描述
- 就绪状态："所有工件已创建！准备实现。"
- 提示："运行 \`/opsx:apply\` 开始实现。"

**工件创建指南**

- 遵循 \`openspec instructions\` 中每种工件类型的 \`instruction\` 字段
- schema 定义每个工件应包含的内容 - 遵循它
- 在创建新工件之前读取依赖工件以获取上下文
- 使用 \`template\` 作为输出文件的结构 - 填写其部分
- **重要**：\`context\` 和 \`rules\` 是对你的约束，不是文件的内容
  - 不要将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到工件中
  - 这些指导你写什么，但不应出现在输出中

**护栏**
- 创建实现所需的所有工件（由 schema 的 \`apply.requires\` 定义）
- 在创建新工件之前始终读取依赖工件
- 如果上下文严重不清楚，询问用户 - 但更倾向于做出合理决定以保持动力
- 如果该名称的变更已存在，询问用户是否要继续它或创建新的
- 在继续下一个之前验证每个工件文件是否存在`
  };
}
