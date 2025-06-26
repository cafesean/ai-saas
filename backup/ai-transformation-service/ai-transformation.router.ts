import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST } from "@/constants/errorCode";
import {
  aiTransformationRequestSchema,
  enhancedModelMetadataSchema,
  type AITransformationRequestSchema,
} from "@/schemas/model.schema";
import { aiTransformationService } from "@/services/ai-transformation.service";

/**
 * tRPC Router for AI Transformation Service (SAAS-265)
 * 
 * Provides comprehensive API endpoints for AI-powered metadata transformation,
 * enhancement, and quality validation.
 */
export const aiTransformationRouter = createTRPCRouter({
  /**
   * Transform raw metadata using AI-powered enhancement
   */
  transformMetadata: protectedProcedure
    .input(aiTransformationRequestSchema)
    .mutation(async ({ input }) => {
      try {
        await aiTransformationService.initialize();
        return await aiTransformationService.transformMetadata(input);
      } catch (error) {
        console.error("AI transformation error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: `AI transformation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Batch transform multiple metadata objects
   */
  batchTransform: protectedProcedure
    .input(z.object({
      requests: z.array(aiTransformationRequestSchema),
      options: z.object({
        skipErrors: z.boolean().default(true),
        maxConcurrency: z.number().min(1).max(10).default(3),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await aiTransformationService.initialize();
        return await aiTransformationService.batchTransformMetadata(
          input.requests,
          input.options
        );
      } catch (error) {
        console.error("Batch transformation error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: `Batch transformation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Enhance existing metadata with AI suggestions
   */
  enhanceMetadata: protectedProcedure
    .input(z.object({
      existingMetadata: enhancedModelMetadataSchema,
      sourceData: z.record(z.any()),
      hints: z.object({
        focusAreas: z.array(z.string()).optional(),
        preserveFields: z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await aiTransformationService.initialize();
        return await aiTransformationService.enhanceMetadata(
          input.existingMetadata,
          input.sourceData,
          input.hints
        );
      } catch (error) {
        console.error("Metadata enhancement error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: `Metadata enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Validate metadata completeness and quality
   */
  validateQuality: protectedProcedure
    .input(z.object({
      metadata: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      try {
        await aiTransformationService.initialize();
        return await aiTransformationService.validateMetadataQuality(input.metadata);
      } catch (error) {
        console.error("Quality validation error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: `Quality validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get transformation service health and capabilities
   */
  getServiceHealth: protectedProcedure
    .query(async () => {
      try {
        await aiTransformationService.initialize();
        
        // Test basic functionality
        const testRequest: AITransformationRequestSchema = {
          sourceData: { test: "data" },
          sourceType: "custom",
          targetSchema: "metadata",
        };
        
        const testResult = await aiTransformationService.transformMetadata(testRequest);
        
        return {
          status: "healthy",
          initialized: true,
          capabilities: {
            transformation: true,
            batchProcessing: true,
            qualityValidation: true,
            enhancement: true,
          },
          testResult: {
            success: testResult.success,
            confidence: testResult.confidence,
          },
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Service health check failed:", error);
        return {
          status: "unhealthy",
          initialized: false,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date(),
        };
      }
    }),

  /**
   * Get supported transformation types and configurations
   */
  getCapabilities: protectedProcedure
    .query(async () => {
      return {
        sourceTypes: [
          {
            type: "huggingface",
            description: "HuggingFace model cards and configurations",
            supportedFormats: ["model_card", "config.json", "tokenizer_config.json"],
          },
          {
            type: "openai",
            description: "OpenAI model specifications and API responses",
            supportedFormats: ["api_response", "model_spec"],
          },
          {
            type: "custom",
            description: "Custom JSON formats with flexible interpretation",
            supportedFormats: ["json", "yaml", "toml"],
          },
          {
            type: "manual",
            description: "Manually provided metadata for validation and enhancement",
            supportedFormats: ["structured_json"],
          },
        ],
        targetSchemas: [
          {
            schema: "metadata",
            description: "Enhanced model metadata schema",
            fields: ["modelInfo", "trainingInfo", "performanceMetrics", "features", "inputSchema", "outputSchema"],
          },
          {
            schema: "model",
            description: "Basic model information schema",
            fields: ["name", "description", "type", "framework"],
          },
          {
            schema: "provider_config",
            description: "Provider-specific configuration schema",
            fields: ["apiKey", "endpoint", "model", "parameters"],
          },
        ],
        qualityMetrics: [
          {
            metric: "completeness",
            description: "Percentage of required fields present",
            range: "0-1",
          },
          {
            metric: "confidence",
            description: "AI confidence in transformation accuracy",
            range: "0-1",
          },
          {
            metric: "score",
            description: "Overall quality score combining multiple factors",
            range: "0-1",
          },
        ],
        transformationHints: [
          "modelType",
          "expectedFields",
          "customInstructions",
        ],
      };
    }),

  /**
   * Get transformation statistics and usage metrics
   */
  getStatistics: protectedProcedure
    .input(z.object({
      timeRange: z.enum(["1h", "24h", "7d", "30d"]).default("24h"),
      groupBy: z.enum(["hour", "day", "source_type"]).optional(),
    }))
    .query(async ({ input }) => {
      // Note: In a real implementation, this would query a metrics store
      // For now, return mock statistics
      return {
        timeRange: input.timeRange,
        totalTransformations: 0,
        successfulTransformations: 0,
        failedTransformations: 0,
        averageConfidence: 0,
        averageProcessingTime: 0,
        sourceTypeBreakdown: {
          huggingface: 0,
          openai: 0,
          custom: 0,
          manual: 0,
        },
        qualityDistribution: {
          high: 0, // confidence > 0.8
          medium: 0, // confidence 0.5-0.8
          low: 0, // confidence < 0.5
        },
        timestamp: new Date(),
        note: "Statistics collection will be implemented in future updates",
      };
    }),

  /**
   * Test transformation with sample data
   */
  testTransformation: protectedProcedure
    .input(z.object({
      sampleType: z.enum(["huggingface_card", "openai_spec", "custom_json"]),
    }))
    .mutation(async ({ input }) => {
      try {
        await aiTransformationService.initialize();
        
        // Sample data for testing
        const sampleData = {
          huggingface_card: {
            model_name: "bert-base-uncased",
            language: "en",
            license: "apache-2.0",
            tags: ["transformers", "pytorch", "bert"],
            datasets: ["wikipedia", "bookcorpus"],
            metrics: {
              accuracy: 0.85,
              f1: 0.82,
            },
          },
          openai_spec: {
            id: "gpt-3.5-turbo",
            object: "model",
            created: 1677610602,
            owned_by: "openai",
            context_length: 4096,
            capabilities: ["text-generation", "chat"],
          },
          custom_json: {
            name: "custom-classifier",
            type: "classification",
            framework: "scikit-learn",
            accuracy: 0.92,
            features: ["feature1", "feature2", "feature3"],
          },
        };

        const testRequest: AITransformationRequestSchema = {
          sourceData: sampleData[input.sampleType],
          sourceType: input.sampleType.split("_")[0] as any,
          targetSchema: "metadata",
          transformationHints: {
            customInstructions: "This is a test transformation for demonstration purposes",
          },
        };

        const result = await aiTransformationService.transformMetadata(testRequest);
        
        return {
          ...result,
          testData: {
            input: testRequest,
            sampleType: input.sampleType,
          },
        };
      } catch (error) {
        console.error("Test transformation error:", error);
        throw new TRPCError({
          code: `${INTERNAL_SERVER_ERROR}` as TRPCError["code"],
          message: `Test transformation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
}); 