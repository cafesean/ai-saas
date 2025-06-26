-- Migration: 0013_glamorous_boom_boom
-- Add session timeout preference column to users table

-- CONDITIONAL: Only alter users table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE "users" ADD COLUMN "session_timeout_preference" integer DEFAULT 1440;
    END IF;
END $$;