import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  index,
  serial,
  unique,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenant";

// Rule Set Status
export const RuleSetStatus = {
  DRAFT: "draft",
  PUBLISHED: "published", 
  DEPRECATED: "deprecated",
} as const;

export const rule_sets = pgTable(
  "rule_sets",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    
    // Input schema definition (what inputs this rule set expects)
    inputSchema: json("input_schema"), // Array of input definitions
    
    // Output schema definition (what outputs this rule set produces)
    outputSchema: json("output_schema"), // Array of output definitions
    
    // Versioning and lifecycle
    version: integer("version").notNull().default(1),
    status: varchar("status", { length: 50 }).notNull().default(RuleSetStatus.DRAFT),
    
    // Publishing metadata
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishedBy: integer("published_by"), // User ID who published
    
    // Multi-tenancy support
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
      
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("rule_set_id_idx").on(table.id),
    index("rule_set_uuid_idx").on(table.uuid), 
    index("rule_set_tenant_id_idx").on(table.tenantId),
    index("rule_set_status_idx").on(table.status),
    // Composite unique index for tenant + name combination
    unique("rule_set_tenant_name_unique").on(table.tenantId, table.name),
  ],
);

// Rule set steps (ordered sequence of decision artifacts)
export const rule_set_steps = pgTable(
  "rule_set_steps",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    ruleSetId: uuid("rule_set_id")
      .notNull()
      .references(() => rule_sets.uuid, { onDelete: "cascade" }),
    
    // Step configuration
    stepOrder: integer("step_order").notNull(),
    stepName: varchar("step_name", { length: 255 }).notNull(),
    
    // Artifact reference (generic - can point to decision table, lookup table, etc.)
    artifactType: varchar("artifact_type", { length: 50 }).notNull(), // 'decision_table', 'lookup_table', 'variable'
    artifactId: uuid("artifact_id").notNull(), // UUID of the referenced artifact
    
    // Input/Output mapping configuration
    inputMapping: json("input_mapping"), // How to map inputs from previous steps or rule set inputs
    outputMapping: json("output_mapping"), // How to map outputs to next steps or final outputs
    
    // Conditional execution (optional)
    executionCondition: text("execution_condition"), // When to execute this step
    
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("rule_set_step_id_idx").on(table.id),
    index("rule_set_step_uuid_idx").on(table.uuid),
    index("rule_set_step_rule_set_id_idx").on(table.ruleSetId),
    index("rule_set_step_order_idx").on(table.stepOrder),
    // Unique constraint on rule set + step order
    unique("rule_set_step_order_unique").on(table.ruleSetId, table.stepOrder),
  ],
);

// Relations
export const ruleSetsRelations = relations(rule_sets, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [rule_sets.tenantId],
    references: [tenants.id],
  }),
  steps: many(rule_set_steps),
}));

export const ruleSetStepsRelations = relations(rule_set_steps, ({ one }) => ({
  ruleSet: one(rule_sets, {
    fields: [rule_set_steps.ruleSetId],
    references: [rule_sets.uuid],
  }),
})); 