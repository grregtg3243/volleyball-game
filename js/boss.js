/* boss.js : 顧問の段階的強化（レベル制・上限なし＝やり込み）と、人気による自動入部。
   ■ 強化1回ごとに経験がたまり、必要回数（3+Lv×2）に達するとLvアップ（能力+3、ハートポイント+1）。Lvの効果は下の UPGRADE の説明どおり
   ■ Lvの効果の参照箇所：game.js の apRate()/apMax()/bonus()/tm()/recruitRate()/team()/coach()（lvl("キー") を使用） */
const UPGRADE=[ // [キー, 名前, Lvごとの効果]
 ["app","容姿","アプローチ発生率 +1.5%/Lv"],
 ["stm","体力","5Lvごとに行動力 +1（最大+3）"],
 ["lead","指導力","2Lvごとに練習の成長量 +1"],
 ["kind","包容力","和の低下を3%/Lv軽減（最大−60%）"],
 ["pop","人気","愛情の上がり方 +3%/Lv、募集成功率・入部希望者 +1%/Lv"]];
const TRAIN={app:["身だしなみを整えた。",{app:2,pop:1}],stm:["体を鍛えた。",{stm:2,app:1}],lead:["指導法を学んだ。",{lead:2}],kind:["部員の話にじっくり耳を傾けた。",{kind:2}],pop:["地域交流とSNS発信に励んだ。",{pop:2}]};
const lvl=k=>(S.B&&S.B.lv&&S.B.lv[k])||0;
const need=k=>3+lvl(k)*2;                                   // 次のLvまでに必要な強化回数（上がるほど増える）
const heartCost=k=>1+(lvl(k)/4|0);                        // 強化1回のハート消費：Lv0〜3=1、Lv4〜7=2、Lv8〜11=3…（4Lvごとに+1。式を変えれば調整できます）
function train(k){const hc=heartCost(k);if((S.hp||0)<hc){toast(`ハートが足りません（必要 💗${hc}）`);return}if(!spend())return;S.hp-=hc;const[t,d]=TRAIN[k];S.B.lv=S.B.lv||{};S.B.xp=S.B.xp||{};for(const x in d)S.B[x]=cl(S.B[x]+d[x]);
 S.B.xp[k]=(S.B.xp[k]||0)+1;let up=false;if(S.B.xp[k]>=need(k)){S.B.xp[k]=0;S.B.lv[k]=lvl(k)+1;S.B[k]=cl(S.B[k]+3);hpUp(1);up=true}
 toast(up?`${UPGRADE.find(u=>u[0]===k)[1]}が Lv${lvl(k)} にアップ！`:t);Snd.play(up?"ach":"ok");after()}
const upHtml=()=>UPGRADE.map(([k,n,d])=>`<div class="ach"><div><b>${n} Lv${lvl(k)}</b>（${(S.B.xp&&S.B.xp[k])||0}/${need(k)}）<br>${d}</div><button onclick="train('${k}')"${(S.hp||0)<heartCost(k)?' style="opacity:.55"':""}>強化（💗${heartCost(k)}）</button></div>`).join("");
/* 人気が高いと、入部希望者が毎月自動で来る。人気40〜99：確率で来る（60以上は最大30人/月、80以上は最大100人/月）。人気100：毎月必ず1〜100人が来る。
   ■ 入部は「はい／いいえ」で本人ごとに選ぶ（「はい」で初めて部員に加わる）。選択肢の書式は game.js の choiceLine と同じ（ch:[{t,r,f}]）
   ■ 「いいえ」を選んだ子の背番号・IDは欠番になる（画像のID連動は、入部した子の分だけ使われる）。部員上限は CFG.MAXM */
