-- Migration 0001_smooth_baron_zemo: Legacy pricing tables cleanup
-- This migration was originally designed to modify legacy pricing tables
-- (group, group_policy, org, org_user, role_policy, user, level_rates, level_roles, pricing_roles, pricings, ratecards, roles)
-- These tables no longer exist in the current system, so this migration is now a no-op.

-- No-op statement to ensure migration runs successfully
SELECT 1;