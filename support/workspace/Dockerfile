FROM codercom/code-server

ENV CS_DISABLE_GETTING_STARTED_OVERRIDE=1
ENV PORT=8085
EXPOSE 8085

RUN mkdir -p ~/.docker/cli-plugins && chown -R coder:coder ~/.docker
COPY --link --from=docker /usr/local/bin/docker /usr/local/bin/docker
COPY --link --from=docker --chown=1000:1000 /usr/local/libexec/docker/cli-plugins /home/coder/.docker/cli-plugins
COPY --link --from=docker/scout-cli --chown=1000:1000 /docker-scout /home/coder/.docker/cli-plugins/docker-scout
COPY --link --from=docker/docker-model-cli-desktop-module:v0.1.32 /cli-plugins/model/linux/docker-model /home/coder/.docker/cli-plugins/docker-model

USER root
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && \
    bash /tmp/nodesource_setup.sh && \
    apt-get install -y nodejs && \
    rm /tmp/nodesource_setup.sh && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/coder/.config/code-server && \
    mkdir -p /home/coder/.local/share/code-server && \
    mkdir -p /home/coder/.npm && \
    chown -R coder:coder /home/coder

RUN apt update && \
    apt install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/*

USER 1000
RUN code-server --install-extension orta.vscode-jest && \
    code-server --install-extension ms-azuretools.vscode-docker
COPY --chown=coder:coder ./config.yaml /home/coder/.config/code-server/config.yaml
COPY --chown=coder:coder ./settings.json /home/coder/.local/share/code-server/User/settings.json
