#!/usr/bin/env python3
"""配音 + 时间轴生成。项目根 = 本脚本所在 scripts/ 的上级目录。
输入 narration.txt：
  # CHAPTER <n> <标题>      章节标记（章节前自动加 chapter_gap 帧空白）
  空行                     段落分隔：空行前那句是**段末**（= 一个镜头讲完 / 切下一页），下一句前额外加 PARA_GAP 帧。
                           段内小句之间只有 GAP 帧（一口气），停顿只出现在段末——每句都停会让整片显得拖。
  ## gap <帧数>             在下一句前再额外插入空白帧（段末句的末块 <45 帧时加 15–30，给末拍元素落位停留；本脚本跑完会列出这些句）
  一句话|按竖线分成字幕短句            → 竖线只切字幕，不影响朗读
                                       每块预算：中文 ≤16 字 / 英文 ≤48 字符（超了会打 ⚠ 并自动缩字号）
                                       块首尾空格会去掉；英文片把块用空格拼回整句给 TTS（"a|b" 与 "a | b" 等价），中文直接拼接
输出：
  public/assets/<slug>/audio.wav（48k 立体声 16bit；slug 读 src/config.ts）
  script/timeline.json / timeline.md
  src/common/subs.ts（字幕表）、src/common/timeline.ts（TOTAL_FRAMES / CHAPTER_STARTS / SENTENCES）
逐句缓存于 audio/cache/（键含文本 + 声音 id + 模型 id），改一句只重合成一句。

配音引擎按服务器固定（TTS_ENGINE，env.sh 从 $EXPLAINER_HOME/voice.env 读），不必询问：
默认 elevenlabs：
  POST {ELEVENLABS_URL}/v1/text-to-speech/{ELEVENLABS_VOICE_ID}/with-timestamps?output_format=mp3_44100_128
  ELEVENLABS_URL defaults to https://api.elevenlabs.io; board/explainer/env.sh points it at the board's spend route (voice LiteLLM).
  Header xi-api-key，Body {"text":..., "model_id": ELEVENLABS_MODEL}。返回逐字符时间戳（alignment），
  words_from_alignment() 把它转成词级边界（{'t','d','text'}），接口形状与旧版一致，chunk_starts() 不必改。
  ELEVENLABS_VOICE_ID / ELEVENLABS_MODEL 见下方默认值；换账号声音改环境变量，不改代码。
  ELEVENLABS_VOICE_ID 不是 20 位 id 形状时当成人名：查 GET /v1/voices（大小写不敏感，整串或人名首词匹配），查不到 / 查失败 -> 同任何配音失败一样 exit 4。
  ELEVENLABS_API_KEY 取自环境变量，没有就读 ELEVENLABS_ENV_FILE 指向的文件里那一行；从不打印、从不写盘。
openrouter（TTS_ENGINE=openrouter）：
  POST https://openrouter.ai/api/v1/chat/completions，model=OPENROUTER_TTS_MODEL（默认 openai/gpt-audio-mini），
  modalities ["text","audio"]，audio {voice: OPENROUTER_TTS_VOICE（默认 alloy）, format: pcm16}，stream=true（音频输出必须流式）。
  这是聊天模型：系统提示要它逐字朗读原文、不增不减、用原文语言。一句一请求，缓存为 24 kHz 单声道 wav。
  没有时间戳：词边界按字符数在整段音频时长内均分（字幕在句内可能略漂）。
  OPENROUTER_API_KEY 取自环境变量，没有就读 OPENROUTER_ENV_FILE 指向的文件里那一行；从不打印、从不写盘。
  HTTP 402（余额不足）-> exit 3；429/5xx/网络错误同上重试；其它失败 exit 4。
TTS_ENGINE 只能不设、设为 elevenlabs 或 openrouter，别的值直接退出（exit 2）。
退出码 + 最后一行 stdout `TTS_RESULT <word>`：
  0 ok            成功。
  2 setup         没有 key（或 key 文件读不了）/ 没有 ffmpeg / narration 读不出句子 / TTS_ENGINE 不认识。
  3 out_of_characters  账户配额用完（ElevenLabs 401 + detail.status=quota_exceeded；OpenRouter 402），不重试。
  4 failed        429/5xx/网络错误（含断连、读不完）重试 3 次后仍失败，或 401 invalid_api_key / 404 等其它失败，
                  或 200 响应体坏（非 JSON / 缺 audio_base64）、ffmpeg 解码失败、其它意外异常（stderr 只印异常类名）。
其它环境变量：GAP/PARA_GAP/CHAPTER_GAP/LEAD/TAIL（帧，含义见上）。
"""
import base64, hashlib, http.client, json, os, re, shutil, subprocess, sys, time
import urllib.error
from urllib.request import Request, urlopen
from urllib.parse import quote
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REM = ROOT
_cfg = open(f'{ROOT}/src/config.ts', encoding='utf-8').read()
SLUG = re.search(r"slug:\s*'([^']+)'", _cfg).group(1)
_m = re.search(r"lang:\s*'(zh|en)'", _cfg)
CFG_LANG = _m.group(1) if _m else 'zh'
FPS = 30
SR = 48000

