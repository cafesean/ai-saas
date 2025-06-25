import { 
  ProviderType, 
  ProviderConfig,
  OpenAIConfig,
  AnthropicConfig,
  GoogleConfig,
  HuggingFaceConfig,
  MistralConfig,
  CohereConfig,
  PerplexityConfig,
  TogetherConfig,
  ModelCapabilityType,
  ProviderModel
} from '@/types/provider.types';

// Built-in provider templates with comprehensive model support
export const PROVIDER_TEMPLATES = {
  [ProviderType.OPENAI]: {
    name: 'OpenAI',
    description: 'OpenAI GPT models including GPT-4, GPT-3.5, and specialized models',
    baseUrl: 'https://api.openai.com/v1',
    timeout: 30000,
    maxRetries: 3,
    rateLimiting: {
      requestsPerMinute: 500,
      requestsPerHour: 10000,
      tokensPerMinute: 150000,
    },
    defaultModel: 'gpt-4-turbo-preview',
    supportedModels: [
      'gpt-4-turbo-preview',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-instruct',
      'text-embedding-3-large',
      'text-embedding-3-small',
      'text-embedding-ada-002',
      'dall-e-3',
      'dall-e-2',
      'whisper-1',
      'tts-1',
      'tts-1-hd'
    ],
    features: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      fineTuning: true,
      imageGeneration: true,
      audioTranscription: true,
      textToSpeech: true,
    },
    capabilities: [
      ModelCapabilityType.TEXT_GENERATION,
      ModelCapabilityType.CODE_GENERATION,
      ModelCapabilityType.EMBEDDING,
      ModelCapabilityType.IMAGE_GENERATION,
      ModelCapabilityType.SUMMARIZATION,
      ModelCapabilityType.QUESTION_ANSWERING,
      ModelCapabilityType.TRANSLATION,
    ]
  },

  [ProviderType.ANTHROPIC]: {
    name: 'Anthropic',
    description: 'Claude models with advanced reasoning and safety features',
    baseUrl: 'https://api.anthropic.com',
    timeout: 30000,
    maxRetries: 3,
    rateLimiting: {
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      tokensPerMinute: 40000,
    },
    defaultModel: 'claude-3-opus-20240229',
    supportedModels: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2'
    ],
    features: {
      streaming: true,
      vision: true,
      toolUse: true,
      systemPrompts: true,
      longContext: true,
    },
    capabilities: [
      ModelCapabilityType.TEXT_GENERATION,
      ModelCapabilityType.CODE_GENERATION,
      ModelCapabilityType.SUMMARIZATION,
      ModelCapabilityType.QUESTION_ANSWERING,
      ModelCapabilityType.TRANSLATION,
      ModelCapabilityType.SENTIMENT_ANALYSIS,
    ]
  },

  [ProviderType.GOOGLE]: {
    name: 'Google AI',
    description: 'Google Gemini and PaLM models with multimodal capabilities',
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    timeout: 30000,
    maxRetries: 3,
    rateLimiting: {
      requestsPerMinute: 60,
      requestsPerHour: 1500,
      tokensPerMinute: 32000,
    },
    defaultModel: 'gemini-1.5-pro',
    supportedModels: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-1.0-pro-vision',
      'gemini-1.0-pro-latest',
      'text-embedding-004',
      'text-embedding-preview-0409',
      'aqa'
    ],
    features: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      multimodal: true,
      longContext: true,
    },
    capabilities: [
      ModelCapabilityType.TEXT_GENERATION,
      ModelCapabilityType.CODE_GENERATION,
      ModelCapabilityType.EMBEDDING,
      ModelCapabilityType.IMAGE_CLASSIFICATION,
      ModelCapabilityType.SUMMARIZATION,
      ModelCapabilityType.QUESTION_ANSWERING,
      ModelCapabilityType.TRANSLATION,
    ]
  },

  [ProviderType.MISTRAL]: {
    name: 'Mistral AI',
    description: 'High-performance open and commercial models from Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    timeout: 30000,
    maxRetries: 3,
    rateLimiting: {
      requestsPerMinute: 100,
      requestsPerHour: 2000,
      tokensPerMinute: 100000,
    },
    defaultModel: 'mistral-large-latest',
    supportedModels: [
      'mistral-large-latest',
      'mistral-medium-latest',
      'mistral-small-latest',
      'mistral-tiny',
      'open-mistral-7b',
      'open-mixtral-8x7b',
      'open-mixtral-8x22b',
      'mistral-embed'
    ],
    features: {
      streaming: true,
      functionCalling: true,
      embeddings: true,
      openSource: true,
    },
    capabilities: [
      ModelCapabilityType.TEXT_GENERATION,
      ModelCapabilityType.CODE_GENERATION,
      ModelCapabilityType.EMBEDDING,
      ModelCapabilityType.SUMMARIZATION,
      ModelCapabilityType.QUESTION_ANSWERING,
      ModelCapabilityType.TRANSLATION,
    ]
  },

  [ProviderType.COHERE]: {
    name: 'Cohere',
    description: 'Enterprise-focused language models with strong NLP capabilities',
    baseUrl: 'https://api.cohere.ai/v1',
    timeout: 30000,
    maxRetries: 3,
    rateLimiting: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      tokensPerMinute: 40000,
    },
    defaultModel: 'command-r-plus',
    supportedModels: [
      'command-r-plus',
      'command-r',
      'command',
      'command-nightly',
      'command-light',
      'command-light-nightly',
      'embed-english-v3.0',
      'embed-multilingual-v3.0',
      'embed-english-light-v3.0',
      'embed-multilingual-light-v3.0',
      'rerank-english-v3.0',
      'rerank-multilingual-v3.0'
    ],
    features: {
      streaming: true,
      embeddings: true,
      classification: true,
      rerank: true,
      multilingual: true,
    },
    capabilities: [
      ModelCapabilityType.TEXT_GENERATION,
      ModelCapabilityType.TEXT_CLASSIFICATION,
      ModelCapabilityType.EMBEDDING,
      ModelCapabilityType.SUMMARIZATION,
      ModelCapabilityType.QUESTION_ANSWERING,
      ModelCapabilityType.SENTIMENT_ANALYSIS,
      ModelCapabilityType.TRANSLATION,
    ]
  },

  [ProviderType.PERPLEXITY]: {
    name: 'Perplexity AI',
    description: 'Search-augmented language models with real-time web access',
    baseUrl: 'https://api.perplexity.ai',
    timeout: 45000,
    maxRetries: 3,
    rateLimiting: {
      requestsPerMinute: 20,
      requestsPerHour: 200,
      tokensPerMinute: 20000,
    },
    defaultModel: 'llama-3-sonar-large-32k-online',
    supportedModels: [
      'llama-3-sonar-large-32k-online',
      'llama-3-sonar-small-32k-online',
      'llama-3-sonar-large-32k-chat',
      'llama-3-sonar-small-32k-chat',
      'llama-3-8b-instruct',
      'llama-3-70b-instruct',
      'mixtral-8x7b-instruct'
    ],
    features: {
      streaming: true,
      webSearch: true,
      citations: true,
      realTimeData: true,
    },
    capabilities: [
      ModelCapabilityType.TEXT_GENERATION,
      ModelCapabilityType.QUESTION_ANSWERING,
      ModelCapabilityType.SUMMARIZATION,
    ]
  },

  [ProviderType.TOGETHER]: {
    name: 'Together AI',
    description: 'Optimized inference for open-source models with fast performance',
    baseUrl: 'https://api.together.xyz/v1',
    timeout: 30000,
    maxRetries: 3,
    rateLimiting: {
      requestsPerMinute: 200,
      requestsPerHour: 5000,
      tokensPerMinute: 200000,
    },
    defaultModel: 'meta-llama/Llama-2-70b-chat-hf',
    supportedModels: [
      'meta-llama/Llama-2-70b-chat-hf',
      'meta-llama/Llama-2-13b-chat-hf',
      'meta-llama/Llama-2-7b-chat-hf',
      'meta-llama/CodeLlama-34b-Instruct-hf',
      'meta-llama/CodeLlama-13b-Instruct-hf',
      'meta-llama/CodeLlama-7b-Instruct-hf',
      'mistralai/Mistral-7B-Instruct-v0.1',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'togethercomputer/RedPajama-INCITE-7B-Chat',
      'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
      'teknium/OpenHermes-2.5-Mistral-7B',
      'Qwen/Qwen1.5-72B-Chat'
    ],
    features: {
      streaming: true,
      openSourceModels: true,
      fineTuning: true,
      customModels: true,
    },
    capabilities: [
      ModelCapabilityType.TEXT_GENERATION,
      ModelCapabilityType.CODE_GENERATION,
      ModelCapabilityType.SUMMARIZATION,
      ModelCapabilityType.QUESTION_ANSWERING,
      ModelCapabilityType.TRANSLATION,
    ]
  },

  [ProviderType.HUGGINGFACE]: {
    name: 'Hugging Face',
    description: 'Access to thousands of open-source models via Inference API',
    baseUrl: 'https://api-inference.huggingface.co',
    timeout: 30000,
    maxRetries: 3,
    rateLimiting: {
      requestsPerMinute: 1000,
      requestsPerHour: 10000,
    },
    defaultModel: 'microsoft/DialoGPT-large',
    supportedModels: [
      'microsoft/DialoGPT-large',
      'microsoft/DialoGPT-medium',
      'microsoft/DialoGPT-small',
      'facebook/blenderbot-400M-distill',
      'facebook/blenderbot-1B-distill',
      'sentence-transformers/all-MiniLM-L6-v2',
      'sentence-transformers/all-mpnet-base-v2',
      'stabilityai/stable-diffusion-xl-base-1.0',
      'runwayml/stable-diffusion-v1-5',
      'openai/whisper-large-v3'
    ],
    features: {
      streaming: false,
      customModels: true,
      fineTuning: false,
      embeddings: true,
      imageGeneration: true,
      audioTranscription: true,
    },
    capabilities: [
      ModelCapabilityType.TEXT_GENERATION,
      ModelCapabilityType.TEXT_CLASSIFICATION,
      ModelCapabilityType.IMAGE_GENERATION,
      ModelCapabilityType.IMAGE_CLASSIFICATION,
      ModelCapabilityType.EMBEDDING,
      ModelCapabilityType.CODE_GENERATION,
      ModelCapabilityType.TRANSLATION,
      ModelCapabilityType.SUMMARIZATION,
      ModelCapabilityType.QUESTION_ANSWERING,
      ModelCapabilityType.SENTIMENT_ANALYSIS,
    ]
  }
};

