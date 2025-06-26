import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  json,
  uniqueIndex,
  index,
  serial,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { ModelStatus, ModelGroupRole, ModelGroupStrategy, ModelGroupStatus } from "@/constants/general";
import { orgs } from "./org";

export const models = pgTable(
  "models",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    fileName: varchar("file_name", { length: 200 }).notNull(),
    fileKey: varchar("file_key", { length: 200 }).notNull(),
    metadataFileName: varchar("metadata_file_name", { length: 200 }),
    metadataFileKey: varchar("metadata_file_key", { length: 200 }),
    defineInputs: json("define_inputs"),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(ModelStatus.INACTIVE),
    type: varchar("type", { length: 100 }),
    framework: varchar("framework", { length: 100 }),
    
    // Enhanced fields for EPIC-4 flexible model ingestion
    provider: varchar("provider", { length: 50 }), // openai, anthropic, google, etc.
    architecture: varchar("architecture", { length: 100 }), // transformer, cnn, etc.
    capabilities: json("capabilities"), // Array of ModelCapability values
    
    // Enhanced metadata storage
    modelInfo: json("model_info"), // Architecture details, parameters, size, license
    trainingInfo: json("training_info"), // Dataset, framework, duration, resources
    performanceMetrics: json("performance_metrics"), // Accuracy, latency, throughput
    providerConfig: json("provider_config"), // Provider-specific configuration
    
    // Enhanced input/output schemas
    enhancedInputSchema: json("enhanced_input_schema"), // Detailed input validation
    enhancedOutputSchema: json("enhanced_output_schema"), // Detailed output format
    
    // Multi-tenancy support (SAAS-32)
    orgId: integer("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("model_id_idx").on(table.id),
    index("model_uuid_idx").on(table.uuid),
    index("model_org_id_idx").on(table.orgId),
    index("model_provider_idx").on(table.provider),
    index("model_architecture_idx").on(table.architecture),
  ],
);

export const model_metrics = pgTable("model_metrics", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  modelId: integer("model_id")
    .references(() => models.id, { onDelete: "cascade" })
    .notNull(),
  version: varchar("version", { length: 100 }).notNull(),
  ks: varchar("ks", { length: 100 }),
  auroc: varchar("auroc", { length: 100 }),
  gini: varchar("gini", { length: 100 }),
  accuracy: varchar("accuracy", { length: 100 }),
  precision: varchar("precision", { length: 100 }),
  recall: varchar("recall", { length: 100 }),
  f1: varchar("f1", { length: 100 }),
  brier_score: varchar("brier_score", { length: 100 }),
  log_loss: varchar("log_loss", { length: 100 }),
  ksChart: text("ks_chart"),
  aurocChart: text("auroc_chart"),
  giniChart: text("gini_chart"),
  accuracyChart: text("accuracy_chart"),
  features: json("features"),
  outputs: json("outputs"),
  inference: json("inference"),
  // New SAAS-11 columns for enhanced model metadata
  charts_data: json("charts_data"), // For metrics.charts array
  feature_analysis: json("feature_analysis"), // For feature_analysis object  
  model_info_details: json("model_info_details"), // For complete model_info object
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

export const inferences = pgTable("inferences", {
  id: serial("id").notNull().primaryKey(),
  uuid: uuid("uuid").unique().notNull().defaultRandom(),
  modelId: integer("model_id")
    .references(() => models.id, { onDelete: "cascade" })
    .notNull(),
  input: json("input"),
  output: json("output"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

// New ModelGroup table for EPIC-4 Champion/Challenger framework
export const modelGroups = pgTable(
  "model_groups",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    strategy: varchar("strategy", { length: 100 })
      .notNull()
      .default(ModelGroupStrategy.CHAMPION_CHALLENGER),
    status: varchar("status", { length: 100 })
      .notNull()
      .default(ModelGroupStatus.CONFIGURING),
    // Traffic splitting configuration
    trafficConfig: json("traffic_config"), // {champion: 90, challenger: 10}
    // Metadata for A/B testing
    testMetadata: json("test_metadata"), // Start date, duration, success criteria
    // Auto-promotion rules
    promotionRules: json("promotion_rules"), // Performance thresholds for auto-promotion
    // Multi-tenancy support
    orgId: integer("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("model_group_id_idx").on(table.id),
    index("model_group_uuid_idx").on(table.uuid),
    index("model_group_org_id_idx").on(table.orgId),
    index("model_group_status_idx").on(table.status),
  ],
);

// Junction table for ModelGroup membership with roles
export const modelGroupMemberships = pgTable(
  "model_group_memberships",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    modelGroupId: integer("model_group_id")
      .references(() => modelGroups.id, { onDelete: "cascade" })
      .notNull(),
    modelId: integer("model_id")
      .references(() => models.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 50 })
      .notNull()
      .default(ModelGroupRole.CHALLENGER),
    // Traffic allocation percentage for this model
    trafficPercentage: integer("traffic_percentage").default(0),
    // When this model was assigned this role
    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    // For tracking model performance in the group
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("model_group_membership_id_idx").on(table.id),
    index("model_group_membership_uuid_idx").on(table.uuid),
    index("model_group_membership_group_id_idx").on(table.modelGroupId),
    index("model_group_membership_model_id_idx").on(table.modelId),
    index("model_group_membership_role_idx").on(table.role),
    // Ensure one model can only have one active role per group
    uniqueIndex("unique_active_model_group_membership").on(
      table.modelGroupId,
      table.modelId,
      table.isActive,
    ),
  ],
);

// Relations
export const modelsRelations = relations(models, ({ one, many }) => ({
  org: one(orgs, {
    fields: [models.orgId],
    references: [orgs.id],
  }),
  metrics: many(model_metrics),
  inferences: many(inferences),
  groupMemberships: many(modelGroupMemberships),
}));

export const model_metricsRelations = relations(model_metrics, ({ one }) => ({
  model: one(models, {
    fields: [model_metrics.modelId],
    references: [models.id],
  }),
}));

export const inferencesRelations = relations(inferences, ({ one }) => ({
  model: one(models, {
    fields: [inferences.modelId],
    references: [models.id],
  }),
}));

// New ModelGroup relations for EPIC-4
export const modelGroupsRelations = relations(modelGroups, ({ one, many }) => ({
  org: one(orgs, {
    fields: [modelGroups.orgId],
    references: [orgs.id],
  }),
  memberships: many(modelGroupMemberships),
}));

export const modelGroupMembershipsRelations = relations(
  modelGroupMemberships,
  ({ one }) => ({
    modelGroup: one(modelGroups, {
      fields: [modelGroupMemberships.modelGroupId],
      references: [modelGroups.id],
    }),
    model: one(models, {
      fields: [modelGroupMemberships.modelId],
      references: [models.id],
    }),
  }),
);
