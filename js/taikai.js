/* taikai.js : ①大会の日に他校（他の短大）の女子が寄ってくる（人気80以上）②女性教員のアプローチ（人気85以上）
   ■ 読み込み順：… → campus.js → superday.js → harem2.js → taikai.js → ogkai.js → game.js
   ■ 呼び出し元：game.js の endWeek の一覧（taikaiDay / teacherApproach）。どちらも月送りで自動判定。失敗しても月送りは止まりません
   ■ 画像：他校の女子＝普通の学生(IDが C で始まる)→ img/h0001.jpg〜／女性教員(IDが T で始まる)→ img/t0001.jpg〜
   ■ 数値・台詞は下の TK と TK_L / TCH に集約。教員の台詞に「先生」は使わない（engine.js の nmz が顧問の名前に置換してしまうため。顧問は {boss} と書く） */
const TK={POP:80,TPOP:85,MAXCG:30000,TMAX:200};   // 大会イベントの人気／教員イベントの人気／連絡先の上限／知り合いの教員の上限
const TK_L={
 talk:["「さっきの試合、すごかったです! 先生の指示、めちゃくちゃかっこよかった…!」","「あの、一緒に写真を撮ってもらえませんか?」","「うちの顧問と全然違う…羨ましいなぁ。」"],
 contact:["「連絡先、交換してください!」","「LINE教えてくれませんか? お願いします!」","「私も私も! 先生、こっち向いてー!」"],
 confess:["「ずっと見てました。…好きです、付き合ってください。」","「試合より、先生ばかり見てました…。返事、聞かせてください。」","「…ひと目惚れ、なんです。」"]};
const TCH=[
 ["同僚の{name}（教員）が、{boss}の机にそっとコーヒーを置いた。","「お疲れさま。…少し、休憩しませんか?」"],
 ["廊下で{name}（教員）に呼び止められた。","「この後、お時間ありますか? 食事でもどうかしら。」"],
 ["研究室で資料整理を手伝ってくれていた{name}（教員）が、ふと手を止めた。","「…{boss}といると、仕事を忘れちゃうわ。」"],
 ["飲み会の席で、気づけば{name}（教員）が隣に座っていた。","「ねえ、聞いてもいい? …恋人は、いるのかしら?」"]];

const _vT=t=>typeof lnV==="function"?lnV(String(t)):String(t);   // lines.js のセリフ言い換え
const _tkAdd=(G,l)=>{const c=cgList();G.forEach(m=>{m.love=cl(m.love+l);if(c.length<TK.MAXCG)c.push(m)})};
const _tkDone=f=>()=>{f();Save.write(S);draw()};
const _tkMs=G=>G.length>=STORM_MIN?faceMs(G):G.length>=3?G.slice(0,6):undefined;

