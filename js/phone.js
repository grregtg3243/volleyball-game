/* phone.js : スマホ（別ファイル）。【現代風UI版】画面の見た目は末尾の PHONE_CSS と phShell()/phoneHtml()/msgPanel()。メイン画面の「スマホ」とステージ右上の📱から開く。
   ■ アプリ：メッセージ（harem.js の msgPanel）／電話／グループチャット／SNS／予定表。アプリを増やすときは phoneHtml() にボタンを足し、関数を下に追加する */
const PH_CALL=[
 [["","夜、{mei}に電話をかけた。"],["@","「…もしもし? 先生、どうしたんですか?」"],["@","「声が聞けて、嬉しいです。…もう少しだけ、話してもいいですか?」"]],
 [["","{mei}の携帯が鳴った。画面には{boss}の名前。"],["@","「えっ、先生!? …ちょっと待ってください、心の準備が!」"],["","電話口で、{mei}の弾んだ声が響いた。"]],
 [["","寝る前に、{mei}と電話で話した。"],["@","「…おやすみなさい、先生。夢で会えるといいな。」"]]];
const PH_GROUP=["グループチャットに「おつかれ!」と送ると、{num}人から一斉にスタンプが返ってきた。","「今日のMVPは全員!」と送ると、{num}人から❤が届いた。","夜、グループチャットが「先生、大好き」の嵐になった。通知が止まらない。"];
const PH_EVENTS={1:"初詣",2:"バレンタイン",3:"ホワイトデー",5:"OG会",8:"夏合宿",11:"学園祭ミスコン",12:"クリスマスパーティー"}; // カレンダーの月→イベント名
const moOf=()=>(S.w+2)%12+1;                       // 表示中の月（1か月目=4月）
let phApp="home";                                    // スマホ内の画面：home / sched
function phOpen(a){phApp=a;draw()}
const phAv=m=>`<span class="av">${art(m)}</span>`;   // 丸い顔アイコン（立ち絵の上部を切り出し）
/* スマホ共通の枠：ステータスバー／ナビバー／ホームバー */
function phShell(title,inner,back){return `<div class="ph"><div class="phs"><span>${moOf()}月</span><i class="phn"></i><span>🔋 ${S.ap}</span></div>
 <div class="phb">${back||"<span></span>"}<b>${title}</b><span></span></div><div class="phc">${inner}</div><div class="phh"><i></i></div></div>`}
const phTile=(ic,l,bg,on,bd,sub)=>`<button class="pt2" onclick="${on}"><span class="pi" style="background:${bg}">${ic}${bd?`<em class="pbd">${bd}</em>`:""}</span><span class="pl">${l}</span><small>${sub||""}</small></button>`;
function phSched(){const L=[];for(let i=0;i<6;i++){const w=(S.w-1+i)%12+1,mo=(w+2)%12+1,ev=[PH_EVENTS[mo],w%4===0?"大会":"",w===12?"卒業・新入部員":""].filter(Boolean).join("・");if(ev)L.push(`<div class="prow"><span class="pd">${mo}<small>月</small></span><div><b>${ev}</b><small>${i?i+"か月後":"今月"}</small></div></div>`)}return L.join("")||`<p class="pnone">しばらく大きな予定はありません。</p>`}
/* ===== 部活外の女子（キャンパス）：人気が上がると学内の女子に囲まれる。連絡先を交換するとスマホの「キャンパス」に登録される ===== */
const cgList=()=>S.cg=S.cg||[];
const CG_CAP=30000;   // 連絡先（キャンパスの女子）の保存上限
const CG_MAX=300;   // 学内の女子に囲まれる人数の上限（1〜CG_MAX人からランダム）
const CG_L=[["「先生、やっぱりイケメンだよね!」","「近くで見ると、もっとかっこいい…」","「噂以上なんだけど!」"],["「ねえ、私達ともデートして?」","「バレー部ばっかりずるい! 私達にも構ってよ。」","「一回だけでいいから、デートしよう?」"],["「連絡先を交換して!」","「LINE教えてください、お願い!」","「私も私も! 連絡先、交換しよ?」"]];
function cgNew(G){let m,t=0;const cn=new Set(cgList().map(y=>y.n)),used=x=>cn.has(x.n)||G.some(y=>y.n===x.n);
 do{m=fresh();S.no--}while(used(m)&&++t<40);                       // 部員の背番号を消費しない（fresh()の連番を戻す）
 S.cid=(S.cid||0)+1;if(used(m))m.n+=`（${S.cid}）`;                // 40回試しても重複した時は通し番号を付けて、名前が被らないようにする
 m.no=0;m.id="C"+String(S.cid).padStart(3,"0");m.love=cl(rnd(35,55)+Math.round((S.B.pop-50)*.2));m.lust=rnd(5,25);m.poss=0;return m}