function autoJoin(){const p=S.B.pop,room=CFG.MAXM-S.M.length;if(room<=0)return[];
 let n=0;
 if(p>=100)n=(typeof superOn==="function"&&superOn())?rnd(SUPER.JOIN[0],SUPER.JOIN[1]):rnd(1,100);                                                // 人気100：毎月必ず、一度に1〜100人
 else{const r=Math.max(0,(p-40)/100)+lvl("pop")*.01+(p>=80?.3:0);if(Math.random()>Math.min(.9,r))return[];
  n=rnd(1,p>=80?100:p>=60?30:10)}   // 来る人数：人気80以上=1〜100人／60以上=1〜30人／それ未満=1〜10人
 
 n=Math.min(n,room);
 const J=[];for(let i=0;i<n;i++){let m,t=0;do{m=fresh()}while(J.some(x=>x.n===m.n)&&++t<50);
  m.love=Math.min(90,m.love+rnd(8,15));m.lust=cl(rnd(20,40)+Math.round((p-40)*.2));m.ev=CFG.TIER.map(t=>m.love>=t?1:0);   // 人気に釣られて来た子＝初期の愛情・情欲が高め（人気が高いほど情欲も高い）
  J.push(m)}   // まだ部員には加えない（承諾後に追加）
 const out=[{who:"",t:n===1?fmt("人気の噂を聞きつけて、{name}が入部を希望してきた。",[J[0]]):`人気の噂を聞きつけて、入部希望者が${n}人やって来た。`,m:J[0],ms:n>=3?J:undefined}];
 /* 2人以上のときは、最初に「全員はい／全員いいえ／一人ずつ」を選べる。mode: "all"=全員入部 / "none"=全員断る / "each"=一人ずつ（1人のときは最初から"each"） */
 let mode=n===1?"each":null;
 const join=m=>{if(S.M.length>=CFG.MAXM)return false;S.M.push(m);return true};
 if(n>=2)out.push({who:"",t:`${n}人の入部を、まとめて決めますか?`,m:J[0],ms:n>=3?J:undefined,ch:[
  {t:`全員「はい」（${n}人を受け入れる）`,r:`「ありがとうございます! 精一杯がんばります!」${n}人の声が揃った。`,f:()=>{mode="all";let c=0;J.forEach(m=>{if(join(m))c++});hist(`🌸 入部希望者${c}人をまとめて受け入れた`);toast(`${c}人が入部しました`);Snd.play("ok");Save.write(S);draw()}},
  {t:`全員「いいえ」（${n}人を断る）`,r:`「そうですか…。お時間をいただき、ありがとうございました。」`,f:()=>{mode="none";hist(`入部希望者${n}人をまとめて断った`);Save.write(S);draw()}},
  {t:"一人ずつ決める",r:"一人ずつ、話を聞くことにした。",f:()=>{mode="each"}}]});
 J.forEach(m=>{
  out.push({who:m.n,t:"「先生に憧れて来ました! よろしくお願いします!」",m,skip:()=>mode!=="each"});
  out.push({who:"",t:`${m.n}の入部を受け入れますか?`,m,skip:()=>mode!=="each",ch:[
   {t:"はい",r:`「ありがとうございます! 精一杯がんばります!」`,f:()=>{if(!join(m)){toast("部員は上限です");return}hist(`🌸 ${m.n}が入部（愛情${m.love}）`);toast(`${m.n}が入部しました`);Snd.play("ok");Save.write(S);draw()}},
   {t:"いいえ",r:`「そうですか…。お時間をいただき、ありがとうございました。」`,f:()=>{hist(`${m.n}の入部希望を断った`);Save.write(S);draw()}}]})});
 return out}

/* 顧問画面の見やすさ改善：「強化」「習得」「導入」「制定」などの行内ボタンを右端にそろえる。
   （style.css を触らずに済むよう、ここから CSS を差し込む。色や余白を変えたい時はこの文字列を編集） */
(function(){const st=document.createElement("style");
 st.textContent=".ach{display:flex;align-items:center;gap:10px}.ach>div{flex:1;min-width:0}.ach>button{margin-left:auto;flex-shrink:0;white-space:nowrap;min-width:4.5em}"+
  "#nv,#nv *,.say,#bn{-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}#nv{touch-action:manipulation}"   // 文字送りの連打で文字が選択される（青く反転する）のを防ぐ
 ;
 document.head.appendChild(st)})();

