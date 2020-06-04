FROM node:10.21.0-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install && npx next telemetry disable && npm run build