/* 月送りで発生（game.js の endWeek から呼ぶ）：人気20超から確率UP（人気60で約50%・最大85%/月）。囲まれる人数は1〜CG_MAX人 */
function campus(){const p=S.B.pop;if(Math.random()>=Math.min(.85,Math.max(0,(p-20)/80)))return[];
 const n=(typeof superOn==="function"&&superOn())?rnd(SUPER.CONTACT[0],SUPER.CONTACT[1]):rnd(1,CG_MAX),G=[];for(let i=0;i<n;i++)G.push(cgNew(G));const sh=G.slice(0,6);
 const out=[{who:"",t:"キャンパスを歩いていると、見知らぬ女子たちにわっと囲まれた。人気者の先生を、学校中の女子が放っておかない。",m:G[0],ms:G.length>=3?G:undefined}];
 G.slice(0,Math.min(n,5)).forEach((m,i)=>out.push({who:m.n,t:pk(CG_L[i%3]),m}));
 const add=l=>{const c=cgList();G.forEach(m=>{m.love=cl(m.love+l);if(c.length<CG_CAP)c.push(m)})},jl=k=>hearts().forEach(h=>h.poss=cl(h.poss+k)),done=f=>()=>{f();Save.write(S);draw()};
 out.push({who:"",t:`${n}人が期待のまなざしで見つめている。どうする?`,m:G[0],ch:[
  {t:"連絡先を交換する",r:"「やった! 後で連絡するね!」女子たちが歓声を上げた。",f:done(()=>{add(0);popUp(1);hpUp(1);jl(2);hist(`📱 学内の女子${n}人と連絡先を交換`)})},
  {t:"デートの約束をする",r:"「約束だよ、先生!」黄色い声が学内に響き渡った。",f:done(()=>{add(8);popUp(2);hpUp(2);jl(4);tm(-2);hist(`💕 学内の女子${n}人とデートの約束`)})},
  {t:"丁重に断る",r:"「…そっか、残念。でも誠実なところも素敵!」",f:done(()=>{hearts().forEach(h=>gain(h,1));tm(1);hist(`学内の女子${n}人の誘いを丁重に断った`)})}]});
 return out}
/* キャンパス画面の操作：メッセージ(行動力1)／デート(行動力2)／入部に誘う(親密度50以上→部員に) */
const cgGet=id=>cgList().find(x=>x.id===id);
function cgMsg(id){const m=cgGet(id);if(!m||!spend())return;m.love=cl(m.love+4);m.lust=cl(m.lust+1);popUp(0);toast(`${m.n}とメッセージ（親密度${m.love}）`);Snd.play("love");after()}
function cgDate(id){const m=cgGet(id);if(!m||!spend(2))return;m.love=cl(m.love+8);m.lust=cl(m.lust+4);hpUp(1);popUp(1);hearts().forEach(h=>h.poss=cl(h.poss+2));S.cnt.cgdate=(S.cnt.cgdate||0)+1;hist(`💕 ${m.n}とデート`);menu="main";
 Novel.play([{who:"",t:`${m.n}と、放課後にデートへ出かけた。`,m},{who:m.n,t:pk(["「先生と二人きりなんて、夢みたい…!」","「今日のこと、ずっと忘れません!」","「また誘ってくれますか? 絶対ですよ!」"]),m}]);after()}
