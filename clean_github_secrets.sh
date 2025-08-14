#!/usr/bin/env bash
# clean_github_secrets.sh
# Nettoie les tokens GitHub de l'historique, corrige package.json, puis push --force.
# Usage: ./clean_github_secrets.sh [REMOTE_URL] [BRANCH]
# - REMOTE_URL (optionnel) ex: https://github.com/EZRIDERZ/xyo-js-node.git
# - BRANCH (optionnel) défaut: main

set -euo pipefail

REMOTE_URL="${1:-}"
BRANCH="${2:-main}"
FILE="package.json"

say() { printf "\n==> %s\n" "$*"; }

# 0) Vérifs de base
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erreur: lance ce script dans le dossier du dépôt (où se trouve le .git)."
  exit 1
fi

# 1) Remote origin
if git remote get-url origin >/dev/null 2>&1; then
  say "Remote 'origin' déjà configuré."
else
  if [ -z "$REMOTE_URL" ]; then
    echo "Remote 'origin' manquant. Fournis l'URL: ./clean_github_secrets.sh <REMOTE_URL>"
    exit 1
  fi
  say "Ajout du remote origin -> $REMOTE_URL"
  git remote add origin "$REMOTE_URL"
fi

# 2) Branche
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  say "Passage sur la branche $BRANCH (création si nécessaire)"
  git checkout -B "$BRANCH"
fi

# 3) Sauvegarde
BACKUP="backup/pre-clean-$(date +%Y%m%d-%H%M%S)"
say "Création d'une branche de sauvegarde: $BACKUP"
git branch "$BACKUP" || true

# 4) Nettoyage du package.json dans l'état courant (si présent)
if [ -f "$FILE" ]; then
  if grep -Eq 'github_pat_|ghp_|gho_|ghu_|ghr_' "$FILE"; then
    say "Token détecté dans $FILE -> remplacement par un placeholder"
    # Remplace toute forme de token GitHub classique/fine-grained par un placeholder
    # (sans casser le JSON)
    cp "$FILE" "$FILE.bak"
    sed -E \
      -e 's/github_pat_[A-Za-z0-9_]+/REDACTED_GITHUB_TOKEN/g' \
      -e 's/ghp_[A-Za-z0-9]+/REDACTED_GITHUB_TOKEN/g' \
      -e 's/gho_[A-Za-z0-9]+/REDACTED_GITHUB_TOKEN/g' \
      -e 's/ghu_[A-Za-z0-9]+/REDACTED_GITHUB_TOKEN/g' \
      -e 's/ghr_[A-Za-z0-9]+/REDACTED_GITHUB_TOKEN/g' \
      -i "$FILE" || { mv "$FILE.bak" "$FILE"; echo "Remplacement échoué"; exit 1; }
    rm -f "$FILE.bak"
    git add "$FILE"
    if ! git diff --cached --quiet; then
      git commit -m "chore: remove token from $FILE"
    fi
  else
    say "Pas de token apparent dans $FILE (état courant)."
  fi
else
  say "$FILE introuvable (ok si ton projet n'en a pas)."
fi

# 5) Prépare les règles de remplacement sur tout l'historique
REPL_FILE=".git-secrets-replacements.txt"
cat > "$REPL_FILE" <<'EOF'
# Remplace les tokens GitHub dans TOUT l'historique
regex:github_pat_[0-9A-Za-z_]{10,}==>REDACTED_GITHUB_TOKEN
regex:ghp_[0-9A-Za-z]{10,}==>REDACTED_GITHUB_TOKEN
regex:gho_[0-9A-Za-z]{10,}==>REDACTED_GITHUB_TOKEN
regex:ghu_[0-9A-Za-z]{10,}==>REDACTED_GITHUB_TOKEN
regex:ghr_[0-9A-Za-z]{10,}==>REDACTED_GITHUB_TOKEN
EOF

# 6) Installer/assurer git-filter-repo
ensure_filter_repo() {
  if command -v git-filter-repo >/dev/null 2>&1; then
    return 0
  fi
  say "Installation de git-filter-repo (via pip --user)"
  # Sur Termux/Android, python et pip peuvent être nécessaires
  if ! command -v python >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
    alias python=python3
  fi
  if ! command -v pip >/dev/null 2>&1 && command -v pip3 >/dev/null 2>&1; then
    alias pip=pip3
  fi
  if ! command -v pip >/dev/null 2>&1; then
    echo "pip introuvable. Installe python/pip (ex: pkg install python) puis relance."
    exit 1
  fi
  pip install --user git-filter-repo
  export PATH="$HOME/.local/bin:$PATH"
  if ! command -v git-filter-repo >/dev/null 2>&1; then
    echo "git-filter-repo non détecté dans le PATH après installation."
    echo "Ajoute $HOME/.local/bin à ton PATH, ou relance ta session, puis réessaie."
    exit 1
  fi
}

ensure_filter_repo

# 7) Réécriture de l'historique pour purger les secrets
say "Réécriture de l'historique (git filter-repo) — ceci peut prendre un moment…"
git filter-repo --replace-text "$REPL_FILE" --force

# 8) Garbage-collect pour nettoyer les objets orphelins
say "Nettoyage du dépôt (git gc)"
git gc --prune=now --aggressive || true

# 9) Push en force (avec protection)
say "Push vers origin/$BRANCH avec --force-with-lease"
git push origin "$BRANCH" --force-with-lease

say "Terminé ✔  Ton historique est nettoyé et le push est effectué."
say "N'oublie pas de révoquer le token exposé dans les paramètres GitHub (Developer settings → Tokens)."
