FROM node:lts

WORKDIR /usr/src/app

RUN mkdir public

COPY ./server/* ./

RUN npm install && npm run build

COPY ./tools/docker/node-server/command.sh command.sh

COPY ./tools/docker/bgr-job/command.sh bgr-job-command.sh

RUN chmod +x command.sh bgr-job-command.sh