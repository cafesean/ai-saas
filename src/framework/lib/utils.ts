import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LevelView, RateCardView } from '@/framework/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function findLevelUsage(levelId: number, rateCards: RateCardView[]): RateCardView[] {
  return rateCards.filter(rateCard => 
    rateCard.levelRates.some(rate => rate.level.id === levelId)
  );
}

export function removeLevelFromRateCards(levelId: number, rateCards: RateCardView[]): RateCardView[] {
  return rateCards.map(rateCard => ({
    ...rateCard,
    levelRates: rateCard.levelRates.filter(rate => rate.level.id !== levelId)
  }));
} 