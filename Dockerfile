FROM electronuserland/builder:wine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

# RUN chown -R node /app

RUN npm install -g @angular/cli

# RUN npm run electron:build

EXPOSE 4200
