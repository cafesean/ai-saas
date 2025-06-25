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
  boolean,
} from "drizzle-orm/pg-core";

/**
 * Provider Schema - SAAS-264
 * Stores AI model provider configurations for backoffice management
 * No organization scoping - this is a global backoffice function
 */
export const providers = pgTable(
  "providers",
  {
    id: serial("id").notNull().primaryKey(),
    uuid: uuid("uuid").unique().notNull().defaultRandom(),
    providerId: varchar("provider_id", { length: 100 }).notNull().unique(), // Unique identifier like "openai_1234567890"
    
    // Basic provider information
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 50 }).notNull(), // openai, anthropic, google, etc.
    enabled: boolean("enabled").notNull().default(true),
    
    // Authentication and connection
    apiKey: varchar("api_key", { length: 500 }).notNull(), // Encrypted API key
    baseUrl: varchar("base_url", { length: 500 }), // Custom base URL if needed
    
    // Configuration options
    timeout: integer("timeout").default(30000), // Request timeout in milliseconds
    maxRetries: integer("max_retries").default(3), // Maximum retry attempts
    
    // Provider-specific configuration stored as JSON
    config: json("config"), // Store type-specific fields like organization, projectId, etc.
    
    // Rate limiting configuration
    rateLimiting: json("rate_limiting"), // { requestsPerMinute, requestsPerHour, tokensPerMinute }
    
    // Health and status tracking
    lastHealthCheck: timestamp("last_health_check", { withTimezone: true }),
    healthStatus: varchar("health_status", { length: 50 }).default("unknown"), // active, inactive, error, rate_limited
    healthError: text("health_error"), // Last health check error message
    
    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Indexes for performance
    providerIdIdx: index("providers_provider_id_idx").on(table.providerId),
    typeIdx: index("providers_type_idx").on(table.type),
    enabledIdx: index("providers_enabled_idx").on(table.enabled),
  })
);

// Types for TypeScript
export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;