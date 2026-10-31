/* Human LAIer fictional organizational dataset.
   Everything in this file is synthetic. No inference from actual people is performed. */
(function(){'use strict';
 const teams=[
  ['S','Strategy','ST','Leadership & Strategy',165,125],
  ['TO','Transformation Office','TO','Leadership & Strategy',447,255],
  ['FO','Field Operations','FO','Operations',690,165],
  ['SD','Service Delivery','SD','Operations',810,90],
  ['PL','Platforms','PL','Technology',745,315],
  ['DS','Data Systems','DS','Technology',833,446],
  ['PN','Planning','PN','Planning & Resources',310,90],
  ['FN','Finance','FN','Planning & Resources',320,245],
  ['PS','People Services','PS','People & Administration',210,345],
  ['LE','Learning','LE','People & Administration',105,295],
  ['PR','Partnerships','PA','External Coordination',305,480],
  ['RL','Regional Liaison','RL','External Coordination',115,475]
 ].map(([id,name,short,group,x,y])=>({id,name,short,group,x,y}));
 const formal=[['S','TO'],['S','FO'],['S','PL'],['S','PN'],['S','PS'],['S','PR'],['FO','SD'],['PL','DS'],['PN','FN'],['PS','LE'],['PR','RL']];
 const working=[['S','PN'],['PN','FN'],['FN','PS'],['PS','LE'],['LE','S'],['PS','PR'],['PR','RL'],['RL','PS'],['S','TO'],['LE','TO'],['PN','TO'],['TO','FO'],['TO','DS'],['FO','SD'],['SD','DS'],['DS','PL'],['PL','FO']];
 const months=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE'];
 const concepts=['modernization','integration','policy'];
 const participants=teams.flatMap((team,i)=>Array.from({length:4},(_,j)=>({id:`P${String(i*4+j+1).padStart(2,'0')}`,name:`Participant ${String(i*4+j+1).padStart(2,'0')}`,team:team.id,group:team.group,x:team.x+[-24,23,-22,24][j],y:team.y+[-21,-19,21,23][j]})));
 const memberByTeam=Object.fromEntries(teams.map(t=>[t.id,participants.filter(p=>p.team===t.id)]));
 const tById=Object.fromEntries(teams.map(t=>[t.id,t]));
 function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
 let eid=0;const events=[];
 function add(t,ta,tb,k,edgeNo,internal=false){
   const a=memberByTeam[ta][(k+t+edgeNo)%4];
   const b=memberByTeam[tb][(k*3+t+edgeNo+1)%4];
   if(a.id===b.id)return;
   const forward=(k+edgeNo+t)%4!==0;
   const relation=(ta==='SD'&&tb==='DS')||(ta==='PL'&&tb==='FO')||(ta==='DS'&&tb==='PL');
   const crossModern=(tById[ta].group==='Operations'&&tById[tb].group==='Technology')||(tById[ta].group==='Technology'&&tById[tb].group==='Operations');
   const near=(-0.055+( ((k*7+edgeNo*3+t*5)%17) / 16)*.11);
   let sentiment=.22 + Math.sin(edgeNo*2.4)*.09 + near;
   if(crossModern)sentiment=.39-.19*t+near;
   else if(ta==='TO'||tb==='TO') sentiment=.26-.055*t+near;
   if(ta==='PS'||tb==='PS')sentiment+=.045;
   sentiment=clamp(sentiment,-1,1);
   let concept=concepts[(k+t+edgeNo)%3];
   if(crossModern && k%5!==0)concept='modernization';
   if((ta==='PR'||tb==='PR') && k%3!==0)concept='integration';
   const duration=4+(k*7+edgeNo*3+t)%38;
   const intensity=clamp(.18+duration/70+(crossModern?.09*t:0),0,1);
   events.push({id:eid++,period:t,from:forward?a.id:b.id,to:forward?b.id:a.id,fromTeam:forward?ta:tb,toTeam:forward?tb:ta,channel:['message','meeting','document','task'][(k+edgeNo)%4],duration,intensity:Number(intensity.toFixed(3)),sentiment:Number(sentiment.toFixed(3)),concept});
 }
 for(let period=0;period<6;period++){
  working.forEach(([a,b],i)=>{
    let volume=9+(i*7)%8+(period%2);
    const aG=tById[a].group,bG=tById[b].group;
    if((aG==='Operations'&&bG==='Technology')||(aG==='Technology'&&bG==='Operations'))volume=Math.round(volume*(1+.30*period));
    if(a==='TO'||b==='TO')volume+=period;
    for(let k=0;k<volume;k++)add(period,a,b,k,i);
  });
  teams.forEach((team,i)=>{for(let k=0;k<6+(i%3);k++){
   const p=memberByTeam[team.id],a=p[k%4],b=p[(k+1+(period%2))%4];if(a.id===b.id)continue;
   const sentiment=clamp(.25+Math.sin((i+k+period)*.7)*.06,-1,1);
   events.push({id:eid++,period,from:a.id,to:b.id,fromTeam:team.id,toTeam:team.id,channel:'message',duration:5+k%8,intensity:.32,sentiment:Number(sentiment.toFixed(3)),concept:concepts[(k+i+period)%3]});
  }});
 }
 window.HLData={teams,formal,working,participants,events,months,concepts,removed:'TO'};
})();
