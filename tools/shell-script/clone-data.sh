#!/bin/bash

MONGO_DATABASE="kltn2020"
MONGO_HOST="113.172.130.249:27017"
MONGO_USERNAME="alice"
MONGO_PASSWORD="pkroot"
MONGO_AUTHDB="admin"

echo "=> Start clone data from $MONGO_HOST..."
mongodump -h ${MONGO_HOST} -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD} --authenticationDatabase ${MONGO_AUTHDB} -d ${MONGO_DATABASE}
mongorestore --drop -d kltn2020-dev dump/kltn2020

echo "=> Remove dump folder..."
rm -rf dump

echo "=> Done"