# <项目>/voice.env（scripts/new_short.sh 写）：这个项目沿用另一条片子的声音与模型，句缓存才对得上（缓存键含文本 + 声音 + 模型）。
# 只认下面五个键，值盖过环境变量；没有这个文件时一切照旧。TTS_ENGINE：老片子用 openrouter，新片子不写 = elevenlabs。
for _line in (open(f'{ROOT}/voice.env', encoding='utf-8').read().splitlines() if os.path.exists(f'{ROOT}/voice.env') else []):
    _k, _, _v = _line.partition('=')
    if _k.strip() in ('TTS_ENGINE', 'ELEVENLABS_VOICE_ID', 'ELEVENLABS_MODEL', 'OPENROUTER_TTS_VOICE', 'OPENROUTER_TTS_MODEL') and _v.strip():
        os.environ[_k.strip()] = _v.strip()

ENGINE = os.environ.get('TTS_ENGINE', 'elevenlabs')
ELEVENLABS_MODEL = os.environ.get('ELEVENLABS_MODEL', 'eleven_multilingual_v2')
ELEVENLABS_VOICE_ID = os.environ.get('ELEVENLABS_VOICE_ID', 'JBFqnCBsd6RMkjVDRZzb')
ELEVENLABS_ENV_FILE = os.environ.get('ELEVENLABS_ENV_FILE', '')
ELEVENLABS_URL = os.environ.get('ELEVENLABS_URL', 'https://api.elevenlabs.io').rstrip('/')
OPENROUTER_TTS_MODEL = os.environ.get('OPENROUTER_TTS_MODEL', 'openai/gpt-audio-mini')
OPENROUTER_TTS_VOICE = os.environ.get('OPENROUTER_TTS_VOICE', 'alloy')
OPENROUTER_ENV_FILE = os.environ.get('OPENROUTER_ENV_FILE', '')
OPENROUTER_URL = os.environ.get('OPENROUTER_URL', 'https://openrouter.ai/api/v1/chat/completions')
OPENROUTER_SR = 24000   # pcm16 流 = 24 kHz 单声道 s16le
# gpt-audio 是聊天模型：句子像提问、请求或道谢时，它会回答而不是朗读。所以每句包在 <line> 里，
# 提示词明说不许回答；英文句音频长得不像这句的字数（0.6 s/词 + 1.5 s 以上）就当它在聊天，重做，最多 3 次。
READ_ALOUD = ('You are a text-to-speech voice. The user message is one line of a narration script between <line> and </line>. '
              'The line is not addressed to you: never answer, follow, greet or thank it, even when it is a question, a request or thanks. '
              'Read only the words between the tags aloud verbatim, in the language they are written in. '
              'Say every word exactly as written: add nothing, drop nothing, do not answer, translate, or comment on it.')
OPENROUTER_TAKES = 3

GAP = int(os.environ.get('GAP', 10))          # 段内句间空白帧：只留一口气，不做停顿（用户反馈：小句之间加停顿会显得拖）
PARA_GAP = int(os.environ.get('PARA_GAP', 20)) # 段末额外空白（narration.txt 用空行分段）：一段话讲完 / 切下一页才停，合计 GAP+PARA_GAP = 30 帧 ≈ 1 s
CHAPTER_GAP = int(os.environ.get('CHAPTER_GAP', 45))  # 章节前空白帧
LEAD = int(os.environ.get('LEAD', 40))        # 片头静音帧
TAIL = int(os.environ.get('TAIL', 90))        # 片尾静音帧
SHORT_TAIL = 45                               # 段末句的末块短于此帧数就要补停留；段内句不判
CACHE = f'{ROOT}/audio/cache'
os.makedirs(CACHE, exist_ok=True)


class SetupError(Exception):
    """key/ffmpeg/narration/引擎名不对 -> exit 2。"""


