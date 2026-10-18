/* engine.js : 共通部品（①セーブ ②音・BGM ③立ち絵 ④ノベル再生）。ゲームのルールは持たない */
/* ===== save ===== */
/* save.js : セーブ・設定の保存／書き出し／読み込み */
const Cfg={k:"joshiVolley.cfg",d:{vol:.7,mute:false,bgm:.5,bgmMute:false},
 get(){try{return {...this.d,...JSON.parse(localStorage.getItem(this.k)||"{}")}}catch(e){return {...this.d}}},
 set(o){try{localStorage.setItem(this.k,JSON.stringify({...this.get(),...o}))}catch(e){}}};
/* セーブの圧縮（①〜③で女子1人あたり約280文字→約100文字。数千人規模でも容量(約500万文字)に届きにくくする）
   ①部員M・卒業生A・連絡先cg は項目名なしの配列（タプル）で保存 ②既定の台詞L・空のimg/E・CAST由来のE は保存しない（読み込み時に game.js の fix() が復元）③小数は小数1桁に丸める
   ・旧形式（オブジェクトのままの古いセーブ／書き出しファイル）もそのまま読める（Save.unpack）。タプルの並びを変える時は MK と pm()/um() を一緒に直すこと */
const _castMap=new Map((typeof CAST!=="undefined"?CAST:[]).map(c=>[c.n,c]));
const MK=["n","g","pos","hair","eye","style","no","id","mood","love","poss","lust"],_known=new Set([...MK,"s","ev","L","E","img"]),_r1=v=>typeof v==="number"&&!Number.isInteger(v)?Math.round(v*10)/10:v;
function _pm(m){const c=_castMap.get(m.n),b=(c&&c.L)||DL,s=m.s||{},x={};
 for(const k in m)if(!_known.has(k))x[k]=m[k];
 if(m.L&&!(m.L.length===b.length&&m.L.every((t,i)=>t===b[i])))x.L=m.L;      // 既定の台詞は省く
 if(m.E&&!(c&&c.E===m.E))x.E=m.E;                                              // CAST由来の一言・空は省く
 if(m.img)x.img=m.img;
 const a=[...MK.map(k=>_r1(m[k])),s.srv,s.rcv,s.atk,s.stm,m.ev?m.ev.join(""):null];
 if(Object.keys(x).length)a.push(x);return a}
function _um(a){if(!Array.isArray(a))return a;const m={};MK.forEach((k,i)=>{if(a[i]!=null)m[k]=a[i]});m.s={srv:a[12],rcv:a[13],atk:a[14],stm:a[15]};
 if(a[16]!=null)m.ev=String(a[16]).split("").map(Number);if(a[17]&&typeof a[17]==="object")Object.assign(m,a[17]);return m}
