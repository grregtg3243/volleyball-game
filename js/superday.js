/* superday.js : 超ハーレムデー＋「人気100かつ恋仲1000人以上」ボーナス
   ■ 読み込み順：… → boss.js → phone.js → campus.js → superday.js → ogkai.js → game.js（game.js より前ならどこでもOK）
   ■ 呼び出し元：game.js の全体練習ボタン（superDay）／boss.js の autoJoin（入部希望者数）／phone.js の campus()（連絡先を聞きたい女子の数）
   ■ 調整値は下の SUPER に集約 */
const SUPER={
 NEED_LOVERS:1000,   // 解放・ボーナスに必要な恋仲の人数（卒業生を含む）
 NEED_POP:100,       // ボーナスに必要な人気
 AP:3,               // 超ハーレムデーの行動力
 JOIN:[50,250],      // ボーナス時：翌月に進むで来る入部希望者数
 CONTACT:[100,500]   // ボーナス時：翌月に進むで連絡先を聞いてくる女子の数
};
/* 解放条件：恋仲が1000人以上 */
function superOpen(){return typeof lovers==="function"&&lovers()>=SUPER.NEED_LOVERS}
/* ボーナス条件：人気100 かつ 恋仲1000人以上（boss.js の autoJoin / phone.js の campus() が参照） */
function superOn(){try{return !!(S&&S.B&&S.B.pop>=SUPER.NEED_POP&&superOpen())}catch(e){return false}}