/* ===== 追加の実績（ハーレム拡張）。書式は data.js の ACH と同じ {id,i(アイコン),n(名前),d(説明),ok:S=>条件}。data.js 側へ移してもOK ===== */
(function(){const X=(id,i,n,d,ok)=>{if(!ACH.some(a=>a.id===id))ACH.push({id,i,n,d,ok:s=>{try{return !!ok(s)}catch(e){return false}}})};
 const cnt=k=>S.cnt&&S.cnt[k]||0,lvSum=()=>Object.values((S.B&&S.B.lv)||{}).reduce((a,b)=>a+b,0);
 [[10,"💞"],[30,"💘"],[50,"💝"],[100,"👑"],[200,"🌹"],[500,"🌈"]].forEach(([n,i])=>X("x_lover"+n,i,`恋仲${n}人`,`恋仲になった女子が累計${n}人になる`,()=>lovers()>=n));
 [[20,"🏐"],[50,"🏟"],[100,"🌸"],[300,"🎪"],[1000,"🌌"]].forEach(([n,i])=>X("x_mem"+n,i,`部員${n}人`,`部員が${n}人になる`,s=>s.M.length>=n));
 [[10,"🎓"],[50,"📚"],[100,"🏛"]].forEach(([n,i])=>X("x_alu"+n,i,`卒業生${n}人`,`卒業生が${n}人になる`,s=>s.A.length>=n));
 X("x_reunion1","🎊","全員集合","卒業アルバムから卒業生を全員集める",()=>cnt("reunion")>=1);
 X("x_reunion5","🥂","同窓会の主役","卒業生を全員集めるのを5回行う",()=>cnt("reunion")>=5);
 X("x_pop100","🔥","人気の頂点","人気が100に達する",s=>s.B.pop>=100);
 [[10,"💗"],[30,"💖"]].forEach(([n,i])=>X("x_hearts"+n,i,`モテモテ${n}`,`恋心を寄せる女子が同時に${n}人以上になる`,()=>hearts().length>=n));
 X("x_allhigh","✨","全員メロメロ","部員10人以上で、全員の愛情が90以上",s=>s.M.length>=10&&s.M.every(m=>m.love>=90));
 [[10,"🏆"],[50,"🥇"],[100,"🌟"]].forEach(([n,i])=>X("x_wins"+n,i,`大会${n}勝`,`大会で通算${n}回勝つ`,s=>s.wins>=n));
 [[100,"📅"],[300,"⏳"]].forEach(([n,i])=>X("x_weeks"+n,i,`${n}か月の物語`,`通算${n}か月を過ごす`,s=>s.weeks>=n));
 X("x_ng1","🔁","二周目へ","二周目を始める",s=>s.ng>=1);X("x_ng3","♾","やり込み王","四周目に到達する",s=>s.ng>=3);
 X("x_reply100","📱","返信の鬼","メッセージに100回返信する",()=>cnt("reply")>=100);
 X("x_call30","📞","長電話","電話を30回かける",()=>cnt("call")>=30);
 X("x_hp100","💎","ハートの貯金","ハートポイントが100になる",s=>(s.hp||0)>=100);
 X("x_lv50","💪","自分磨きの鬼","顧問の強化Lvの合計が50に達する",()=>lvSum()>=50);
 X("x_perkall","🎖","特技マスター","特技をすべて習得する",s=>PERKS.every(p=>s.perks&&s.perks[p.id]));
 X("x_facall","🏠","理想の部室","部室の施設をすべて導入する",s=>FACILITIES.every(p=>s.fac&&s.fac[p.id]));
})();

/* ===== モテ実感パック：モテ指数／取り巻きの輪／握手会／学園新聞／ささやき／号外 =====
   ■ メイン画面の「💞 モテ」から開く。台本・数値は下の MT_* を編集。状態：S.cnt.hand（握手会回数）/ S.hs（累計握手人数）/ S.fl.mt（前回ランク） */
