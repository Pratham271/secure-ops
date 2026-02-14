-- Migration to add Clerk support and multi-repo functionality
-- Run this AFTER setting up Clerk

-- Step 1: Add clerk_user_id column to github_connections (nullable first)
ALTER TABLE github_connections ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Step 2: Rename userId to legacy_user_id (for backup)
ALTER TABLE github_connections RENAME COLUMN user_id TO legacy_user_id;

-- Step 3: Update repositories column structure (already JSON, but document expected structure)
COMMENT ON COLUMN github_connections.repositories IS 'Array of repository objects with id, name, fullName, private, description, language, updatedAt';

-- Step 4: Remove primary_repo column (replaced by repository_settings table)
ALTER TABLE github_connections DROP COLUMN IF EXISTS primary_repo;

-- Step 5: Create repository_settings table
CREATE TABLE IF NOT EXISTS repository_settings (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  connection_id TEXT NOT NULL REFERENCES github_connections(id) ON DELETE CASCADE,
  repo_full_name TEXT NOT NULL,
  repo_id INTEGER NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB,
  last_viewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 6: Create incident_history table
CREATE TABLE IF NOT EXISTS incident_history (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  repo_full_name TEXT NOT NULL,
  incident_id TEXT NOT NULL,
  incident_severity TEXT NOT NULL,
  incident_service TEXT NOT NULL,
  incident_description TEXT,
  ticket_number INTEGER,
  ticket_url TEXT,
  ticket_created BOOLEAN NOT NULL DEFAULT false,
  triage_result JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 7: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_github_connections_clerk_user ON github_connections(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_repository_settings_clerk_user ON repository_settings(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_repository_settings_repo ON repository_settings(repo_full_name);
CREATE INDEX IF NOT EXISTS idx_incident_history_clerk_user ON incident_history(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_incident_history_repo ON incident_history(repo_full_name);
CREATE INDEX IF NOT EXISTS idx_repository_settings_primary ON repository_settings(clerk_user_id, is_primary) WHERE is_primary = true;

-- Step 8: Add unique constraint for one primary repo per user per connection
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_per_user
  ON repository_settings(clerk_user_id, connection_id)
  WHERE is_primary = true;

COMMENT ON TABLE repository_settings IS 'Per-repository settings for each user - supports multiple repos';
COMMENT ON TABLE incident_history IS 'Historical record of all incidents processed by the AI agent';
