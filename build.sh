#!/bin/sh

OUTPUT="build/jslint"

mkdir -p `dirname $OUTPUT`

echo "#!/usr/bin/env node

// vim: set ft=javascript:
" > $OUTPUT

cat jslint.js >> $OUTPUT
cat nodejs.js >> $OUTPUT

chmod 0755 $OUTPUT

