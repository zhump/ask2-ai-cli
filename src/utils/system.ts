import os from 'os';
import path from 'path';
import fs from 'fs';
import type { SystemInfo } from '../types/index.js';

type OSName = 'Windows' | 'macOS' | 'Linux' | 'FreeBSD' | 'Unknown';
type ShellName = 'bash' | 'zsh' | 'fish' | 'powershell' | 'cmd' | string;

// 简洁的项目类型检测
function detectProjectType(): string {
  const cwd = process.cwd();
  const files = [
    ['package.json', 'nodejs'],
    ['requirements.txt', 'python'],
    ['pyproject.toml', 'python'],
    ['pom.xml', 'java'],
    ['build.gradle', 'java'],
    ['go.mod', 'go'],
    ['Cargo.toml', 'rust'],
    ['.git', 'git']
  ];
  
  for (const [file, type] of files) {
    if (fs.existsSync(path.join(cwd, file))) {
      return type;
    }
  }
  
  return 'general';
}

// 检测包管理器
function detectPackageManager(systemName: string, platform: NodeJS.Platform): string {
  if (systemName === 'macOS') return 'brew';
  if (systemName === 'Windows') return 'winget';
  if (platform === 'linux') return 'apt'; // 简化，大多数情况下适用
  return '';
}

// 检测是否在 WSL 环境
function detectWSL(): boolean {
  try {
    return fs.existsSync('/proc/version') && 
           fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
  } catch {
    return false;
  }
}

export function getSystemInfo(): SystemInfo {
  const platform = os.platform();
  const release = os.release();
  const arch = os.arch();
  
  let systemName = 'Unknown';
  let shell = process.env.SHELL || 'unknown';
  
  switch (platform) {
    case 'darwin':
      systemName = 'macOS';
      break;
    case 'win32':
      systemName = 'Windows';
      shell = process.env.COMSPEC || 'cmd';
      break;
    case 'linux':
      systemName = 'Linux';
      break;
    default:
      systemName = platform;
  }

  const projectType = detectProjectType();
  const packageManager = detectPackageManager(systemName, platform);
  const isWSL = platform === 'linux' ? detectWSL() : false;
  
  return {
    platform,
    systemName,
    release,
    arch,
    shell: shell.split('/').pop() || shell.split('\\').pop() || shell,
    projectType,
    packageManager,
    isWSL
  };
}

// 简洁优雅的 buildPrompt 方法
export function buildPrompt(query: string, systemInfo: SystemInfo): string {
  // 构建系统上下文
  const systemContext = [
    `操作系统: ${systemInfo.systemName} (${systemInfo.platform})`,
    `架构: ${systemInfo.arch}`,
    `Shell: ${systemInfo.shell}`,
    systemInfo.packageManager ? `包管理器: ${systemInfo.packageManager}` : null,
    systemInfo.projectType ? `项目类型: ${systemInfo.projectType}` : null,
    systemInfo.isWSL ? '环境: WSL' : null
  ].filter(Boolean).join('\n- ');

  // 安全提示
  const safetyNote = query.toLowerCase().includes('删除') || 
                    query.toLowerCase().includes('rm ') || 
                    query.toLowerCase().includes('kill') ?
    '\n⚠️ 注意：请谨慎执行可能的危险操作' : '';

  return `你是一个命令行助手。将自然语言转换为可执行的命令。

系统信息:
- ${systemContext}

用户请求: "${query}"

要求:
1. 只输出一个可直接执行的命令，无需解释
2. 命令必须适配 ${systemInfo.systemName} 系统
3. 优先使用安全、常用的选项
4. 使用 ${systemInfo.shell} shell 语法${safetyNote}

命令:`;
}