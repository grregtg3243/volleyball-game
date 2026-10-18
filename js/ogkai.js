/* ogkai.js : OG会（毎年5月。卒業生が1人以上いる年だけ）。卒業生（愛情50以上）と現役（愛情60以上）が一堂に会する。
   ■ 台本は下の OG_LINES と、ogkai() 内の選択肢。卒業生の一言は data.js の E（恋仲の子）か novels.js の E_DEFAULT */
const OG_LINES=[["","5月。年に一度のOG会の日。体育館に、卒業生{numA}人と現役{numC}人、総勢{num}人が集まった。"],["部員たち","「先生、お久しぶりです!」「また会えて嬉しいです!」"],["","懐かしい顔ぶれが、一斉に{boss}を囲んだ。"]];
function ogkai(){if(!monthIs(5)||!S.A.length)return[];const al=S.A.filter(a=>a.love>=50),cu=S.M.filter(m=>m.love>=60);if(!al.length)return[];
 const A=[...al,...cu],f=t=>fmt(t.replace(/\{numA\}/g,al.length).replace(/\{numC\}/g,cu.length).replace(/\{num\}/g,A.length),A);
 hist(`🍻 OG会：卒業生${al.length}人＋現役${cu.length}人`);S.cnt.og=(S.cnt.og||0)+1;hpUp(2);
 const ap=(L,o)=>L.forEach(m=>{if(o.love)gain(m,o.love);if(o.mood)m.mood=cl(m.mood+o.mood);if(o.poss)m.poss=cl(m.poss+o.poss);if(o.lust)m.lust=cl(m.lust+o.lust)});
 const ch=(t,r,fn)=>({t,r:f(r),f:()=>{fn();Save.write(S);draw()}});
 return[...OG_LINES.map(([w,t])=>({who:w,t:f(t),m:A[0],ms:faceMs(A)})),...al.slice(0,3).map(a=>({who:a.n,t:a.lover&&a.E?a.E:pk(E_DEFAULT),m:a})),
  {who:"",t:"どうする?",m:A[0],ch:[
   ch("全員で乾杯する","{num}人で乾杯した。昔話に花が咲き、笑い声が絶えない。",()=>{ap(A,{love:3,mood:4});tm(3)}),
   ch("卒業生とじっくり語り合う","卒業生たちと、思い出話に時間を忘れた。…現役の子たちは、少しむくれている。",()=>{ap(al,{love:6,lust:2});ap(cu,{poss:4,love:-1})}),
   ch("現役と卒業生の橋渡しをする","先輩と後輩が打ち解け、新しい絆が生まれた。",()=>{ap(A,{love:2});tm(5)})]}]}
