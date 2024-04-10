ARG API_VERSION
FROM  node:16-bookworm AS Build

WORKDIR /opt/weacast/weacast-app
COPY . /opt/weacast/weacast-app

RUN yarn install

FROM  weacast/weacast-api:$API_VERSION

COPY --from=Build --chown=node:node /opt/weacast/weacast-app/dist /opt/weacast/weacast/packages/api/dist
