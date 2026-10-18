/* 自動読み込み：index.html に script タグが無い拡張ファイルを、ページ読み込み後に補って読み込む（タグがある場合は何もしない）。見つからない時は画面に表示 */
addEventListener("load",()=>{[["superday",()=>typeof superOpen],["harem2",()=>typeof serviceDay],["taikai",()=>typeof taikaiDay],["lines",()=>typeof lnV],["minigame",()=>typeof miniHtml]].forEach(([f,t])=>{if(t()!=="undefined")return;const s=document.createElement("script");s.src="js/"+f+".js";s.onerror=()=>{try{toast("js/"+f+".js が見つかりません（jsフォルダに置いてください）")}catch(e){}console.error("読み込み失敗: js/"+f+".js")};document.head.appendChild(s)})});
/* game.js : ゲーム本体（状態・ルール・画面描画）。終了条件なし＝延々と続きます */
"use strict";
let S={no:0},menu="main",dip=null;
const _pkLast=new WeakMap();
const $=id=>document.getElementById(id),cl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+(Math.random()*(b-a+1)|0),pk=a=>{if(a.length<2)return a[0];const h=_pkLast.get(a)||[],keep=a.length>3?2:1;let c=a.filter(x=>!h.includes(x));if(!c.length)c=a;const v=c[Math.random()*c.length|0];h.push(v);while(h.length>keep)h.shift();_pkLast.set(a,h);return v};  // 同じ候補リストから選ぶとき、直前（候補が4つ以上なら直前2回）に選んだものは避ける＝同じイベント・会話が連続しない

const bonus=()=>(.5+(S.B?S.B.pop:50)/100)*(S.perks&&S.perks.smile?1.2:1)*(1+lvl("pop")*.03);   // 人気ボーナス：人気50で×1.0、100で×1.5。特技「笑顔」で×1.2
const has=id=>S.perks&&S.perks[id];                               // 特技を習得済みか
const hpUp=n=>{S.hp=(S.hp||0)+n};                                 // ハートポイント加算
const popUp=n=>{S.B.pop=cl(S.B.pop+n+(n>0&&has("king")?1:0))};    // 人気加算（特技「モテ王」で+1）
const tm=n=>{S.team=cl(Math.round((S.team==null?60:S.team)+(n<0?n*(has("care")?.5:1)*(S.charter==="equal"?.5:1)*Math.max(.4,1-lvl("kind")*.03):n)))}; // 部の「和」加算
const apMax=()=>3+(S.B.stm>=80?1:0)+(has("stamina")?1:0)+Math.min(3,lvl("stm")/5|0);       // 体力80以上・特技・体力Lvで行動力+
const apRate=()=>Math.min(.85,.1+S.B.pop/150+(has("charm")?.15:0)+lvl("app")*.015); // 人気・容姿Lvが高いほどアプローチ発生率が上がる
const gain=(m,v)=>{const d=v*CFG.LM*bonus()*cmul(m);m.love=cl(Math.round(m.love+d));if(m.love>=60){m.lust=cl(m.lust+d*.2);m.poss=cl(m.poss+d*.15)}}; // 愛情↑（60以上で情欲・独占欲も育つ）
const wp=(a,f)=>{let r=Math.random()*a.reduce((x,m)=>x+f(m),0);for(const m of a){r-=f(m);if(r<=0)return m}return a[a.length-1]}; // 重み付き抽選
const tier=m=>m.love>=CFG.TIER[2]?3:m.love>=CFG.TIER[1]?2:m.love>=CFG.TIER[0]?1:0;
const avg=m=>(m.s.srv+m.s.rcv+m.s.atk+m.s.stm)/4;
const lineup=()=>[...S.M].sort((a,b)=>avg(b)-avg(a)).slice(0,8);       // 試合に出る上位8人
const power=()=>Math.round(lineup().reduce((a,m)=>a+avg(m)*(.6+m.mood/250)*(m.lover?1.1:1),0)*(.75+(S.team==null?60:S.team)/200)*(fac("bus")?1.1:1)); // 恋仲+10%、部の「和」・専用バスでも変動
const endTxt=l=>l>=95?"卒業の日、先生に想いを告げた。":l>=80?"卒業後も会う約束を交わした。":l>=60?"感謝の言葉を残して巣立った。":"笑顔で巣立っていった。";
/* ---------- 状態 ---------- */
function mk(c){return{n:c.n,g:c.g,pos:c.pos,hair:c.hair,eye:c.eye,style:c.style,no:++S.no,id:String(S.no).padStart(4,"0"),E:c.E||"",s:{srv:c.s[0],rcv:c.s[1],atk:c.s[2],stm:c.s[3]},mood:c.mood,love:c.love??CFG.START+Math.min(15,(S.ng||0)*3),poss:c.poss??rnd(5,25),lust:c.lust??rnd(0,15),ev:CFG.TIER.map(t=>(c.love??0)>=t?1:0),L:c.L||DL,img:c.img||""}}
function fresh(){const used=new Set();S.M.forEach(x=>used.add(x.n));S.A.forEach(x=>used.add(x.n));let n,t=0;do{n=pk(POOL.sn)+" "+pk(POOL.gn)+(t>60?"（"+(S.no+1)+"）":"")}while(used.has(n)&&++t<300);   // 名前の重複チェックは Set（部員・卒業生が数千人でも遅くならない）
 return mk({n,g:1,pos:pk(POOL.ps),hair:pk(POOL.hc),eye:pk(POOL.ec),style:pk(POOL.st),s:[rnd(20,32),rnd(20,32),rnd(15,30),rnd(25,35)],mood:70,love:cl(rnd(35,85)+Math.round((S.B.pop-50)*.3),20),poss:rnd(5,25),lust:rnd(0,15)})}
const _castBy=new Map(CAST.map(c=>[c.n,c]));
function fix(d){d.B=d.B||{app:70,stm:55,lead:50,kind:50,pop:35,name:""};d.cg=d.cg||[];
 [...d.M,...d.A,...d.cg].forEach(m=>{const c=_castBy.get(m.n);if(!m.L)m.L=(c&&c.L)||DL;if(m.E==null)m.E=(c&&c.E)||"";if(m.img==null)m.img=""});   // セーブ圧縮で省いた台詞L・E・imgを復元（engine.js の Save.pack と対）
 [...d.M,...d.A].forEach(m=>{if(m.poss==null)m.poss=rnd(5,25);if(m.lust==null)m.lust=rnd(0,15);if(!m.id)m.id=String(m.no||0).padStart(4,"0");if(!d.sv&&m.ev&&m.ev[2]&&m.lover==null)m.lover=true});   // 旧セーブ(sv無し)の救済は1回だけ。以後は読み込むたびに恋仲が増えない
 d.sv=2;d.B.name=d.B.name||"";d.cnt=d.cnt||{};d.fl=d.fl||{};d.ach=d.ach||{};d.perks=d.perks||{};d.inbox=d.inbox||[];if(d.rep==null)d.rep=3;d.mid=d.mid||0;d.charter=d.charter||"";d.ng=d.ng||0;d.hof=d.hof||[];d.fac=d.fac||{};d.perks=d.perks||{};d.hp=d.hp||0;if(d.team==null)d.team=60;return d} // 旧セーブの補完
