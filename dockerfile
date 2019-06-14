ARG API_VERSION
FROM  weacast/weacast-api:$API_VERSION

WORKDIR /opt/weacast-app
COPY . /opt/weacast-app

RUN yarn install
# Install already performs build
# RUN npm run build

RUN cp -R /opt/weacast-app/dist /opt/weacast-api

WORKDIR /opt/weacast-api
