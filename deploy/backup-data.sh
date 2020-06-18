#!/bin/bash

MONGO_DATABASE="kltn2020"
APP_NAME="kltn2020"
MONGO_HOST="127.0.0.1:27017"
MONGO_USERNAME="alice"
MONGO_PASSWORD="pkroot"
MONGO_AUTHDB="admin"

WORK_DIR=/home/pkroot/deploy
TIMESTAMP=`date +%F-%H%M`
BACKUPS_DIR=$WORK_DIR/db-backup/$APP_NAME
BACKUP_NAME=$APP_NAME-$TIMESTAMP

DB_CONTAINER_NAME="kltn2020_db"
DUMP_CMD="mongodump -h ${MONGO_HOST} -d ${MONGO_DATABASE} -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD} --authenticationDatabase ${MONGO_AUTHDB} -o /workdir/dump"

echo "=> Start backup data..."
docker exec -it ${DB_CONTAINER_NAME} ${DUMP_CMD}

mkdir -p ${BACKUPS_DIR}
mv ${WORK_DIR}/dump ${WORK_DIR}/${BACKUP_NAME}

echo "=> Zip backup data to tar..."
tar -zcvf ${BACKUPS_DIR}/${BACKUP_NAME}.tgz ${WORK_DIR}/${BACKUP_NAME}

echo "=> Remove dump folder..."
rm -rf ${WORK_DIR}/${BACKUP_NAME}

echo "=> Done"