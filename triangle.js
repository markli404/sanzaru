function triangleHTML(selected) {
  const edges = [
    ['mute','deaf','gesture',false,'M 222 108 Q 137 134 100 249','Mute to Deaf: gestures available'],
    ['deaf','mute','speech',false,'M 126 258 Q 180 202 241 123','Deaf to Mute: speech available'],
    ['blind','mute','speech',false,'M 399 249 Q 363 134 278 108','Blind to Mute: speech available'],
    ['mute','blind','gesture',true,'M 259 123 Q 320 202 374 258','Mute to Blind: gesture content unavailable'],
    ['deaf','blind','speech',false,'M 143 283 L 357 283','Deaf to Blind: speech available'],
    ['blind','deaf','speech',true,'M 357 310 L 143 310','Blind to Deaf: speech unavailable']
  ];
  return `<div class="channel-map"><svg viewBox="0 0 500 360" role="img" aria-label="Directed communication channels. Solid arrows are available; dashed arrows are unavailable. Blue is speech, orange is gesture content.">
  <defs><marker id="arrow-speech" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="22" markerHeight="22" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3679a7"/></marker><marker id="arrow-gesture" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="22" markerHeight="22" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#ba692c"/></marker></defs>
  ${edges.map(([from,to,type,blocked,path,label])=>`<path class="channel-edge ${type} ${blocked?'blocked':''} ${from===selected||to===selected?'connected':'dimmed'}" d="${path}" marker-end="url(#arrow-${type})"><title>${label}</title></path>`).join('')}
  ${[[144,170,-55,'Gestures','gesture'],[196,208,-51,'Speech','speech'],[356,170,55,'Speech','speech'],[305,208,51,'Gestures','gesture'],[250,283,0,'Speech','speech'],[250,310,0,'Unavailable','speech']].map(([x,y,a,label,type])=>`<text class="edge-label ${type}" x="${x}" y="${y}" transform="rotate(${a} ${x} ${y})" text-anchor="middle" dominant-baseline="central">${label}</text>`).join('')}
  </svg>
  ${[['mute','🙊','Mute',50,22],['deaf','🙉','Deaf',19,80],['blind','🙈','Blind',81,80]].map(([role,emoji,label,x,y])=>`<button type="button" class="map-node ${selected===role?'selected':''}" data-map-role="${role}" aria-label="Select ${label}" aria-pressed="${selected===role}" style="left:${x}%;top:${y}%"><span aria-hidden="true">${emoji}</span><b>${label}</b></button>`).join('')}
  </div>`;
}
