from pathlib import Path
import base64

OUT = Path(__file__).parent

defs = '''<defs>
<filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="8" dy="13" stdDeviation="8" flood-color="#16151f" flood-opacity=".27"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".09"/></feComponentTransfer></filter>
<linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f5c9a5"/><stop offset="1" stop-color="#bb7560"/></linearGradient>
<linearGradient id="robe" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#62b7d2"/><stop offset="1" stop-color="#316591"/></linearGradient>
<symbol id="hero" viewBox="0 0 360 520">
<g filter="url(#shadow)"><path d="M41 504 30 428 40 358 54 317 91 291 109 265 98 234 101 156 120 102 143 76 158 44 210 34 252 53 281 90 282 142 277 184 273 230 257 273 280 288 321 317 339 376 343 502Z" fill="#fff" stroke="#fff" stroke-width="24" stroke-linejoin="round"/>
<path d="M48 510 36 410 51 348Q63 303 122 289L145 267H246L279 292Q319 309 330 354L343 510Z" fill="url(#robe)" stroke="#202939" stroke-width="5"/>
<path d="M130 282Q174 314 246 278L229 343 173 376 119 338Z" fill="#f8eee0" stroke="#202939" stroke-width="4"/>
<path d="M173 287 165 250 236 241 236 288Q208 321 173 287Z" fill="url(#skin)" stroke="#613c3d" stroke-width="3"/>
<path d="M102 157Q100 82 165 59Q241 24 280 99L280 195Q266 270 214 288Q162 287 125 235Z" fill="url(#skin)" stroke="#673d3d" stroke-width="5"/>
<path d="M100 146Q107 58 186 42Q263 42 278 106L271 156Q255 128 240 124Q199 136 170 114Q145 154 106 164Z" fill="#302734" stroke="#302734" stroke-width="7"/>
<path d="M105 141Q102 93 149 61M154 60Q189 38 229 58M235 64Q274 81 276 132" fill="none" stroke="#5d4850" stroke-width="11" stroke-linecap="round"/>
<path d="M112 190Q92 172 99 211Q103 235 122 230M272 185Q293 172 286 211Q282 229 267 229" fill="url(#skin)" stroke="#673d3d" stroke-width="4"/>
<path d="M125 215Q129 275 187 296Q235 313 267 245L254 230Q245 271 205 270Q165 275 145 233Z" fill="#3c2d32"/>
<path d="M141 202Q156 190 177 199M214 198Q236 188 252 201" fill="none" stroke="#342a32" stroke-width="8" stroke-linecap="round"/>
<ellipse cx="161" cy="211" rx="7" ry="5" fill="#202533"/><ellipse cx="231" cy="210" rx="7" ry="5" fill="#202533"/>
<path d="M194 207 188 238 204 240" fill="none" stroke="#925d55" stroke-width="4" stroke-linecap="round"/>
<path d="M175 252Q198 261 220 250" fill="none" stroke="#d38a76" stroke-width="4" stroke-linecap="round"/>
<path d="M98 159Q187 116 276 154" fill="none" stroke="#f0cf75" stroke-width="17"/>
<path d="M141 157Q193 141 247 153" fill="none" stroke="#9a6b45" stroke-width="3" stroke-dasharray="7 7"/>
<path d="M96 348Q104 377 91 451L88 502M290 346Q277 391 299 501" fill="none" stroke="#254d70" stroke-width="18" stroke-linecap="round"/>
<path d="M120 340 178 374 237 341" fill="none" stroke="#d9bc9e" stroke-width="8"/>
</g></symbol>
<symbol id="cyclops" viewBox="0 0 330 490">
<g filter="url(#shadow)"><path d="M23 475 20 358 43 294 82 267 70 221 70 108 103 60 147 34 221 38 271 74 288 139 279 232 257 273 290 296 309 357 314 475Z" fill="#fff" stroke="#fff" stroke-width="23" stroke-linejoin="round"/>
<path d="M27 490 24 361Q40 293 111 273L238 274Q300 293 309 365L316 490Z" fill="#e78272" stroke="#5d3650" stroke-width="5"/>
<path d="M78 149Q67 75 148 45Q249 28 279 115L273 209Q251 275 191 291Q118 289 85 234Z" fill="#a99bc1" stroke="#584763" stroke-width="5"/>
<path d="M76 155Q69 81 126 58Q204 15 266 80L279 138Q249 116 216 115Q160 137 111 120Z" fill="#423c50"/>
<path d="M111 167Q165 132 229 170L226 204Q176 227 116 199Z" fill="#fff9e9" stroke="#514963" stroke-width="7"/>
<ellipse cx="172" cy="183" rx="28" ry="31" fill="#78a6bb" stroke="#4b586a" stroke-width="5"/><ellipse cx="174" cy="183" rx="12" ry="20" fill="#232d43"/><circle cx="164" cy="175" r="6" fill="white"/>
<path d="M157 219 150 245 173 250M138 263Q179 284 223 257" fill="none" stroke="#695671" stroke-width="6" stroke-linecap="round"/>
<path d="M78 150Q55 137 66 188Q70 211 84 212M274 150Q301 140 291 187Q288 209 275 213" fill="#a99bc1" stroke="#584763" stroke-width="5"/>
<path d="M97 309Q159 333 238 303" fill="none" stroke="#f5d8b4" stroke-width="14" stroke-dasharray="26 10"/>
</g></symbol>
<symbol id="ship" viewBox="0 0 240 160"><path d="M22 95H221L191 130Q114 161 51 130Z" fill="#28374e" stroke="#fff" stroke-width="10" stroke-linejoin="round"/><path d="M119 85V17M119 22 191 86H119Z" fill="#f6e4bd" stroke="#fff" stroke-width="8" stroke-linejoin="round"/><path d="M34 149q30-14 59 0t59 0 59 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></symbol>
</defs>'''

