FROM node:lts

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .

VOLUME /usr/src/app/db

CMD ["node", "app.js"]