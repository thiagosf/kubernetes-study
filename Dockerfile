FROM node:8.15.1-alpine
WORKDIR /usr/app
COPY app/package.json .
RUN npm install
COPY app .
CMD ["npm", "start"]
