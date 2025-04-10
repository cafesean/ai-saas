import { pgTable, serial, text, timestamp, varchar, uuid, integer, decimal, unique, numeric, doublePrecision, boolean, json } from 'drizzle-orm/pg-core';
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

export const pricing_roles = pgTable('pricing_roles', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid'),
  pricing_id: integer('pricing_id').references(() => pricings.id),
  role_id: integer('role_id').references(() => roles.id),
  level_id: integer('level_id').references(() => levels.id),
  quantity: integer('quantity').notNull(),
  base_price: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  override_price: decimal('override_price', { precision: 10, scale: 2 }),
  discount_rate: decimal('discount_rate', { precision: 5, scale: 2 }),
  multiplier: decimal('multiplier', { precision: 5, scale: 2 }).notNull(),
  final_price: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
});

export const pricings = pgTable('pricings', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid'),
  code: varchar('code').notNull().unique(),
  description: text('description').notNull(),
  customer_id: varchar('customer_id').notNull(),
  created_by: varchar('created_by').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  ratecard_id: integer('ratecard_id').references(() => rate_cards.id),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  resource_count: integer('resource_count').notNull(),
  overall_discounts: json('overall_discounts')
});

// Relations
export const roles_relations = relations(roles, ({ many }) => ({
  level_roles: many(level_roles),
  pricing_roles: many(pricing_roles)
}));

export const levels_relations = relations(levels, ({ many }) => ({
  level_roles: many(level_roles),
  level_rates: many(level_rates),
  pricing_roles: many(pricing_roles)
}));

export const rate_cards_relations = relations(rate_cards, ({ many }) => ({
  level_rates: many(level_rates),
  pricings: many(pricings)
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

export const pricing_roles_relations = relations(pricing_roles, ({ one }) => ({
  pricing: one(pricings, {
    fields: [pricing_roles.pricing_id],
    references: [pricings.id],
  }),
  role: one(roles, {
    fields: [pricing_roles.role_id],
    references: [roles.id],
  }),
  level: one(levels, {
    fields: [pricing_roles.level_id],
    references: [levels.id],
  }),
}));

export const pricings_relations = relations(pricings, ({ one, many }) => ({
  ratecard: one(rate_cards, {
    fields: [pricings.ratecard_id],
    references: [rate_cards.id],
  }),
  pricing_roles: many(pricing_roles)
})); 