function cgJoin(id){const m=cgGet(id);if(!m||m.love<50){toast("親密度50以上で誘えます");return}if(S.M.length>=CFG.MAXM){toast("部員は上限です");return}
 S.cg=cgList().filter(x=>x!==m);m.no=++S.no;m.id=String(S.no).padStart(4,"0");m.mood=70;m.ev=CFG.TIER.map(t=>m.love>=t?1:0);S.M.push(m);hist(`🌸 ${m.n}をバレー部に勧誘（愛情${m.love}）`);toast(`${m.n}が入部しました`);Snd.play("ok");after()}
/* ===== スマホ内のログ：index.html の隠し #hist（ゲームが書き込む）の中身を表示 ===== */
const phLog=()=>{const h=$("hist");return h&&h.children.length?[...h.children].slice(0,120).map(e=>`<p>${e.innerHTML}</p>`).join(""):`<p class="pnone">まだログはありません。</p>`};
function phoneHtml(){const m=S.M[S.cur],nick=m.n.split(" ")[1]||m.n,bd=badge(),back=`<button class="phk" onclick="phOpen('home')">‹ ホーム</button>`,cg=cgList();
 if(phApp==="mini"&&typeof miniHtml==="function")return phShell("ミニゲーム",miniHtml(),back);
 if(phApp==="sched")return phShell("予定表",phSched(),back);
 if(phApp==="log")return phShell("ログ",`<div class="plog">${phLog()}</div>`,back);
 if(phApp==="campus"){const L=[...cg].sort((a,b)=>b.love-a.love).slice(0,25);
  return phShell("キャンパス",`<button class="cga" onclick="cgCallAll()"${cg.length<2?" disabled":""}>👭 女子全員を呼び出す（${cg.length}人／行動力2）</button><div class="pst">連絡先 <b>${cg.length}</b>人${cg.length>25?"（下のカードは親密度の高い25人）":""}<br><small>人気が上がると、学内の女子に囲まれて連絡先を聞かれます。行動力 ${S.ap}</small></div>`+(cg.length?`<div class="pst">👀 学内の女子（最大${FACE_MAX}人表示）</div>${faceWall(cg)}`:"")+(L.length?L.map(g=>`<div class="cgr">${phAv(g)}<div class="cgi"><b>${g.n}</b><div class="cgb"><i style="width:${g.love}%"></i></div><small>親密度 ${Math.round(g.love)}</small><div><button class="cgk" onclick="cgMsg('${g.id}')">💬 メッセージ(1)</button><button class="cgk" onclick="cgDate('${g.id}')">💕 デート(2)</button>${g.love>=50?`<button class="cgk" onclick="cgJoin('${g.id}')">🌸 入部に誘う</button>`:""}</div></div></div>`).join(""):`<p class="pnone">まだ連絡先がありません。</p>`),back)}
 return phShell("ホーム",`<div class="pw"><button class="pwn" onclick="step(-1)" aria-label="前の部員">‹</button>${phAv(m)}<div class="pwt"><small>通話相手</small><b>${m.n}</b></div><button class="pwn" onclick="step(1)" aria-label="次の部員">›</button></div>
 <div class="pg">${phTile("💬","メッセージ","linear-gradient(160deg,#5be37d,#1fb84a)","go('msg')",bd,bd?"未読":"")}${phTile("📞","電話","linear-gradient(160deg,#5ab8ff,#0a6cff)","phCall()","","行動力1・"+nick)}${phTile("👥","グループ","linear-gradient(160deg,#ffc85a,#ff8a00)","phGroup()","","行動力1")}${phTile("🌐","SNS","linear-gradient(160deg,#9b8cff,#5a4bf0)","phSns()","","行動力1")}${phTile("🎒","キャンパス","linear-gradient(160deg,#ff9ec4,#ff4f8b)","phOpen('campus')","",cg.length+"人")}${phTile("🗓","予定表","linear-gradient(160deg,#ff7b7b,#ee2d2d)","phOpen('sched')","","")}${phTile("💞","モテ","linear-gradient(160deg,#ff8fb1,#ff3b6a)","go('mote')","","指数"+moteIdx())}${phTile("📜","ログ","linear-gradient(160deg,#8e8e93,#48484a)","phOpen('log')","","")}${typeof miniHtml==="function"?phTile("🎮","ミニゲーム","linear-gradient(160deg,#6ee7d8,#12a594)","phOpen('mini')","","行動力1"):""}</div>`)}
