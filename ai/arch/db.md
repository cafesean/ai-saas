# AI SaaS Platform - PostgreSQL Database Schema Design Best Practices

**Preamble:**
This document outlines the best practices for designing database schemas in PostgreSQL, particularly for SaaS applications like the AI SaaS Platform. The goals are to ensure data integrity, scalability, maintainability, performance, and clarity. All new schema designs and modifications should be checked against these guidelines.

**I. Core Principles:**

1.  **Clarity & Readability:** The schema should be easily understandable. Names should be intuitive and self-documenting where possible.
2.  **Consistency:** Adhere strictly to chosen conventions across the entire schema.
3.  **Data Integrity:** Prioritize the correctness and validity of data through constraints and appropriate data types.
4.  **Performance:** Design for efficient querying and data manipulation, but don't prematurely optimize without measurement.
5.  **Scalability:** Design with future growth in mind, especially concerning data volume and concurrent users (tenant isolation is key for SaaS).
6.  **Maintainability:** The schema should be easy to evolve and manage over time.

**II. Naming Conventions:**

1.  **General Case:** Use `lowercase_snake_case` for all identifiers (tables, columns, functions, indexes, constraints, schemas, etc.).
    *   *Rationale:* PostgreSQL folds unquoted identifiers to lowercase. Quoting is cumbersome. Snake case is standard and readable.
2.  **Tables:**
    *   Use **plural nouns** (e.g., `users`, `product_orders`, `tenant_settings`). *Self-correction: While singular is also common, the provided Drizzle schemas (e.g., `models`, `workflows`, `endpoints`) consistently use plural nouns. This document will reflect the observed pattern in the project.*
    *   For join tables (many-to-many), combine the names of the two tables they connect, typically in alphabetical order or `parent_child` order if clear (e.g., `groups_users`, `posts_tags`).
3.  **Columns:**
    *   **Primary Keys:** Name them `id`.
    *   **Foreign Keys:** Use the format `referencing_table_singular_name_id` (e.g., in `product_orders` table, FK to `users` is `user_id`).
    *   **Boolean Flags:** Prefix with `is_`, `has_`, `can_`, `should_` (e.g., `is_active`, `has_trial_ended`).
    *   **Timestamps:** Use suffixes like `_at` or `_on` (e.g., `created_at`, `updated_at`, `published_on`, `expires_at`).
    *   **Descriptive Names:** Prefer clarity over brevity (e.g., `user_language_preference` instead of `lang_pref`).
4.  **Indexes:**
    *   Prefix: `ix_` for general indexes, `uix_` for unique indexes.
    *   Format: `[prefix]table_name_column_names` (e.g., `ix_users_email`, `uix_users_tenant_id_username`).
5.  **Constraints:**
    *   Prefix and describe:
        *   Primary Key: `pk_table_name` (e.g., `pk_users`).
        *   Foreign Key: `fk_table_name_referencing_table_name_column_name` (e.g., `fk_orders_users_user_id`).
        *   Unique: `uq_table_name_column_names` (e.g., `uq_users_email`).
        *   Check: `chk_table_name_condition_description` (e.g., `chk_products_price_positive`).
    *   *Rationale:* Explicitly named constraints are crucial for debugging and schema management.

**III. Data Types:**

1.  **Timestamps:**
    *   **`TIMESTAMP WITH TIME ZONE` (`timestamptz`)**: Use this for *all* date/time storage that represents a specific point in time. Data is stored in UTC and converted to/from the session's timezone. The Drizzle schema uses `timestamp("column_name", { withTimezone: true, mode: "date" })` which correctly maps to `timestamptz`.
2.  **Numbers:**
    *   **`INTEGER` / `BIGINT`**: For whole numbers. Drizzle: `integer()`, `bigint("col", { mode: "number" })`. Choose `BIGINT` if `INTEGER` limits (approx +/- 2 billion) might be exceeded. `SERIAL` and `BIGSERIAL` (Drizzle: `serial("id")`) are good for auto-incrementing primary keys.
    *   **`NUMERIC(precision, scale)` / `DECIMAL(precision, scale)`**: For monetary values or any exact fractional values. Drizzle: `decimal("col", { precision: P, scale: S })`. **Never use `FLOAT` or `REAL` for money.**
