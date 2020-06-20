#!/bin/bash
set -e

echo "=> Step 1: Stop docker-compose..."
docker-compose down

echo "=> Step 2: Clear all docker data..."
docker rmi doonpy/kltn2020:latest mongodb:4.2

echo "Destroy complete!"