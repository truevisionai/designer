FROM electronuserland/builder:wine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

# RUN chown -R node /app

RUN npm install -g @angular/cli

# RUN npm run electron:build

RUN cp third-party/sentry-cli /usr/bin/

EXPOSE 4200
