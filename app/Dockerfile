FROM node:19-alpine3.17 As build

RUN apk add dumb-init

WORKDIR /usr/app
COPY --chown=node:node . .

RUN yarn install --non-interactive --production=false

RUN yarn --cwd frontend build
RUN yarn --cwd backend run build

WORKDIR /usr/app/backend

CMD [ "dumb-init", "node", "dist/src/main.js"]
