# stage1 as builder
FROM node:12.14.1-alpine3.9 as builder

WORKDIR src/bgr-job/monitor

COPY src/bgr-job/monitor .

# Install the dependencies and make the folder
RUN npm install

# Build the project and copy the files
RUN npm run build

FROM nginx:alpine

#!/bin/sh

RUN ls -l

COPY ./tools/docker/monitor-server/.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stahg 1
COPY --from=builder src/bgr-job/monitor/build /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]