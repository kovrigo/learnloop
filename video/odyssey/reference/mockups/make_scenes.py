from pathlib import Path
import base64
from make_revised import defs

out = Path(__file__).parent
def photo(name):
    return base64.b64encode((out / name).read_bytes()).decode()

head = photo('255427.jpg')
girl = photo('249052.jpg')
zeus = photo('zeus.jpg')

extra = f'''<defs>
<clipPath id="manHead"><path d="M70 62Q114 10 224 13Q347 10 411 73L443 174 450 261 437 354 409 442 369 508 297 567 229 605 174 574 114 533 61 462 26 382 15 277 31 172Z"/></clipPath>
<clipPath id="womanHead"><path d="M168 101Q223 67 293 83Q383 83 422 149L441 248 416 353 378 449 338 548 269 585 207 553 157 470 116 354 117 222Z"/></clipPath>
<clipPath id="giantHead"><path d="M101 24Q189 -12 293 20Q401 34 447 134L454 242 422 347 366 456 262 559 181 548 89 476 22 350 9 223 48 97Z"/></clipPath>
<symbol id="paperHero" viewBox="0 0 380 540"><g filter="url(#shadow)">
<path d="M23 540 35 391 60 320 113 289 123 237 271 233 286 283 329 311 363 387 377 540Z" fill="#fff" stroke="#fff" stroke-width="25" stroke-linejoin="round"/>
<path d="M34 550 42 378Q53 320 118 283L270 279Q338 316 355 385L373 550Z" fill="#4c8aac" stroke="#193650" stroke-width="5"/>
<path d="M99 291 191 357 281 288 257 429 128 429Z" fill="#f0e3cd" stroke="#193650" stroke-width="5"/>
<path d="M38 361Q15 391 0 483L38 500 76 410M340 349q43 48 37 146l-41 11-29-89" fill="#e4b89b" stroke="#193650" stroke-width="6"/>
<path d="M53 498q-23-14-31-1t18 24l26 4" fill="#e4b89b" stroke="#193650" stroke-width="5"/>
<path d="M337 499q28-18 41-3t-20 28l-29 3" fill="#e4b89b" stroke="#193650" stroke-width="5"/>
<path d="M120 238h151v55l-73 46-78-48Z" fill="#dbc0a0"/>
<svg x="79" y="-4" width="225" height="303" viewBox="0 0 456 625"><path d="M70 62Q114 10 224 13Q347 10 411 73L443 174 450 261 437 354 409 442 369 508 297 567 229 605 174 574 114 533 61 462 26 382 15 277 31 172Z" fill="white" stroke="white" stroke-width="29" stroke-linejoin="bevel"/><image href="data:image/jpeg;base64,{head}" width="456" height="625" clip-path="url(#manHead)"/></svg>
</g></symbol>
<symbol id="paperPenelope" viewBox="0 0 380 540"><g filter="url(#shadow)">
<path d="M18 540 35 359 85 293 126 269 139 239 264 243 279 274 327 303 360 381 378 540Z" fill="white" stroke="white" stroke-width="24" stroke-linejoin="round"/>
<path d="M22 550 40 370Q62 297 131 268L263 266Q345 298 363 378L381 550Z" fill="#8c647b" stroke="#472e4c" stroke-width="5"/>
<path d="M135 268 194 330 259 270" fill="none" stroke="#f0cf9f" stroke-width="13"/>
<path d="M53 382 30 470 97 490M332 376l32 108-70 23" fill="none" stroke="#ddbfa7" stroke-width="32" stroke-linecap="round"/>
<svg x="77" y="-13" width="235" height="283" viewBox="0 0 545 625"><path d="M168 101Q223 67 293 83Q383 83 422 149L441 248 416 353 378 449 338 548 269 585 207 553 157 470 116 354 117 222Z" fill="white" stroke="white" stroke-width="36" stroke-linejoin="bevel"/><image href="data:image/jpeg;base64,{girl}" width="545" height="625" clip-path="url(#womanHead)"/></svg>
</g></symbol>
<symbol id="paperCyclops" viewBox="0 0 380 540"><g filter="url(#shadow)">
<path d="M19 540 34 369 79 302 125 278 130 237 266 238 281 273 335 306 364 389 379 540Z" fill="white" stroke="white" stroke-width="25" stroke-linejoin="bevel"/>
<path d="M26 548 37 386Q53 307 126 275H265Q349 312 362 390L380 548Z" fill="#bf7780" stroke="#553f59" stroke-width="5"/>
<path d="M117 302Q191 328 275 302" fill="none" stroke="#e7c89b" stroke-width="16" stroke-dasharray="29 11"/>
<svg x="70" y="0" width="240" height="303" viewBox="0 0 468 624"><path d="M101 24Q189 -12 293 20Q401 34 447 134L454 242 422 347 366 456 262 559 181 548 89 476 22 350 9 223 48 97Z" fill="white" stroke="white" stroke-width="27" stroke-linejoin="bevel"/><image href="data:image/jpeg;base64,{zeus}" width="468" height="624" clip-path="url(#giantHead)"/><path d="M66 215h342v166H66Z" fill="#41364a" stroke="#f9f4ea" stroke-width="10"/><ellipse cx="236" cy="300" rx="93" ry="63" fill="#f7f4e9"/><ellipse cx="236" cy="300" rx="46" ry="57" fill="#7295a1"/><ellipse cx="236" cy="300" rx="20" ry="43" fill="#25344b"/><circle cx="217" cy="278" r="13" fill="white"/></svg>
</g></symbol>
</defs>'''

