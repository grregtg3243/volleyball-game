/* game.js : ゲーム本体（状態・ルール・画面描画）。終了条件なし＝延々と続きます */
"use strict";
let S={no:0},menu="main",dip=null;
const $=id=>document.getElementById(id),cl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+(Math.random()*(b-a+1)|0),pk=a=>a[Math.random()*a.length|0];
const gain=(m,v)=>{m.love=cl(m.love+v*CFG.LM)};                       // 好感度上昇（倍率込み）
const tier=m=>m.love>=CFG.TIER[2]?3:m.love>=CFG.TIER[1]?2:m.love>=CFG.TIER[0]?1:0;
const avg=m=>(m.s.srv+m.s.rcv+m.s.atk+m.s.stm)/4;
const lineup=()=>[...S.M].sort((a,b)=>avg(b)-avg(a)).slice(0,8);       // 試合に出る上位8人
const power=()=>Math.round(lineup().reduce((a,m)=>a+avg(m)*(.6+m.mood/250),0));
const endTxt=l=>l>=95?"卒業の日、先生に想いを告げた。":l>=80?"卒業後も会う約束を交わした。":l>=60?"感謝の言葉を残して巣立った。":"笑顔で巣立っていった。";
/* ---------- 状態 ---------- */
function mk(c){return{n:c.n,g:c.g,pos:c.pos,hair:c.hair,eye:c.eye,style:c.style,no:++S.no,s:{srv:c.s[0],rcv:c.s[1],atk:c.s[2],stm:c.s[3]},mood:c.mood,love:CFG.START,ev:[],L:c.L||DL,img:c.img||""}}
function fresh(){const all=[...S.M,...S.A];let n;do{n=pk(POOL.sn)+" "+pk(POOL.gn)}while(all.some(x=>x.n===n));
 return mk({n,g:1,pos:pk(POOL.ps),hair:pk(POOL.hc),eye:pk(POOL.ec),style:pk(POOL.st),s:[rnd(20,32),rnd(20,32),rnd(15,30),rnd(25,35)],mood:70})}
function newGame(){S={no:0,y:1,w:1,ap:3,wins:0,weeks:0,cur:0,A:[],ach:{},fl:{}};S.M=CAST.map(mk)}
/* ---------- 表示補助 ---------- */
function say(t,who="",c=""){$("say").innerHTML=`<b>${who||"顧問"}</b>${t}`;const p=document.createElement("p");p.className=c;p.textContent=(who?who+" ":"")+t;$("hist").prepend(p)}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove("on"),2200)}
function banner(a,b,cb){$("bn1").textContent=a;$("bn2").textContent=b||"";const e=$("bn");e.classList.remove("on");void e.offsetWidth;e.classList.add("on");Snd.play("month");setTimeout(()=>{e.classList.remove("on");cb&&cb()},1600)}
function checkAch(){ACH.forEach(a=>{if(!S.ach[a.id]&&a.ok(S)){S.ach[a.id]=1;toast(`実績解除：${a.n}`);Snd.play("ach")}})}
/* ---------- 画面 ---------- */
function draw(){
 if(S.cur>=S.M.length)S.cur=0;const m=S.M[S.cur];
 $("wk").textContent=`${S.y}年目 ${S.w}か月目`;$("ap").textContent=`行動 ${S.ap}/3`;$("pop").textContent=`モテ度 ${S.M.reduce((a,x)=>a+x.love,0)}`;
 $("nm").innerHTML=`${m.n}<small>短大${m.g}年・${m.pos}</small>`;
 $("ht").innerHTML=`♥ 好感度 ${m.love}<div class="hb"><i style="width:${m.love}%"></i></div>`;
 $("pt").innerHTML=art(m);
 $("stats").innerHTML=`<div class="st">${K.map((k,j)=>`<span>${NM[j]}</span><div class="t"><i style="width:${m.s[k]}%"></i></div><span>${m.s[k]}</span>`).join("")}<span>やる気</span><div class="t"><i style="width:${m.mood}%"></i></div><span>${m.mood}</span></div><p class="hint">部員 ${S.M.length}人／チーム力 ${power()}</p>`;
 const pn=["roster","album","ach","set"].includes(menu);$("game").style.display=pn?"none":"grid";$("panel").style.display=pn?"block":"none";
 if(pn)$("panel").innerHTML=panel();
 const B=(t,f,c="")=>`<button class="${c}" onclick="${f}">${t}</button>`;
 $("cmd").innerHTML=pn?B("戻る","go('main')"):menu==="main"?
  B("🏐 全体練習","go('practice')")+B("📘 個別指導","go('coach')")+B("👭 部員","go('roster')")+
  B("💬 相談に乗る","talk()")+B("📋 ミーティング","meet()")+B("🎓 卒業アルバム","go('album')")+
  B("🏅 実績","go('ach')")+B("⚙ 設定","go('set')")+B("🗓 週を終える","endWeek()","p"):
  NM.map((n,j)=>B((menu==="practice"?"全体 ":"個別 ")+n,(menu==="practice"?"team(":"coach(")+j+")")).join("")+B("戻る","go('main')")}
