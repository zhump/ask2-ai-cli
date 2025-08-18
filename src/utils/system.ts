import os from 'os';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { generateContextualHint } from './fileDetector.js';
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
    // Build package manager information
    const packageManagerInfo = systemInfo.packageManagers && systemInfo.packageManagers.length > 0
        ? `Available package managers: ${systemInfo.packageManagers.join(', ')} (preferred: ${systemInfo.packageManager})`
        : null;

    // Build system context
    const systemContext = [
        `Operating System: ${systemInfo.systemName} (${systemInfo.platform})`,
        `Architecture: ${systemInfo.arch}`,
        `Shell: ${systemInfo.shell}`,
        packageManagerInfo,
        systemInfo.projectType ? `Project Type: ${systemInfo.projectType}` : null,
        systemInfo.isWSL ? 'Environment: WSL' : null
    ].filter(Boolean).join('\n- ');

    // Safety note for dangerous operations
    const safetyNote = query.toLowerCase().includes('删除') ||
        query.toLowerCase().includes('delete') ||
        query.toLowerCase().includes('remove') ||
        query.toLowerCase().includes('rm ') ||
        query.toLowerCase().includes('kill') ?
        '\n⚠️ Note: Exercise caution with potentially dangerous operations' : '';

    // Get contextual file information
    const fileContext = generateContextualHint(query);

    return `You are a command-line assistant. Convert natural language requests into executable commands for the specified system.

System Information:
- ${systemContext}

User Request: "${query}"

Requirements:
1. Output ONLY one directly executable command, no explanations
2. Command must be compatible with ${systemInfo.systemName} system
3. Use safe, commonly-used options and parameters
4. Use ${systemInfo.shell} shell syntax
5. For package management, prefer ${systemInfo.packageManager || 'system default'}
6. For file/directory operations:
   - Use appropriate flags (e.g., -r for directories, -f for force)
   - Consider whether target is file or directory
   - Use safe deletion methods when possible

Important Notes:
- For deleting directories: use 'rm -rf' or 'rmdir' as appropriate
- For deleting files: use 'rm' with appropriate flags
- For system operations: include necessary privileges (sudo) when required
- Always generate working, tested command patterns${fileContext}${safetyNote}

Command:`;
}