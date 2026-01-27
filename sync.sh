#!/usr/bin/env bash
set -e

TMP="/tmp/disposable-$$"
mkdir -p "$TMP"
trap "rm -rf $TMP" EXIT

# Download remote lists (append newline to ensure proper concatenation)
{ curl -s "https://www.stopforumspam.com/downloads/toxic_domains_whole.txt"; echo; } > "$TMP/sfs.txt"
{ curl -s "https://raw.githubusercontent.com/andreis/disposable-email-domains/master/domains.txt"; echo; } > "$TMP/andreis.txt"

# Process: merge, dedupe, filter allowlist, validate format
{
  cat "$TMP/sfs.txt" "$TMP/andreis.txt"
  grep -v '^#' deny-list.txt | grep -v '^[[:space:]]*$'
  echo
} | tr -d '\r' | tr '[:upper:]' '[:lower:]' | sort -u \
  | grep -vxFf <(grep -v '^#' allow-list.txt | grep -v '^[[:space:]]*$' | sort -u) \
  | grep -E '^[a-z0-9.-]+\.[a-z]{2,}$' \
  > list.txt

# Remove trailing newline
perl -pi -e 'chomp if eof' list.txt

# Generate JSON files
count=$(grep -c "^" list.txt)
jq -Rs 'split("\n") | map(select(. != ""))' list.txt > list.json
echo "{\"schemaVersion\":1,\"label\":\"total number\",\"message\":\"$count\"}" > shields.json

echo "Done! $count domains"
