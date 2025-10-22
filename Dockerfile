# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 4004

CMD [ "npm", "start" ]
