FROM  quasarframework/client-dev:latest

MAINTAINER Luc Claustres <luc.claustres@orange.fr>

WORKDIR /opt/app
COPY . /opt/app

RUN npm install
RUN quasar build

WORKDIR /opt/app/api

RUN npm install
RUN npm run build

EXPOSE 8081

CMD [ "npm", "run", "prod" ]