/* ① 大会の日（4か月ごと）に、人気80以上だと他校の女子が寄ってくる。人気が高いほど、告白・大勢に囲まれるイベントが出やすい */
function taikaiDay(){
 if(S.w%4!==0||S.B.pop<TK.POP)return[];
 const p=S.B.pop,kinds=["talk","contact"];if(p>=88)kinds.push("confess");if(p>=92)kinds.push("mob");
 const kind=p>=100?pk(["mob","mob","confess","contact"]):pk(kinds);
 const n=kind==="talk"?rnd(2,5):kind==="contact"?Math.min(FACE_MAX,rnd(5,20)+(p-80)):kind==="confess"?(p>=96?rnd(2,4):1):Math.min(FACE_MAX,rnd(20,80)+(p-80)*3);
 const G=[];for(let i=0;i<n;i++){const m=cgNew(G);m.sch=1;G.push(m)}
 const F=(t,ms)=>fmt(_vT(t).replace(/\{num\}/g,n),ms||G),ms=_tkMs(G),A=G[0];
 const intro={talk:"大会が終わった帰り道。対戦した他の短大の女子たちが、{boss}のもとへ駆け寄ってきた。",
  contact:"会場の出口で、他の短大の女子たちに呼び止められた。人気者の{boss}は、他校の女子まで放っておかない。",
  confess:n===1?"会場の裏。他の短大の女子が{boss}を呼び出した。顔を真っ赤にして、うつむいている。":"会場の裏に、他の短大の女子が{num}人。…全員が同じ顔で、{boss}を待っていた。",
  mob:"大会が終わった瞬間、観客席の他の短大の女子たちが一斉に押し寄せた。気づけば{num}人に囲まれている。…試合より大変な状況だ。"}[kind];
 const L=[{who:"",t:F(intro),m:A,ms}];
 const _pl=[...TK_L[kind==="mob"?"contact":kind],...(((typeof LNX!=="undefined"&&LNX.tkL)||{})[kind]||[])].sort(()=>Math.random()-.5);   // 元の台詞＋追加プールからランダムに
 G.slice(0,kind==="confess"&&n===1?1:3).forEach((m,i)=>L.push({who:m.n,t:F(_pl[i%_pl.length],[m]),m}));
 const ch=(t,r,f)=>({t,r:F(r),f:_tkDone(f)});
 const J=`${n}人`;
 const C={
  talk:[ch("気さくに話す","「ありがとうございます!」女子たちは大喜びで手を振った。",()=>{_tkAdd(G,3);popUp(1);hpUp(1);cgJel(1);hist(`🏟 大会の帰りに他校の女子${J}と話した`)}),
        ch("会釈だけして去る","「あっ…ありがとうございました!」女子たちは名残惜しそうに見送った。",()=>{hearts().forEach(h=>gain(h,1));tm(1)})],
  contact:[ch("連絡先を交換する","「やったー!!」歓声が会場前に響き渡った。",()=>{_tkAdd(G,0);popUp(1);hpUp(1);cgJel(2);hist(`📱 他校の女子${J}と連絡先を交換`)}),
        ch("断る","「えー、残念…。でも、また大会で会えますよね!」",()=>{hearts().forEach(h=>gain(h,1));tm(1);hist(`他校の女子${J}の連絡先の誘いを断った`)})],
  confess:[ch(n===1?"気持ちを受け入れる":"全員の気持ちを受け止める","「…!」女子たちは涙ぐみながら、嬉しそうに微笑んだ。",()=>{G.forEach(m=>{m.love=88;m.lust=cl(m.lust+8)});_tkAdd(G,0);popUp(2);hpUp(2);cgJel(4);tm(-2);S.cnt.tkconf=(S.cnt.tkconf||0)+1;hist(`💘 他校の女子${J}の告白を受け入れた`)}),
        ch("「まずは友達から」と返す","「はい…! 待ちます、ずっと。」",()=>{_tkAdd(G,10);popUp(1);hpUp(1);cgJel(1);S.cnt.tkconf=(S.cnt.tkconf||0)+1;hist(`他校の女子${J}の告白を保留した`)}),
        ch("丁重に断る","「…そう、ですよね。ありがとうございました。」女子は小さく頭を下げた。",()=>{hearts().forEach(h=>gain(h,1));tm(1);S.cnt.tkconf=(S.cnt.tkconf||0)+1;hist(`他校の女子${J}の告白を断った`)})],
  mob:[ch("全員と握手して回る","握手の列は、会場の外まで続いた。黄色い声が、いつまでも止まない。",()=>{_tkAdd(G,5);popUp(3);hpUp(3);cgJel(4);tm(-2);hist(`🌟 大会後に他校の女子${J}に囲まれた`)}),
       ch("部員の後ろに避難する","「先生、こっちです!」部員たちが壁になって、{boss}をかばった。",()=>{hearts().forEach(h=>gain(h,2));tm(2);hist(`他校の女子${J}の人波から避難した`)}),
       ch("「今日はチームのために来た」と宣言する","一瞬の静寂のあと、拍手と歓声が起きた。部員たちが誇らしげに{boss}を見つめている。",()=>{S.M.forEach(m=>{gain(m,2);m.mood=cl(m.mood+5)});_tkAdd(G,1);tm(4);popUp(1)})]}[kind];
 if(typeof LNX!=="undefined"&&LNX.tkHap&&Math.random()<.5)L.push({who:"",t:F(pk(LNX.tkHap)),m:A,ms});
 L.push({who:"",t:kind==="mob"?`${n}人が{boss}の返事を待っている。どうする?`:"どうする?",m:A,ms,ch:C});
 L.forEach(l=>{if(l.t.includes("{boss}"))l.t=F(l.t)});
 S.cnt=S.cnt||{};S.cnt.taikai=(S.cnt.taikai||0)+1;S.cnt.tkmax=Math.max(S.cnt.tkmax||0,n);
 return L}

/* ② 女性教員のアプローチ：人気85以上で、毎月ときどき。知り合った教員は S.tch に残り、再び現れる。愛情90以上で受け入れると恋仲 */
function newTeacher(){const m=fresh();S.no--;S.tid=(S.tid||0)+1;
 m.id="T"+String(S.tid).padStart(3,"0");m.no=0;m.t=1;m.g=0;m.pos="教員";m.age=rnd(27,44);m.love=rnd(30,50);m.lust=rnd(10,30);m.poss=0;m.mood=70;m.lover=false;return m}
