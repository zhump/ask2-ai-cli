import os from 'os';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import type { SystemInfo } from '../types/index.js';

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

// 检测实际安装的包管理器
function detectPackageManager(systemName: string, platform: NodeJS.Platform): string[] {
    const packageManagers: string[] = [];
    
    // 定义各平台可能的包管理器
    const candidates = {
        'macOS': ['brew', 'port', 'fink'],
        'Windows': ['winget', 'choco', 'scoop'],
        'Linux': ['apt', 'yum', 'dnf', 'pacman', 'zypper', 'apk', 'emerge', 'xbps-install']
    };
    
    const platformCandidates = candidates[systemName as keyof typeof candidates] || [];
    
    // 检测每个候选包管理器是否实际安装
    for (const pm of platformCandidates) {
        try {
            execSync(`which ${pm}`, { stdio: 'ignore', timeout: 1000 });
            packageManagers.push(pm);
        } catch {
            // 包管理器不存在，继续检测下一个
        }
    }
    
    // Windows 特殊处理 - 检测 PowerShell 模块
    if (platform === 'win32') {
        try {
            execSync('powershell -Command "Get-Command winget"', { stdio: 'ignore', timeout: 1000 });
            if (!packageManagers.includes('winget')) {
                packageManagers.unshift('winget'); // 优先级最高
            }
        } catch {
            // winget 不可用
        }
    }
    
    return packageManagers;
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
    const packageManagers = detectPackageManager(systemName, platform);
    const isWSL = platform === 'linux' ? detectWSL() : false;

    return {
        platform,
        systemName,
        release,
        arch,
        shell: shell.split('/').pop() || shell.split('\\').pop() || shell,
        projectType,
        packageManager: packageManagers.length > 0 ? packageManagers[0] : undefined, // 使用优先级最高的
        packageManagers, // 保存所有可用的包管理器
        isWSL
    };
}

// 简洁优雅的 buildPrompt 方法
export function buildPrompt(query: string, systemInfo: SystemInfo): string {
    // 构建包管理器信息
    const packageManagerInfo = systemInfo.packageManagers && systemInfo.packageManagers.length > 0 
        ? `可用包管理器: ${systemInfo.packageManagers.join(', ')} (优先: ${systemInfo.packageManager})`
        : null;

    // 构建系统上下文
    const systemContext = [
        `操作系统: ${systemInfo.systemName} (${systemInfo.platform})`,
        `架构: ${systemInfo.arch}`,
        `Shell: ${systemInfo.shell}`,
        packageManagerInfo,
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
4. 使用 ${systemInfo.shell} shell 语法
5. 如需包管理器，优先使用 ${systemInfo.packageManager || '系统默认'}${safetyNote}

命令:`;
}