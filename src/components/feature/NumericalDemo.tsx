"use client";

import React from 'react';
import NumericalDetail from './NumericalDetail';

// Numerical feature demo with proper component interface

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
      <NumericalDetail
        feature={{
          name: "Credit Score",
          stats: {
            count: 1000,
            mean: 650,
            std: 75,
            min: 400,
            max: 850,
            q25: 600,
            q50: 650,
            q75: 720
          },
          importance: {
            coefficient: 0.35,
            abs_coefficient: 0.35,
            rank: 1
          }
        }}
      />

      {/* Demo for Income */}
      <NumericalDetail
        feature={{
          name: "Annual Income",
          stats: {
            count: 1000,
            mean: 60000,
            std: 25000,
            min: 20000,
            max: 150000,
            q25: 42000,
            q50: 58000,
            q75: 75000
          },
          importance: {
            coefficient: 0.28,
            abs_coefficient: 0.28,
            rank: 2
          }
        }}
      />

      {/* Demo for Age */}
      <NumericalDetail
        feature={{
          name: "Age",
          stats: {
            count: 1000,
            mean: 38.5,
            std: 12.3,
            min: 18,
            max: 75,
            q25: 29,
            q50: 38,
            q75: 47
          },
          importance: {
            coefficient: -0.15,
            abs_coefficient: 0.15,
            rank: 3
          }
        }}
      />
    </div>
  );
};

export default NumericalFeatureDemo; 