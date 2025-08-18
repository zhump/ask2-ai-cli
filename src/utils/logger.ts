import envPaths from 'env-paths';
import { promises as fs } from 'fs';
import path from 'path';

const paths = envPaths('ask-cli');

export interface LogEntry {
  timestamp: string;
  query: string;
  command: string;
  executed: boolean;
  systemInfo: {
    os: string;
    arch: string;
    shell: string;
  };
}

class Logger {
  private logPath: string;

  constructor() {
    this.logPath = path.join(paths.data, 'history.json');
  }

  async ensureLogDir(): Promise<void> {
    try {
      await fs.mkdir(paths.data, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  async loadLogs(): Promise<LogEntry[]> {
    try {
      await this.ensureLogDir();
      const data = await fs.readFile(this.logPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Log file doesn't exist
      return [];
    }
  }

  async saveLogs(logs: LogEntry[]): Promise<void> {
    await this.ensureLogDir();
    await fs.writeFile(this.logPath, JSON.stringify(logs, null, 2));
  }

  async addLog(entry: LogEntry): Promise<void> {
    const logs = await this.loadLogs();
    logs.push(entry);
    
    // Keep only last 100 entries to prevent file from growing too large
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    await this.saveLogs(logs);
  }

  async clearLogs(): Promise<void> {
    await this.saveLogs([]);
  }

  getLogPath(): string {
    return this.logPath;
  }
}

export default new Logger();