FROM node:9.11.1

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN \
  apt-get update && \
  apt-get -y install nginx

COPY ./nginx/config /etc/nginx/config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app
COPY .npmrc /app/.npmrc
COPY packages/app/package.json /app/package.json
COPY packages/app/package-lock.json /app/package-lock.json
RUN NODE_ENV=development npm install
# RUN ls -la packages
# RUN ls -la packages/app
COPY packages/app/build /app
# COPY packages/app/cra/build /app/public
COPY packages/app/public /public
COPY packages/app/locales /app/locales
COPY packages/app/start.sh /app/start.sh

EXPOSE 80
CMD [ "/bin/bash", "/app/start.sh" ]