def page(name, body):
    html = f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LearnLoop {name}</title><style>html,body{{margin:0;width:100%;height:100%;background:#17171c;display:grid;place-items:center}}svg{{width:min(100vw,177.777vh);height:auto;max-height:100vh;display:block}}</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="LearnLoop design option {name}">{defs}{body}</svg></html>'''
    (OUT / f'{name}.html').write_text(html)

brand = '<g font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="23" letter-spacing="-1"><text x="0" y="0">LEARN</text><text x="86" y="0" fill="#ffcf6c">LOOP</text></g>'

page('A', f'''<rect width="1280" height="720" fill="#303138"/><rect width="1280" height="720" filter="url(#grain)" opacity=".36"/>
<g transform="translate(46 57)" fill="white">{brand}</g>
<text x="1040" y="76" fill="#eceae4" font-family="Arial" font-size="20" font-weight="bold" letter-spacing="3">THE ODYSSEY / 01</text>
<use href="#hero" x="42" y="147" width="455" height="640"/>
<use href="#cyclops" x="885" y="173" width="390" height="580"/>
<path d="M465 125h376q34 0 34 33v191q0 33-34 33H627l-53 56-5-56H465q-34 0-34-33V158q0-33 34-33Z" fill="#fffdf8" filter="url(#shadow)"/>
<text x="653" y="188" fill="#272830" font-family="Arial" font-size="26" font-weight="bold" text-anchor="middle">A quick trip home?</text>
<text x="653" y="251" fill="#e45767" font-family="Arial" font-size="69" font-weight="1000" text-anchor="middle" letter-spacing="-4">10 YEARS.</text>
<path d="M507 289h296" stroke="#272830" stroke-width="3" stroke-dasharray="7 9"/>
<text x="653" y="334" fill="#272830" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle">Odysseus had other plans.</text>
<g transform="rotate(-8 620 581)"><rect x="445" y="514" width="381" height="119" rx="13" fill="#fbd379" stroke="#fff" stroke-width="11" filter="url(#shadow)"/><text x="637" y="568" text-anchor="middle" fill="#272830" font-family="Arial" font-weight="1000" font-size="44">THE ODYSSEY</text><text x="637" y="604" text-anchor="middle" fill="#272830" font-family="Arial" font-weight="700" font-size="20" letter-spacing="2">A TEN-YEAR TRIP HOME</text></g>
<path d="M790 463q80-92 137-49" fill="none" stroke="#fbd379" stroke-width="7" stroke-linecap="round" stroke-dasharray="9 15"/><path d="m921 398 17 19-27 5" fill="none" stroke="#fbd379" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>''')

page('B', f'''<rect width="1280" height="720" fill="#cf7d9d"/><path d="M0 113Q472 65 1280 94V0H0Z" fill="#da8fa9" opacity=".45"/><rect width="1280" height="720" filter="url(#grain)" opacity=".52"/>
<g transform="translate(58 60)" fill="white">{brand}</g>
<path d="M699 52 1228 64 1219 488 699 465Z" fill="#f7e8e5" opacity=".26"/>
<text x="60" y="170" fill="#fff" font-family="Arial" font-size="44" font-weight="900" letter-spacing="-1">HE JUST WANTED</text>
<text x="52" y="268" fill="#fff" font-family="Arial" font-size="113" font-weight="1000" letter-spacing="-7">TO GO</text>
<text x="58" y="365" fill="#fff" font-family="Arial" font-size="113" font-weight="1000" letter-spacing="-7">HOME.</text>
<g transform="rotate(-5 340 552)"><rect x="51" y="432" width="566" height="108" rx="9" fill="#f9cf79" stroke="#fff" stroke-width="10" filter="url(#shadow)"/><text x="334" y="503" fill="#2e2b37" text-anchor="middle" font-family="Arial" font-size="59" font-weight="1000" letter-spacing="-3">THE ODYSSEY</text></g>
<use href="#hero" x="718" y="143" width="370" height="535" transform="rotate(5 902 410)"/>
<use href="#cyclops" x="1012" y="327" width="211" height="312" transform="rotate(-11 1118 482)"/>
<g transform="rotate(7 720 556)"><rect x="579" y="554" width="295" height="65" rx="32" fill="#fdfcf8" filter="url(#shadow)"/><text x="727" y="597" text-anchor="middle" fill="#293044" font-family="Arial" font-size="27" font-weight="900">"ONE MORE STOP"</text></g>
<path d="M1125 142q97 32 69 125t-95 64" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-dasharray="5 18"/><path d="m1116 311-24 22 31 11" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<use href="#ship" x="582" y="240" width="174" height="116" transform="rotate(-12 667 298)"/>
<text x="60" y="662" fill="#fff" font-family="Arial" font-size="23" font-weight="bold" letter-spacing="3">AN ANCIENT STORY. A VERY MODERN DETOUR.</text>''')

page('C', f'''<rect width="1280" height="720" fill="#b8cfe4"/><rect width="1280" height="720" filter="url(#grain)" opacity=".35"/>
<path d="M0 0h1280v96H0Z" fill="#9dbad4" opacity=".52"/><g transform="translate(53 59)" fill="#243d59">{brand}</g>
<path d="M47 134h583v520H47Z" fill="#f6f0e5" stroke="#fff" stroke-width="11" transform="rotate(-2 338 394)" filter="url(#shadow)"/>
<text x="89" y="206" fill="#304660" font-family="Arial" font-size="26" font-weight="900" letter-spacing="4">FILE 001 / LOST AT SEA</text>
<text x="83" y="305" fill="#213951" font-family="Arial" font-size="83" font-weight="1000" letter-spacing="-5">THE</text>
<text x="81" y="393" fill="#213951" font-family="Arial" font-size="83" font-weight="1000" letter-spacing="-5">ODYSSEY</text>
<path d="M96 430h478" stroke="#d17491" stroke-width="8" stroke-linecap="round"/>
<text x="94" y="488" fill="#304660" font-family="Arial" font-size="30" font-weight="700">One hero. Ten years.</text>
<text x="94" y="529" fill="#304660" font-family="Arial" font-size="30" font-weight="700">A very long way home.</text>
<g transform="rotate(-7 259 583)"><rect x="87" y="558" width="333" height="61" rx="30" fill="#f3aec2" stroke="#fff" stroke-width="8"/><text x="254" y="600" text-anchor="middle" fill="#263a54" font-family="Arial" font-size="25" font-weight="900">THE STORY, EXPLAINED</text></g>
<path d="M680 655Q750 545 826 554t84-127 155-114" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-dasharray="2 27"/>
<use href="#hero" x="718" y="95" width="475" height="666"/>
<g transform="rotate(8 790 273)"><path d="M635 163h232q22 0 22 22v96q0 22-22 22H764l-35 39-2-39h-92q-22 0-22-22v-96q0-22 22-22Z" fill="#fffdf8" filter="url(#shadow)"/><text x="750" y="216" text-anchor="middle" fill="#263a54" font-family="Arial" font-size="26" font-weight="900">I'M ALMOST</text><text x="750" y="252" text-anchor="middle" fill="#263a54" font-family="Arial" font-size="26" font-weight="900">HOME...</text></g>
<use href="#ship" x="1088" y="536" width="155" height="103" transform="rotate(8 1165 587)"/>
<text x="940" y="58" fill="#243d59" font-family="Arial" font-size="20" font-weight="bold" letter-spacing="3">LEARNLOOP ORIGINALS</text>''')

# Photographs of public-domain ancient objects from The Metropolitan Museum of Art.
# The pictured heads are visual stand-ins, not historical portraits of Odysseus.
head = base64.b64encode((OUT / '255427.jpg').read_bytes()).decode()
actor = base64.b64encode((OUT / '248775.jpg').read_bytes()).decode()
head_path = 'M70 62Q114 10 224 13Q347 10 411 73L443 174 450 261 437 354 409 442 369 508 297 567 229 605 174 574 114 533 61 462 26 382 15 277 31 172Z'
head_sticker = f'''<g transform="translate(752 70) scale(.91)" filter="url(#shadow)"><path d="{head_path}" fill="white" stroke="white" stroke-width="27" stroke-linejoin="round"/><clipPath id="headCut"><path d="{head_path}"/></clipPath><image href="data:image/jpeg;base64,{head}" width="456" height="625" clip-path="url(#headCut)"/><path d="{head_path}" fill="none" stroke="#fff" stroke-width="15" stroke-linejoin="round"/></g>'''

page('P1', f'''<rect width="1280" height="720" fill="#dc789d"/><path d="M0 0h1280v720H0Z" filter="url(#grain)" opacity=".34"/>
<path d="M32 34h1216v650H32Z" fill="none" stroke="#f9d2dd" stroke-width="2" opacity=".65"/>
<circle cx="1161" cy="94" r="42" fill="#f8d26e"/><path d="M1144 85a22 22 0 1 1-5 27m-4 0 1-18 17 8" fill="none" stroke="#243347" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<g transform="translate(56 61)" fill="white">{brand}</g>
<text x="61" y="165" fill="#25334a" font-family="Arial" font-size="29" font-weight="900" letter-spacing="3">STORY 01 / THE ODYSSEY</text>
<text x="48" y="273" fill="#fff" font-family="Arial" font-size="98" font-weight="1000" letter-spacing="-6">TEN YEARS.</text>
<text x="52" y="375" fill="#fff" font-family="Arial" font-size="83" font-weight="1000" letter-spacing="-5">ONE WAY</text>
<text x="50" y="473" fill="#fff" font-family="Arial" font-size="95" font-weight="1000" letter-spacing="-6">HOME.</text>
<path d="M71 501h527" stroke="#f8d26e" stroke-width="12" stroke-linecap="round"/>
<g transform="rotate(-5 331 597)"><rect x="72" y="543" width="520" height="89" rx="9" fill="#223b55" stroke="white" stroke-width="8" filter="url(#shadow)"/><text x="333" y="599" text-anchor="middle" fill="#fff9ed" font-family="Arial" font-size="38" font-weight="900">A VERY LONG DETOUR</text></g>
{head_sticker}
<g transform="rotate(7 896 562)"><rect x="659" y="515" width="325" height="91" rx="45" fill="#fffdf6" filter="url(#shadow)"/><text x="822" y="557" text-anchor="middle" fill="#273448" font-family="Arial" font-size="24" font-weight="900">"I'LL BE BACK SOON"</text><text x="822" y="583" text-anchor="middle" fill="#dc789d" font-family="Arial" font-size="17" font-weight="900">— FAMOUS LAST WORDS</text></g>
<use href="#ship" x="1116" y="524" width="131" height="87" transform="rotate(13 1181 567)"/>
<text x="1024" y="668" fill="#fff" font-family="Arial" font-size="15" letter-spacing="2">ANCIENT OBJECT: THE MET</text>''')

page('P2', f'''<rect width="1280" height="720" fill="#e18caa"/><rect width="1280" height="720" filter="url(#grain)" opacity=".33"/>
<path d="M0 0h1280v88H0Z" fill="#263b58"/><g transform="translate(54 57)" fill="white">{brand}</g>
<text x="951" y="55" fill="#f9d477" font-family="Arial" font-size="17" font-weight="900" letter-spacing="3">LOOP FILES / 001</text>
<text x="59" y="191" fill="#263b58" font-family="Arial" font-size="91" font-weight="1000" letter-spacing="-6">THE</text>
<text x="53" y="288" fill="#263b58" font-family="Arial" font-size="91" font-weight="1000" letter-spacing="-6">ODYSSEY</text>
<text x="63" y="351" fill="#fff" font-family="Arial" font-size="35" font-weight="900">A TEN-YEAR TRIP HOME</text>
<path d="M67 389Q170 363 255 412t177 16 156 46" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="2 19"/>
<circle cx="67" cy="389" r="13" fill="#f8d477" stroke="#fff" stroke-width="5"/><circle cx="588" cy="474" r="13" fill="#f8d477" stroke="#fff" stroke-width="5"/>
<g transform="rotate(-4 319 562)"><rect x="71" y="491" width="508" height="142" rx="8" fill="#f8efdf" stroke="#fff" stroke-width="8" filter="url(#shadow)"/><text x="101" y="547" fill="#263b58" font-family="Arial" font-size="25" font-weight="900">THE PLOT, IN ONE LINE</text><text x="101" y="593" fill="#263b58" font-family="Arial" font-size="34" font-weight="900">One more stop. Again.</text></g>
<g transform="rotate(4 963 395)" filter="url(#shadow)"><rect x="678" y="115" width="560" height="554" fill="#f7efe4" stroke="#fff" stroke-width="13"/><image href="data:image/jpeg;base64,{head}" x="700" y="133" width="516" height="479" preserveAspectRatio="xMidYMid slice"/><rect x="700" y="595" width="516" height="52" fill="#f8d477"/><text x="720" y="628" fill="#263b58" font-family="Arial" font-size="22" font-weight="900" letter-spacing="2">ANCIENT FACE, MODERN PROBLEM</text></g>
<g transform="rotate(-7 1070 142)"><rect x="994" y="96" width="156" height="75" rx="37" fill="#fff" stroke="#263b58" stroke-width="5"/><text x="1072" y="145" text-anchor="middle" fill="#263b58" font-family="Arial" font-size="31" font-weight="1000">10Y</text></g>
<text x="58" y="685" fill="#fff" font-family="Arial" font-size="16" letter-spacing="2">PHOTO: THE MET / GRAPHICS: LEARNLOOP</text>''')

winds = base64.b64encode((OUT / '818319.jpg').read_bytes()).decode()
circe = base64.b64encode((OUT / '253627.jpg').read_bytes()).decode()

page('S2', f'''<rect width="1280" height="720" fill="#25507f"/><rect width="1280" height="720" filter="url(#grain)" opacity=".34"/>
<path d="M0 0h1280v91H0Z" fill="#203954"/><g transform="translate(54 58)" fill="white">{brand}</g>
<circle cx="1181" cy="47" r="26" fill="#fbd171"/><path d="M1170 42a15 15 0 1 1-3 18m-2 0 1-11 11 5" fill="none" stroke="#203954" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<text x="53" y="160" fill="#fbd171" font-family="Arial" font-size="25" font-weight="900" letter-spacing="3">CHAPTER 02 / STOPS AT SEA</text>
<text x="45" y="260" fill="#fff" font-family="Arial" font-size="75" font-weight="1000" letter-spacing="-5">ALMOST</text>
<text x="46" y="345" fill="#fff" font-family="Arial" font-size="75" font-weight="1000" letter-spacing="-5">HOME.</text>
<g transform="rotate(-3 277 467)"><rect x="54" y="394" width="444" height="108" rx="10" fill="#fbd171" stroke="#fff" stroke-width="9" filter="url(#shadow)"/><text x="277" y="462" text-anchor="middle" fill="#203954" font-family="Arial" font-size="46" font-weight="1000">RECALCULATING</text></g>
<g filter="url(#shadow)"><rect x="55" y="546" width="499" height="110" rx="18" fill="#f5f5ef"/><circle cx="95" cy="581" r="12" fill="#ed7c9e"/><text x="124" y="589" fill="#203954" font-family="Arial" font-size="25" font-weight="900">ITHACA WAS IN SIGHT</text><path d="M79 613h454" stroke="#d1d9df" stroke-width="3"/><text x="81" y="641" fill="#25507f" font-family="Arial" font-size="21" font-weight="700">9 days forward  →  back to start</text></g>
<g transform="rotate(5 912 394)" filter="url(#shadow)"><rect x="626" y="109" width="544" height="556" fill="#fffaf1" stroke="#fff" stroke-width="12"/><image href="data:image/jpeg;base64,{winds}" x="647" y="130" width="502" height="490" preserveAspectRatio="xMidYMid slice"/><rect x="646" y="594" width="503" height="49" fill="#fbd171"/><text x="666" y="627" fill="#203954" font-family="Arial" font-size="20" font-weight="900" letter-spacing="2">THE WIND BAG / IN HOMER</text></g>
<path d="M582 387q71-89 154-66" fill="none" stroke="#fbd171" stroke-width="8" stroke-linecap="round" stroke-dasharray="4 18"/><path d="m721 305 28 15-27 14" fill="none" stroke="#fbd171" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<text x="55" y="692" fill="#fff" font-family="Arial" font-size="16" letter-spacing="2">ART: THE MET / ROUTE & JOKE: LEARNLOOP</text>''')

page('S3', f'''<rect width="1280" height="720" fill="#c9dfd6"/><rect width="1280" height="720" filter="url(#grain)" opacity=".38"/>
<path d="M0 0h1280v90H0Z" fill="#24475c"/><g transform="translate(54 58)" fill="white">{brand}</g>
<circle cx="1181" cy="47" r="26" fill="#fbd171"/><path d="M1170 42a15 15 0 1 1-3 18m-2 0 1-11 11 5" fill="none" stroke="#203954" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<g transform="rotate(-4 326 394)" filter="url(#shadow)"><rect x="73" y="117" width="510" height="542" fill="#fffaf0" stroke="#fff" stroke-width="12"/><image href="data:image/jpeg;base64,{circe}" x="94" y="138" width="468" height="467" preserveAspectRatio="xMidYMid meet"/><rect x="93" y="597" width="469" height="44" fill="#fbd171"/><text x="111" y="626" fill="#24475c" font-family="Arial" font-size="19" font-weight="900" letter-spacing="2">CIRCE / IN HOMER</text></g>
<text x="640" y="202" fill="#24475c" font-family="Arial" font-size="25" font-weight="900" letter-spacing="3">ONE MORE ISLAND</text>
<text x="631" y="299" fill="#24475c" font-family="Arial" font-size="75" font-weight="1000" letter-spacing="-5">NEW BODY.</text>
<text x="633" y="381" fill="#24475c" font-family="Arial" font-size="75" font-weight="1000" letter-spacing="-5">SAME BRAIN.</text>
<path d="M643 402h542" stroke="#e8809c" stroke-width="12" stroke-linecap="round"/>
<g transform="rotate(5 903 505)"><rect x="651" y="448" width="503" height="123" rx="21" fill="#fffdf6" filter="url(#shadow)"/><circle cx="703" cy="507" r="24" fill="#e8809c"/><path d="M690 507q13 18 26 0M694 501h2m16 0h2" fill="none" stroke="#24475c" stroke-width="5" stroke-linecap="round"/><text x="750" y="497" fill="#24475c" font-family="Arial" font-size="24" font-weight="900">CREW UPDATE</text><text x="750" y="538" fill="#24475c" font-family="Arial" font-size="30" font-weight="1000">HUMANS → PIGS</text></g>
<g transform="rotate(-6 1046 637)"><rect x="897" y="593" width="288" height="71" rx="35" fill="#fbd171" stroke="#fff" stroke-width="8"/><text x="1041" y="639" text-anchor="middle" fill="#24475c" font-family="Arial" font-size="26" font-weight="900">1 YEAR LATER</text></g>
<text x="614" y="689" fill="#24475c" font-family="Arial" font-size="16" letter-spacing="2">OBJECT: THE MET / MEME: LEARNLOOP</text>''')
