#!/usr/bin/env bash
# 前 N 秒样片（确认点 3：先给用户看风格，别等整片渲完）：preview.sh [秒数=30] [起始秒=0]
#   → renders/<slug>_preview_<a>-<b>s.mp4（含配音/字幕/进度条；还没建的组是空画面，正常）
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
SEC=${1:-30}; FROM=${2:-0}
SLUG=$(python3 -c "import re;print(re.search(r\"slug:\\s*'([^']+)'\", open('src/config.ts').read()).group(1))")
TOTAL=$(python3 -c "import re;print(re.search(r'TOTAL_FRAMES\s*=\s*(\d+)', open('src/common/timeline.ts').read()).group(1))")
A=$((FROM * 30)); B=$((A + SEC * 30 - 1))
[ $B -gt $((TOTAL - 1)) ] && B=$((TOTAL - 1))
mkdir -p renders
OUTF="renders/${SLUG}_preview_${FROM}-$((FROM + SEC))s.mp4"
[ "${SKIP_BUNDLE:-0}" = 1 ] && [ -d build_prev ] || { rm -rf build_prev && bunx remotion bundle src/index.ts --out-dir build_prev --log=error; }
# 声音对齐：Remotion 自己的 AAC（libfdk_aac，裸 ADTS）带 2048 采样编码延迟且没有 edit list，播放器不会裁，声音晚 42.7 ms。
# 所以先渲 .mov（h264 + 无损 pcm-16，无延迟），再用 ffmpeg 编 AAC 封 mp4（延迟写进 edit list，解码器会裁）。
command -v ffmpeg >/dev/null || { echo "PREVIEW FAILED: ffmpeg not on PATH"; exit 1; }
MOV="${OUTF%.mp4}.pcm.mov"; MUX="${OUTF%.mp4}.mux.mp4"
trap 'rm -f "${MOV:?}" "${MUX:?}"' EXIT
bunx remotion render build_prev Video "$MOV" --codec=h264 --audio-codec=pcm-16 --crf=18 --frames=$A-$B --concurrency=${CONC:-3} --timeout=${RTIMEOUT:-300000} --log=error \
  || { echo "PREVIEW FAILED: remotion render"; exit 1; }
ffmpeg -v error -nostdin -y -i "$MOV" -map 0:v:0 -map 0:a:0 -c:v copy -c:a aac -b:a 320k -movflags +faststart "$MUX" \
  || { echo "PREVIEW FAILED: ffmpeg aac mux"; exit 1; }
mv -f "$MUX" "$OUTF" || { echo "PREVIEW FAILED: cannot move mux to $OUTF"; exit 1; }
[ -s "$OUTF" ] || { echo "PREVIEW FAILED"; exit 1; }
[ "${KEEP_BUNDLE:-0}" = 1 ] || rm -rf build_prev
echo "$OUTF"
