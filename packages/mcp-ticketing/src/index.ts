#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from '@octokit/rest';
import { App } from '@octokit/app';
import { db, githubConnections, repositorySettings, incidentHistory } from './db.js';
import { desc, eq, and } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * MCP Server: GitHub Ticketing with GitHub App Integration
 * Fetches credentials from database and uses installation tokens
 */

// GitHub App configuration
const appId = process.env.GITHUB_APP_ID;
const privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH;

let githubApp: App | null = null;

if (appId && privateKeyPath) {
  try {
    const privateKey = readFileSync(join(process.cwd(), privateKeyPath), 'utf-8');
    githubApp = new App({
      appId,
      privateKey,
    });
    console.error('✅ GitHub App initialized');
  } catch (error) {
    console.error('⚠️  Could not initialize GitHub App:', error);
  }
}

const server = new Server(
  {
    name: 'ticketing-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper: Get GitHub connection and octokit
async function getGitHubClient(): Promise<{
  octokit: any; // Using any to avoid Octokit version conflicts
  owner: string;
  repo: string;
} | null> {
  try {
    // Fetch most recent active GitHub connection
    const connections = await db
      .select()
      .from(githubConnections)
      .where(eq(githubConnections.isActive, true))
      .orderBy(desc(githubConnections.createdAt))
      .limit(1);

    if (connections.length === 0) {
      console.error('⚠️  No active GitHub connections found in database');
      return null;
    }

    const connection = connections[0];

    // Try to find primary repository from settings
    let repoFullName: string | null = null;

    const settings = await db
      .select()
      .from(repositorySettings)
      .where(
        and(
          eq(repositorySettings.connectionId, connection.id),
          eq(repositorySettings.isPrimary, true),
          eq(repositorySettings.isActive, true)
        )
      )
      .limit(1);

    if (settings.length > 0) {
      repoFullName = settings[0].repoFullName;
    } else if (connection.repositories && connection.repositories.length > 0) {
      // Fallback to first repository if no primary is set
      repoFullName = connection.repositories[0].fullName;
      console.error(`⚠️  No primary repository set, using first repo: ${repoFullName}`);
    }

    if (!repoFullName) {
      console.error('⚠️  No repositories available');
      return null;
    }

    const [owner, repo] = repoFullName.split('/');

    if (!githubApp) {
      console.error('⚠️  GitHub App not configured');
      return null;
    }

    // Generate installation access token
    const installationOctokit = await githubApp.getInstallationOctokit(
      connection.installationId
    );

    console.error(`✅ Connected to ${owner}/${repo} via installation ${connection.installationId}`);

    return {
      octokit: installationOctokit,
      owner,
      repo,
    };
  } catch (error) {
    console.error('❌ Error getting GitHub client:', error);
    return null;
  }
}

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_incident_ticket',
        description: 'Create an incident ticket in GitHub Issues with severity labels. Uses GitHub App installation tokens from database.',
        inputSchema: {
          type: 'object',
          properties: {
            incident_id: {
              type: 'string',
              description: 'Incident ID (e.g., INC-2026-001)',
            },
            title: {
              type: 'string',
              description: 'Short, descriptive title for the incident',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the incident',
            },
            severity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low'],
              description: 'Incident severity level',
            },
            affected_users: {
              type: 'number',
              description: 'Number of affected users',
            },
            service: {
              type: 'string',
              description: 'Affected service name',
            },
            region: {
              type: 'string',
              description: 'Geographic region affected',
            },
          },
          required: ['incident_id', 'title', 'description', 'severity'],
        },
      },
      {
        name: 'update_ticket_status',
        description: 'Update the status of an existing ticket',
        inputSchema: {
          type: 'object',
          properties: {
            ticket_number: {
              type: 'number',
              description: 'GitHub issue number',
            },
            status: {
              type: 'string',
              enum: ['investigating', 'resolved', 'monitoring'],
              description: 'New status for the ticket',
            },
            comment: {
              type: 'string',
              description: 'Status update comment',
            },
          },
          required: ['ticket_number', 'status'],
        },
      },
      {
        name: 'list_recent_tickets',
        description: 'List recent incident tickets from the connected repository',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of tickets to return',
              default: 10,
            },
            severity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low', 'all'],
              description: 'Filter by severity',
              default: 'all',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const client = await getGitHubClient();

    if (!client) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              mode: 'dry-run',
              error: 'GitHub not configured - no active connections found',
              message: 'Please connect your GitHub account via the web UI first',
            }),
          },
        ],
      };
    }

    const { octokit, owner, repo } = client;

    switch (name) {
      case 'create_incident_ticket': {
        const {
          incident_id,
          title,
          description,
          severity,
          affected_users,
          service,
          region,
        } = args as {
          incident_id: string;
          title: string;
          description: string;
          severity: string;
          affected_users?: number;
          service?: string;
          region?: string;
        };

        const repoFullName = `${owner}/${repo}`;

        // Check if ticket already exists for this incident
        const existingIncidents = await db
          .select()
          .from(incidentHistory)
          .where(
            and(
              eq(incidentHistory.incidentId, incident_id),
              eq(incidentHistory.repoFullName, repoFullName),
              eq(incidentHistory.ticketCreated, true)
            )
          )
          .limit(1);

        if (existingIncidents.length > 0) {
          const existing = existingIncidents[0];
          console.error(`⚠️  Ticket already exists for ${incident_id}: #${existing.ticketNumber}`);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    duplicate: true,
                    message: 'Ticket already exists for this incident',
                    ticket_url: existing.ticketUrl,
                    ticket_number: existing.ticketNumber,
                    incident_id,
                    severity,
                    repository: repoFullName,
                    created_at: existing.createdAt,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // Create GitHub issue (only if not duplicate)
        const issue = await octokit.request('POST /repos/{owner}/{repo}/issues', {
          owner,
          repo,
          title: `[${severity.toUpperCase()}] ${title}`,
          body: formatTicketBody(incident_id, description, severity, affected_users, service, region),
          labels: getLabels(severity),
        });

        // Record in incident history
        await db.insert(incidentHistory).values({
          clerkUserId: 'system', // TODO: Get actual user ID from connection
          repoFullName,
          incidentId: incident_id,
          incidentSeverity: severity,
          incidentService: service || 'unknown',
          incidentDescription: description,
          ticketNumber: issue.data.number,
          ticketUrl: issue.data.html_url,
          ticketCreated: true,
        });

        console.error(`✅ Created new ticket #${issue.data.number} for ${incident_id}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  duplicate: false,
                  ticket_url: issue.data.html_url,
                  ticket_number: issue.data.number,
                  incident_id,
                  severity,
                  repository: repoFullName,
                  created_at: issue.data.created_at,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'update_ticket_status': {
        const { ticket_number, status, comment } = args as {
          ticket_number: number;
          status: string;
          comment?: string;
        };

        // Add comment to issue
        const commentText = comment
          ? `**Status Update: ${status}**\n\n${comment}`
          : `**Status Update: ${status}**`;

        const issueComment = await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
          owner,
          repo,
          issue_number: ticket_number,
          body: commentText,
        });

        // Add status label
        await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
          owner,
          repo,
          issue_number: ticket_number,
          labels: [`status:${status}`],
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  ticket_number,
                  status,
                  repository: `${owner}/${repo}`,
                  comment_url: issueComment.data.html_url,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'list_recent_tickets': {
        const { limit = 10, severity = 'all' } = args as {
          limit?: number;
          severity?: string;
        };

        // Build label filter
        const labels =
          severity !== 'all' ? [`severity:${severity}`, 'incident'] : ['incident'];

        const issues = await octokit.request('GET /repos/{owner}/{repo}/issues', {
          owner,
          repo,
          labels: labels.join(','),
          state: 'all',
          per_page: limit,
          sort: 'created',
          direction: 'desc',
        });

        const tickets = issues.data.map((issue: any) => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          url: issue.html_url,
          created_at: issue.created_at,
          labels: issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name)),
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  repository: `${owner}/${repo}`,
                  total: tickets.length,
                  tickets,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'Unknown tool' }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Tool execution failed',
            message: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
      isError: true,
    };
  }
});

// Helper functions
function formatTicketBody(
  incident_id: string,
  description: string,
  severity: string,
  affected_users?: number,
  service?: string,
  region?: string
): string {
  return `## Incident: ${incident_id}

**Severity:** ${severity.toUpperCase()}

### Description
${description}

### Impact
${affected_users ? `- **Affected Users:** ${affected_users.toLocaleString()}` : ''}
${service ? `- **Service:** ${service}` : ''}
${region ? `- **Region:** ${region}` : ''}

### Timeline
- **Detected:** ${new Date().toISOString()}
- **Status:** Investigating

---
*🤖 Auto-created by SecureOps AI Agent via Archestra MCP*
*Repository selected by user through GitHub App installation*
`;
}

function getLabels(severity: string): string[] {
  const labels = ['incident', `severity:${severity}`, 'automated'];

  // Add priority label based on severity
  if (severity === 'critical') {
    labels.push('priority:P0');
  } else if (severity === 'high') {
    labels.push('priority:P1');
  } else if (severity === 'medium') {
    labels.push('priority:P2');
  } else {
    labels.push('priority:P3');
  }

  return labels;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✅ GitHub Ticketing MCP Server v2.0 running on stdio');
  console.error('📦 Using GitHub App installation tokens from database');

  // Test connection
  const client = await getGitHubClient();
  if (client) {
    console.error(`✅ Ready to create tickets in ${client.owner}/${client.repo}`);
  } else {
    console.error('⚠️  No GitHub connection configured - running in limited mode');
    console.error('   Connect your GitHub account via the web UI to enable ticketing');
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
