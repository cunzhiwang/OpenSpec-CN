<p align="center">
  <a href="https://github.com/Fission-AI/OpenSpec">
    <picture>
      <source srcset="assets/openspec_bg.png">
      <img src="assets/openspec_bg.png" alt="OpenSpec logo">
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Fission-AI/OpenSpec/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@fission-ai/openspec"><img alt="npm version" src="https://img.shields.io/npm/v/@fission-ai/openspec?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
  <a href="https://discord.gg/YctCnvvshC"><img alt="Discord" src="https://img.shields.io/discord/1411657095639601154?style=flat-square&logo=discord&logoColor=white&label=Discord&suffix=%20online" /></a>
</p>

<details>
<summary><strong>最受欢迎的规范框架。</strong></summary>

[![Stars](https://img.shields.io/github/stars/Fission-AI/OpenSpec?style=flat-square&label=Stars)](https://github.com/Fission-AI/OpenSpec/stargazers)
[![Downloads](https://img.shields.io/npm/dm/@fission-ai/openspec?style=flat-square&label=Downloads/mo)](https://www.npmjs.com/package/@fission-ai/openspec)
[![Contributors](https://img.shields.io/github/contributors/Fission-AI/OpenSpec?style=flat-square&label=Contributors)](https://github.com/Fission-AI/OpenSpec/graphs/contributors)

</details>
<p></p>
我们的理念：

```text
→ 灵活而非僵化
→ 迭代而非瀑布式
→ 简单而非复杂
→ 为现有项目构建，而非仅为新项目
→ 从个人项目到企业可扩展
```

> [!TIP]
> **新工作流现已推出！** 我们用新的制品引导工作流重建了 OpenSpec。
>
> 运行 `/opsx:propose "您的想法"` 开始使用。→ [在此了解更多](docs/opsx.md)

<p align="center">
  在 <a href="https://x.com/0xTab">X 上关注 @0xTab</a> 获取更新 · 加入 <a href="https://discord.gg/YctCnvvshC">OpenSpec Discord</a> 获取帮助和问题。
</p>

### 团队

在团队中使用 OpenSpec？[发送邮件](mailto:teams@openspec.dev) 获取我们 Slack 频道的访问权限。

<!-- TODO: Add GIF demo of /opsx:propose → /opsx:archive workflow -->

## 实际演示

```text
您: /opsx:propose add-dark-mode
AI:  已创建 openspec/changes/add-dark-mode/
     ✓ proposal.md — 我们为什么这样做，什么在变更
     ✓ specs/       — 需求和场景
     ✓ design.md    — 技术方法
     ✓ tasks.md     — 实施清单
     准备好实施了！

您: /opsx:apply
AI:  正在实施任务...
     ✓ 1.1 添加主题上下文提供者
     ✓ 1.2 创建切换组件
     ✓ 2.1 添加 CSS 变量
     ✓ 2.2 连接 localStorage
     所有任务完成！

您: /opsx:archive
AI:  已归档到 openspec/changes/archive/2025-01-23-add-dark-mode/
     规范已更新。准备好进行下一个功能了。
```

<details>
<summary><strong>OpenSpec 仪表板</strong></summary>

<p align="center">
  <img src="assets/openspec_dashboard.png" alt="OpenSpec 仪表板预览" width="90%">
</p>

</details>

## 快速开始

**需要 Node.js 20.19.0 或更高版本。**

全局安装 OpenSpec：

```bash
npm install -g @fission-ai/openspec@latest
```

然后导航到您的项目目录并初始化：

```bash
cd your-project
openspec init
```

现在告诉您的 AI：`/opsx:propose <您想构建的内容>`

如果您想要扩展工作流 (`/opsx:new`、`/opsx:continue`、`/opsx:ff`、`/opsx:verify`、`/opsx:sync`、`/opsx:bulk-archive`、`/opsx:onboard`)，使用 `openspec config profile` 选择它，然后使用 `openspec update` 应用。

> [!NOTE]
> 不确定您的工具是否受支持？[查看完整列表](docs/supported-tools.md) – 我们支持 20+ 工具并在不断增长。
>
> 也适用于 pnpm、yarn、bun 和 nix。[查看安装选项](docs/installation.md)。

## 文档

→ **[快速入门](docs/getting-started.md)**：第一步<br>
→ **[工作流](docs/workflows.md)**：组合和模式<br>
→ **[命令](docs/commands.md)**：斜杠命令和技能<br>
→ **[CLI](docs/cli.md)**：终端参考<br>
→ **[支持的工具](docs/supported-tools.md)**：工具集成和安装路径<br>
→ **[概念](docs/concepts.md)**：如何整合在一起<br>
→ **[多语言](docs/multi-language.md)**：多语言支持<br>
→ **[自定义](docs/customization.md)**：让它成为您自己的


## 为什么选择 OpenSpec？

AI 编码助手功能强大，但当需求仅存在于聊天历史中时，结果不可预测。OpenSpec 添加了一个轻量级规范层，让您在编写任何代码之前就要构建的内容达成一致。

- **在构建前达成一致** — 人类和 AI 在编写代码前就规范达成一致
- **保持组织** — 每个变更都有自己的文件夹，包含提案、规范、设计和任务
- **灵活工作** — 随时更新任何制品，没有僵化的阶段门槛
- **使用您的工具** — 通过斜杠命令与 20+ AI 助手配合使用

### 我们的比较

**vs. [Spec Kit](https://github.com/github/spec-kit)** (GitHub) — 全面但笨重。僵化的阶段门槛，大量 Markdown，Python 设置。OpenSpec 更轻量，让您自由迭代。

**vs. [Kiro](https://kiro.dev)** (AWS) — 功能强大，但您被锁定在他们的 IDE 中，仅限于 Claude 模型。OpenSpec 与您已经使用的工具配合使用。

**vs. 什么都没有** — 没有规范的 AI 编码意味着模糊的提示和不可预测的结果。OpenSpec 带来可预测性而无需繁琐的流程。

## 更新 OpenSpec

**升级包**

```bash
npm install -g @fission-ai/openspec@latest
```

**刷新代理指令**

在每个项目内运行此命令以重新生成 AI 指导并确保最新的斜杠命令处于活动状态：

```bash
openspec update
```

## 使用说明

**模型选择**：OpenSpec 与高推理模型配合效果最佳。我们推荐 Opus 4.5 和 GPT 5.2 用于规划和实施。

**上下文卫生**：OpenSpec 受益于干净的上下文窗口。在开始实施前清除您的上下文，并在整个会话中保持良好的上下文卫生。

## 贡献

**小修复** — 错误修复、拼写更正和小改进可以直接作为 PR 提交。

**较大的更改** — 对于新功能、重大重构或架构更改，请先提交 OpenSpec 变更提案，以便我们在实施开始前就意图和目标达成一致。

编写提案时，请牢记 OpenSpec 理念：我们服务于跨不同编码代理、模型和用例的各种用户。更改应该对每个人都有效。

**欢迎 AI 生成的代码** — 只要经过测试和验证。包含 AI 生成代码的 PR 应该提到使用的编码代理和模型 (例如，"使用 Claude Code 生成，使用 claude-opus-4-5-20251101")。

### 开发

- 安装依赖: `pnpm install`
- 构建: `pnpm run build`
- 测试: `pnpm test`
- 本地开发 CLI: `pnpm run dev` 或 `pnpm run dev:cli`
- 传统提交 (单行): `type(scope): subject`

## 其他

<details>
<summary><strong>遥测</strong></summary>

OpenSpec 收集匿名使用统计。

我们只收集命令名称和版本以了解使用模式。不收集参数、路径、内容或 PII。在 CI 中自动禁用。

**选择退出:** `export OPENSPEC_TELEMETRY=0` 或 `export DO_NOT_TRACK=1`

</details>

<details>
<summary><strong>维护者和顾问</strong></summary>

参见 [MAINTAINERS.md](MAINTAINERS.md) 获取帮助指导项目的核心维护者和顾问列表。

</details>



## 许可证

MIT