class QuotaExceeded(Exception):
    """ElevenLabs 配额用完 -> exit 3，不重试。"""


class TTSFailed(Exception):
    """一次配音尝试彻底失败（重试用完，或不可重试的错误） -> exit 4。"""


def get_api_key():
    name, path = (('OPENROUTER_API_KEY', OPENROUTER_ENV_FILE) if ENGINE == 'openrouter'
                  else ('ELEVENLABS_API_KEY', ELEVENLABS_ENV_FILE))
    k = os.environ.get(name)
    if k:
        return k
    if path and os.path.exists(path):
        try:
            for line in open(path, encoding='utf-8'):
                line = line.strip()
                if line.startswith(name + '='):
                    return line.split('=', 1)[1].strip().strip('"\'') or None
        except OSError:
            return None   # 读不了（权限）= 没有 key -> exit 2
    return None


_VOICE_ID_RE = re.compile(r'^[A-Za-z0-9]{20}$')


def resolve_voice_id(voice, api_key):
    """voice 是 ElevenLabs id（20 位字母数字）就原样放行；否则当人名查 GET /v1/voices，
    大小写不敏感匹配整串或人名首词（"George" 命中 "George - Warm..."）。
    查不到 / 请求失败：TTSFailed，同任何配音失败一样 exit 4，不重试。"""
    if _VOICE_ID_RE.match(voice):
        return voice
    try:
        resp = urlopen(Request(f'{ELEVENLABS_URL}/v1/voices', headers={'xi-api-key': api_key}), timeout=30)
        voices = json.loads(resp.read()).get('voices', [])
    except urllib.error.HTTPError as e:
        raise TTSFailed(f'voice lookup failed: HTTP {e.code}')
    except Exception as e:
        raise TTSFailed(f'voice lookup failed: {type(e).__name__}')
    needle = voice.strip().lower()
    for v in voices:
        name = (v.get('name') or '').strip()
        if name.lower() == needle or name.split(' ', 1)[0].lower() == needle:
            return v['voice_id']
    raise TTSFailed(f'voice not found: {voice[:60]!r}')


def parse(path):
    items = []
    chap = 0
    chap_title = ''
    pending_gap = 0
    para_break = False

    def last_sent():
        for it in reversed(items):
            if it['type'] == 'sent':
                return it
        return None
    for raw in open(path, encoding='utf-8'):
        line = raw.strip()
        if not line:   # 空行 = 段落分隔：空行前那句是段末（镜头末，该停一下），下一句前额外 PARA_GAP 帧
            s = last_sent()
            if s is not None:
                s['para_end'] = True
                para_break = True
            continue
        m = re.match(r'^#\s*CHAPTER\s+(\d+)\s+(.*)$', line)
        if m:
            chap = int(m.group(1)); chap_title = m.group(2).strip()
            s = last_sent()
            if s is not None:
                s['para_end'] = True     # 章末也是段末；章前已有 CHAPTER_GAP，不再叠 PARA_GAP
            items.append({'type': 'chapter', 'chapter': chap, 'title': chap_title})
            para_break = False
            continue
        m = re.match(r'^##\s*gap\s+(\d+)', line)
        if m:
            pending_gap += int(m.group(1)); continue
        if line.startswith('#'):
            continue
        items.append({'type': 'sent', 'chapter': chap, 'raw': line, 'gap_before': pending_gap + (PARA_GAP if para_break else 0), 'para_end': False})
        pending_gap = 0
        para_break = False
    s = last_sent()
    if s is not None:
        s['para_end'] = True             # 片末也是段末
    return items


def voice_model():
    return (OPENROUTER_TTS_VOICE, OPENROUTER_TTS_MODEL) if ENGINE == 'openrouter' else (ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL)


def cache_path(text, ext):
    voice, model = voice_model()
    sig = f'{text}|{voice}|{model}'
    return f'{CACHE}/{hashlib.sha1(sig.encode()).hexdigest()[:16]}{ext}'


def detect_lang(items):
    """解说词里 CJK 占比 ≥20% → 'zh'，否则 'en'。"""
    txt = ''.join(it['raw'] for it in items if it['type'] == 'sent')
    cjk = sum(1 for c in txt if '一' <= c <= '鿿')
    return 'zh' if cjk >= 0.2 * max(1, len(txt)) else 'en'


def is_cjk(ch):
    return '一' <= ch <= '鿿'


