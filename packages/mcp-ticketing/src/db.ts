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

// GitHub Connections table schema (matches web app)
export const githubConnections = pgTable('github_connections', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  userId: text('user_id').notNull(),
  installationId: integer('installation_id').notNull().unique(),
  githubUserId: text('github_user_id').notNull(),
  githubUsername: text('github_username').notNull(),
  accountType: text('account_type'),
  accountAvatarUrl: text('account_avatar_url'),
  selectedRepositories: json('selected_repositories').$type<Array<{
    id: number;
    name: string;
    fullName: string;
    private: boolean;
  }>>(),
  primaryRepo: text('primary_repo'),
  permissions: json('permissions'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