def page(name, body):
    html = f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LearnLoop {name}</title><style>html,body{{margin:0;width:100%;height:100%;background:#111;display:grid;place-items:center}}svg{{width:min(100vw,177.777vh);height:auto;max-height:100vh;display:block}}</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="LearnLoop animated scene {name}">{defs}{extra}{body}</svg></html>'''
    (out / f'{name}.html').write_text(html)

tag = '<text x="42" y="47" fill="white" font-family="Arial" font-size="19" font-weight="900" letter-spacing="2">LEARNLOOP</text>'

page('V1', f'''<rect width="1280" height="720" fill="#d681a1"/><rect width="1280" height="720" filter="url(#grain)" opacity=".38"/>
<path d="M814 0Q1136 33 1280 101V720H898Q1021 550 850 406Q731 260 814 0Z" fill="#303039" opacity=".92"/>
<path d="M932 25Q1041 31 1109 131M957 498q89 49 159 163" fill="none" stroke="#685462" stroke-width="23" stroke-linecap="round" opacity=".55"/>
{tag}<text x="1093" y="47" fill="white" font-family="Arial" font-size="18" font-weight="900" letter-spacing="2">01 / CYCLOPS</text>
<use href="#paperHero" x="70" y="148" width="434" height="617" transform="rotate(-6 287 456)"/>
<use href="#paperCyclops" x="856" y="172" width="380" height="540" transform="rotate(7 1057 454)"/>
<path d="M494 159h332q28 0 28 27v155q0 27-28 27H639l-52 57-3-57h-90q-28 0-28-27V186q0-27 28-27Z" fill="#faf7ee" stroke="#fff" stroke-width="10" filter="url(#shadow)"/>
<text x="658" y="235" text-anchor="middle" fill="#303039" font-family="Arial" font-size="33" font-weight="900">MY NAME IS</text>
<text x="658" y="314" text-anchor="middle" fill="#303039" font-family="Arial" font-size="73" font-weight="1000" letter-spacing="-4">NOBODY.</text>
<path d="M470 475q115-47 228 2t136-35" fill="none" stroke="#ffe38b" stroke-width="7" stroke-linecap="round" stroke-dasharray="3 19"/>
<text x="43" y="679" fill="#fffdf3" font-family="Arial" font-size="16" font-weight="900" letter-spacing="2">IN HOMER / BOOK 9</text>''')

page('V2', f'''<rect width="1280" height="720" fill="#8db9d3"/><rect width="1280" height="720" filter="url(#grain)" opacity=".35"/>
<path d="M0 452Q207 415 400 473T814 461 1280 451V720H0Z" fill="#3e7899"/><path d="M0 522Q225 482 418 540t409-7 453-29V720H0Z" fill="#285f80"/>
<path d="M0 579Q202 542 381 596t399-10 500-25" fill="none" stroke="#c8e8ea" stroke-width="21" opacity=".45"/>
{tag}<text x="1086" y="47" fill="white" font-family="Arial" font-size="18" font-weight="900" letter-spacing="2">02 / AT SEA</text>
<path d="M72 493h710l-100 157Q411 705 178 650Z" fill="#e8c394" stroke="#f7f3e9" stroke-width="18" stroke-linejoin="round" filter="url(#shadow)"/>
<path d="M429 482V134M428 146 647 472H430Z" fill="#e4e1ca" stroke="#f7f3e9" stroke-width="12" stroke-linejoin="round"/>
<use href="#paperHero" x="81" y="138" width="327" height="463" transform="rotate(-9 245 370)"/>
<g transform="rotate(5 928 263)" filter="url(#shadow)"><path d="M680 96h518v304H680Z" fill="#f5f7f1" stroke="#fff" stroke-width="13" stroke-linejoin="bevel"/><text x="714" y="152" fill="#354459" font-family="Arial" font-size="21" font-weight="900" letter-spacing="2">LOCATION SHARED</text><path d="M713 181h449" stroke="#d0d4d4" stroke-width="3"/><circle cx="761" cy="270" r="34" fill="#e881a0"/><path d="M761 251a16 16 0 0 1 0 32m0 0-12 22h24Z" fill="#fff"/><text x="817" y="267" fill="#263c54" font-family="Arial" font-size="46" font-weight="1000">ITHACA</text><text x="817" y="312" fill="#67717d" font-family="Arial" font-size="22">Odysseus, unfortunately</text><path d="M713 343h451" stroke="#d0d4d4" stroke-width="3"/><text x="714" y="381" fill="#e26b8c" font-family="Arial" font-size="21" font-weight="900">VISIBLE TO: POLYPHEMUS</text></g>
<path d="M946 466q106 32 117 118" fill="none" stroke="#f7e5ac" stroke-width="9" stroke-linecap="round" stroke-dasharray="4 18"/><path d="m1043 565 22 24 13-32" fill="none" stroke="#f7e5ac" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
''')

page('V3', f'''<rect width="1280" height="720" fill="#c6cf9a"/><rect width="1280" height="720" filter="url(#grain)" opacity=".37"/>
<path d="M0 0h635v720H0Z" fill="#d9d3b7"/><path d="M635 0h645v720H635Z" fill="#9cae91"/>
<circle cx="203" cy="157" r="52" fill="#f3d98c"/><circle cx="1099" cy="159" r="52" fill="#344b55"/><circle cx="1117" cy="147" r="49" fill="#9cae91"/>
{tag}<text x="1072" y="47" fill="white" font-family="Arial" font-size="18" font-weight="900" letter-spacing="2">03 / ITHACA</text>
<use href="#paperPenelope" x="471" y="130" width="396" height="563"/>
<path d="M91 486q156-196 315-68t168 61 258-48 334 107" fill="none" stroke="#9a6280" stroke-width="26" stroke-linecap="round" filter="url(#shadow)"/>
<path d="M92 486q156-196 315-68t168 61 258-48 334 107" fill="none" stroke="#f6e7d7" stroke-width="14" stroke-linecap="round"/>
<path d="M84 487q39 26 65 2m35-9q27-35 72-18m55-59q25-37 71-25m49 22q36 14 40 51m90 57q46 12 55-10m59-29q37-20 61-2m61-34q31-29 62-15m66 3q37 3 59 28m62 35q32 41 66 32" fill="none" stroke="#b8829a" stroke-width="4"/>
<text x="90" y="244" fill="#4a4a4e" font-family="Arial" font-size="34" font-weight="900">DAY</text><text x="90" y="332" fill="#4a4a4e" font-family="Arial" font-size="88" font-weight="1000">WEAVE</text>
<text x="890" y="244" fill="#f8f3e6" font-family="Arial" font-size="34" font-weight="900">NIGHT</text><text x="890" y="332" fill="#f8f3e6" font-family="Arial" font-size="88" font-weight="1000">UNDO</text>
<g transform="rotate(-7 908 606)"><path d="M810 558h296v78H810Z" fill="#f7e9d7" stroke="#fff" stroke-width="8"/><text x="958" y="610" text-anchor="middle" fill="#4a4a4e" font-family="Arial" font-size="29" font-weight="900">3 YEARS LATER</text></g>
<text x="42" y="681" fill="#fff" font-family="Arial" font-size="17" font-weight="900" letter-spacing="2">PENELOPE IS STILL BUYING TIME.</text>''')
