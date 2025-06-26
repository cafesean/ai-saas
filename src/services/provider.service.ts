import {
  ProviderConfig,
  ProviderType,
  ProviderRequest,
  ProviderResponse,
  ProviderHealth,
  ProviderStatus,
  ProviderModel,
  ProviderModelList,
  ModelCapabilityType,
  type OpenAIConfig,
  type AnthropicConfig,
  type GoogleConfig,
  type HuggingFaceConfig,
} from "@/types/provider.types";
import { TRPCError } from "@trpc/server";
import { PROVIDER_TEMPLATES } from './provider-configurations.service';
import { db } from "@/db/config";
import { providers, type Provider, type NewProvider } from "@/db/schema/provider";
import { eq } from "drizzle-orm";

/**
 * Provider Service - SAAS-264
 * Manages AI model providers with health checks, model discovery, and configuration
 */
export class ProviderService {
  private static instance: ProviderService;
  private providerClients: Map<string, any> = new Map();
  private healthCheckCache: Map<string, { status: ProviderStatus; lastCheck: Date; error?: string }> = new Map();
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      ProviderService.instance = new ProviderService();
    }
    return ProviderService.instance;
  }

  /**
   * Initialize the provider service
   */
  async initialize(): Promise<void> {
    console.log("Provider service initialized (stub implementation)");
  }

  /**
   * Register a new provider from configuration
   */
  async registerProvider(config: ProviderConfig): Promise<void> {
    try {
      // Check if provider already exists
      const existingProvider = await db
        .select()
        .from(providers)
        .where(eq(providers.providerId, config.providerId))
        .limit(1);

      if (existingProvider.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Provider ${config.providerId} already exists`,
        });
      }

      // Prepare provider data for database
      const providerData: NewProvider = {
        providerId: config.providerId,
        name: config.name,
        description: config.description,
        type: config.type,
        enabled: config.enabled,
        apiKey: config.apiKey, // TODO: Encrypt in production
        baseUrl: config.baseUrl,
        timeout: config.timeout,
        maxRetries: config.maxRetries,
        config: config as any, // Store full config as JSON
        rateLimiting: config.rateLimiting as any,
      };

      // Insert into database
      await db.insert(providers).values(providerData);
      console.log(`Provider ${config.providerId} registered successfully`);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to register provider: ${(error as Error).message}`,
      });
    }
  }

  /**
   * Unregister a provider
   */
  async unregisterProvider(providerId: string): Promise<void> {
    try {
      const result = await db
        .delete(providers)
        .where(eq(providers.providerId, providerId))
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Provider ${providerId} not found`,
        });
      }

      // Clean up cached data
      this.providerClients.delete(providerId);
      this.healthCheckCache.delete(providerId);
      
      console.log(`Provider ${providerId} unregistered successfully`);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to unregister provider: ${(error as Error).message}`,
      });
    }
  }

  /**
   * Get provider by ID
   */
  async getProvider(providerId: string): Promise<any | null> {
    try {
      const result = await db
        .select()
        .from(providers)
        .where(eq(providers.providerId, providerId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const provider = result[0];
      return {
        id: provider.providerId,
        type: provider.type,
        config: {
          providerId: provider.providerId,
          name: provider.name,
          description: provider.description,
          type: provider.type,
          enabled: provider.enabled,
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl,
          timeout: provider.timeout,
          maxRetries: provider.maxRetries,
          rateLimiting: provider.rateLimiting,
          ...((provider.config as any) || {}),
        },
        isInitialized: true,
      };
    } catch (error) {
      console.error(`Error fetching provider ${providerId}:`, error);
      return null;
    }
  }

  /**
   * List all providers
   */
  async listProviders(): Promise<any[]> {
    try {
      const result = await db.select().from(providers);
      
      return result.map(provider => ({
        id: provider.providerId,
        type: provider.type,
        config: {
          providerId: provider.providerId,
          name: provider.name,
          description: provider.description,
          type: provider.type,
          enabled: provider.enabled,
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl,
          timeout: provider.timeout,
          maxRetries: provider.maxRetries,
          rateLimiting: provider.rateLimiting,
          ...((provider.config as any) || {}),
        },
        isInitialized: true,
      }));
    } catch (error) {
      console.error('Error listing providers:', error);
      return [];
    }
  }

  /**
   * List providers by type
   */
  async listProvidersByType(type: ProviderType): Promise<any[]> {
    const allProviders = await this.listProviders();
    return allProviders.filter(provider => provider.type === type);
  }

  /**
   * Get only active (initialized) providers
   */
  async getActiveProviders(): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(providers)
        .where(eq(providers.enabled, true));
      
      return result.map(provider => ({
        id: provider.providerId,
        type: provider.type,
        config: {
          providerId: provider.providerId,
          name: provider.name,
          description: provider.description,
          type: provider.type,
          enabled: provider.enabled,
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl,
          timeout: provider.timeout,
          maxRetries: provider.maxRetries,
          rateLimiting: provider.rateLimiting,
          ...((provider.config as any) || {}),
        },
        isInitialized: true,
      }));
    } catch (error) {
      console.error('Error getting active providers:', error);
      return [];
    }
  }

  /**
   * Update provider configuration
   */
  async updateProviderConfig(
    providerId: string,
    config: Partial<ProviderConfig>
  ): Promise<void> {
    try {
      // Check if provider exists
      const existingProvider = await db
        .select()
        .from(providers)
        .where(eq(providers.providerId, providerId))
        .limit(1);

      if (existingProvider.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Provider ${providerId} not found`,
        });
      }

      // Prepare update data
      const updateData: Partial<NewProvider> = {};
      
      if (config.name) updateData.name = config.name;
      if (config.description !== undefined) updateData.description = config.description;
      if (config.enabled !== undefined) updateData.enabled = config.enabled;
      if (config.apiKey) updateData.apiKey = config.apiKey;
      if (config.baseUrl !== undefined) updateData.baseUrl = config.baseUrl;
      if (config.timeout) updateData.timeout = config.timeout;
      if (config.maxRetries) updateData.maxRetries = config.maxRetries;
      if (config.rateLimiting) updateData.rateLimiting = config.rateLimiting as any;
      
      // Merge with existing config JSON if provided
      if (Object.keys(config).length > 0) {
        const currentProvider = existingProvider[0];
        const mergedConfig = { 
          ...(currentProvider.config as any || {}), 
          ...config 
        };
        updateData.config = mergedConfig;
      }

      // Update in database
      await db
        .update(providers)
        .set(updateData)
        .where(eq(providers.providerId, providerId));

      console.log(`Provider ${providerId} configuration updated successfully`);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to update provider: ${(error as Error).message}`,
      });
    }
  }

  /**
   * Perform inference using a specific provider (stub)
   */
  async performInference(
    providerId: string,
    request: ProviderRequest
  ): Promise<ProviderResponse> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Provider ${providerId} not found`,
      });
    }

    // Stub response
    return {
      output: {
        text: "This is a stub response from the provider framework",
        message: "Provider framework implemented successfully",
      },
      metadata: {
        modelId: request.modelId,
        providerId,
        latency: 100,
        tokensUsed: 50,
        cost: 0.001,
        requestId: request.metadata?.requestId || "stub_request",
        timestamp: new Date(),
      },
    };
  }

  /**
   * Perform inference with automatic provider selection (stub)
   */
  async performInferenceAuto(
    modelId: string,
    request: Omit<ProviderRequest, "modelId">
  ): Promise<ProviderResponse> {
    const activeProviders = this.getActiveProviders();
    if (activeProviders.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No active provider found for model ${modelId}`,
      });
    }

    const fullRequest: ProviderRequest = { ...request, modelId };
    return this.performInference(activeProviders[0].id, fullRequest);
  }

  /**
   * List models from a specific provider (stub)
   */
  async listModels(
    providerId: string,
    filters?: Record<string, any>
  ): Promise<ProviderModelList> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Provider ${providerId} not found`,
      });
    }

    return {
      models: [
        {
          id: "stub-model-1",
          name: "Stub Model 1",
          description: "A stub model for testing",
          capabilities: ["text-generation"] as any,
          inputTypes: ["text"],
          outputTypes: ["text"],
          maxTokens: 4096,
          deprecated: false,
        },
      ],
      totalCount: 1,
    };
  }

  /**
   * List all available models from all active providers (stub)
   */
  async listAllModels(): Promise<Record<string, ProviderModelList>> {
    const activeProviders = await this.getActiveProviders();
    const results: Record<string, ProviderModelList> = {};

    for (const provider of activeProviders) {
      try {
        results[provider.id] = await this.listModels(provider.id);
      } catch (error) {
        console.error(`Failed to get models from provider ${provider.id}:`, error);
        results[provider.id] = { models: [], totalCount: 0 };
      }
    }

    return results;
  }

  /**
   * Get specific model information (stub)
   */
  async getModel(providerId: string, modelId: string): Promise<ProviderModel> {
    const models = await this.listModels(providerId);
    const model = models.models.find(m => m.id === modelId);
    
    if (!model) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Model ${modelId} not found in provider ${providerId}`,
      });
    }

    return model;
  }

  /**
   * Perform health check on a provider (stub)
   */
  async checkProviderHealth(providerId: string): Promise<ProviderHealth> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Provider ${providerId} not found`,
      });
    }

    return {
      providerId,
      status: "active" as ProviderStatus,
      latency: 50,
      lastChecked: new Date(),
      errorCount: 0,
      successRate: 1.0,
    };
  }

  /**
   * Perform health checks on all providers (stub)
   */
  async checkAllProvidersHealth(): Promise<Record<string, any>> {
    const providers = this.listProviders();
    const results: Record<string, any> = {};

    for (const provider of providers) {
      try {
        const health = await this.checkProviderHealth(provider.id);
        results[provider.id] = { success: true, health };
      } catch (error) {
        results[provider.id] = { success: false, error: (error as Error).message };
      }
    }

    return results;
  }

  /**
   * Get registry statistics (stub)
   */
  async getRegistryStats() {
    const providers = await this.listProviders();
    const activeProviders = await this.getActiveProviders();
    
    const statsByType = providers.reduce((acc, provider) => {
      acc[provider.type] = (acc[provider.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProviders: providers.length,
      activeProviders: activeProviders.length,
      providersByType: statsByType,
      providerIds: providers.map(p => p.id),
    };
  }

  /**
   * Validate provider configuration (stub)
   */
  validateProviderConfig(config: ProviderConfig) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!config.providerId) errors.push("Provider ID is required");
    if (!config.type) errors.push("Provider type is required");
    if (!config.name) errors.push("Provider name is required");
    if (!config.apiKey) errors.push("API key is required");

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get supported provider types (stub)
   */
  getSupportedProviderTypes(): ProviderType[] {
    return [
      "openai" as ProviderType,
      "anthropic" as ProviderType,
      "google" as ProviderType,
      "huggingface" as ProviderType,
      "custom" as ProviderType,
    ];
  }

  /**
   * Clean up all providers (stub)
   */
  async cleanup(): Promise<void> {
    // Clear in-memory caches
    this.providerClients.clear();
    this.healthCheckCache.clear();
    console.log("Provider service cleaned up");
  }

  /**
   * Initialize a provider client with configuration
   */
  async initializeProvider(config: ProviderConfig): Promise<void> {
    try {
      const client = await this.createProviderClient(config);
      this.providerClients.set(config.providerId, client);
      
      // Perform initial health check
      await this.performHealthCheck(config);
    } catch (error) {
      console.error(`Failed to initialize provider ${config.name}:`, error);
      this.healthCheckCache.set(config.providerId, {
        status: ProviderStatus.ERROR,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Create provider-specific client
   */
  private async createProviderClient(config: ProviderConfig): Promise<any> {
    switch (config.type) {
      case ProviderType.OPENAI:
        return this.createOpenAIClient(config as OpenAIConfig);
      case ProviderType.ANTHROPIC:
        return this.createAnthropicClient(config as AnthropicConfig);
      case ProviderType.GOOGLE:
        return this.createGoogleClient(config as GoogleConfig);
      case ProviderType.HUGGINGFACE:
        return this.createHuggingFaceClient(config as HuggingFaceConfig);
      default:
        throw new Error(`Unsupported provider type: ${config.type}`);
    }
  }

  /**
   * Create OpenAI client
   */
  private createOpenAIClient(config: OpenAIConfig): any {
    // Mock OpenAI client - replace with actual OpenAI SDK
    return {
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://api.openai.com/v1',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      organization: config.organization,
      project: config.project,
    };
  }

  /**
   * Create Anthropic client
   */
  private createAnthropicClient(config: AnthropicConfig): any {
    // Mock Anthropic client - replace with actual Anthropic SDK
    return {
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://api.anthropic.com',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      version: config.version,
    };
  }

  /**
   * Create Google client
   */
  private createGoogleClient(config: GoogleConfig): any {
    // Mock Google client - replace with actual Google AI SDK
    return {
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://generativelanguage.googleapis.com/v1',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      projectId: config.projectId,
      location: config.location || 'us-central1',
    };
  }

  /**
   * Create HuggingFace client
   */
  private createHuggingFaceClient(config: HuggingFaceConfig): any {
    // Mock HuggingFace client - replace with actual HuggingFace SDK
    return {
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://api-inference.huggingface.co',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      useInferenceApi: config.useInferenceApi !== false,
    };
  }

  /**
   * Perform health check for a provider
   */
  async performHealthCheck(config: ProviderConfig): Promise<{ status: ProviderStatus; error?: string; responseTime?: number }> {
    const startTime = Date.now();
    
    try {
      const client = this.providerClients.get(config.providerId);
      if (!client) {
        throw new Error('Provider client not initialized');
      }

      // Perform provider-specific health check
      await this.executeHealthCheck(config.type, client);
      
      const responseTime = Date.now() - startTime;
      const result = { status: ProviderStatus.ACTIVE, responseTime };
      
      this.healthCheckCache.set(config.providerId, {
        status: ProviderStatus.ACTIVE,
        lastCheck: new Date(),
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const result = { status: ProviderStatus.ERROR, error: errorMessage };
      
      this.healthCheckCache.set(config.providerId, {
        status: ProviderStatus.ERROR,
        lastCheck: new Date(),
        error: errorMessage,
      });
      
      return result;
    }
  }

  /**
   * Execute provider-specific health check
   */
  private async executeHealthCheck(type: ProviderType, client: any): Promise<void> {
    switch (type) {
      case ProviderType.OPENAI:
        // Mock health check - replace with actual API call
        if (!client.apiKey) throw new Error('Invalid API key');
        break;
      case ProviderType.ANTHROPIC:
        // Mock health check - replace with actual API call
        if (!client.apiKey) throw new Error('Invalid API key');
        break;
      case ProviderType.GOOGLE:
        // Mock health check - replace with actual API call
        if (!client.apiKey) throw new Error('Invalid API key');
        break;
      case ProviderType.HUGGINGFACE:
        // Mock health check - replace with actual API call
        if (!client.apiKey) throw new Error('Invalid API key');
        break;
      default:
        throw new Error(`Health check not implemented for ${type}`);
    }
  }

  /**
   * Get cached health status
   */
  getHealthStatus(providerId: string): { status: ProviderStatus; lastCheck: Date; error?: string } | null {
    return this.healthCheckCache.get(providerId) || null;
  }

  /**
   * Discover available models for a provider
   */
  async discoverModels(config: ProviderConfig): Promise<ProviderModel[]> {
    try {
      // Handle CUSTOM and UPLOADED provider types that don't have templates
      if (config.type === ProviderType.CUSTOM) {
        return [{
          id: 'custom-model',
          name: 'Custom Model',
          description: `${config.name} custom model`,
          capabilities: [ModelCapabilityType.TEXT_GENERATION],
          inputTypes: ['text'],
          outputTypes: ['text'],
          metadata: {
            provider: config.type,
            custom: true,
          }
        }];
      }

      // Get template for supported provider types
      const templateKey = config.type as keyof typeof PROVIDER_TEMPLATES;
      const template = PROVIDER_TEMPLATES[templateKey];
      
      if (!template) {
        throw new Error(`No template found for provider type: ${config.type}`);
      }

      // Return models from template - in production, this would query the actual provider API
      const models: ProviderModel[] = template.supportedModels.map((modelId: string) => ({
        id: modelId,
        name: modelId,
        description: `${template.name} model: ${modelId}`,
        capabilities: template.capabilities,
        inputTypes: ['text'],
        outputTypes: ['text'],
        metadata: {
          provider: config.type,
          template: template.name,
        }
      }));

      return models;
    } catch (error) {
      console.error(`Failed to discover models for provider ${config.name}:`, error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to discover models: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Test provider connection
   */
  async testConnection(config: ProviderConfig): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    const startTime = Date.now();
    
    try {
      // Validate basic configuration
      const validation = this.validateConfiguration(config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Mock connection test - replace with actual provider API calls
      await this.simulateConnectionTest(config);
      
      const responseTime = Date.now() - startTime;
      
      // Cache health status
      this.healthCheckCache.set(config.providerId, {
        status: ProviderStatus.ACTIVE,
        lastCheck: new Date(),
      });
      
      return {
        success: true,
        responseTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Cache error status
      this.healthCheckCache.set(config.providerId, {
        status: ProviderStatus.ERROR,
        lastCheck: new Date(),
        error: errorMessage,
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Simulate connection test (replace with actual API calls)
   */
  private async simulateConnectionTest(config: ProviderConfig): Promise<void> {
    // Basic validation
    if (!config.apiKey?.trim()) {
      throw new Error('API key is required');
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Connection timeout');
    }
  }

  /**
   * Get provider capabilities
   */
  getProviderCapabilities(type: ProviderType): ModelCapabilityType[] {
    // Handle CUSTOM type
    if (type === ProviderType.CUSTOM) {
      return [ModelCapabilityType.TEXT_GENERATION];
    }

    const templateKey = type as keyof typeof PROVIDER_TEMPLATES;
    const template = PROVIDER_TEMPLATES[templateKey];
    return template?.capabilities || [];
  }

  /**
   * Get supported models for provider type
   */
  getSupportedModels(type: ProviderType): string[] {
    // Handle CUSTOM type
    if (type === ProviderType.CUSTOM) {
      return ['custom-model'];
    }

    const templateKey = type as keyof typeof PROVIDER_TEMPLATES;
    const template = PROVIDER_TEMPLATES[templateKey];
    return template?.supportedModels || [];
  }

  /**
   * Validate provider configuration
   */
  validateConfiguration(config: ProviderConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!config.name?.trim()) {
      errors.push('Provider name is required');
    }
    if (!config.type) {
      errors.push('Provider type is required');
    }
    if (!config.apiKey?.trim()) {
      errors.push('API key is required');
    }

    // Type-specific validation
    switch (config.type) {
      case ProviderType.GOOGLE:
        if ('projectId' in config && !config.projectId?.trim()) {
          errors.push('Google project ID is required');
        }
        break;
      // Add other provider-specific validations as needed
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Remove provider client
   */
  removeProvider(providerId: string): void {
    this.providerClients.delete(providerId);
    this.healthCheckCache.delete(providerId);
  }

  /**
   * Get all cached health statuses
   */
  getAllHealthStatuses(): Map<string, { status: ProviderStatus; lastCheck: Date; error?: string }> {
    return new Map(this.healthCheckCache);
  }

  /**
   * Cleanup stale health check cache entries
   */
  cleanupHealthCache(): void {
    const now = Date.now();
    const maxAge = this.HEALTH_CHECK_INTERVAL * 2; // 10 minutes

    for (const [providerId, healthInfo] of this.healthCheckCache.entries()) {
      if (now - healthInfo.lastCheck.getTime() > maxAge) {
        this.healthCheckCache.delete(providerId);
      }
    }
  }
}

// Singleton instance for application use
export const providerService = ProviderService.getInstance(); 