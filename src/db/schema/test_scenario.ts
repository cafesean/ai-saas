import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  index,
  serial,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orgs } from "./org";

export const test_scenarios = pgTable(
  "test_scenarios",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").notNull().defaultRandom().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    
    // Artifact reference (what artifact this test is for)
    artifactType: varchar("artifact_type", { length: 50 }).notNull(), // 'decision_table', 'lookup_table', 'variable', 'rule_set'
    artifactId: uuid("artifact_id").notNull(), // UUID of the artifact being tested
    
    // Test data
    inputData: json("input_data").notNull(), // The input values for the test
    expectedOutput: json("expected_output"), // Expected output (optional, for validation)
    actualOutput: json("actual_output"), // Last actual output from running the test
    
    // Test metadata
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    lastRunStatus: varchar("last_run_status", { length: 50 }), // 'passed', 'failed', 'error'
    
    // Multi-tenancy support
    orgId: integer("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "restrict" }),
      
    // User who created the test
    createdBy: integer("created_by"), // User ID
      
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("test_scenario_id_idx").on(table.id),
    index("test_scenario_uuid_idx").on(table.uuid), 
    index("test_scenario_org_id_idx").on(table.orgId),
    index("test_scenario_artifact_idx").on(table.artifactType, table.artifactId),
    index("test_scenario_created_by_idx").on(table.createdBy),
  ],
);

// Relations
export const testScenariosRelations = relations(test_scenarios, ({ one }) => ({
  org: one(orgs, {
    fields: [test_scenarios.orgId],
    references: [orgs.id],
  }),
})); 