const SUPER_T={
 intro:[
  "体育館の扉が開いた。…そこは、女子で埋め尽くされていた。部員も、キャンパスのファンも。総勢{num}人。足の踏み場もない。甘い女の匂いがすでにサウナのように立ち込め、熱気が肌にまとわりついている。",
  "体育館のど真ん中に、ぽつんと椅子が一脚。{boss}のために用意された、玉座だった。誰かが後ろから柔らかな布を目に当て、きつく結ぶ。「先生、今日は目隠しです。何が起きても、逃げないでくださいね」甘い吐息が耳にかかる。",
  "「先生、こちらへ！」「座って座って！」黄色い声に背中を押され、{boss}は椅子に腰を下ろした。視界は完全に闇。だが、四方から押し寄せる気配と、濃厚な女の匂いで、無数の女子に囲まれていることだけははっきりと分かる。股間が、すでに熱を帯び始めていた。"],
 wall:[
  "その瞬間、歓声がぴたりと止んだ。ぐるりと取り囲む女の壁が、じりっ…と半歩、近づく。目隠しの向こうで、熱い吐息と甘い体臭が肌に触れそうな距離まで迫ってくる。",
  "もう一歩。{num}人分の熱気と、ねっとりとした甘い女の香りが、体育館いっぱいに満ちていく。逃げ場は、どこにもない。誰かの汗ばんだ太ももが、椅子の脚に触れた。誰かの熱い吐息が、首筋に落ちる。",
  "壁はゆっくりと、確実に迫ってくる。目は見えない。だが、椅子の周りには、{boss}だけを見つめる瞳、瞳、瞳が無数にあること、そして彼女たちのオマンコがすでに熱く疼いていることが、匂いと気配だけで分かってしまう。股間は、完全に勃起していた。"],
 kiss:[
  "「…最初は、私がもらいます。」{name}が一歩進み出て、そっと唇を重ねた。ねっとりと舌を絡め、甘い涎を流し込んでくる。「先生…誰の唇か、分かりますか？」全く分からない。ただ、熱く、柔らかく、メロメロになるほど甘い。",
  "「ずるいよ、でも…私も。」{name}が頬を真っ赤にしながら、背伸びをしてキスをした。「先生の股間、もうこんなに硬くなってる…。目隠しのまま、誰の唇か当ててみて？」当てられない。ただ、彼女の熱い吐息と体臭に包まれ、チンポがさらに跳ねる。",
  "「先生、目隠しのまま…私の唇、当ててください。」{name}の唇が、やさしく、しかし貪欲に触れた。舌を深く捻じ込み、涎を混ぜ合う。「んっ…誰でしょう？　ヒントは、もうパンツ、ぐしょぐしょです」全く分からない。股間は限界まで硬く、疼いていた。",
  "「みんなの前だけど…いいよね？　先生、私のキス、分かる？」{name}が小さく笑って、深くキスをした。唇を吸いつくように重ね、舌を絡め、甘い匂いを鼻腔に流し込む。「当てられなくても、いいですよ。その分、もっと感じさせてあげるから」",
  "「ずっと、こうしたかったんです。先生の目隠しした顔に、キスしたくて。」{name}の声は少し震え、しかし熱い。「誰の唇か、当ててみて？　…無理ですよね。だって、みんな、先生の匂いでメロメロなんですから」当てられない。ただ、彼女の熱い体が密着し、股間を擦りつけてきている。",
  "「次は私！　…先生、覚悟してね？　目隠しのまま、私のキスを味わって。」{name}がぎゅっと抱きついてキスをした。ねっとりと舌を根元まで絡め、涎を垂れ流しながら「誰でしょう？　ヒントは、もうオマンコから愛液が滴ってます」全く分からない。チンポは完全にフル勃起し、パンツを突き上げていた。"],
 montage:[
  "次の子が、{boss}の唇に触れる。また、次の子。「先生、誰の唇か分かる？」「当ててみて？」「分からないよね…ふふ」順番を待つ列は、体育館の壁際まで続いている。目隠しのまま、延々とキス当てゲームが続く。{boss}は一人も当てられない。股間は限界まで硬く、疼き続けている。",
  "「次、私！」「その次は私だよ！」「ずるい、割り込まないでー！」…一人ひとり、順番に、キスをする。「先生のチンポ、こんなに硬くなってる…。目隠しで見えないから、私たち、もう全裸になっちゃおっか？」誰かがそう囁いた瞬間、衣擦れの音が周囲で連鎖した。甘い女の匂いが、さらに濃く、ねっとりと充満する。",
  "一人終わるたびに歓声が上がる。誰もが頬を染め、{boss}の名前を呼んでいた。そして、視界のない{boss}の全身に、無数の熱い舌が這い始めた。耳、首筋、乳首、腹筋、股間…。誰かがチンポを取り出し、ねっとりと舐め上げる。誰かが熱いオマンコを顔に押し付け、愛液を塗りたくる。サウナのような熱気と、女の匂いと、粘つく音だけが充満している。",
  "どれだけの時間が経っただろう。{num}人全員が、順番に{boss}と唇を重ね、全身を舐め回し、代わる代わるチンポを咥え込み、腰を落としてきた。目隠しのまま、無数の女子に囲まれ、全身を舐められながら、一人、また一人と中に出し続けていく。超ハーレム。逃げ場など、どこにもない。"],
 end:"最後の一人が腰を振り終わると、体育館は割れんばかりの歓声と甘い吐息に包まれた。「先生、大好き!!」「また、目隠しでやってね!!」「次は私が中に出してもらうから!!」目隠しを外された{boss}の視界に飛び込んできたのは、汗だくで全裸の{num}人分のアヘ顔と、滴る愛液と精液の混じった光景だった。"
};

