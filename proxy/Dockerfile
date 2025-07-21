FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY index.js .
COPY utils.js .
RUN npm install

CMD ["npm", "start"]