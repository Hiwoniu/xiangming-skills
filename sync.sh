#!/usr/bin/env bash
# 把本地 skill 同步进仓库（只同步本人维护的 skill）。
# 用法：SKILLS_SRC=<本地 skills 目录> bash sync.sh
set -euo pipefail
: "${SKILLS_SRC:?请设置 SKILLS_SRC，例如 SKILLS_SRC=~/notes/skills bash sync.sh}"
cd "$(dirname "$0")"
for s in gzh-motion-diagram; do
  rsync -a --delete --exclude _review --exclude .hyperframes --exclude .DS_Store "$SKILLS_SRC/$s/" "./$s/"
done
# 同步后自查：不允许出现本机绝对路径
if grep -rn -E '/Users/[A-Za-z0-9]|/home/[a-z]' --exclude=sync.sh --exclude-dir=.git . ; then
  echo "✗ 发现本机绝对路径，请先脱敏再提交"; exit 1
fi
echo "✓ 已同步，git status 查看改动"
