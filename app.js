'use strict';
const monkeyWall = document.getElementById('monkey-wall');
const monkeyFaces = ['🙈','🙉','🙊'];
monkeyWall.innerHTML = '<div class="monkey-plane">' + Array.from({length:18},(_,column)=>{
  const cells=Array.from({length:18},(_,row)=>{const face=(row+column)%3;return `<div class="monkey-cell"><span class="monkey-disc tone-${face}">${monkeyFaces[face]}</span></div>`;}).join('');
  return `<div class="monkey-column"><div class="monkey-track">${cells}${cells}</div></div>`;
}).join('')+'</div>';
const hero=document.getElementById('top');
document.getElementById('motion-toggle').addEventListener('click',event=>{
  const paused=hero.classList.toggle('motion-paused');
  event.currentTarget.setAttribute('aria-pressed',String(paused));
  event.currentTarget.setAttribute('aria-label',paused?'Resume background animation':'Pause background animation');
  event.currentTarget.textContent=paused?'Resume motion':'Pause motion';
});
new IntersectionObserver(entries=>hero.classList.toggle('motion-offscreen',!entries[0].isIntersecting)).observe(hero);
const header=document.querySelector('.site-header');
function updateHeader(){header.classList.toggle('compact',window.scrollY>80);}
window.addEventListener('scroll',updateHeader,{passive:true});
updateHeader();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const roleData = {
  deaf: {label:'PRIVATE VIEW · THE BOARD', title:'The board, but not the rule.', description:'Deaf sees the light and wire colors and must share this information with Mute so it can consult the manual.', channel:'Sees the board and gestures. Can speak, but cannot hear.'},
  mute: {label:'PRIVATE VIEW · THE MANUAL', title:'The rule, but not the board.', description:'Mute knows which wire color corresponds to each light color, but needs a teammate to report the board.', channel:'Hears speech and reads the manual. Can gesture, but cannot speak.'},
  blind: {label:'PRIVATE VIEW · TOUCH', title:'The hands, but not the colors.', description:'Blind can cut the wires, but needs to know which wire to cut and when.', channel:'Hears speech and touches the bomb. Cannot see colors or gesture identities.'}
};
let activeRole = 'deaf';
let activeAsymmetry = 'information';
const communicationData = {
  deaf: {title:'Can bridge the gap. Cannot hear back.',description:'Deaf can see Mute’s gestures and speak to Blind, making it the bridge between the two channels. But it cannot hear Blind’s questions or confirmations.'},
  mute: {title:'Knows the rule. Cannot say it.',description:'Mute holds the manual and must give precise instructions, but can only express them through gestures. The teammate who acts cannot see those gesture identities.'},
  blind: {title:'Needs the instruction. Cannot see it.',description:'Blind must act on precise instructions, but cannot see Mute’s gestures. It can hear Deaf’s spoken relay, yet Deaf cannot hear its questions or confirmations.'}
};
function renderExplanation(){
  const r=activeAsymmetry==='communication'?communicationData[activeRole]:roleData[activeRole];
  $('#role-title').textContent=r.title;
  $('#role-description').textContent=r.description;
  $('#explanation-panel').setAttribute('aria-labelledby',`tab-${activeAsymmetry}`);
}
const boardHTML = (blind) => `<div class="board"><div class="board-top"><span>DISPLAY <b>${blind?'?':'0'}</b></span><span>LIGHT ${blind?'unreadable':'<i class="light green"></i> green'}</span></div>${['yellow','green','red'].map((color,i)=>`<div class="wire ${blind?'unreadable':color}"><span>0${i+1}</span><i></i><b>${blind?'?':color}</b></div>`).join('')}</div>`;
function renderRole(){
  const r=roleData[activeRole];
  renderExplanation();
  $('#view-content').innerHTML=activeRole==='mute'?'<table class="manual"><thead><tr><th>Light color</th><th>Cut wire color</th></tr></thead><tbody><tr><td>green</td><td>red</td></tr><tr><td>red</td><td>yellow</td></tr><tr><td>yellow</td><td>green</td></tr></tbody></table>':boardHTML(activeRole==='blind');
  $('#role-panel').setAttribute('aria-labelledby',`tab-${activeRole}`);
  if(activeAsymmetry==='communication') $('#view-content').innerHTML=triangleHTML(activeRole);
}
$('#view-content').addEventListener('click',event=>{
  const node=event.target.closest('[data-map-role]');
  if(!node)return;
  activeRole=node.dataset.mapRole;
  selectTab(document.getElementById('tab-'+activeRole),roleTabs);
  renderRole();
  $('#view-content').querySelector('[data-map-role="'+activeRole+'"]').focus({preventScroll:true});
});
function selectTab(button,buttons){buttons.forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});}
function keyboardTabs(buttons){buttons.forEach((button,index)=>button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index-1+buttons.length)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();buttons[next].focus();buttons[next].click();}));}
const roleTabs=$$('[data-role]');roleTabs.forEach(button=>button.addEventListener('click',()=>{activeRole=button.dataset.role;selectTab(button,roleTabs);renderRole();}));keyboardTabs(roleTabs);
const asymmetryTabs=$$('[data-asymmetry]');
asymmetryTabs.forEach(button=>button.addEventListener('click',()=>{
  selectTab(button,asymmetryTabs);
  activeAsymmetry=button.dataset.asymmetry;
  renderRole();
}));
keyboardTabs(asymmetryTabs);
const models=[['Gemini-3.8-Flash',86.1,true],['GLM-5.3-Flash',62.5,true],['GPT-5.6-Terra',55.1,true],['DeepSeek-V4.1-Flash',49.1,false],['GPT-5.6-Luna',40.7,true],['Claude-Sonnet-5',29.2,false],['Qwen-3.8-Flash',20.4,false]];
$('#bars').innerHTML=models.map(([model,rate,thinking])=>`<div class="bar-row"><div class="bar-label"><span class="model-name">${model}<small class="thinking-badge">Thinking ${thinking?'ON':'OFF'}</small></span><b>${rate.toFixed(1)}%</b></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${rate}%"></div></div></div>`).join('');
$('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('.menu-toggle').setAttribute('aria-expanded',String(open));$('#nav-links').classList.toggle('open',open);});
$$('#nav-links a').forEach(a=>a.addEventListener('click',()=>{$('#nav-links').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#nav-links').classList.contains('open')){$('#nav-links').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').focus();}});
