CREATE TABLE "incident_history" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"repo_full_name" text NOT NULL,
	"incident_id" text NOT NULL,
	"incident_severity" text NOT NULL,
	"incident_service" text NOT NULL,
	"incident_description" text,
	"ticket_number" integer,
	"ticket_url" text,
	"ticket_created" boolean DEFAULT false NOT NULL,
	"triage_result" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repository_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"repo_full_name" text NOT NULL,
	"repo_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"settings" json,
	"last_viewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discord_connections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "incidents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "discord_connections" CASCADE;--> statement-breakpoint
DROP TABLE "incidents" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "agent_logs" DROP CONSTRAINT "agent_logs_incident_id_incidents_id_fk";
--> statement-breakpoint
ALTER TABLE "github_connections" DROP CONSTRAINT "github_connections_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_logs" ADD COLUMN "clerk_user_id" text;--> statement-breakpoint
ALTER TABLE "agent_logs" ADD COLUMN "repo_full_name" text;--> statement-breakpoint
ALTER TABLE "github_connections" ADD COLUMN "clerk_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "github_connections" ADD COLUMN "repositories" json;--> statement-breakpoint
ALTER TABLE "agent_logs" DROP COLUMN "incident_id";--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "selected_repositories";--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "primary_repo";