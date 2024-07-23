ARG DEBIAN_VERSION=bookworm
ARG NODE_VERSION=20
ARG API_VERSION
FROM node:${NODE_VERSION}-${DEBIAN_VERSION} AS Build

WORKDIR /opt/weacast/weacast-app
COPY . /opt/weacast/weacast-app

RUN yarn install

FROM weacast/weacast-api:$API_VERSION-node${NODE_VERSION}-${DEBIAN_VERSION}

COPY --from=Build --chown=node:node /opt/weacast/weacast-app/dist /opt/weacast/weacast/packages/api/dist
