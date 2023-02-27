
#
# development image
#

FROM node:19-alpine3.17 As dev

# React install
WORKDIR /usr/app/frontend
COPY --chown=node:node frontend/package*.json ./
RUN npm install

COPY ./frontend .

# NestJs install
WORKDIR /usr/app/backend

COPY --chown=node:node backend/package*.json .
RUN npm install

COPY ./backend .

USER node


#
# production build image
#

FROM node:19-alpine3.17 As build

# React build
WORKDIR /usr/app/frontend

COPY --chown=node:node --from=dev /usr/app/frontend/node_modules ./node_modules
COPY --chown=node:node ./frontend .


# NestJS build
WORKDIR /usr/app/backend

COPY --chown=node:node --from=dev /usr/app/backend/node_modules ./node_modules
COPY --chown=node:node ./backend .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

USER node

#
# production image
#

FROM node:19-alpine3.17 As production

# React copy source files
WORKDIR /usr/app/frontend

COPY --chown=node:node --from=build /usr/app/frontend/node_modules ./node_modules


# NestJS copy source files
WORKDIR /usr/app/backend

COPY --chown=node:node --from=build /usr/app/backend/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/app/backend/dist ./dist

CMD [ "node", "dist/main.js"]