function newGame(ng=0){S={ng,no:0,y:1,w:1,ap:3,wins:0,weeks:0,cur:0,A:[],ach:{},fl:{},cnt:{},team:60,hp:0,perks:{},fac:{},inbox:[],rep:3,mid:0,charter:"",B:{app:70,stm:55,lead:50,kind:50,pop:35,name:""}};S.M=CAST.map(mk)}
/* ---------- 表示補助 ---------- */
const HIST_MAX=200;const trimHist=()=>{const h=$("hist");while(h&&h.children.length>HIST_MAX)h.removeChild(h.lastChild)};   // ログは最新200件だけ保持（長時間プレイで画面の部品が増え続けるのを防ぐ）
function say(t,who="",c=""){t=nmz(t,S.M&&S.M.find(x=>x.n===who));$("say").innerHTML=`<b>${who||(S.B&&S.B.name)||"顧問"}</b>${t}`;const p=document.createElement("p");p.className=c;p.textContent=(who?who+" ":"")+t;$("hist").prepend(p);trimHist()}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove("on"),2200)}
function banner(a,b,cb){$("bn1").textContent=a;$("bn2").textContent=b||"";const e=$("bn");e.classList.remove("on");void e.offsetWidth;e.classList.add("on");Snd.play("month");setTimeout(()=>{e.classList.remove("on");cb&&cb()},1600)}
function checkAch(){ACH.forEach(a=>{if(!S.ach[a.id]&&a.ok(S)){S.ach[a.id]=1;toast(`実績解除：${a.n}`);Snd.play("ach")}})}
/* ---------- 画面 ---------- */
const btn=(t,f,c="",d=false)=>`<button class="${c}" onclick="${f}"${d?" disabled":""}>${t}</button>`;
function draw(){
 if(S.cur>=S.M.length)S.cur=0;const m=S.M[S.cur];
 $("wk").textContent=`${S.ng?S.ng+1+"周目 ":""}${S.y}年目 ${S.w}か月目（${(S.w+2)%12+1}月）`;$("ap").textContent=`行動 ${S.ap}/${apMax()}`;$("pop").textContent=`恋心${hearts().length}人／恋仲${lovers()}人／人気 ${S.B.pop}`;
 $("nm").innerHTML=`${m.n}<i class="id">${m.id}</i><small>短大${m.g}年・${m.pos}</small>`;
 $("fans").textContent=hearts().length?`💗 ${hearts().length}人があなたに恋している`:"";$("pt").innerHTML=art(m);$("bgp").innerHTML=bgHtml(m);
 $("side").innerHTML=`<h3>${m.n}<i class="id">${m.id}</i></h3><p class="hint">短大${m.g}年・${m.pos}／呼び名「${bn(callOf(m))}」</p><div class="st">${K.map((k,j)=>`<span>${NM[j]}</span><div class="t"><i style="width:${m.s[k]}%"></i></div><b>${m.s[k]}</b>`).join("")}<span>やる気</span><div class="t"><i style="width:${m.mood}%"></i></div><b>${m.mood}</b></div><div class="love"><span>♥ 愛情</span><b>${m.love}</b><div class="lb"><i style="width:${m.love}%"></i></div></div><div class="love v"><span>独占欲</span><b>${Math.round(m.poss)}</b><div class="lb"><i style="width:${m.poss}%"></i></div></div><div class="love l"><span>情欲</span><b>${Math.round(m.lust)}</b><div class="lb"><i style="width:${m.lust}%"></i></div></div><p class="hint">部員 ${S.M.length}人／チーム力 ${power()}／和 ${Math.round(S.team==null?60:S.team)}／💗${S.hp||0}pt</p><p class="hint">🎯 目標：${S.q!=null?QUESTS[S.q].t:"なし"}</p><p class="hint">🔥 モテ指数 ${moteIdx()}（${MT_RANK[moteLv()][1]}）</p><p class="hint">${mtWhisper()}</p>`;
 const pn=["roster","album","ach","set","boss","msg","phone","mote"].includes(menu);$("game").style.display=pn?"none":"grid";$("panel").style.display=pn?"block":"none";
 if(pn)$("panel").innerHTML=panel();
 const B=btn;
 $("cmd").innerHTML=pn?B("戻る","go('main')"):menu==="main"?
  B("🏐 全体練習","go('practice')")+B("📘 個別指導","go('coach')")+B("👭 部員","go('roster')")+
  B("👔 顧問","go('boss')")+B("📱 スマホ","go('phone')")+B("🎓 卒業アルバム","go('album')")+
  B("🏅 実績","go('ach')")+B("⚙ 設定","go('set')")+B("🗓 翌月に進む","endWeek()","p"):
  NM.map((n,j)=>B((menu==="practice"?"全体 ":"個別 ")+n,(menu==="practice"?"team(":"coach(")+j+")")).join("")+(menu==="coach"?extraBtns():menu==="practice"?btn("📋 全体指導","meet()")+btn("🗣 ミーティング","meeting()")+btn("☕ 雑談","zatsudan()")+btn(lv().length<2?"🎠 集団デート🔒恋仲2人":"🎠 集団デート（行動力2）","gdate()","",lv().length<2)+btn(hearts().length<3?"👑 ハーレムデー🔒恋心3人":"👑 ハーレムデー（行動力2）","haremDay()","",hearts().length<3)+(typeof superOpen==="function"?btn(superOpen()?"🌋 超ハーレムデー（行動力3）":"🌋 超ハーレムデー🔒恋仲1000人","superDay()","",!superOpen()):"")+(typeof serviceDay==="function"?btn(hearts().length<4?"🍰 ご奉仕デー🔒恋心4人":"🍰 ご奉仕デー（行動力2）","serviceDay()","",hearts().length<4):""):"")+B("戻る","go('main')")}
function bossArt(){return `<svg viewBox="0 0 120 150" role="img" aria-label="顧問のシルエット"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b7fe0"/><stop offset="1" stop-color="#0a3d6b"/></linearGradient></defs><path d="M10 150Q10 104 60 96Q110 104 110 150Z" fill="url(#bg)"/><rect x="50" y="76" width="20" height="26" rx="8" fill="url(#bg)"/><ellipse cx="60" cy="52" rx="24" ry="29" fill="url(#bg)"/><path d="M34 48Q36 18 62 18Q88 20 86 48Q76 32 58 34Q44 34 34 48Z" fill="#06284a"/></svg>`}
function bossPanel(){const b=S.B,R=(l,k,c="")=>`<span class="${c}">${l}</span><div class="t ${c}"><i style="width:${b[k]}%"></i></div><b>${b[k]}</b>`;
 return `<h2>👔 顧問（${S.B.name||"名前未設定"}）― ${title()}／${hrank()}</h2><div class="boss"><div class="sil">${bossArt()}</div><div class="st">${R("容姿","app")}${R("体力","stm")}${R("指導力","lead")}${R("包容力","kind")}${R("人気","pop","pop")}</div></div>
 <p class="hint">人気が高いほど、女子からのアプローチが増え（今月の発生率 約${Math.round(apRate()*100)}%）、好感度が上がりやすく（×${bonus().toFixed(2)}）、新入部員の初期好感度も高くなります。体力80以上で行動力が1増えます。指導力は練習の成長量、包容力は嫉妬の影響の軽減に効きます。</p>
 ${perkHtml()}${charterHtml()}${facHtml()}${endingHtml()}<div class="set"><h3>名前</h3><input id="bossName" class="txt" maxlength="8" value="${S.B.name||""}" placeholder="例：田中"> <button onclick="setName()">決定</button><p class="hint">女子たちは愛情に応じて呼び方が変わります（先生→「${S.B.name||"先生"}さん」→あなた→ダーリン…。呼び名は女子ごとに違います）。</p><h3>自分磨き（行動力1を消費・レベル制／上限なし）</h3>${upHtml()}</div>`}
