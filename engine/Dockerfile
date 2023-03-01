
#
# development image
#

FROM node:19-alpine3.17 As dev

WORKDIR /usr/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./
RUN yarn install

COPY . .

USER node


#
# production build image
#

FROM node:19-alpine3.17 As build

WORKDIR /usr/app

COPY --chown=node:node --from=dev /usr/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN yarn run build

ENV NODE_ENV production

RUN yarn --production && yarn cache clean

USER node

#
# production image
#

FROM node:19-alpine3.17 As production

RUN apk add dumb-init

WORKDIR /usr/app

COPY --chown=node:node --from=build /usr/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/app/dist ./dist

CMD [ "dumb-init", "node", "dist/main.js"]
