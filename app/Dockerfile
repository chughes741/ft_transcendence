#
# production build image
#

FROM node:19-alpine3.17 As build

# React build
WORKDIR /usr/app/frontend

COPY --chown=node:node ./frontend .
RUN yarn install

RUN yarn run build

# NestJS build
WORKDIR /usr/app/backend

COPY --chown=node:node ./backend .
RUN yarn install

RUN yarn run build

#
# production image
#

FROM node:19-alpine3.17 As production

RUN apk add dumb-init

# React copy source files
WORKDIR /usr/app/frontend

COPY --chown=node:node --from=build /usr/app/frontend/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/app/frontend/build ./build


# NestJS copy source files
WORKDIR /usr/app/backend

COPY --chown=node:node backend/.env .
COPY --chown=node:node --from=build /usr/app/backend/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/app/backend/dist ./dist

CMD [ "dumb-init", "node", "dist/main.js"]
