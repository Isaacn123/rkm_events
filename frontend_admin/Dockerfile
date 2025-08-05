FROM node:18-alpine

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build 

EXPOSE 4000

CMD [ "npm", "start" ]