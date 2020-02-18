FROM node:13.8

MAINTAINER Nabil Redmann (BananaAcid) <repo@bananaacid.de>
LABEL version="3.1.1"
LABEL description="Node File Manager Server \
on NodeJS 13.8"

#ENV FM_DIRECTORY 
ENV FM_FILTER zip|tar.gz|7z|7zip|tar|gz|tgz|tbz|tar.bz2|tar.bz|txt|jpg|png|avi|mp4
ENV FM_SECURE ""
ENV FM_LOGGING *


WORKDIR /usr/src/app


RUN ln -sf "$(pwd)/example" /data
VOLUME /data

COPY . .
RUN npm install

RUN npm install pm2 -g 2>/dev/null 

RUN mkdir /root/.npm/_logs
RUN ln -sf /root/.npm/_logs /logs
VOLUME /logs


EXPOSE 5000
CMD pm2-runtime npm -- run start-if-docker