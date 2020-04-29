#!/bin/bash

MONGO_DATABASE="kltn2020"
MONGO_HOST="159.65.0.142"
MONGO_PORT="27017"
MONGO_USERNAME="alice"
MONGO_PASSWORD="alice"

echo "Dumping data from $MONGO_HOST..."
mongodump --host ${MONGO_HOST} --port ${MONGO_PORT} -d ${MONGO_DATABASE} -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD}

echo "Restore data to local database..."
mongorestore --drop --authenticationDatabase admin -d kltn2020-dev -u alice -p alice dump/kltn2020

echo "Remove dump folder..."
rm -rf dump
echo "Done"