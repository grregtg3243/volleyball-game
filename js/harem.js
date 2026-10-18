/* harem.js : ハーレム体験の拡張。①集合表示 ②メッセージ(スマホ) ③呼び方 ④ハーレム憲章
   ■ game.js より先に読み込む。ここの関数は「呼ばれた時」に game.js の変数（S, hearts, cl, rnd, tm, spend…）を使う。
   ■ 台本=novels.js の MSG／データ=data.js の CALLS, CHARTERS／集合表示の枠=index.html と style.css */
/* ③ 呼び方：愛情が上がるほど「先生」→「さん」→「あなた」→「ダーリン」。女子ごとに呼び名のセット（CALLS）が違う */
const callOf=m=>{const b=(S.B&&S.B.name)||"",t=m.lover||m.love>=95?3:m.love>=80?2:m.love>=60?1:0;
 return CALLS[(parseInt(m.id,10)||0)%CALLS.length][t].replace(/\{b\}(先生|さん|くん)/g,(_,x)=>b?b+x:"先生")};
/* ① 立ち絵の背後に、恋心を寄せる他の女子（最大6人）を並べる */
const bgHtml=m=>"";   // 背景に並べる女子は廃止（元の処理：恋心を寄せる他の女子を最大6人、立ち絵の背後に表示）
/* ② メッセージ：毎月、恋心を寄せる女子から届く。返信は月3回（恋心10人以上で5回）。1か月放置すると独占欲↑、2か月で消える */
const badge=()=>{const n=(S.inbox||[]).length;return n>99?"99+":n||""};
const INBOX_NEW=30,INBOX_MAX=60;   // 1か月に届く新着の上限／受信箱の最大件数（恋心が数千人でも、メッセージがセーブを圧迫しないように）
function inboxStep(){S.inbox=S.inbox||[];const ang=new Set();S.inbox.forEach(x=>{x.age=(x.age||0)+1;if(x.age===1)ang.add(x.id)});
 const alive=new Set(S.M.map(m=>m.id));
 S.M.forEach(m=>{if(ang.has(m.id))m.poss=cl(m.poss+2)});
 S.inbox=S.inbox.filter(x=>x.age<2&&alive.has(x.id));
 const H=hearts(),from=H.length>INBOX_NEW?[...H].sort(()=>Math.random()-.5).slice(0,INBOX_NEW):H;   // 多い時は、その月に連絡してくる子をランダムに最大30人
 from.forEach(m=>{if(Math.random()<.7){const k=m.poss>=70&&Math.random()<.4?"jealous":m.lust>=60&&Math.random()<.4?"lust":"love";S.inbox.push({id:m.id,c:k,k:rnd(0,MSG[k].length-1),uid:++S.mid,age:0})}});
 if(S.inbox.length>INBOX_MAX)S.inbox=S.inbox.slice(-INBOX_MAX);
 S.rep=3+(H.length>=10?2:0)}
/* msgPanel()（メッセージ画面）は phone.js に移動（スマホ風UI） */
function reply(uid,j){const i=S.inbox.findIndex(x=>x.uid===uid);if(i<0)return;if(S.rep<1){toast("今月の返信回数を使い切りました");return}
 const x=S.inbox[i],m=S.M.find(y=>y.id===x.id),r=MSG[x.c][x.k].r[j];S.rep--;S.inbox.splice(i,1);S.cnt.reply=(S.cnt.reply||0)+1;
 applyFx({one:r[1]},[m]);toast(`${m.n}：${nmz(fmt(r[2],[m]),m)}`);Snd.play("love");after()}
/* ④ ハーレム憲章：平等制（和が安定）／序列制（本命を優遇）／自由恋愛制（イベント増）。変更は行動力1＋和−5（初回無料） */
const top3=()=>{const a=[];for(const m of S.M){if(a.length<3||m.love>a[2].love){a.push(m);a.sort((x,y)=>y.love-x.love);if(a.length>3)a.pop()}}return a}; // 愛情上位3人（1回の走査で求める）
let _t3=null;const top3c=()=>_t3||(queueMicrotask(()=>{_t3=null}),_t3=top3());   // 同じ処理の中ではトップ3を使い回す（数千人に一括で愛情を加算しても重くならない）
const cmul=m=>S.charter==="equal"?.9:S.charter==="rank"?(top3c().includes(m)?1.3:.85):1;   // 愛情の上がり方の倍率（gain()が使用）
function charterStep(){if(S.charter==="rank"){const t=top3();hearts().forEach(m=>{if(!t.includes(m))m.poss=cl(m.poss+2)})}if(S.charter==="free")tm(-1)}
function charterHtml(){return `<div class="set"><h3>ハーレム憲章（現在：${(CHARTERS.find(c=>c.id===S.charter)||{n:"未制定"}).n}）</h3>${CHARTERS.map(c=>`<div class="ach"><div><b>${c.n}</b><br>${c.d}</div>${S.charter===c.id?"<i>✅</i>":`<button onclick="setCharter('${c.id}')">採用</button>`}</div>`).join("")}<p class="hint">変更には行動力1と和−5が必要です（初回は無料）。</p></div>`}
function setCharter(id){if(S.charter===id)return;if(S.charter){if(!spend())return;tm(-5)}S.charter=id;toast(`憲章「${CHARTERS.find(c=>c.id===id).n}」を採用`);Snd.play("ach");after()}
