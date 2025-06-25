import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  aiTransformationRequestSchema,
  aiTransformationResponseSchema,
  enhancedModelMetadataSchema,
  type AITransformationRequestSchema,
  type AITransformationResponseSchema,
  type EnhancedModelMetadataSchema,
} from "@/schemas/model.schema";
import { ProviderService } from "./provider.service";
import { ProviderType, ProviderRequest } from "@/types/provider.types";

/**
 * AI-powered metadata transformation service for EPIC-4 SAAS-265
 * 
 * This service provides intelligent enhancement and standardization of model metadata
 * using Large Language Models (LLMs) through the provider framework.
 */
export class AITransformationService {
  private providerService: ProviderService;
  
  // Configuration for transformation quality
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  private readonly MAX_RETRIES = 2;
  private readonly TRANSFORMATION_TIMEOUT = 30000; // 30 seconds

  constructor() {
    this.providerService = new ProviderService();
  }

  /**
   * Initialize the AI transformation service
   */
  async initialize(): Promise<void> {
    await this.providerService.initialize();
    console.log("AI Transformation Service initialized");
  }

  /**
   * Transform raw metadata using AI-powered enhancement
   */
  async transformMetadata(
    request: AITransformationRequestSchema
  ): Promise<AITransformationResponseSchema> {
    try {
      // Validate input request
      const validatedRequest = aiTransformationRequestSchema.parse(request);
      
      // Select appropriate transformation strategy
      const strategy = this.selectTransformationStrategy(validatedRequest);
      
      // Perform the transformation
      const result = await this.performTransformation(validatedRequest, strategy);
      
      // Validate and score the result
      const validatedResult = await this.validateAndScore(result, validatedRequest);
      
      return validatedResult;
    } catch (error) {
      console.error("AI transformation error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `AI transformation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }

  /**
   * Batch transform multiple metadata objects
   */
  async batchTransformMetadata(
    requests: AITransformationRequestSchema[],
    options: {
      skipErrors?: boolean;
      maxConcurrency?: number;
    } = {}
  ): Promise<{
    results: Array<{
      success: boolean;
      result?: AITransformationResponseSchema;
      error?: string;
      index: number;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
      averageConfidence: number;
    };
  }> {
    const { skipErrors = true, maxConcurrency = 3 } = options;
    const results = [];
    let totalConfidence = 0;
    let successfulCount = 0;

    // Process in batches to avoid overwhelming the LLM provider
    for (let i = 0; i < requests.length; i += maxConcurrency) {
      const batch = requests.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(async (request, batchIndex) => {
        const index = i + batchIndex;
        try {
          const result = await this.transformMetadata(request);
          totalConfidence += result.confidence;
          successfulCount++;
          return {
            success: true,
            result,
            index,
          };
        } catch (error) {
          if (!skipErrors) {
            throw error;
          }
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            index,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return {
      results,
      summary: {
        total: requests.length,
        successful: successfulCount,
        failed: requests.length - successfulCount,
        averageConfidence: successfulCount > 0 ? totalConfidence / successfulCount : 0,
      },
    };
  }

  /**
   * Enhance existing metadata with AI suggestions
   */
  async enhanceMetadata(
    existingMetadata: EnhancedModelMetadataSchema,
    sourceData: Record<string, any>,
    hints?: {
      focusAreas?: string[];
      preserveFields?: string[];
    }
  ): Promise<AITransformationResponseSchema> {
    const enhancementRequest: AITransformationRequestSchema = {
      sourceData: {
        existing: existingMetadata,
        additional: sourceData,
      },
      sourceType: "custom",
      targetSchema: "metadata",
      transformationHints: {
        customInstructions: `Enhance existing metadata with additional information. ${
          hints?.focusAreas ? `Focus on: ${hints.focusAreas.join(", ")}. ` : ""
        }${
          hints?.preserveFields ? `Preserve these fields: ${hints.preserveFields.join(", ")}. ` : ""
        }`,
      },
    };

    return this.transformMetadata(enhancementRequest);
  }

  /**
   * Validate metadata completeness and quality
   */
  async validateMetadataQuality(
    metadata: Record<string, any>
  ): Promise<{
    score: number;
    completeness: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      // Check against enhanced schema
      const parseResult = enhancedModelMetadataSchema.safeParse(metadata);
      
      let completeness = 0;
      const issues = [];
      const recommendations = [];

      if (parseResult.success) {
        // Calculate completeness score
        const requiredFields = ["modelInfo", "performanceMetrics", "inputSchema", "outputSchema"];
        const presentFields = requiredFields.filter(field => metadata[field]);
        completeness = presentFields.length / requiredFields.length;

        // Check for specific quality indicators
        if (!metadata.modelInfo?.architecture) {
          recommendations.push("Consider adding model architecture information");
        }
        if (!metadata.performanceMetrics) {
          recommendations.push("Performance metrics would improve model discoverability");
        }
        if (!metadata.inputSchema || !metadata.outputSchema) {
          recommendations.push("Input/output schemas are important for integration");
        }
      } else {
        // Extract validation issues
        parseResult.error.issues.forEach(issue => {
          issues.push(`${issue.path.join(".")}: ${issue.message}`);
        });
      }

      // Use AI to assess quality if we have provider access
      let aiScore = 0.5; // Default neutral score
      try {
        const qualityAssessment = await this.assessMetadataWithAI(metadata);
        aiScore = qualityAssessment.score;
        recommendations.push(...qualityAssessment.recommendations);
      } catch (error) {
        console.warn("AI quality assessment failed, using basic validation");
      }

      const overallScore = (completeness * 0.4) + (aiScore * 0.6);

      return {
        score: Math.round(overallScore * 100) / 100,
        completeness: Math.round(completeness * 100) / 100,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error("Metadata quality validation error:", error);
      return {
        score: 0,
        completeness: 0,
        issues: ["Validation failed"],
        recommendations: ["Manual review required"],
      };
    }
  }

  /**
   * Select the appropriate transformation strategy based on source type
   */
  private selectTransformationStrategy(request: AITransformationRequestSchema): {
    provider: ProviderType;
    prompt: string;
    temperature: number;
    maxTokens: number;
  } {
    const basePrompt = this.buildTransformationPrompt(request);
    
    // Strategy varies by source type and complexity
    switch (request.sourceType) {
      case "huggingface":
        return {
          provider: ProviderType.OPENAI,
          prompt: basePrompt + "\nFocus on HuggingFace model card structure and transformers compatibility.",
          temperature: 0.3, // Lower temperature for structured data
          maxTokens: 2048,
        };
      
      case "openai":
        return {
          provider: ProviderType.OPENAI,
          prompt: basePrompt + "\nFocus on OpenAI model specifications and API compatibility.",
          temperature: 0.3,
          maxTokens: 1536,
        };
      
      case "custom":
        return {
          provider: ProviderType.ANTHROPIC,
          prompt: basePrompt + "\nCarefully analyze this custom format and infer the best structure.",
          temperature: 0.5, // Higher temperature for creative interpretation
          maxTokens: 3072,
        };
      
      case "manual":
        return {
          provider: ProviderType.OPENAI,
          prompt: basePrompt + "\nValidate and enhance this manually provided metadata.",
          temperature: 0.2, // Very low temperature for validation
          maxTokens: 1024,
        };
      
      default:
        return {
          provider: ProviderType.OPENAI,
          prompt: basePrompt,
          temperature: 0.4,
          maxTokens: 2048,
        };
    }
  }

  /**
   * Build the transformation prompt based on the request
   */
  private buildTransformationPrompt(request: AITransformationRequestSchema): string {
    const { sourceData, targetSchema, transformationHints } = request;
    
    let prompt = `Transform the following model metadata into a standardized format.

Source Data:
${JSON.stringify(sourceData, null, 2)}

Target Schema: ${targetSchema}

Requirements:
1. Extract and standardize all relevant information
2. Infer missing fields where possible
3. Ensure all data types match the expected schema
4. Preserve all important technical details
5. Add appropriate default values for missing required fields

`;

    if (transformationHints?.modelType) {
      prompt += `Model Type: ${transformationHints.modelType}\n`;
    }

    if (transformationHints?.expectedFields?.length) {
      prompt += `Expected Fields: ${transformationHints.expectedFields.join(", ")}\n`;
    }

    if (transformationHints?.customInstructions) {
      prompt += `Additional Instructions: ${transformationHints.customInstructions}\n`;
    }

    prompt += `
Please return a JSON object that conforms to the enhanced model metadata schema.
Include a confidence score (0-1) for the transformation quality.
List any warnings about uncertain transformations.
Provide suggestions for improving the metadata.

Format your response as:
{
  "transformedData": { ... },
  "confidence": 0.85,
  "warnings": ["..."],
  "suggestions": ["..."]
}`;

    return prompt;
  }

  /**
   * Perform the actual AI transformation
   */
  private async performTransformation(
    request: AITransformationRequestSchema,
    strategy: {
      provider: ProviderType;
      prompt: string;
      temperature: number;
      maxTokens: number;
    }
  ): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        // Get available providers of the requested type
        const providers = this.providerService.listProvidersByType(strategy.provider);
        
        if (providers.length === 0) {
          // Fallback to any available provider
          const allProviders = this.providerService.getActiveProviders();
          if (allProviders.length === 0) {
            throw new Error("No AI providers available for transformation");
          }
          // Use first available provider
          const providerId = allProviders[0].id;
          return this.callProviderForTransformation(providerId, strategy);
        }

        // Use the first provider of the requested type
        const providerId = providers[0].id;
        return this.callProviderForTransformation(providerId, strategy);

      } catch (error) {
        lastError = error as Error;
        console.warn(`Transformation attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.MAX_RETRIES - 1) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error("All transformation attempts failed");
  }

  /**
   * Call the provider for AI transformation
   */
  private async callProviderForTransformation(
    providerId: string,
    strategy: {
      prompt: string;
      temperature: number;
      maxTokens: number;
    }
  ): Promise<any> {
    const request: ProviderRequest = {
      modelId: "gpt-3.5-turbo", // Default model, provider will handle availability
      input: {
        messages: [
          {
            role: "system",
            content: "You are an expert AI model metadata specialist. Transform and enhance model metadata with high accuracy and completeness.",
          },
          {
            role: "user",
            content: strategy.prompt,
          },
        ],
        temperature: strategy.temperature,
        max_tokens: strategy.maxTokens,
      },
      metadata: {
        requestId: `transform_${Date.now()}`,
        purpose: "metadata_transformation",
      },
    };

    const response = await this.providerService.performInference(providerId, request);
    
    // Parse the response
    const responseText = response.output.text || response.output.message || "";
    
    try {
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      throw new Error(`Invalid JSON response from AI: ${parseError}`);
    }
  }

  /**
   * Validate and score the transformation result
   */
  private async validateAndScore(
    result: any,
    originalRequest: AITransformationRequestSchema
  ): Promise<AITransformationResponseSchema> {
    try {
      // Extract components from AI response
      const transformedData = result.transformedData || result;
      const aiConfidence = result.confidence || 0.5;
      const warnings = result.warnings || [];
      const suggestions = result.suggestions || [];

      // Validate against target schema
      let validationScore = 0;
      const validationIssues = [];

      if (originalRequest.targetSchema === "metadata") {
        const parseResult = enhancedModelMetadataSchema.safeParse(transformedData);
        if (parseResult.success) {
          validationScore = 1.0;
        } else {
          validationScore = 0.6; // Partial credit for attempting transformation
          parseResult.error.issues.forEach(issue => {
            validationIssues.push(`Schema validation: ${issue.path.join(".")}: ${issue.message}`);
          });
        }
      }

      // Calculate final confidence score
      const finalConfidence = Math.min(
        (aiConfidence * 0.7) + (validationScore * 0.3),
        1.0
      );

      // Combine warnings
      const allWarnings = [
        ...warnings,
        ...validationIssues,
      ];

      // Add quality-based suggestions
      const qualitySuggestions = [...suggestions];
      if (finalConfidence < this.CONFIDENCE_THRESHOLD) {
        qualitySuggestions.push("Low confidence transformation - consider manual review");
      }

      const response: AITransformationResponseSchema = {
        success: finalConfidence >= 0.3, // Very lenient success threshold
        transformedData,
        confidence: Math.round(finalConfidence * 100) / 100,
        warnings: allWarnings.length > 0 ? allWarnings : undefined,
        suggestions: qualitySuggestions.length > 0 ? qualitySuggestions : undefined,
      };

      return aiTransformationResponseSchema.parse(response);
    } catch (error) {
      console.error("Validation and scoring error:", error);
      return {
        success: false,
        transformedData: originalRequest.sourceData,
        confidence: 0.0,
        warnings: [`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`],
        suggestions: ["Manual transformation required"],
      };
    }
  }

  /**
   * AI-powered metadata quality assessment
   */
  private async assessMetadataWithAI(metadata: Record<string, any>): Promise<{
    score: number;
    recommendations: string[];
  }> {
    const prompt = `Assess the quality and completeness of this model metadata:

${JSON.stringify(metadata, null, 2)}

Evaluate based on:
1. Completeness of information
2. Technical accuracy
3. Usefulness for model deployment
4. Documentation quality

Return your assessment as JSON:
{
  "score": 0.85,
  "recommendations": ["...", "..."]
}`;

    try {
      const providers = this.providerService.getActiveProviders();
      if (providers.length === 0) {
        throw new Error("No providers available");
      }

      const request: ProviderRequest = {
        modelId: "gpt-3.5-turbo",
        input: {
          messages: [
            {
              role: "system",
              content: "You are an expert at evaluating machine learning model metadata quality.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 1024,
        },
        metadata: {
          requestId: `assess_${Date.now()}`,
          purpose: "quality_assessment",
        },
      };

      const response = await this.providerService.performInference(providers[0].id, request);
      const responseText = response.output.text || response.output.message || "";
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in assessment response");
      }
      
      const assessment = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(Math.max(assessment.score || 0.5, 0), 1),
        recommendations: Array.isArray(assessment.recommendations) ? assessment.recommendations : [],
      };
    } catch (error) {
      console.warn("AI quality assessment failed:", error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await this.providerService.cleanup();
    console.log("AI Transformation Service cleaned up");
  }
}

// Singleton instance for use throughout the application
export const aiTransformationService = new AITransformationService(); 