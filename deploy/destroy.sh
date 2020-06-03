#!/bin/bash

echo "=> Step 1: Stop docker-compose..."
docker-compose down

echo "=> Step 2: Clear all docker data..."
docker rmi doonpy/kltn2020:latest mongodb:4.2 nginx:1.19.0

echo "=> Step 3: Uninstall docker and docker-compose..."
yum remove docker-ce docker-ce-cli containerd.io -y
rm -f $(which docker-compose)

echo "Destroy complete!"