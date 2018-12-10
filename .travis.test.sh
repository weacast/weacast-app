#!/bin/bash
source .travis.env.sh

git clone https://github.com/weacast/weacast-core.git -b master --single-branch && cd weacast-core && yarn install && yarn link && cd ..
git clone https://github.com/weacast/weacast-probe.git -b master --single-branch && cd weacast-probe && yarn install && yarn link weacast-core && yarn link && cd ..
git clone https://github.com/weacast/weacast-alert.git -b master --single-branch && cd weacast-alert && yarn install && yarn link weacast-core && yarn link weacast-probe && yarn link && cd ..
git clone https://github.com/weacast/weacast-arpege.git -b master --single-branch && cd weacast-arpege && yarn install && yarn link weacast-core && yarn link && cd ..
git clone https://github.com/weacast/weacast-arome.git -b master --single-branch && cd weacast-arome && yarn install && yarn link weacast-arpege && yarn link weacast-core && yarn link && cd ..
git clone https://github.com/weacast/weacast-gfs.git -b master --single-branch && cd weacast-gfs && yarn install && yarn link weacast-core && yarn link && cd ..
git clone https://github.com/weacast/weacast-client.git -b master --single-branch && cd weacast-client && yarn install && yarn link && cd ..
yarn link weacast-client
yarn install

# Install already performs build
# - npm run build
cd api
yarn install
yarn link weacast-core
yarn link weacast-probe
yarn link weacast-alert
yarn link weacast-arpege
yarn link weacast-arome
yarn link weacast-gfs
npm run build