3.  **Text:**
    *   **`TEXT`**: Preferred for variable-length strings. Drizzle: `text("col")`.
    *   **`VARCHAR(n)`**: Use only if there is a *strict, immutable business rule* for maximum length that must be enforced at the database level. Drizzle: `varchar("col", { length: N })`.
4.  **Primary Key Data Type:**
    *   **`SERIAL` / `BIGSERIAL` (auto-incrementing `INTEGER`/`BIGINT`)**: Good default for most tables. Drizzle: `serial("id")`.
    *   **Native `UUID`**: Excellent for distributed systems. Drizzle: `uuid("uuid_col").defaultRandom()`.
5.  **Booleans:** Use `BOOLEAN` (`TRUE`, `FALSE`, `NULL`). Drizzle: `boolean("col")`.
6.  **JSON:** Use `JSONB` for semi-structured data due to its efficiency and indexing capabilities. Avoid `JSON` (the non-binary variant). Drizzle: `json("col")` or `jsonb("col")`. The provided Drizzle schemas use `json()`, which typically maps to `jsonb` by default in modern PostgreSQL Drizzle configurations, but explicitly using `jsonb()` is safer.
7.  **Enumerated Types (PostgreSQL `ENUM`):**
    *   Define custom `ENUM` types for columns with a small, fixed set of possible string values. Drizzle allows defining enums and using `pgEnum`.
    *   *Rationale:* Type safety, smaller storage than text, better performance.

**IV. Primary Keys (PKs):**

1.  **Existence:** Every table must have a PK.
2.  **Name:** `id` is consistently used for `serial` PKs. `uuid` is used for UUID PKs.
3.  **Simplicity:** Single-column PKs are preferred and generally used.
4.  **Immutability:** PK values should never change once assigned.

**V. Foreign Keys (FKs) & Relationships:**

1.  **Definition:** FK constraints should always be defined to enforce referential integrity. Drizzle ORM handles this through `references(() => referencedTable.column)` in column definitions and `relations()` helpers.
2.  **Matching Types:** FK column type must exactly match the referenced PK column type.
3.  **`ON DELETE` Behavior:**
    *   **`RESTRICT` (or `NO ACTION`):** Often the default if not specified by the ORM. Safest.
    *   **`SET NULL`:** Use if the child row can logically exist without the parent (FK column must be nullable).
    *   **`CASCADE`:** Used in the provided schemas (e.g., `nodes` to `workflows`). Use with understanding of cascading effects. Document every use of `CASCADE`.
4.  **`ON UPDATE` Behavior:** Typically `RESTRICT` or `CASCADE`. Drizzle manages this based on driver defaults or explicit settings.
5.  **Indexing FKs:** **Always create indexes on FK columns.** Drizzle ORM might not do this automatically for all relationship types; manual indexing might be needed via `index()` in table definitions or separate migration scripts. *Review project's Drizzle setup for automatic FK indexing.*

**VI. Constraints (Beyond PK/FK):**

1.  **`NOT NULL`:** Enforce for all columns that cannot logically be empty. Drizzle: `.notNull()`.
2.  **`UNIQUE`:** Apply to columns or groups of columns that must be unique. Drizzle: `.unique()` on column or `uniqueIndex()` in table definition. Name them explicitly.
3.  **`CHECK`:** Use for domain integrity. Drizzle does not have a direct `check()` constraint builder in the core pgTable definition, but checks can be added via raw SQL in migrations or potentially through custom types/validators if the ORM supports them.

**VII. Indexing Strategy:**

1.  **Automatic:** PKs are automatically indexed by PostgreSQL. Drizzle's `.primaryKey()` ensures this.
2.  **Mandatory:** Index all FK columns (see V.5).
3.  **Query-Driven:** Index columns frequently used in:
    *   `WHERE` clauses (especially for high-cardinality columns).
    *   `JOIN` conditions (often covered by FK indexing rule).
    *   `ORDER BY` and `GROUP BY` clauses.
    *   Drizzle: Use `index("index_name").on(table.column1, table.column2)` within the table definition.
4.  **`JSONB` Indexing:** Use GIN indexes for searching within `JSONB` columns. This requires specific index creation syntax, often done in a migration.
5.  **Partial Indexes:** Consider for very large tables where queries frequently target a specific subset of rows.
6.  **Avoid Over-Indexing:** Indexes improve read performance but slow down writes. Regularly review index usage.

