FROM node:12.18.0-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install && npx next telemetry disable && npm run build
RUN cd dashboard && npm i && npm run build

RUN rm -rfv api-server web-server tools/docker/*.dockerfile tailwind.config.js dashboard