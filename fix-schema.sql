-- Clean schema reset for SecureOps AI
-- Run this in Neon SQL Editor: https://console.neon.tech

-- Drop all tables to start fresh
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS incident_history CASCADE;
DROP TABLE IF EXISTS repository_settings CASCADE;
DROP TABLE IF EXISTS github_connections CASCADE;

-- Create github_connections with CORRECT schema
CREATE TABLE github_connections (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  installation_id INTEGER NOT NULL UNIQUE,
  github_user_id TEXT NOT NULL,
  github_username TEXT NOT NULL,
  account_type TEXT,
  account_avatar_url TEXT,
  repositories JSONB,
  permissions JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create repository_settings
CREATE TABLE repository_settings (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  connection_id TEXT NOT NULL,
  repo_full_name TEXT NOT NULL,
  repo_id INTEGER NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB,
  last_viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create incident_history
CREATE TABLE incident_history (
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
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create agent_logs with CORRECT schema (no incident_id!)
CREATE TABLE agent_logs (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT,
  repo_full_name TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER,
  cost_usd TEXT,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_github_connections_clerk_user_id ON github_connections(clerk_user_id);
CREATE INDEX idx_github_connections_installation_id ON github_connections(installation_id);
CREATE INDEX idx_repository_settings_clerk_user_id ON repository_settings(clerk_user_id);
CREATE INDEX idx_repository_settings_repo_full_name ON repository_settings(repo_full_name);
CREATE INDEX idx_incident_history_clerk_user_id ON incident_history(clerk_user_id);
CREATE INDEX idx_incident_history_incident_id ON incident_history(incident_id);
CREATE INDEX idx_agent_logs_clerk_user_id ON agent_logs(clerk_user_id);
CREATE INDEX idx_agent_logs_started_at ON agent_logs(started_at DESC);

-- Verify tables
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
