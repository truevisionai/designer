# Nodejs Base image
FROM node:12 as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# install and app dependencies

COPY package.json /app/package.json

RUN npm install

RUN npm install -g @angular/cli

# add app
COPY . /app

EXPOSE 4200 49153

# start app
CMD ng serve --host 0.0.0.0 --poll