function teacherApproach(){
 const p=S.B.pop;if(p<TK.TPOP)return[];S.tch=S.tch||[];
 if(S.tch.length>=3&&p>=95&&Math.random()<.2)return teacherParty();
 if(Math.random()>Math.min(.5,.12+(p-TK.TPOP)*.02))return[];
 const old=S.tch.filter(t=>t.love<95);let t;
 if(old.length&&(S.tch.length>=TK.TMAX||Math.random()<.5))t=pk(old);else if(S.tch.length<TK.TMAX){t=newTeacher();S.tch.push(t)}else return[];
 const X=typeof LNX!=="undefined"?LNX:{},F=x=>fmt(_vT(x),[t]),sc=pk(t.love>=70&&X.tchLove?X.tchLove:[...TCH,...(X.tch||[])]),done=f=>_tkDone(f);   // 親しくなった教員(愛情70以上)は別の台詞

 S.cnt=S.cnt||{};S.cnt.tchr=(S.cnt.tchr||0)+1;
 return[{who:"",t:F(sc[0]),m:t},{who:t.n,t:F(sc[1]),m:t},
  {who:"",t:"どうする?",m:t,ch:[
   {t:"誘いに応じる",r:F("{name}は嬉しそうに微笑んだ。大人の余裕の中に、少女のような照れが見えた。"),
    f:done(()=>{t.love=cl(t.love+rnd(8,12));t.lust=cl(t.lust+4);popUp(1);hpUp(1);hearts().forEach(h=>h.poss=cl(h.poss+3));tm(-1);
     if(t.love>=90&&!t.lover){t.lover=true;hpUp(2);hist(`💋 教員の${t.n}と恋仲になった`)}else hist(`👩‍🏫 教員の${t.n}の誘いに応じた`)})},
   {t:"軽く受け流す",r:F("「ふふ、つれないのね。」{name}は笑って、ひらひらと手を振った。"),
    f:done(()=>{t.love=cl(t.love+2);hist(`教員の${t.n}の誘いを受け流した`)})},
   {t:"丁重に断る",r:F("「…そう。残念だけど、仕方ないわね。」{name}は少しだけ寂しそうだった。"),
    f:done(()=>{t.love=cl(t.love-3);tm(1);hist(`教員の${t.n}の誘いを断った`)})}]}]}
/* 人気95以上＋知り合いの教員が3人以上：女性教員たちに囲まれる */
function teacherParty(){
 const T=[...S.tch].sort(()=>Math.random()-.5).slice(0,6),n=S.tch.length,F=x=>fmt(_vT(x).replace(/\{num\}/g,n),T);
 S.cnt.tchparty=(S.cnt.tchparty||0)+1;
 const L=[{who:"",t:F("職員室に呼ばれると、女性教員たちがずらりと並んでいた。「今日は、みんなで{boss}を囲んで飲みましょう」。知り合いの教員は{num}人。"),m:T[0],ms:T}];
 T.slice(0,3).forEach(m=>L.push({who:m.n,t:fmt(pk(["「ねえ、今日は帰さないわよ?」","「私が隣、いいでしょう?」","「みんな{boss}の話ばかりしてるのよ。」",...((typeof LNX!=="undefined"&&LNX.tchParty)||[])]),[m]),m}));
 L.push({who:"",t:"どうする?",m:T[0],ms:T,ch:[
  {t:"全員と乾杯する",r:F("グラスの音が重なり、職員室は大人の笑い声に包まれた。"),f:_tkDone(()=>{S.tch.forEach(m=>{m.love=cl(m.love+4)});popUp(1);hpUp(2);hearts().forEach(h=>h.poss=cl(h.poss+3));tm(-1);hist(`🍷 女性教員たちに囲まれて乾杯`)})},
  {t:"一人ずつ、じっくり話を聞く",r:F("{boss}は一人ひとりの話に耳を傾けた。教員たちは、すっかり心を開いたようだ。"),f:_tkDone(()=>{T.forEach(m=>{m.love=cl(m.love+8);m.lust=cl(m.lust+3)});popUp(1);hpUp(2);hist(`女性教員${T.length}人とじっくり話した`)})},
  {t:"仕事を理由に失礼する",r:F("「あら、真面目ね。」教員たちは笑って見送ってくれた。"),f:_tkDone(()=>{hearts().forEach(h=>gain(h,1));tm(2)})}]});
 return L}

/* 実績 */
if(typeof ACH!=="undefined"&&!ACH.some(a=>a.id==="tk1"))ACH.push(
 {id:"tk1",i:"🏟",n:"会場の人気者",d:"大会の日に他校の女子に囲まれる・話しかけられる",ok:s=>(s.cnt&&s.cnt.taikai||0)>=1},
 {id:"tkconf3",i:"💘",n:"他校からの告白",d:"他校の女子から3回告白される",ok:s=>(s.cnt&&s.cnt.tkconf||0)>=3},
 {id:"tchr1",i:"👩‍🏫",n:"年上の魅力",d:"女性教員からアプローチされる",ok:s=>(s.cnt&&s.cnt.tchr||0)>=1},
 {id:"tchlove3",i:"🍷",n:"職員室のハーレム",d:"恋仲になった教員が3人",ok:s=>(s.tch||[]).filter(t=>t.lover).length>=3});
