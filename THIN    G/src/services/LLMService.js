import axios from 'axios';

export class LLMService {
  constructor() {
    this.config = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      const storedConfig = await this.loadConfig();
      if (storedConfig) {
        this.config = storedConfig;
        this.isInitialized = true;
      }
    } catch (error) {
      throw new Error(`Failed to initialize LLM service: ${error.message}`);
    }
  }

  async loadConfig() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const config = await AsyncStorage.getItem('llmConfig');
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error loading config:', error);
      return null;
    }
  }

  async testConnection(config) {
    try {
      const response = await axios.get(`${config.endpoint}/api/tags`, {
        timeout: 5000,
        headers: config.apiKey ? {
          'Authorization': `Bearer ${config.apiKey}`
        } : {}
      });

      if (response.status === 200) {
        const models = response.data.models || [];
        const modelExists = models.some(model => model.name === config.model);
        
        if (!modelExists && config.model !== 'llama2') {
          throw new Error(`Model "${config.model}" not found. Available models: ${models.map(m => m.name).join(', ')}`);
        }
        
        return true;
      }
      throw new Error('Server responded with unexpected status');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Connection refused. Is the LLM server running?');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Connection timeout. Check your network and server.');
      } else if (error.response) {
        throw new Error(`Server error: ${error.response.status} ${error.response.statusText}`);
      } else {
        throw new Error(`Connection failed: ${error.message}`);
      }
    }
  }

  async generateResponse(prompt) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.config) {
      throw new Error('LLM not configured. Please check settings.');
    }

    const medicalSystemPrompt = `You are a helpful medical assistant AI. Your role is to provide general medical information and help users understand health topics. 

IMPORTANT GUIDELINES:
1. Always provide a disclaimer that you are not a medical professional
2. Never provide specific medical diagnoses or treatment plans
3. Encourage users to consult healthcare professionals for personal medical advice
4. Provide accurate, evidence-based general information
5. If symptoms suggest emergency, advise immediate medical attention
6. Be compassionate and professional in your responses
7. Cite general medical knowledge when appropriate

User question: ${prompt}`;

    try {
      let response;
      
      if (this.config.endpoint.includes('ollama') || this.config.endpoint.includes('localhost:11434')) {
        response = await this.callOllamaAPI(medicalSystemPrompt);
      } else {
        response = await this.callGenericAPI(medicalSystemPrompt);
      }

      return this.postProcessResponse(response);
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  async callOllamaAPI(prompt) {
    const payload = {
      model: this.config.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      }
    };

    const response = await axios.post(
      `${this.config.endpoint}/api/generate`,
      payload,
      {
        timeout: 30000,
        headers: this.config.apiKey ? {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.response) {
      return response.data.response;
    } else {
      throw new Error('Invalid response from Ollama API');
    }
  }

  async callGenericAPI(prompt) {
    const payload = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: prompt
        }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    };

    const response = await axios.post(
      `${this.config.endpoint}/v1/chat/completions`,
      payload,
      {
        timeout: 30000,
        headers: this.config.apiKey ? {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response from API');
    }
  }

  postProcessResponse(response) {
    let processedResponse = response.trim();
    
    if (!processedResponse.includes('medical professional') && 
        !processedResponse.includes('healthcare provider') &&
        !processedResponse.includes('doctor')) {
      processedResponse += '\n\n*Note: I am an AI assistant and not a medical professional. Please consult with a qualified healthcare provider for personalized medical advice.*';
    }

    return processedResponse;
  }

  async updateConfig(newConfig) {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('llmConfig', JSON.stringify(newConfig));
      this.config = newConfig;
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to update config: ${error.message}`);
    }
  }
}