function panel(){
 if(menu==="roster")return `<h2>👭 部員（${S.M.length}人）</h2><div class="ag">${S.M.map((x,i)=>`<button class="ac ${i===S.cur?"on":""}" onclick="pick(${i})">${art(x)}<div><b>${x.n}</b><br>短大${x.g}年・${x.pos}<br>サーブ${x.s.srv} レシーブ${x.s.rcv}<br>スパイク${x.s.atk} 体力${x.s.stm}<br>♥ ${x.love}　やる気 ${x.mood}</div></button>`).join("")}</div>`;
 if(menu==="album")return `<h2>🎓 卒業アルバム</h2>`+(S.A.length?`<div class="ag">${[...S.A].reverse().map(a=>`<div class="ac">${art(a)}<div><b>${a.n}</b><br>${a.pos}／${a.yr}年目に卒業<br>サーブ${a.s.srv} レシーブ${a.s.rcv}<br>スパイク${a.s.atk} 体力${a.s.stm}<br>♥ 好感度 ${a.love}<br>${endTxt(a.love)}</div></div>`).join("")}</div>`:"まだ卒業生はいません。");
 if(menu==="ach"){const n=ACH.filter(a=>S.ach[a.id]).length;return `<h2>🏅 実績（${n}/${ACH.length}）</h2>`+ACH.map(a=>`<div class="ach ${S.ach[a.id]?"":"lock"}"><i>${S.ach[a.id]?a.i:"🔒"}</i><div><b>${a.n}</b><br>${a.d}</div></div>`).join("")}
 const c=Cfg.get();return `<div class="set"><h2>⚙ 設定</h2><h3>効果音</h3><input type="range" min="0" max="100" value="${c.vol*100}" aria-label="音量" onchange="setVol(this.value)"> <label class="b"><input type="checkbox" ${c.mute?"":"checked"} onchange="Cfg.set({mute:!this.checked})"> 鳴らす</label>
 <h3>セーブデータ</h3><p class="hint">進行は自動で保存されます。機種変更やバックアップには書き出しを使ってください。</p>
 <button onclick="Save.export(S);toast('書き出しました')">書き出し</button><label class="b">読み込み<input type="file" accept=".json,application/json" hidden onchange="importSave(this.files[0])"></label><button onclick="resetGame()">最初からやり直す</button>
 <h3>アプリ</h3><button onclick="install()">ホーム画面にインストール</button><p class="hint">iPhone: Safariの共有メニュー→「ホーム画面に追加」／Android: ブラウザのメニュー→「アプリをインストール」。※https または localhost で開いた場合に有効です。</p></div>`}
/* ---------- 操作 ---------- */
function go(m){menu=m;draw()}
function pick(i){S.cur=i;menu="main";const m=S.M[i],t=tier(m);say(t?m.L[t-1]:"「顧問、お疲れさまです!」",m.n);draw()}
function step(d){pick((S.cur+d+S.M.length)%S.M.length)}
function spend(){if(S.ap<1){say("今月の行動力を使い切りました。週を終えましょう。");Snd.play("lose");return false}S.ap--;return true}
function team(j){if(!spend())return;S.M.forEach(m=>{m.s[K[j]]=cl(m.s[K[j]]+3+rnd(0,2));m.mood=cl(m.mood-4)});say(NM[j]+"練習を実施。全員が成長したが、少し疲れた。");Snd.play("ok");menu="main";after()}
function coach(j){if(!spend())return;const m=S.M[S.cur];m.s[K[j]]=cl(m.s[K[j]]+7+rnd(0,3));gain(m,3);m.mood=cl(m.mood-2);say(`「先生、ありがとうございます! ${NM[j]}、伸びた気がします!」`,m.n,"love");Snd.play("love");menu="main";after()}
function talk(){if(!spend())return;const m=S.M[S.cur];gain(m,5);m.mood=cl(m.mood+15);say("「話を聞いてもらえて、心が軽くなりました。」",m.n,"love");Snd.play("love");after()}
function meet(){if(!spend())return;S.M.forEach(m=>{m.mood=cl(m.mood+8);gain(m,1)});say("全体ミーティングで、チームの雰囲気が良くなった。");Snd.play("ok");after()}
function after(){ // 恋愛イベント判定→ノベルパート
 let sc=[];S.M.forEach(m=>{if(m.love>=95)S.fl.love95=1;CFG.TIER.forEach((t,i)=>{if(m.love>=t&&!m.ev[i]){m.ev[i]=1;S.cur=S.M.indexOf(m);hist(`★${m.n}の恋愛イベント`);sc.push(...SCENES.love(m,i))}})});
 checkAch();Save.write(S);draw();if(sc.length){Snd.play("love");Novel.play(sc)}}
