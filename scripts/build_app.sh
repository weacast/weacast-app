#!/usr/bin/env bash
set -euo pipefail
# set -x

THIS_FILE=$(readlink -f "${BASH_SOURCE[0]}")
THIS_DIR=$(dirname "$THIS_FILE")
ROOT_DIR=$(dirname "$THIS_DIR")
WORKSPACE_DIR="$(dirname "$ROOT_DIR")"

. "$THIS_DIR/kash/kash.sh"

## Parse options
##

DEFAULT_NODE_VER=20
DEFAULT_DEBIAN_VER=bookworm
NODE_VER=$DEFAULT_NODE_VER
DEBIAN_VER=$DEFAULT_DEBIAN_VER
PUBLISH=false
CI_STEP_NAME="Build app"
while getopts "d:n:pr:" option; do
    case $option in
        d) # defines debian version
            DEBIAN_VER=$OPTARG
            ;;
        n) # defines node version
            NODE_VER=$OPTARG
             ;;
        p) # publish app
            PUBLISH=true
            ;;
        r) # report outcome to slack
            CI_STEP_NAME=$OPTARG
            trap 'slack_ci_report "$ROOT_DIR" "$CI_STEP_NAME" "$?" "$SLACK_WEBHOOK_SERVICES"' EXIT
            ;;
        *)
            ;;
    esac
done

## Init workspace
##

init_lib_infos "$ROOT_DIR"

APP=$(get_lib_name)
VERSION=$(get_lib_version)
GIT_TAG=$(get_lib_tag)

load_env_files "$WORKSPACE_DIR/development/common/kalisio_dockerhub.enc.env" "$WORKSPACE_DIR/development/common/SLACK_WEBHOOK_SERVICES.enc.env"
load_value_files "$WORKSPACE_DIR/development/common/KALISIO_DOCKERHUB_PASSWORD.enc.value"

## Build container
##

if [[ -z "$GIT_TAG" ]]; then
    echo "About to build ${APP} development version..."
    API_VERSION=dev
else
    echo "About to build ${APP} v${VERSION}..."
    API_VERSION=$(node -p -e "require(\"$ROOT_DIR/package.json\").peerDependencies['weacast-api']")
fi

IMAGE_NAME="weacast/weacast"
if [[ -z "$GIT_TAG" ]]; then
    IMAGE_SHORT_TAG=dev
    DOCKERFILE=dockerfile.dev
else
    IMAGE_SHORT_TAG=$VERSION
    DOCKERFILE=dockerfile
fi
IMAGE_TAG="$IMAGE_SHORT_TAG-node$NODE_VER-$DEBIAN_VER"

begin_group "Building container ..."

docker login --username "$KALISIO_DOCKERHUB_USERNAME" --password-stdin < "$KALISIO_DOCKERHUB_PASSWORD"
# DOCKER_BUILDKIT is here to be able to use Dockerfile specific dockerginore (app.Dockerfile.dockerignore)
DOCKER_BUILDKIT=1 docker build -f "$ROOT_DIR/$DOCKERFILE" \
    --build-arg NODE_VERSION="$NODE_VER" \
    --build-arg DEBIAN_VERSION="$DEBIAN_VER" \
    --build-arg API_VERSION=$API_VERSION \
    -t "$IMAGE_NAME:$IMAGE_TAG" \
    "$ROOT_DIR"

if [ "$PUBLISH" = true ]; then
    docker push "$IMAGE_NAME:$IMAGE_TAG"
    if [ "$NODE_VER" = "$DEFAULT_NODE_VER" ] && [ "$DEBIAN_VER" = "$DEFAULT_DEBIAN_VER" ]; then
        docker tag "$IMAGE_NAME:$IMAGE_TAG" "$IMAGE_NAME:$IMAGE_SHORT_TAG"
        docker push "$IMAGE_NAME:$IMAGE_SHORT_TAG"
    fi
fi

docker logout

end_group "Building container ..."
