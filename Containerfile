ARG NODE_VERSION=18
ARG NODE_IMAGE_TAG=9.5-1733148761

ARG NGINX_VERSION=124
ARG NGINX_IMAGE_TAG=9.5-1734313329
ARG NGINX_PORT=8080

# Reference https://catalog.redhat.com/software/containers/ubi9/nodejs-18/62e8e7ed22d1d3c2dfe2ca01
FROM registry.access.redhat.com/ubi9/nodejs-${NODE_VERSION}:${NODE_IMAGE_TAG} AS builder

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html .
COPY vite.config.js .
COPY src/ ./src/

RUN npm run build

# Reference: https://catalog.redhat.com/software/containers/ubi9/nginx-124/657b066b6c1bc124a1d7ff39
FROM registry.access.redhat.com/ubi9/nginx-${NGINX_VERSION}:${NGINX_IMAGE_TAG}

COPY --chown=1001:0 --from=builder ${HOME}/dist/ ./
COPY --chown=1001:0 nginx/nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=1001:0 nginx/script.sh ${HOME}/nginx-start/script.sh
EXPOSE ${NGINX_PORT}

CMD /usr/libexec/s2i/run