const recruitRate=()=>Math.max(.05,Math.min(.95,S.B.pop/100+(has("charm")?.15:0)+(fac("club")?.1:0)+lvl("pop")*.01));  // 部員募集の成功率＝顧問の人気
function recruit(){if(S.M.length>=CFG.MAXM){toast(`部員は最大${CFG.MAXM}人です`);return}if(!spend())return;
 if(Math.random()>=recruitRate()){say("部員募集のポスターを貼ったが、応募はなかった…。人気を上げよう。");toast("応募はありませんでした");after();return}
 const m=fresh();S.M.push(m);S.cur=S.M.length-1;hist(`${m.n}が入部（愛情${m.love}）`);toast(`${m.n}が入部しました（愛情${m.love}）`);Snd.play("ok");after()}
function setName(){const v=$("bossName").value.replace(/[<>&"'\s]/g,"").slice(0,8);S.B.name=v;Save.write(S);toast(v?`「${v}先生」と呼ばれます`:"名前を未設定に戻しました");draw()}
function removeMember(){if(S.M.length<=1){toast("最後の部員は退部させられません");return}const m=S.M[S.cur];if(!confirm(`${m.n}を退部させますか?`))return;S.M.splice(S.cur,1);S.cur=0;hist(`${m.n}が退部`);toast(`${m.n}が退部しました`);after()}
/* ページ分け：部員・卒業アルバムは1ページ48人ずつ描画（数百〜数千人でも画面を開くのが重くならない）。k="R"=部員 / "A"=卒業アルバム */
const PG=48;let pgR=0,pgA=0;
const pgGet=k=>k==="R"?pgR:pgA,pgSet=(k,v)=>{if(k==="R")pgR=v;else pgA=v};
const pgClamp=(k,total)=>{const n=Math.max(1,Math.ceil(total/PG)),p=Math.max(0,Math.min(n-1,pgGet(k)));pgSet(k,p);return[p,n]};
const pgFrom=k=>pgGet(k)*PG;
const pageSlice=(a,k)=>{const[p]=pgClamp(k,a.length);return a.slice(p*PG,p*PG+PG)};
const pager=(k,total)=>{const[p,n]=pgClamp(k,total);if(n<2)return"";return `<div class="set"><button onclick="pg('${k}',-1e9)"${p<=0?" disabled":""}>«</button> <button onclick="pg('${k}',-1)"${p<=0?" disabled":""}>‹ 前</button> <b>${p+1} / ${n} ページ</b>（${PG}人ずつ） <button onclick="pg('${k}',1)"${p>=n-1?" disabled":""}>次 ›</button> <button onclick="pg('${k}',1e9)"${p>=n-1?" disabled":""}>»</button></div>`};
function pg(k,d){pgSet(k,pgGet(k)+d);draw()}
const saveUse=()=>{const n=Save.size(S);return `現在の使用量：約${Math.round(n/10000)}万文字／上限の目安 約${Save.LIMIT/10000}万文字（${(n/Save.LIMIT*100).toFixed(1)}%）`};
function panel(){
 if(menu==="roster")return `<h2>👭 部員（${S.M.length}人）</h2><div class="set"><button onclick="recruit()">＋ 部員募集（行動力1／成功率${Math.round(recruitRate()*100)}%）</button><button onclick="removeMember()">－ 部員を減らす（選択中：${S.M[S.cur].n}）</button></div>${pager("R",S.M.length)}<div class="ag">${pageSlice(S.M,"R").map((x,k)=>{const i=pgFrom("R")+k;return `<button class="ac ${i===S.cur?"on":""}" onclick="pick(${i})">${art(x)}<div><b>${x.n}</b> <i class="id">${x.id}</i><br>短大${x.g}年・${x.pos}<br>サーブ${x.s.srv} レシーブ${x.s.rcv}<br>スパイク${x.s.atk} 体力${x.s.stm}<br>♥ ${x.love}　やる気 ${x.mood}</div></button>`}).join("")}</div>${pager("R",S.M.length)}`;
 if(menu==="album")return `<h2>🎓 卒業アルバム</h2>`+(S.A.length>=2?`<div class="set"><button onclick="reunion()">🎊 卒業生を全員集める（行動力2・年1回）</button></div>`:"")+(S.A.length?pager("A",S.A.length)+`<div class="ag">${pageSlice(S.A.map((a,i)=>({a,i})).reverse(),"A").map(({a,i})=>`<div class="ac">${art(a)}<div><b>${a.n}</b> <i class="id">${a.id}</i><br>${a.pos}／${a.yr}年目に卒業<br>サーブ${a.s.srv} レシーブ${a.s.rcv}<br>スパイク${a.s.atk} 体力${a.s.stm}<br>♥ 愛情 ${a.love}<br>${nmz(endTxt(a.love))}<br><button class="mini" onclick="alumni(${i})">会う（行動力1）</button></div></div>`).join("")}</div>`+pager("A",S.A.length):"まだ卒業生はいません。");
 if(menu==="ach"){const n=ACH.filter(a=>S.ach[a.id]).length;return `<h2>🏅 実績（${n}/${ACH.length}）</h2>`+ACH.map(a=>`<div class="ach ${S.ach[a.id]?"":"lock"}"><i>${S.ach[a.id]?a.i:"🔒"}</i><div><b>${a.n}</b><br>${a.d}</div></div>`).join("")}
 if(menu==="mote")return moteHtml();
 if(menu==="boss")return bossPanel();
 if(menu==="msg")return msgPanel();
 if(menu==="phone")return phoneHtml();
 const c=Cfg.get();return `<div class="set"><h2>⚙ 設定</h2><h3>BGM</h3><input type="range" min="0" max="100" value="${c.bgm*100}" aria-label="BGM音量" onchange="Cfg.set({bgm:this.value/100});Bgm.set()"> <label class="b"><input type="checkbox" ${c.bgmMute?"":"checked"} onchange="Cfg.set({bgmMute:!this.checked});Bgm.set()"> 流す</label><h3>効果音</h3><input type="range" min="0" max="100" value="${c.vol*100}" aria-label="音量" onchange="setVol(this.value)"> <label class="b"><input type="checkbox" ${c.mute?"":"checked"} onchange="Cfg.set({mute:!this.checked})"> 鳴らす</label>
 <h3>セーブデータ</h3><p class="hint">進行は自動で保存されます。機種変更やバックアップには書き出しを使ってください。<br>${saveUse()}</p>
 <button onclick="Save.export(S);toast('書き出しました')">書き出し</button><label class="b">読み込み<input type="file" accept=".json,application/json" hidden onchange="importSave(this.files[0])"></label><button onclick="resetGame()">最初からやり直す</button>
 <h3>その他</h3><button onclick="Novel.play(INTRO.map(t=>({who:'',t})))">あらすじを見る</button><h3>アプリ</h3><button onclick="install()">ホーム画面にインストール</button><p class="hint">iPhone: Safariの共有メニュー→「ホーム画面に追加」／Android: ブラウザのメニュー→「アプリをインストール」。※https または localhost で開いた場合に有効です。</p></div>`}
/* ---------- 操作 ---------- */
function go(m){menu=m;if(m==="roster")pgR=Math.floor(S.cur/PG);if(m==="album")pgA=0;draw()}
function pick(i){S.cur=i;menu="main";const m=S.M[i],t=tier(m);say(t?m.L[t-1]:"「先生、お疲れさまです!」",m.n);draw()}
function step(d){pick((S.cur+d+S.M.length)%S.M.length)}
function spend(n=1){if(S.ap<n){say("今月の行動力を使い切りました。翌月に進みましょう。");toast("行動力がありません。翌月に進みましょう");Snd.play("lose");return false}S.ap-=n;return true}
function team(j){if(!spend())return;S.M.forEach(m=>{m.s[K[j]]=cl(m.s[K[j]]+3+rnd(0,2)+(S.B.lead/30|0)+(lvl("lead")/2|0)+(fac("gym")?1:0));m.mood=cl(m.mood-4)});say(NM[j]+"練習を実施。全員が成長したが、少し疲れた。");Snd.play("ok");menu="main";after()}
function coach(j){if(!spend())return;const m=S.M[S.cur];m.s[K[j]]=cl(m.s[K[j]]+7+rnd(0,3)+(S.B.lead/30|0)+(lvl("lead")/2|0));gain(m,3);m.mood=cl(m.mood-2);say(`「先生、ありがとうございます! ${NM[j]}、伸びた気がします!」`,m.n,"love");Snd.play("love");menu="main";after()}
function meet(){if(!spend())return;S.M.forEach(m=>{m.mood=cl(m.mood+8);gain(m,1)});say("全体指導で、チームの雰囲気が良くなった。");tm(4);menu="main";Snd.play("ok");
 const ge=groupEvent(.4);if(ge.length)Novel.play(ge);after()}  // 好感度の高い女子が複数いるとハーレムイベントが起きやすい
/* 全体練習の中の追加コマンド：ミーティング／雑談／集団デート（恋仲限定）。台本は novels.js の MEETING / CHAT / GDATE */
const some=n=>[...S.M].sort(()=>Math.random()-.5).slice(0,n);
function meeting(){if(!spend())return;const j=rnd(0,3);S.M.forEach(m=>{m.s[K[j]]=cl(m.s[K[j]]+1);m.mood=cl(m.mood+3)});tm(6);S.cnt.meeting=(S.cnt.meeting||0)+1;hist(`🗣 ミーティング（${NM[j]}の意識が上がった）`);
 menu="main";Snd.play("ok");Novel.play(scn(pk(MEETING),some(3)));after()}
function zatsudan(){if(!spend())return;S.M.forEach(m=>{m.mood=cl(m.mood+6);gain(m,1)});tm(2);S.cnt.chat=(S.cnt.chat||0)+1;hist("☕ 雑談でリフレッシュ");
 menu="main";Snd.play("love");Novel.play(scn(pk(CHAT),some(3)));after()}
function gdate(){const L=[...lv()].sort(()=>Math.random()-.5);if(L.length<2){toast("集団デートは恋仲が2人以上必要です");return}if(!spend(2))return;
 L.forEach(m=>{gain(m,4);m.lust=cl(m.lust+3);m.mood=cl(m.mood+8);m.poss=cl(m.poss-3)});tm(3);hpUp(1);S.cnt.gdate=(S.cnt.gdate||0)+1;hist(`🎠 集団デート：${L.length}人`);
 menu="main";Snd.play("love");Novel.play(scn(pk(GDATE[Math.min(3,L.length)]),L));after()}
/* ハーレム（好感度80以上の人数）と嫉妬・イベント */
const lv=()=>S.M.filter(m=>m.lover);                          // 現在の恋仲（キス以上）の部員
const hc=()=>lv().length;
const lovers=()=>[...S.M,...S.A,...(S.tch||[])].filter(m=>m.lover).length;    // 恋仲になった累計人数（卒業生も含む）
function haremCheck(){const out=[],top=lv().sort((a,b)=>b.love-a.love);
 HAREM.forEach(h=>{if(top.length>=h.n&&!S.fl["h"+h.n]){S.fl["h"+h.n]=1;hist(`★ハーレムイベント：${h.title}`);out.push(...SCENES.harem(top,h))}});return out}
/* ---------- 個別行動：食事・相談・遊び・部屋（台本は novels.js の NOVEL。複数パターンからランダム） ---------- */
/* 名前の変数：{name}{sei}{mei}{pos}=1人目、{name2}…=2人目、{name3}…=3人目。{boss}=顧問の名前 */
const fmt=(t,ms)=>{const A=[].concat(ms);[0,1,2].forEach(i=>{const m=A[i]||A[0],p=m.n.split(" "),s=i?i+1:"";t=t.replace(new RegExp("\\{name"+s+"\\}","g"),m.n).replace(new RegExp("\\{sei"+s+"\\}","g"),p[0]).replace(new RegExp("\\{mei"+s+"\\}","g"),p[1]||m.n).replace(new RegExp("\\{pos"+s+"\\}","g"),m.pos)});return t.replace(/\{(boss|b)\}/g,S.B.name||"先生").replace(/\{num\}/g,A.length)};
/* シーン変換：[話者,文]の配列→ノベル行。話者 ""=地の文 / "@"=1人目 / "@2"=2人目 / "@3"=3人目 */
const scn=(pat,A)=>pat.map(([w,t])=>{const i=w==="@"?0:/^@\d$/.test(w)?w[1]-1:-1,m=A[i]||A[0];return{who:i<0?w:m.n,t:fmt(t,A),m,ms:i<0&&A.length>=3?A:undefined}});
const highs=()=>S.M.filter(m=>m.love>=70);
/* ハーレムイベント：好感度70以上の女子が2人以上いると発生（人数が多いほど起きやすい）。台本は novels.js の HGROUP */
function groupEvent(p){const h=highs();if(h.length<2||Math.random()>Math.min(.95,p+.08*(h.length-2)+(S.charter==="free"?.15:0)))return[];
 const sh=[...h].sort(()=>Math.random()-.5),big=h.length>=4&&Math.random()<.6,A=big?sh:sh.slice(0,Math.min(3,h.length)); // 4人以上いると「超ハーレム」（全員に囲まれる）
 A.forEach(m=>{gain(m,big?3:2);m.poss=cl(m.poss+4)});S.cnt.group=(S.cnt.group||0)+1;if(big)S.cnt.mass=(S.cnt.mass||0)+1;hpUp(big?2:1);
 hist(big?`★超ハーレムイベント：${A.length}人に囲まれた`:`★ハーレムイベント：${A.map(m=>m.n.split(" ")[1]||m.n).join("・")}`);
 return[...scn(pk(big?HMASS:HGROUP[A.length]),A),choiceLine(A,HCHOICE)]}
/* 選択肢：効果 fx は {all:全員, one:1人目, rest:2人目以降, pop:人気} に {love,poss,lust,mood} を指定。need={pop}で人気が足りないと選べない、min=必要人数 */
function applyFx(fx,A){const ap=(m,o)=>{if(o.love)gain(m,o.love);if(o.poss)m.poss=cl(m.poss+o.poss);if(o.lust)m.lust=cl(m.lust+o.lust);if(o.mood)m.mood=cl(m.mood+o.mood)};
 if(fx.all)A.forEach(m=>ap(m,fx.all));if(fx.one)ap(A[0],fx.one);if(fx.rest)A.slice(1).forEach(m=>ap(m,fx.rest));if(fx.pop)popUp(fx.pop);if(fx.team)tm(fx.team);if(fx.hp)hpUp(fx.hp);if(fx.lover==="all")A.forEach(m=>m.lover=true);if(fx.lover==="one")A[0].lover=true}
const choiceLine=(A,opts)=>({who:"",t:"どうする?",m:A[0],ch:opts.filter(o=>!o.min||A.length>=o.min).map(o=>({t:o.t+(o.need?`（人気${o.need.pop}）`:""),off:!!o.need&&S.B.pop<o.need.pop,r:fmt(o.r,A),f:()=>{applyFx(o.fx,o.who==null?A:[A[o.who],...A.filter((_,j)=>j!==o.who)]);Save.write(S);draw()}}))});
/* ---------- 恋心・告白ラッシュ・学園祭・特技・部の和 ---------- */
const hearts=()=>S.M.filter(m=>m.love>=60);                       // 恋心を寄せている女子（愛情60以上）
/* 告白ラッシュ：愛情85以上が3人以上＆人気60以上で、毎月35%。選択肢で全員を受け止める／一人を選ぶ等。台本は novels.js の RUSH / RUSHCHOICE */
function rush(){const h=S.M.filter(m=>m.love>=85);if(h.length<3||S.B.pop<60||Math.random()>.35)return[];
 const A=[...h].sort((a,b)=>b.love-a.love);S.cnt.rush=(S.cnt.rush||0)+1;hist(`💌 告白ラッシュ！${A.length}人から告白`);return[...scn(pk(RUSH),A),choiceLine(A,RUSHCHOICE)]}
/* 学園祭ミスターコン（11月）：人気で結果が変わる。台本は novels.js の CONTEST */
function contest(){if((S.w+2)%12+1!==11)return[];const c=hearts().length,k=S.B.pop>=80?"win":S.B.pop>=50?"mid":"low",e=CONTEST[k];
 popUp(e.pop);hpUp(e.hp);if(k==="win")S.cnt.contest=(S.cnt.contest||0)+1;hist(`🏆 学園祭ミスターコン：${e.n}`);
 const top=hearts().sort((a,b)=>b.love-a.love)[0];return e.lines.map(([w,t])=>({who:w,t:fmt(t.replace(/\{num\}/g,c),[{n:"部員",pos:""}]),m:top}))}
/* 部の「和」：嫉妬や特別扱いで下がり、全体指導や平等な接し方で上がる。25未満だと毎月みんなのやる気が下がる */
function teamCheck(){tm(1);inboxStep();charterStep();if(S.team<25){S.M.forEach(x=>x.mood=cl(x.mood-8));hist("⚠ 部の和が崩れている…（みんなのやる気↓）")}
 if(hearts().length>=3)hist(`💞 今月は${hearts().length}人の女子から好意を寄せられた`)}
/* 特技：ハートポイント(💗)で習得。定義は data.js の PERKS */
function perkHtml(){return `<div class="set"><h3>特技（💗${S.hp||0}pt）</h3>${PERKS.map(p=>S.perks[p.id]?`<div class="ach"><i>✅</i><div><b>${p.n}</b><br>${p.d}</div></div>`:`<div class="ach"><div><b>${p.n}</b>（${p.cost}pt）<br>${p.d}</div><button onclick="buyPerk('${p.id}')">習得</button></div>`).join("")}</div>`}
function buyPerk(id){const p=PERKS.find(x=>x.id===id);if((S.hp||0)<p.cost){toast("ハートポイントが足りません");return}S.hp-=p.cost;S.perks[id]=1;toast(`特技「${p.n}」を習得`);Snd.play("ach");after()}
/* 好意の伝達：恋仲（愛情70以上）か愛情90以上の女子が、毎月のように「好き」と伝えてくる。1人ずつ／4人以上いると大勢に囲まれて一斉に。台本は novels.js の AFFECT / AFFECT_MASS */
function affection(){const q=S.M.filter(m=>m.lover&&m.love>=70||m.love>=90);if(!q.length)return[];const up=m=>{m.mood=cl(m.mood+4);m.lust=cl(m.lust+2)};
 if(q.length>=4&&Math.random()<.5){const A=[...q].sort(()=>Math.random()-.5);A.forEach(up);S.cnt.confess=(S.cnt.confess||0)+A.length;hist(`💗 ${A.length}人から一斉に「好き」と言われた`);return scn(pk(AFFECT_MASS),A)}
 return q.filter(m=>Math.random()<(m.love-60)/90).sort(()=>Math.random()-.5).slice(0,2).flatMap(m=>{up(m);S.cnt.confess=(S.cnt.confess||0)+1;hist(`💗 ${m.n}から「好き」と言われた`);return scn(pk(AFFECT),[m])})}
/* エンディング：まとめて結ばれる（個別エンドなし）。条件=恋仲5人以上＆人気70以上。7人以上でハーレム、10人以上で超ハーレム。台本は novels.js の ENDING */
const endingKey=()=>{const n=lv().length;return S.B.pop<70||n<5?null:n>=10?"supreme":n>=7?"harem":"all"};
function endingHtml(){const k=endingKey();return `<div class="set"><h3>エンディング</h3><p class="hint">恋仲5人以上かつ人気70以上で、みんなと結ばれるエンディングを迎えられます（現在：恋仲${lv().length}人／人気${S.B.pop}）。迎えた後も続きを遊べます。${S.fl.endName?`到達済み：${S.fl.endName}`:""}</p><button onclick="ending()"${k?"":" disabled"}>🎊 みんなと結ばれる</button> <button onclick="newCycle()"${S.fl.ending?"":" disabled"}>🔁 二周目を始める（引き継ぎ）</button>${hofHtml()}</div>`}
function ending(){const k=endingKey();if(!k){toast("エンディングの条件を満たしていません");return}if(!confirm("エンディングを迎えます。（迎えた後も続きを遊べます）"))return;
 const e=ENDING[k],cur=lv(),al=S.A.filter(m=>m.lover),tot=cur.length+al.length,sh=[...cur].sort((a,b)=>b.love-a.love).slice(0,6),top=sh[0];
 const f=t=>fmt(t.replace(/\{num\}/g,tot).replace(/\{numA\}/g,al.length),cur);
 const L=[...e.lines.map(([w,t])=>({who:w,t:f(t),m:top,ms:cur})),...sh.map(m=>({who:m.n,t:m.E||pk(E_DEFAULT),m})),
  ...(cur.length>6?[{who:"",t:`ほかの${cur.length-6}人も、口々に「好き」と言っている。`,m:top}]:[]),...(al.length?[{who:"",t:f("卒業した{numA}人も、{boss}のもとへ駆けつけた。"),m:top}]:[]),{who:"",t:f(e.end),m:top,ms:cur}];
 S.fl.ending=(S.fl.ending||0)+1;S.fl.endName=e.n;hpUp(10);hist(`🎊 エンディング：${e.n}`);menu="main";Snd.play("win");Novel.play(L,()=>{toast(`エンディング「${e.n}」到達！ 物語は続きます`);after()})}
/* ---------- 施設・ハーレム規模・夏合宿・ライバル ---------- */
const fac=id=>S.fac&&S.fac[id];                                   // 施設を導入済みか
const roomReq=()=>fac("office")?50:70;                            // 「部屋に呼ぶ」に必要な情欲
const hrank=()=>HRANKS.filter(x=>lovers()>=x[0]).pop()[1];        // ハーレム規模ランク（恋仲の累計人数）
function facHtml(){return `<div class="set"><h3>部室の施設（💗${S.hp||0}pt）</h3>${FACILITIES.map(p=>S.fac[p.id]?`<div class="ach"><i>🏠</i><div><b>${p.n}</b>（導入済み）<br>${p.d}</div></div>`:`<div class="ach"><div><b>${p.n}</b>（${p.cost}pt）<br>${p.d}</div><button onclick="buyFac('${p.id}')">導入</button></div>`).join("")}</div>`}
function buyFac(id){const p=FACILITIES.find(x=>x.id===id);if((S.hp||0)<p.cost){toast("ハートポイントが足りません");return}S.hp-=p.cost;S.fac[id]=1;toast(`「${p.n}」を導入`);Snd.play("ach");after()}
/* 夏合宿：8月に3夜連続。毎晩「誰と過ごすか」を選ぶ（選んだ子の愛情・情欲↑、他の子の独占欲↑）。台本は novels.js の CAMP */
function camp(){if((S.w+2)%12+1!==8)return[];const A=hearts().sort(()=>Math.random()-.5).slice(0,3);if(!A.length)return[];hist("🏕 夏合宿");const out=[];
 CAMP.nights.forEach(nt=>{const ops=A.map((m,i)=>({t:fmt("{mei}と"+nt.act,[m]),who:i,fx:{one:{love:8,lust:4},rest:{poss:3,love:-1}},r:fmt(nt.r,[m])}));
  ops.push({t:"みんなでキャンプファイヤーを囲む",fx:{all:{love:3,mood:4},team:4},r:"みんなで歌って笑って、最高の夜になった。"});
  out.push(...scn(nt.lines,A),choiceLine(A,ops))});
 hpUp(2);S.cnt.camp=(S.cnt.camp||0)+1;return out}
/* ライバル：人気55以上で20%。愛情50〜84で恋仲でない女子に他校の教師が接近。台本は novels.js の RIVAL / RIVALCHOICE */
function rival(){if(S.B.pop<55||Math.random()>.2)return[];const t=S.M.filter(m=>m.love>=50&&m.love<85&&!m.lover);if(!t.length)return[];
 const m=pk(t);hist(`🥀 ライバル出現：${m.n}`);return[...scn(pk(RIVAL),[m]),choiceLine([m],RIVALCHOICE)]}
/* ---------- 二周目（引き継ぎ）：エンディング後に顧問画面から。顧問のステータス・名前・実績は常に引き継ぎ、特典を1つ選ぶ。周回するほど女子の初期好感度と人気の初期値が高くなる ---------- */
const hofHtml=()=>(S.hof||[]).length?`<p class="hint">殿堂入り：${S.hof.map(h=>`${h.ng}周目「${h.end}」恋仲${h.lovers}人`).join("／")}</p>`:"";
function newCycle(){if(!S.fl.ending){toast("エンディングを迎えると二周目に進めます");return}if(!confirm("二周目を始めます。（顧問のステータス・名前・実績は引き継がれます）"))return;
 const opts=[["perk","特技をすべて引き継ぐ","習得した特技を、そのまま引き継いだ。"],["fac","部室の施設をすべて引き継ぐ","整った部室が、そのまま新年度を迎えた。"],["pop","人気60からスタートする","学園中が、{boss}の噂でもちきりだ。"],["hp","ハートポイント+30","たっぷりのハートが、あなたを待っている。"]];
 Novel.play([{who:"",t:"物語は、新しい春へ——。二周目の特典を一つ選んでください。",ch:opts.map(([k,t,r])=>({t,r:fmt(r,[{n:"部員",pos:""}]),f:()=>startNG(k)}))}])}
function startNG(k){const o=S,run=(o.ng||0)+1,hof=[...(o.hof||[]),{ng:run,end:o.fl.endName||"—",lovers:lovers()}];
 newGame(run);S.hof=hof;S.perks=k==="perk"?o.perks:{};S.fac=k==="fac"?o.fac:{};S.hp=Math.floor((o.hp||0)/2)+10+(k==="hp"?30:0);
 S.B={...o.B,pop:k==="pop"?60:Math.min(60,35+run*5)};S.ach=o.ach;menu="main";say(`${run+1}周目のはじまり。新年度、ふたたび体育館に着任した。`);after();toast(`${run+1}周目スタート！`)}
/* ---------- 冬の大型イベント：バレンタイン(2月)・ホワイトデー(3月)・クリスマスパーティー(12月)。台本は novels.js の VAL / WHITE / XMAS ---------- */
/* 「誰と過ごすか」を選ぶ夜：AA=候補（先頭k人）＋その他、list=夜の台本、extra=追加の選択肢 */
const nights=(AA,list,extra=[],k=3)=>list.flatMap(nt=>{const ops=AA.slice(0,k).map((m,i)=>({t:fmt("{mei}と"+nt.act,[m]),who:i,fx:{one:{love:10,lust:5},rest:{poss:4,love:-1}},r:fmt(nt.r,[m])})).concat(extra);
 return[...scn(nt.lines,AA),choiceLine(AA,ops)]});
const monthIs=m=>(S.w+2)%12+1===m;
function valentine(){if(!monthIs(2))return[];const A=hearts().sort((a,b)=>b.love-a.love);if(!A.length)return[];
 popUp(1+(A.length/3|0));hpUp(2);S.cnt.val=(S.cnt.val||0)+1;hist(`🍫 バレンタイン：${A.length}人から本命チョコ`);
 return[...scn(VAL.lines,A),choiceLine(A,VALCHOICE)]}
function whiteday(){if(!monthIs(3))return[];const A=hearts().sort((a,b)=>b.love-a.love);if(!A.length)return[];hist("🎁 ホワイトデー");
 return[...scn(WHITE.lines,A),choiceLine(A,WHITECHOICE)]}
function xmas(){if(!monthIs(12))return[];const A=hearts().sort(()=>Math.random()-.5);if(!A.length)return[];
 A.forEach(m=>{gain(m,3);m.mood=cl(m.mood+6)});hpUp(2);S.cnt.xmas=(S.cnt.xmas||0)+1;hist(`🎄 クリスマスパーティー：${A.length}人`);
 return[...scn(XMAS.party,A),...nights(A,[XMAS.night],XMAS.extra)]}
/* 修羅場：恋仲が2人以上いて独占欲の高い子が詰め寄ってくる。包容力が高いと起きにくい。選択で愛情・独占欲が変わる */
function shura(){if(lv().length<2)return[];const t=lv().filter(m=>m.poss>=70&&Math.random()<(m.poss-60)/100-S.B.kind/400);if(!t.length)return[];
 const m=pk(t);S.cnt.shura=(S.cnt.shura||0)+1;hist(`⚡ 修羅場：${m.n}`);return[...scn(pk(SHURA),[m]),choiceLine([m],SHURA_CHOICE)]}
/* 今月の目標：達成で人気UP。未達成の目標からランダムに出題 */
function questStep(){if(S.q!=null&&QUESTS[S.q].ok(S)){const q=QUESTS[S.q];popUp(q.rew);hpUp(2);S.qd=(S.qd||0)+1;toast(`目標達成！ 人気+${q.rew}`);hist(`🎯 目標達成：${q.t}`);Snd.play("ach");S.q=null}
 if(S.q==null){const c=QUESTS.map((q,i)=>i).filter(i=>!QUESTS[i].ok(S));if(c.length){S.q=pk(c);hist(`🎯 新しい目標：${QUESTS[S.q].t}`)}}}
/* 季節イベント：愛情60以上の女子（最大3人）が登場。台本は novels.js の SEASON（月=カレンダーの月） */
function season(){const mo=(S.w+2)%12+1,e=SEASON[mo];if(!e||[2,12].includes(mo))return[];  // 2月・12月は大型イベントに置き換え
 const t=S.M.filter(m=>m.love>=60).sort(()=>Math.random()-.5).slice(0,3);if(!t.length)return[];
 hist(`🎉 ${e.n}`);return t.flatMap(m=>{gain(m,3);return scn(pk(e.p),[m])})}
/* 卒業生：アルバムから「会う」。愛情に応じて友人→デート→キス（愛情90以上で恋仲）。毎月、愛情70以上の卒業生が会いに来ることも */
function alumni(i){const a=S.A[i];if(!spend())return;const k=a.love>=90||a.lover?"alu_hi":a.love>=60?"alu_mid":"alu_low";
 if(k==="alu_hi")a.lover=true;gain(a,4);S.cnt.alumni=(S.cnt.alumni||0)+1;hist(`卒業生に会う：${a.n}`);Snd.play("love");Novel.play(scn(pk(NOVEL[k]),[a]));after()}
/* 卒業生を全員集める（卒業アルバムのボタン）：行動力2・年1回。セリフと選択肢は campus.js。実績 x_reunion1/5 */
function reunion(){const A=S.A;if(A.length<2){toast("卒業生が2人以上必要です");return}const key="reunion"+S.y;if(S.fl[key]){toast("今年はすでに集まりました（年1回）");return}if(!spend(2))return;S.fl[key]=1;
 Novel.play(reunionLines(A));after()}   // 台本・選択肢は campus.js の CAMPUS.reunion / reunionLines()
function visit(){const t=S.A.filter(a=>a.love>=70);if(!t.length||Math.random()>.3)return[];const a=pk(t);gain(a,2);hist(`💌 卒業生の来訪：${a.n}`);return scn(pk(NOVEL.alu_visit),[a])}
const ACT={meal:{ap:1,love:8,mood:10,t:"食事"},talk:{ap:1,love:5,mood:15,t:"相談"},date:{ap:2,love:10,mood:12,lust:3,t:"遊び"},room:{ap:1,love:6,mood:8,lust:8,t:"部屋"}}; // ap=行動力 love=愛情上昇 mood=やる気 lust=情欲
function extraBtns(){const m=S.M[S.cur];return btn("🍽 食事に誘う","act('meal')")+btn("💬 相談に乗る","act('talk')")
 +btn(m.love<70?"🎡 遊びに誘う🔒愛情70":"🎡 遊びに誘う（行動力2）","act('date')","",m.love<70)+btn(m.lust<roomReq()?"🚪 部屋に呼ぶ🔒情欲"+roomReq():"🚪 部屋に呼ぶ","act('room')","",m.lust<roomReq())}
function act(k){const m=S.M[S.cur],a=ACT[k];if(k==="date"&&m.love<70||k==="room"&&m.lust<roomReq()){toast("まだ誘えません");return}if(!spend(a.ap))return;
 gain(m,a.love);m.mood=cl(m.mood+a.mood);if(a.lust)m.lust=cl(m.lust+a.lust);S.cnt[k]=(S.cnt[k]||0)+1;hist(`${a.t}：${m.n}`);menu="main";Snd.play("love");
 const kiss=k==="date"&&m.love>=85&&Math.random()<.6;if(kiss){m.lover=true;hpUp(2)}  // 愛情85以上のデートではキス（恋仲になる）
 Novel.play(scn(pk(kiss?NOVEL.kiss:NOVEL[k]),[m]));after()}
/* ---------- モテ要素：称号・来訪者 ---------- */
const title=()=>TITLES.filter(x=>S.B.pop>=x[0]).pop()[1];
function titleCheck(){const t=title();if(S.fl.title&&S.fl.title!==t)toast(`称号「${t}」を獲得`);S.fl.title=t;const r=hrank();if(S.fl.hr&&S.fl.hr!==r)toast(`ハーレム規模「${r}」に昇格`);S.fl.hr=r}
function ext(){const i=S.fl.ext||0,e=EXT[i];if(!e||S.B.pop<e.pop||Math.random()>.3)return[];S.fl.ext=i+1;popUp(e.gain);lv().forEach(m=>{m.poss=cl(m.poss+6);m.mood=cl(m.mood-3)});hist(`★来訪者：${e.n}（${e.role}）`);return e.lines.map(([w,t])=>({who:w==="@"?e.n:w,t:fmt(t,{n:e.n,pos:e.role})}))}
/* 毎月の会話イベント：愛情70以上で発生率UP（90以上はほぼ確実）、情欲が高いと別の会話が発生。台本は data.js の CONV */
const talkRate=l=>l>=90?.95:l>=70?.2+(l-70)*.035:0;
const lustRate=x=>x>=85?.8:x>=60?.1+(x-60)*.028:0;
function monthlyTalks(){const pool=[],out=[];
 S.M.forEach(m=>{if(Math.random()<talkRate(m.love))pool.push([m,"love"]);if(Math.random()<lustRate(m.lust))pool.push([m,"lust"])});
 pool.sort(()=>Math.random()-.5).slice(0,CFG.TALKMAX).forEach(([m,k])=>{out.push(...pk(CONV[k])(m));gain(m,k==="love"?2:1);if(k==="lust")m.lust=cl(m.lust+3);hist(`💬 ${m.n}との${k==="love"?"会話":"二人きりの会話"}`)});return out}
function approach(){const n=Math.min(15,(Math.random()<apRate()?1:0)+(Math.random()<apRate()*.5?1:0)+(S.B.pop>=80&&Math.random()<.4?1:0)+(hearts().length/4|0)+(S.charter==="free"&&Math.random()<.5?1:0));   // 恋心の人数が多くても1か月に最大15回（画面とログが埋まらないように）
 for(let i=0;i<n;i++){const m=wp(S.M,x=>x.love+x.lust+10);gain(m,3+(m.lust/25|0));say(pk(APPROACH),m.n,"love")}if(n)Snd.play("love")} // 人気が高いほどアプローチが増える
function jealous(){if(hc()<2||Math.random()>.25)return;const t=lv(),a=pk(t),b=pk(t.filter(x=>x!==a));
 say(`${a.n}と${b.n}が、顧問の隣をめぐって火花を散らしている…。`,"","love");tm(-3);gain(a,2);gain(b,2);const pen=x=>Math.max(0,5+(x.poss/20|0)-(S.B.kind/25|0));a.mood=cl(a.mood-pen(a));b.mood=cl(b.mood-pen(b));a.poss=cl(a.poss+8);b.poss=cl(b.poss+8)}
const LOVE_SC_MAX=5;   // 1回の after() で再生する恋愛イベントの人数上限（ファンイベント等で数百人が一斉に閾値を超えても、ノベルが何百本も並ばないように）
function after(){ // 恋愛イベント判定→ノベルパート
 let sc=[],shown=new Set(),skipped=0;S.M.forEach(m=>{if(m.love>=95)S.fl.love95=1;CFG.TIER.forEach((t,i)=>{if(m.love>=t&&!m.ev[i]){m.ev[i]=1;if(i===2)m.lover=true;hpUp(i===2?3:1);
  if(shown.size<LOVE_SC_MAX||shown.has(m)){if(!shown.has(m)){S.cur=S.M.indexOf(m);shown.add(m)}hist(`★${m.n}の恋愛イベント`);sc.push(...SCENES.love(m,i))}else skipped++}})});
 if(skipped)hist(`★ほか${skipped}件の恋愛イベント（まとめて達成）`);
 sc.push(...haremCheck());titleCheck();questStep();checkAch();Save.write(S);draw();if(sc.length){Snd.play("love");Novel.play(sc)}}
function hist(t){const p=document.createElement("p");p.className="big";p.textContent=t;$("hist").prepend(p);trimHist()}
function graduate(){ // 3年生が卒業→進級→新入部員
 const out=S.M.filter(m=>m.g>=3),L=[],GRAD_SC=6;out.forEach(m=>{S.A.push({...m,s:{...m.s},yr:S.y})});
 const top=[...out].sort((a,b)=>b.love-a.love);top.slice(0,GRAD_SC).forEach(m=>L.push(...SCENES.grad(m)));   // 卒業シーンは愛情の高い順に最大6人（大人数の年でもノベルが何百本も並ばない）
 if(out.length>GRAD_SC)L.push({who:"",t:`ほか${out.length-GRAD_SC}人も、それぞれの想いを胸に巣立っていった。`,m:top[0]});
 S.M=S.M.filter(m=>m.g<3);S.M.forEach(m=>m.g++);
 let n=Math.max(0,Math.min(rnd(2,3),CFG.MAXM-S.M.length));for(let i=0;i<n;i++)S.M.push(fresh());while(S.M.length<8){S.M.push(fresh());n++}
 hist(`卒業${out.length}人／新入部員${n}人`);return L}
let busy=0;                                                      // 月送り中（演出が終わるまで）の二重実行を防ぐ
const safe=(f,n)=>{try{return f()||[]}catch(e){console.error("event error:",n,e);return[]}};  // イベント1つが失敗しても、月送り全体は止めない
function endWeek(){try{endWeek0()}catch(e){busy=0;console.error(e);errToast(e);throw e}}  // どこかで失敗しても、月送りのロックが残らず、原因が画面に出る
function endWeek0(){
 if(busy&&Date.now()-busy<20000)return;busy=Date.now();
 const m=pk(S.M),r=Math.random();
 if(r<.35){gain(m,4);say("「先生、差し入れです。みんなには内緒ですよ?」",m.n,"love")}
 else if(r<.55){m.mood=cl(m.mood-10);say("調子を落としている様子だ。声をかけてあげよう。",m.n)}
 else if(r<.75){gain(m,3);say(`OGから、顧問と${m.n}の仲を冷やかされた。モテ度が上がった。`,"","love")}
 S.B.pop=cl(S.B.pop+(lv().length/2|0)+(fac("club")?1:0));safe(approach,"approach");safe(teamCheck,"teamCheck");
 if(S.w%4===0){const o=(70+S.w*7)*2+Math.min((S.y-1)*30,360)+rnd(0,40),p=power()+rnd(0,40),w=p>=o; // 大会は4か月ごと
  say(`大会 チーム力${p} 対 相手${o} → ${w?"勝利!":"惜敗…"}`,"","big");Snd.play(w?"win":"lose");
  if(w){S.wins++;popUp(3);hpUp(2);S.M.forEach(x=>{x.mood=cl(x.mood+12);gain(x,2)})}else S.M.forEach(x=>x.mood=cl(x.mood-8))}
 S.weeks++;let L=[];
 [["autoJoin",()=>autoJoin()],["campus",()=>campus()],["monthlyTalks",()=>monthlyTalks()],["groupEvent",()=>groupEvent(.3)],["rush",()=>rush()],["affection",()=>affection()],["shura",()=>shura()],["rival",()=>rival()],["camp",()=>camp()],["ogkai",()=>ogkai()],["valentine",()=>valentine()],["whiteday",()=>whiteday()],["xmas",()=>xmas()],["contest",()=>contest()],["visit",()=>visit()],["morningGate",()=>morningGate()],["mtExtra",()=>mtExtra()],["season",()=>season()],["ext",()=>ext()],["nukegake",()=>typeof nukegake==="function"?nukegake():[]],["taikaiDay",()=>typeof taikaiDay==="function"?taikaiDay():[]],["teacherApproach",()=>typeof teacherApproach==="function"?teacherApproach():[]]].forEach(([n,f])=>L.push(...safe(f,n)));
 if(S.w>=CFG.TURNS){L.push(...safe(graduate,"graduate"));S.y++;S.w=1}else S.w++;
 S.ap=apMax();menu="main";S.M.forEach(x=>x.mood=cl(x.mood+3+(fac("lounge")?3:0)));
 const sub=S.w===1?"新年度がはじまります":S.w%4===0?"今月は大会です":"";
 Novel.play(L,()=>banner(`${S.y}年目 ${S.w}か月目`,sub,()=>{busy=0;after();if(typeof notifStorm==="function")notifStorm()})); // 卒業シーン→月替わり演出→保存（終わったら次の月送りを受け付ける）
 draw()}
/* ---------- 設定まわり ---------- */
function setVol(v){Cfg.set({vol:v/100});Snd.play("ok")}
function importSave(f){if(!f)return;Save.import(f,d=>{S=fix(d);Save.write(S);menu="main";draw();toast("読み込みました")},()=>toast("読み込めませんでした"))}
function resetGame(){if(confirm("セーブデータを消して最初からやり直します。よろしいですか?")){Save.reset();newGame();menu="main";say("新年度、短大女子バレー部の顧問に着任した。まずは部員と向き合おう。");after()}}
function install(){if(dip){dip.prompt();dip=null}else toast("下の案内のとおり、ブラウザのメニューから追加してください")}
addEventListener("beforeinstallprompt",e=>{e.preventDefault();dip=e});
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
/* エラーが起きたら画面に原因を出す（ボタンが反応しない時の調査用） */
function errToast(e){try{toast("エラー："+(e&&e.message||e));clearTimeout(toast.h);toast.h=setTimeout(()=>$("toast").classList.remove("on"),8000)}catch(_){}}
addEventListener("error",e=>errToast(e.error||e.message));
/* ハーレムデー（保険）：別ファイルに haremDay が無い場合だけ、この簡易版を使う */
if(typeof haremDay!=="function")window.haremDay=function(){const A=hearts();if(A.length<3){toast("ハーレムデーは恋心を寄せる女子が3人以上で開けます");return}if(!spend(2))return;
 A.forEach(m=>{gain(m,3);m.lust=cl(m.lust+2);m.mood=cl(m.mood+6);m.poss=cl(m.poss+3)});tm(-1);popUp(1);hpUp(1);S.cnt.hday=(S.cnt.hday||0)+1;hist(`👑 ハーレムデー：${A.length}人`);menu="main";Snd.play("love");
 const six=[...A].sort(()=>Math.random()-.5).slice(0,6);
 Novel.play([{who:"",t:`恋心を寄せる${A.length}人を連れて、みんなで一日お出かけした。右にも左にも女子。`,m:six[0],ms:six},...six.slice(0,3).map(m=>({who:m.n,t:pk(["「先生の隣、私ですよね?」","「今日は一日、先生を独り占めしたいな。」","「みんなと一緒も、楽しいですね!」"]),m}))]);after()};
/* ---------- 起動 ---------- */
(()=>{try{const u=$("unread");if(!u)return;const st=document.createElement("style");st.textContent="#unread{display:none!important}";document.head&&document.head.appendChild(st); // 女子のいる画面の隅の📱アイコンを消す（スマホは下のコマンド「📱 スマホ」から開く）
 const e=u.closest("button,a,[onclick]")||u.parentElement;if(e&&e.id!=="pt"&&e.id!=="game"&&e.id!=="stage"&&(e.children.length<=2||/📱/.test(e.textContent)))e.remove();else u.remove()}catch(e){}})();
(()=>{const d=Save.load();if(d){S=fix(d);say("おかえりなさい、顧問。続きからはじめましょう。")}else{newGame();say("新年度、短大女子バレー部の顧問に着任した。まずは部員と向き合おう。")}questStep();checkAch();draw();Bgm.play("main");if(!d&&!Cfg.get().intro){Cfg.set({intro:1});Novel.play(INTRO.map(t=>({who:"",t})),()=>toast("まず「顧問」画面で名前を決めましょう"))}})(); // あらすじは初回のみ
