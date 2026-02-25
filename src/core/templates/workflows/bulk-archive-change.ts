/**
 * 技能模板工作流模块
 *
 * 此文件是通过将旧的单体模板文件拆分为以工作流为中心的模块而生成的。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getBulkArchiveChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-bulk-archive-change',
    description: '一次性归档多个已完成的变更。当归档多个并行变更时使用。',
    instructions: `在单个操作中归档多个已完成的变更。

此技能允许你批量归档变更，通过检查代码库来智能处理规范冲突以确定实际实现了什么。

**输入**：无需（提示选择）

**步骤**

1. **获取活跃变更**

   运行 \`openspec list --json\` 获取所有活跃变更。

   如果没有活跃变更，通知用户并停止。

2. **提示变更选择**

   使用 **AskUserQuestion 工具** 的多选让用户选择变更：
   - 显示每个变更及其模式
   - 包含"所有变更"选项
   - 允许任意数量的选择（1+ 可以，2+ 是典型用例）

   **重要**：不要自动选择。始终让用户选择。

3. **批量验证 - 收集所有选定变更的状态**

   对于每个选定的变更，收集：

   a. **产物状态** - 运行 \`openspec status --change "<name>" --json\`
      - 解析 \`schemaName\` 和 \`artifacts\` 列表
      - 记录哪些产物是 \`done\` 与其他状态

   b. **任务完成** - 读取 \`openspec/changes/<name>/tasks.md\`
      - 计算 \`- [ ]\`（未完成）与 \`- [x]\`（完成）
      - 如果没有任务文件，记为"无任务"

   c. **增量规范** - 检查 \`openspec/changes/<name>/specs/\` 目录
      - 列出存在哪些能力规范
      - 对于每个，提取需求名称（匹配 \`### Requirement: <name>\` 的行）

4. **检测规范冲突**

   构建 \`能力 -> [触及它的变更]\` 映射：

   \`\`\`
   auth -> [change-a, change-b]  <- 冲突（2+ 个变更）
   api  -> [change-c]            <- OK（只有 1 个变更）
   \`\`\`

   当 2+ 个选定变更对同一能力有增量规范时存在冲突。

5. **代理式解决冲突**

   **对于每个冲突**，调查代码库：

   a. **读取增量规范** 从每个冲突的变更以理解每个声称要添加/修改什么

   b. **搜索代码库** 寻找实现证据：
      - 查找实现每个增量规范需求的代码
      - 检查相关文件、函数或测试

   c. **确定解决方案**：
      - 如果只有一个变更实际实现了 -> 同步那个的规范
      - 如果都实现了 -> 按时间顺序应用（旧的先，新的覆盖）
      - 如果都没实现 -> 跳过规范同步，警告用户

   d. **记录每个冲突的解决方案**：
      - 应用哪个变更的规范
      - 什么顺序（如果都要）
      - 理由（在代码库中发现了什么）

6. **显示合并状态表**

   显示汇总所有变更的表格：

   \`\`\`
   | 变更                 | 产物   | 任务 | 规范    | 冲突      | 状态   |
   |---------------------|--------|------|---------|-----------|--------|
   | schema-management   | 完成   | 5/5  | 2 增量  | 无        | 就绪   |
   | project-config      | 完成   | 3/3  | 1 增量  | 无        | 就绪   |
   | add-oauth           | 完成   | 4/4  | 1 增量  | auth (!)  | 就绪*  |
   | add-verify-skill    | 剩 1   | 2/5  | 无      | 无        | 警告   |
   \`\`\`

   对于冲突，显示解决方案：
   \`\`\`
   * 冲突解决：
     - auth 规范：将应用 add-oauth 然后 add-jwt（都已实现，按时间顺序）
   \`\`\`

   对于未完成的变更，显示警告：
   \`\`\`
   警告：
   - add-verify-skill：1 个未完成产物，3 个未完成任务
   \`\`\`

7. **确认批量操作**

   使用 **AskUserQuestion 工具** 进行单次确认：

   - "归档 N 个变更？" 根据状态提供选项
   - 选项可能包括：
     - "归档所有 N 个变更"
     - "只归档 N 个就绪变更（跳过未完成的）"
     - "取消"

   如果有未完成的变更，明确说明它们将带警告归档。

8. **为每个确认的变更执行归档**

   按确定的顺序处理变更（遵循冲突解决）：

   a. **同步规范** 如果存在增量规范：
      - 使用 openspec-sync-specs 方法（代理驱动智能合并）
      - 对于冲突，按解决的顺序应用
      - 跟踪是否完成同步

   b. **执行归档**：
      \`\`\`bash
      mkdir -p openspec/changes/archive
      mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
      \`\`\`

   c. **跟踪每个变更的结果**：
      - 成功：归档成功
      - 失败：归档期间出错（记录错误）
      - 跳过：用户选择不归档（如适用）

9. **显示摘要**

   显示最终结果：

   \`\`\`
   ## 批量归档完成

   归档了 3 个变更：
   - schema-management-cli -> archive/2026-01-19-schema-management-cli/
   - project-config -> archive/2026-01-19-project-config/
   - add-oauth -> archive/2026-01-19-add-oauth/

   跳过了 1 个变更：
   - add-verify-skill（用户选择不归档未完成的）

   规范同步摘要：
   - 4 个增量规范同步到主规范
   - 1 个冲突已解决（auth：按时间顺序应用两个）
   \`\`\`

   如果有任何失败：
   \`\`\`
   失败了 1 个变更：
   - some-change：归档目录已存在
   \`\`\`

**冲突解决示例**

示例 1：只有一个实现了
\`\`\`
冲突：specs/auth/spec.md 被 [add-oauth, add-jwt] 触及

检查 add-oauth：
- 增量添加 "OAuth Provider Integration" 需求
- 搜索代码库... 找到 src/auth/oauth.ts 实现了 OAuth 流程

检查 add-jwt：
- 增量添加 "JWT Token Handling" 需求
- 搜索代码库... 未找到 JWT 实现

解决方案：只有 add-oauth 实现了。将只同步 add-oauth 规范。
\`\`\`

示例 2：都实现了
\`\`\`
冲突：specs/api/spec.md 被 [add-rest-api, add-graphql] 触及

检查 add-rest-api（创建于 2026-01-10）：
- 增量添加 "REST Endpoints" 需求
- 搜索代码库... 找到 src/api/rest.ts

检查 add-graphql（创建于 2026-01-15）：
- 增量添加 "GraphQL Schema" 需求
- 搜索代码库... 找到 src/api/graphql.ts

解决方案：都实现了。将先应用 add-rest-api 规范，
然后 add-graphql 规范（时间顺序，新的优先）。
\`\`\`

**成功时的输出**

\`\`\`
## 批量归档完成

归档了 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/
- <change-2> -> archive/YYYY-MM-DD-<change-2>/

规范同步摘要：
- N 个增量规范同步到主规范
- 无冲突（或：M 个冲突已解决）
\`\`\`

**部分成功时的输出**

\`\`\`
## 批量归档完成（部分）

归档了 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/

跳过了 M 个变更：
- <change-2>（用户选择不归档未完成的）

失败了 K 个变更：
- <change-3>：归档目录已存在
\`\`\`

**无变更时的输出**

\`\`\`
## 无变更可归档

未找到活跃变更。创建新变更以开始。
\`\`\`

**护栏**
- 允许任意数量的变更（1+ 可以，2+ 是典型用例）
- 始终提示选择，永不自动选择
- 尽早检测规范冲突并通过检查代码库解决
- 当两个变更都实现时，按时间顺序应用规范
- 只在实现缺失时跳过规范同步（警告用户）
- 确认前显示清晰的每个变更状态
- 整个批次使用单次确认
- 跟踪并报告所有结果（成功/跳过/失败）
- 移动到归档时保留 .openspec.yaml
- 归档目录目标使用当前日期：YYYY-MM-DD-<name>
- 如果归档目标存在，该变更失败但继续其他的`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxBulkArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: 批量归档',
    description: '一次性归档多个已完成的变更',
    category: '工作流',
    tags: ['workflow', 'archive', 'experimental', 'bulk'],
    content: `在单个操作中归档多个已完成的变更。

此技能允许你批量归档变更，通过检查代码库来智能处理规范冲突以确定实际实现了什么。

**输入**：无需（提示选择）

**步骤**

1. **获取活跃变更**

   运行 \`openspec list --json\` 获取所有活跃变更。

   如果没有活跃变更，通知用户并停止。

2. **提示变更选择**

   使用 **AskUserQuestion 工具** 的多选让用户选择变更：
   - 显示每个变更及其模式
   - 包含"所有变更"选项
   - 允许任意数量的选择（1+ 可以，2+ 是典型用例）

   **重要**：不要自动选择。始终让用户选择。

3. **批量验证 - 收集所有选定变更的状态**

   对于每个选定的变更，收集：

   a. **产物状态** - 运行 \`openspec status --change "<name>" --json\`
      - 解析 \`schemaName\` 和 \`artifacts\` 列表
      - 记录哪些产物是 \`done\` 与其他状态

   b. **任务完成** - 读取 \`openspec/changes/<name>/tasks.md\`
      - 计算 \`- [ ]\`（未完成）与 \`- [x]\`（完成）
      - 如果没有任务文件，记为"无任务"

   c. **增量规范** - 检查 \`openspec/changes/<name>/specs/\` 目录
      - 列出存在哪些能力规范
      - 对于每个，提取需求名称（匹配 \`### Requirement: <name>\` 的行）

4. **检测规范冲突**

   构建 \`能力 -> [触及它的变更]\` 映射：

   \`\`\`
   auth -> [change-a, change-b]  <- 冲突（2+ 个变更）
   api  -> [change-c]            <- OK（只有 1 个变更）
   \`\`\`

   当 2+ 个选定变更对同一能力有增量规范时存在冲突。

5. **代理式解决冲突**

   **对于每个冲突**，调查代码库：

   a. **读取增量规范** 从每个冲突的变更以理解每个声称要添加/修改什么

   b. **搜索代码库** 寻找实现证据：
      - 查找实现每个增量规范需求的代码
      - 检查相关文件、函数或测试

   c. **确定解决方案**：
      - 如果只有一个变更实际实现了 -> 同步那个的规范
      - 如果都实现了 -> 按时间顺序应用（旧的先，新的覆盖）
      - 如果都没实现 -> 跳过规范同步，警告用户

   d. **记录每个冲突的解决方案**：
      - 应用哪个变更的规范
      - 什么顺序（如果都要）
      - 理由（在代码库中发现了什么）

6. **显示合并状态表**

   显示汇总所有变更的表格：

   \`\`\`
   | 变更                 | 产物   | 任务 | 规范    | 冲突      | 状态   |
   |---------------------|--------|------|---------|-----------|--------|
   | schema-management   | 完成   | 5/5  | 2 增量  | 无        | 就绪   |
   | project-config      | 完成   | 3/3  | 1 增量  | 无        | 就绪   |
   | add-oauth           | 完成   | 4/4  | 1 增量  | auth (!)  | 就绪*  |
   | add-verify-skill    | 剩 1   | 2/5  | 无      | 无        | 警告   |
   \`\`\`

   对于冲突，显示解决方案：
   \`\`\`
   * 冲突解决：
     - auth 规范：将应用 add-oauth 然后 add-jwt（都已实现，按时间顺序）
   \`\`\`

   对于未完成的变更，显示警告：
   \`\`\`
   警告：
   - add-verify-skill：1 个未完成产物，3 个未完成任务
   \`\`\`

7. **确认批量操作**

   使用 **AskUserQuestion 工具** 进行单次确认：

   - "归档 N 个变更？" 根据状态提供选项
   - 选项可能包括：
     - "归档所有 N 个变更"
     - "只归档 N 个就绪变更（跳过未完成的）"
     - "取消"

   如果有未完成的变更，明确说明它们将带警告归档。

8. **为每个确认的变更执行归档**

   按确定的顺序处理变更（遵循冲突解决）：

   a. **同步规范** 如果存在增量规范：
      - 使用 openspec-sync-specs 方法（代理驱动智能合并）
      - 对于冲突，按解决的顺序应用
      - 跟踪是否完成同步

   b. **执行归档**：
      \`\`\`bash
      mkdir -p openspec/changes/archive
      mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
      \`\`\`

   c. **跟踪每个变更的结果**：
      - 成功：归档成功
      - 失败：归档期间出错（记录错误）
      - 跳过：用户选择不归档（如适用）

9. **显示摘要**

   显示最终结果：

   \`\`\`
   ## 批量归档完成

   归档了 3 个变更：
   - schema-management-cli -> archive/2026-01-19-schema-management-cli/
   - project-config -> archive/2026-01-19-project-config/
   - add-oauth -> archive/2026-01-19-add-oauth/

   跳过了 1 个变更：
   - add-verify-skill（用户选择不归档未完成的）

   规范同步摘要：
   - 4 个增量规范同步到主规范
   - 1 个冲突已解决（auth：按时间顺序应用两个）
   \`\`\`

   如果有任何失败：
   \`\`\`
   失败了 1 个变更：
   - some-change：归档目录已存在
   \`\`\`

**冲突解决示例**

示例 1：只有一个实现了
\`\`\`
冲突：specs/auth/spec.md 被 [add-oauth, add-jwt] 触及

检查 add-oauth：
- 增量添加 "OAuth Provider Integration" 需求
- 搜索代码库... 找到 src/auth/oauth.ts 实现了 OAuth 流程

检查 add-jwt：
- 增量添加 "JWT Token Handling" 需求
- 搜索代码库... 未找到 JWT 实现

解决方案：只有 add-oauth 实现了。将只同步 add-oauth 规范。
\`\`\`

示例 2：都实现了
\`\`\`
冲突：specs/api/spec.md 被 [add-rest-api, add-graphql] 触及

检查 add-rest-api（创建于 2026-01-10）：
- 增量添加 "REST Endpoints" 需求
- 搜索代码库... 找到 src/api/rest.ts

检查 add-graphql（创建于 2026-01-15）：
- 增量添加 "GraphQL Schema" 需求
- 搜索代码库... 找到 src/api/graphql.ts

解决方案：都实现了。将先应用 add-rest-api 规范，
然后 add-graphql 规范（时间顺序，新的优先）。
\`\`\`

**成功时的输出**

\`\`\`
## 批量归档完成

归档了 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/
- <change-2> -> archive/YYYY-MM-DD-<change-2>/

规范同步摘要：
- N 个增量规范同步到主规范
- 无冲突（或：M 个冲突已解决）
\`\`\`

**部分成功时的输出**

\`\`\`
## 批量归档完成（部分）

归档了 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/

跳过了 M 个变更：
- <change-2>（用户选择不归档未完成的）

失败了 K 个变更：
- <change-3>：归档目录已存在
\`\`\`

**无变更时的输出**

\`\`\`
## 无变更可归档

未找到活跃变更。创建新变更以开始。
\`\`\`

**护栏**
- 允许任意数量的变更（1+ 可以，2+ 是典型用例）
- 始终提示选择，永不自动选择
- 尽早检测规范冲突并通过检查代码库解决
- 当两个变更都实现时，按时间顺序应用规范
- 只在实现缺失时跳过规范同步（警告用户）
- 确认前显示清晰的每个变更状态
- 整个批次使用单次确认
- 跟踪并报告所有结果（成功/跳过/失败）
- 移动到归档时保留 .openspec.yaml
- 归档目录目标使用当前日期：YYYY-MM-DD-<name>
- 如果归档目标存在，该变更失败但继续其他的`
  };
}
