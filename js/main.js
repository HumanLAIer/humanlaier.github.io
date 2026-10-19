(function(){'use strict';const D=window.HLData,M=window.HLMetrics,NS='http://www.w3.org/2000/svg';
 document.getElementById('year').textContent=String(new Date().getFullYear());
 const menu=document.getElementById('menu-button'),nav=document.getElementById('main-nav');
 menu.addEventListener('click',()=>{const open=!nav.classList.contains('is-open');nav.classList.toggle('is-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false')}));
 function el(parent,name,attrs={},text){const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));if(text!=null)n.textContent=text;parent.appendChild(n);return n}
 function chart(){const choice=document.getElementById('story-select').value;
  const map={'operations-tech':['Operations','Technology'],'leadership-planning':['Leadership & Strategy','Planning & Resources'],'people-external':['People & Administration','External Coordination']};
  const [a,b]=map[choice],series=M.relationSeries(a,b),svg=document.getElementById('story-chart');svg.replaceChildren();
  const x=i=>74+i*105,fy=v=>300-(v-60)*1.03,sy=v=>63+(1-v)*116;
  // Both series retain their own labeled scales; count is January-indexed and sentiment is -1 to +1.
  const base=Math.max(1,series[0].count);const counts=series.map(s=>s.count/base*100);
  for(let k=0;k<5;k++){
   const yy=67+k*56;
   el(svg,'line',{x1:72,y1:yy,x2:628,y2:yy,stroke:'#e2e8e6','stroke-width':1});
  }
  [100,150,200].forEach(v=>{el(svg,'text',{x:55,y:fy(v)+4,fill:'#556a74','text-anchor':'end','font-size':12},String(v))});
  [1,0,-1].forEach(v=>{el(svg,'text',{x:648,y:sy(v)+4,fill:'#556a74','font-size':12},v>0?'+1':String(v))});
  D.months.forEach((month,i)=>el(svg,'text',{x:x(i),y:342,fill:'#576d76','text-anchor':'middle','font-size':12,'font-weight':600},month.slice(0,3)));
  el(svg,'text',{x:72,y:22,fill:'#536d78','font-size':11,'letter-spacing':'1'},'VOLUME INDEX / JAN = 100');
  el(svg,'text',{x:628,y:22,fill:'#536d78','font-size':11,'letter-spacing':'1','text-anchor':'end'},'SENTIMENT / −1 TO +1');
  const freqPath=counts.map((v,i)=>(i?'L':'M')+x(i)+' '+fy(v)).join(' ');
  const sentPath=series.map((v,i)=>(i?'L':'M')+x(i)+' '+sy(v.sentiment)).join(' ');
  el(svg,'path',{d:freqPath,fill:'none',stroke:'#15616d','stroke-width':3.5,'stroke-linejoin':'round'});
  el(svg,'path',{d:sentPath,fill:'none',stroke:'#96671b','stroke-width':3.5,'stroke-linejoin':'round'});
  const current=window.HLApp.state.period;
  el(svg,'line',{x1:x(current),y1:60,x2:x(current),y2:309,stroke:'#9fb1b3','stroke-dasharray':'5 6'});
  counts.forEach((v,i)=>el(svg,'circle',{cx:x(i),cy:fy(v),r:i===current?7:4,fill:'#15616d',stroke:'#fff','stroke-width':2}));
  series.forEach((v,i)=>el(svg,'circle',{cx:x(i),cy:sy(v.sentiment),r:i===current?7:4,fill:'#96671b',stroke:'#fff','stroke-width':2}));
  const final=series[5],pct=((final.count-base)/base)*100,delta=final.sentiment-series[0].sentiment;
  const relationship=choice==='operations-tech'?'Operations and Technology':choice==='leadership-planning'?'Leadership and Planning':'People Services and External Coordination';
  const verb=delta<0?'falls':'rises';
  document.getElementById('story-insight').textContent=`${relationship}: interaction volume is ${pct>=0?'+':''}${pct.toFixed(0)}% against January; estimated sentiment ${verb} by ${Math.abs(delta).toFixed(2)} points over the six periods.`;
 }
 document.getElementById('story-select').addEventListener('change',chart);document.getElementById('period-slider').addEventListener('input',chart);chart();
 let removed=false;
 function scenario(){const svg=document.getElementById('scenario-network');svg.replaceChildren();
  const m=removed?M.reachAfter:M.reachBefore;
  const pairLimit=M.survivorsConnected.pairs;
  document.getElementById('scenario-reachable').innerHTML=`${removed?m.pairs:pairLimit} <small>/ ${pairLimit}</small>`;
  document.getElementById('scenario-groups').textContent=String(m.comps.length);
  const button=document.getElementById('scenario-toggle');button.textContent=removed?'Restore liaison team ↶':'Remove liaison team ↗';button.setAttribute('aria-pressed',String(removed));
  document.getElementById('scenario-comment').textContent=removed?`${pairLimit-m.pairs} surviving-team pairs lose a connection path when the Transformation Office is removed.`:'All remaining eleven teams are connected when the Transformation Office is present.';
  D.working.forEach(([a,b])=>{if(removed&&(a===D.removed||b===D.removed))return;const na=M.byTeam.get(a),nb=M.byTeam.get(b);el(svg,'line',{x1:na.x*.4+15,y1:na.y*.36+4,x2:nb.x*.4+15,y2:nb.y*.36+4,stroke:'#97b3bb','stroke-width':2})});
  D.teams.forEach(t=>{const gone=removed&&t.id===D.removed;el(svg,'circle',{cx:t.x*.4+15,cy:t.y*.36+4,r:t.id===D.removed?8:5,fill:gone?'#c5cdca':t.id===D.removed?'#e2c044':'#002147',opacity:gone?.3:1});});
 }
 document.getElementById('scenario-toggle').addEventListener('click',()=>{removed=!removed;scenario()});scenario();
})();
