/* save.js : セーブ・設定の保存／書き出し／読み込み */
const Cfg={k:"joshiVolley.cfg",d:{vol:.7,mute:false},
 get(){try{return {...this.d,...JSON.parse(localStorage.getItem(this.k)||"{}")}}catch(e){return {...this.d}}},
 set(o){try{localStorage.setItem(this.k,JSON.stringify({...this.get(),...o}))}catch(e){}}};
const Save={k:"joshiVolley.save.v1",
 write(S){try{localStorage.setItem(this.k,JSON.stringify(S))}catch(e){}},
 load(){try{const d=JSON.parse(localStorage.getItem(this.k)||"null");return d&&Array.isArray(d.M)?d:null}catch(e){return null}},
 reset(){try{localStorage.removeItem(this.k)}catch(e){}},
 export(S){const a=document.createElement("a"),d=new Date().toISOString().slice(0,10).replace(/-/g,"");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:"application/json"}));a.download=`joshi-volley-save-${d}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)},
 import(file,ok,ng){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.M)||!Array.isArray(d.A))throw 0;ok(d)}catch(e){ng()}};r.onerror=ng;r.readAsText(file)}};
