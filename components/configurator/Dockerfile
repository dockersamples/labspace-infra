FROM dhi.io/debian-base:trixie-dev

RUN apt update && \
    apt install -y curl jq openssl git docker-cli && \
    apt clean && rm -rf /var/lib/apt/lists/*

COPY --from=mikefarah/yq:4.50.1 /usr/bin/yq /usr/local/bin/yq

WORKDIR /usr/local/app
COPY ./get-details.sh ./
COPY ./setup.sh ./
CMD ["./setup.sh"]
