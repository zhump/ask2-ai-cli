import config from '../config/index.js';
import type { ZhipuMessage, ZhipuResponse, ConfigModel } from '../types/index.js';

class AIService {
    async callZhipuAPI(messages: ZhipuMessage[], model?: string): Promise<ZhipuResponse> {
        const configData = await config.load();

        if (!configData.apiKey) {
            throw new Error('API key not configured. Run "ask config" to set up your API key.');
        }

        const url = configData.apiUrl;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${configData.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || configData.model,
                messages: messages,
                thinking:{
                    "type": "disabled",  
                },
                temperature: configData.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    // 使用指定模型配置调用API
    async callZhipuAPIWithConfig(messages: ZhipuMessage[], modelConfig: ConfigModel): Promise<ZhipuResponse> {
        if (!modelConfig.apiKey) {
            throw new Error('API key not configured for this model.');
        }

        const url = modelConfig.apiUrl;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${modelConfig.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelConfig.model,
                messages: messages,
                thinking:{
                    "type": "disabled",  
                },
                temperature: modelConfig.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async generateCommand(prompt: string): Promise<string> {
        try {
            const messages: ZhipuMessage[] = [
                { role: 'user', content: prompt }
            ];

            const result = await this.callZhipuAPI(messages);

            if (!result.choices || result.choices.length === 0) {
                throw new Error('AI 返回了空响应');
            }

            return result.choices[0].message.content.trim();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(`请求错误: ${error}`);
            }
        }
    }

    // 使用指定模型配置生成命令
    async generateCommandWithConfig(prompt: string, modelConfig: ConfigModel): Promise<string> {
        try {
            const messages: ZhipuMessage[] = [
                { role: 'user', content: prompt }
            ];

            const result = await this.callZhipuAPIWithConfig(messages, modelConfig);

            if (!result.choices || result.choices.length === 0) {
                throw new Error('AI 返回了空响应');
            }

            return result.choices[0].message.content.trim();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(`请求错误: ${error}`);
            }
        }
    }
}

export default new AIService();