/* Survey comparison: explanatory graphic based on the same fictional interaction events as the platform demo. */
(function(){'use strict';
  const svg=document.getElementById('survey-comparison-chart');
  if(!svg||!window.HLMetrics||!window.HLData)return;
  const NS='http://www.w3.org/2000/svg',M=window.HLMetrics,D=window.HLData;
  const series=M.relationSeries('Operations','Technology');
  const first=Math.max(1,series[0].count),counts=series.map(s=>100*s.count/first);
  function render(){
    svg.replaceChildren();
    const compact=window.innerWidth<590;
    const w=compact?360:780, x0=compact?36:115, step=compact?57:118;
    svg.setAttribute('viewBox',`0 0 ${w} ${compact?265:280}`);
    const xpos=i=>x0+i*step;
    function el(tag,attrs={},txt){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(txt!=null)n.textContent=txt;svg.appendChild(n);return n;}
    const textSize=compact?12:11;
    el('text',{x:compact?20:17,y:compact?24:35,fill:'#1b4055','font-size':textSize,'font-weight':700,'letter-spacing':compact?'.5':'1.1'},'PERIODIC SURVEY');
    const surveyY=compact?66:78,end=xpos(5);
    el('line',{x1:x0,y1:surveyY,x2:end,y2:surveyY,stroke:'#e2e8e9','stroke-width':2});
    el('rect',{x:x0-5,y:surveyY-11,width:compact?9:13,height:22,fill:'#002147'});
    el('text',{x:x0+(compact?12:19),y:surveyY-13,fill:'#193d53','font-size':compact?10:11,'font-weight':600},'Survey observation');
    el('line',{x1:x0+8,y1:surveyY,x2:end,y2:surveyY,stroke:'#002147','stroke-width':2,'stroke-dasharray':'5 8','opacity':'.6'});
    if(!compact)el('text',{x:end,y:surveyY-15,fill:'#627d88','font-size':10,'text-anchor':'end'},'No further survey reading shown');
    el('text',{x:compact?20:17,y:compact?114:130,fill:'#1b4055','font-size':textSize,'font-weight':700,'letter-spacing':compact?'.5':'1.1'},'ONGOING SIGNALS');
    const minC=Math.min(...counts),maxC=Math.max(...counts),minS=Math.min(...series.map(p=>p.sentiment)),maxS=Math.max(...series.map(p=>p.sentiment));
    const norm=(v,lo,hi)=>hi===lo?.5:(v-lo)/(hi-lo);
    const freqY=v=>(compact?217:226)-(compact?56:57)*norm(v,minC,maxC);
    const sentY=v=>(compact?217:227)-(compact?53:55)*norm(v,minS,maxS);
    for(let i=0;i<6;i++){
      const x=xpos(i);
      el('line',{x1:x,y1:compact?144:152,x2:x,y2:compact?224:238,stroke:'#d9e2e3','stroke-width':1,'stroke-dasharray':'2 4'});
      el('text',{x,y:compact?251:262,'text-anchor':'middle','font-size':compact?11:11,'font-weight':600,fill:'#536d78'},D.months[i].slice(0,3));
    }
    el('path',{d:counts.map((v,i)=>(i?'L':'M')+xpos(i)+' '+freqY(v)).join(' '),fill:'none',stroke:'#15616d','stroke-width':compact?3:3.5,'stroke-linejoin':'round','stroke-linecap':'round'});
    el('path',{d:series.map((v,i)=>(i?'L':'M')+xpos(i)+' '+sentY(v.sentiment)).join(' '),fill:'none',stroke:'#a17626','stroke-width':compact?3:3.5,'stroke-linejoin':'round','stroke-linecap':'round'});
    counts.forEach((v,i)=>el('circle',{cx:xpos(i),cy:freqY(v),r:compact?3:4,fill:'#15616d',stroke:'white','stroke-width':1.5}));
    series.forEach((v,i)=>el('circle',{cx:xpos(i),cy:sentY(v.sentiment),r:compact?3:4,fill:'#a17626',stroke:'white','stroke-width':1.5}));
  }
  let compactOld=window.innerWidth<590;
  render();
  window.addEventListener('resize',()=>{const newCompact=window.innerWidth<590;if(newCompact!==compactOld){compactOld=newCompact;render()}});
})();
