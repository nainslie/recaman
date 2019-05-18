FROM node as build

RUN npm install -g webpack webpack-cli

RUN mkdir /home/node/app

WORKDIR /home/node/app

COPY package.json package-lock.json tsconfig.json webpack.config.js /home/node/app/
RUN npm ci

COPY src /home/node/app/src
RUN webpack


FROM nginx:alpine as runtime

COPY --from=build /home/node/app/dist /usr/share/nginx/html/dist

COPY default.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
