import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables before anything else
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config({ path: join(__dirname, '../../../apps/web/.env.local') });

// GitHub Connections table schema (updated for Clerk v2)
export const githubConnections = pgTable('github_connections', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(), // Updated for Clerk
  installationId: integer('installation_id').notNull().unique(),
  githubUserId: text('github_user_id').notNull(),
  githubUsername: text('github_username').notNull(),
  accountType: text('account_type'),
  accountAvatarUrl: text('account_avatar_url'),
  repositories: json('repositories').$type<Array<{ // Renamed from selectedRepositories
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

// Repository Settings table
export const repositorySettings = pgTable('repository_settings', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  connectionId: text('connection_id').notNull(),
  repoFullName: text('repo_full_name').notNull(),
  repoId: integer('repo_id').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  settings: json('settings'),
  lastViewedAt: timestamp('last_viewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Incident History - track all incidents processed
export const incidentHistory = pgTable('incident_history', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  clerkUserId: text('clerk_user_id').notNull(),
  repoFullName: text('repo_full_name').notNull(),

  // Incident data
  incidentId: text('incident_id').notNull(),
  incidentSeverity: text('incident_severity').notNull(),
  incidentService: text('incident_service').notNull(),
  incidentDescription: text('incident_description'),

  // Ticket info
  ticketNumber: integer('ticket_number'),
  ticketUrl: text('ticket_url'),
  ticketCreated: boolean('ticket_created').notNull().default(false),

  // Triage result
  triageResult: json('triage_result').$type<{
    shouldCreateTicket: boolean;
    priority: string;
    reasoning: string;
  }>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('⚠️  DATABASE_URL not found in environment');
  console.error('   Make sure .env.local is configured in apps/web/');
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
export const db = drizzle(client);
