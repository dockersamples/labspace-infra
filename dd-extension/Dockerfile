FROM node:lts-slim AS build
WORKDIR /usr/local/app
COPY package*.json ./
RUN npm install
COPY --link eslint.config.js vite.config.js index.html ./
COPY --link ./public ./public
COPY --link ./src ./src
RUN npm run build && ls dist

FROM alpine
LABEL org.opencontainers.image.title="Labspaces" \
    org.opencontainers.image.description="Learn through interactive and hands-on Labspaces" \
    org.opencontainers.image.vendor="Docker, Inc." \
    com.docker.desktop.extension.api.version="0.1.0" \
    com.docker.extension.screenshots="" \
    com.docker.desktop.extension.icon="beaker.svg" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.categories="" \
    com.docker.extension.changelog=""
COPY beaker.svg /
COPY metadata.json /
COPY --from=build /usr/local/app/dist /ui