function superDay(){let st="依存確認";try{
 const miss=Object.entries({lovers:typeof lovers,spend:typeof spend,fmt:typeof fmt,pk:typeof pk,gain:typeof gain,cgList:typeof cgList,cgGain:typeof cgGain,cgJel:typeof cgJel,faceMs:typeof faceMs,popUp:typeof popUp,hpUp:typeof hpUp,tm:typeof tm,hist:typeof hist,after:typeof after,draw:typeof draw,Novel:typeof Novel,Save:typeof Save,Snd:typeof Snd}).filter(([,t])=>t==="undefined").map(([k])=>k);
 if(miss.length)throw new Error("未定義の部品："+miss.join("、")+"（読み込み順・ファイル名を確認）");
 st="条件確認";if(!superOpen()){toast(`超ハーレムデーは恋仲が${SUPER.NEED_LOVERS}人以上必要です（現在${lovers()}人）`);return}
 if(S.ap<SUPER.AP){spend(SUPER.AP);return}   // 行動力不足の表示は spend() に任せる（ここでは消費しない）
 st="台本作成";const G=cgList(),A=[...S.M,...G],n=A.length,top=[...A].sort((a,b)=>b.love-a.love).slice(0,6),crowd=faceMs(A);
 const F=(t,ms)=>fmt(String(t).replace(/\{num\}/g,n),ms||top);
 const nar=t=>({who:"",t:F(t),m:top[0],ms:crowd});
 const lines=[...SUPER_T.intro.map(nar),...SUPER_T.wall.map(nar),
  ...top.map((m,i)=>({who:m.n,t:F(SUPER_T.kiss[i%SUPER_T.kiss.length],[m]),m})),
  ...SUPER_T.montage.map(nar),nar(SUPER_T.end)];
 const done=f=>()=>{f();Save.write(S);draw()};
 lines.push({who:"",t:"…さあ、どうする?",m:top[0],ms:crowd,ch:[
  {t:"全員に、愛を伝える",r:F("{boss}は目隠しをしたまま、集まってくれた一人ひとりに感謝を伝えた。{num}人分の熱い体が押し寄せ、甘い女の匂いと涎と愛液に溺れながら、「先生、大好き…」「また中に出して」とアヘ顔で喘ぐ声が体育館に満ちた。"),
   f:done(()=>{S.M.forEach(m=>{gain(m,2);m.mood=cl(m.mood+5)});G.forEach(m=>cgGain(m,2));tm(4);popUp(2);hpUp(3)})},
  {t:"最初の一人を、強く抱きしめる",r:F("{boss}は目隠しのまま{name}だけを、ぎゅっと抱きしめた。彼女はすぐに腰を落としてチンポを咥え込み、ねっとりと子宮の奥まで飲み込む。…周りがざわつき、「ずるい！」「次は私！」と熱い体が殺到する。"),
   f:done(()=>{const w=top[0];gain(w,10);w.lust=cl(w.lust+5);if(S.M.includes(w))w.lover=true;S.M.filter(m=>m!==w).forEach(m=>{m.poss=cl(m.poss+5)});tm(-3);hpUp(3)})},
  {t:"もう一周、全員とキスをする",r:F("「えっ、もう一周!?」悲鳴と歓声が入り混じる中、{boss}は静かに微笑んだ。目隠しのまま、再び無数の唇が襲いかかり、全身を舐められ、代わる代わるオマンコに咥え込まれていく。長い、果てしない夜になりそうだ。"),
   f:done(()=>{S.M.forEach(m=>{m.lust=cl(m.lust+6);m.poss=cl(m.poss+3)});G.forEach(m=>{m.lust=cl(m.lust+5)});popUp(1);hpUp(5)})}]});
 st="行動力";if(!spend(SUPER.AP))return;
 st="効果";   // 全員とキスした分の基本効果（選択肢の効果は上乗せ）
 S.M.forEach(m=>{gain(m,4);m.lust=cl(m.lust+4);m.mood=cl(m.mood+10);if(m.love>=85&&!m.lover)m.lover=true});
 G.forEach(m=>{cgGain(m,5);m.lust=cl(m.lust+4)});
 popUp(5);hpUp(8);cgJel(3);S.cnt=S.cnt||{};S.cnt.superday=(S.cnt.superday||0)+1;S.cnt.supermax=Math.max(S.cnt.supermax||0,n);
 hist(`🌋 超ハーレムデー：体育館に${n}人が集結`);menu="main";Snd.play("love");
 st="再生";Novel.play(lines);after()
}catch(e){console.error("superDay 失敗["+st+"]",e);const msg=`超ハーレムデーに失敗（${st}）：${e&&e.message||e}`;try{(typeof errToast==="function"?errToast:toast)(msg)}catch(_){}}}

/* 実績 */
if(typeof ACH!=="undefined"&&!ACH.some(a=>a.id==="superday1"))ACH.push(
 {id:"superday1",i:"🌋",n:"女の壁",d:"超ハーレムデーを開催する",ok:s=>(s.cnt&&s.cnt.superday||0)>=1},
 {id:"superday500",i:"🏟",n:"体育館、満員御礼",d:"超ハーレムデーに500人以上を集める",ok:s=>(s.cnt&&s.cnt.supermax||0)>=500});