/* メッセージ：チャット風UI。相手の吹き出し＋自分の返信ボタン（青い吹き出し）。返信の処理は harem.js の reply()/inboxStep() */
function msgPanel(){phApp="home";const L=[...S.inbox].reverse().map(x=>({x,m:S.M.find(y=>y.id===x.id)})).filter(o=>o.m).slice(0,12);
 const body=L.length?L.map(({x,m})=>{const d=MSG[x.c][x.k],off=S.rep<1;
  return `<div class="cm"><div class="cr">${phAv(m)}<div class="cw"><b>${m.n}</b><div class="bb in">${nmz(fmt(d.t,[m]),m)}</div><small>${x.age?"1か月前":"たった今"}</small></div></div>
  <div class="co">${d.r.map((r,j)=>`<button class="bb out"${off?" disabled":""} onclick="reply(${x.uid},${j})">${fmt(r[0],[m])}</button>`).join("")}</div></div>`}).join(""):`<p class="pnone">新着メッセージはありません。</p>`;
 return phShell("メッセージ",`<div class="pst">未読 ${S.inbox.length}件　／　今月の返信 あと <b>${S.rep}</b> 回<br><small>返信せずに放っておくと、その子の独占欲が上がります。</small></div>${body}`,`<button class="phk" onclick="go('phone')">‹ ホーム</button>`)}
function phCall(){const m=S.M[S.cur];if(!spend())return;gain(m,4);m.lust=cl(m.lust+2);m.mood=cl(m.mood+5);S.cnt.call=(S.cnt.call||0)+1;menu="main";Novel.play(scn(pk(PH_CALL),[m]));after()}
function phGroup(){const A=hearts();if(!A.length){toast("恋心を寄せる女子がまだいません");return}if(!spend())return;A.forEach(m=>{gain(m,1);m.mood=cl(m.mood+4)});tm(3);toast(fmt(pk(PH_GROUP),A));after()}
function phSns(){if(!spend())return;if(Math.random()<.2){popUp(-3);tm(-3);toast("投稿が炎上…！ 人気↓・和↓")}else{const k=2+rnd(0,2);popUp(k);toast(`投稿が話題に！ 人気+${k}`)}after()}

