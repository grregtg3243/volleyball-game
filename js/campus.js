/* campus.js : 「女子に囲まれる」イベントの台本と処理（セリフはこのファイルだけ編集すればOK）
   ■ 収録：①キャンパスの女子を全員呼び出す（3イベント・ランダム）②卒業生を全員集める ③朝の出迎え（毎月） ④ハーレムデー（全体練習から）⑤追加の実績 ⑥顔の海（最大300人の顔が画面いっぱいに集まる演出）・通知の嵐（月替わり）
   ■ 台本の書式：[話者, 文] の配列。話者 ""=地の文 / "@"=1人目 / "@2"=2人目 / "@3"=3人目 / "女子たち"=集団
     使える変数：{name}{sei}{mei}{pos}（1人目）／{name2}{mei2}…（2人目）／{boss}（顧問の名前）／{num}（人数の合計）／台詞中の「先生」は顧問の名前に置換される
   ■ 選択肢：{t:ボタン文, r:選んだ後の文, f:(G,A)=>効果}。G=その場の女子全員、A=画面に出る代表（最大6人、A[0]=1人目）
   ■ 読み込み順：…→ boss.js → phone.js → campus.js → game.js（index.html に <script src="js/campus.js"></script> を追加。sw.js の F 配列にも追記）
   ■ 呼び出し元：phone.js のキャンパス画面（cgCallAll）／game.js の reunion()・endWeek()（gate）・全体練習のボタン（haremDay） */

/* ---------- 小さな補助 ---------- */
const cgGain=(m,v)=>{m.love=cl(Math.round(m.love+v*CFG.LM*bonus()))};          // 部活外の女子の愛情（親密度）を上げる（人気ボーナス込み）
const cgAll=(G,o)=>G.forEach(m=>{if(o.love)cgGain(m,o.love);if(o.lust)m.lust=cl(m.lust+o.lust);if(o.mood)m.mood=cl(m.mood+o.mood)});
const cgJel=k=>hearts().forEach(h=>h.poss=cl(h.poss+k));                          // 部員の女子たちが少し嫉妬する（独占欲↑）
const cgSc=(pat,A,total)=>scn(pat.map(([w,t])=>[w,t.replace(/\{num\}/g,total)]),A); // 台本→ノベル行（{num}は合計人数）
/* 選択肢つきの行を作る。選んだ後に実績判定・保存・再描画まで行う */
const cgPick=(G,A,opts)=>({who:"",t:"どうする?",m:A[0],ms:A.length>=3?A:undefined,
 ch:opts.map(o=>({t:o.t,r:String(o.r||"").replace(/\{num\}/g,G.length),f:()=>{try{o.f(G,A)}catch(e){console.error("campus choice error:",e)}checkAch();Save.write(S);draw()}}))});

