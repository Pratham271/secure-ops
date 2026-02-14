import { pgTable, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/**
 * Database Schema for SecureOps
 * Using Drizzle ORM with Postgres
 */

// Users table
export const users = pgTable('users', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// GitHub Connections - stores GitHub App installation data
export const githubConnections = pgTable('github_connections', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // GitHub App Installation
  installationId: integer('installation_id').notNull().unique(),

  // GitHub user data
  githubUserId: text('github_user_id').notNull(),
  githubUsername: text('github_username').notNull(),

  // Installation metadata
  accountType: text('account_type'), // 'User' or 'Organization'
  accountAvatarUrl: text('account_avatar_url'),

  // Selected repositories (JSON array of repository objects)
  selectedRepositories: json('selected_repositories').$type<Array<{
    id: number;
    name: string;
    fullName: string;
    private: boolean;
  }>>(),

  // Primary repository for incident tickets
  primaryRepo: text('primary_repo'), // format: owner/repo

  // Installation permissions
  permissions: json('permissions'),

  // Status
  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Incidents table - track processed incidents
export const incidents = pgTable('incidents', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),

  // Incident data
  incidentId: text('incident_id').notNull().unique(), // e.g., INC-2026-001
  severity: text('severity').notNull(), // critical, high, medium, low
  service: text('service').notNull(),
  description: text('description').notNull(),
  affectedUsers: integer('affected_users'),
  region: text('region'),

  // Processing status
  status: text('status').notNull().default('pending'), // pending, triaged, ticketed, resolved

  // GitHub ticket info
  githubIssueNumber: integer('github_issue_number'),
  githubIssueUrl: text('github_issue_url'),

  // Metadata
  rawData: json('raw_data'), // Full incident JSON
  processingLogs: json('processing_logs'), // Agent processing history

  // Timestamps
  detectedAt: timestamp('detected_at').notNull(),
  processedAt: timestamp('processed_at'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Agent Execution Logs - for observability
export const agentLogs = pgTable('agent_logs', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),

  incidentId: text('incident_id').references(() => incidents.id, {
    onDelete: 'cascade',
  }),

  // Execution details
  action: text('action').notNull(), // e.g., 'triage', 'create_ticket', 'notify'
  status: text('status').notNull(), // success, error, pending

  // LLM details
  model: text('model'), // e.g., llama-3.3-70b-versatile
  tokensUsed: integer('tokens_used'),
  costUsd: text('cost_usd'), // Store as string for precision

  // Logs
  inputData: json('input_data'),
  outputData: json('output_data'),
  errorMessage: text('error_message'),

  // Timing
  durationMs: integer('duration_ms'),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Discord Connections - optional
export const discordConnections = pgTable('discord_connections', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  webhookUrl: text('webhook_url').notNull(), // Encrypted
  channelName: text('channel_name'),

  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type GithubConnection = typeof githubConnections.$inferSelect;
export type NewGithubConnection = typeof githubConnections.$inferInsert;

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;

export type AgentLog = typeof agentLogs.$inferSelect;
export type NewAgentLog = typeof agentLogs.$inferInsert;

export type DiscordConnection = typeof discordConnections.$inferSelect;
export type NewDiscordConnection = typeof discordConnections.$inferInsert;
