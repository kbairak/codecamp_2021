FROM node:16.13.0-alpine
WORKDIR /
RUN npx create-react-app --use-npm app
WORKDIR /app
COPY ./package.json /app/package.json
RUN npm install
COPY ./src /app/src
CMD npm run start