const MT_RANK=[[0,"まだ無名"],[10,"ちょっと気になる存在"],[25,"部内のアイドル"],[50,"学園の人気者"],[80,"学園の王子様"],[120,"校内のカリスマ"],[180,"街じゅうの噂の的"],[260,"国民的モテ男"],[400,"伝説のモテ王"],[700,"モテの神"]];
const MT_W=["先生、今日もかっこいい…","あの笑顔、反則だよ…","先生のこと考えてて、授業聞いてなかった。","隣の席、空いてないかな…","今日も先生と話せますように。","先生って、どんな子がタイプなんだろう。","先生の背中、ずっと見てられる…","心臓、もたない…!"];
const MT_H=["「握手、お願いします! 手は洗いません!」","「次の列にも並び直していいですか?」","「先生の手、あったかい…一生忘れません。」","「3時間並んで、報われました…!」","「先生、私の名前、覚えててくれたんですか?!」","「すごい列…でも一番乗りは私ですよね?」"];
const MT_X=["「先生、おめでとうございます! 自分のことのように嬉しいです!」","「号外、スマホの待ち受けにしました!」","「…ライバルが増えそうで、ちょっと複雑です。」","「先生はみんなの先生。…私のでもありますけど。」"];
/* 恋心を寄せる全員（部員・卒業生・学内の女子。愛情/親密度60以上） */
const fansAll=()=>[...S.M.filter(m=>m.love>=60),...S.A.filter(a=>a.love>=60),...cgList().filter(c=>c.love>=60)];
const moteIdx=()=>Math.round(fansAll().length*2+lovers()*3+Math.min(cgList().length,300)*.2+S.B.pop*.5);
const moteLv=()=>{let k=0;const i=moteIdx();MT_RANK.forEach((r,j)=>{if(i>=r[0])k=j});return k};
/* メイン画面の「ささやき」：誰かの心の声が毎回ひとこと聞こえる */
let _wh={k:"",t:""};   // 同じ月のあいだは同じささやきを表示する（ボタンを押すたびに入れ替わって落ち着かないため。月が替わる／周回・セーブが替わると新しいひとことになる）
function mtWhisper(){const f=fansAll();if(!f.length)return"";const k=`${S.ng||0}/${S.weeks||0}/${S.no||0}`;if(_wh.k===k&&_wh.t)return _wh.t;const m=pk(f);_wh={k,t:`💭 ${m.n}「${nmz(pk(MT_W),m)}」`};return _wh.t}
/* 顔アイコンの共通部品：愛情の高い順（恋仲が先頭）に並べ替え／最大 FACE_MAX(=300) 人の顔の壁／演出用の人数つき配列（金枠=恋仲／ピンク枠=愛情85以上） */
const faceSort=L=>[...L].filter(m=>m&&m.n).sort((a,b)=>(b.lover?1:0)-(a.lover?1:0)||b.love-a.love);
const faceMs=L=>{const s=faceSort(L).slice(0,FACE_MAX);s.total=L.length;return s};   // ノベルの ms に渡す用（最大FACE_MAX人。total=本当の人数）
function faceWall(L,max){max=max||FACE_MAX;const f=faceSort(L),sh=f.slice(0,max);if(!sh.length)return "";
 return `<div class="mtw fw">${sh.map(m=>`<span class="mtf ${m.lover?"lv":m.love>=85?"hi":""}" title="${m.n}">${phAv(m)}</span>`).join("")}</div>`+(f.length>max?`<p class="hint">…ほか${f.length-max}人</p>`:"")}
/* 取り巻きの輪：愛情の高い順に最大300人（FACE_MAX）の顔を並べる */
function mtWall(){const f=fansAll();if(!f.length)return `<p class="hint">まだ誰もいません。まずは愛情60以上を目指そう。</p>`;return faceWall(f)}
/* 学園新聞：状況に応じた見出し（月ごとに入れ替わる） */
function mtPaper(){const f=fansAll().length,lo=lovers(),c=cgList().length,p=S.B.pop,nm=S.B.name||"顧問",top=[...S.M].sort((a,b)=>b.love-a.love)[0];
 const H=[f>=1&&`【速報】${nm}先生、女子${f}人から熱い視線 校内で話題に`,lo>=2&&`【独占】${nm}先生に「恋人」が${lo}人? 関係者「全員、本気です」`,c>=10&&`学内女子${c}人が連絡先を交換 「先生、既読つけて」の声`,p>=60&&`${nm}先生の周りに女子が殺到 体育館前で入場規制`,top&&top.love>=80&&`${top.n}さん（${top.pos}）「先生は私の」発言が波紋`,f>=10&&`「${nm}先生の隣は誰?」女子たちの水面下の攻防 本紙調べ`,f>=30&&`${nm}先生ファンクラブ会員が急増 校内最大の派閥に`,`${nm}先生をめぐる恋の相関図、複雑すぎて本紙も把握できず`].filter(Boolean),s=S.weeks||0;
 return Array.from({length:Math.min(3,H.length)},(_,i)=>H[(s+i)%H.length])}
