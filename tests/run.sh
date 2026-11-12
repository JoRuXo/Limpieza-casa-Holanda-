#!/bin/sh
# Uso: cd tests && npm install && npm test   (o: sh tests/run.sh con JSDOM_PATH=/ruta/a/jsdom)
cd /opt/tests || exit 1
for tz in Europe/Amsterdam America/Sao_Paulo Pacific/Auckland America/Los_Angeles; do
  echo "== TZ=$tz"
  TZ=$tz node --test --test-force-exit historial-cubos.test.cjs 2>&1 | grep -E "^# (pass|fail)|^not ok"
done
