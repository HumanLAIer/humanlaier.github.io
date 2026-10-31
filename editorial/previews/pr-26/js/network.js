/* Human LAIer network renderers. All analytical values come from HLMetrics. */
(function(){'use strict';const D=window.HLData,M=window.HLMetrics,NS='http://www.w3.org/2000/svg';
 const app=document.getElementById('main-network'),hero=document.getElementById('hero-network');
 const initial={measure:'frequency',scope:'team',period:3,concept:'all',visibility:'aggregate',selected:null};
 let state={...initial};const fnCoords={
 'Leadership & Strategy':[385,110],'Planning & Resources':[195,265],
 'Operations':[700,120],'Technology':[780,390],
 'People & Administration':[170,415],'External Coordination':[390,485]};
 const palettes={positive:'#15616d',negative:'#ad7c27',neutral:'#a0b1b8',navy:'#002147'};
 function el(tag,attrs={},parent){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(parent)parent.appendChild(n);return n}
 function txt(parent,s,x,y,attrs={}){const n=el('text',{x,y,...attrs},parent);n.textContent=s;return n}
 function clear(n){n.replaceChildren()}
 function bounded(v,a,b){return Math.max(a,Math.min(b,v))}
 function fmtDelta(v,dec=0){return (v>=0?'+':'')+v.toFixed(dec)+(dec===0?'%':'')}
 function showName(id,scope){if(scope==='individual')return M.byParticipant.get(id)?.name||id;if(scope==='team')return M.byTeam.get(id)?.name||id;return M.fnShort[id]||id}
 function positions(scope,nodes){if(scope==='function')return Object.fromEntries(nodes.map(n=>[n.id,{x:fnCoords[n.id][0],y:fnCoords[n.id][1]}]));return Object.fromEntries(nodes.map(n=>[n.id,{x:n.x,y:n.y}]))}
 function colorFor(link){if(state.measure!=='sentiment')return palettes.neutral;return link.sentiment<-.12?palettes.negative:link.sentiment>.12?palettes.positive:palettes.neutral}
 function renderOverview(){clear(app);const overall=M.summary('organization',state.period,state.concept),events=M.eventSet(state.period,state.concept);const groups=M.functions.map(g=>({id:g,label:M.fnShort[g],count:events.filter(e=>M.byParticipant.get(e.from).group===g||M.byParticipant.get(e.to).group===g).length}));const max=Math.max(...groups.map(x=>x.count),1);
 txt(app,'ORGANIZATION / CONSOLIDATED VIEW',58,62,{class:'network-guide'});
 txt(app,overall.count.toLocaleString(),56,185,{class:'overview-num'});
 txt(app,'SYNTHETIC INTERACTIONS IN '+D.months[state.period],61,218,{class:'overview-sub'});
 el('line',{x1:62,x2:950,y1:244,y2:244,class:'overview-rule'},app);
 groups.forEach((g,i)=>{let y=290+i*43;txt(app,g.label,62,y+4,{fill:'#28495a','font-size':15});el('rect',{x:276,y:y-12,width:Math.round(g.count/max*535),height:17,fill:i===2?'#15616d':'#002147',opacity:i===2?1:.66},app);txt(app,String(g.count),840,y+2,{fill:'#385a66','font-size':15})});
 txt(app,'Counts represent interactions involving each function. Cross-functional interactions appear in both groups.',61,562,{fill:'#647781','font-size':12});
 }
 function renderGraph(){clear(app);const scope=state.scope;if(scope==='organization'){renderOverview();return}
 let nodes=M.nodesFor(scope),positionsMap=positions(scope,nodes),links=M.linksFor(scope,state.period,state.concept);
 if(scope==='individual')links=links.sort((a,b)=>b.count-a.count).slice(0,125);
 const influences=new Map(nodes.map(n=>[n.id,0]));links.forEach(e=>{influences.set(e.a,(influences.get(e.a)||0)+e.count);influences.set(e.b,(influences.get(e.b)||0)+e.count)});
 const maxInf=Math.max(...influences.values(),1),maxEdge=Math.max(...links.map(e=>e.count),1);
 const focus=state.selected;
 const degrees=links.reduce((a,e)=>{a[e.a]=(a[e.a]||0)+1;a[e.b]=(a[e.b]||0)+1;return a},{});
 if(scope!=='individual'){
   const groupLabels=scope==='team'?[['STRATEGY',135,45],['OPERATIONS',775,35],['TECHNOLOGY',835,528],['PLANNING',305,35],['PEOPLE',100,555],['EXTERNAL',340,555]]:[];
   groupLabels.forEach(([s,x,y])=>txt(app,s,x,y,{class:'network-guide',opacity:.9}));
 }
 const edgeLayer=el('g',{},app);
 links.forEach(edge=>{
   const a=positionsMap[edge.a],b=positionsMap[edge.b];if(!a||!b)return;
   const highlighted=focus&&(edge.a===focus||edge.b===focus),dimmed=focus&&!highlighted;
   let w=state.measure==='intensity'?1.2+edge.intensity*9:state.measure==='sentiment'?1.5+Math.sqrt(edge.count/maxEdge)*6:state.measure==='influence'?1+Math.sqrt(edge.count/maxEdge)*5:1.1+Math.sqrt(edge.count/maxEdge)*10;
   let col=state.measure==='sentiment'?colorFor(edge):(highlighted?'#15616d':'#90a8b5');
   if(state.measure==='influence' && (influences.get(edge.a)>.72*maxInf||influences.get(edge.b)>.72*maxInf))col='#15616d';
   const line=el('path',{d:`M ${a.x} ${a.y} L ${b.x} ${b.y}`,stroke:col,'stroke-width':w,'stroke-opacity':dimmed?.10:state.measure==='sentiment'?.84:.58,'stroke-linecap':'round',fill:'none'},edgeLayer);
   el('title',{},line).textContent=`${showName(edge.a,scope)} ↔ ${showName(edge.b,scope)}: ${edge.count} interactions; sentiment ${edge.sentiment.toFixed(2)}`;
 });
 const nodeLayer=el('g',{},app);
 nodes.forEach(n=>{
    const xy=positionsMap[n.id],influence=(influences.get(n.id)||0)/maxInf;
    const selected=state.selected===n.id,dimmed=state.selected&&!selected&& !links.some(e=>(e.a===n.id&&e.b===state.selected)||(e.b===n.id&&e.a===state.selected));
    const radius=scope==='individual'?(5.5+(state.measure==='influence'?influence*6:0)):scope==='function'?(29+influence*10):(20+(state.measure==='influence'?influence*14:4));
    const g=el('g',{class:`network-node ${scope}${selected?' selected':''}${dimmed?' dim':''}`,transform:`translate(${xy.x} ${xy.y})`,role:'button',tabindex:'0','data-node-id':n.id,'aria-label':`Inspect relationships for ${n.name}`,'aria-pressed':selected?'true':'false'},nodeLayer);
    el('circle',{r:radius+11,class:'halo'},g);
    el('circle',{r:radius,class:'disc'+(scope==='function'?' function-disc':''),stroke:selected?'#e2c044':'#fff','stroke-width':selected?4:2},g);
    if(scope==='team'||scope==='function'){
      txt(g,scope==='team'?n.short:n.short.slice(0,3).toUpperCase(),0,1,{class:'initial',style:scope==='function'?'font-size:12px':''});
      txt(g,scope==='team'?n.name:(M.fnShort[n.id]||n.id),0,radius+23,{class:'caption'});
    }
    el('title',{},g).textContent=n.name;
    const select=()=>{
      const wasFocused=document.activeElement===g;
      state.selected=state.selected===n.id?null:n.id;
      render();
      // Redrawing the graph must not strand a keyboard user at the document body.
      if(wasFocused){
        const successor=[...app.querySelectorAll('.network-node')].find(el=>el.getAttribute('data-node-id')===n.id);
        successor?.focus();
      }
    };
    g.addEventListener('click',select);
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}});
 });
 if(scope==='individual')txt(app,'48 FICTIONAL INDIVIDUALS · TOP 125 STRONGEST RELATIONSHIPS SHOWN',32,35,{class:'network-guide'});
 }
 function renderInspector(){const i=document.getElementById('inspector');i.replaceChildren();
 const head=document.createElement('div');head.className='inspector-kicker';head.textContent=state.selected?'SELECTED ENTITY':state.scope==='organization'?'ORGANIZATION VIEW':'SELECTED PERSPECTIVE';i.appendChild(head);
 const h=document.createElement('h3');h.textContent=state.selected?showName(state.selected,state.scope):({frequency:'Interaction frequency',intensity:'Interaction intensity',sentiment:'Estimated sentiment',influence:'Network influence'})[state.measure];i.appendChild(h);
 const p=document.createElement('p');let info=null;
 if(state.selected){info=M.infoFor(state.selected,state.scope,state.period,state.concept);p.textContent=state.measure==='sentiment'?`Estimated sentiment in ${info.count} interactions involving this ${state.scope}. Current score: ${info.sentiment>=0?'+':''}${info.sentiment.toFixed(2)}.`:state.measure==='intensity'?`The activity associated with this ${state.scope} can be examined alongside changes in its contacts and tone.`:`${info.count} interactions involve this ${state.scope} during ${D.months[state.period].toLowerCase()}, ${Math.abs(info.change).toFixed(0)}% ${info.change>=0?'above':'below'} its January–February baseline.`;
 } else if(state.scope==='organization')p.textContent='Totals across all forty-eight fictional participants. Compare periods or subjects to examine how activity changes across the institution.';
 else p.textContent=({frequency:'Line weight reflects the number of interactions recorded during the selected period.',intensity:'Line weight reflects the average activity intensity of the interactions between connected entities.',sentiment:'Viridian indicates favorable estimated tone; ochre indicates unfavorable tone. The weight of each line reflects interaction volume.',influence:'Node size reflects the volume of relationships connecting each entity. Larger nodes are more central to this selected interaction network.'})[state.measure];
 i.appendChild(p);
 if(info?.peers?.length){const title=document.createElement('div');title.className='inspector-kicker';title.textContent='PROMINENT CONNECTIONS';i.appendChild(title);const ul=document.createElement('ul');ul.className='inspector-list';info.peers.forEach(e=>{const li=document.createElement('li');li.textContent=showName(e.a===state.selected?e.b:e.a,state.scope);ul.appendChild(li)});i.appendChild(ul)}
 const s=M.summary(state.scope,state.period,state.concept);
 document.getElementById('metric-one').textContent=(info?info.count:s.count).toLocaleString();document.getElementById('metric-two').textContent=fmtDelta(info?info.change:s.change);
 document.getElementById('metric-one-label').textContent=info?'INVOLVING THIS ENTITY':'INTERACTIONS THIS PERIOD';
 document.getElementById('level-readout').textContent=state.scope==='organization'?'Whole organization':state.scope==='function'?'6 functions':state.scope==='team'?'12 teams':'48 individuals';
 document.getElementById('canvas-label').textContent=state.measure.toUpperCase()+' / '+state.scope.toUpperCase();
 document.getElementById('canvas-description').textContent=state.scope==='organization'?'Activity across six organizational functions':state.measure==='sentiment'?'Interaction tone, with volume shown by line weight':state.measure==='intensity'?'Weighted average activity intensity between entities':state.measure==='influence'?'Relative influence within the selected interaction network':'Interactions between organizational entities';
 document.getElementById('period-label').textContent=D.months[state.period]+' · PERIOD '+(state.period+1)+' OF 6';
 document.getElementById('canvas-legend').textContent=({frequency:'Thicker lines represent more interactions',intensity:'Thicker lines indicate greater activity intensity',sentiment:'Viridian: favorable · Ochre: unfavorable',influence:'Larger nodes indicate greater network influence'})[state.measure];
 }
 function renderPicker(){const select=document.getElementById('node-select'),prior=state.selected;select.replaceChildren();const opt=document.createElement('option');opt.value='';opt.textContent='Choose a node';select.appendChild(opt);M.nodesFor(state.scope).forEach(n=>{const o=document.createElement('option');o.value=n.id;o.textContent=n.name;select.appendChild(o)});select.value=prior||'';select.disabled=state.scope==='organization'}
 function render(){renderGraph();renderInspector();renderPicker();document.getElementById('scope-select').value=state.scope;document.getElementById('visibility-select').value=state.visibility;document.getElementById('concept-select').value=state.concept;document.getElementById('period-slider').value=state.period;document.querySelectorAll('[name=measure]').forEach(r=>r.checked=r.value===state.measure)}
 document.getElementById('measure-controls').addEventListener('change',e=>{if(e.target.name!=='measure')return;state.measure=e.target.value;state.selected=null;render()});
 document.getElementById('scope-select').addEventListener('change',e=>{if(e.target.value==='individual'&&state.visibility!=='authorized'){state.visibility='authorized'}state.scope=e.target.value;state.selected=null;render()});
 document.getElementById('visibility-select').addEventListener('change',e=>{state.visibility=e.target.value;if(state.visibility==='aggregate'&&state.scope==='individual')state.scope='team';state.selected=null;render()});
 document.getElementById('concept-select').addEventListener('change',e=>{state.concept=e.target.value;state.selected=null;render()});
 document.getElementById('period-slider').addEventListener('input',e=>{state.period=Number(e.target.value);render()});
 document.getElementById('node-select').addEventListener('change',e=>{state.selected=e.target.value||null;render()});
 document.getElementById('reset-analytics').addEventListener('click',()=>{state={...initial};render()});
 document.getElementById('go-to-policy').addEventListener('click',()=>{state.visibility='authorized';state.scope='individual';state.selected=null;render();document.getElementById('platform').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});
 function heroAndComparison(){
   // Hero draws exactly the same working-relationship model used by the analysis workspace.
   clear(hero);const nodes=D.teams,edges=D.working;
   edges.forEach(([a,b])=>{const u=M.byTeam.get(a),v=M.byTeam.get(b);el('path',{d:`M${u.x*.53+22} ${u.y*.77+38} L${v.x*.53+22} ${v.y*.77+38}`,fill:'none',stroke:(a==='TO'||b==='TO')?'#a9bac5':'#66869c','stroke-width':(a==='TO'||b==='TO')?2.2:1.4,opacity:.83},hero)});
   nodes.forEach(t=>{const important=t.id==='TO';el('circle',{cx:t.x*.53+22,cy:t.y*.77+38,r:important?10:5.5,fill:important?'#e2c044':'#b9d6f2'},hero)});
   txt(hero,'INTERACTIONS',20,31,{fill:'#b9d6f2','font-size':11,'letter-spacing':'2'});
   txt(hero,'CROSS-FUNCTIONAL COORDINATION',210,440,{fill:'#b9d6f2','font-size':10,'letter-spacing':'1'});
   // Formal structure is presented as an actual hierarchy; working relationships
   // use the same entities, arranged by their real working-network positions.
   const formalSvg=document.getElementById('formal-figure');clear(formalSvg);
   const hierarchy={S:[270,44],TO:[65,142],FO:[147,142],PL:[229,142],PN:[311,142],PS:[393,142],PR:[475,142],SD:[147,244],DS:[229,244],FN:[311,244],LE:[393,244],RL:[475,244]};
   D.formal.forEach(([a,b])=>{const u=hierarchy[a],v=hierarchy[b];
     el('path',{d:`M ${u[0]} ${u[1]} V ${v[1]-30} H ${v[0]} V ${v[1]-12}`,fill:'none',stroke:'#9aaeb5','stroke-width':1.7},formalSvg);
   });
   nodes.forEach(n=>{const [x,y]=hierarchy[n.id];
     el('rect',{x:x-12,y:y-12,width:24,height:24,fill:n.id==='TO'?'#15616d':'#002147'},formalSvg);
     txt(formalSvg,n.short.slice(0,2),x,y+4,{'font-size':9,'font-weight':700,'text-anchor':'middle',fill:'#ffffff'});
     txt(formalSvg,n.id==='S'?'Strategy':n.name.split(' ')[0],x,y+28,{'font-size':9,'text-anchor':'middle',fill:'#3c5867'});
   });
   const workSvg=document.getElementById('working-figure');clear(workSvg);
   const pos=Object.fromEntries(nodes.map(n=>[n.id,[n.x*.52+23,n.y*.51+21]]));
   D.working.forEach(([a,b])=>{const u=pos[a],v=pos[b];el('line',{x1:u[0],y1:u[1],x2:v[0],y2:v[1],stroke:(a==='TO'||b==='TO')?'#15616d':'#9bafb7','stroke-width':(a==='TO'||b==='TO')?2.5:1.7,opacity:.85},workSvg)});
   nodes.forEach(n=>{const [x,y]=pos[n.id];el('circle',{cx:x,cy:y,r:n.id==='TO'?13:10,fill:n.id==='TO'?'#e2c044':'#002147'},workSvg);txt(workSvg,n.short.slice(0,2),x,y+3,{'font-size':8,'font-weight':700,'text-anchor':'middle',fill:n.id==='TO'?'#002147':'#fff'})});
 }
 // Expose state to QA harness and other coordinated components.
 window.HLApp={get state(){return {...state}},setPeriod(n){state.period=n;render()},get metrics(){return M}};
 heroAndComparison();render();
})();
