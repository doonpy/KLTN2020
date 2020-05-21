#!/bin/bash

MONGO_DATABASE="kltn2020"
MONGO_HOST="113.172.130.249"
MONGO_USERNAME="alice"
MONGO_PASSWORD="pkroot"

echo "Dumping data from $MONGO_HOST..."
mongodump -h ${MONGO_HOST} --ssl -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD} --authenticationDatabase admin -d ${MONGO_DATABASE}

echo "Restore data to local database..."
mongorestore --drop --d kltn2020 dump/kltn2020

echo "Remove dump folder..."
rm -rf dump

echo "Done"