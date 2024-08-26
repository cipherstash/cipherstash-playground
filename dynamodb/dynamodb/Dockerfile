FROM amazon/dynamodb-local

WORKDIR /home/dynamodblocal/

USER root
RUN yum update --assumeyes --quiet \
    && yum install --assumeyes --quiet less \
    && yum install --assumeyes --quiet awscli \
    && yum clean all \
    && rm -rf /var/cache/yum
RUN mkdir /data
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT /entrypoint.sh