
#
# development image
#

FROM node:19-alpine3.17 As dev

# NestJs install
WORKDIR /usr/app/backend

COPY --chown=node:node backend/package*.json ./
RUN npm install

COPY ./backend .

# React install
# RUN cd client ; npm install

USER node


#
# production build image
#

FROM node:19-alpine3.17 As build

WORKDIR /usr/app/backend

COPY --chown=node:node --from=dev /usr/app/backend/node_modules ./node_modules
# COPY --chown=node:node --from=dev /usr/app/client/node_modules ./client/node_modules
COPY --chown=node:node ./backend .

RUN npm run build
# RUN cd client ; npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force
# RUN cd client ; npm ci --only=production && npm cache clean --force

USER node

#
# production image
#

FROM node:19-alpine3.17 As production

WORKDIR /usr/app/backend

COPY --chown=node:node --from=build /usr/app/backend/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/app/backend/dist ./dist

CMD [ "node", "dist/main.js"]
