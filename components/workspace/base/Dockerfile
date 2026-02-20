FROM codercom/code-server:4.108.2

ENV CS_DISABLE_GETTING_STARTED_OVERRIDE=1
ENV PORT=8085
EXPOSE 8085

# Install Docker CLI and plugins
RUN mkdir -p ~/.docker/cli-plugins && chown -R 1000:1000 ~/.docker
COPY --link --from=docker:29.2.1 /usr/local/bin/docker /usr/local/bin/docker
COPY --link --chown=1000:1000 --from=docker:29.2.1 /usr/local/libexec/docker/cli-plugins /home/coder/.docker/cli-plugins
COPY --link --chown=1000:1000 --from=docker/scout-cli:1.19.2 /docker-scout /home/coder/.docker/cli-plugins/docker-scout
COPY --link --chown=1000:1000 --from=docker/docker-model-cli-desktop-module:v1.0.9 /cli-plugins/model/linux/docker-model /home/coder/.docker/cli-plugins/docker-model
COPY --link --chown=1000:1000 --from=docker/docker-mcp-cli-desktop-module:v0.38.0 /cli-plugins/mcp/linux/docker-mcp /home/coder/.docker/cli-plugins/docker-mcp

# Install kubectl. When changing versions, align with the k3s version in the SDLC overlay/variant
COPY --link --from=dhi.io/kubectl:1.35.0 /usr/local/bin/kubectl /usr/local/bin/kubectl

# Add other tools often required in container labs (and to speed up setup later)
COPY --link --from=dhi.io/helm:4.1.1 /usr/local/bin/helm /usr/local/bin/helm
COPY --link --from=dhi.io/cosign:3.0.4 /usr/local/bin/cosign /usr/local/bin/cosign

USER root

RUN ln -s /usr/local/bin/kubectl /usr/local/bin/k

RUN mkdir -p /home/coder/.config/code-server && \
    mkdir -p /home/coder/.local/share/code-server && \
    mkdir -p /home/coder/.npm && \
    chown -R 1000:1000 /home/coder

RUN apt update && \
    apt install -y jq && \
    rm -rf /var/lib/apt/lists/*


USER 1000
RUN code-server --install-extension ms-azuretools.vscode-docker && \
    code-server --install-extension github.vscode-github-actions && \
    code-server --install-extension docker.docker && \
    rm -rf /home/coder/.local/share/code-server/CachedExtensionVSIXs/.trash/*

RUN --mount=from=extension,target=/extension \
    code-server --install-extension /extension/support-extension.vsix && \
    rm -rf /home/coder/.local/share/code-server/CachedExtensionVSIXs/.trash/*

COPY --chown=1000:1000 ./config.yaml /home/coder/.config/code-server/config.yaml
COPY --chown=1000:1000 ./settings.json /home/coder/.local/share/code-server/User/settings.json
COPY --chown=1000:1000 ./keybindings.json /home/coder/.local/share/code-server/User/keybindings.json

ENV TESTCONTAINERS_HOST_OVERRIDE=localhost
ENV MODEL_RUNNER_HOST=http://model-runner.docker.internal
ENV LAB_RUNNER_PUBLIC_KEY_PATH=/etc/lab-runner/public-key/runner.pem

USER root
COPY ./entrypoint.d /entrypoint.d

USER 1000

CMD ["/home/coder/project"]
