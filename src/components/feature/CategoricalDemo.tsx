"use client";

import React from 'react';
import CategoricalDetail from './CategoricalDetail';

export const CategoricalFeatureDemo: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Categorical Feature Detail Demo</h2>
        <p className="text-muted-foreground mb-6">
          This demonstrates the CategoricalFeatureDetail component with different categorical features.
        </p>
      </div>

      {/* Demo for Employment Status */}
      <CategoricalDetail
        feature={{
          name: "Employment Status",
          stats: {
            count: 1000,
            unique: 4,
            top: "Full-time",
            freq: 680,
            missing: 5
          },
          distribution: {
            categories: ["Full-time", "Part-time", "Self-employed", "Unemployed"],
            counts: [680, 200, 85, 30],
            percentages: [68.0, 20.0, 8.5, 3.0]
          },
          importance: {
            coefficient: 0.22,
            abs_coefficient: 0.22,
            rank: 4
          }
        }}
      />

      {/* Demo for Education Level */}
      <CategoricalDetail
        feature={{
          name: "Education Level",
          stats: {
            count: 1000,
            unique: 5,
            top: "Bachelor's",
            freq: 420,
            missing: 2
          },
          distribution: {
            categories: ["High School", "Bachelor's", "Master's", "PhD", "Associates"],
            counts: [180, 420, 250, 80, 68],
            percentages: [18.0, 42.0, 25.0, 8.0, 6.8]
          },
          importance: {
            coefficient: 0.18,
            abs_coefficient: 0.18,
            rank: 5
          }
        }}
      />

      {/* Demo for Credit Purpose */}
      <CategoricalDetail
        feature={{
          name: "Loan Purpose",
          stats: {
            count: 1000,
            unique: 6,
            top: "Home improvement",
            freq: 320
          },
          distribution: {
            categories: ["Home improvement", "Debt consolidation", "Auto", "Personal", "Business", "Other"],
            counts: [320, 280, 190, 120, 60, 30],
            percentages: [32.0, 28.0, 19.0, 12.0, 6.0, 3.0]
          },
          importance: {
            coefficient: -0.08,
            abs_coefficient: 0.08,
            rank: 8
          }
        }}
      />
    </div>
  );
};

export default CategoricalFeatureDemo; 