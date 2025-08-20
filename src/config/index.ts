import envPaths from 'env-paths';
import { promises as fs } from 'fs';
import path from 'path';
import type { ConfigData, ConfigModel, ConfigArrayData } from '../types/index.js';

const paths = envPaths('ask-cli');

const DEFAULT_CONFIG: ConfigData = {
  apiKey: '',
  apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4.5',
  temperature: 0.3
};

const DEFAULT_CONFIG_MODEL: ConfigModel = {
  name: 'Default Model',
  apiKey: '',
  apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4.5',
  temperature: 0.3,
  enabled: true
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

  // 判断是否为新格式（数组格式）
  private isNewFormat(data: any): data is ConfigArrayData {
    return data && Array.isArray(data.models);
  }

  // 将旧格式转换为新格式
  private convertOldToNewFormat(oldConfig: ConfigData): ConfigArrayData {
    const newModel: ConfigModel = {
      name: 'Default Model',
      apiKey: oldConfig.apiKey,
      apiUrl: oldConfig.apiUrl,
      model: oldConfig.model,
      temperature: oldConfig.temperature,
      enabled: true
    };

    return {
      models: [newModel]
    };
  }

  // 获取当前启用的模型配置
  private getEnabledModel(config: ConfigArrayData): ConfigModel {
    const enabledModel = config.models.find(model => model.enabled);
    return enabledModel || config.models[0] || DEFAULT_CONFIG_MODEL;
  }

  async load(): Promise<ConfigData> {
    try {
      await this.ensureConfigDir();
      const data = await fs.readFile(this.configPath, 'utf8');
      const parsedData = JSON.parse(data);

      // 检查是否为新格式
      if (this.isNewFormat(parsedData)) {
        const enabledModel = this.getEnabledModel(parsedData);
        return {
          apiKey: enabledModel.apiKey,
          apiUrl: enabledModel.apiUrl,
          model: enabledModel.model,
          temperature: enabledModel.temperature
        };
      } else {
        // 旧格式，需要转换并保存
        const convertedConfig = this.convertOldToNewFormat({ ...DEFAULT_CONFIG, ...parsedData });
        await this.saveArray(convertedConfig);
        const enabledModel = this.getEnabledModel(convertedConfig);
        return {
          apiKey: enabledModel.apiKey,
          apiUrl: enabledModel.apiUrl,
          model: enabledModel.model,
          temperature: enabledModel.temperature
        };
      }
    } catch (error) {
      // Config file doesn't exist, create with defaults
      const defaultArrayConfig = this.convertOldToNewFormat(DEFAULT_CONFIG);
      await this.saveArray(defaultArrayConfig);
      return DEFAULT_CONFIG;
    }
  }

  // 加载完整的配置数组
  async loadArray(): Promise<ConfigArrayData> {
    try {
      await this.ensureConfigDir();
      const data = await fs.readFile(this.configPath, 'utf8');
      const parsedData = JSON.parse(data);

      // 检查是否为新格式
      if (this.isNewFormat(parsedData)) {
        return parsedData;
      } else {
        // 旧格式，需要转换并保存
        const convertedConfig = this.convertOldToNewFormat({ ...DEFAULT_CONFIG, ...parsedData });
        await this.saveArray(convertedConfig);
        return convertedConfig;
      }
    } catch (error) {
      // Config file doesn't exist, create with defaults
      const defaultArrayConfig = this.convertOldToNewFormat(DEFAULT_CONFIG);
      await this.saveArray(defaultArrayConfig);
      return defaultArrayConfig;
    }
  }

  async save(config: ConfigData): Promise<void> {
    // 保持向后兼容，但将单个配置转换为数组格式
    const arrayConfig = this.convertOldToNewFormat(config);
    await this.saveArray(arrayConfig);
  }

  // 保存数组格式配置
  async saveArray(config: ConfigArrayData): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  // 切换到指定名称的模型
  async useModel(modelName: string): Promise<{ success: boolean; message: string; model?: ConfigModel }> {
    try {
      const config = await this.loadArray();
      
      // 找到匹配的模型（如果有重复名称，使用第一个）
      const targetModel = config.models.find(model => model.name === modelName);
      
      if (!targetModel) {
        return {
          success: false,
          message: `Model '${modelName}' not found. Available models: ${config.models.map(m => m.name).join(', ')}`
        };
      }

      // 关闭所有模型，启用目标模型
      config.models.forEach(model => {
        model.enabled = model.name === modelName && model === targetModel; // 确保只有第一个匹配的被启用
      });

      await this.saveArray(config);
      
      return {
        success: true,
        message: `Successfully switched to model '${modelName}'`,
        model: targetModel
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to switch model: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  getConfigPath(): string {
    return this.configPath;
  }
}

export default new Config();