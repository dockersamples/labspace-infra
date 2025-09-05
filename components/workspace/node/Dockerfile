FROM labspace-workspace-base

USER root
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && \
    bash /tmp/nodesource_setup.sh && \
    apt-get install -y nodejs && \
    rm /tmp/nodesource_setup.sh && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/coder/.npm && \
    chown -R 1000:1000 /home/coder/.npm

RUN apt update && \
    apt install -y postgresql-client jq && \
    rm -rf /var/lib/apt/lists/*

USER 1000
RUN code-server --install-extension orta.vscode-jest && \
    rm -rf /home/coder/.local/share/code-server/CachedExtensionVSIXs/.trash/*
