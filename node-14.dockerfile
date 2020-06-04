FROM node:14.4.0-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install && npx next telemetry disable && npm run build