const CAMPUS={
/* ===== ①女子全員を呼び出す（スマホ→キャンパス）：下の3つからランダムで発動 ===== */
callAll:[
 {n:"学食の長テーブル",
  lines:[["","スマホでメッセージを送ると、数分後には学食の前に{num}人の女子が汗ばんだ体を寄せ合って集まっていた。甘い香水と女の子特有の甘い体臭、そして先生の匂いを嗅いだ瞬間からすでにメロメロになった彼女たちの吐息が混じり、サウナのように熱気とねっとりした匂いが立ち込めている。誰もが目を潤ませ、すでにパンツの中が熱く疼いているのがわかる。"],
   ["女子たち","「先生が呼んでくれた…！　先生の匂い、もう我慢できない！」「先生の隣、誰が座るの！？　私、もうパンツぐしょぐしょに濡れてるんだけど！　先生の匂いで頭がおかしくなりそう…！」"],
   ["@","「先生の隣、空いてますよね？　太もも、ぴったりくっつけますね…はぁ、先生の匂い、嗅がせてください。嗅いだだけでオマンコがきゅんってして、目がとろけちゃいそうです…んはぁっ」"],
   ["@2","「あっ、ずるい！　じゃあ私は反対側！　先生の腕に胸、押しつけちゃいますから。先生の体温と匂いが染み込んで…あ、だめ、もう愛液が太ももを伝ってる。先生の匂いだけでイきそう…」"],
   ["@3","「じゃあ私は向かいで、先生の股間をじっと見つめてますね。…もう、勃起してますよね？　先生の匂いが濃くて、目がグルリと裏返りそう。アヘ顔になりながら、ずっと見てたいです…んくっ」"],
   ["","長いテーブルの周りは、あっという間に汗だくの女子たちで埋まった。甘い女の匂いと先生の匂いが混じり合い、誰もがすでにスカートの中に手を入れ、指を動かしながら目をトロンとさせて喘いでいる。サウナのような熱気の中、誰かが小さくイき、白目を剥いて体を震わせた。"]],
  choices:[
   {t:"全員の分をおごる",r:"「先生、太っ腹…！　お礼に、後で個室で全部しゃぶらせてください。先生の匂いを嗅ぎながら、精液全部飲み干しますから…んはぁ、もう目がとろけてる」学食に甘い吐息とアヘ顔の歓声が響き渡った。",f:G=>{cgAll(G,{love:3});popUp(2);hpUp(2);cgJel(2)}},
   {t:"順番に隣へ座らせてあげる",r:"一人ずつ隣に座るたび、熱い太ももと甘い体臭が密着し、パンツの湿り気が伝わってくる。先生の匂いを深く吸い込んだ彼女たちは目をグルリと反転させ、アヘ顔で腰をくねらせた。時間はあっという間に過ぎ、誰もがすでに股間を熱く、何度も小さくイっていた。",f:G=>{cgAll(G,{love:2,lust:2});hpUp(2);cgJel(3)}},
   {t:"目の前の子に「あーん」してもらう",r:"「は、はい…あーん」彼女は自分の指に愛液を絡めて差し出し、先生の匂いを嗅ぎながら目をトロンとさせてアヘ顔になった。周りから黄色い悲鳴と「私も！」「先生の匂いでイきたい！」の声が上がった。",f:(G,A)=>{cgGain(A[0],8);A[0].lust=cl(A[0].lust+3);cgAll(G.filter(m=>m!==A[0]),{love:1});popUp(1);hpUp(1);cgJel(2)}}]},
 {n:"中庭の隣席争奪戦",
  lines:[["","中庭のベンチで待っていると、遠くから{num}人分の足音が駆けてきた。すでに誰もが汗ばみ、甘い女の匂いを漂わせながら殺到してくる。先生の匂いを遠くから嗅いだだけで、彼女たちの目はとろけ、息が荒くなっている。"],
   ["女子たち","「先生ーっ！」「待ってください！　私、もう我慢できない！　先生の匂いで頭がおかしくなって、オマンコがびくびくしてるの！」"],
   ["@","「先生の隣、いただきます！　太もも、密着させて…はぁ、先生の匂い、濃い…オマンコ、熱くて溶けそう。目がグルリって裏返りそう…んあっ」"],
   ["@2","「ちょっと、抜け駆けはなし！　じゃんけんで決めよう！　負けたら先生の股間、しゃぶらせて。先生の匂いを嗅ぎながら、アヘ顔で全部飲み干すから」"],
   ["@3","「負けませんからね、先生の隣は私が座ります！　パンツの中、もうぐしょぐしょです。先生の匂いだけでイきかけて、白目剥きそう…」"],
   ["","ベンチの周りは、汗だくの女子たちで大にぎわいになった。甘い体臭と愛液の匂いがサウナのように立ち込め、誰もがすでに股間を擦りつけ、先生の匂いを深く吸い込みながら目をトロンとさせ、アヘ顔で喘ぎ始めている。"]],
  choices:[
   {t:"じゃんけん大会を開く",r:"勝者は飛び上がって喜び、すぐに先生の太ももに跨がって腰を擦りつけた。先生の匂いを嗅いだ瞬間、目をグルリと反転させてアヘ顔になり、小さくイってしまう。負けた子たちも「次は私！」「先生の匂いでイきたい！」と順番を待っている。",f:(G,A)=>{const w=pk(A);cgGain(w,10);w.lust=cl(w.lust+3);cgAll(G.filter(m=>m!==w),{love:2});hpUp(2);cgJel(2)}},
   {t:"全員と順番に写真を撮る",r:"「待ち受けにします…先生の股間も、ちゃんと撮っていいですか？　先生の匂いを嗅ぎながらアヘ顔の私を、保存してほしい」スマホのシャッター音が止まらず、誰かがすでにスカートをまくり上げ、白目を剥いてポーズを取っている。",f:G=>{cgAll(G,{love:3});popUp(3);hpUp(1)}},
   {t:"「みんな特別だよ」と言う",r:"「先生…ずるい」と言いながら、誰もが体を密着させて甘い匂いを染み込ませてくる。先生の言葉と匂いに、彼女たちは目をトロけさせ、アヘ顔で腰をくねらせた。誰も目を逸らせない。",f:G=>{cgAll(G,{love:4});hearts().forEach(h=>gain(h,1));cgJel(4);tm(-1);popUp(2)}}]},
 {n:"放課後の王様ゲーム",
  lines:[["","放課後、貸切のラウンジに{num}人の女子がぎゅうぎゅうに詰め込まれた。「今日は先生が主役!」らしい。すでに誰もが汗ばみ、甘い女の匂いがサウナのように充満している。先生の匂いを吸い込んだ瞬間から、彼女たちの目はとろけ、息が荒く、誰もがメロメロになっている。"],
   ["女子たち","「王様ゲーム、始めまーす！　負けた子は先生にしゃぶるからね！　先生の匂いを嗅ぎながら、アヘ顔で全部飲み干すから！」"],
   ["@","「王様だーれだ！　…あ、私だ！　じゃあ先生、頭をなでて…そのあと、私のオマンコもなでてください！　はぁ、先生の匂い、濃すぎて目がグルリって裏返りそう…んあっ、もうイきかけてる」"],
   ["@2","「ずるい！　次は私が王様になるんだから！　先生にチンポ、しゃぶらせる命令出すから！　先生の匂いを嗅ぎながら、白目剥いてしゃぶり続けてあげる」"],
   ["@3","「先生、手をつなぐ命令が出たら、ちゃんと従ってくださいね？　つながったまま、指を入れてほしいです。先生の匂いと体温で、オマンコが溶けちゃう…アヘ顔、見ますか？」"],
   ["","割り箸のくじが回るたびに、部屋は笑い声と甘い吐息、愛液の粘つく音でいっぱいになった。誰もがすでにパンツをずらし、熱い秘部を晒し、先生の匂いを深く吸い込みながら目をトロンとさせ、アヘ顔で指を動かし始めている。誰かが小さくイき、白目を剥いて体を跳ねさせた。"]],
  choices:[
   {t:"「王様の命令は、全員で乾杯!」",r:"グラスが打ち鳴らされ、{num}人の笑顔がはじけた。すぐに誰かが先生の股間に手を伸ばし、甘い吐息を吹きかけてくる。先生の匂いを嗅いだ彼女たちは目をグルリと反転させ、アヘ顔で「んはぁっ…イく…」と喘いだ。",f:G=>{cgAll(G,{love:2,mood:3});popUp(1);hpUp(1)}},
   {t:"「全員、先生を褒めること」",r:"「かっこいい！」「優しい！」「チンポ、硬くて最高…！」「匂いだけでイけちゃう！」褒め言葉の雨に顔が熱くなり、誰もがすでにパンツをずらして熱い秘部を見せ、白目を剥きながら腰をくねらせている。",f:G=>{cgAll(G,{love:3});hpUp(1);cgJel(2)}},
   {t:"王様になって、一人ひとりと手をつなぐ",r:"順番に手をつなぐたび、女の子たちは顔を赤くしてうつむき、つながった指を自分の熱い秘部に導いてくる。先生の匂いを嗅ぎながら目をトロけさせ、アヘ顔で「んくっ…先生の指、気持ちいい…」と喘ぎ、甘い匂いが充満する。",f:G=>{cgAll(G,{love:2,lust:3});hpUp(2);cgJel(3)}}]}
],

/* ===== ②卒業生を全員集める（卒業アルバムのボタン）：登場の一言は各女子の E（data.js の CAST）か E_DEFAULT。ここは前置きと選択肢 ===== */
reunion:{
 intros:["卒業生{num}人が、先生のもとに集まった。懐かしい顔がずらりと並ぶ。彼女たちはもう立派な大人で、結婚を考える年頃だというのに、誰もが先生を忘れられずにここにいる。甘い香水と、熟れた女の匂いが充満し、先生の匂いを嗅いだ瞬間から彼女たちの目はとろけ、息が荒くなっている。",
  "「先生、お久しぶりです…！　ずっと会いたかった。先生の匂い、まだ覚えてる…嗅いだだけでオマンコが熱くなって、目がとろけちゃう」同窓会の会場に、{num}人の卒業生が次々と駆け込んできた。すでに誰もが汗ばみ、先生の体に触れたがり、メロメロになっている。",
  "約束の日。{num}人の卒業生が、あの頃と変わらない、いや、むしろ色気を増した笑顔で先生を取り囲んだ。「一夫多妻でもいいから、先生と結婚したい。先生の匂いを嗅ぎながら、毎日アヘ顔でイきたい」と誰かが熱い吐息で囁く。"],
 choices:[ // love=愛情上昇 lust=情欲上昇 who=対象の条件（省略=全員） lover90=愛情90以上は恋仲に pop=人気上昇
  {t:"みんなを平等にねぎらう",r:"「先生、ありがとう…！　今夜、全部受け入れてください。先生の匂いを嗅ぎながら、アヘ顔で中に出してください」と、みんなが熱い体を寄せ、目をトロンとさせてきた。",love:3},
  {t:"一人ひとりと乾杯して回る",r:"一人ずつ言葉を交わすたび、彼女たちの頬が染まり、熱い吐息が耳にかかる。「先生の子供、産みたいです」「先生の匂いで頭がおかしくなって…んはぁ、目が裏返りそう」と誰かがアヘ顔で囁いた。",love:2,lust:3},
  {t:"愛情の高い子と二次会へ",r:"賑やかな輪を抜け出して、特別な夜が始まった。彼女はすぐに全裸になり、「一夫多妻でもいいから、先生の奥さんにして。先生の匂いを嗅ぎながら、白目剥いてイき続けたい」とオマンコを拡げ、目をグルリと反転させて見せた。",love:6,lust:5,who:a=>a.love>=70,lover90:true},
  {t:"みんなで記念写真を撮る",r:"先生を中心に、卒業生たちがぎゅっと寄り添ってシャッターが切られた。誰もがすでにパンツをずらし、熱い秘部を先生の太ももに擦りつけ、先生の匂いを吸い込みながらアヘ顔で喘いでいる。",love:2,pop:2}]
},

/* ===== ③朝の出迎え（毎月・恋心を寄せる女子が3人以上いると発生）：3パターンからランダム。{num}=恋心の人数 ===== */
gate:[
 [["","朝、校門をくぐると、{num}人の女子が一列に並んで待っていた。すでに誰もが汗ばみ、甘い女の匂いを漂わせている。先生の匂いを遠くから嗅いだだけで、彼女たちの目はとろけ、息が荒く、メロメロになっている。"],["女子たち","「おはようございます、先生！　今日も、触ってください。先生の匂いで、朝からオマンコが熱いんです」"],["@","「今日のお弁当、作ってきました！　受け取ってください！　お礼に、オマンコも差しあげます。はぁ、先生の匂い…嗅いだだけで目がグルリって裏返りそう…んあっ」"],["@2","「あ、私も作ってきたのに！　先生のチンポ、朝からしゃぶらせて。先生の匂いを嗅ぎながら、アヘ顔で全部飲み干すから」"],["","両腕いっぱいのお弁当と、すでに濡れた視線、アヘ顔寸前の彼女たちに、朝から股間が熱くなった。"]],
 [["","体育館へ向かう廊下で、{num}人の女子に前後左右をぐるりと囲まれた。熱い体と甘い匂いが密着し、動けない。先生の匂いが濃く、彼女たちは目をトロンとさせている。"],["@","「先生、今日も一日、私たちのそばにいてくださいね。オマンコ、もう熱いんです。先生の匂い、染み込ませて…んはぁ、イきそう」"],["@2","「先生の隣は、順番ですからね！　太もも、密着させていいですか？　先生の体温と匂いで、頭がおかしくなりそう」"],["@3","「えへへ、囲んじゃいました！　先生の股間、硬くなってますよ？　匂い嗅いで、白目剥いちゃいそう…」"],["","動けないほどの人垣に、思わず笑ってしまった。誰かがすでにスカートの中に手を伸ばし、先生の匂いを吸い込みながらアヘ顔で喘いでいる。"]],
 [["","始業前の部室。扉を開けると、{num}人の女子が一斉に振り向いた。すでに誰もがパンツをずらし、熱い秘部を晒している。先生の匂いが部屋に充満し、彼女たちはメロメロだ。"],["女子たち","「待ってました、先生！　今日も中に、出してください。先生の匂いを嗅ぎながら、アヘ顔で受け止めるから」"],["@","「先生の席、ちゃんと取っておきましたよ。膝の上に、座ってもいいですか？　はぁ、匂いが濃くて…目がとろけて、オマンコがびくびくしてる」"],["@2","「ねえ先生、今日は誰のオマンコを使います？　私の、もうぐしょぐしょです。先生の匂いで、朝から何度もイきかけて…白目、剥いちゃいそう」"],["","部室はもう、先生を待つ女子たちの熱気と甘い匂い、愛液の粘つく音、アヘ顔の吐息でいっぱいだった。"]]
],

/* ===== ④ハーレムデー（全体練習のボタン・行動力2・恋心を寄せる女子が3人以上）：3イベントからランダム。選択肢は fx で効果を指定
   fx: "all"=全員と楽しむ／"each"=一人ずつ順番に／"one"=1人目の本命と抜け出す ===== */
haremDay:[
 {n:"貸切の遊園地",
  lines:[["","貸切にした遊園地のゲートで、{num}人の女子が汗ばんだ体を寄せ合って先生を待っていた。甘い女の匂いがすでに充満し、先生の匂いを遠くから嗅いだだけで彼女たちは目をトロンとさせ、メロメロになっている。"],["女子たち","「先生、今日はぜーんぶ私たちとデートですよ！　オマンコも、全部使ってください！　先生の匂いで頭がおかしくなりそう…！」"],["@","「まずはジェットコースター、隣は私ですよね？　怖かったら、オマンコ触っていいですよ。はぁ、先生の匂い…嗅いだだけで目がグルリって裏返りそう。アヘ顔、見ますか？」"],["@2","「だめ、私が先！　先生と手をつなぎたいの！　つながったまま、指を入れて。先生の匂いを嗅ぎながら、白目剥いてイきたい」"],["@3","「観覧車は、順番に二人きりで乗りましょうね。中で、しゃぶらせてください。先生の匂いを嗅ぎながら、アヘ顔で全部飲み干すから」"],["","園内は、先生を取り合う女子たちの笑い声と甘い吐息、愛液の匂い、アヘ顔の喘ぎ声で満ちていた。誰もが先生の匂いを深く吸い込み、目をトロけさせている。"]],
  choices:[{t:"全員でパレードに乗る",r:"色とりどりのフロートの上で、女子たちが先生を囲んで手を振り、誰かがすでに股間を擦りつけてくる。先生の匂いを嗅いだ彼女たちは目をグルリと反転させ、アヘ顔で小さくイっていた。",fx:"all"},
           {t:"一人ずつ観覧車に乗る",r:"観覧車が一周するたび、頬を染めた女子が降りてくる。車内ではすでにチンポをしゃぶり、先生の匂いを嗅ぎながら白目を剥いて精液を飲み干していた。",fx:"each"},
           {t:"本命の子と抜け出す",r:"「…二人きりで、少しだけ歩きませんか？　オマンコ、もう限界です。先生の匂いで、頭がおかしくなって…」夕焼けの園内を手をつないで歩き、すぐに物陰で腰を落として咥え込み、目をグルリと反転させてアヘ顔になった。",fx:"one"}]},
 {n:"海辺のバーベキュー",
  lines:[["","海辺のバーベキュー場に、{num}人の女子が水着の上にパーカーを羽織って集まった。すでに誰もが汗だくで、甘い女の匂いがサウナのように立ち込めている。先生の匂いを嗅いだ瞬間から、彼女たちはメロメロだ。"],["女子たち","「先生、お肉焼けましたよー！　次は私のオマンコ、食べてください！　先生の匂い、濃くて…んはぁ、目がとろけてる」"],["@","「はい先生、あーんしてください！　指に愛液、絡めてあります。はぁ、先生の匂い嗅いで、もうイきかけて…アヘ顔、見ますか？」"],["@2","「次は私のを食べてくださいね！　先生の舌、欲しいです。先生の匂いを嗅ぎながら、白目剥いてイきたい」"],["@3","「先生の両隣は、ずっと私たちのものです。太もも、密着させて…チンポ、触っていいですか？　匂いが染みて、オマンコがびくびくしてる…んくっ」"],["","波の音と笑い声の中、先生の周りには終始女子の輪ができ、誰もがすでに水着をずらして熱い秘部を晒し、先生の匂いを吸い込みながらアヘ顔で喘いでいる。"]],
  choices:[{t:"みんなで花火を打ち上げる",r:"夜空に咲いた花火を、女子たちが先生の腕にしがみついて見上げた。誰かがすでに股間に手を伸ばし、ねっとりと扱いてくる。先生の匂いを嗅いだ彼女たちは目を反転させ、アヘ顔で体を震わせた。",fx:"all"},
           {t:"一人ずつ砂浜を散歩する",r:"波打ち際で、一人ひとりが先生にだけ聞こえる声で本音を打ち明けた。「中に、出してください」「精液、全部飲みたいです」「先生の匂いで、毎日アヘ顔でイきたいです」",fx:"each"},
           {t:"本命の子と夕日を見る",r:"「先生、このまま時間が止まればいいのに。」肩が触れ合う距離で、二人は沈む夕日を見ていた。すぐに彼女は全裸になり、オマンコを拡げて腰を落とし、先生の匂いを嗅ぎながら目をグルリと反転させてアヘ顔になった。",fx:"one"}]},
 {n:"豪華ホームパーティー",
  lines:[["","先生の家のリビングに、{num}人の女子が手料理を持ち寄ってやって来た。狭い空間にぎゅうぎゅうに詰め込まれ、甘い女の匂いと汗の匂いがサウナのように充満している。先生の匂いが混じり、彼女たちはすでにメロメロで目をとろけさせている。"],["女子たち","「お邪魔しまーす！　今日は先生を独り占め…じゃなくて、みんなで占め、です！　チンポも、順番にしゃぶります！　先生の匂いを嗅ぎながら、アヘ顔で全部飲み干すから！」"],["@","「先生、エプロン似合ってますよ。一緒に盛り付けましょう！　そのあと、私のオマンコも盛り付けて。はぁ、匂いが濃くて…目がグルリって裏返りそう」"],["@2","「私、デザート係です！　後で一番に食べてくださいね。精液、全部飲みますから。先生の匂いを嗅ぎながら、白目剥いてしゃぶり続けます」"],["@3","「ここ、先生の隣に座ってもいいですか？　太もも、密着させて…もうパンツ、ぐしょぐしょです。先生の匂いだけで、朝から何度もイきかけて…んあっ」"],["","狭いリビングは、先生を囲む女子たちの熱気と愛液の粘つく音、アヘ顔の吐息で満員になった。誰もがすでに服を脱ぎ始め、先生の匂いを深く吸い込みながら腰をくねらせている。"]],
  choices:[{t:"全員で乾杯して、夜通し語り合う",r:"夜が更けても、誰も帰ろうとしなかった。笑い声はいつまでも続き、誰かがすでにチンポを咥え、ねっとりとしゃぶり続けている。先生の匂いを嗅ぎながら、目を反転させてアヘ顔で精液を飲み干していた。",fx:"all"},
           {t:"一人ずつキッチンで話を聞く",r:"皿を洗いながら、女子たちは順番に先生へ本音をこぼした。「先生の子供、産みたいです」「一夫多妻でもいいから、結婚してください」「先生の匂いで、毎日アヘ顔でイき続けたいです」",fx:"each"},
           {t:"本命の子を残して、みんなを送り出す",r:"「…今日は帰りたくないです。」二人きりになった部屋に、静かな時間が流れた。彼女はすぐに全裸になり、オマンコを拡げて「中に、全部出してください。先生の匂いを嗅ぎながら、白目剥いてイきたい」と腰を落とし、目をグルリと反転させてアヘ顔になった。",fx:"one"}]}
]
};