function _packRep(k,v){return _r1(v)}
const Save={k:"joshiVolley.save.v1",LIMIT:5000000,lastWarn:0,
 pack(S){return JSON.stringify({...S,sv:2,M:S.M.map(_pm),A:(S.A||[]).map(_pm),cg:(S.cg||[]).map(_pm)},_packRep)},
 unpack(d){["M","A","cg"].forEach(k=>{if(Array.isArray(d[k]))d[k]=d[k].map(_um)});return d},
 size(S){try{return this.pack(S).length}catch(e){return 0}},
 /* 書き込み。容量オーバーなら、親密度の低い学内の連絡先(S.cg)を少しずつ整理して再試行。それでもダメなら画面に警告（無言で失敗しない） */
 write(S){let s;try{s=this.pack(S)}catch(e){console.error("save pack error:",e);return false}
  for(let i=0;i<6;i++){
   try{localStorage.setItem(this.k,s);if(i&&typeof toast==="function")toast(`⚠ セーブ容量が不足したため、親密度の低い連絡先を整理しました（${Save.trimmed||0}回）`);return true}
   catch(e){if(!S.cg||S.cg.length<=100)break;S.cg.sort((a,b)=>b.love-a.love);S.cg.length=Math.floor(S.cg.length*.7);Save.trimmed=(Save.trimmed||0)+1;try{s=this.pack(S)}catch(_){break}}}
  const t=Date.now();if(t-this.lastWarn>20000&&typeof toast==="function"){this.lastWarn=t;toast("⚠ セーブに失敗しました（容量不足）。設定の「書き出し」でバックアップしてください")}
  return false},
 load(){try{const d=JSON.parse(localStorage.getItem(this.k)||"null");return d&&Array.isArray(d.M)?this.unpack(d):null}catch(e){return null}},
 reset(){try{localStorage.removeItem(this.k)}catch(e){}},
 export(S){const a=document.createElement("a"),d=new Date().toISOString().slice(0,10).replace(/-/g,"");
  a.href=URL.createObjectURL(new Blob([this.pack(S)],{type:"application/json"}));a.download=`joshi-volley-save-${d}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)},
 import(file,ok,ng){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.M)||!Array.isArray(d.A))throw 0;ok(Save.unpack(d))}catch(e){ng()}};r.onerror=ng;r.readAsText(file)}};

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
/* {b}{boss}→顧問の名前（未設定なら「先生」）。呼び方(callOf)が返す文字列の中の {b} も、最後にここで置き換える */
const bnm=()=>(typeof S!=="undefined"&&S.B&&S.B.name)||"";
const bn=t=>String(t==null?"":t).replace(/\{(b|boss)\}/g,()=>bnm()||"先生");
const nmz=(t,m)=>{t=bn(t);if(m&&typeof callOf==="function"){try{let c=String(callOf(m));if(!bnm())c=c.replace(/\{b\}(さん|くん|先生)/g,"先生");c=bn(c);return t.replace(/先生/g,()=>c)}catch(e){}}  // m（話している女子）を渡すと、愛情に応じた呼び方（先生→○○さん→あなた→ダーリン）に置換
 return t.replace(/先生/g,bnm()?bnm()+"先生":"先生")};  // 台詞中の「先生」→「顧問の名前+先生」
const Art={miss:new Set(),reg:{},dir:"img/",ext:"jpg",top:(()=>{try{return Cfg.get().imgtop||0}catch(e){return 0}})()||(typeof CAST!=="undefined"?CAST.length:8),tops:(()=>{try{const c=Cfg.get();return{h:c.imgtopH||0,t:c.imgtopT||0}}catch(e){return{h:0,t:0}}})()}; // reg=表示した女子の控え（画像が無い時に確実に仮SVGへ戻すため） // 画像は img/<ID>.jpg を自動参照。無ければ仮SVGに切替
/* 画像を探しに行くのは「数字のID」で、かつ「これまでに画像が見つかった最大ID+5」以内だけ（画像の無い数千人分の読み込み失敗ログを防ぐ）。
   部活外の女子(IDが C で始まる)は、m.img を指定した時だけ画像を使う。画像を飛び飛びに置く時は data.js の IMG_MAX（探す上限ID）を設定 */
/* 画像ファイル名の割り当て：部員(数字ID)＝0001〜9999.jpg／普通の学生(IDが C+数字)＝h0001〜h9999.jpg／女教師(IDが T+数字)＝t0001〜t9999.jpg（すべて img/ に置く） */
const imgKey=m=>{const id=String(m.id==null?"":m.id);if(/^\d+$/.test(id))return{p:"",n:parseInt(id,10),f:id};const x=id.match(/^([CT])(\d+)$/i);if(!x)return null;const p=x[1].toUpperCase()==="T"?"t":"h",n=parseInt(x[2],10);return{p,n,f:p+String(n).padStart(4,"0")}};
const imgFile=m=>{const k=imgKey(m);return k?k.f:String(m.id)};
const imgLimit=p=>{const o=p==="h"?(typeof IMG_MAX_H==="number"?IMG_MAX_H:0):p==="t"?(typeof IMG_MAX_T==="number"?IMG_MAX_T:0):(typeof IMG_MAX==="number"?IMG_MAX:0);return Math.min(9999,o>0?o:(p?Art.tops[p]:Art.top)+5)};
const canProbe=m=>{const k=imgKey(m);return !!k&&k.n>=1&&k.n<=imgLimit(k.p)};
function art(m){Art.reg[m.id]=m;
 if(m.img)return `<img src="${m.img}" alt="${m.n}" onerror="artMiss(this,'${m.id}')">`;
 if(!Art.miss.has(m.id)&&canProbe(m))return `<img src="${Art.dir}${imgFile(m)}.${Art.ext}" alt="${m.n}" onload="artOk('${m.id}')" onerror="artMiss(this,'${m.id}')">`;
 return artSvg(m)}
function artOk(id){const k=imgKey({id});if(!k)return;if(!k.p){if(k.n>Art.top){Art.top=k.n;try{Cfg.set({imgtop:k.n})}catch(e){}}}else if(k.n>Art.tops[k.p]){Art.tops[k.p]=k.n;try{Cfg.set(k.p==="h"?{imgtopH:k.n}:{imgtopT:k.n})}catch(e){}}}   // 見つかった最大IDを覚える
function artMiss(el,id){Art.miss.add(id);const m=Art.reg[id]||[...S.M,...S.A,...(S.cg||[])].find(x=>x.id===id);if(m&&el.parentNode)el.outerHTML=artSvg(m)}
function artSvg(m){
 const h=m.hair,e=m.mood>=60||m.love>=70?1:0,bl=m.love>=60;
 const back={pony:`<path d="M140 80Q190 90 178 170Q172 200 160 180Q166 130 140 110Z" fill="${h}"/>`,
 side:`<path d="M60 70Q20 90 34 170Q44 190 52 160Q50 120 66 100Z" fill="${h}"/><ellipse cx="100" cy="92" rx="56" ry="58" fill="${h}"/>`,
 bob:`<path d="M44 120Q36 50 100 46Q164 50 156 120L156 166Q130 150 100 156Q70 150 44 166Z" fill="${h}"/>`,
 long:`<path d="M44 110Q36 50 100 46Q164 50 156 110L164 226Q130 214 100 220Q70 214 36 226Z" fill="${h}"/>`,
 twin:`<path d="M48 90Q10 110 22 200Q34 214 44 190Q40 140 60 112Z" fill="${h}"/><path d="M152 90Q190 110 178 200Q166 214 156 190Q160 140 140 112Z" fill="${h}"/>`}[m.style]||"";
 /* 服装：部員(IDが数字)＝バレーのユニフォーム／部活外の女子(IDが C で始まる)＝私服（カーディガン＋ブラウス）。入部するとIDが数字になりユニフォームに変わる */
 const casual=/^[CT]/.test(m.id||""),pal=["#ff8fb1","#7fc8f8","#ffd36b","#a98cf0","#7fd6a6","#f59f7a"],col=pal[(parseInt(String(m.id).slice(1),10)||0)%pal.length];
 const wear=casual?`<path d="M34 270Q34 206 100 200Q166 206 166 270Z" fill="${col}"/><path d="M76 204Q100 236 124 204L124 270L76 270Z" fill="#fff"/><path d="M76 204Q100 236 124 204" stroke="#e3e3ea" stroke-width="3" fill="none"/><circle cx="100" cy="226" r="3" fill="${col}"/><circle cx="100" cy="244" r="3" fill="${col}"/>`
  :`<path d="M34 270Q34 206 100 200Q166 206 166 270Z" fill="#d62839"/><path d="M62 266Q62 226 84 206M138 266Q138 226 116 206" stroke="#fff" stroke-width="5" fill="none"/><path d="M82 202L100 232L118 202Z" fill="#fff"/><text x="100" y="262" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">${m.no}</text>`;
 const eye=x=>e?`<path d="M${x-11} 124Q${x} 110 ${x+11} 124" stroke="#2b1b17" stroke-width="3.5" fill="none" stroke-linecap="round"/>`:
 `<ellipse cx="${x}" cy="124" rx="11" ry="14" fill="#fff"/><ellipse cx="${x}" cy="126" rx="8" ry="11" fill="${m.eye}"/><ellipse cx="${x}" cy="127" rx="4" ry="6" fill="#1b1b2b"/><circle cx="${x-3}" cy="121" r="3" fill="#fff"/>`;
 return `<svg viewBox="0 0 200 270" role="img" aria-label="${m.n}（仮イラスト）">${back}
 ${wear}
 <rect x="88" y="168" width="24" height="38" rx="8" fill="#ffd9c4"/><ellipse cx="100" cy="120" rx="48" ry="54" fill="#ffe6d6"/>${eye(80)}${eye(120)}
 ${bl?`<ellipse cx="68" cy="146" rx="9" ry="5" fill="#ff9db5" opacity=".7"/><ellipse cx="132" cy="146" rx="9" ry="5" fill="#ff9db5" opacity=".7"/>`:""}
 ${e?`<path d="M90 148Q100 162 110 148Z" fill="#e0555f"/>`:`<path d="M92 151Q100 155 108 151" stroke="#c0555f" stroke-width="3" fill="none" stroke-linecap="round"/>`}
 <path d="M50 118Q54 62 100 58Q146 62 150 118Q132 88 104 90Q92 100 72 92Q58 98 50 118Z" fill="${h}"/>
 ${m.style==="twin"?`<circle cx="48" cy="92" r="9" fill="#fff"/><circle cx="152" cy="92" r="9" fill="#fff"/>`:""}${m.style==="pony"?`<circle cx="140" cy="84" r="8" fill="#fff"/>`:""}</svg>`}

/* ===== novel ===== */
/* novel.js : ノベルパート再生（台本は data.js の SCENES）。lines=[{who,t,m}] */
const Novel={q:[],i:0,cb:null,
 play(lines,cb){if(!lines||!lines.length){cb&&cb();return}
  if(document.getElementById("nv").classList.contains("on")&&this.i<this.q.length){this.q.push(...lines);if(cb){const o=this.cb;this.cb=()=>{o&&o();cb()}}return}   // 再生中なら後ろに追加（前回の異常終了で止まっていたら作り直す）
  this.q=lines;this.i=0;this.cb=cb;this.skipBtn();Bgm.play("novel");document.getElementById("nv").classList.add("on");this.show()},
 /* スキップ：次の選択肢の手前まで（選択肢が無ければ最後まで）飛ばす。選択肢は勝手に決めない。行に skip:()=>真 を持たせると、その行は表示されず飛ばされる */
 skipBtn(){const nv=document.getElementById("nv");if(!nv||document.getElementById("nvs"))return;const b=document.createElement("button");b.id="nvs";b.textContent="⏭ スキップ";
  b.style.cssText="position:fixed;top:10px;right:10px;z-index:9999;padding:6px 14px;border:0;border-radius:16px;background:rgba(0,0,0,.55);color:#fff;font:inherit;font-size:.8rem;cursor:pointer";
  b.onclick=ev=>{ev.stopPropagation();Novel.skip()};nv.appendChild(b)},
 skip(){if(!this.q.length)return;const isCh=l=>l.ch&&!(l.skip&&l.skip());let j=this.i;while(j<this.q.length&&!isCh(this.q[j]))j++;
  if(j>=this.q.length){this.end();return}this.i=j;this.show()},
 show(){let l=this.q[this.i];while(l&&l.skip&&l.skip())l=this.q[++this.i];if(!l){this.end();return}
  document.getElementById("nvw").textContent=l.who||"";const t=document.getElementById("nvt");t.textContent=nmz(l.t,l.m&&l.who&&l.who===l.m.n?l.m:null);   // 本人の台詞だけ呼び方を適用
  if(l.ch)l.ch.forEach((c,k)=>{const b=document.createElement("button");b.textContent=c.t;b.disabled=!!c.off;b.onclick=ev=>{ev.stopPropagation();Novel.pick(k)};t.append(document.createElement("br"),b)});
  let h="";try{h=l.ms&&l.ms.length>6?`<div class="crowd">${l.ms.slice(0,120).map(x=>`<span class="mtf"><span class="av">${art(x)}</span></span>`).join("")}</div>`:l.ms&&l.ms.length>=3?`<div class="msrow">${l.ms.slice(0,6).map(x=>`<div>${art(x)}</div>`).join("")}</div>`:l.m?art(l.m):""}catch(e){}   // 3人以上の場面は立ち絵を横一列に
  const np=document.getElementById("nvp");np.innerHTML=h;np.classList.toggle("wide",!!(l.ms&&l.ms.length>=3))},
 pick(k){const l=this.q[this.i],c=l&&l.ch&&l.ch[k];if(!c)return;l.ch=null;try{c.f&&c.f()}catch(e){console.error("choice error:",e)}if(c.r)this.q.splice(this.i+1,0,{who:"",t:c.r,m:l.m});this.next()},
 next(){if(this.q[this.i]&&this.q[this.i].ch)return;if(++this.i>=this.q.length)this.end();else this.show()},
 end(){document.getElementById("nv").classList.remove("on");Bgm.play("main");const f=this.cb;this.cb=null;this.q=[];this.i=0;try{f&&f()}catch(e){console.error("novel callback error:",e)}}};

/* 画像の割り当て確認：ゲーム画面で F12 → コンソールに imgCheck() と入力。部員（先頭10人）・連絡先・教員が「どのファイルを探しに行くか」と「実際に読み込めるか」を表で表示します。
   読み込めたのに画面に出ない時は imgReset()（失敗の記録を消して再描画） */
function imgCheck(n){n=n||10;const L=[...(S.M||[]).slice(0,n),...(S.cg||[]).slice(0,3),...(S.tch||[]).slice(0,3)],rows=[];let c=0;
 const done=()=>{if(++c===L.length)console.table(rows)};
 L.forEach(m=>{const f=m.img||(Art.dir+imgFile(m)+"."+Art.ext),u=new URL(f,location.href).href,r={名前:m.n,ID:m.id,探す場所:u,探索する:m.img?"(img指定)":canProbe(m),過去の失敗記録:Art.miss.has(m.id)},im=new Image();rows.push(r);
  im.onload=()=>{r.結果="✅ 読み込めた "+im.naturalWidth+"x"+im.naturalHeight;done()};im.onerror=()=>{r.結果="❌ 見つからない";done()};im.src=u});
 return L.length?"確認中…（結果が表で出ます）":"部員がいません"}
function imgReset(){Art.miss.clear();draw();return "失敗の記録を消して再描画しました"}
