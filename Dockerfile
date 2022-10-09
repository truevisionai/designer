FROM node:14.16

WORKDIR /app

COPY . /app

RUN chown -R node /app

RUN npm install -g @angular/cli

EXPOSE 4200
