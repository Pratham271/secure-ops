# Docker Setup Instructions

## Prerequisites
- Docker Desktop installed and running
- At least 4GB RAM allocated to Docker
- Ports 3000, 3001, 9000, 9090 available

## Quick Start

### 1. Create `.env` file
Copy the example and fill in your API keys:
```bash
cp .env.example .env
```

**Required:** Get your free Groq API key from https://console.groq.com

### 2. Pull Archestra image
```bash
docker pull archestra/archestra:latest
```

### 3. Start the stack
```bash
docker compose up -d
```

### 4. Verify services are running
```bash
docker compose ps
```

You should see:
- `secureops-archestra` - running on ports 3000, 9000, 9090
- `secureops-grafana` - running on port 3001

### 5. Access the UIs

- **Archestra Chat UI**: http://localhost:3000
- **Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090

## Useful Commands

### View logs
```bash
# All services
docker compose logs -f

# Just Archestra
docker compose logs -f archestra

# Just Grafana
docker compose logs -f grafana
```

### Stop services
```bash
docker compose down
```

### Stop and remove volumes (fresh start)
```bash
docker compose down -v
```

### Restart services
```bash
docker compose restart
```

### Check service health
```bash
docker compose ps
```

## Troubleshooting

### Archestra not starting
1. Check logs: `docker compose logs archestra`
2. Verify GROQ_API_KEY is set in `.env`
3. Ensure ports are not in use: `lsof -i :3000,9000,9090`

### Grafana not connecting to Prometheus
1. Check network: `docker network inspect secureops-network`
2. Verify Archestra is healthy: `docker compose ps`
3. Restart Grafana: `docker compose restart grafana`

### Port conflicts
If ports are already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "3002:3000"  # Change 3000 to 3002
```

## Next Steps

Once services are running:
1. ✅ Verify Archestra Chat UI loads
2. ✅ Check Prometheus has metrics
3. ✅ Import Grafana dashboard
4. ✅ Test MCP server registration
