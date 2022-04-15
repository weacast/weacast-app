ARG API_VERSION
FROM  weacast/weacast-api:$API_VERSION

WORKDIR /opt/weacast/weacast-app
COPY . /opt/weacast/weacast-app

RUN yarn install
# Install already performs build
# RUN npm run build

RUN cp -R /opt/weacast/weacast-app/dist /opt/weacast/weacast-api

WORKDIR /opt/weacast/weacast-api
