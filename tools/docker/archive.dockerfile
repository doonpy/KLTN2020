FROM node:12.18.0-alpine

WORKDIR /usr/src/app

COPY dist dist
COPY node_modules node_modules
COPY tools tools
COPY package*.json ./