export class ProviderConfigurationService {
  /**
   * Get the built-in template for a provider type
   */
  static getProviderTemplate(type: ProviderType) {
    return PROVIDER_TEMPLATES[type];
  }

  /**
   * Get all available provider types with their templates
   */
  static getAllProviderTemplates() {
    return PROVIDER_TEMPLATES;
  }

  /**
   * Create a default configuration for a provider type
   */
  static createDefaultConfig(
    type: ProviderType,
    overrides: Partial<ProviderConfig> = {}
  ): Partial<ProviderConfig> {
    const template = PROVIDER_TEMPLATES[type];
    if (!template) {
      throw new Error(`No template found for provider type: ${type}`);
    }

    const baseConfig = {
      type,
      name: template.name,
      description: template.description,
      enabled: true,
      baseUrl: template.baseUrl,
      timeout: template.timeout,
      maxRetries: template.maxRetries,
      rateLimiting: template.rateLimiting,
      defaultModel: template.defaultModel,
      supportedModels: template.supportedModels,
      features: template.features,
      ...overrides
    };

    return baseConfig;
  }

  /**
   * Get supported models for a provider type
   */
  static getSupportedModels(type: ProviderType): string[] {
    const template = PROVIDER_TEMPLATES[type];
    return template?.supportedModels || [];
  }