/* ===== スマホUI（現代風）。色や丸みを変えたい時はこの CSS を編集 ===== */
const PHONE_CSS=`
.ph{width:min(390px,100%);margin:6px auto 0;border-radius:42px;padding:10px;background:#111;box-shadow:0 18px 40px rgba(0,0,0,.35),inset 0 0 0 2px #333;color:#111;font-family:inherit}
.ph>*{background:none}.phs,.phb,.phc,.phh{background:#f2f2f7}
.phs{display:flex;justify-content:space-between;align-items:center;padding:12px 24px 4px;border-radius:32px 32px 0 0;font-size:.78rem;font-weight:700;color:#111}
.phn{width:84px;height:20px;border-radius:12px;background:#111;display:block}
.phb{display:grid;grid-template-columns:96px 1fr 96px;align-items:center;padding:6px 12px 8px;font-size:1.02rem;text-align:center;border-bottom:1px solid rgba(0,0,0,.08);color:#111}
.phk{font:inherit;font-size:.92rem;color:#0a7aff;background:none;border:0;cursor:pointer;text-align:left;padding:4px}
.phc{min-height:520px;max-height:68vh;overflow-y:auto;padding:12px 12px 18px;color:#111}
.phh{padding:8px 0 10px;border-radius:0 0 32px 32px;display:flex;justify-content:center}.phh i{width:120px;height:5px;border-radius:3px;background:#111;opacity:.8}
.av{display:inline-block;width:46px;height:46px;border-radius:50%;overflow:hidden;flex:none;background:linear-gradient(#cfeeff,#8fd0ff);box-shadow:0 0 0 2px #fff}
.av svg,.av img{width:210%;max-width:none;margin:-4% 0 0 -55%;display:block}
.pw{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:20px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.08);margin-bottom:18px}
.pwt{flex:1;display:flex;flex-direction:column;line-height:1.3}.pwt small{color:#8a8a8e;font-size:.7rem}
.pwn{font:inherit;font-size:1.4rem;width:34px;height:34px;border-radius:50%;border:0;background:#e9e9ee;color:#0a7aff;cursor:pointer}
.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 8px;padding:4px 2px}
.pt2{font:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;color:#111;cursor:pointer;padding:0}
.pi{position:relative;width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.9rem;box-shadow:0 4px 10px rgba(0,0,0,.2);transition:transform .12s}
.pt2:active .pi{transform:scale(.92)}.pl{font-size:.78rem;font-weight:600}.pt2 small{font-size:.62rem;color:#8a8a8e;min-height:1em}
.pbd{position:absolute;top:-6px;right:-6px;min-width:22px;padding:1px 6px;border-radius:11px;background:#ff3b30;color:#fff;font:700 .7rem/1.5 system-ui;font-style:normal;box-shadow:0 0 0 2px #f2f2f7}
.pst{font-size:.8rem;color:#555;text-align:center;margin:0 0 12px}.pst small{color:#8a8a8e}
.cm{margin-bottom:18px}.cr{display:flex;gap:8px;align-items:flex-start}.cw{max-width:78%}.cw b{font-size:.72rem;color:#6b6b70;margin-left:4px}.cw small{display:block;font-size:.62rem;color:#8a8a8e;margin:2px 6px 0}
.bb{font:inherit;font-size:.9rem;line-height:1.5;padding:9px 14px;border-radius:20px;margin-top:2px;display:block;border:0;text-align:left}
.bb.in{background:#fff;color:#111;border-radius:6px 20px 20px 20px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.co{display:flex;flex-direction:column;align-items:flex-end;gap:5px;margin-top:8px}
.bb.out{background:linear-gradient(160deg,#4aa3ff,#0a6cff);color:#fff;border-radius:20px 6px 20px 20px;cursor:pointer;max-width:82%;text-align:right;transition:transform .1s,filter .15s}
.bb.out:hover:not(:disabled){filter:brightness(1.08)}.bb.out:active:not(:disabled){transform:scale(.97)}.bb.out:disabled{background:#c7c7cc;cursor:not-allowed}
.prow{display:flex;gap:14px;align-items:center;background:#fff;border-radius:16px;padding:10px 14px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
.pd{font-size:1.7rem;font-weight:800;color:#ee2d2d;min-width:56px;text-align:center}.pd small{font-size:.7rem;color:#8a8a8e}
.prow small{display:block;color:#8a8a8e;font-size:.7rem}.pnone{text-align:center;color:#8a8a8e}
.cgr{display:flex;gap:10px;align-items:center;background:#fff;border-radius:16px;padding:8px 10px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
.cgi{flex:1;min-width:0;line-height:1.4}.cgi small{color:#8a8a8e;font-size:.68rem}
.cgb{height:6px;border-radius:3px;background:#e5e5ea;margin:3px 0 1px}.cgb i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#ff9fb8,#ff3b6a)}
.cgk{font:inherit;font-size:.72rem;border:0;border-radius:12px;padding:5px 9px;background:#e9f2ff;color:#0a6cff;cursor:pointer;margin:4px 4px 0 0}.cgk:active{transform:scale(.96)}
.plog p{margin:0 0 6px;padding:8px 12px;background:#fff;border-radius:14px;font-size:.82rem;box-shadow:0 1px 3px rgba(0,0,0,.07)}
.plog p.big{font-weight:600}
@media(max-width:420px){.ph{border-radius:34px;padding:8px}.phc{max-height:64vh}}
`;
(function(){const st=document.createElement("style");st.textContent=PHONE_CSS;document.head.appendChild(st)})();
