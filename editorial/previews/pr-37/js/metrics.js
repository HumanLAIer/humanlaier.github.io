/* Deterministic measurements derived directly from synthetic interaction events. */
(function(){'use strict';const D=window.HLData;
 const byParticipant=new Map(D.participants.map(p=>[p.id,p]));
 const byTeam=new Map(D.teams.map(t=>[t.id,t]));
 const functions=[...new Set(D.teams.map(t=>t.group))];
 const fnShort={'Leadership & Strategy':'Leadership','Operations':'Operations','Technology':'Technology','Planning & Resources':'Planning','People & Administration':'People','External Coordination':'External'};
 function eventSet(period,concept){return D.events.filter(e=>e.period===period&&(concept==='all'||e.concept===concept))}
 function keyFor(participant,scope){const p=byParticipant.get(participant);return scope==='individual'?participant:scope==='team'?p.team:p.group}
 function nodesFor(scope){
   if(scope==='individual')return D.participants.map(p=>({...p,short:p.id}));
   if(scope==='team')return D.teams;
   if(scope==='function')return functions.map((g,i)=>{const t=D.teams.filter(x=>x.group===g);return {id:g,name:g,short:fnShort[g],group:g,x:t.reduce((a,b)=>a+b.x,0)/t.length,y:t.reduce((a,b)=>a+b.y,0)/t.length}});
   return [];
 }
 function summary(scope,period,concept){
   const events=eventSet(period,concept);
   const base=(eventSet(0,concept).length+eventSet(1,concept).length)/2;
   const avg=events.length?events.reduce((a,b)=>a+b.sentiment,0)/events.length:0;
   const baseSent=([...eventSet(0,concept),...eventSet(1,concept)]);const baselineSent=baseSent.length?baseSent.reduce((a,b)=>a+b.sentiment,0)/baseSent.length:0;
   const totalIntensity=events.length?events.reduce((a,b)=>a+b.intensity,0)/events.length:0;
   return {count:events.length,baseline:base,change:base?(events.length/base-1)*100:0,sentiment:avg,sentimentChange:avg-baselineSent,intensity:totalIntensity};
 }
 function linksFor(scope,period,concept){const edges=new Map();
  for(const e of eventSet(period,concept)){
   const a=keyFor(e.from,scope),b=keyFor(e.to,scope);if(a===b)continue;
   const [x,y]=a<b?[a,b]:[b,a],key=x+'|'+y;
   if(!edges.has(key))edges.set(key,{a:x,b:y,count:0,sentSum:0,intSum:0,forward:0,reverse:0});
   const o=edges.get(key);o.count++;o.sentSum+=e.sentiment;o.intSum+=e.intensity;
   if(a===x)o.forward++;else o.reverse++;
  }
  return [...edges.values()].map(e=>({...e,sentiment:e.sentSum/e.count,intensity:e.intSum/e.count}));
 }
 function infoFor(id,scope,period,concept){
  const events=eventSet(period,concept).filter(e=>keyFor(e.from,scope)===id||keyFor(e.to,scope)===id);
  const base=[...eventSet(0,concept),...eventSet(1,concept)].filter(e=>keyFor(e.from,scope)===id||keyFor(e.to,scope)===id).length/2;
  const interactions=events.length,change=base?(interactions/base-1)*100:0;
  const sent=interactions?events.reduce((a,b)=>a+b.sentiment,0)/interactions:0;
  const peers=linksFor(scope,period,concept).filter(e=>e.a===id||e.b===id).sort((a,b)=>b.count-a.count).slice(0,4);
  return {count:interactions,change,sentiment:sent,peers,degree:peers.length};
 }
 function relationSeries(groupA,groupB,concept='all'){
  return D.months.map((_,t)=>{
   const rel=eventSet(t,concept).filter(e=>{
    const a=byParticipant.get(e.from).group,b=byParticipant.get(e.to).group;
    return (a===groupA&&b===groupB)||(a===groupB&&b===groupA);
   });
   return {period:t,count:rel.length,sentiment:rel.length?rel.reduce((a,b)=>a+b.sentiment,0)/rel.length:0};
  });
 }
 function connected(ids,edges,removed){
  const active=ids.filter(x=>x!==removed);const adj=new Map(active.map(x=>[x,new Set()]));
  edges.forEach(([a,b])=>{if(!adj.has(a)||!adj.has(b))return;adj.get(a).add(b);adj.get(b).add(a)});
  const seen=new Set(),comps=[];
  active.forEach(id=>{if(seen.has(id))return;const stack=[id],comp=[];seen.add(id);while(stack.length){const u=stack.pop();comp.push(u);for(const v of adj.get(u)){if(!seen.has(v)){seen.add(v);stack.push(v)}}}comps.push(comp)});
  return {comps,pairs:comps.reduce((s,c)=>s+c.length*(c.length-1)/2,0),remaining:active.length};
 }
 const allTeamIds=D.teams.map(x=>x.id),without=D.removed;
 const reachBefore=connected(allTeamIds,D.working,null),reachAfter=connected(allTeamIds,D.working,without);
 const survivorsConnected={pairs:reachBefore.comps.reduce((sum,c)=>{const n=c.filter(x=>x!==without).length;return sum+n*(n-1)/2},0)};
 window.HLMetrics={byParticipant,byTeam,functions,fnShort,keyFor,eventSet,nodesFor,summary,linksFor,infoFor,relationSeries,connected,reachBefore,reachAfter,survivorsConnected};
})();
