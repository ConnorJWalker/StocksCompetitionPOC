FROM node:18-alpine

WORKDIR /usr/src

COPY package.json .
COPY applications/socket-server ./app
COPY .env ./app
COPY shared ./shared

RUN npm install -workspaces --if-present

WORKDIR /usr/src/app

RUN npm install

ENTRYPOINT ["npm", "start"]
