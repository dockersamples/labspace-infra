FROM dhi.io/node:24-dev AS base
WORKDIR /usr/local/app
COPY package* ./
RUN npm install --omit=dev
COPY ./src ./src
CMD ["npm", "run", "dev"]

# No need for a prod image here since this is only used in development/testing