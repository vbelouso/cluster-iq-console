## Run
####################
# Obtained from: https://catalog.redhat.com/software/containers/ubi9/nodejs-18/62e8e7ed22d1d3c2dfe2ca01?container-tabs=gti
FROM registry.access.redhat.com/ubi9/nodejs-18:1-59.1690899127

# Arguments
ARG VERSION="0.1-alpha"

# Labels
LABEL version=$VERSION
LABEL description="Openshift Inventory API"

COPY . .
ENV OCP_INV_API_HOST="0.0.0.0"
ENV OCP_INV_API_PORT="8080"
ENV OCP_INV_API_PUBLIC_ENDPOINT="https://api-cloud-inventory.apps.ocp-dev01.lab.eng.tlv2.redhat.com"
ENV OCP_INV_DB_HOST="redis"
ENV OCP_INV_DB_PORT="6379"
ENV OCP_INV_DB_PASS=""
ENV OCP_INV_CLOUD_CREDS="/credentials/credentials"
ENV AWS_SHARED_CREDENTIALS_FILE="/credentials/credentials"
RUN npm install --save &&\
  npm run build --legacy-peer-deps

EXPOSE 8080

ENTRYPOINT ["npm", "run"]
CMD ["start"]
