#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from '@octokit/rest';

/**
 * MCP Server: GitHub Ticketing
 * Creates incident tickets in GitHub Issues
 * Integrates with Archestra for secure incident response workflow
 */

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Parse GitHub repo from env (format: owner/repo)
const repoString = process.env.GITHUB_REPO || '';
const [owner, repo] = repoString.split('/');

if (!owner || !repo) {
  console.error('⚠️  Warning: GITHUB_REPO not properly configured (format: owner/repo)');
  console.error('   Ticketing features will be limited to dry-run mode');
}

const server = new Server(
  {
    name: 'ticketing-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_incident_ticket',
        description: 'Create an incident ticket in GitHub Issues with severity labels',
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
        description: 'List recent incident tickets',
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

        // Check if GitHub is configured
        if (!owner || !repo || !process.env.GITHUB_TOKEN) {
          // Dry-run mode
          const dryRunResult = {
            mode: 'dry-run',
            message: 'GitHub not configured - simulating ticket creation',
            ticket: {
              title: `[${severity.toUpperCase()}] ${title}`,
              body: formatTicketBody(incident_id, description, severity, affected_users, service, region),
              labels: getLabels(severity),
            },
          };

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(dryRunResult, null, 2),
              },
            ],
          };
        }

        // Create actual GitHub issue
        const issue = await octokit.issues.create({
          owner,
          repo,
          title: `[${severity.toUpperCase()}] ${title}`,
          body: formatTicketBody(incident_id, description, severity, affected_users, service, region),
          labels: getLabels(severity),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  ticket_url: issue.data.html_url,
                  ticket_number: issue.data.number,
                  incident_id,
                  severity,
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

        if (!owner || !repo || !process.env.GITHUB_TOKEN) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  mode: 'dry-run',
                  message: 'GitHub not configured - simulating status update',
                  ticket_number,
                  status,
                  comment,
                }),
              },
            ],
          };
        }

        // Add comment to issue
        const commentText = comment
          ? `**Status Update: ${status}**\n\n${comment}`
          : `**Status Update: ${status}**`;

        const issueComment = await octokit.issues.createComment({
          owner,
          repo,
          issue_number: ticket_number,
          body: commentText,
        });

        // Add status label
        await octokit.issues.addLabels({
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

        if (!owner || !repo || !process.env.GITHUB_TOKEN) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  mode: 'dry-run',
                  message: 'GitHub not configured - cannot list tickets',
                }),
              },
            ],
          };
        }

        // Build label filter
        const labels =
          severity !== 'all' ? [`severity:${severity}`, 'incident'] : ['incident'];

        const issues = await octokit.issues.listForRepo({
          owner,
          repo,
          labels: labels.join(','),
          state: 'all',
          per_page: limit,
          sort: 'created',
          direction: 'desc',
        });

        const tickets = issues.data.map((issue) => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          url: issue.html_url,
          created_at: issue.created_at,
          labels: issue.labels.map((l) => (typeof l === 'string' ? l : l.name)),
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
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

  console.error('✅ GitHub Ticketing MCP Server running on stdio');
  if (owner && repo) {
    console.error(`📝 Connected to: ${owner}/${repo}`);
  } else {
    console.error('⚠️  Running in dry-run mode (GITHUB_REPO not configured)');
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
