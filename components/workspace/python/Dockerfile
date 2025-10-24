FROM labspace-workspace-base

USER root
RUN apt update && \
    apt install -y curl jq python3 python3-dev python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    ln -sf /usr/bin/pip3 /usr/bin/pip && \
    mkdir -p /home/coder/.local/share/pip && \
    chown -R 1000:1000 /home/coder/.local/share/pip

# Install Poetry using pip (more reliable than the install script)
RUN pip3 install --upgrade pip setuptools wheel --break-system-packages && \
    pip3 install poetry --break-system-packages

# Install additional Python development tools
RUN pip3 install black flake8 pytest pytest-cov mypy isort --break-system-packages

# Make poetry available system-wide
RUN ln -s /usr/local/bin/poetry /usr/bin/poetry && \
    mkdir -p /home/coder/.local/bin && \
    ln -s /usr/local/bin/poetry /home/coder/.local/bin/poetry && \
    chown -R 1000:1000 /home/coder/.local

USER 1000
RUN code-server --install-extension ms-python.python && \
    code-server --install-extension ms-python.pylint && \
    code-server --install-extension ms-python.black-formatter && \
    rm -rf /home/coder/.local/share/code-server/CachedExtensionVSIXs/.trash/*