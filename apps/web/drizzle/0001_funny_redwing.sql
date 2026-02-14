ALTER TABLE "github_connections" ADD COLUMN "installation_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "github_connections" ADD COLUMN "account_type" text;--> statement-breakpoint
ALTER TABLE "github_connections" ADD COLUMN "account_avatar_url" text;--> statement-breakpoint
ALTER TABLE "github_connections" ADD COLUMN "selected_repositories" json;--> statement-breakpoint
ALTER TABLE "github_connections" ADD COLUMN "primary_repo" text;--> statement-breakpoint
ALTER TABLE "github_connections" ADD COLUMN "permissions" json;--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "access_token";--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "refresh_token";--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "scope";--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "token_type";--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "github_connections" DROP COLUMN "selected_repo";--> statement-breakpoint
ALTER TABLE "github_connections" ADD CONSTRAINT "github_connections_installation_id_unique" UNIQUE("installation_id");