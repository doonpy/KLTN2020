#!/bin/bash

echo "### Pull latest images..."
docker-compose pull

echo "### Start services..."
docker-compose up -d
