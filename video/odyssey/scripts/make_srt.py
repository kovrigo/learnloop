#!/usr/bin/env python3
"""SRT from script/timeline.json, same block timing as src/common/subs.ts (tts_build.py clamps).
Usage, from the video project directory: python3 scripts/make_srt.py script/timeline.json script/subtitles.srt"""
import json, sys

tl = json.load(open(sys.argv[1], encoding='utf-8'))
fps = tl['fps']
subs = []
for s in tl['sentences']:
    for sb in s['subs']:
        sb = dict(sb)
        if sb['to'] < sb['from']:
            sb['to'] = sb['from']
        subs.append(sb)
for i in range(len(subs) - 1):
    if subs[i]['to'] >= subs[i + 1]['from']:
        subs[i]['to'] = subs[i + 1]['from'] - 1


def ts(sec):
    ms = int(round(sec * 1000))
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


with open(sys.argv[2], 'w', encoding='utf-8') as f:
    for n, sb in enumerate(subs, 1):
        f.write(f"{n}\n{ts((sb['from'] - 1) / fps)} --> {ts(sb['to'] / fps)}\n{sb['text']}\n\n")
print(f'blocks={len(subs)} last_end={ts(subs[-1]["to"] / fps)} max_len={max(len(s["text"]) for s in subs)}')
