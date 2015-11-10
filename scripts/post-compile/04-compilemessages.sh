#!/usr/bin/env bash
set -eo pipefail

indent() {
    RE="s/^/       /"
    [ $(uname) == "Darwin" ] && sed -l "$RE" || sed -u "$RE"
}

MANAGE_FILE=$(find . -maxdepth 3 -type f -name 'manage.py' | head -1)
MANAGE_FILE=${MANAGE_FILE:2}

echo "-----> Compiling i18n messages"

export PATH=$PATH:/app/.vendor/gettext/bin
export LD_LIBRARY_PATH=/app/.vendor/gettext/lib

MANAGE_PATH="$(pwd)/$MANAGE_FILE"
BASE_DIR=$(dirname "$MANAGE_PATH")

pushd "$BASE_DIR" > /dev/null && find . -type d -name locale -not -path '*/\.*' -print0 | while IFS= read -r -d $'\0' locale; do
    cd "$BASE_DIR/$locale/.." && python "$MANAGE_PATH" compilemessages 2>&1 | indent
done

popd > /dev/null

echo

