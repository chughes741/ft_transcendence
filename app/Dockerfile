
#
# development image
#

FROM node:19-alpine3.17 As dev

# For development
RUN apk add dumb-init

# React install
WORKDIR /usr/app/frontend
COPY --chown=node:node frontend/package*.json ./
COPY --chown=node:node frontend/yarn.lock ./
RUN yarn install

COPY ./frontend .

# For development
RUN yarn run build

# NestJs install
WORKDIR /usr/app/backend

COPY --chown=node:node backend/package*.json .
COPY --chown=node:node backend/yarn.lock .
RUN yarn install

COPY ./backend .

# For development
RUN yarn run build

USER node

# For development
CMD [ "dumb-init", "node", "dist/main.js"]

#
# production build image
#

FROM node:19-alpine3.17 As build

# React build
WORKDIR /usr/app/frontend

COPY --chown=node:node --from=dev /usr/app/frontend/node_modules ./node_modules
COPY --chown=node:node ./frontend .

RUN yarn run build

# NestJS build
WORKDIR /usr/app/backend

COPY --chown=node:node --from=dev /usr/app/backend/node_modules ./node_modules
COPY --chown=node:node ./backend .

RUN yarn run build

ENV NODE_ENV production

RUN yarn --production && yarn cache clean

USER node

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
