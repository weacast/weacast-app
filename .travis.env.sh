#!/bin/bash

# Build docker with version number only on release
if [[ -z "$TRAVIS_TAG" ]]
then
	export VERSION=dev
	export API_VERSION=dev
else
	export VERSION=$(node -p -e "require('./package.json').version")
	export API_VERSION=$(node -p -e "require('./package.json').peerDependencies['weacast-api']")
fi