function moteHtml(){const f=fansAll(),k=moteLv(),nx=MT_RANK[k+1],i=moteIdx(),pc=nx?Math.round((i-MT_RANK[k][0])/(nx[0]-MT_RANK[k][0])*100):100;
 const inner=`<div class="mtc"><h3>モテ指数 <b>${i}</b>　${MT_RANK[k][1]}</h3><div class="mtb"><i style="width:${pc}%"></i></div><p class="hint">${nx?`次のランク「${nx[1]}」まであと ${nx[0]-i}`:"最高ランクです"}</p><p class="hint">あなたに恋している女子：部員${S.M.filter(m=>m.love>=60).length}人／卒業生${S.A.filter(a=>a.love>=60).length}人／学内${cgList().filter(c=>c.love>=60).length}人（合計 <b>${f.length}</b>人）</p></div>
 <div class="mtc"><h3>取り巻きの輪</h3>${mtWall()}</div>
 <div class="mtc"><h3>🎪 ファンイベント</h3><p class="hint">行列が長いほど、人気とハートが稼げます。</p>${Object.keys(MT_EV).map(k=>{const e=MT_EV[k],c=f.filter(m=>m.love>=e.lv).length;return `<div><button class="cgk" onclick="mtMeet('${k}')"${c<e.min?" disabled":""}>${e.ic} ${e.n}（行動力${e.ap}）</button><small class="hint"> 愛情${e.lv}以上${e.min}人〜／今${c}人</small></div>`}).join("")}</div>
 <div class="mtc"><h3>📰 学園新聞</h3>${mtPaper().map(h=>`<p class="hint">${h}</p>`).join("")}</div>`;
 return phShell("モテ",inner,`<button class="phk" onclick="go('phone')">‹ ホーム</button>`)}
/* ファンイベント：握手会／ハグ会／キス会。対象=愛情lv以上のファン。行列→代表6人が一言→選択肢（g=愛情 l=情欲 p=独占欲 pop=人気 hp=💗 tm=和 need=必要人気 lover=恋仲化） */
const MT_G=["「ぎゅって、してもらっていいですか…?」","「先生の腕の中、安心します…。」","「もう少しだけ、このままで…。」","「今日のこと、一生の宝物にします!」","「順番待ちの間、ずっとドキドキでした…!」","「次の列にも並んじゃおうかな…。」"];
const MT_K=["「…ほっぺに、お願いします。」","「ずっと、この日を待ってました…。」","「恥ずかしいから、目をつぶっててください…。」","「先生、私が一番でいいですよね…?」","「…夢みたい。顔、熱い…。」","「次は、私のほうからしてもいいですか?」"];
const MT_EV={
 hand:{n:"握手会",ic:"🎤",ap:2,min:5,lv:60,L:MT_H,intro:"体育館前に、握手を求める女子の行列ができた。先頭が見えないほど長い。並んでいるのは、なんと{n}人。",end:"行列は途切れない。右手がじんじん熱い。",ask:"{n}人の手を、どう握る?",ch:[
  {t:"一人ずつ、心を込めて握手する",r:"{n}人全員と握手した。手は真っ赤だが、みんな幸せそうだ。",g:2,l:0,p:0,pop:1,hp:2,tm:0},
  {t:"両手で包み込むように握る",r:"「ひゃっ…!」あちこちで悲鳴と歓声が上がり、列がさらに伸びた。",g:3,l:2,p:3,pop:2,hp:1,tm:-1},
  {t:"握手の後に、ひとこと名前を呼ぶ（人気60）",need:60,r:"名前を呼ばれた子から、次々に涙ぐんでいく。「覚えててくれたんだ…!」",g:4,l:3,p:4,pop:3,hp:3,tm:-1}]},
 hug:{n:"ハグ会",ic:"🤗",ap:2,min:5,lv:70,L:MT_G,intro:"体育館の入口に、ハグを待つ女子たちの長い列ができた。順番を待つのは{n}人。",end:"みんな頬を染めて、そわそわと自分の番を待っている。",ask:"{n}人を、どう迎える?",ch:[
  {t:"一人ずつ、やさしく抱きしめる",r:"{n}人を順番にハグした。みんな、とろけるような笑顔だ。",g:3,l:1,p:2,pop:1,hp:2,tm:0},
  {t:"両腕で何人もまとめて抱きしめる",r:"「きゃーっ!」歓声が体育館に響いた。腕の中は、女子でいっぱいだ。",g:4,l:3,p:5,pop:2,hp:1,tm:-2},
  {t:"ぎゅっと長めに抱きしめて、頭をなでる（人気60）",need:60,r:"長いハグに、膝から力が抜ける子まで出た。「もう、離れたくない…」",g:5,l:4,p:6,pop:3,hp:3,tm:-3}]},
 kiss:{n:"キス会",ic:"💋",ap:3,min:3,lv:85,L:MT_K,intro:"ステージの前に、頬を赤らめた女子たちがずらりと並んでいる。その数、{n}人。キス会の始まりだ。",end:"会場は、期待と緊張の空気でいっぱいだ。",ask:"{n}人に、どう応える?",ch:[
  {t:"おでこにキスして、頭をなでる",r:"やさしい仕草に、あちこちから溜め息がもれた。「幸せ…」",g:2,l:1,p:0,pop:1,hp:2,tm:1},
  {t:"頬に、そっと口づける",r:"{n}人の頬に、順番に口づけた。みんな真っ赤だ。",g:3,l:2,p:3,pop:2,hp:3,tm:-1},
  {t:"一人ひとりに、唇でキスをする（人気70）",need:70,r:"会場が、悲鳴にも似た歓声で包まれた。この日から、{n}人の想いは本物になった。",g:5,l:5,p:8,pop:4,hp:4,tm:-4,lover:1}]}};
