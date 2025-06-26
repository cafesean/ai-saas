/**
 * Interface for WoE transformation mappings
 */
interface CategoricalWoeMapping {
  [value: string]: number;
}

interface NumericalWoeMapping {
  bins: Array<{
    min: number;
    max: number;
    woe: number;
  }>;
}

interface WoeMapping {
  [feature: string]: CategoricalWoeMapping | NumericalWoeMapping;
}

/**
 * Interface for model coefficients
 */
interface ModelCoefficients {
  [feature: string]: number;
}

/**
 * Type guard to check if mapping is numerical
 */
function isNumericalMapping(mapping: CategoricalWoeMapping | NumericalWoeMapping): mapping is NumericalWoeMapping {
  return 'bins' in mapping;
}

/**
 * Calculate Weight of Evidence (WoE) for a given feature value
 */
function calculateWoE(
  featureName: string,
  value: any,
  woeMapping: WoeMapping
): number {
  const featureMapping = woeMapping[featureName];
  
  if (!featureMapping) {
    console.warn(`No WoE mapping found for feature: ${featureName}`);
    return 0;
  }

  // Check if it's numerical mapping (has bins)
  if (isNumericalMapping(featureMapping) && typeof value === 'number') {
    for (const bin of featureMapping.bins) {
      if (value >= bin.min && value <= bin.max) {
        return bin.woe;
      }
    }
  } else if (!isNumericalMapping(featureMapping) && typeof value === 'string') {
    // Categorical mapping
    const woeValue = featureMapping[value];
    if (woeValue !== undefined) {
      return woeValue;
    }
  }

  console.warn(`No WoE mapping found for ${featureName}=${value}`);
  return 0;
}

/**
 * Utility functions for inference processing and feature contribution analysis
 */

/**
 * Analyze feature contributions from inference response
 * This logs data for investigation of the Feature Contribution calculation bug
 */
export function analyzeFeatureContributions(
  inputData: Record<string, any>,
  rawFeatureContributions: Record<string, number>,
  modelMetadata?: any
): Record<string, number> {
  try {
    console.log('=== FEATURE CONTRIBUTION ANALYSIS ===');
    console.log('Input Data:', inputData);
    console.log('Raw Feature Contributions:', rawFeatureContributions);
    
    if (modelMetadata) {
      console.log('Model Metadata Available:', Object.keys(modelMetadata));
      console.log('Feature Analysis:', modelMetadata.feature_analysis);
      console.log('Global Importance:', modelMetadata.global_importance);
      console.log('Features:', modelMetadata.features);
    } else {
      console.log('No model metadata available');
    }
    
    // For now, return the raw contributions as-is
    // The external inference service might already be calculating them correctly
    console.log('=== RETURNING RAW CONTRIBUTIONS (NO MODIFICATION) ===');
    return rawFeatureContributions;
    
  } catch (error) {
    console.error('Error analyzing feature contributions:', error);
    return rawFeatureContributions;
  }
}

/**
 * Process inference response to analyze feature contributions
 * Currently focused on data collection rather than modification
 */
export async function processInferenceResponse(
  inferenceResponse: any,
  inputData: Record<string, any>,
  modelId: string,
  orgId: number
) {
  try {
    console.log('Processing inference response for model:', modelId);
    
    // Check if inference response has feature contributions
    if (inferenceResponse?.feature_contributions?.[0]?.values) {
      const rawContributions = inferenceResponse.feature_contributions[0].values;
      
      // Analyze the feature contributions (no modification for now)
      const analyzedContributions = analyzeFeatureContributions(
        inputData,
        rawContributions,
        undefined // Skip metadata lookup for now to avoid DB issues
      );

      // Return the response unchanged for now
      return inferenceResponse;
    }

    return inferenceResponse;
  } catch (error) {
    console.error('Error processing inference response:', error);
    // Return original response if processing fails
    return inferenceResponse;
  }
}

// getModelMetadata function removed - will implement proper database integration later 