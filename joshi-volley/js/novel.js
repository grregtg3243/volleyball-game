/* novel.js : ノベルパート再生（台本は data.js の SCENES）。lines=[{who,t,m}] */
const Novel={q:[],i:0,cb:null,
 play(lines,cb){if(!lines||!lines.length){cb&&cb();return}this.q=lines;this.i=0;this.cb=cb;document.getElementById("nv").classList.add("on");this.show()},
 show(){const l=this.q[this.i];document.getElementById("nvw").textContent=l.who||"";document.getElementById("nvt").textContent=l.t;document.getElementById("nvp").innerHTML=l.m?art(l.m):""},
 next(){if(++this.i>=this.q.length){document.getElementById("nv").classList.remove("on");const f=this.cb;this.cb=null;f&&f()}else this.show()}};
