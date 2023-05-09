#!/bin/env bash
set -ex

npm ci

ARTIFACTS_DIR=$(mktemp -d -t twitter-noto-emoji-XXXXXX)
function cleanup {
  rm -rf "${ARTIFACTS_DIR}"
}
trap cleanup EXIT

# Self-distribution

npm run build
pushd dist/chrome
  zip "${ARTIFACTS_DIR}/twitter-noto-emoji.zip" *
popd

# Chrome WebStore

CHROME_WEBSTORE_VERSION=1 npm run build
pushd dist/chrome
  zip "${ARTIFACTS_DIR}/twitter-noto-emoji-cws.zip" *
popd

# Upload

BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
TAG_NAME="v${BRANCH_NAME/release\//}"

gh release create "${TAG_NAME}" \
  --notes "Release: ${TAG_NAME}" \
  "${ARTIFACTS_DIR}/twitter-noto-emoji.zip#Self-distribution version" \
  "${ARTIFACTS_DIR}/twitter-noto-emoji-cws.zip#Version to upload to CWS"