  /**
   * Get capabilities for a provider type
   */
  static getProviderCapabilities(type: ProviderType): ModelCapabilityType[] {
    const template = PROVIDER_TEMPLATES[type];
    return template?.capabilities || [];
  }

  /**
   * Get features for a provider type
   */
  static getProviderFeatures(type: ProviderType): Record<string, boolean> {
    const template = PROVIDER_TEMPLATES[type];
    return template?.features || {};
  }

  /**
   * Validate API key format for a provider type
   */
  static validateApiKeyFormat(type: ProviderType, apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false;

    switch (type) {
      case ProviderType.OPENAI:
        return /^sk-[a-zA-Z0-9]{48}$/.test(apiKey);
      
      case ProviderType.ANTHROPIC:
        return /^sk-ant-api03-[a-zA-Z0-9_-]{95}$/.test(apiKey);
      
      case ProviderType.GOOGLE:
        return /^[a-zA-Z0-9_-]{39}$/.test(apiKey);
      
      case ProviderType.MISTRAL:
        return /^[a-zA-Z0-9]{32}$/.test(apiKey);
      
      case ProviderType.COHERE:
        return /^[a-zA-Z0-9_-]{40}$/.test(apiKey);
      
      case ProviderType.PERPLEXITY:
        return /^pplx-[a-zA-Z0-9]{56}$/.test(apiKey);
      
      case ProviderType.TOGETHER:
        return /^[a-zA-Z0-9]{64}$/.test(apiKey);
      
      case ProviderType.HUGGINGFACE:
        return /^hf_[a-zA-Z0-9]{34}$/.test(apiKey);
      
      default:
        return apiKey.length > 0; // Basic validation for custom providers
    }
  }

