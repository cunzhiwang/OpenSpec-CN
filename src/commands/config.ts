import { Command } from 'commander';
import { spawn, execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  getGlobalConfigPath,
  getGlobalConfig,
  saveGlobalConfig,
  GlobalConfig,
} from '../core/global-config.js';
import type { Profile, Delivery } from '../core/global-config.js';
import {
  getNestedValue,
  setNestedValue,
  deleteNestedValue,
  coerceValue,
  formatValueYaml,
  validateConfigKeyPath,
  validateConfig,
  DEFAULT_CONFIG,
} from '../core/config-schema.js';
import { CORE_WORKFLOWS, ALL_WORKFLOWS, getProfileWorkflows } from '../core/profiles.js';
import { OPENSPEC_DIR_NAME } from '../core/config.js';
import { hasProjectConfigDrift } from '../core/profile-sync-drift.js';

type ProfileAction = 'both' | 'delivery' | 'workflows' | 'keep';

interface ProfileState {
  profile: Profile;
  delivery: Delivery;
  workflows: string[];
}

interface ProfileStateDiff {
  hasChanges: boolean;
  lines: string[];
}

interface WorkflowPromptMeta {
  name: string;
  description: string;
}

const WORKFLOW_PROMPT_META: Record<string, WorkflowPromptMeta> = {
  propose: {
    name: '提出变更',
    description: '从请求创建提案、设计和任务',
  },
  explore: {
    name: '探索想法',
    description: '在实现之前调查问题',
  },
  new: {
    name: '新建变更',
    description: '快速创建新的变更脚手架',
  },
  continue: {
    name: '继续变更',
    description: '继续处理现有变更',
  },
  apply: {
    name: '应用任务',
    description: '实现当前变更的任务',
  },
  ff: {
    name: '快进',
    description: '运行更快的实现工作流',
  },
  sync: {
    name: '同步规范',
    description: '将变更产物与规范同步',
  },
  archive: {
    name: '归档变更',
    description: '完成并归档已完成的变更',
  },
  'bulk-archive': {
    name: '批量归档',
    description: '一起归档多个已完成的变更',
  },
  verify: {
    name: '验证变更',
    description: '对变更运行验证检查',
  },
  onboard: {
    name: '入门引导',
    description: 'OpenSpec 引导式入门流程',
  },
};

function isPromptCancellationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'ExitPromptError' || error.message.includes('force closed the prompt with SIGINT'))
  );
}

/**
 * Resolve the effective current profile state from global config defaults.
 */
export function resolveCurrentProfileState(config: GlobalConfig): ProfileState {
  const profile = config.profile || 'core';
  const delivery = config.delivery || 'both';
  const workflows = [
    ...getProfileWorkflows(profile, config.workflows ? [...config.workflows] : undefined),
  ];
  return { profile, delivery, workflows };
}

/**
 * Derive profile type from selected workflows.
 */
export function deriveProfileFromWorkflowSelection(selectedWorkflows: string[]): Profile {
  const isCoreMatch =
    selectedWorkflows.length === CORE_WORKFLOWS.length &&
    CORE_WORKFLOWS.every((w) => selectedWorkflows.includes(w));
  return isCoreMatch ? 'core' : 'custom';
}

/**
 * Format a compact workflow summary for the profile header.
 */
export function formatWorkflowSummary(workflows: readonly string[], profile: Profile): string {
  return `${workflows.length} selected (${profile})`;
}

function stableWorkflowOrder(workflows: readonly string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const workflow of ALL_WORKFLOWS) {
    if (workflows.includes(workflow) && !seen.has(workflow)) {
      ordered.push(workflow);
      seen.add(workflow);
    }
  }

  const extras = workflows.filter((w) => !ALL_WORKFLOWS.includes(w as (typeof ALL_WORKFLOWS)[number]));
  extras.sort();
  for (const extra of extras) {
    if (!seen.has(extra)) {
      ordered.push(extra);
      seen.add(extra);
    }
  }

  return ordered;
}

/**
 * Build a user-facing diff summary between two profile states.
 */
export function diffProfileState(before: ProfileState, after: ProfileState): ProfileStateDiff {
  const lines: string[] = [];

  if (before.delivery !== after.delivery) {
    lines.push(`delivery: ${before.delivery} -> ${after.delivery}`);
  }

  if (before.profile !== after.profile) {
    lines.push(`profile: ${before.profile} -> ${after.profile}`);
  }

  const beforeOrdered = stableWorkflowOrder(before.workflows);
  const afterOrdered = stableWorkflowOrder(after.workflows);
  const beforeSet = new Set(beforeOrdered);
  const afterSet = new Set(afterOrdered);

  const added = afterOrdered.filter((w) => !beforeSet.has(w));
  const removed = beforeOrdered.filter((w) => !afterSet.has(w));

  if (added.length > 0 || removed.length > 0) {
    const tokens: string[] = [];
    if (added.length > 0) {
      tokens.push(`added ${added.join(', ')}`);
    }
    if (removed.length > 0) {
      tokens.push(`removed ${removed.join(', ')}`);
    }
    lines.push(`workflows: ${tokens.join('; ')}`);
  }

  return {
    hasChanges: lines.length > 0,
    lines,
  };
}

