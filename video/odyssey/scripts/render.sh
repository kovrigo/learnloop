#!/usr/bin/env bash
# 整片渲染：VER=v1 scripts/render.sh  → renders/<slug>_v1.mp4 + fin_frames/ + renders/sheet_v1.html
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); cd "$ROOT"
V=${VER:-v1}
SLUG=$(python3 -c "import re;print(re.search(r\"slug:\\s*'([^']+)'\", open('src/config.ts').read()).group(1))")
mkdir -p renders
[ "${SKIP_BUNDLE:-0}" = 1 ] && [ -d build_full ] || { rm -rf build_full && bunx remotion bundle src/index.ts --out-dir build_full --log=error; }
# 声音对齐：Remotion 自己的 AAC（libfdk_aac，裸 ADTS）带 2048 采样编码延迟且没有 edit list，播放器不会裁，声音晚 42.7 ms。
# 所以先渲 .mov（h264 + 无损 pcm-16，无延迟），再用 ffmpeg 编 AAC 封 mp4（延迟写进 edit list，解码器会裁）。
command -v ffmpeg >/dev/null || { echo "RENDER FAILED: ffmpeg not on PATH"; exit 1; }
OUTF="renders/${SLUG}_${V}.mp4"
MOV="${OUTF%.mp4}.pcm.mov"; MUX="${OUTF%.mp4}.mux.mp4"
trap 'rm -f "${MOV:?}" "${MUX:?}"' EXIT
bunx remotion render build_full Video "$MOV" --codec=h264 --audio-codec=pcm-16 --crf=16 --concurrency=${CONC:-3} --timeout=${RTIMEOUT:-300000} --log=error \
  || { echo "RENDER FAILED: remotion render"; exit 1; }
ffmpeg -v error -nostdin -y -i "$MOV" -map 0:v:0 -map 0:a:0 -c:v copy -c:a aac -b:a 320k -movflags +faststart "$MUX" \
  || { echo "RENDER FAILED: ffmpeg aac mux"; exit 1; }
mv -f "$MUX" "$OUTF" || { echo "RENDER FAILED: cannot move mux to $OUTF"; exit 1; }
[ -s "renders/${SLUG}_${V}.mp4" ] || { echo "RENDER FAILED"; exit 1; }
rm -rf fin_frames && mkdir -p fin_frames
ffmpeg -v error -y -i "renders/${SLUG}_${V}.mp4" -q:v 4 fin_frames/f_%04d.jpg
ls fin_frames | wc -l > fin_count.txt
python3 scripts/sheet.py fin_frames "renders/sheet_${V}.html" 60 || true
[ "${KEEP_BUNDLE:-0}" = 1 ] || rm -rf build_full
echo done > render.done