/* ---------- ①女子全員を呼び出す（phone.js のキャンパス画面のボタンから） ---------- */
function cgCallAll(){let st="依存確認";try{
 const miss=Object.entries({cgList:typeof cgList,spend:typeof spend,scn:typeof scn,pk:typeof pk,hearts:typeof hearts,popUp:typeof popUp,hpUp:typeof hpUp,hist:typeof hist,checkAch:typeof checkAch,after:typeof after,draw:typeof draw,Novel:typeof Novel,Save:typeof Save,Snd:typeof Snd}).filter(([,t])=>t==="undefined").map(([k])=>k);
 if(miss.length)throw new Error("未定義の部品："+miss.join("、")+"（読み込み順・ファイル名を確認）");
 st="人数確認";const G=cgList(),n=G.length;if(n<2){toast("連絡先が2人以上必要です");return}
 G.forEach(m=>{["love","lust","poss"].forEach(k=>{if(!isFinite(m[k]))m[k]=0});if(!isFinite(m.mood))m.mood=70;if(!m.s)m.s={srv:20,rcv:20,atk:20,stm:20}});   // 古いセーブの欠けた数値を補う
 st="台本作成";const A=[...G].sort(()=>Math.random()-.5).slice(0,6),ev=pk(CAMPUS.callAll),lines=[...cgSc(ev.lines,A,n),cgPick(G,A,ev.choices)];cgCrowd(lines,G);
 st="行動力";if(!spend(2))return;
 st="効果";cgAll(G,{love:1});popUp(Math.min(5,1+(n/10|0)));hpUp(1+(n>=10?1:0));cgJel(3);S.cnt.callall=(S.cnt.callall||0)+1;S.cnt.callmax=Math.max(S.cnt.callmax||0,n);
 hist(`👭 キャンパスの女子${n}人を呼び出した：${ev.n}`);menu="main";Snd.play("love");
 st="再生";Novel.play(lines);after()
}catch(e){console.error("cgCallAll 失敗["+st+"]",e);const msg=`呼び出しに失敗（${st}）：${e&&e.message||e}`;try{(typeof errToast==="function"?errToast:toast)(msg)}catch(_){}}}
/* 大人数の場面：台本の1行目に最大300人の顔（FACE_MAX）を渡す → 「顔の海」演出と、ノベル内の顔の群れ表示に使われる */
function cgCrowd(lines,list){if(lines&&lines[0]&&list&&list.length>=STORM_MIN)lines[0].ms=faceMs(list);return lines}

