FROM node:18-alpine

WORKDIR /usr/src

COPY ./applications/client ./app
COPY .env.client ./app/.env

WORKDIR /usr/src/app

RUN npm install

ENTRYPOINT ["npm", "start"]
