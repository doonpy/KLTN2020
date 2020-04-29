FROM node:latest

WORKDIR /usr/src/app

COPY . .
COPY tools/docker/api/command.sh api-command.sh
COPY ./tools/docker/web/command.sh web-command.sh

RUN chmod +x *.sh
RUN npm install && npx next telemetry disable && npm run build