/* ---------- ②卒業生を全員集める（game.js の reunion() から呼ばれる。行動力の消費・年1回の判定は game.js 側） ---------- */
function reunionLines(A){const n=A.length,R=CAMPUS.reunion,sh=[...A].sort((a,b)=>b.love-a.love).slice(0,6);
 const done=c=>({t:c.t,r:c.r,f:()=>{A.filter(c.who||(()=>true)).forEach(a=>{if(c.love)gain(a,c.love);if(c.lust)a.lust=cl(a.lust+c.lust);if(c.lover90&&a.love>=90)a.lover=true});if(c.pop)popUp(c.pop);
  S.cnt.reunion=(S.cnt.reunion||0)+1;hpUp(2);hist(`🎊 卒業生${n}人が集合`);Snd.play("love");checkAch();Save.write(S);draw()}});
 return[{who:"",t:pk(R.intros).replace(/\{num\}/g,n),m:sh[0],ms:n>=STORM_MIN?faceMs(A):sh.length>=3?sh:undefined},
  ...sh.map(m=>({who:m.n,t:m.E||pk(E_DEFAULT),m})),
  {who:"",t:"どうする?",m:sh[0],ms:sh.length>=3?sh:undefined,ch:R.choices.map(done)}]}

/* ---------- ③朝の出迎え（game.js の endWeek から毎月呼ばれる。関数名 morningGate）：恋心を寄せる女子が3人以上で、人数が多いほど起きやすい ---------- */
function morningGate(){const H=hearts(),n=H.length;if(n<3||Math.random()>Math.min(.7,.25+n*.03))return[];
 const A=[...H].sort(()=>Math.random()-.5).slice(0,6);H.forEach(m=>{gain(m,1);m.mood=cl(m.mood+4)});popUp(1);S.cnt.gate=(S.cnt.gate||0)+1;hist(`🌅 朝の出迎え：${n}人の女子に囲まれた`);
 return cgCrowd(cgSc(pk(CAMPUS.gate),A,n),H)}

