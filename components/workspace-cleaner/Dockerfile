FROM dhi.io/node:24-dev AS base
WORKDIR /usr/local/app

COPY package* ./
RUN npm install --omit=dev
COPY ./src ./src

FROM base AS dev
ENV NODE_ENV=development
RUN npm install
CMD ["npm", "run", "dev"]

FROM dhi.io/node:24 AS production
WORKDIR /usr/local/app
COPY --from=base /usr/local/app ./
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
