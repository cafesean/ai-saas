import { z } from "zod";
import { createTRPCRouter, protectedProcedure, withPermission } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { providerService } from "@/services/provider.service";
import {
  RegisterProviderInputSchema,
  UpdateProviderConfigInputSchema,
  InferenceInputSchema,
  AutoInferenceInputSchema,
  ListModelsInputSchema,
  GetModelInputSchema,
  ProviderHealthCheckInputSchema,
  ValidateProviderConfigInputSchema,
  BulkProviderOperationSchema,
  ProviderResponseSchema,
  ProviderModelListSchema,
  ProviderModelSchema,
  ProviderHealthSchema,
  ProviderConfigValidationResultSchema,
  ProviderRegistryStatsSchema,
  ProviderListResponseSchema,
  BulkProviderResultSchema,
  ProviderTypeSchema,
} from "@/schemas/provider.schema";

export const providerRouter = createTRPCRouter({
  // Provider Management Operations

  /**
   * Register a new provider (backoffice - role-based access only)
   */
  register: withPermission("provider:create")
    .input(RegisterProviderInputSchema)
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await providerService.registerProvider(input as any);

        return {
          success: true,
          message: `Provider ${input.providerId} registered successfully`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to register provider: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Unregister a provider
   */
  unregister: withPermission("provider:delete")
    .input(z.object({ providerId: z.string() }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await providerService.unregisterProvider(input.providerId);

        return {
          success: true,
          message: `Provider ${input.providerId} unregistered successfully`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to unregister provider: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Update provider configuration
   */
  updateConfig: withPermission("provider:update")
    .input(UpdateProviderConfigInputSchema)
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await providerService.updateProviderConfig(input.providerId, input.config);

        return {
          success: true,
          message: `Provider ${input.providerId} configuration updated`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update provider: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * List all providers (backoffice - no org scoping)
   */
  list: withPermission("provider:read")
    .input(z.object({
      type: ProviderTypeSchema.optional(),
      activeOnly: z.boolean().default(false),
    }))
    .output(ProviderListResponseSchema)
    .query(async ({ input }) => {
      try {
        let providers = input.activeOnly 
          ? await providerService.getActiveProviders()
          : await providerService.listProviders();

        // Filter by type only (no org scoping for backoffice)
        if (input.type) {
          providers = providers.filter(provider => provider.type === input.type);
        }

        return providers.map(provider => ({
          id: provider.id,
          type: provider.type,
          name: provider.config.name,
          description: provider.config.description,
          enabled: provider.config.enabled,
          isInitialized: provider.isInitialized,
          status: "active" as const, // TODO: Get actual status from provider
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to list providers: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Get specific provider details
   */
  get: withPermission("provider:read")
    .input(z.object({ providerId: z.string() }))
    .output(z.object({
      id: z.string(),
      type: ProviderTypeSchema,
      config: z.record(z.any()),
      isInitialized: z.boolean(),
      health: ProviderHealthSchema.optional(),
    }))
    .query(async ({ input }) => {
      const provider = await providerService.getProvider(input.providerId);
      if (!provider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Provider ${input.providerId} not found`,
        });
      }

      try {
        const health = await providerService.checkProviderHealth(input.providerId);
        
        return {
          id: input.providerId,
          type: provider.type,
          config: provider.config,
          isInitialized: provider.isInitialized,
          health,
        };
      } catch {
        return {
          id: input.providerId,
          type: provider.type,
          config: provider.config,
          isInitialized: provider.isInitialized,
        };
      }
    }),

  // Model Operations

  /**
   * List models from a specific provider
   */
  listModels: withPermission("provider:read")
    .input(ListModelsInputSchema)
    .output(ProviderModelListSchema)
    .query(async ({ input }) => {
      return await providerService.listModels(input.providerId, input.filters);
    }),

  /**
   * List all models from all active providers
   */
  listAllModels: withPermission("provider:read")
    .input(z.object({}))
    .output(z.record(ProviderModelListSchema))
    .query(async () => {
      return await providerService.listAllModels();
    }),

  /**
   * Get specific model from a provider
   */
  getModel: withPermission("provider:read")
    .input(GetModelInputSchema)
    .output(ProviderModelSchema)
    .query(async ({ input }) => {
      return await providerService.getModel(input.providerId, input.modelId);
    }),

  // Health and Monitoring

  /**
   * Check health of a specific provider
   */
  healthCheck: withPermission("provider:health")
    .input(ProviderHealthCheckInputSchema)
    .output(ProviderHealthSchema)
    .query(async ({ input }) => {
      return await providerService.checkProviderHealth(input.providerId);
    }),

  /**
   * Check health of all providers
   */
  healthCheckAll: withPermission("provider:health")
    .input(z.object({}))
    .output(z.record(z.any()))
    .query(async () => {
      return await providerService.checkAllProvidersHealth();
    }),

  // Configuration and Validation

  /**
   * Validate provider configuration without creating
   */
  validateConfig: withPermission("provider:create")
    .input(ValidateProviderConfigInputSchema)
    .output(ProviderConfigValidationResultSchema)
    .mutation(async ({ input }) => {
      return providerService.validateProviderConfig(input.config);
    }),

  /**
   * Get supported provider types
   */
  getSupportedTypes: withPermission("provider:read")
    .input(z.object({}))
    .output(z.array(ProviderTypeSchema))
    .query(async () => {
      return providerService.getSupportedProviderTypes();
    }),

  /**
   * Get registry statistics
   */
  getStats: withPermission("provider:read")
    .input(z.object({}))
    .output(ProviderRegistryStatsSchema)
    .query(async () => {
      return await providerService.getRegistryStats();
    }),

  /**
   * Test provider connection
   */
  testConnection: withPermission("provider:test")
    .input(z.object({ providerId: z.string() }))
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
      latency: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const startTime = Date.now();
        const health = await providerService.checkProviderHealth(input.providerId);
        const latency = Date.now() - startTime;

        return {
          success: health.status === "active",
          message: health.status === "active" ? "Connection successful" : `Provider status: ${health.status}`,
          latency,
        };
      } catch (error) {
        return {
          success: false,
          message: `Connection failed: ${(error as Error).message}`,
        };
      }
    }),

  // Bulk Operations

  /**
   * Perform bulk operations on multiple providers
   */
  bulkOperation: withPermission("provider:update")
    .input(BulkProviderOperationSchema)
    .output(BulkProviderResultSchema)
    .mutation(async ({ input }) => {
      const successful: string[] = [];
      const failed: Array<{ providerId: string; error: string }> = [];

      for (const providerId of input.providerIds) {
        try {
          switch (input.operation) {
            case "health_check":
              await providerService.checkProviderHealth(providerId);
              break;
            case "restart":
              // TODO: Implement restart functionality
              throw new Error("Restart operation not yet implemented");
            case "disable":
              await providerService.updateProviderConfig(providerId, { enabled: false });
              break;
            case "enable":
              await providerService.updateProviderConfig(providerId, { enabled: true });
              break;
          }
          successful.push(providerId);
        } catch (error) {
          failed.push({
            providerId,
            error: (error as Error).message,
          });
        }
      }

      return { successful, failed };
    }),
});