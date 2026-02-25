/**
 * 技能模板工作流模块
 *
 * 此文件是通过将旧的单体模板文件拆分为以工作流为中心的模块而生成的。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getNewChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-new-change',
    description: '使用实验性产物工作流启动新的 OpenSpec 变更。当用户想要以结构化的逐步方法创建新功能、修复或修改时使用。',
    instructions: `使用实验性产物驱动方法启动新变更。

**输入**：用户的请求应包含变更名称（kebab-case）或他们想要构建内容的描述。

**步骤**

1. **如果没有提供明确的输入，询问他们想构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）询问：
   > "你想处理什么变更？描述你想构建或修复的内容。"

   从他们的描述中派生一个 kebab-case 名称（例如，"添加用户认证" → \`add-user-auth\`）。

   **重要**：在理解用户想构建什么之前不要继续。

2. **确定工作流模式**

   使用默认模式（省略 \`--schema\`），除非用户明确请求不同的工作流。

   **仅在用户提到以下情况时使用不同的模式：**
   - 特定的模式名称 → 使用 \`--schema <name>\`
   - "显示工作流"或"有什么工作流" → 运行 \`openspec schemas --json\` 让他们选择

   **否则**：省略 \`--schema\` 使用默认值。

3. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   仅在用户请求特定工作流时添加 \`--schema <name>\`。
   这会在 \`openspec/changes/<name>/\` 创建一个带有所选模式的脚手架变更。

4. **显示产物状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`
   这显示哪些产物需要创建，哪些已就绪（依赖已满足）。

5. **获取第一个产物的说明**
   第一个产物取决于模式（例如，spec-driven 的 \`proposal\`）。
   检查状态输出以找到状态为 "ready" 的第一个产物。
   \`\`\`bash
   openspec instructions <first-artifact-id> --change "<name>"
   \`\`\`
   这输出创建第一个产物的模板和上下文。

6. **停止并等待用户指示**

**输出**

完成步骤后，总结：
- 变更名称和位置
- 使用的模式/工作流及其产物序列
- 当前状态（0/N 个产物完成）
- 第一个产物的模板
- 提示："准备好创建第一个产物了吗？只需描述这个变更是关于什么的，我会起草它，或者要求我继续。"

**护栏**
- 不要创建任何产物 - 只显示说明
- 不要超出显示第一个产物模板
- 如果名称无效（不是 kebab-case），要求有效名称
- 如果该名称的变更已存在，建议继续该变更
- 如果使用非默认工作流则传递 --schema`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxNewCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: 新建',
    description: '使用实验性产物工作流 (OPSX) 启动新变更',
    category: '工作流',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `使用实验性产物驱动方法启动新变更。

**输入**：\`/opsx:new\` 后的参数是变更名称（kebab-case），或用户想要构建内容的描述。

**步骤**

1. **如果没有提供输入，询问他们想构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）询问：
   > "你想处理什么变更？描述你想构建或修复的内容。"

   从他们的描述中派生一个 kebab-case 名称（例如，"添加用户认证" → \`add-user-auth\`）。

   **重要**：在理解用户想构建什么之前不要继续。

2. **确定工作流模式**

   使用默认模式（省略 \`--schema\`），除非用户明确请求不同的工作流。

   **仅在用户提到以下情况时使用不同的模式：**
   - 特定的模式名称 → 使用 \`--schema <name>\`
   - "显示工作流"或"有什么工作流" → 运行 \`openspec schemas --json\` 让他们选择

   **否则**：省略 \`--schema\` 使用默认值。

3. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   仅在用户请求特定工作流时添加 \`--schema <name>\`。
   这会在 \`openspec/changes/<name>/\` 创建一个带有所选模式的脚手架变更。

4. **显示产物状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`
   这显示哪些产物需要创建，哪些已就绪（依赖已满足）。

5. **获取第一个产物的说明**
   第一个产物取决于模式。检查状态输出以找到状态为 "ready" 的第一个产物。
   \`\`\`bash
   openspec instructions <first-artifact-id> --change "<name>"
   \`\`\`
   这输出创建第一个产物的模板和上下文。

6. **停止并等待用户指示**

**输出**

完成步骤后，总结：
- 变更名称和位置
- 使用的模式/工作流及其产物序列
- 当前状态（0/N 个产物完成）
- 第一个产物的模板
- 提示："准备好创建第一个产物了吗？运行 \`/opsx:continue\` 或只需描述这个变更是关于什么的，我会起草它。"

**护栏**
- 不要创建任何产物 - 只显示说明
- 不要超出显示第一个产物模板
- 如果名称无效（不是 kebab-case），要求有效名称
- 如果该名称的变更已存在，建议使用 \`/opsx:continue\`
- 如果使用非默认工作流则传递 --schema`
  };
}
