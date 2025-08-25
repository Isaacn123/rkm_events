FROM node:18-alpine

WORKDIR /frontend_admin

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

# Copy all source files explicitly
COPY . .

RUN npm run build 

EXPOSE 3001

CMD [ "npm", "start" ]