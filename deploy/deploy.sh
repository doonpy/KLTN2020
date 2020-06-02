echo "- Step 1: Pull latest images..."
docker-compose pull

echo "- Step 2: Deploying..."
docker-compose up -d