**VIII. SaaS Multi-Tenancy (Considerations):**

1.  **`tenant_id` Column:** If multi-tenancy is required at the database level (common for SaaS), a `tenant_id` column should be added to tenant-specific tables. This is not explicitly visible across all core tables in the provided Drizzle schema.
2.  **Row-Level Security (RLS):** If `tenant_id` is used, implement RLS policies to enforce data isolation.

**IX. Normalization & Denormalization:**

1.  **Start with 3rd Normal Form (3NF):** The provided schemas generally appear normalized.
2.  **Strategic Denormalization:** Only denormalize for specific, measured performance reasons.

**X. Auditability & Soft Deletes:**

1.  **Audit Columns:** `created_at` and `updated_at` (both `timestamptz`) are consistently used and set to `defaultNow()`. Consider adding `created_by_user_id` and `updated_by_user_id` if user-level auditing is needed.
2.  **Soft Deletes (Optional):** Not explicitly implemented in the provided schemas. If needed, add a `deleted_at TIMESTAMPTZ NULL` column.

**XI. Security (Database Level):**

1.  **Principle of Least Privilege:** Application database users should only have the minimum necessary permissions.
2.  **RLS:** (See Section VIII for multi-tenancy if applicable).

**XII. Maintainability & Evolution:**

1.  **Schema Migrations:** Use Drizzle Kit for generating and managing schema migrations. All schema changes must be scripted and version-controlled.
2.  **Comments:** While Drizzle schema doesn't directly support `COMMENT ON` SQL statements in its TypeScript definition, comments in the TS files themselves are crucial. For database-level comments, migrations would be the place to add them using raw SQL.

---

**AI Check Prompt Template (Adapted for Drizzle):**

"Review the following proposed Drizzle ORM schema changes / new table definitions against the established 'AI SaaS Platform - PostgreSQL Database Schema Design Best Practices' document. Specifically, verify adherence to:

1.  **Naming Conventions:**
    *   Are all identifiers (tables, columns) `lowercase_snake_case`?
    *   Are table names plural nouns?
    *   Are column names for PKs (`id`/`uuid`), FKs (`referencing_table_singular_id`), and timestamps (`_at`) correct?
    *   Are indexes explicitly named using the `ix_` or `uix_` convention?

2.  **Data Types (Drizzle to PostgreSQL mapping):**
    *   Is `timestamp("col", { withTimezone: true, mode: "date" })` used for all point-in-time date/time fields?
    *   Is `decimal("col", { precision: P, scale: S })` used for monetary values?
    *   Is `text("col")` used for variable strings (unless `varchar("col", { length: N })` is strictly justified)?
    *   Is the PK type appropriate (`serial()` or `uuid().defaultRandom()`)?
    *   Is `json("col")` or `jsonb("col")` (preferably `jsonb`) used for JSON data?
    *   Are `pgEnum` types used for fixed sets of string values where appropriate?

3.  **Primary & Foreign Keys:**
    *   Does every table have a PK defined with `.primaryKey()`?
    *   Are FKs defined using `.references(() => referencedTable.column)`?
    *   Is the `onDelete` behavior (e.g., `onDelete: 'cascade'`) explicitly chosen and justified?

4.  **Constraints:**
    *   Are `.notNull()`, `.unique()`, and `uniqueIndex()` appropriately applied?
    *   Are Drizzle-level validations or custom type checks used where appropriate (since direct `CHECK` constraints are not in the core `pgTable` API)?

5.  **Indexing:**
    *   Beyond PK indexes, are appropriate indexes defined using `index("index_name").on(...)` for common query patterns?

6.  **SaaS Multi-Tenancy (if applicable):**
    *   Is a `tenant_id` column present on relevant tables?
    *   Is it part of unique constraints/indexes where necessary?

7.  **Auditability:**
    *   Are `created_at` and `updated_at` (`timestamp with timezone`, `defaultNow()`) present?

8.  **General Clarity & Maintainability:**
    *   Is the purpose of each table and column clear from its Drizzle definition and associated TypeScript comments?
    *   Are there any ambiguities or potential points of confusion in the Drizzle schema?

Provide a list of deviations, concerns, and recommendations based on these best practices."