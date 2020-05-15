#!/bin/bash

MONGO_DATABASE="kltn2020"
MONGO_HOST="Cluster0-shard-0/cluster0-shard-00-00-zktjf.gcp.mongodb.net:27017,cluster0-shard-00-01-zktjf.gcp.mongodb.net:27017,cluster0-shard-00-02-zktjf.gcp.mongodb.net:27017"
MONGO_PORT="27017"
MONGO_USERNAME="alice"
MONGO_PASSWORD="alice"

echo "Dumping data from $MONGO_HOST..."
mongodump --host ${MONGO_HOST} --ssl --username ${MONGO_USERNAME} --password ${MONGO_PASSWORD} --authenticationDatabase admin --db ${MONGO_DATABASE}

echo "Restore data to local database..."
mongorestore --drop --authenticationDatabase admin -d kltn2020-dev -u alice -p alice dump/kltn2020

echo "Remove dump folder..."
rm -rf dump

echo "Done"