function mtMeet(k){const e=MT_EV[k],q=fansAll().filter(m=>m.love>=e.lv);if(q.length<e.min){toast(`${e.n}は、愛情${e.lv}以上の女子が${e.min}人以上で開催できます`);return}if(!spend(e.ap))return;
 const n=q.length,six=[...q].sort(()=>Math.random()-.5).slice(0,6),own=m=>S.M.includes(m)||S.A.includes(m),F=t=>t.replace(/\{n\}/g,n),b=Math.min(4,n/15|0);
 const eff=c=>{q.forEach(m=>{if(own(m)){gain(m,c.g);m.lust=cl(m.lust+c.l);if(S.M.includes(m))m.poss=cl(m.poss+c.p);if(c.lover)m.lover=true}else m.love=cl(m.love+c.g*2)});popUp(c.pop+b);hpUp(c.hp);if(c.tm)tm(c.tm)};
 S.cnt[k]=(S.cnt[k]||0)+1;S.hs=(S.hs||0)+n;hist(`${e.ic} ${e.n}：${n}人の行列`);menu="main";Snd.play("love");
 const L=[{who:"",t:F(e.intro),m:six[0],ms:faceMs(q)}];
 six.slice(0,4).forEach(m=>L.push({who:m.n,t:pk(e.L),m}));
 L.push({who:"",t:F(e.end),m:six[0]});
 L.push({who:"",t:F(e.ask),m:six[0],ms:faceMs(q),ch:e.ch.map(c=>({t:c.t,off:!!c.need&&S.B.pop<c.need,r:F(c.r),f:()=>{eff(c);Save.write(S);draw()}}))});
 Novel.play(L);after()}
function mtHand(){mtMeet("hand")}
/* 号外：モテ指数のランクが上がると、校内に号外が貼り出される（月送りで判定） */
function mtExtra(){const k=moteLv(),o=S.fl.mt==null?k:S.fl.mt;S.fl.mt=k;if(k<=o)return[];const six=[...fansAll()].sort(()=>Math.random()-.5).slice(0,6);if(!six.length)return[];
 popUp(1);hpUp(1);hist(`📰 号外：モテ指数ランク「${MT_RANK[k][1]}」`);
 return[{who:"",t:`校内に号外が貼り出された。「${S.B.name||"顧問"}先生、ついに『${MT_RANK[k][1]}』に!」`,m:six[0],ms:six.length>=3?six:undefined},...six.slice(0,3).map(m=>({who:m.n,t:pk(MT_X),m}))]}
