/* art.js : 立ち絵（仮のSVG）。m.img があれば画像を優先して表示 */
function art(m){
 if(m.img)return `<img src="${m.img}" alt="${m.n}">`;
 const h=m.hair,e=m.mood>=60||m.love>=70?1:0,bl=m.love>=60;
 const back={pony:`<path d="M140 80Q190 90 178 170Q172 200 160 180Q166 130 140 110Z" fill="${h}"/>`,
 side:`<path d="M60 70Q20 90 34 170Q44 190 52 160Q50 120 66 100Z" fill="${h}"/><ellipse cx="100" cy="92" rx="56" ry="58" fill="${h}"/>`,
 bob:`<path d="M44 120Q36 50 100 46Q164 50 156 120L156 166Q130 150 100 156Q70 150 44 166Z" fill="${h}"/>`,
 long:`<path d="M44 110Q36 50 100 46Q164 50 156 110L164 226Q130 214 100 220Q70 214 36 226Z" fill="${h}"/>`,
 twin:`<path d="M48 90Q10 110 22 200Q34 214 44 190Q40 140 60 112Z" fill="${h}"/><path d="M152 90Q190 110 178 200Q166 214 156 190Q160 140 140 112Z" fill="${h}"/>`}[m.style]||"";
 const eye=x=>e?`<path d="M${x-11} 124Q${x} 110 ${x+11} 124" stroke="#2b1b17" stroke-width="3.5" fill="none" stroke-linecap="round"/>`:
 `<ellipse cx="${x}" cy="124" rx="11" ry="14" fill="#fff"/><ellipse cx="${x}" cy="126" rx="8" ry="11" fill="${m.eye}"/><ellipse cx="${x}" cy="127" rx="4" ry="6" fill="#1b1b2b"/><circle cx="${x-3}" cy="121" r="3" fill="#fff"/>`;
 return `<svg viewBox="0 0 200 270" role="img" aria-label="${m.n}（仮イラスト）">${back}
 <path d="M34 270Q34 206 100 200Q166 206 166 270Z" fill="#d62839"/><path d="M62 266Q62 226 84 206M138 266Q138 226 116 206" stroke="#fff" stroke-width="5" fill="none"/><path d="M82 202L100 232L118 202Z" fill="#fff"/><text x="100" y="262" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">${m.no}</text>
 <rect x="88" y="168" width="24" height="38" rx="8" fill="#ffd9c4"/><ellipse cx="100" cy="120" rx="48" ry="54" fill="#ffe6d6"/>${eye(80)}${eye(120)}
 ${bl?`<ellipse cx="68" cy="146" rx="9" ry="5" fill="#ff9db5" opacity=".7"/><ellipse cx="132" cy="146" rx="9" ry="5" fill="#ff9db5" opacity=".7"/>`:""}
 ${e?`<path d="M90 148Q100 162 110 148Z" fill="#e0555f"/>`:`<path d="M92 151Q100 155 108 151" stroke="#c0555f" stroke-width="3" fill="none" stroke-linecap="round"/>`}
 <path d="M50 118Q54 62 100 58Q146 62 150 118Q132 88 104 90Q92 100 72 92Q58 98 50 118Z" fill="${h}"/>
 ${m.style==="twin"?`<circle cx="48" cy="92" r="9" fill="#fff"/><circle cx="152" cy="92" r="9" fill="#fff"/>`:""}${m.style==="pony"?`<circle cx="140" cy="84" r="8" fill="#fff"/>`:""}</svg>`}
