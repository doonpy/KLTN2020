#!/bin/bash
set -e

MONGO_DATABASE="kltn2020"
MONGO_HOST="127.0.0.1:27017"
MONGO_USERNAME="alice"
MONGO_PASSWORD="pkroot"
MONGO_AUTHDB="admin"
BACKUP_FOLDER="/home/pkroot/mongo-backup"

TIMESTAMP=`date +%F-%H%M`
DB_CONTAINER_NAME="kltn2020_db"

DUMP_CMD="mongodump -h ${MONGO_HOST} -d ${MONGO_DATABASE} -u ${MONGO_USERNAME} -p ${MONGO_PASSWORD} --authenticationDatabase ${MONGO_AUTHDB} --archive"

mkdir -p ${BACKUP_FOLDER}

docker exec ${DB_CONTAINER_NAME} sh -c "exec ${DUMP_CMD}" > ${BACKUP_FOLDER}/${TIMESTAMP}.archive
