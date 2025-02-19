import { 
  timestamp, 
  text, 
  pgTable,
  varchar,
  boolean,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email(),
  name: z.string().min(2).max(255),
})

export const selectUserSchema = createSelectSchema(users)

export type User = z.infer<typeof selectUserSchema>
export type NewUser = z.infer<typeof insertUserSchema> 