#!/bin/bash

MONGO_DATABASE="kltn2020"
APP_NAME="kltn2020"
MONGO_HOST="127.0.0.1:27017"
MONGO_USERNAME="alice"
MONGO_PASSWORD="pkroot"
MONGO_AUTHDB="admin"

TIMESTAMP=`date +%F-%H%M`
MONGODUMP_PATH="mongodump"
BACKUPS_DIR=db-backup/$APP_NAME
BACKUP_NAME=$APP_NAME-$TIMESTAMP

echo "=> Start backup data..."
$MONGODUMP_PATH -h ${MONGO_HOST} -d ${MONGO_DATABASE} -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD} --authenticationDatabase ${MONGO_AUTHDB}

mkdir -p ${BACKUPS_DIR}
mv dump ${BACKUP_NAME}

echo "=> Zip backup data to tar..."
tar -zcvf ${BACKUPS_DIR}/${BACKUP_NAME}.tgz ${BACKUP_NAME}

echo "=> Remove dump folder..."
rm -rf ${BACKUP_NAME}

echo "=> Done"