#!/bin/bash

source ../config.cfg

echo "Dumping data from $MONGO_HOST..."
mongodump --host ${MONGO_HOST} --port ${MONGO_PORT} -d ${MONGO_DATABASE} -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD}

echo "Restore data to local database..."
mongorestore --drop --authenticationDatabase admin -d kltn2020-dev -u alice -p alice dump/kltn2020

echo "Remove dump folder..."
rm -rf dump
echo "Done"