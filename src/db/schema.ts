import { pgTable, serial, text, timestamp, varchar, uuid, integer, decimal, unique, numeric, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid').notNull(),
  name: varchar('name').notNull(),
  description: text('description'),
  role_code: varchar('role_code').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid').notNull(),
  name: varchar('name').notNull(),
  description: text('description'),
  code: varchar('code').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const rate_cards = pgTable('ratecards', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid').notNull(),
  name: varchar('name').notNull(),
  description: text('description'),
  effective_date: timestamp('effective_date').notNull(),
  expire_date: timestamp('expire_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const level_roles = pgTable('level_roles', {
  level_id: serial('level_id').references(() => levels.id),
  role_id: serial('role_id').references(() => roles.id)
});

export const level_rates = pgTable('level_rates', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid').notNull(),
  level_id: serial('level_id').references(() => levels.id),
  ratecard_id: serial('ratecard_id').references(() => rate_cards.id),
  monthly_rate: doublePrecision('monthly_rate').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Relations
export const roles_relations = relations(roles, ({ many }) => ({
  level_roles: many(level_roles),
}));

export const levels_relations = relations(levels, ({ many }) => ({
  level_roles: many(level_roles),
  level_rates: many(level_rates),
}));

export const rate_cards_relations = relations(rate_cards, ({ many }) => ({
  level_rates: many(level_rates),
}));

export const level_roles_relations = relations(level_roles, ({ one }) => ({
  level: one(levels, {
    fields: [level_roles.level_id],
    references: [levels.id],
  }),
  role: one(roles, {
    fields: [level_roles.role_id],
    references: [roles.id],
  }),
}));

export const level_rates_relations = relations(level_rates, ({ one }) => ({
  level: one(levels, {
    fields: [level_rates.level_id],
    references: [levels.id],
  }),
  rate_card: one(rate_cards, {
    fields: [level_rates.ratecard_id],
    references: [rate_cards.id],
  }),
})); 