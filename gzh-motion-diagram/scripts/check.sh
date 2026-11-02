#!/usr/bin/env bash
# 一键检查 + 渲染 + 转 GIF。任何一步失败即退出（非 0），修好后从头重跑。
# 用法：bash check.sh <工程目录>        例：bash check.sh "my-article/xxx图解/02-订阅直通"
# 产物：<工程目录>/../<名称>.mp4、<名称>.gif；复核图在 <工程目录>/_review/
set -euo pipefail

HF="npx -y hyperframes@0.8.226"
GIF_FPS=10
GIF_WIDTH=900
MAX_GIF_BYTES=$((5 * 1024 * 1024))
MAX_GIF_FRAMES=300

[ $# -eq 1 ] || { echo "用法：bash check.sh <工程目录>"; exit 2; }
PROJ="$(cd "$1" && pwd)"
NAME="$(basename "$PROJ")"
OUTDIR="$(dirname "$PROJ")"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REVIEW="$PROJ/_review"
MP4="$OUTDIR/$NAME.mp4"
GIF="$OUTDIR/$NAME.gif"

step() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }
fail() { printf '\n\033[31m✗ 不通过：%s\033[0m\n' "$1"; exit 1; }

for bin in node ffmpeg ffprobe npx; do command -v "$bin" >/dev/null || fail "缺少依赖 $bin"; done
[ -f "$PROJ/index.html" ] || fail "$PROJ/index.html 不存在"
[ -f "$PROJ/storyboard.md" ] || fail "缺少 storyboard.md（先写分镜，再写代码）"

rm -rf "$REVIEW"; mkdir -p "$REVIEW"

step "1/6 静态审计（audit.mjs）"
node "$SKILL_DIR/scripts/audit.mjs" "$PROJ" || fail "静态审计有错误"

step "2/6 hyperframes check（lint + 运行时 + 排版 + 可读时长）"
( cd "$PROJ" && $HF check --at-transitions ) 2>&1 | grep -v -E '^\s*Fix:|feedback|desktop app' | tee "$REVIEW/check.log"
grep -q "Check passed" "$REVIEW/check.log" || fail "hyperframes check 未通过，见 _review/check.log"
WARNS=$(grep -c "⚠" "$REVIEW/check.log" || true)
echo "→ check 通过，warning ${WARNS} 条：每一条都必须在 REVIEW.md 的 V10 里写明处理方式"

step "3/6 关键帧截图（每个场景：中段 + 切场前定格帧）"
DUR=$(grep -o 'data-duration="[0-9.]*"' "$PROJ/index.html" | head -1 | grep -o '[0-9.]*')
AT=$(node -e '
  const s = require("fs").readFileSync(process.argv[1], "utf8");
  const t = [...s.match(/const\s+SCENES\s*=\s*(\[[\s\S]*?\]);/)[1].matchAll(/,\s*([\d.]+)\s*\]/g)].map(m => +m[1]);
  const d = +process.argv[2], out = [];
  t.forEach((a, i) => { const b = i + 1 < t.length ? t[i + 1] : d; out.push(((a + b) / 2).toFixed(2), (b - 0.4).toFixed(2)); });
  console.log(out.join(","));
' "$PROJ/index.html" "$DUR")
echo "→ 截图时间点：$AT"
( cd "$PROJ" && $HF snapshot --at "$AT" --no-end -o "$REVIEW/snapshots" ) 2>&1 | tail -3
ls "$REVIEW/snapshots"/contact-sheet*.jpg >/dev/null 2>&1 || fail "关键帧截图失败"

step "4/6 渲染 MP4"
( cd "$PROJ" && $HF render -o "$MP4" --fps 30 --quality delivery ) 2>&1 | grep -E -i "error|fail|✗" || true
[ -f "$MP4" ] || fail "MP4 渲染失败"
MP4_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MP4")
awk -v a="$MP4_DUR" -v b="$DUR" 'BEGIN{d=a-b; if(d<0)d=-d; exit !(d<=0.2)}' || fail "MP4 时长 ${MP4_DUR}s 与 data-duration ${DUR}s 相差超过 0.2 秒"

step "5/6 转 GIF"
ffmpeg -y -loglevel error -i "$MP4" -vf "fps=${GIF_FPS},scale=${GIF_WIDTH}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" -loop 0 "$GIF"
BYTES=$(wc -c < "$GIF" | tr -d ' ')
FRAMES=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$GIF")
WIDTH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$GIF")
printf '→ GIF %.2fMB / %s 帧 / 宽 %s\n' "$(echo "$BYTES/1048576" | bc -l)" "$FRAMES" "$WIDTH"
[ "$BYTES" -le "$MAX_GIF_BYTES" ] || fail "GIF 超过 5MB：减少同时运动的元素、缩短时长，或检查背景是否在动"
[ "$FRAMES" -le "$MAX_GIF_FRAMES" ] || fail "GIF 超过 300 帧：把 data-duration 控制在 30 秒以内"
[ "$WIDTH" -eq "$GIF_WIDTH" ] || fail "GIF 宽度不是 ${GIF_WIDTH}"

step "6/6 复核图"
N=12
STEP=$(awk -v d="$DUR" -v n="$N" 'BEGIN{printf "%.3f", d/n}')
ffmpeg -y -loglevel error -i "$GIF" -vf "fps=1/${STEP},scale=450:-1,tile=4x3" -frames:v 1 "$REVIEW/gif-sheet.png"
ffmpeg -y -loglevel error -i "$GIF" -vf "fps=1/${STEP},scale=375:-1,tile=4x3" -frames:v 1 "$REVIEW/phone-sheet.png"

cat <<EOF

✓ 自动检查全部通过
  GIF：$GIF
  MP4：$MP4

接下来必须做人工复核（references/review-checklist.md），用看图工具逐张打开：
  1. $REVIEW/snapshots/contact-sheet*.jpg（可能有多张）
  2. $REVIEW/gif-sheet.png
  3. $REVIEW/phone-sheet.png
然后填写 $PROJ/REVIEW.md。任何一项 ✗ → 修改 → 重跑本脚本。
EOF
