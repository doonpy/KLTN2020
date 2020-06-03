#!/bin/bash

echo "=> Step 1: Update yum..."
yum update -y
yum install -y yum-utils

echo "=> Step 2: Delete old docker..."
yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine -y

echo "=> Step 3: Install docker..."
yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
yum install docker-ce docker-ce-cli containerd.io -y
systemctl start docker

echo "=> Step 4: Install docker-compose..."
curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "=> Step 5: Pull latest images..."
docker-compose pull

echo "=> Step 6: Deploying..."
docker-compose up -d