FROM node:alpine

WORKDIR /app

RUN npm init -y && npm install express marked

COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]
