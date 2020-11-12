FROM node:14.15.0-alpine

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

RUN  npm config set proxy http://proxy.hcm.fpt.vn:80
RUN  npm config set https_proxy http://proxy.hcm.fpt.vn:80

RUN npm install

RUN npm install pm2 -g

RUN mkdir /root/.npm/_logs
RUN ln -sf /root/.npm/_logs /logs
VOLUME /logs


EXPOSE 5000
CMD pm2-runtime npm -- run start-if-docker