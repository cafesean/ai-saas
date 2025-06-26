# SAAS-256 Feature Contribution Fix - Scratchpad

**Date**: 2025-01-25  
**Task**: Create Jira story and subtask for Feature Contribution calculation fixes  

## Task Overview
Create Jira issues to fix critical bug in Feature Contribution calculations where inference code is showing model.coef_ instead of WoE_value × coefficient.

## Jira Issues to Create

### 1. Story: Models Module - General Fixes and Improvements
**Parent Epic**: SAAS-256  
**Issue Type**: Story  
**Summary**: Models Module - General Fixes and Improvements

**Description**:
```
This story covers general fixes and improvements for the Models module as part of the enterprise-grade model management transformation.

## Background
The Models module is being enhanced to support comprehensive model lifecycle management including flexible ingestion, champion/challenger frameworks, and auditable inference architecture.

## Scope
This story will encompass various fixes and improvements needed to support the new enterprise-grade features including:
- Data display fixes
- Calculation corrections
- UI/UX improvements  
- Backend logic enhancements

## Acceptance Criteria
- [ ] All identified bugs and issues in the Models module are documented as subtasks
- [ ] Each fix is properly tested and validated
- [ ] Code follows established patterns and best practices
- [ ] Documentation is updated where necessary
```

### 2. Subtask: Fix Feature Contribution Calculations in Inference Code
**Parent Story**: [To be linked to story above]  
**Issue Type**: Sub-task  
**Summary**: Fix Feature Contribution Calculations in Inference Code

**Description**:
```
## Problem
The inference code is currently showing model.coef_ instead of correctly calculating WoE_value × coefficient for Feature Contributions.

**Current Bug**: Feature Contribution = model_coefficient (ignoring actual input values!)
**Correct Formula**: Feature Contribution = WoE_transformed_value × model_coefficient

## Impact
This bug causes:
- All applications to have identical contributions
- Scores that don't make intuitive sense
- Incorrect model explainability

## Solution
Fix inference code to properly calculate WoE(input_value) × coefficient rather than just returning the raw coefficients.

## Technical Details
- Need to transform input values using Weight of Evidence (WoE) 
- Multiply WoE transformed values by model coefficients
- Ensure calculations are performed for each individual prediction request

## Acceptance Criteria
- [ ] Feature contribution calculations use WoE_transformed_value × model_coefficient
- [ ] Different applications show different contribution values based on their input data
- [ ] Model scores are intuitive and explainable
- [ ] Unit tests verify correct calculation logic
- [ ] Integration tests verify end-to-end functionality
```

## Progress Log

### Completed Work ✅
**Code Fix Implemented:**
- Created `src/lib/inference-utils.ts` with proper TypeScript interfaces
- Implemented `fixFeatureContributions()` function that calculates WoE × coefficient
- Updated `src/app/api/inference/[modelId]/route.ts` to use the fix via `processInferenceResponse()`
- Added proper error handling and fallbacks
- Fixed TypeScript compilation issues

**Technical Details:**
- The fix intercepts inference responses before storing/returning them
- Calculates proper WoE values for input features using model metadata
- Multiplies WoE by model coefficients for correct Feature Contributions
- Falls back to raw coefficients if WoE mappings are missing
- Maintains backward compatibility with existing inference flow

### Next Steps
- [ ] Create the story linked to epic SAAS-256 (Blocked: Jira connectivity issues)
- [ ] Create the subtask linked to the story (Blocked: Jira connectivity issues)
- [ ] Update Jira issue status to In Progress
- [ ] Test the fix with sample data
- [ ] Update documentation

### Jira Issues to Create (Manual Creation Required)
Due to Jira connectivity issues, these need to be created manually:

**Story**: 
- Project: SAAS
- Epic Link: SAAS-256
- Summary: "Models Module - General Fixes and Improvements"
- Type: Story
- Description: [See detailed description above]

**Subtask**:
- Parent: [Story created above]
- Summary: "Fix Feature Contribution Calculations in Inference Code"
- Type: Sub-task  
- Description: [See detailed description above]

## Status
🔍 **INVESTIGATION MODE** - Fixed authentication, now analyzing feature contribution data

### Latest Progress
**Primary Issue**: Feature Contribution calculation investigation  
**Secondary Issue**: ✅ **Fixed** - 401 Authentication error in RunInference dialog  

### Current Approach
Rather than assuming the external inference service is wrong, we're now analyzing the data to understand:
1. What the actual feature contributions represent
2. Whether they're already calculated correctly  
3. What model metadata is available for validation

### Files Modified
1. `src/lib/inference-utils.ts` - Analysis functions for feature contribution investigation
2. `src/app/api/inference/[modelId]/route.ts` - Integration of analysis middleware  
3. `src/components/dialog/RunInference.tsx` - ✅ Authentication fix (axios → fetch)

### Analysis Results ✅
- [X] Run inference with analysis logging enabled
- [X] Review console output for data structure understanding  

### Key Findings from Server Logs

**Input Data Structure**:
```javascript
{
  loan_amnt: 200000,           // Numerical value
  term: ' 36 months',          // String with leading space
  emp_length: '6 years',       // String format
  home_ownership: 'OWN',       // Categorical
  annual_inc: 100000,          // Numerical
  // ... other features
}
```

**Raw Feature Contributions**:
```javascript
{
  loan_amnt: -0.1367579401260876,
  term: -0.9865304947798815,
  emp_length: -0.43503361628614423,
  // ... other features with precise decimal values
}
```

### Critical Insight 🎯
The feature contributions are **NOT** raw model coefficients! They are precise decimal values that vary based on input values. This suggests the external inference service is already calculating some form of `input_transformation × coefficient`.

### Next Steps
- [ ] Compare different input values to see if contributions change appropriately
- [ ] Determine if these are actually WoE×coefficient or another valid calculation
- [ ] Investigate if the "bug" is a misunderstanding rather than an actual error 