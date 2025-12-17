FROM dhi.io/node:24-dev AS build
WORKDIR /usr/local/app
COPY package* ./
RUN npm install
COPY .vscodeignore .vscode-test.mjs eslint.config.mjs jsconfig.json LICENSE README.md ./
COPY src ./src
RUN npm run package

# This final stage is used to transport the final vsix build. It is being included
# in the workspace build as an additional build context (see the Bake and Compose files).
#
# This stage is using an Alpine base instead of scratch to allow the builds to be run
# by Compose. While the workspace service can define an additional build context, the
# referenced service needs to still be a service that runs something. And since Compose
# doesn't have "build-only" services, this stage is simply a no-op alpine image.
FROM dhi.io/alpine-base:3.22 AS final
COPY --from=build /usr/local/app/*.vsix /support-extension.vsix
CMD ["echo", "'no op'"]