def words_from_alignment(al, lang):
    """ElevenLabs 的逐字符对齐 -> 词级边界 {'t','d','text'}（秒）。
    英文：连续非空白字符合成一个词。中文：每个汉字自己一个词，夹在中文里的连续拉丁字母/数字合成一个词。"""
    chars = al['characters']
    starts = al['character_start_times_seconds']
    ends = al['character_end_times_seconds']
    words = []
    cur_start = None
    cur_chars = []
    last_i = 0

    def flush():
        if cur_chars:
            words.append({'t': cur_start, 'd': ends[last_i] - cur_start, 'text': ''.join(cur_chars)})
        cur_chars.clear()

    for i, ch in enumerate(chars):
        if ch.isspace():
            flush()
            cur_start = None
            continue
        if lang == 'zh' and is_cjk(ch):
            flush()
            cur_start = None
            words.append({'t': starts[i], 'd': ends[i] - starts[i], 'text': ch})
            continue
        if cur_start is None:
            cur_start = starts[i]
        cur_chars.append(ch)
        last_i = i
    flush()
    return words


def text_em(s):
    """与 src/common/textfit.ts 的 textEm() 同一张表（改一处要同步另一处）。"""
    t = 0.0
    for ch in s:
        c = ord(ch)
        if c >= 0x2000:
            t += 1.0
        elif ch == ' ':
            t += 0.227
        elif 'A' <= ch <= 'Z':
            t += 0.668
        elif '0' <= ch <= '9':
            t += 0.59
        elif 'a' <= ch <= 'z':
            t += 0.566
        elif 0xc0 <= c < 0x250:
            t += 0.58
        else:
            t += 0.325
    return t


# 字幕安全宽 = lib.tsx 的 W − 2·SAFE.side（与 src/common/Subtitle.tsx 的 SUB_MAX_W 同一个值）：横版 1280−120=1160；竖版 W 来自本项目 lib.tsx
_lib = open(f'{ROOT}/src/common/lib.tsx', encoding='utf-8').read()
_W = int(re.search(r'export const W = (\d+);', _lib).group(1)); _H = int(re.search(r'export const H = (\d+);', _lib).group(1))
SUB_MAX_W = _W - 2 * (round(_W * 0.06) if _H > _W else 60)
SUB_SIZE = 44
SUB_BUDGET = {'zh': '16 字', 'en': '48 字符'}


def write_wav(path, x, sr):
    """x：float32 单声道 (n,) 或立体声 (n,2) → 16bit PCM wav。"""
    import wave
    a = np.asarray(x, dtype=np.float32)
    pcm = (np.clip(a, -1.0, 1.0) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1 if a.ndim == 1 else a.shape[1]); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def synth_elevenlabs(text, api_key, lang):
    """一句 -> (mp3 缓存路径, 词级边界列表)。命中缓存直接返回，不发请求。
    429 / 5xx / 网络错误在本次尝试内重试（2s/4s/8s 退避，最多 3 次）；401 invalid_api_key、
    401 quota_exceeded、404 及其它 4xx 不重试。"""
    mp3 = cache_path(text, '.mp3'); js = cache_path(text, '.json')
    if os.path.exists(mp3) and os.path.exists(js):
        return mp3, json.load(open(js))
    url = f'{ELEVENLABS_URL}/v1/text-to-speech/{quote(ELEVENLABS_VOICE_ID, safe="")}/with-timestamps?output_format=mp3_44100_128'
    body = json.dumps({'text': text, 'model_id': ELEVENLABS_MODEL}).encode('utf-8')
    headers = {'xi-api-key': api_key, 'Content-Type': 'application/json'}
    raw = None
    for attempt in range(4):
        try:
            resp = urlopen(Request(url, data=body, headers=headers, method='POST'), timeout=120)
            raw = resp.read()
            break
        except urllib.error.HTTPError as e:
            code = e.code
            try:
                detail = json.loads(e.read()).get('detail', {})
            except Exception:
                detail = {}
            status = detail.get('status') if isinstance(detail, dict) else None
            if code == 401 and status == 'quota_exceeded':
                raise QuotaExceeded('elevenlabs quota_exceeded')
            if code == 429 or code >= 500:
                if attempt < 3:
                    time.sleep(2 * 2 ** attempt); continue
                raise TTSFailed(f'HTTP {code} {status or ""}'.strip())
            raise TTSFailed(f'HTTP {code} {status or ""}'.strip())
        except (OSError, http.client.HTTPException) as e:
            # OSError 含 URLError / 超时 / 连接被重置；HTTPException 含 RemoteDisconnected / IncompleteRead。
            if attempt < 3:
                time.sleep(2 * 2 ** attempt); continue
            raise TTSFailed(f'network: {type(e).__name__}')
    if raw is None:
        raise TTSFailed('exhausted retries')
    try:
        data = json.loads(raw)
        audio = base64.b64decode(data['audio_base64'], validate=True)
        words = words_from_alignment(data['alignment'], lang)
    except Exception as e:
        raise TTSFailed(f'bad response body: {type(e).__name__}')
    open(mp3, 'wb').write(audio)
    json.dump(words, open(js, 'w'), ensure_ascii=False)
    return mp3, words


