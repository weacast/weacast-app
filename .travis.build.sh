#!/bin/bash
source .travis.env.sh

# Build docker with version number only on release
if [[ -z "$TRAVIS_TAG" ]]
then
	docker build -f dockerfile.dev -t weacast/weacast:dev .
	docker login -u="$DOCKER_USER" -p="$DOCKER_PASSWORD"
	docker push weacast/weacast:dev
else
	docker build --build-arg API_VERSION=$API_VERSION -f dockerfile -t weacast/weacast .
	docker login -u="$DOCKER_USER" -p="$DOCKER_PASSWORD"
	docker push weacast/weacast
	docker tag weacast/weacast weacast/weacast:$VERSION
	docker push weacast/weacast:$VERSION
fi
