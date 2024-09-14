FROM harbor.apsolutions.ru/dockerhub/node:20 as build

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV="production"

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install

COPY . ./

RUN yarn build

CMD [ "yarn", "start" ]