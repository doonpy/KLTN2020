FROM node:latest

WORKDIR /usr/src/app

COPY tools/docker .

RUN npm install && npx next telemetry disable && npm run build