#!/bin/bash

echo "=> Restarting..."
docker-compose down
docker-compose up -d

echo "=> Restart complete!"