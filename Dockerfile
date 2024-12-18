FROM openjdk:17-alpine

MAINTAINER Viktor Gorelov

RUN apk add bash

RUN mkdir /app
WORKDIR /app