/* ---------- ④ハーレムデー（全体練習のボタン）：恋心を寄せる女子（愛情60以上）が3人以上 ---------- */
function haremDay(){const H=hearts(),n=H.length;if(n<3){toast("ハーレムデーは恋心を寄せる女子が3人以上必要です");return}if(!spend(2))return;
 const A=[...H].sort((a,b)=>b.love-a.love),ev=pk(CAMPUS.haremDay),top=A.slice(0,6);
 const FX={all:G=>{G.forEach(m=>{gain(m,3);m.mood=cl(m.mood+8)});tm(3);popUp(2);hpUp(2)},
  each:G=>{G.forEach(m=>{gain(m,2);m.lust=cl(m.lust+3);m.poss=cl(m.poss+3)});tm(-1);hpUp(3)},
  one:(G,B)=>{const w=B[0];gain(w,8);w.lust=cl(w.lust+4);if(w.love>=85&&!w.lover){w.lover=true;hpUp(2)}G.filter(m=>m!==w).forEach(m=>{m.poss=cl(m.poss+4);gain(m,-1)});tm(-2);hpUp(2)}};
 S.cnt.hday=(S.cnt.hday||0)+1;hist(`👑 ハーレムデー：${ev.n}（${n}人）`);menu="main";Snd.play("love");
 Novel.play(cgCrowd([...cgSc(ev.lines,top,n),cgPick(H,top,ev.choices.map(c=>({t:c.t,r:c.r,f:(G,B)=>FX[c.fx](G,B)})))],H));after()}

