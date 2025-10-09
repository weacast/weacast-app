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

begin_group "Setting up workspace ..."

if [ "$CI" != true ]; then
    while getopts "b:t" option; do
        case $option in
            b) # defines branch
                WORKSPACE_BRANCH=$OPTARG;;
            t) # defines tag
                WORKSPACE_TAG=$OPTARG;;
            *)
            ;;
        esac
    done

    shift $((OPTIND-1))
    WORKSPACE_DIR="$1"

    # Clone project in the workspace
    git_shallow_clone "$WEACAST_GITHUB_URL/weacast/weacast-app.git" "$WORKSPACE_DIR/weacast-app" "${WORKSPACE_TAG:-${WORKSPACE_BRANCH:-}}"
fi

setup_lib_workspace "$WORKSPACE_DIR" "$KALISIO_GITHUB_URL/kalisio/development.git"

end_group "Setting up workspace ..."