function maybeWarnConfigDrift(
  projectDir: string,
  state: ProfileState,
  colorize: (message: string) => string
): void {
  const openspecDir = path.join(projectDir, OPENSPEC_DIR_NAME);
  if (!fs.existsSync(openspecDir)) {
    return;
  }
  if (!hasProjectConfigDrift(projectDir, state.workflows, state.delivery)) {
    return;
  }
  console.log(colorize('警告: 全局配置未应用到此项目。请运行 `openspec update` 来同步。'));
}

/**
 * Register the config command and all its subcommands.
 *
 * @param program - The Commander program instance
 */
export function registerConfigCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('查看和修改全局 OpenSpec 配置')
    .option('--scope <scope>', '配置作用域 (目前仅支持 "global")')
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts.scope && opts.scope !== 'global') {
        console.error('错误: 项目本地配置尚未实现');
        process.exit(1);
      }
    });

  // 配置路径
  configCmd
    .command('path')
    .description('显示配置文件位置')
    .action(() => {
      console.log(getGlobalConfigPath());
    });

  // 配置列表
  configCmd
    .command('list')
    .description('显示所有当前设置')
    .option('--json', '以 JSON 格式输出')
    .action((options: { json?: boolean }) => {
      const config = getGlobalConfig();

      if (options.json) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        // 读取原始配置以确定哪些值是显式设置的，哪些是默认值
        const configPath = getGlobalConfigPath();
        let rawConfig: Record<string, unknown> = {};
        try {
          if (fs.existsSync(configPath)) {
            rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          }
        } catch {
          // 如果读取失败，将所有值视为默认值
        }

        console.log(formatValueYaml(config));

        // 标注配置文件设置
        const profileSource = rawConfig.profile !== undefined ? '(显式设置)' : '(默认)';
        const deliverySource = rawConfig.delivery !== undefined ? '(显式设置)' : '(默认)';
        console.log(`\n配置文件设置:`);
        console.log(`  profile: ${config.profile} ${profileSource}`);
        console.log(`  delivery: ${config.delivery} ${deliverySource}`);
        if (config.profile === 'core') {
          console.log(`  workflows: ${CORE_WORKFLOWS.join(', ')} (来自 core 配置)`);
        } else if (config.workflows && config.workflows.length > 0) {
          console.log(`  workflows: ${config.workflows.join(', ')} (显式设置)`);
        } else {
          console.log(`  workflows: (无)`);
        }
      }
    });

  // 获取配置
  configCmd
    .command('get <key>')
    .description('获取特定值 (原始值，适合脚本使用)')
    .action((key: string) => {
      const config = getGlobalConfig();
      const value = getNestedValue(config as Record<string, unknown>, key);

      if (value === undefined) {
        process.exitCode = 1;
        return;
      }

      if (typeof value === 'object' && value !== null) {
        console.log(JSON.stringify(value));
      } else {
        console.log(String(value));
      }
    });

  // 设置配置
  configCmd
    .command('set <key> <value>')
    .description('设置值 (自动转换类型)')
    .option('--string', '强制将值存储为字符串')
    .option('--allow-unknown', '允许设置未知键')
    .action((key: string, value: string, options: { string?: boolean; allowUnknown?: boolean }) => {
      const allowUnknown = Boolean(options.allowUnknown);
      const keyValidation = validateConfigKeyPath(key);
      if (!keyValidation.valid && !allowUnknown) {
        const reason = keyValidation.reason ? ` ${keyValidation.reason}。` : '';
        console.error(`错误: 无效的配置键 "${key}"。${reason}`);
        console.error('使用 "openspec config list" 查看可用的键。');
        console.error('传递 --allow-unknown 来绕过此检查。');
        process.exitCode = 1;
        return;
      }

      const config = getGlobalConfig() as Record<string, unknown>;
      const coercedValue = coerceValue(value, options.string || false);

      // 创建副本以在保存前验证
      const newConfig = JSON.parse(JSON.stringify(config));
      setNestedValue(newConfig, key, coercedValue);

      // 验证新配置
      const validation = validateConfig(newConfig);
      if (!validation.success) {
        console.error(`错误: 无效的配置 - ${validation.error}`);
        process.exitCode = 1;
        return;
      }

      // 应用更改并保存
      setNestedValue(config, key, coercedValue);
      saveGlobalConfig(config as GlobalConfig);

      const displayValue =
        typeof coercedValue === 'string' ? `"${coercedValue}"` : String(coercedValue);
      console.log(`已设置 ${key} = ${displayValue}`);
    });

  // 取消设置配置
  configCmd
    .command('unset <key>')
    .description('移除键 (恢复为默认值)')
    .action((key: string) => {
      const config = getGlobalConfig() as Record<string, unknown>;
      const existed = deleteNestedValue(config, key);

      if (existed) {
        saveGlobalConfig(config as GlobalConfig);
        console.log(`已取消设置 ${key} (已恢复为默认值)`);
      } else {
        console.log(`键 "${key}" 未设置`);
      }
    });

  // 重置配置
  configCmd
    .command('reset')
    .description('将配置重置为默认值')
    .option('--all', '重置所有配置 (必需)')
    .option('-y, --yes', '跳过确认提示')
    .action(async (options: { all?: boolean; yes?: boolean }) => {
      if (!options.all) {
        console.error('错误: 重置需要 --all 标志');
        console.error('用法: openspec config reset --all [-y]');
        process.exitCode = 1;
        return;
      }

      if (!options.yes) {
        const { confirm } = await import('@inquirer/prompts');
        let confirmed: boolean;
        try {
          confirmed = await confirm({
            message: '将所有配置重置为默认值?',
            default: false,
          });
        } catch (error) {
          if (isPromptCancellationError(error)) {
            console.log('重置已取消。');
            process.exitCode = 130;
            return;
          }
          throw error;
        }

        if (!confirmed) {
          console.log('重置已取消。');
          return;
        }
      }

      saveGlobalConfig({ ...DEFAULT_CONFIG });
      console.log('配置已重置为默认值');
    });

  // 编辑配置
  configCmd
    .command('edit')
    .description('在 $EDITOR 中打开配置')
    .action(async () => {
      const editor = process.env.EDITOR || process.env.VISUAL;

      if (!editor) {
        console.error('错误: 未配置编辑器');
        console.error('请设置 EDITOR 或 VISUAL 环境变量为您首选的编辑器');
        console.error('示例: export EDITOR=vim');
        process.exitCode = 1;
        return;
      }

      const configPath = getGlobalConfigPath();

      // 确保配置文件存在并包含默认值
      if (!fs.existsSync(configPath)) {
        saveGlobalConfig({ ...DEFAULT_CONFIG });
      }

      // 启动编辑器并等待它关闭
      // 避免 shell 解析，以正确处理路径中的空格
      const child = spawn(editor, [configPath], {
        stdio: 'inherit',
        shell: false,
      });

      await new Promise<void>((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`编辑器退出，代码为 ${code}`));
          }
        });
        child.on('error', reject);
      });

      try {
        const rawConfig = fs.readFileSync(configPath, 'utf-8');
        const parsedConfig = JSON.parse(rawConfig);
        const validation = validateConfig(parsedConfig);

        if (!validation.success) {
          console.error(`错误: 无效的配置 - ${validation.error}`);
          process.exitCode = 1;
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          console.error(`错误: 配置文件未找到: ${configPath}`);
        } else if (error instanceof SyntaxError) {
          console.error(`错误: ${configPath} 中的 JSON 无效`);
          console.error(error.message);
        } else {
          console.error(`错误: 无法验证配置 - ${error instanceof Error ? error.message : String(error)}`);
        }
        process.exitCode = 1;
      }
    });

  // 配置文件 [预设]
  configCmd
    .command('profile [preset]')
    .description('配置工作流配置文件 (交互式选择器或预设快捷方式)')
    .action(async (preset?: string) => {
      // 预设快捷方式: `openspec config profile core`
      if (preset === 'core') {
        const config = getGlobalConfig();
        config.profile = 'core';
        config.workflows = [...CORE_WORKFLOWS];
        // 保留 delivery 设置
        saveGlobalConfig(config);
        console.log('配置已更新。在您的项目中运行 `openspec update` 来应用。');
        return;
      }

      if (preset) {
        console.error(`错误: 未知的配置文件预设 "${preset}"。可用的预设: core`);
        process.exitCode = 1;
        return;
      }

      // 非交互式检查
      if (!process.stdout.isTTY) {
        console.error('需要交互模式。使用 `openspec config profile core` 或通过环境/标志设置配置。');
        process.exitCode = 1;
        return;
      }

      // 交互式选择器
      const { select, checkbox, confirm } = await import('@inquirer/prompts');
      const chalk = (await import('chalk')).default;

      try {
        const config = getGlobalConfig();
        const currentState = resolveCurrentProfileState(config);

        console.log(chalk.bold('\n当前配置文件设置'));
        console.log(`  交付方式: ${currentState.delivery}`);
        console.log(`  工作流: ${formatWorkflowSummary(currentState.workflows, currentState.profile)}`);
        console.log(chalk.dim('  交付方式 = 工作流安装位置 (技能、命令或两者)'));
        console.log(chalk.dim('  工作流 = 可用的操作 (propose、explore、apply 等)'));
        console.log();

        const action = await select<ProfileAction>({
          message: '您想配置什么?',
          choices: [
            {
              value: 'both',
              name: '交付方式和工作流',
              description: '一起更新安装模式和可用操作',
            },
            {
              value: 'delivery',
              name: '仅交付方式',
              description: '更改工作流的安装位置',
            },
            {
              value: 'workflows',
              name: '仅工作流',
              description: '更改可用的工作流操作',
            },
            {
              value: 'keep',
              name: '保持当前设置 (退出)',
              description: '保持配置不变并退出',
            },
          ],
        });

        if (action === 'keep') {
          console.log('没有配置更改。');
          maybeWarnConfigDrift(process.cwd(), currentState, chalk.yellow);
          return;
        }

        const nextState: ProfileState = {
          profile: currentState.profile,
          delivery: currentState.delivery,
          workflows: [...currentState.workflows],
        };

        if (action === 'both' || action === 'delivery') {
          const deliveryChoices: { value: Delivery; name: string; description: string }[] = [
            {
              value: 'both' as Delivery,
              name: '两者 (技能 + 命令)',
              description: '将工作流安装为技能和斜杠命令',
            },
            {
              value: 'skills' as Delivery,
              name: '仅技能',
              description: '仅将工作流安装为技能',
            },
            {
              value: 'commands' as Delivery,
              name: '仅命令',
              description: '仅将工作流安装为斜杠命令',
            },
          ];
          for (const choice of deliveryChoices) {
            if (choice.value === currentState.delivery) {
              choice.name += ' [当前]';
            }
          }

          nextState.delivery = await select<Delivery>({
            message: '交付模式 (工作流的安装方式):',
            choices: deliveryChoices,
            default: currentState.delivery,
          });
        }

        if (action === 'both' || action === 'workflows') {
          const formatWorkflowChoice = (workflow: string) => {
            const metadata = WORKFLOW_PROMPT_META[workflow] ?? {
              name: workflow,
              description: `工作流: ${workflow}`,
            };
            return {
              value: workflow,
              name: metadata.name,
              description: metadata.description,
              short: metadata.name,
              checked: currentState.workflows.includes(workflow),
            };
          };

          const selectedWorkflows = await checkbox<string>({
            message: '选择要启用的工作流:',
            instructions: '空格键切换，回车键确认',
            pageSize: ALL_WORKFLOWS.length,
            theme: {
              icon: {
                checked: '[x]',
                unchecked: '[ ]',
              },
            },
            choices: ALL_WORKFLOWS.map(formatWorkflowChoice),
          });
          nextState.workflows = selectedWorkflows;
          nextState.profile = deriveProfileFromWorkflowSelection(selectedWorkflows);
        }

        const diff = diffProfileState(currentState, nextState);
        if (!diff.hasChanges) {
          console.log('没有配置更改。');
          maybeWarnConfigDrift(process.cwd(), nextState, chalk.yellow);
          return;
        }

        console.log(chalk.bold('\n配置更改:'));
        for (const line of diff.lines) {
          console.log(`  ${line}`);
        }
        console.log();

        config.profile = nextState.profile;
        config.delivery = nextState.delivery;
        config.workflows = nextState.workflows;
        saveGlobalConfig(config);

        // 检查是否在 OpenSpec 项目中
        const projectDir = process.cwd();
        const openspecDir = path.join(projectDir, OPENSPEC_DIR_NAME);
        if (fs.existsSync(openspecDir)) {
          const applyNow = await confirm({
            message: '现在将更改应用到此项目吗?',
            default: true,
          });

          if (applyNow) {
            try {
              execSync('npx openspec update', { stdio: 'inherit', cwd: projectDir });
              console.log('在您的其他项目中运行 `openspec update` 来应用。');
            } catch {
              console.error('`openspec update` 失败。请手动运行以应用配置更改。');
              process.exitCode = 1;
            }
            return;
          }
        }

        console.log('配置已更新。在您的项目中运行 `openspec update` 来应用。');
      } catch (error) {
        if (isPromptCancellationError(error)) {
          console.log('配置文件操作已取消。');
          process.exitCode = 130;
          return;
        }
        throw error;
      }
    });
}
