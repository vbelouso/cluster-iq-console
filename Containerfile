## Run
####################
# Obtained from: https://catalog.redhat.com/software/containers/ubi9/nodejs-18/62e8e7ed22d1d3c2dfe2ca01?container-tabs=gti
FROM registry.access.redhat.com/ubi9/nodejs-18:1-59.1690899127

# Labels
LABEL VERSION="v0.2"
LABEL description="ClusterIQ Web Console"

COPY --chown=default:root . .

RUN npm install 
RUN npm run build --legacy-peer-deps

EXPOSE 3000

ENTRYPOINT ["npm", "run"]
CMD ["start"]
