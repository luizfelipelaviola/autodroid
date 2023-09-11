# Build environment
FROM node:18.17.1 as build

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

# Production environment
FROM node:18.17.1 as production

WORKDIR /usr/app

COPY --from=build /usr/app/package.json /usr/app/yarn.lock /usr/app/scripts/wait-for-it.sh ./
COPY --from=build /usr/app/prisma ./prisma
COPY --from=build /usr/app/dist ./dist

RUN yarn --production

EXPOSE 3333

CMD yarn run-s prisma:generate prisma:prod start
