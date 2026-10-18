/* minigame.js : スマホの「🎮 ミニゲーム」。ハーレム要素つきの4種（すべて1回行動力1）。台詞は lines.js の LNX.mg〜
   ■ 読み込み順：phone.js より後ならどこでもOK（game.js が自動で補います）。phone.js のホーム画面にタイル、phApp==="mini" の画面から呼ばれる
   ■ 🃏 ハートめくり：神経衰弱。少ない手数ほど高評価（★1〜3）。ペアを揃えた子の愛情・やる気↑
   ■ 👑 王様ゲーム：顧問が王様。3つの命令から1つ選ぶと、番号の子たちが命令どおり動く（誰が当たるかは選ぶまで秘密）
   ■ 🎰 ハーレムスロット：3つ揃えば大当たり（揃った子の愛情が大きく↑）。何度でも回せる（1回ごとに行動力1）
   ■ 🌟 センター決定戦：勝ち抜き戦で今月のセンターを選ぶ。選ばれた子は大喜び、落ちた子は独占欲↑ */
const MGC={
 mem:{n:"ハートめくり",ic:"🃏",ap:1,min:3,d:"同じ顔のペアを揃える神経衰弱。少ない手数ほど高評価。揃えた子の愛情・やる気が上がります"},
 king:{n:"王様ゲーム",ic:"👑",ap:1,min:3,d:"先生が王様。命令を選ぶと、番号の子たちが…。誰が当たるかは、選ぶまでわかりません"},
 slot:{n:"ハーレムスロット",ic:"🎰",ap:1,min:3,d:"3つ揃えば大当たり！ 揃った子の愛情が大きく上がります。何度でも回せます"},
 center:{n:"センター決定戦",ic:"🌟",ap:1,min:4,d:"勝ち抜き戦で今月のセンターを決める。選ばれた子は大喜び、落ちた子は独占欲が上がります"}};
