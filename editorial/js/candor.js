/* Satirical climate survey: all copy lives in content/candor.json, built into the template. */
(()=>{
 const stage=document.getElementById('candor');
 const source=document.getElementById('candor-scenes');
 if(!stage||!source)return;
 const scenes=[...source.content.querySelectorAll('[data-candor-scene]')].map(node=>{
   const read=(key)=>node.querySelector('[data-key="'+key+'"]').textContent;
   return {question:read('question'),answer:read('answer'),inner:read('inner'),boss:read('boss')};
 });
 if(scenes.length<2)return;
 let selected=0;
 const q=document.getElementById('candor-question');
 const answer=document.getElementById('candor-answer');
 const inner=document.getElementById('candor-inner');
 const boss=document.getElementById('candor-boss-says');
 const counter=document.getElementById('candor-step');
 const back=document.getElementById('candor-back');
 const next=document.getElementById('candor-next');
 const dots=[...document.querySelectorAll('#candor-dots span')];
 const render=()=>{
   const scene=scenes[selected];
   q.textContent=scene.question;answer.textContent=scene.answer;
   inner.textContent=scene.inner;boss.textContent=scene.boss;
   counter.textContent=String(selected+1).padStart(2,'0');
   back.disabled=selected===0;
   next.innerHTML=selected===scenes.length-1?'Start again <span aria-hidden="true">&#8634;</span>':'Next question <span aria-hidden="true">&rarr;</span>';
   dots.forEach((d,i)=>d.classList.toggle('is-current',i===selected));
 };
 back.addEventListener('click',()=>{if(selected>0){selected--;render();}});
 next.addEventListener('click',()=>{selected=(selected+1)%scenes.length;render();});
 render();
})();
