FILE="icon.png"
SHA_FILE="icons/$FILE.sha256"

mkdir -p icons

NEW_SHA=$(shasum -a 256 "$FILE" | awk '{print $1}')
if [[ ! -f "$SHA_FILE" ]] || [[ "$NEW_SHA" != "$(cat $SHA_FILE)" ]]; then
    icon-gen  -i icon.png -o icons
    imageoptim icons
    NEW_SHA=$(shasum -a 256 "$FILE" | awk '{print $1}')
    echo "$NEW_SHA" > "$SHA_FILE"
fi
