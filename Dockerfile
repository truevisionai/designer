FROM node:14.16

# install electron dependencies or more if your library has other dependencies
RUN apt-get update && apt-get install \
    git libx11-xcb1 libxcb-dri3-0 libxtst6 libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 \
    libgtkextra-dev libgconf2-dev libasound2 libxtst-dev \
    -yq --no-install-suggests --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# RUN apt-get install -y python

# copy the source into /app
WORKDIR /app
COPY . /app
RUN chown -R node /app

RUN npm install -g @angular/cli

# install node modules and perform an electron rebuild
USER node
RUN npm install
RUN npx electron-rebuild

# Electron needs root for sand boxing
# see https://github.com/electron/electron/issues/17972
USER root
RUN chown root /app/node_modules/electron/dist/chrome-sandbox
RUN chmod 4755 /app/node_modules/electron/dist/chrome-sandbox

# Electron doesn't like to run as root
USER node

EXPOSE 4200 49153

# start app
# CMD ng serve --host 0.0.0.0 --poll
