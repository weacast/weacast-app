FROM  node:7

MAINTAINER Luc Claustres <luc.claustres@orange.fr>

# We need Java for the GFS plugin
RUN echo deb http://http.debian.net/debian jessie-backports main >> /etc/apt/sources.list
RUN apt-get update
RUN apt install -y -t jessie-backports openjdk-8-jre-headless ca-certificates-java
RUN rm /etc/apt/sources.list
RUN apt-get clean
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
RUN $JAVA_HOME/bin/java -version

WORKDIR /opt/app
COPY . /opt/app

RUN yarn install
RUN npm run build

WORKDIR /opt/app/api

RUN yarn install
RUN npm run build

EXPOSE 8081

CMD [ "npm", "run", "prod" ]
