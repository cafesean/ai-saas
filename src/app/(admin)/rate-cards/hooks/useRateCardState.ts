import React from 'react';
import type { RateCardView, LevelView } from '@/framework/types';

interface LevelRate {
  id: string;
  level_id: number;
  monthly_rate: number;
  level: LevelView;
}

interface NewRateCard {
  name: string;
  description: string;
  effective_date: string;
  expire_date: string;
  level_rates: LevelRate[];
}

const getInitialDate = () => {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  const day = String(today.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultRateCardName = () => {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month} Rates`;
};

const emptyRateCard: NewRateCard = {
  name: '',
  description: '',
  effective_date: '',
  expire_date: '',
  level_rates: [],
};

export function useRateCardState() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedRateCard, setSelectedRateCard] = React.useState<RateCardView | null>(null);
  const [viewingRateCard, setViewingRateCard] = React.useState<RateCardView | null>(null);
  const [newRateCard, setNewRateCard] = React.useState<NewRateCard>(() => {
    const today = getInitialDate();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const expire_date = nextYear.toISOString().split('T')[0];

    return {
      ...emptyRateCard,
      name: getDefaultRateCardName(),
      effective_date: today,
      expire_date: expire_date,
    };
  });
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleRateCardChange = (field: keyof NewRateCard, value: string) => {
    setNewRateCard((prev: NewRateCard) => ({
      ...prev,
      [field]: value || '',
    }));
  };

  const handleLevelRateChange = (levelId: number, monthlyRate: number, level: LevelView) => {
    setNewRateCard((prev: NewRateCard) => {
      const existingRateIndex = prev.level_rates.findIndex(
        (rate: LevelRate) => rate.level_id === levelId
      );

      const newLevelRates = [...prev.level_rates];
      if (existingRateIndex >= 0) {
        const existingRate = newLevelRates[existingRateIndex] as LevelRate;
        newLevelRates[existingRateIndex] = {
          id: existingRate.id,
          level_id: existingRate.level_id,
          monthly_rate: monthlyRate,
          level: existingRate.level,
        };
      } else {
        newLevelRates.push({
          id: levelId.toString(),
          level_id: levelId,
          monthly_rate: monthlyRate,
          level,
        });
      }

      return {
        ...prev,
        level_rates: newLevelRates,
      };
    });
  };

  const getLevelRate = (levelId: number): number => {
    return (
      newRateCard.level_rates.find((rate: LevelRate) => rate.level_id === levelId)
        ?.monthly_rate || 0
    );
  };

  const resetForm = () => {
    const today = getInitialDate();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const expire_date = nextYear.toISOString().split('T')[0];

    setNewRateCard({
      ...emptyRateCard,
      name: getDefaultRateCardName(),
      effective_date: today,
      expire_date: expire_date,
    });
    setSelectedRateCard(null);
    setIsConfirming(false);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    selectedRateCard,
    setSelectedRateCard,
    viewingRateCard,
    setViewingRateCard,
    newRateCard,
    setNewRateCard,
    isConfirming,
    setIsConfirming,
    handleRateCardChange,
    handleLevelRateChange,
    getLevelRate,
    resetForm,
  };
} 