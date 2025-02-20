FROM node:18-alpine
WORKDIR /usr/src/app
RUN npm install -g nodemon
COPY package*.json ./
RUN npm install
COPY . .
VOLUME ["/usr/src/app/data"]
CMD ["nodemon", "challengeB.js"]