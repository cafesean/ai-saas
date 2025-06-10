"use client";

import React from 'react';
import { NumericalFeatureDetail } from './numerical-feature-detail';

// Sample data matching the real structure we discovered
const sampleNumericalStats = {
  "credit_score": {
    "good_class": {
      "mean": 720,
      "min": 650,
      "max": 850,
      "median": 715
    },
    "bad_class": {
      "mean": 580,
      "min": 400,
      "max": 650,
      "median": 590
    }
  },
  "income": {
    "good_class": {
      "mean": 75000,
      "min": 35000,
      "max": 150000,
      "median": 68000
    },
    "bad_class": {
      "mean": 45000,
      "min": 20000,
      "max": 85000,
      "median": 42000
    }
  },
  "age": {
    "good_class": {
      "mean": 42.5,
      "min": 18.0,
      "max": 75.0,
      "median": 41.0
    },
    "bad_class": {
      "mean": 35.2,
      "min": 18.0,
      "max": 68.0,
      "median": 34.0
    }
  }
};

export const NumericalFeatureDemo: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Numerical Feature Detail Demo</h2>
        <p className="text-muted-foreground mb-6">
          This demonstrates the NumericalFeatureDetail component with different feature types.
        </p>
      </div>

      {/* Demo for Credit Score */}
      <NumericalFeatureDetail
        featureName="credit_score"
        numericalStats={sampleNumericalStats}
      />

      {/* Demo for Income */}
      <NumericalFeatureDetail
        featureName="income"
        numericalStats={sampleNumericalStats}
      />

      {/* Demo for Age */}
      <NumericalFeatureDetail
        featureName="age"
        numericalStats={sampleNumericalStats}
      />

      {/* Demo for Missing Feature */}
      <NumericalFeatureDetail
        featureName="missing_feature"
        numericalStats={sampleNumericalStats}
      />
    </div>
  );
};

export default NumericalFeatureDemo; 