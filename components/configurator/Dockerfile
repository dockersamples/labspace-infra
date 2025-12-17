FROM dhi.io/debian-base:trixie

RUN apt update && \
    apt install -y curl jq openssl git && \
    apt clean && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/app
COPY ./setup.sh ./
CMD ["./setup.sh"]
