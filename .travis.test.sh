#!/bin/bash
if [[ $TRAVIS_COMMIT_MESSAGE == *"[skip test]"* ]] || [[ -n "$TRAVIS_TAG" ]]
then
	echo "Skipping test stage"
else
	source .travis.env.sh

	git clone https://github.com/weacast/weacast-client.git -b master --single-branch && cd weacast-client && yarn install && yarn link && cd ..
	yarn link weacast-client
	yarn install
	# Install already performs build
	# - npm run build
fi