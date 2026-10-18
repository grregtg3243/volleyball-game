/* engine.js : 共通部品（①セーブ ②音・BGM ③立ち絵 ④ノベル再生）。ゲームのルールは持たない */
/* ===== save ===== */
/* save.js : セーブ・設定の保存／書き出し／読み込み */
const Cfg={k:"joshiVolley.cfg",d:{vol:.7,mute:false,bgm:.5,bgmMute:false},
 get(){try{return {...this.d,...JSON.parse(localStorage.getItem(this.k)||"{}")}}catch(e){return {...this.d}}},
 set(o){try{localStorage.setItem(this.k,JSON.stringify({...this.get(),...o}))}catch(e){}}};
const Save={k:"joshiVolley.save.v1",
 write(S){try{localStorage.setItem(this.k,JSON.stringify(S))}catch(e){}},
 load(){try{const d=JSON.parse(localStorage.getItem(this.k)||"null");return d&&Array.isArray(d.M)?d:null}catch(e){return null}},
 reset(){try{localStorage.removeItem(this.k)}catch(e){}},
 export(S){const a=document.createElement("a"),d=new Date().toISOString().slice(0,10).replace(/-/g,"");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:"application/json"}));a.download=`joshi-volley-save-${d}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)},
 import(file,ok,ng){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.M)||!Array.isArray(d.A))throw 0;ok(d)}catch(e){ng()}};r.onerror=ng;r.readAsText(file)}};

/* ===== audio ===== */
/* audio.js : 効果音（外部ファイル不要。WebAudioで合成） */
const Snd={ctx:null,
 init(){if(!this.ctx){try{this.ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(this.ctx&&this.ctx.state==="suspended")this.ctx.resume()},
 tone(f,d,type,v,t0){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime+(t0||0);
  o.type=type||"sine";o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02)},
 play(n){const c=Cfg.get();if(c.mute||!c.vol)return;this.init();if(!this.ctx)return;const v=c.vol*.25,T=(f,d,t,y)=>this.tone(f,d,y,v,t);
  ({click:()=>T(660,.06,0,"square"),ok:()=>{T(523,.1,0);T(659,.1,.1);T(784,.2,.2)},love:()=>{T(880,.15,0,"triangle");T(1175,.3,.12,"triangle")},
   month:()=>[523,659,784,1047].forEach((f,i)=>T(f,.25,i*.12,"triangle")),win:()=>[523,523,659,784,1047].forEach((f,i)=>T(f,.2,i*.12,"square")),
   lose:()=>[392,330,262].forEach((f,i)=>T(f,.25,i*.15,"sawtooth")),ach:()=>[784,988,1319].forEach((f,i)=>T(f,.18,i*.09,"triangle"))}[n]||(()=>{}))()}};
/* BGM：data.js の BGM に登録したファイルをループ再生（空なら無音）。自動再生制限のため最初の操作後に開始 */
const Bgm={a:null,cur:"",
 v(){const c=Cfg.get();return c.bgmMute?0:c.bgm},
 play(n){if(n===this.cur&&this.a)return;this.cur=n;if(this.a){this.a.pause();this.a=null}const s=(typeof BGM!=="undefined"&&BGM[n])||"";if(!s)return;this.a=new Audio(s);this.a.loop=true;this.a.volume=this.v();this.go()},
 go(){if(this.a&&this.v()>0)this.a.play().catch(()=>{})},
 set(){if(!this.a)return;this.a.volume=this.v();this.v()>0?this.go():this.a.pause()}};
document.addEventListener("click",()=>Bgm.go());
document.addEventListener("click",e=>{if(e.target.closest("button,label.b"))Snd.play("click")},true); // すべてのボタンでクリック音

/* ===== art ===== */
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

/* ===== novel ===== */
/* novel.js : ノベルパート再生（台本は data.js の SCENES）。lines=[{who,t,m}] */
const Novel={q:[],i:0,cb:null,
 play(lines,cb){if(!lines||!lines.length){cb&&cb();return}this.q=lines;this.i=0;this.cb=cb;Bgm.play("novel");document.getElementById("nv").classList.add("on");this.show()},
 show(){const l=this.q[this.i];document.getElementById("nvw").textContent=l.who||"";document.getElementById("nvt").textContent=l.t;document.getElementById("nvp").innerHTML=l.m?art(l.m):""},
 next(){if(++this.i>=this.q.length){document.getElementById("nv").classList.remove("on");Bgm.play("main");const f=this.cb;this.cb=null;f&&f()}else this.show()}};

