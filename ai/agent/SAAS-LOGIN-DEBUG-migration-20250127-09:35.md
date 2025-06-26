# SAAS Login Debug - Database Migration Issue

## Context Priming Completed ✅
- **Issue:** Database query failing during login authentication
- **Error:** Query selecting from users table failing with specific column list
- **Hypothesis:** Database migration has changed users table schema but authentication code still expects old columns

## Task: Debug Login Database Migration Issue
**Timestamp:** 2025-01-27 09:35
**User:** stanley@jetdevs.com login failing
**Error Pattern:** Failed query selecting from users table

## Failed Query Analysis
```sql
select "id", "uuid", "email", "name", "first_name", "last_name", "username", "password", "avatar", "phone", "is_active", "session_timeout_preference", "org_data", "created_at", "updated_at" 
from "users" "users" 
where "users"."email" = $1 limit $2
```

## Debugging Plan
[ ] Check current users table schema in database
[ ] Review recent database migrations 
[ ] Examine authentication code making this query
[ ] Compare expected vs actual schema
[ ] Identify missing or renamed columns
[ ] Fix schema mismatch

## Investigation Steps
### Step 1: Database Schema Investigation
- [ ] Check users table schema in drizzle/schema files
- [ ] Look at recent migrations in drizzle/ directory
- [ ] Run migration status check

### Step 2: Authentication Code Analysis  
- [ ] Find where this query originates in auth code
- [ ] Check NextAuth configuration and callbacks
- [ ] Verify user lookup logic

### Step 3: Fix Implementation
- [ ] Apply missing migrations if needed
- [ ] Update auth code if schema changed
- [ ] Test login functionality

## Notes
- Query suggests code expects columns like: first_name, last_name, username, phone, session_timeout_preference, org_data
- Need to verify if these columns exist in current schema

## Progress
✅ Step 1: Database Schema Investigation COMPLETE
- Found users table schema in `src/db/schema/org.ts` 
- Actual schema has: id, uuid, email, name, firstName, lastName, username, password, avatar, phone, isActive, sessionTimeoutPreference, orgData, createdAt, updatedAt
- Generated schema confirms columns exist in database
- ❌ ISSUE FOUND: Missing sessionTimeoutPreference column in import

✅ Step 2: Authentication Code Analysis COMPLETE  
- Query in `src/server/auth-simple.ts` uses `db.query.users.findFirst()`
- Auth code expects: sessionTimeoutPreference field 
- Import statement: `import { users } from '@/db/schema';`
- Uses default schema export which should include sessionTimeoutPreference

## ROOT CAUSE IDENTIFIED ✅
**Issue:** Remote Neon database is completely empty - no tables exist!

**Environment Details:**
- Local DB: `postgresql://seanliao@localhost:5432/saas` ✅ Working
- Remote DB: `postgres://neondb_owner:npg_...@ep-delicate-bread-a1skzq06-pooler.ap-southeast-1.aws.neon.tech/neondb` ❌ Empty

**Problem:** Login failing because `users` table doesn't exist in remote database.

## Solution: Apply Migrations to Remote Database
[✅] Set DATABASE_URL to remote Neon database
[⚠️] Run drizzle-kit migrate to create all tables - PARTIAL (missing migration 0014)
[✅] Apply missing migration 0014_familiar_dakota_north.sql - MANUAL FIX APPLIED
- Added `session_timeout_preference` column to users table
- Confirmed stanley@jetdevs.com user exists with session_timeout_preference = 1440
[ ] Test login on remote database

## RESOLUTION STATUS
✅ **Root cause identified and fixed:** 
- Remote Neon database was missing `session_timeout_preference` column in users table
- Column manually added with: `ALTER TABLE users ADD COLUMN session_timeout_preference integer DEFAULT 1440;`
- User stanley@jetdevs.com confirmed to exist in database

⚠️ **Next Step:** Test login functionality to confirm fix works

## Fixed Issue Details
**Root Cause:** Missing `session_timeout_preference` column in remote database users table
**Solution:** Migration 0014_familiar_dakota_north.sql adds this column but wasn't applied to remote DB
**Action:** Need to apply pending migration 0014 to add the missing column 