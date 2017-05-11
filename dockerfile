FROM  node:7

MAINTAINER Luc Claustres <luc.claustres@orange.fr>

WORKDIR /opt/app
COPY . /opt/app

RUN npm install -g quasar-cli
RUN yarn install
RUN quasar build

WORKDIR /opt/app/api

RUN yarn install
RUN npm run build

EXPOSE 8081

CMD [ "npm", "run", "prod" ]