  /**
   * Get recommended rate limits for a provider type
   */
  static getRecommendedRateLimits(type: ProviderType) {
    const template = PROVIDER_TEMPLATES[type];
    return template?.rateLimiting;
  }

  /**
   * Get provider-specific configuration hints
   */
  static getConfigurationHints(type: ProviderType): string[] {
    const hints: Record<ProviderType, string[]> = {
      [ProviderType.OPENAI]: [
        'Organization ID is optional but recommended for team accounts',
        'Project ID helps with usage tracking and billing',
        'Consider using gpt-4-turbo for best performance',
        'Enable streaming for better user experience'
      ],
      [ProviderType.ANTHROPIC]: [
        'Claude 3 Opus provides the highest quality responses',
        'Use system prompts for better instruction following',
        'Vision capabilities available in Claude 3 models',
        'Consider rate limits for production usage'
      ],
      [ProviderType.GOOGLE]: [
        'Project ID is required for Google Cloud integration',
        'Location affects model availability and latency',
        'Gemini 1.5 Pro supports up to 1M token context',
        'Multimodal capabilities include text, images, and audio'
      ],
      [ProviderType.MISTRAL]: [
        'Mistral Large offers the best performance',
        'Open-source models available for self-hosting',
        'Function calling supported in latest models',
        'Competitive pricing for high-volume usage'
      ],
      [ProviderType.COHERE]: [
        'Command-R+ optimized for enterprise use cases',
        'Strong multilingual capabilities',
        'Rerank models improve search relevance',
        'Embedding models excel at semantic search'
      ],
      [ProviderType.PERPLEXITY]: [
        'Online models provide real-time web access',
        'Citations included with web-augmented responses',
        'Higher latency due to web search integration',
        'Best for research and fact-checking tasks'
      ],
      [ProviderType.TOGETHER]: [
        'Optimized for open-source model inference',
        'Custom fine-tuning available',
        'Competitive pricing for popular models',
        'Fast inference with dedicated infrastructure'
      ],
      [ProviderType.HUGGINGFACE]: [
        'Access to thousands of community models',
        'Free tier available with rate limits',
        'Model performance varies significantly',
        'Consider dedicated endpoints for production'
      ],
      [ProviderType.CUSTOM]: [
        'Ensure your API follows OpenAI-compatible format',
        'Test authentication and endpoint connectivity',
        'Configure appropriate timeouts and retries',
        'Validate response format compatibility'
      ],
      [ProviderType.UPLOADED]: [
        'Model files should be in supported formats',
        'Ensure sufficient computational resources',
        'Consider model quantization for efficiency',
        'Monitor inference latency and throughput'
      ]
    };

    return hints[type] || [];
  }

  /**
   * Get estimated costs per 1K tokens for a provider
   */
  static getEstimatedCosts(type: ProviderType, modelId?: string): { input: number; output: number } | null {
    // Approximate costs in USD per 1K tokens (as of 2024)
    const costs: Record<string, { input: number; output: number }> = {
      // OpenAI
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      
      // Anthropic
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
      
      // Google
      'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
      'gemini-1.0-pro': { input: 0.0005, output: 0.0015 },
      
      // Mistral
      'mistral-large-latest': { input: 0.008, output: 0.024 },
      'mistral-medium-latest': { input: 0.0027, output: 0.0081 },
      'mistral-small-latest': { input: 0.002, output: 0.006 },
      
      // Cohere
      'command-r-plus': { input: 0.003, output: 0.015 },
      'command-r': { input: 0.0005, output: 0.0015 },
      
      // Perplexity
      'llama-3-sonar-large-32k-online': { input: 0.001, output: 0.001 },
      'llama-3-sonar-small-32k-online': { input: 0.0002, output: 0.0002 },
    };

    if (modelId && costs[modelId]) {
      return costs[modelId];
    }

    // Return default costs for provider type
    const template = PROVIDER_TEMPLATES[type];
    const defaultModel = template?.defaultModel;
    if (defaultModel && costs[defaultModel]) {
      return costs[defaultModel];
    }

    return null;
  }
} 