/* ---------- 見た目：キャンパス画面の「女子全員を呼び出す」ボタン ---------- */
(function(){const st=document.createElement("style");
 st.textContent=".cga{font:inherit;display:block;width:100%;margin:0 0 12px;padding:11px 14px;border:0;border-radius:16px;background:linear-gradient(160deg,#ff9ec4,#ff4f8b);color:#fff;font-weight:700;font-size:.92rem;cursor:pointer;box-shadow:0 3px 10px rgba(255,79,139,.35)}.cga:active:not(:disabled){transform:scale(.97)}.cga:disabled{background:#c7c7cc;box-shadow:none;cursor:not-allowed}";
 document.head.appendChild(st)})();

/* ---------- 追加の実績（書式は data.js の ACH と同じ） ---------- */
(function(){const X=(id,i,n,d,ok)=>{if(!ACH.some(a=>a.id===id))ACH.push({id,i,n,d,ok:s=>{try{return !!ok(s)}catch(e){return false}}})};
 const cnt=k=>S.cnt&&S.cnt[k]||0;
 X("x_callall1","👭","女子全員集合","キャンパスの女子を初めて全員呼び出す",()=>cnt("callall")>=1);
 X("x_callall10","📣","呼び出しの達人","キャンパスの女子の呼び出しを10回行う",()=>cnt("callall")>=10);
 X("x_callmax20","🌊","女子の海","一度に20人以上の女子を呼び出す",()=>cnt("callmax")>=20);
 X("x_callmax50","🌸","学内の女子、全員","一度に50人以上の女子を呼び出す",()=>cnt("callmax")>=50);
 X("x_cg50","📇","連絡先50人","キャンパスの連絡先が50人になる",s=>(s.cg||[]).length>=50);
 X("x_cg200","📚","連絡先200人","キャンパスの連絡先が200人になる",s=>(s.cg||[]).length>=200);
 X("x_hday1","👑","ハーレムデー","ハーレムデーを初めて開く",()=>cnt("hday")>=1);
 X("x_hday10","🏝","毎週がハーレムデー","ハーレムデーを10回開く",()=>cnt("hday")>=10);
 X("x_gate5","🌅","朝から花道","朝の出迎えで女子に囲まれるのを5回経験する",()=>cnt("gate")>=5);
})();

