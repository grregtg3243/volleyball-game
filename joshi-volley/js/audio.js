/* audio.js : 効果音（外部ファイル不要。WebAudioで合成） */
const Snd={ctx:null,
 init(){if(!this.ctx){try{this.ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(this.ctx&&this.ctx.state==="suspended")this.ctx.resume()},
 tone(f,d,type,v,t0){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime+(t0||0);
  o.type=type||"sine";o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02)},
 play(n){const c=Cfg.get();if(c.mute||!c.vol)return;this.init();if(!this.ctx)return;const v=c.vol*.25,T=(f,d,t,y)=>this.tone(f,d,y,v,t);
  ({click:()=>T(660,.06,0,"square"),ok:()=>{T(523,.1,0);T(659,.1,.1);T(784,.2,.2)},love:()=>{T(880,.15,0,"triangle");T(1175,.3,.12,"triangle")},
   month:()=>[523,659,784,1047].forEach((f,i)=>T(f,.25,i*.12,"triangle")),win:()=>[523,523,659,784,1047].forEach((f,i)=>T(f,.2,i*.12,"square")),
   lose:()=>[392,330,262].forEach((f,i)=>T(f,.25,i*.15,"sawtooth")),ach:()=>[784,988,1319].forEach((f,i)=>T(f,.18,i*.09,"triangle"))}[n]||(()=>{}))()}};
document.addEventListener("click",e=>{if(e.target.closest("button,label.b"))Snd.play("click")},true); // すべてのボタンでクリック音