def even_alignment(text, dur):
    """没有时间戳的引擎：造一份 words_from_alignment() 认的逐字符对齐，非空白字符在 [0, dur] 内均分时长。
    ponytail: 按字符数均分，字幕在句内可能略漂；要更准就上强制对齐（forced alignment）。"""
    n = sum(1 for c in text if not c.isspace()) or 1
    step = dur / n
    starts, ends, t = [], [], 0.0
    for c in text:
        starts.append(t)
        if not c.isspace():
            t += step
        ends.append(t)
    return {'characters': list(text), 'character_start_times_seconds': starts, 'character_end_times_seconds': ends}


def read_audio_stream(resp):
    """OpenRouter SSE 流 -> pcm16 字节。流内 error 事件：402 -> QuotaExceeded，其它 -> TTSFailed。"""
    parts = []
    for line in resp:
        line = line.strip()
        if not line.startswith(b'data:'):
            continue   # 空行、": OPENROUTER PROCESSING" 注释
        data = line[5:].strip()
        if data == b'[DONE]':
            break
        try:
            ev = json.loads(data)
        except ValueError:
            raise TTSFailed('bad stream chunk')
        err = ev.get('error')
        if err:
            code = err.get('code') if isinstance(err, dict) else None
            if code == 402:
                raise QuotaExceeded('openrouter 402 insufficient credits')
            raise TTSFailed(f'stream error {code}')
        for ch in ev.get('choices') or []:
            audio = (ch.get('delta') or {}).get('audio') or {}
            if audio.get('data'):
                parts.append(base64.b64decode(audio['data']))
    pcm = b''.join(parts)
    pcm = pcm[:len(pcm) // 2 * 2]
    if not pcm:
        raise TTSFailed('no audio in response')
    return pcm


def synth_openrouter(text, api_key, lang):
    """一句 -> (wav 缓存路径, 词级边界列表)。命中缓存直接返回，不发请求。重试规则同 synth_elevenlabs；402 不重试。"""
    import wave
    wav = cache_path(text, '.wav'); js = cache_path(text, '.json')
    if os.path.exists(wav) and os.path.exists(js):
        return wav, json.load(open(js))
    body = json.dumps({'model': OPENROUTER_TTS_MODEL, 'modalities': ['text', 'audio'],
                       'audio': {'voice': OPENROUTER_TTS_VOICE, 'format': 'pcm16'}, 'stream': True,
                       'messages': [{'role': 'system', 'content': READ_ALOUD},
                                    {'role': 'user', 'content': f'<line>{text}</line>'}]}).encode('utf-8')
    headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
    nw = len(text.split())
    for take in range(OPENROUTER_TAKES):
        pcm = None
        for attempt in range(4):
            try:
                resp = urlopen(Request(OPENROUTER_URL, data=body, headers=headers, method='POST'), timeout=120)
                pcm = read_audio_stream(resp)
                break
            except urllib.error.HTTPError as e:
                if e.code == 402:
                    raise QuotaExceeded('openrouter 402 insufficient credits')
                if (e.code == 429 or e.code >= 500) and attempt < 3:
                    time.sleep(2 * 2 ** attempt); continue
                raise TTSFailed(f'HTTP {e.code}')
            except (OSError, http.client.HTTPException) as e:
                if attempt < 3:
                    time.sleep(2 * 2 ** attempt); continue
                raise TTSFailed(f'network: {type(e).__name__}')
        if pcm is None:
            raise TTSFailed('exhausted retries')
        dur = len(pcm) / 2 / OPENROUTER_SR
        if lang != 'en' or dur <= 0.6 * nw + 1.5:
            break
    else:
        raise TTSFailed(f'clip {dur:.1f}s too long for {nw} words, {OPENROUTER_TAKES} takes')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(OPENROUTER_SR)
        w.writeframes(pcm)
    words = words_from_alignment(even_alignment(text, len(pcm) / 2 / OPENROUTER_SR), lang)
    json.dump(words, open(js, 'w'), ensure_ascii=False)
    return wav, words


def decode(mp3):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).copy()