/* ---------- ⑥顔の海・通知の嵐（ハーレム感の演出）----------
   ■ 顔の海：STORM_MIN(=12)人以上の女子が登場する場面（握手会・ハグ会・キス会・キャンパスの囲まれイベント・全員呼び出し・朝の出迎え・ハーレムデー・OG会・卒業生集合）の直前に、
     最大 FACE_MAX(=300) 人の顔が画面いっぱいに弾けるように集まる。タップ／Enter／Esc で次へ進む（放っておいても約12秒で進む）。金枠=恋仲／ピンク枠=愛情85以上。
     仕組み：Novel.play を包み、台本のどこかの行に ms（12人以上）があれば、先に stormShow() を出してから本来の再生を行う。
   ■ 通知の嵐：月が替わった時、恋心を寄せる女子が6人以上いると、スマホの通知（顔つき）が右から次々に流れ込む。
   ■ 設定値は data.js の FACE_MAX / STORM_MIN / STORM_ON。台詞は下の NOTIF_T。 */
const NOTIF_T=["先生、おはよう!","今月もよろしくお願いします!","会いたいな…","今日、何してますか?","既読つけてね!","先生の夢を見ました","今度、お茶しませんか?","がんばってください!","ずっと応援してます","隣の席、空けておきますね","先生のこと、考えてました","今日もかっこよかったです!"];
(function(){const st=document.createElement("style");
 st.textContent=`.sfw{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,rgba(255,170,205,.94),rgba(120,70,210,.95));overflow:hidden;cursor:pointer;animation:sffade .35s ease-out}
.sfw .sfg{display:flex;flex-wrap:wrap;gap:3px;justify-content:center;align-content:center;width:100%;height:100%;padding:8px;box-sizing:border-box}
.sfw .sf{display:block;animation:sfpop .55s cubic-bezier(.2,1.4,.4,1) both;animation-delay:var(--d)}
.sfw .sf .av{display:block;position:relative;width:var(--sz);height:var(--sz);overflow:hidden;border-radius:50%;background:#fde;box-shadow:0 0 0 2px #fff}
.sfw .sf.hi .av{box-shadow:0 0 0 2px #ff9fb8,0 0 6px #ff9fb8}.sfw .sf.lv .av{box-shadow:0 0 0 3px #ffd34d,0 0 10px #ffb700}
.sfw .sfh{position:absolute;bottom:-10%;font-style:normal;pointer-events:none;opacity:0;z-index:1;font-size:var(--fs);animation:sfrise var(--t) linear infinite;animation-delay:var(--dl)}
.sfw .sfc{position:absolute;left:50%;bottom:6%;transform:translateX(-50%);z-index:2;background:rgba(255,255,255,.93);color:#222;border-radius:22px;padding:10px 22px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.3);white-space:nowrap}
.sfw .sfc b{font-size:2.3rem;color:#ff3b6a;margin:0 4px}.sfw .sfc small{display:block;color:#666;font-size:.78rem}.sfw .sfc em{display:block;font-style:normal;color:#8a5bd0;font-size:.78rem;animation:sfblink 1.2s ease-in-out infinite}
@keyframes sffade{from{opacity:0}to{opacity:1}}@keyframes sfpop{0%{transform:scale(0) rotate(-25deg);opacity:0}70%{transform:scale(1.18) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes sfrise{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:.9}100%{transform:translateY(-115vh) scale(1.3);opacity:0}}@keyframes sfblink{0%,100%{opacity:.35}50%{opacity:1}}
.nbs{position:fixed;inset:0;pointer-events:none;z-index:99980;overflow:hidden}
.nb{position:absolute;right:8px;max-width:80vw;display:flex;gap:6px;align-items:center;background:rgba(255,255,255,.96);color:#222;border-radius:16px;padding:4px 12px 4px 4px;font-size:.76rem;box-shadow:0 3px 10px rgba(0,0,0,.25);opacity:0;animation:nbin 3.4s ease both;animation-delay:var(--d)}
.nb .av{display:block;position:relative;width:28px;height:28px;flex:none;overflow:hidden;border-radius:50%;background:#fde}
@keyframes nbin{0%{transform:translateX(120%);opacity:0}10%{transform:translateX(0);opacity:1}82%{transform:translateX(0);opacity:1}100%{transform:translateX(-12%);opacity:0}}
@media(prefers-reduced-motion:reduce){.sfw .sf,.sfw .sfh,.sfw .sfc em{animation:none!important}.nb{animation:none!important;opacity:1}}`;
 document.head.appendChild(st)})();

