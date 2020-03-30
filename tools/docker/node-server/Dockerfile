FROM node:12.14.1-alpine3.9

LABEL maintainer="nguyenduypoon@gmail.com"

WORKDIR /usr/src/app

RUN mkdir public

COPY package*.json ./

RUN npm install

COPY src ./

COPY tsconfig.json ./

COPY .env ./

RUN npm run build

COPY ./tools/docker/node-server/command.sh command.sh

COPY ./tools/docker/bgr-job/command.sh bgr-job-command.sh

COPY ./tools/docker/monitor-server/command.sh monitor-server-command.sh


RUN chmod +x command.sh

RUN chmod +x bgr-job-command.sh