def trim_edges(x, thr=0.004):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x, 0.0
    a = max(0, idx[0] - int(0.03 * SR)); b = min(len(x), idx[-1] + int(0.12 * SR))
    return x[a:b], a / SR


def chunk_starts(tts_text, chunks, words, lead_cut, dur, sep=''):
    """按 | 切出的字幕短句 → 每块在句内的起始秒。word 边界按字符游标对到原句。
    tts_text == sep.join(chunks)：英文 sep=' '，游标要跳过块间的那个空格。"""
    char_t = [None] * len(tts_text)
    cur = 0
    for w in words:
        wt = re.sub(r'[\s，。、！？：；“”（）,.!?:;()\-—…]', '', w['text'])
        if not wt:
            continue
        p = tts_text.find(wt, cur)
        if p < 0:
            p = tts_text.find(wt[0], cur)
            if p < 0:
                continue
        for i in range(p, min(len(tts_text), p + len(wt))):
            char_t[i] = (w['t'] - lead_cut, w['d'])
        cur = p + len(wt)
    starts = []
    pos = 0
    for c in chunks:
        seg = tts_text[pos:pos + len(c)]
        st = None
        for i in range(pos, pos + len(c)):
            if char_t[i] is not None:
                st = char_t[i][0]; break
        starts.append(st)
        pos += len(c) + len(sep)
    for i, st in enumerate(starts):
        if st is None:
            prev = starts[i - 1] if i > 0 and starts[i - 1] is not None else 0.0
            starts[i] = prev + dur * len(chunks[i - 1]) / max(1, len(tts_text)) if i > 0 else 0.0
    starts[0] = 0.0
    return [max(0.0, s) for s in starts]


def synth_sentence(chunks, sep, lang, api_key):
    """一句 → (音频 float32 单声道, 每个字幕块在句内的起始秒, 句长秒)。"""
    text = sep.join(chunks)
    synth = synth_openrouter if ENGINE == 'openrouter' else synth_elevenlabs
    clip, words = synth(text, api_key, lang)
    try:
        pcm = decode(clip)
    except (subprocess.CalledProcessError, OSError) as e:
        # 坏音频别留在缓存里，重跑才会重新合成。
        for p in (clip, cache_path(text, '.json')):
            try:
                os.remove(p)
            except OSError:
                pass
        raise TTSFailed(f'ffmpeg decode failed: {type(e).__name__}')
    x, lead_cut = trim_edges(pcm)
    dur = len(x) / SR
    return x, chunk_starts(text, chunks, words, lead_cut, dur, sep), dur


