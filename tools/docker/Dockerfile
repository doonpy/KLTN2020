FROM node:latest

WORKDIR /usr/src/app

RUN mkdir public

COPY . .
COPY tools/docker/api/command.sh api-command.sh
COPY ./tools/docker/background-job/command.sh bgr-job-command.sh
COPY ./tools/docker/web/command.sh web-command.sh

RUN chmod +x api-command.sh bgr-job-command.sh web-command.sh
RUN npm install && npx next telemetry disable && npm run build