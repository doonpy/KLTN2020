FROM node:lts

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

RUN chmod +x command.sh

RUN chmod +x bgr-job-command.sh