(function(){const X=(id,i,n,d,ok)=>ACH.push({id,i,n,d,ok:s=>{try{return !!ok(s)}catch(e){return false}}});
 X("mt_hand1","🎤","握手会の長蛇の列","握手会を開く",s=>(s.cnt&&s.cnt.hand||0)>=1);
 X("mt_hand1000","🤝","握手1000人","握手会で累計1000人と握手する",s=>(s.hs||0)>=1000);
 X("mt_hug1","🤗","ハグ会の大行列","ハグ会を開く",s=>(s.cnt&&s.cnt.hug||0)>=1);
 X("mt_kiss1","💋","キス会の夜","キス会を開く",s=>(s.cnt&&s.cnt.kiss||0)>=1);
 X("mt_rank5","🔥","校内のカリスマ","モテ指数が「校内のカリスマ」に到達",()=>moteLv()>=5);
 X("mt_rank9","⚡","モテの神","モテ指数が最高ランクに到達",()=>moteLv()>=9);
 const st=document.createElement("style");
 st.textContent=".mtw{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.mtf{display:inline-block;animation:mtsway 2.6s ease-in-out infinite;transform-origin:50% 90%}.mtf:nth-child(3n){animation-delay:-.9s}.mtf:nth-child(3n+1){animation-delay:-1.7s;animation-duration:3.1s}.mtf:nth-child(5n){animation-duration:2.2s}.mtf .av{width:52px;height:52px;box-shadow:0 0 0 2px #fff}.mtf.hi .av{box-shadow:0 0 0 2px #ff9fb8}.mtf.lv .av{box-shadow:0 0 0 3px #ff3b6a,0 0 8px #ff3b6a}@keyframes mtsway{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-3px) rotate(3deg)}}@media(prefers-reduced-motion:reduce){.mtf{animation:none}}span.av svg,span.av img{width:139%;max-width:none;margin:-27.8% 0 0 -19.5%;display:block}.fw{gap:2px}.fw .mtf .av{width:34px;height:34px;box-shadow:0 0 0 1px #fff}.fw .mtf.hi .av{box-shadow:0 0 0 2px #ff9fb8}.fw .mtf.lv .av{box-shadow:0 0 0 2px #ff3b6a,0 0 6px #ff3b6a}.crowd{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;align-content:center;width:100%;max-height:100%;overflow:hidden;padding:4px}.crowd .mtf .av{width:clamp(26px,4.6vw,46px);height:clamp(26px,4.6vw,46px);box-shadow:0 0 0 1px #fff}.mtb{height:10px;border-radius:5px;background:rgba(0,0,0,.15);margin:4px 0}.mtb i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#ff9fb8,#ff3b6a)}.mtc{background:#fff;color:#111;border-radius:16px;padding:12px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.08)}.mtc h3{margin:0 0 6px;font-size:.95rem}.mtc .hint{color:#6b6b70;font-size:.76rem;margin:4px 0}.mtc button:disabled{opacity:.5}";
 document.head.appendChild(st)})();

