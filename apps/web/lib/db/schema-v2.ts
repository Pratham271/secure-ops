import { pgTable, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/**
 * GitHub Connections - Updated for Clerk
 * Links Clerk users to their GitHub App installations
 */
export const githubConnections = pgTable('github_connections', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
  installationId: integer('installation_id').notNull().unique(),
  githubUserId: text('github_user_id').notNull(),
  githubUsername: text('github_username').notNull(),
  accountType: text('account_type'), // 'User' or 'Organization'
  accountAvatarUrl: text('account_avatar_url'),
  repositories: json('repositories').$type<Array<{
    id: number;
    name: string;
    fullName: string;
    private: boolean;
    description: string | null;
    language: string | null;
    updatedAt: string;
  }>>(),
  permissions: json('permissions'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Repository Settings - New table
 * Per-repository settings for each user
 */
export const repositorySettings = pgTable('repository_settings', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  connectionId: text('connection_id').notNull(), // FK to github_connections
  repoFullName: text('repo_full_name').notNull(), // "owner/repo"
  repoId: integer('repo_id').notNull(), // GitHub repo ID
  isPrimary: boolean('is_primary').notNull().default(false), // User's default repo
  isActive: boolean('is_active').notNull().default(true),
  settings: json('settings').$type<{
    notifications?: boolean;
    autoTriage?: boolean;
    severityThreshold?: 'critical' | 'high' | 'medium' | 'low';
  }>(),
  lastViewedAt: timestamp('last_viewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Incident History - New table
 * Track incidents and tickets created by the AI agent
 */
export const incidentHistory = pgTable('incident_history', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  repoFullName: text('repo_full_name').notNull(),
  incidentId: text('incident_id').notNull(),
  incidentSeverity: text('incident_severity').notNull(),
  incidentService: text('incident_service').notNull(),
  incidentDescription: text('incident_description'),
  ticketNumber: integer('ticket_number'),
  ticketUrl: text('ticket_url'),
  ticketCreated: boolean('ticket_created').notNull().default(false),
  triageResult: json('triage_result').$type<{
    shouldCreateTicket: boolean;
    priority: string;
    reasoning: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types
export type GitHubConnection = typeof githubConnections.$inferSelect;
export type NewGitHubConnection = typeof githubConnections.$inferInsert;
export type RepositorySetting = typeof repositorySettings.$inferSelect;
export type NewRepositorySetting = typeof repositorySettings.$inferInsert;
export type IncidentHistory = typeof incidentHistory.$inferSelect;
export type NewIncidentHistory = typeof incidentHistory.$inferInsert;
