FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm install --production && npx next telemetry disable && npm run build