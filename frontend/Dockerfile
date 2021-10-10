FROM node:16.10-alpine

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

COPY package.json .
COPY yarn.lock .

RUN yarn

RUN mkdir /app
WORKDIR /app