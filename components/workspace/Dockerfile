FROM codercom/code-server

ENV CS_DISABLE_GETTING_STARTED_OVERRIDE=1
ENV PORT=8085
EXPOSE 8085

RUN mkdir -p ~/.docker/cli-plugins && chown -R 1000:1000 ~/.docker
COPY --link --from=docker /usr/local/bin/docker /usr/local/bin/docker
COPY --link --chown=1000:1000 --from=docker /usr/local/libexec/docker/cli-plugins /home/coder/.docker/cli-plugins
COPY --link --chown=1000:1000 --from=docker/scout-cli:1.18 /docker-scout /home/coder/.docker/cli-plugins/docker-scout
COPY --link --chown=1000:1000 --from=docker/docker-model-cli-desktop-module:v0.1.36 /cli-plugins/model/linux/docker-model /home/coder/.docker/cli-plugins/docker-model

USER root
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && \
    bash /tmp/nodesource_setup.sh && \
    apt-get install -y nodejs && \
    rm /tmp/nodesource_setup.sh && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/coder/.config/code-server && \
    mkdir -p /home/coder/.local/share/code-server && \
    mkdir -p /home/coder/.npm && \
    chown -R 1000:1000 /home/coder

RUN apt update && \
    apt install -y postgresql-client jq && \
    rm -rf /var/lib/apt/lists/*

USER 1000
RUN code-server --install-extension orta.vscode-jest && \
    code-server --install-extension ms-azuretools.vscode-docker
RUN --mount=from=extension,target=/extension code-server --install-extension /extension/support-extension.vsix
COPY --chown=1000:1000 ./config.yaml /home/coder/.config/code-server/config.yaml
COPY --chown=1000:1000 ./settings.json /home/coder/.local/share/code-server/User/settings.json

ENV TESTCONTAINERS_HOST_OVERRIDE=localhost
ENV MODEL_RUNNER_HOST=http://model-runner.docker.internal
ENV LAB_RUNNER_PUBLIC_KEY_PATH=/etc/lab-runner/public-key/runner.pem

CMD ["/home/coder/project"]