def main(narr):
    if ENGINE not in ('elevenlabs', 'openrouter'):
        raise SetupError(f'unsupported TTS_ENGINE={ENGINE} (only elevenlabs, openrouter)')
    api_key = get_api_key()
    if not api_key:
        raise SetupError('voice key missing')
    if shutil.which('ffmpeg') is None:
        raise SetupError('ffmpeg missing')
    if not os.path.exists(narr):
        raise SetupError(f'narration not found: {narr}')
    items = parse(narr)
    if not any(it['type'] == 'sent' for it in items):
        raise SetupError('narration has no sentences')
    global ELEVENLABS_VOICE_ID
    if ENGINE == 'elevenlabs':
        ELEVENLABS_VOICE_ID = resolve_voice_id(ELEVENLABS_VOICE_ID, api_key)
    voice, model = voice_model()
    lang = detect_lang(items)
    if lang != CFG_LANG:
        print(f"⚠ src/config.ts 的 lang: '{CFG_LANG}' 与解说词语言 {lang} 不一致——改过来，"
              f"否则标题压窄与居中基线会按错的语言算")
    sep = ' ' if lang == 'en' else ''
    t = LEAD / FPS
    audio_parts = []  # (start_sec, np.array)
    sentences = []; chapters = []
    sid = 0
    total_chars = 0; total_words = 0; speech_sec = 0.0
    for it in items:
        if it['type'] == 'chapter':
            t += CHAPTER_GAP / FPS
            chapters.append({'n': it['chapter'], 'title': it['title'], 'from': int(round(t * FPS)) + 1})
            continue
        t += it['gap_before'] / FPS
        raw = it['raw']
        chunks = [c.strip() for c in raw.split('|') if c.strip()]
        if not chunks:
            continue
        tts_text = sep.join(chunks)
        x, starts, dur = synth_sentence(chunks, sep, lang, api_key)
        sid += 1
        subs = [(t + starts[i], t + (starts[i + 1] if i + 1 < len(starts) else dur)) for i in range(len(chunks))]
        f0 = int(round(t * FPS)) + 1; f1 = int(round((t + dur) * FPS))
        sentences.append({'id': f'S{sid:02d}', 'chapter': it['chapter'], 'from': f0, 'to': f1, 'text': tts_text, 'para': bool(it.get('para_end')),
                          'subs': [{'from': int(round(a * FPS)) + 1, 'to': int(round(b * FPS)), 'text': c} for c, (a, b) in zip(chunks, subs)]})
        audio_parts.append((t, x))
        total_chars += len(re.sub(r'[，。、！？：；“”（）,.!?:;()\-—…\s]', '', tts_text))
        total_words += len(tts_text.split()); speech_sec += dur
        t += dur + GAP / FPS
    t += TAIL / FPS
    total = int(np.ceil(t * FPS))
    y = np.zeros(int(total / FPS * SR) + SR, dtype=np.float32)
    for st, x in audio_parts:
        a = int(st * SR); y[a:a + len(x)] += x
    y = y[: int(total / FPS * SR)]
    peak = float(np.max(np.abs(y))) or 1.0
    y = y / peak * 0.89
    os.makedirs(f'{REM}/public/assets/{SLUG}', exist_ok=True)
    wav = f'{REM}/public/assets/{SLUG}/audio.wav'
    write_wav(wav, np.stack([y, y], 1), SR)
    all_subs = []
    for s in sentences:
        for k, sb in enumerate(s['subs']):
            if sb['to'] < sb['from']:
                sb['to'] = sb['from']
            all_subs.append(dict(sb))
    for i in range(len(all_subs) - 1):
        if all_subs[i]['to'] >= all_subs[i + 1]['from']:
            all_subs[i]['to'] = all_subs[i + 1]['from'] - 1
    over = [(sb, text_em(sb['text']) * SUB_SIZE) for sb in all_subs]
    over = [(sb, w) for sb, w in over if w > SUB_MAX_W]
    if over:
        print(f'⚠ {len(over)}/{len(all_subs)} 块字幕在 {SUB_SIZE}px 下超过安全区 {SUB_MAX_W}px'
              f'（会自动缩字号；建议每块 {SUB_BUDGET[lang]}，用 | 再切一刀）：')
        for sb, w in over[:5]:
            print(f"    f{sb['from']} (≈{w:.0f}px{'，会折两行' if w > SUB_MAX_W * 1.3 else ''}) {sb['text']}")
    tl = {'fps': FPS, 'total_frames': total, 'engine': ENGINE,
          'voice': voice, 'rate': model,
          'gap': GAP, 'para_gap': PARA_GAP, 'chapter_gap': CHAPTER_GAP, 'lead': LEAD, 'tail': TAIL,
          'lang': lang, 'chapters': chapters, 'sentences': sentences, 'chars': total_chars, 'words': total_words,
          'speech_sec': round(speech_sec, 2)}
    unit, cnt = ('字', total_chars) if lang == 'zh' else ('词', total_words)
    os.makedirs(f'{ROOT}/script', exist_ok=True)
    json.dump(tl, open(f'{ROOT}/script/timeline.json', 'w'), ensure_ascii=False, indent=1)
    with open(f'{ROOT}/script/timeline.md', 'w') as f:
        f.write(f"# 时间轴（{ENGINE} · {tl['voice']} {tl['rate']}，共 {total} 帧 = {total/FPS:.1f}s，{cnt} {unit}，语速 {cnt/max(1e-6,speech_sec):.2f} {unit}/s）\n\n")
        f.write('| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |\n|---|---|---|---|---|---|---|\n')
        for s in sentences:
            last = s['to'] - s['subs'][-1]['from'] + 1
            warn = '⚠' if s['para'] and last < SHORT_TAIL else ''
            f.write(f"| {s['id']} | {s['chapter']} | {s['from']}–{s['to']} | {(s['to']-s['from']+1)/FPS:.1f}s | {last}{warn} | {'¶' if s['para'] else ''} | {'｜'.join(sb['text'] for sb in s['subs'])} |\n")
        f.write('\n## 章节起始帧\n')
        for c in chapters:
            f.write(f"- 第{c['n']}章 {c['title']}：f{c['from']}\n")
        f.write(f'\n段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 {GAP} 帧，不停顿）。\n')
        f.write(f'末块 = 末尾字幕块的帧数（段末句 ⚠ <{SHORT_TAIL}：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。\n')
    short = [(s['id'], s['to'] - s['subs'][-1]['from'] + 1) for s in sentences if s['para'] and s['to'] - s['subs'][-1]['from'] + 1 < SHORT_TAIL]
    paras = sum(1 for s in sentences if s['para'])
    if short:
        print(f'⚠ {len(short)}/{paras} 个段末句的末块 <{SHORT_TAIL} 帧（末拍元素落位后停不满 30 帧）：' + ' '.join(f'{i}({n})' for i, n in short))
        print('    → 在这些句后加 `## gap 15–30` 重跑（不改词、缓存命中），或分镜时把末拍元素前挂到上一块')
    print(f'{len(sentences)} 句分成 {paras} 段（空行分段 → 每段一个镜头；段末停 {GAP + PARA_GAP} 帧，段内 {GAP} 帧）')
    print(f'成片 {total/FPS:.1f}s，其中纯语音 {speech_sec:.1f}s（段末与章前留白是停留预算，成片比语音长 {(total/FPS/max(speech_sec,1e-6)-1)*100:.0f}% 属正常）')

    def lit(s):
        return json.dumps(s, ensure_ascii=False)
    with open(f'{REM}/src/common/subs.ts', 'w') as f:
        f.write('// 自动生成：scripts/tts_build.py（词级时间戳 → 字幕块）。手改请改 script/narration.txt 后重跑。\n')
        f.write("export type SubEntry = {from: number; to: number; text: string};\nexport const SUBS: SubEntry[] = [\n")
        for sb in all_subs:
            f.write(f"  {{from: {sb['from']}, to: {sb['to']}, text: {lit(sb['text'])}}},\n")
        f.write('];\n')
    with open(f'{REM}/src/common/timeline.ts', 'w') as f:
        f.write('// 自动生成：scripts/tts_build.py。帧号 1 起含端点。\n')
        f.write(f'export const TOTAL_FRAMES = {total};\n')
        f.write('export const CHAPTER_STARTS: Array<{n: number; title: string; from: number}> = [\n')
        for c in chapters:
            f.write(f"  {{n: {c['n']}, title: {lit(c['title'])}, from: {c['from']}}},\n")
        f.write('];\n')
        f.write('export type Sentence = {id: string; chapter: number; from: number; to: number; text: string};\n')
        f.write('export const SENTENCES: Sentence[] = [\n')
        for s in sentences:
            f.write(f"  {{id: {lit(s['id'])}, chapter: {s['chapter']}, from: {s['from']}, to: {s['to']}, text: {lit(s['text'])}}},\n")
        f.write('];\n')
    print(f'lang={lang} engine={ENGINE} voice={tl["voice"]} total_frames={total} ({total/FPS:.1f}s) '
          f'sentences={len(sentences)} {"chars" if lang == "zh" else "words"}={cnt} speech={speech_sec:.1f}s '
          f'rate={cnt/max(1e-6,speech_sec):.2f} {unit}/s')
    for c in chapters:
        print(f"  chapter {c['n']} {c['title']} from f{c['from']}")


def result_for(exc):
    """异常 -> (exit_code, TTS_RESULT word)。run() 与 selftest_tts.py 共用同一张表。"""
    if isinstance(exc, SetupError):
        return 2, 'setup'
    if isinstance(exc, QuotaExceeded):
        return 3, 'out_of_characters'
    if isinstance(exc, TTSFailed):
        return 4, 'failed'
    raise exc


def run(narr):
    """main() 的退出码/落地包装：0 ok / 2 setup / 3 out_of_characters / 4 failed，最后一行印 TTS_RESULT <word>。"""
    try:
        main(narr)
    except (SetupError, QuotaExceeded, TTSFailed) as e:
        code, word = result_for(e)
        print(str(e), file=sys.stderr)
        print(f'TTS_RESULT {word}')
        return code
    except Exception as e:
        # 意外异常：只印类名，消息里可能带请求头或响应体。
        print(f'unexpected error: {type(e).__name__}', file=sys.stderr)
        print('TTS_RESULT failed')
        return 4
    print('TTS_RESULT ok')
    return 0


if __name__ == '__main__':
    sys.exit(run(sys.argv[1] if len(sys.argv) > 1 else f'{ROOT}/script/narration.txt'))
