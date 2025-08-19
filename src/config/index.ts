import envPaths from 'env-paths';
import { promises as fs } from 'fs';
import path from 'path';
import type { ConfigData } from '../types/index.js';

const paths = envPaths('ask-cli');

const DEFAULT_CONFIG: ConfigData = {
  apiKey: '',
  apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4.5',
  temperature: 0.3
};

class Config {
  private configPath: string;

  constructor() {
    this.configPath = path.join(paths.config, 'config.json');
  }

  async ensureConfigDir(): Promise<void> {
    try {
      await fs.mkdir(paths.config, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  async load(): Promise<ConfigData> {
    try {
      await this.ensureConfigDir();
      const data = await fs.readFile(this.configPath, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch (error) {
      // Config file doesn't exist, create with defaults
      await this.save(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
  }

  async save(config: ConfigData): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  getConfigPath(): string {
    return this.configPath;
  }
}

export default new Config();