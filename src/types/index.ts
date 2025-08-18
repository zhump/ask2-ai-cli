export interface ConfigData {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
}

export interface SystemInfo {
  platform: NodeJS.Platform;
  systemName: string;
  release: string;
  arch: string;
  shell: string;
  projectType?: string;
  isWSL?: boolean;
  packageManager?: string;
}

export interface ZhipuMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ZhipuResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}