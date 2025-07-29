FROM node:lts-slim AS base
WORKDIR /usr/local/app

# Build the client
FROM base AS client-build
COPY client/package* ./
RUN npm install
COPY client/eslint.config.js client/index.html client/vite.config.js ./
COPY client/public ./public
COPY client/src ./src
RUN npm run build

# Build the API
FROM base AS server-build
COPY api/package* ./
ENV NODE_ENV=production
RUN npm ci 

COPY api/src ./src
COPY --from=client-build /usr/local/app/dist ./public

EXPOSE 3000
CMD ["node", "src/index.js"]