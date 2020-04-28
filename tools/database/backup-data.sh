#!/bin/bash

source ./tools/config.cfg

TIMESTAMP=`date +%F-%H%M`
MONGODUMP_PATH="mongodump"
BACKUPS_DIR=db-backup/$APP_NAME
BACKUP_NAME=$APP_NAME-$TIMESTAMP

$MONGODUMP_PATH --host ${MONGO_HOST} --port ${MONGO_PORT} -d ${MONGO_DATABASE} -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD}

mkdir -p ${BACKUPS_DIR}
mv dump ${BACKUP_NAME}
tar -zcvf ${BACKUPS_DIR}/${BACKUP_NAME}.tgz ${BACKUP_NAME}
rm -rf ${BACKUP_NAME}