#!/usr/bin/env bash
set -euo pipefail

echo "==> Migration CommonJS -> ESM"

# 1) Sauvegarde
ts="$(date +%Y%m%d-%H%M%S)"
backup_dir=".backup-esm-$ts"
mkdir -p "$backup_dir"
if [ -f package.json ]; then
  cp package.json "$backup_dir/package.json"
fi

# 2) Met à jour package.json via Node (pas besoin de jq)
node <<'NODE'
const fs = require('fs');
const path = require('path');

const pj = path.resolve('package.json');
if (!fs.existsSync(pj)) {
  console.error('package.json introuvable à la racine.');
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(pj, 'utf8'));

// forcer ESM
pkg.type = 'module';

// engines (optionnel mais utile)
pkg.engines = pkg.engines || {};
if (!pkg.engines.node) pkg.engines.node = '>=18';

// scripts: conserver existants; créer "start" si absent
pkg.scripts = pkg.scripts || {};
if (!pkg.scripts.start) {
  const candidates = [
    'server.js',
    'src/server.js',
    'index.js',
    'src/index.js',
    'app.js',
    'src/api/server.js'
  ];
  const entry = candidates.find(f => fs.existsSync(f));
  pkg.scripts.start = entry ? `node ${entry}` : 'node .';
}

fs.writeFileSync(pj, JSON.stringify(pkg, null, 2) + '\n');
console.log('package.json mis à jour avec "type":"module".');
NODE

# 3) Lister les .js à convertir
mapfile -t files < <(find . -type f -name "*.js" ! -path "./node_modules/*" ! -path "./**/.backup-esm-*/*")

# Sauvegarde des fichiers modifiés
for f in "${files[@]}"; do
  mkdir -p "$backup_dir/$(dirname "$f")"
  cp "$f" "$backup_dir/$f"
done

# 4) Transformations texte (heuristiques)
core_modules="assert buffer child_process cluster crypto dgram dns domain events fs http http2 https net os path perf_hooks process punycode querystring readline repl stream string_decoder sys timers tls tty url util v8 vm worker_threads zlib module"

for f in "${files[@]}"; do
  # a) require simple -> import défaut
  sed -i -E "s/^(const|let|var)[[:space:]]+([A-Za-z0-9_]+)[[:space:]]*=[[:space:]]*require\\('([^']+)'\\);/import \\2 from '\\3';/g" "$f"

  # b) require avec destructuring -> import nommé
  sed -i -E "s/^(const|let|var)[[:space:]]*\\{([^}]+)\\}[[:space:]]*=[[:space:]]*require\\('([^']+)'\\);/import { \\2 } from '\\3';/g" "$f"

  # c) require à effet de bord -> import simple
  sed -i -E "s/^require\\('([^']+)'\\);/import '\\1';/g" "$f"

  # d) module.exports = { a, b } -> export { a, b }
  sed -i -E "s/module\\.exports[[:space:]]*=[[:space:]]*\\{([^}]+)\\};/export { \\1 };/g" "$f"

  # e) module.exports = Truc -> export default Truc
  sed -i -E "s/module\\.exports[[:space:]]*=[[:space:]]*([A-Za-z0-9_]+)/export default \\1;/g" "$f"

  # f) exports.nom = ... -> export const nom = ...
  sed -i -E "s/exports\\.([A-Za-z0-9_]+)[[:space:]]*=[[:space:]]*/export const \\1 = /g" "$f"

  # g) Préfixer les modules noyau avec node:
  for m in $core_modules; do
    sed -i -E "s/from '($m)'/from 'node:\\1'/g" "$f"
    sed -i -E "s/require\\('\\s*($m)\\s*'\\)/require('node:\\1')/g" "$f"
  done

  # h) Ajouter .js aux imports relatifs (sans toucher aux paquets npm)
  sed -i -E "s/(from\\s+)'(\\.\\.?\\/[^'\"\\n]+)'/\\1'\\2.js'/g" "$f"
  sed -i -E "s/(from\\s+)\"(\\.\\.?\\/[^\"\\n]+)\"/\\1\"\\2.js\"/g" "$f"
  sed -i -E "s/require\\('(\\.\\.?\\/[^'\"\\n]+)'\\)/require('\\1.js')/g" "$f"
done

# 5) Injecter __dirname/__filename si utilisés
for f in "${files[@]}"; do
  if grep -qE '__dirname|__filename' "$f"; then
    if ! grep -q "fileURLToPath" "$f"; then
      tmp="$(mktemp)"
      {
        echo "import path from 'node:path';"
        echo "import { fileURLToPath } from 'node:url';"
        echo "const __filename = fileURLToPath(import.meta.url);"
        echo "const __dirname = path.dirname(__filename);"
        echo
        cat "$f"
      } > "$tmp"
      mv "$tmp" "$f"
    fi
  fi
done

echo "==> Migration terminée."
echo "Sauvegardes: $backup_dir"
echo "Tu peux lancer: npm start (ou le script que tu utilises d'habitude)."
