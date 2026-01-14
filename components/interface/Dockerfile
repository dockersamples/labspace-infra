FROM dhi.io/node:24-dev AS base
WORKDIR /usr/local/app

# Build the client
FROM base AS client-base
COPY client/package* ./
RUN npm install
COPY client/eslint.config.js client/index.html client/vite.config.js ./
COPY client/public ./public
COPY client/src ./src

FROM client-base AS client-dev
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

FROM client-base AS client-build
RUN npm run build

##################################################
#                 API STAGES                     #
##################################################

FROM base AS server-dev
COPY api/package* ./
ENV NODE_ENV=development
RUN npm install
COPY api/src ./src
CMD ["npm", "run", "dev"]

# Build the API
FROM base AS prod-deps
WORKDIR /usr/local/app
COPY api/package* ./
ENV NODE_ENV=production
RUN npm ci 

##################################################
#                 FINAL STAGE                    #
##################################################

FROM dhi.io/node:24 AS production

# cat is used by the extension to get the contents of the labspace.yaml file
COPY --link --from=base /bin/cat /bin/cat

WORKDIR /usr/local/app
COPY --from=prod-deps /usr/local/app/node_modules ./node_modules
COPY api/src ./src
COPY --from=client-build /usr/local/app/dist ./public

# This is pointing to stage until we validate the analytics.
# The key is known to be a publicly viewable key.
ENV MARLIN_ENDPOINT=https://api.docker.com/events/v1/track
ENV MARLIN_API_KEY=SI7YliKTll5lLPOqPxtJZ49oZ7LgVcqG5sv11bkt

EXPOSE 3000
USER 1000
CMD ["node", "src/index.js"]