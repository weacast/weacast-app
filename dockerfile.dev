FROM  weacast/weacast-api:dev

WORKDIR /opt/weacast-modules

RUN git clone https://github.com/weacast/weacast-client.git -b master --single-branch && cd weacast-client && yarn install && yarn link && cd ..

WORKDIR /opt/weacast-app
COPY . /opt/weacast-app

RUN yarn link weacast-client
RUN yarn install
# Install already performs build
# RUN npm run build

RUN cp -R /opt/weacast-app/dist /opt/weacast-api

WORKDIR /opt/weacast-api