/* ===== ハーレム状態の台詞を追加（健全な内容）。HGROUP[2]=2人用 / HGROUP[3]=3人用 / HMASS=4人以上。書式は novels.js と同じ（話者 "@" "@2" "@3"・変数 {mei} {mei2} {boss} {num}） ===== */
(function(){const add=(a,v)=>{if(a&&a.push)a.push(...v)};
 if(typeof HGROUP!=="undefined"){
 add(HGROUP[2],[
  [["","昼休み、{mei}と{mei2}が、{boss}の両側に座ってお弁当を広げた。"],["@","「先生、今日は私が作ってきました!」"],["@2","「わ、私のも…! 食べ比べしてください!」"],["","どちらも美味しくて、{boss}は幸せな悩みに頭を抱えた。"]],
  [["","練習後の帰り道。{mei}と{mei2}が、{boss}を挟んで並んで歩いている。"],["@","「先生、今日のスパイク、見てくれてましたか?」"],["@2","「私のレシーブもですよ! ね、先生?」"],["","夕焼けの中、二人の笑い声が重なった。"]],
  [["","部室で、{mei}と{mei2}が「先生に褒められた回数」を数え合っていた。"],["@","「私は今週3回です!」"],["@2","「えっ、私は4回! …先生、本当ですよね?」"],["","{boss}は苦笑しながら、二人の頭をぽんぽんと撫でた。"]],
  [["","自販機の前で、{mei}と{mei2}が同時に{boss}へ缶コーヒーを差し出した。"],["@","「あっ、かぶった…!」"],["@2","「じゃあ二本とも先生に!」"],["","両手に缶コーヒー。今日はカフェインに困らなさそうだ。"]]]);
 add(HGROUP[3],[
  [["","放課後の体育館。{mei}、{mei2}、{mei3}が、{boss}を囲んで作戦会議を始めた。"],["@","「次の大会、絶対に勝ちましょう!」"],["@2","「勝ったら、先生にご褒美もらえますか?」"],["@3","「いいですね! 私はケーキがいいです!」"],["","三人の期待のまなざしに、{boss}は財布の中身を思い出した。"]],
  [["","合宿の相談中、{mei}と{mei2}と{mei3}が、{boss}の隣の席をめぐってじゃんけんを始めた。"],["@","「最初はグー!」"],["@2","「勝った! 先生の右は私です!」"],["@3","「じゃあ私は左…!」"],["","結局、みんなで笑いながら並んで座ることになった。"]],
  [["","部室のソファで、{boss}は{mei}、{mei2}、{mei3}と一緒に映画を見ていた。"],["@","「このシーン、泣けますね…」"],["@2","「ティッシュ、ありますか?」"],["@3","「先生、ハンカチ貸してください…」"],["","{boss}の両手と肩は、しばらく貸し出し中になった。"]]])}
 if(typeof HMASS!=="undefined")add(HMASS,[
  [["","{boss}が体育館に入ると、{num}人の女子が一斉に駆け寄ってきた。"],["部員たち","「先生ー! 今日も練習、見てください!」"],["","あっという間に、{boss}の周りは笑顔でいっぱいになった。"]],
  [["","練習の合間、{num}人が{boss}を囲んで、ちいさな差し入れ大会が始まった。"],["部員たち","「先生、これ食べてください!」「私のも!」"],["","両手いっぱいのお菓子とジュースに、{boss}は嬉しい悲鳴を上げた。"]],
  [["","記念写真の時間。{num}人が「先生の隣がいい!」と言って、なかなか並べない。"],["部員たち","「もっとこっち! 見えない!」「せーの、はいチーズ!」"],["","撮れた写真には、全員が{boss}に寄りかかって笑っていた。"]],
  [["","大会前の円陣。{num}人が{boss}を中心に、ぎゅっと肩を組んだ。"],["部員たち","「先生のために、全力で勝つぞー!」「おーっ!!」"],["","体育館いっぱいに、頼もしい掛け声が響いた。"]]])})();

/* ---------- ノベル内の顔の群れ（.crowd）の自動フィット ----------
   枠（親要素）の大きさと人数から、全員が見切れずに収まる最大の顔サイズ(46px〜6px)を計算して --cs に入れる。人数が多い時（150人超）は揺れアニメを止めて軽くする。
   ※ 顔の最大人数そのものは FACE_MAX（data.js）。枠は style.css の .nvp.wide（高さ min(48vh,380px)）。※この処理は boss.js にあります（campus.js が未読込でも動くように） */
(function(){try{
 const st=document.createElement("style");st.textContent=".crowd.fit .mtf{display:block;line-height:0;font-size:0}.crowd.fit .mtf .av{display:block;width:var(--cs)!important;height:var(--cs)!important}.crowd.fit.many .mtf{animation:none}";document.head.appendChild(st);
 const fit=c=>{try{const n=c.children.length;if(!n)return;const cs=getComputedStyle(c),P=c.parentElement,gap=parseFloat(cs.columnGap)||3,
   W=c.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0),H=((P&&P.clientHeight)||Math.round(innerHeight*.48))-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0);
  if(W<40||H<40)return;let s=46;while(s>6&&Math.floor((W+gap)/(s+gap))*Math.floor((H+gap)/(s+gap))<n)s--;
  c.style.setProperty("--cs",s+"px");c.classList.add("fit");c.classList.toggle("many",n>150);c.dataset.fitN=n}catch(e){}};
 let q=0;const run=()=>{q=0;document.querySelectorAll(".crowd").forEach(c=>{if(!c.classList.contains("fit")||c.dataset.fitN!==String(c.children.length))fit(c)})};
 new MutationObserver(()=>{if(!q)q=requestAnimationFrame(run)}).observe(document.body||document.documentElement,{childList:true,subtree:true});
 addEventListener("resize",()=>document.querySelectorAll(".crowd").forEach(fit));
}catch(e){console.error("顔の群れ フィット失敗:",e)}})();
