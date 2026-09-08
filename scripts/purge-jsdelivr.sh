#!/usr/bin/env bash
#
# Purga o cache do jsDelivr depois do `npm publish` e verifica que a CDN passou
# a servir a versão nova.
#
# Existe como script (e não inline no publish.yml) para poder ser rodado à mão
# contra uma versão já publicada:
#
#   scripts/purge-jsdelivr.sh
#
# Três problemas que este script resolve, todos observados na release v1.9.1:
#
#   1. Purgar `/npm/<pkg>@latest` não purga nada de útil. O que fica cacheado é
#      o arquivo — `/npm/<pkg>@latest/dist/index.umd.js`. A versão anterior
#      deste passo só purgava caminhos de pacote e o `@latest` seguiu servindo
#      a build antiga.
#   2. O purge corria contra a propagação do registry. Se o jsDelivr ainda
#      resolve `latest` para a versão anterior, purgar faz ele recachear o
#      valor velho — piora em vez de melhorar.
#   3. O job ficava verde servindo arquivo velho. Sem verificação no fim, uma
#      regressão nos itens 1 e 2 passa despercebida.
#
set -euo pipefail

readonly DATA_API="https://data.jsdelivr.com/v1"
readonly PURGE_API="https://purge.jsdelivr.net"
readonly CDN="https://cdn.jsdelivr.net/npm"

# jsDelivr aceita no máximo 20 caminhos por requisição de purge.
readonly PURGE_CHUNK_SIZE=20

readonly RESOLVE_ATTEMPTS="${RESOLVE_ATTEMPTS:-60}"
readonly RESOLVE_DELAY="${RESOLVE_DELAY:-5}"
readonly VERIFY_ATTEMPTS="${VERIFY_ATTEMPTS:-10}"
readonly VERIFY_DELAY="${VERIFY_DELAY:-5}"

readonly PKG="$(node -p 'require("./package.json").name')"
readonly VERSION="$(node -p 'require("./package.json").version')"

json_field() {
  node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).$1"
}

# Espera o jsDelivr resolver `latest` para a versão recém-publicada. Este é o
# endpoint que ele próprio consulta para decidir o que `@latest` significa, por
# isso é o ponto certo de espera — não o registry do npm.
wait_for_resolution() {
  local attempt resolved
  for attempt in $(seq 1 "$RESOLVE_ATTEMPTS"); do
    resolved="$(curl -fsSL "$DATA_API/packages/npm/$PKG/resolved?specifier=latest" | json_field version || true)"
    if [ "$resolved" = "$VERSION" ]; then
      echo "jsDelivr resolve latest -> $resolved (tentativa $attempt)"
      return 0
    fi
    echo "  tentativa $attempt: latest ainda resolve para ${resolved:-<sem resposta>}, esperando $VERSION"
    sleep "$RESOLVE_DELAY"
  done
  echo "ERRO: jsDelivr não resolveu latest para $VERSION após $RESOLVE_ATTEMPTS tentativas" >&2
  return 1
}

# Os arquivos vêm de dist/ em vez de hardcodados para a lista não apodrecer
# quando o build mudar. As variantes .min.js entram porque o jsDelivr as gera
# sob demanda e as cacheia separadamente.
dist_files() {
  local file base
  for file in dist/*.js; do
    [ -e "$file" ] || continue
    base="$(basename "$file")"
    echo "/dist/$base"
    case "$base" in
      *.min.js) ;;
      *) echo "/dist/${base%.js}.min.js" ;;
    esac
  done
}

# Cada alias é cacheado de forma independente, então todos precisam ser
# purgados. O caminho sem arquivo cobre o entrypoint default do pacote.
purge_paths() {
  local alias file
  for alias in "" "@latest" "@${VERSION%%.*}" "@${VERSION%.*}"; do
    echo "/npm/$PKG$alias"
    for file in $(dist_files); do
      echo "/npm/$PKG$alias$file"
    done
  done
}

purge_chunk() {
  local body id status attempt
  body="$(printf '%s\n' "$@" | node -e "
    const paths = require('fs').readFileSync(0, 'utf8').trim().split('\n');
    process.stdout.write(JSON.stringify({ path: paths }));
  ")"

  id="$(curl -fsSL -X POST "$PURGE_API/" -H 'content-type: application/json' -d "$body" | json_field id)"
  echo "  purge $id (${#} caminhos)"

  for attempt in $(seq 1 60); do
    status="$(curl -fsSL "$PURGE_API/status/$id" | json_field status)"
    case "$status" in
      finished) return 0 ;;
      failed)
        echo "ERRO: purge $id falhou" >&2
        return 1
        ;;
    esac
    sleep 2
  done

  echo "ERRO: purge $id não terminou a tempo" >&2
  return 1
}

# Sem esta verificação o job fica verde enquanto a CDN serve a build anterior.
verify_serving() {
  local path url served attempt failed=0
  local paths=()
  mapfile -t paths < <(purge_paths)
  for path in "${paths[@]}"; do
    url="${CDN}${path#/npm}"
    served=""
    for attempt in $(seq 1 "$VERIFY_ATTEMPTS"); do
      served="$(curl -fsSLI "$url" | grep -i '^x-jsd-version:' | tr -d '\r' | awk '{print $2}' || true)"
      [ "$served" = "$VERSION" ] && break
      sleep "$VERIFY_DELAY"
    done
    if [ "$served" = "$VERSION" ]; then
      printf '  ok   %s\n' "$url"
    else
      printf '  FALHA %s serve %s\n' "$url" "${served:-<desconhecido>}" >&2
      failed=1
    fi
  done
  return "$failed"
}

main() {
  echo "Pacote: $PKG@$VERSION"

  echo "Aguardando o jsDelivr resolver latest..."
  wait_for_resolution

  echo "Purgando..."
  local chunk=()
  local paths=()
  local path
  mapfile -t paths < <(purge_paths)
  for path in "${paths[@]}"; do
    chunk+=("$path")
    if [ "${#chunk[@]}" -eq "$PURGE_CHUNK_SIZE" ]; then
      purge_chunk "${chunk[@]}"
      chunk=()
    fi
  done
  if [ "${#chunk[@]}" -gt 0 ]; then
    purge_chunk "${chunk[@]}"
  fi

  echo "Verificando o que a CDN serve..."
  verify_serving

  echo "jsDelivr servindo $PKG@$VERSION"
}

main "$@"
