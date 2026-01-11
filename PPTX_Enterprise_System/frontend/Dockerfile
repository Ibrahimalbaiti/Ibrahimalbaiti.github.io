FROM node:18-alpine

WORKDIR /app

COPY frontend/package.json /app/package.json

RUN npm install
RUN npm install -g serve

COPY frontend /app

EXPOSE 3000

CMD ["npm", "run", "dev"]
