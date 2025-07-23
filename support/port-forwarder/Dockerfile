FROM alpine:latest

RUN apk add --no-cache socat docker-cli

COPY forwarder.sh /forwarder.sh
RUN chmod +x /forwarder.sh

CMD ["/forwarder.sh"]
