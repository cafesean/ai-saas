import type { InferSelectModel } from 'drizzle-orm';
import type { roles, levels, level_roles, level_rates, rate_cards } from '@/db/schema';

// DB Types
export type DbRole = InferSelectModel<typeof roles>;
export type DbLevel = InferSelectModel<typeof levels>;
export type DbLevelRole = InferSelectModel<typeof level_roles>;
export type DbLevelRate = InferSelectModel<typeof level_rates>;
export type DbRateCard = InferSelectModel<typeof rate_cards>;

// View Types
export interface RoleView {
  id: number;
  name: string;
  description: string | null;
  roleCode: string;
}

export interface LevelView {
  id: number;
  name: string;
  description: string | null;
  code: string;
  roles: RoleView[];
}

export interface LevelRateView {
  id: number;
  monthlyRate: number;
  level: LevelView;
  rateCard: RateCardView;
}

export interface RateCardView {
  id: number;
  name: string;
  description: string | null;
  effective_date: Date;
  expire_date: Date | null;
  levelRates: LevelRateView[];
}

// Conversion functions
export function dbToAppRole(dbRole: DbRole): RoleView {
  return {
    id: dbRole.id,
    name: dbRole.name,
    description: dbRole.description,
    roleCode: dbRole.role_code,
  };
}

export function dbToAppLevel(dbLevel: DbLevel & { roles?: DbRole[] }): LevelView {
  return {
    id: dbLevel.id,
    name: dbLevel.name,
    description: dbLevel.description,
    code: dbLevel.code,
    roles: dbLevel.roles?.map(dbToAppRole) ?? [],
  };
}

export function dbToAppLevelRate(rate: DbLevelRate & { level: DbLevel, rate_card: DbRateCard }): LevelRateView {
  return {
    id: rate.id,
    monthlyRate: rate.monthly_rate,
    level: dbToAppLevel({ ...rate.level, roles: [] }),
    rateCard: {
      id: rate.rate_card.id,
      name: rate.rate_card.name,
      description: rate.rate_card.description,
      effective_date: rate.rate_card.effective_date,
      expire_date: rate.rate_card.expire_date,
      levelRates: [],
    },
  };
}

export function dbToAppRateCard(card: DbRateCard & { level_rates?: Array<DbLevelRate & { level: DbLevel, rate_card: DbRateCard }> }): RateCardView {
  return {
    id: card.id,
    name: card.name,
    description: card.description,
    effective_date: card.effective_date,
    expire_date: card.expire_date,
    levelRates: card.level_rates?.map(rate => dbToAppLevelRate(rate)) ?? [],
  };
} 