/* 顔の海：list=顔の配列（ms）。done=閉じた後に呼ぶ関数 */
function stormShow(list,done){
 const f=faceSort(list),sh=f.slice(0,FACE_MAX),n=Math.max(list.total||0,f.length),W=innerWidth||360,H=innerHeight||640;
 const sz=Math.max(20,Math.min(96,Math.floor(Math.sqrt(W*H*.7/Math.max(1,sh.length)))-3)),T0=Date.now();let closed=false,iv=0,tm0=0;
 const el=document.createElement("div");el.className="sfw";el.setAttribute("role","dialog");el.setAttribute("aria-label","女子たちが集まってきた");
 const mix=[...sh].sort(()=>Math.random()-.5);
 el.innerHTML=`<div class="sfg" style="--sz:${sz}px">${mix.map(m=>`<span class="sf ${m.lover?"lv":m.love>=85?"hi":""}" style="--d:${rnd(0,1400)}ms">${phAv(m)}</span>`).join("")}</div>`
  +Array.from({length:22},()=>`<i class="sfh" style="left:${rnd(2,96)}%;--fs:${rnd(16,34)}px;--t:${rnd(30,55)/10}s;--dl:${rnd(0,30)/10}s">${pk(["💗","💖","💕","✨"])}</i>`).join("")
  +`<div class="sfc">👭<b id="sfn">0</b>人<small>${n>sh.length?`画面に出せるのは${sh.length}人（ほか${n-sh.length}人）`:"女子たちが集まってきた!"}</small><em>タップで続ける</em></div>`;
 const fin=()=>{if(closed)return;closed=true;clearInterval(iv);clearTimeout(tm0);document.removeEventListener("keydown",key);try{el.remove()}catch(e){}try{done&&done()}catch(e){console.error("storm done:",e)}};
 const key=e=>{if(Date.now()-T0>450&&(e.key==="Enter"||e.key===" "||e.key==="Escape")){e.preventDefault();fin()}};
 el.addEventListener("click",()=>{if(Date.now()-T0>450)fin()});document.addEventListener("keydown",key);
 document.body.appendChild(el);
 const num=el.querySelector("#sfn"),t1=Date.now();iv=setInterval(()=>{const r=Math.min(1,(Date.now()-t1)/1500);if(num)num.textContent=Math.round(n*r);if(r>=1)clearInterval(iv)},30);
 tm0=setTimeout(fin,12000);
 try{S.cnt=S.cnt||{};S.cnt.storm=(S.cnt.storm||0)+1;S.cnt.stormmax=Math.max(S.cnt.stormmax||0,n)}catch(e){}
 try{Snd.play("love");setTimeout(()=>{try{Snd.play("love")}catch(e){}},600)}catch(e){}}

/* Novel.play を包む：12人以上の顔（ms）を含む台本の前に顔の海を出す。出している間に来た再生要求は順番を保って待たせる */
(function(){try{if(typeof Novel==="undefined"||!Novel||Novel._storm)return;const orig=Novel.play;if(typeof orig!=="function")return;let hold=null;
 const flush=()=>{const q=hold;hold=null;(q||[]).forEach(([s,a])=>{try{orig.apply(s,a)}catch(e){console.error("Novel.play:",e)}})};
 Novel.play=function(L,cb){const self=this,args=arguments;if(hold){hold.push([self,args]);return}
  let crowd=null;try{if(STORM_ON&&Array.isArray(L))for(const l of L){if(l&&Array.isArray(l.ms)&&l.ms.length>=STORM_MIN){crowd=l.ms;break}}}catch(e){}
  if(!crowd)return orig.apply(self,args);
  hold=[[self,args]];try{stormShow(crowd,flush)}catch(e){console.error("顔の海 失敗:",e);flush()}};
 Novel._storm=1}catch(e){console.error("顔の海 フック失敗:",e)}})();

/* 通知の嵐（game.js の月替わり演出の後に呼ばれる）：恋心を寄せる女子が6人以上いる月に、通知が次々流れ込む */
function notifStorm(){try{if(!STORM_ON)return;const H=(typeof fansAll==="function"?fansAll():hearts()).filter(m=>m&&m.n),n=H.length;if(n<6||(n<10&&Math.random()<.5))return;
 const box=document.createElement("div");box.className="nbs";const cnt=Math.min(40,n),W=innerHeight||640;
 box.innerHTML=faceSort(H).slice(0,160).sort(()=>Math.random()-.5).slice(0,cnt).map((m,i)=>`<div class="nb" style="top:${rnd(8,Math.max(12,Math.round(W*.8)))}px;--d:${Math.round(i*(2600/cnt))}ms">${phAv(m)}<span><b>${(m.n.split(" ")[1]||m.n)}</b>　${pk(NOTIF_T)}</span></div>`).join("");
 document.body.appendChild(box);setTimeout(()=>{try{box.remove()}catch(e){}},2600+3600);
 S.cnt=S.cnt||{};S.cnt.notif=(S.cnt.notif||0)+1;S.cnt.notifmax=Math.max(S.cnt.notifmax||0,n);hist(`📱 通知が止まらない：${n}人から一斉にメッセージ`);Snd.play("ok")}catch(e){console.error("通知の嵐 失敗:",e)}}

/* 追加の実績（顔の海・通知の嵐） */
(function(){const X=(id,i,n,d,ok)=>{if(!ACH.some(a=>a.id===id))ACH.push({id,i,n,d,ok:s=>{try{return !!ok(s)}catch(e){return false}}})};
 const cnt=k=>S.cnt&&S.cnt[k]||0;
 X("x_storm1","👀","視線の海",`${STORM_MIN}人以上の女子の顔に一度に囲まれる`,()=>cnt("storm")>=1);
 X("x_storm100","🌊","百人の顔",`一度に100人以上の女子が集まる`,()=>cnt("stormmax")>=100);
 X("x_storm300","🌸","三百人の海","一度に300人の女子が集まる",()=>cnt("stormmax")>=300);
 X("x_notif1","📱","通知が止まらない","月替わりに通知の嵐を受ける",()=>cnt("notif")>=1);
 X("x_notif30","🔔","スマホが震えっぱなし","一度に30人以上から通知が届く",()=>cnt("notifmax")>=30);
})();

