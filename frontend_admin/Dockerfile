FROM node:18-alpine

WORKDIR /frontend_admin

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

# Copy all source files explicitly
COPY src/ ./src/
COPY public/ ./public/
COPY next.config.ts ./
COPY tsconfig.json ./
COPY components.json ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY next-env.d.ts ./

RUN npm run build 

EXPOSE 3001

CMD [ "npm", "start" ]