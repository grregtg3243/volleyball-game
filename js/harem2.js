/* harem2.js : ハーレム拡張その2。①ご奉仕デー（全体練習のボタン）②抜け駆けデート（毎月の月送りで起きる）
   ■ 読み込み順：… → campus.js → superday.js → harem2.js → ogkai.js → game.js
   ■ 呼び出し元：game.js の全体練習ボタン（serviceDay）／endWeek の一覧（nukegake）。未読み込みでもゲームは落ちません（ボタンが出ないだけ）
   ■ 数値・台本は下の H2 に集約 */
const H2={
 SERVICE_NEED:4,SERVICE_AP:2,   // ご奉仕デー：必要な恋心(愛情60以上)の人数／行動力
 NUKE_NEED:3,NUKE_RATE:.25,     // 抜け駆け：必要な恋心の人数／月ごとの発生率
 SERVICE:[["お弁当を手作りして","「先生、あーんしてください♪ 朝から作ったんです。」"],
  ["膝枕をして","「どうぞ、ここに頭をのせてください。…重くないですよ?」"],
  ["肩をもんで","「先生、ここ凝ってますよ? 私に任せてくださいね。」"],
  ["手を繋いで","「今日は、私が先生の隣をひとりじめしてもいいですか?」"],
  ["お茶を淹れて","「先生のために、いちばん美味しい淹れ方を練習したんです。」"],
  ["髪をなでて","「先生、お疲れさまです。…よしよし。」"]]
};

const _vH=t=>typeof lnV==="function"?lnV(String(t)):String(t);   // lines.js のセリフ言い換え
/* ① ご奉仕デー：恋心を寄せる女子たちが、先生をもてなす。最後に「今日いちばん良かった子」を選ぶ */
function serviceDay(){let st="確認";try{
 const H=hearts();if(H.length<H2.SERVICE_NEED){toast(`ご奉仕デーは恋心を寄せる女子が${H2.SERVICE_NEED}人以上必要です`);return}
 if(S.ap<H2.SERVICE_AP){spend(H2.SERVICE_AP);return}
 st="台本";const A=[...H].sort(()=>Math.random()-.5).slice(0,Math.min(5,H.length)),menu_=[...H2.SERVICE,...((typeof LNX!=="undefined"&&LNX.svItems)||[])].sort(()=>Math.random()-.5),F=(t,ms)=>fmt(_vH(t),ms||A);
 const lines=[{who:"",t:F("放課後の部室。「今日は私たちが、先生をもてなします!」と、女子たちが勢ぞろいした。"),m:A[0],ms:A.length>=3?A:undefined}];
 A.forEach((m,i)=>{const s=menu_[i%menu_.length];lines.push({who:"",t:F(`{name}が、${s[0]}くれた。`,[m]),m},{who:m.n,t:F(s[1],[m]),m})});
 const pickN=A.slice(0,3),win=w=>()=>{gain(w,8);w.lust=cl(w.lust+3);A.filter(m=>m!==w).forEach(m=>{gain(m,2);m.poss=cl(m.poss+3)});H.forEach(m=>{m.mood=cl(m.mood+4)});tm(-1);popUp(1);hpUp(2);Save.write(S);draw()};
 if(typeof LNX!=="undefined"&&LNX.svHap&&Math.random()<.5)lines.push({who:"",t:F(pk(LNX.svHap)),m:A[0]});
 lines.push({who:"",t:"…さあ、今日いちばん嬉しかったのは?",m:A[0],ms:A.length>=3?A:undefined,
  ch:[...pickN.map(w=>({t:`${w.n}`,r:F("「えっ、私!? …やった、嬉しい!」{name}が真っ赤になって喜んだ。他の子たちは、ちょっと悔しそうだ。",[w]),f:win(w)})),
   {t:"みんな同じくらい嬉しかった",r:F("「ふふ、先生らしい。」女子たちは顔を見合わせて笑った。"),f:()=>{A.forEach(m=>{gain(m,3);m.mood=cl(m.mood+6)});tm(3);hpUp(2);Save.write(S);draw()}}]});
 st="行動力";if(!spend(H2.SERVICE_AP))return;
 S.cnt=S.cnt||{};S.cnt.service=(S.cnt.service||0)+1;hist(`🍰 ご奉仕デー：${A.length}人がもてなしてくれた`);menu="main";Snd.play("love");
 st="再生";Novel.play(lines);after()
}catch(e){console.error("serviceDay 失敗["+st+"]",e);try{(typeof errToast==="function"?errToast:toast)(`ご奉仕デーに失敗（${st}）：${e&&e.message||e}`)}catch(_){}}}

/* ② 抜け駆けデート：恋心を寄せる女子の一人が、他の子に内緒で誘ってくる（毎月、月送りで判定）。受ける／断る／みんなに打ち明ける */
function nukegake(){const H=hearts();if(H.length<H2.NUKE_NEED||Math.random()>H2.NUKE_RATE)return[];
 const w=[...H].sort((a,b)=>(b.poss+b.love)-(a.poss+a.love)||Math.random()-.5)[Math.random()*Math.min(3,H.length)|0],F=t=>fmt(_vH(t),[w]);
 const others=H.filter(m=>m!==w),done=f=>()=>{f();Save.write(S);draw()};
 S.cnt=S.cnt||{};S.cnt.nuke=(S.cnt.nuke||0)+1;
 return[...(()=>{const P=typeof LNX!=="undefined"?LNX:{},sh=[["放課後、{name}がこっそり{boss}を呼び止めた。周りに誰もいないのを確かめて、小さな声で言う。","「先生…今度の休み、二人だけで出かけませんか? …他の子には、内緒で。」"],...(P.nukeShy||[])],bo=P.nukeBold||[],sc=pk(bo.length&&(w.lust>=60||w.poss>=60)?bo:sh);   // 情欲・独占欲が高い子は積極的な台詞
   return[{who:"",t:F(sc[0]),m:w},{who:w.n,t:F(sc[1]),m:w}]})(),
  {who:"",t:"どうする?",m:w,ch:[
   {t:"二人だけで出かける",r:F("「やった…!」{name}は嬉しそうに微笑んだ。…ただ、この秘密が長く続くとは限らない。"),
    f:done(()=>{gain(w,7);w.lust=cl(w.lust+4);others.forEach(m=>{m.poss=cl(m.poss+3)});tm(-2);hpUp(1);hist(`🤫 ${w.n}と二人きりで出かけた`)})},
   {t:"「みんなで行こう」と返す",r:F("「…そっか。そうですよね。」{name}は少し残念そうに、でも笑ってうなずいた。"),
    f:done(()=>{gain(w,-1);H.forEach(m=>gain(m,2));tm(3);popUp(1);hist(`${w.n}の誘いを「みんなで」に変えた`)})},
   {t:"やんわり断る",r:F("「わかりました…。ごめんなさい、変なこと言って。」{name}は寂しそうに俯いた。"),
    f:done(()=>{w.mood=cl(w.mood-6);gain(w,-2);tm(1);hist(`${w.n}の誘いを断った`)})}]}]}

/* 実績 */
if(typeof ACH!=="undefined"&&!ACH.some(a=>a.id==="service1"))ACH.push(
 {id:"service1",i:"🍰",n:"おもてなし",d:"ご奉仕デーを開く",ok:s=>(s.cnt&&s.cnt.service||0)>=1},
 {id:"nuke3",i:"🤫",n:"内緒のお誘い",d:"抜け駆けデートに3回誘われる",ok:s=>(s.cnt&&s.cnt.nuke||0)>=3});