let MG=null;   // 進行中のゲームの状態
const _mgP=(k,d)=>(typeof LNX!=="undefined"&&LNX[k]&&LNX[k].length)?LNX[k]:d;
const mgNm=m=>m.n.split(" ")[1]||m.n;
const mgShuf=a=>[...a].sort(()=>Math.random()-.5);
const mgRec=()=>(S.mg=S.mg||{});
const mgBn=()=>(S.B&&S.B.name)||"先生";
const mgFace=(m,z)=>{z=z||44;return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${z}px;height:${z}px;border-radius:50%;background:${m.hair||"#888"};color:#fff;font-size:${z>=52?".9rem":".72rem"};font-weight:700;line-height:1.1;text-align:center;flex:none">${mgNm(m).slice(0,3)}</span>`};
const mgSub=(s,o)=>String(s).replace(/\{A\}/g,o.A?o.A.n:"").replace(/\{B\}/g,o.B?o.B.n:"").replace(/\{a\}/g,o.a!=null?o.a+1:"").replace(/\{b\}/g,o.b!=null?o.b+1:"").replace(/\{num\}/g,o.num||"").replace(/\{boss\}/g,mgBn());
const MG_KING0=[{k:1,t:"{a}番が{boss}に「あーん」をする",r:["{A}は照れながら、{boss}に「あーん」をした。"]},{k:2,t:"{a}番と{b}番が手をつなぐ",r:["{A}と{B}は、照れながら手をつないだ。"]},{k:"all",t:"全員で{boss}に「大好き」と言う",r:["「大好きー!」{num}人の声が重なった。"]}];

function mgStart(k){const c=MGC[k];if(!c)return;
 if(S.M.length<c.min){toast(`${c.n}は部員が${c.min}人以上必要です`);return}
 if(!spend(c.ap))return;
 S.cnt=S.cnt||{};S.cnt.mg=(S.cnt.mg||0)+1;
 if(k==="mem"){const g=mgShuf(S.M).slice(0,Math.min(6,S.M.length));MG={t:"mem",g,cards:mgShuf([...g,...g].map(m=>({m,id:m.id,open:false,done:false}))),sel:[],moves:0,pairs:0,done:null}}
 else if(k==="king"){MG={t:"king",ps:mgShuf(S.M).slice(0,Math.min(6,S.M.length)),res:null,rounds:0};mgKingDeal()}
 else if(k==="slot"){MG={t:"slot",reels:[],res:null,spins:0};mgSpin(true);return}
 else{const n=S.M.length>=8?8:4,P=mgShuf(S.M).slice(0,n);MG={t:"center",P,cur:P,next:[],i:0,lose1:[],runner:null,done:null}}
 draw()}
function mgQuit(){MG=null;draw()}

/* 🃏 ハートめくり */
function mgMem(i){const G=MG;if(!G||G.t!=="mem"||G.done)return;const c=G.cards[i];if(!c||c.open||c.done)return;
 if(G.sel.length===2){G.sel.forEach(j=>G.cards[j].open=false);G.sel=[]}
 c.open=true;G.sel.push(i);
 if(G.sel.length===2){G.moves++;const[a,b]=G.sel.map(j=>G.cards[j]);if(a.id===b.id){a.done=b.done=true;G.sel=[];G.pairs++;if(G.pairs===G.g.length){mgMemEnd();return}}}
 draw()}
function mgMemEnd(){const G=MG,k=G.g.length,st=G.moves<=k+2?3:G.moves<=k*2?2:1,R=mgRec();
 G.g.forEach(m=>{gain(m,2+st*2);m.mood=cl(m.mood+2*st)});hpUp(st>=3?2:1);if(st>=3){popUp(1);S.cnt.mgperf=(S.cnt.mgperf||0)+1}
 R.mem=R.mem?Math.min(R.mem,G.moves):G.moves;
 G.done={st,txt:pk(_mgP("mgMem"+st,["全部そろった!"]))};hist(`🃏 ハートめくり：${G.moves}手（★${st}）`);Snd.play("win");after()}

/* 👑 王様ゲーム */
function mgKingDeal(){const G=MG,n=G.ps.length,cs=mgShuf(_mgP("mgKing",MG_KING0)).slice(0,3);
 G.cmds=cs.map(c=>{const nums=mgShuf([...Array(n).keys()]);return{c,a:nums[0],b:nums[1]}});G.res=null}
function mgKingPick(i){const G=MG;if(!G||G.t!=="king"||G.res)return;const x=G.cmds[i];if(!x)return;const c=x.c,P=G.ps;
 const who=c.k==="all"?P:c.k===2?[P[x.a],P[x.b]]:[P[x.a]],o={A:who[0],B:who[1]||who[0],a:x.a,b:x.b,num:who.length};
 who.forEach(m=>{gain(m,rnd(3,6));m.lust=cl(m.lust+1);m.mood=cl(m.mood+4)});
 P.filter(m=>!who.includes(m)).forEach(m=>{m.poss=cl(m.poss+1)});
 G.res={who,cmd:mgSub(c.t,o),txt:mgSub(pk(c.r),o)+(Math.random()<.5?" "+mgSub(pk(_mgP("mgKingEnd",[""])),o):"")};
 G.rounds++;hpUp(1);popUp(0);S.cnt.mgking=(S.cnt.mgking||0)+1;Snd.play("love");after()}
function mgKingAgain(){if(!MG||MG.t!=="king"||!spend(1))return;S.cnt.mg=(S.cnt.mg||0)+1;mgKingDeal();draw()}

/* 🎰 ハーレムスロット（8%大当たり／32%小当たり） */
function mgSpin(first){const G=MG;if(!G||G.t!=="slot")return;if(!first){if(!spend(1))return;S.cnt.mg=(S.cnt.mg||0)+1}
 const P=S.M,r=Math.random();let reels;
 if(r<.08){const m=pk(P);reels=[m,m,m]}
 else if(r<.4){const m=pk(P);let o=pk(P),t=0;while(o===m&&t++<9)o=pk(P);reels=mgShuf([m,m,o])}
 else reels=[pk(P),pk(P),pk(P)];
 const [a,b,c]=reels,kind=(a===b&&b===c)?3:(a===b||b===c||a===c)?2:0,w=kind===3?a:kind===2?(a===b||a===c?a:b):null;
 let txt;
 if(kind===3){gain(w,10);w.lust=cl(w.lust+3);w.mood=cl(w.mood+8);hpUp(3);popUp(2);S.cnt.mgjp=(S.cnt.mgjp||0)+1;txt=mgSub(pk(_mgP("mgSlot3",["大当たり!"])),{A:w});Snd.play("win")}
 else if(kind===2){gain(w,4);hpUp(1);txt=mgSub(pk(_mgP("mgSlot2",["小当たり!"])),{A:w});Snd.play("ok")}
 else{const m=pk(P);gain(m,1);txt=mgSub(pk(_mgP("mgSlot0",["ハズレ…"])),{A:m});Snd.play("lose")}
 G.reels=reels;G.res={kind,txt};G.spins++;after()}

/* 🌟 センター決定戦 */
function mgCenterPick(side){const G=MG;if(!G||G.t!=="center"||G.done)return;const a=G.cur[G.i],b=G.cur[G.i+1],w=side?b:a,l=side?a:b;
 G.next.push(w);if(G.cur.length===G.P.length)G.lose1.push(l);if(G.cur.length===2)G.runner=l;G.i+=2;
 if(G.i>=G.cur.length){if(G.next.length===1){mgCenterEnd(G.next[0]);return}G.cur=G.next;G.next=[];G.i=0}
 draw()}
function mgCenterEnd(w){const G=MG,R=mgRec(),o={A:w,B:G.runner};
 gain(w,8);w.lust=cl(w.lust+3);w.mood=cl(w.mood+8);if(G.runner)gain(G.runner,3);
 G.lose1.forEach(m=>{m.poss=cl(m.poss+2);m.mood=cl(m.mood-3)});G.P.filter(m=>m!==w).forEach(m=>gain(m,1));
 tm(-1);hpUp(2);popUp(1);R.center=(R.center||0)+1;S.cnt.mgcenter=(S.cnt.mgcenter||0)+1;
 G.done={w,txt:[mgSub(pk(_mgP("mgCenterWin",["{A}がセンターに決まった!"])),o),G.runner?mgSub(pk(_mgP("mgCenterRun",[""])),o):"",mgSub(pk(_mgP("mgCenterLose",[""])),{A:w})].filter(Boolean).join("<br>")};
 hist(`🌟 今月のセンター：${w.n}`);Snd.play("win");after()}
const mgRound=n=>n>=8?"準々決勝":n===4?"準決勝":"決勝";

/* ===== 画面 ===== */
const _mgBtn=(t,on,cls)=>`<button class="${cls||"cgk"}" onclick="${on}">${t}</button>`;
const _mgQuit=()=>`<div style="margin:8px 0">${_mgBtn("‹ ゲーム選択へ","mgQuit()")}</div>`;
function miniHtml(){
 if(!MG){const R=mgRec();
  return `<div class="pst">🎮 ミニゲーム<br><small>行動力 ${S.ap}／遊ぶほど女子たちとの距離が縮まります。ハートめくりのベスト：${R.mem?R.mem+"手":"—"}・センターに選んだ回数：${R.center||0}</small></div>`
   +Object.keys(MGC).map(k=>{const c=MGC[k];return `${_mgBtn(`${c.ic} ${c.n}（行動力${c.ap}）`,`mgStart('${k}')`,"cga")}<div class="pst"><small>${c.d}</small></div>`}).join("")}
 const G=MG;
 if(G.t==="mem"){
  const cells=G.cards.map((c,i)=>{const on=c.open||c.done;return `<button onclick="mgMem(${i})" style="min-height:58px;border-radius:12px;border:1px solid rgba(128,128,128,.45);background:${on?"#fff":"linear-gradient(160deg,#ff9ec4,#ff4f8b)"};color:#333;font-size:1.3rem;padding:4px;opacity:${c.done?.55:1}">${on?mgFace(c.m,46):"💗"}</button>`}).join("");
  return `<div class="pst">🃏 ハートめくり<br><small>手数 <b>${G.moves}</b>／ペア ${G.pairs}/${G.g.length}　同じ子を2枚そろえよう（★3は${G.g.length+2}手以内）</small></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0">${cells}</div>`
   +(G.done?`<div class="pst">${"★".repeat(G.done.st)}${"☆".repeat(3-G.done.st)}　${G.moves}手でクリア！<br>${G.done.txt}</div><div>${_mgBtn("もう一度（行動力1）","mgStart('mem')","cga")}</div>`:"")+_mgQuit()}
 if(G.t==="king"){
  const faces=G.ps.map((m,i)=>`<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#ccc;color:#555;font-weight:700;font-size:.8rem">?</span>`).join(" ");
  return `<div class="pst">👑 王様ゲーム<br><small>王様は<b>${mgBn()}</b>！ 参加者${G.ps.length}人（番号は秘密）</small><div style="margin-top:6px">${faces}</div></div>`
   +(G.res?`<div class="pst">命令：<b>${G.res.cmd}</b><div style="display:flex;gap:6px;margin:6px 0">${G.res.who.slice(0,6).map(m=>mgFace(m,40)).join("")}</div>${G.res.txt}</div><div>${_mgBtn("次の命令へ（行動力1）","mgKingAgain()","cga")}</div>`
    :`<div class="pst"><small>王様の命令を選ぼう</small></div>${G.cmds.map((x,i)=>`<div>${_mgBtn(mgSub(x.c.t,{a:x.a,b:x.b,num:G.ps.length}),`mgKingPick(${i})`,"cga")}</div>`).join("")}`)+_mgQuit()}
 if(G.t==="slot"){
  const reel=G.reels.map(m=>`<span style="display:inline-flex;flex-direction:column;align-items:center;gap:3px;padding:8px 6px;border-radius:12px;background:#fff;border:2px solid ${G.res&&G.res.kind===3?"#ff4f8b":"rgba(128,128,128,.4)"};min-width:72px">${mgFace(m,54)}<small style="color:#333">${mgNm(m)}</small></span>`).join("");
  return `<div class="pst">🎰 ハーレムスロット<br><small>${G.spins}回目　3つ揃えば大当たり（愛情+10）／2つで小当たり</small></div><div style="display:flex;justify-content:center;gap:8px;margin:10px 0">${reel}</div>`
   +`<div class="pst">${G.res.kind===3?"🎉 ":G.res.kind===2?"✨ ":""}${G.res.txt}</div><div>${_mgBtn("もう一回（行動力1）","mgSpin()","cga")}</div>`+_mgQuit()}
 if(G.t==="center"){
  if(G.done)return `<div class="pst">🌟 センター決定戦　結果<div style="display:flex;justify-content:center;margin:8px 0">${mgFace(G.done.w,64)}</div>${G.done.txt}</div><div>${_mgBtn("もう一度（行動力1）","mgStart('center')","cga")}</div>`+_mgQuit();
  const a=G.cur[G.i],b=G.cur[G.i+1],btn=(m,s)=>`<button class="cgk" onclick="mgCenterPick(${s})" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px;flex:1">${mgFace(m,56)}<b>${mgNm(m)}</b></button>`;
  return `<div class="pst">🌟 センター決定戦　<b>${mgRound(G.cur.length)}</b><br><small>${G.i/2+1}試合目／${G.cur.length/2}試合中　今月のセンターにしたい子を選ぼう</small></div><div style="display:flex;gap:10px;margin:10px 0">${btn(a,0)}${btn(b,1)}</div>`+_mgQuit()}
 return ""}

/* 実績 */
if(typeof ACH!=="undefined"&&!ACH.some(a=>a.id==="mg1"))ACH.push(
 {id:"mg1",i:"🎮",n:"スマホで遊ぼう",d:"ミニゲームを遊ぶ",ok:s=>(s.cnt&&s.cnt.mg||0)>=1},
 {id:"mg30",i:"🕹",n:"ゲーム三昧",d:"ミニゲームを30回遊ぶ",ok:s=>(s.cnt&&s.cnt.mg||0)>=30},
 {id:"mgperf",i:"🃏",n:"全部おぼえてる",d:"ハートめくりで★3を取る",ok:s=>(s.cnt&&s.cnt.mgperf||0)>=1},
 {id:"mgjp",i:"🎰",n:"ジャックポット",d:"ハーレムスロットで大当たり",ok:s=>(s.cnt&&s.cnt.mgjp||0)>=1},
 {id:"mgking10",i:"👑",n:"王様の命令",d:"王様ゲームの命令を10回出す",ok:s=>(s.cnt&&s.cnt.mgking||0)>=10},
 {id:"mgcenter",i:"🌟",n:"今月のセンター",d:"センター決定戦を完走する",ok:s=>(s.cnt&&s.cnt.mgcenter||0)>=1});
