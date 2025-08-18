import os from 'os';
import type { SystemInfo } from '../types/index.js';

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

  return {
    platform,
    systemName,
    release,
    arch,
    shell: shell.split('/').pop() || shell.split('\\').pop() || shell
  };
}

export function buildPrompt(query: string, systemInfo: SystemInfo): string {
  return `你是一个命令行助手。请将以下自然语言请求转换为指定系统上的适当命令。

系统信息:
- 操作系统: ${systemInfo.systemName} (${systemInfo.platform})
- 版本: ${systemInfo.release}
- 架构: ${systemInfo.arch}
- Shell: ${systemInfo.shell}

用户请求: "${query}"

请只提供应该执行的命令，不要任何解释或额外文本。命令应该可以直接复制粘贴到终端中执行。

示例:
- "列出文件" → "ls -la" (macOS/Linux) 或 "dir" (Windows)
- "在文件中查找文本" → "grep -r 'text' ." (macOS/Linux) 或 "findstr /s 'text' *" (Windows)
- "显示磁盘使用情况" → "df -h" (macOS/Linux) 或 "wmic logicaldisk get size,freespace,caption" (Windows)
- "删除3000端口进程" → "lsof -ti:3000 | xargs kill -9" (macOS/Linux) 或 "netstat -ano | findstr :3000 && taskkill /PID <PID> /F" (Windows)

命令:`;
}