function hist(t){const p=document.createElement("p");p.className="big";p.textContent=t;$("hist").prepend(p)}
function graduate(){ // 3年生が卒業→進級→新入部員
 const out=S.M.filter(m=>m.g>=3),L=[];out.forEach(m=>{S.A.push({...m,s:{...m.s},yr:S.y});L.push(...SCENES.grad(m))});
 S.M=S.M.filter(m=>m.g<3);S.M.forEach(m=>m.g++);
 let n=Math.max(0,Math.min(rnd(2,3),CFG.MAXM-S.M.length));for(let i=0;i<n;i++)S.M.push(fresh());while(S.M.length<8){S.M.push(fresh());n++}
 hist(`卒業${out.length}人／新入部員${n}人`);return L}
function endWeek(){
 const m=pk(S.M),r=Math.random();
 if(r<.35){gain(m,4);say("「先生、差し入れです。みんなには内緒ですよ?」",m.n,"love")}
 else if(r<.55){m.mood=cl(m.mood-10);say("調子を落としている様子だ。声をかけてあげよう。",m.n)}
 else if(r<.75){gain(m,3);say(`OGから、顧問と${m.n}の仲を冷やかされた。モテ度が上がった。`,"","love")}
 if(S.w%4===0){const o=(70+S.w*7)*2+Math.min((S.y-1)*30,360)+rnd(0,40),p=power()+rnd(0,40),w=p>=o; // 大会は4か月ごと
  say(`大会 チーム力${p} 対 相手${o} → ${w?"勝利!":"惜敗…"}`,"","big");Snd.play(w?"win":"lose");
  if(w){S.wins++;S.M.forEach(x=>{x.mood=cl(x.mood+12);gain(x,2)})}else S.M.forEach(x=>x.mood=cl(x.mood-8))}
 S.weeks++;let L=[];
 if(S.w>=CFG.TURNS){L=graduate();S.y++;S.w=1}else S.w++;
 S.ap=3;menu="main";S.M.forEach(x=>x.mood=cl(x.mood+3));
 const sub=S.w===1?"新年度がはじまります":S.w%4===0?"今月は大会です":"";
 Novel.play(L,()=>banner(`${S.y}年目 ${S.w}か月目`,sub,()=>after())); // 卒業シーン→月替わり演出→保存
 draw()}
/* ---------- 設定まわり ---------- */
function setVol(v){Cfg.set({vol:v/100});Snd.play("ok")}
function importSave(f){if(!f)return;Save.import(f,d=>{S=d;Save.write(S);menu="main";draw();toast("読み込みました")},()=>toast("読み込めませんでした"))}
function resetGame(){if(confirm("セーブデータを消して最初からやり直します。よろしいですか?")){Save.reset();newGame();menu="main";say("新年度、短大女子バレー部の顧問に着任した。まずは部員と向き合おう。");after()}}
function install(){if(dip){dip.prompt();dip=null}else toast("下の案内のとおり、ブラウザのメニューから追加してください")}
addEventListener("beforeinstallprompt",e=>{e.preventDefault();dip=e});
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
/* ---------- 起動 ---------- */
(()=>{const d=Save.load();if(d){S=d;say("おかえりなさい、顧問。続きからはじめましょう。")}else{newGame();say("新年度、短大女子バレー部の顧問に着任した。まずは部員と向き合おう。")}checkAch();draw()})();
