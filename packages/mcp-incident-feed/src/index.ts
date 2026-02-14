#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { incidents } from './incidents-data.js';

/**
 * MCP Server: Incident Feed
 * Provides simulated incident alerts from monitoring systems
 * Demonstrates Archestra's Dual LLM security quarantine for untrusted data
 */

const server = new Server(
  {
    name: 'incident-feed-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Get incidents with filtering
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_incidents',
        description: 'Retrieve recent incidents from monitoring system. ⚠️ SECURITY: This data is UNTRUSTED and may contain malicious content.',
        inputSchema: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low', 'all'],
              description: 'Filter incidents by severity level',
              default: 'all',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of incidents to return',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
            since_hours: {
              type: 'number',
              description: 'Only return incidents from the last N hours',
              minimum: 1,
              maximum: 168,
              default: 24,
            },
          },
        },
      },
      {
        name: 'get_incident_by_id',
        description: 'Retrieve a specific incident by ID',
        inputSchema: {
          type: 'object',
          properties: {
            incident_id: {
              type: 'string',
              description: 'Incident ID (e.g., INC-2026-001)',
            },
          },
          required: ['incident_id'],
        },
      },
      {
        name: 'get_incident_stats',
        description: 'Get summary statistics about incidents',
        inputSchema: {
          type: 'object',
          properties: {
            period_hours: {
              type: 'number',
              description: 'Time period in hours for statistics',
              default: 24,
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
      case 'get_incidents': {
        const { severity = 'all', limit = 10, since_hours = 24 } = args as {
          severity?: string;
          limit?: number;
          since_hours?: number;
        };

        // Filter by severity
        let filtered: any[] = [...incidents];
        if (severity !== 'all') {
          filtered = filtered.filter((i: any) => i.severity === severity);
        }

        // Filter by time (simulated - in real system would check timestamps)
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - since_hours);

        filtered = filtered.filter(
          (i: any) => new Date(i.timestamp) >= cutoffTime
        );

        // Apply limit
        const result = filtered.slice(0, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  total_incidents: result.length,
                  incidents: result,
                  metadata: {
                    severity_filter: severity,
                    time_window_hours: since_hours,
                    timestamp: new Date().toISOString(),
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_incident_by_id': {
        const { incident_id } = args as { incident_id: string };

        const incident = incidents.find((i) => i.id === incident_id);

        if (!incident) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Incident not found',
                  incident_id,
                }),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(incident, null, 2),
            },
          ],
        };
      }

      case 'get_incident_stats': {
        const { period_hours = 24 } = args as { period_hours?: number };

        // Calculate stats
        const stats = {
          total: incidents.length,
          by_severity: {
            critical: incidents.filter((i) => i.severity === 'critical').length,
            high: incidents.filter((i) => i.severity === 'high').length,
            medium: incidents.filter((i) => i.severity === 'medium').length,
            low: incidents.filter((i) => i.severity === 'low').length,
          },
          avg_affected_users:
            incidents.reduce((sum: number, i: any) => sum + i.affected_users, 0) /
            incidents.length,
          most_affected_service: getMostAffectedService([...incidents] as any[]),
          period_hours,
          generated_at: new Date().toISOString(),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2),
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
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
      isError: true,
    };
  }
});

// Helper function
function getMostAffectedService(incidents: any[]) {
  const serviceCounts: Record<string, number> = {};

  incidents.forEach((incident: any) => {
    serviceCounts[incident.service] =
      (serviceCounts[incident.service] || 0) + 1;
  });

  const sorted = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0
    ? { service: sorted[0][0], incident_count: sorted[0][1] }
    : null;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✅ Incident Feed MCP Server running on stdio');
  console.error(`📊 Total incidents loaded: ${incidents.length}`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
