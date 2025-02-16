import { db } from './config';
import { roles, levels, rate_cards, level_rates, level_roles } from './schema';
import type { Role, Level, RateCard, LevelRate, LevelRole } from './types';
import { eq, and } from 'drizzle-orm';

// Roles
export const getRoles = () => db.select().from(roles);

export const createRole = (role: Omit<Role, 'id'>) => 
  db.insert(roles).values(role).returning();

export const updateRole = (id: number, role: Partial<Role>) =>
  db.update(roles).set(role).where(eq(roles.id, id));

export const deleteRole = (id: number) =>
  db.delete(roles).where(eq(roles.id, id));

// Levels
export const getLevels = () => db.select().from(levels);

export const createLevel = (level: Omit<Level, 'id'>) =>
  db.insert(levels).values(level).returning();

export const updateLevel = (id: number, level: Partial<Level>) =>
  db.update(levels).set(level).where(eq(levels.id, id));

export const deleteLevel = (id: number) =>
  db.delete(levels).where(eq(levels.id, id));

// Level Roles
export const getLevelRoles = (levelId: number) =>
  db.select()
    .from(level_roles)
    .where(eq(level_roles.level_id, levelId))
    .leftJoin(roles, eq(roles.id, level_roles.role_id));

export const assignRoleToLevel = (levelId: number, roleId: number) =>
  db.insert(level_roles).values({ level_id: levelId, role_id: roleId });

export const removeRoleFromLevel = (levelId: number, roleId: number) =>
  db.delete(level_roles)
    .where(and(
      eq(level_roles.level_id, levelId),
      eq(level_roles.role_id, roleId)
    ));

// Rate Cards
export const getRateCards = () => db.select().from(rate_cards);

export const createRateCard = (rateCard: Omit<RateCard, 'id'>) =>
  db.insert(rate_cards).values(rateCard).returning();

export const updateRateCard = (id: number, rateCard: Partial<RateCard>) =>
  db.update(rate_cards).set(rateCard).where(eq(rate_cards.id, id));

export const deleteRateCard = (id: number) =>
  db.delete(rate_cards).where(eq(rate_cards.id, id));

// Level Rates
export const getLevelRates = (rateCardId: number) =>
  db.select()
    .from(level_rates)
    .where(eq(level_rates.ratecard_id, rateCardId))
    .leftJoin(levels, eq(levels.id, level_rates.level_id));
export const setLevelRate = (rate: { uuid: string; level_id: number; ratecard_id: number; monthly_rate: number }) =>
  db.insert(level_rates).values(rate);

export const updateLevelRate = (id: number, rate: Partial<LevelRate>) =>
  db.update(level_rates).set(rate).where(eq(level_rates.id, id));

export const deleteLevelRate = (id: number) =>
  db.delete(level_rates).where(eq(level_rates.id, id)); 