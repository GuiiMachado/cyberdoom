// Mapas exclusivos originais criados em código; '#' é parede, 'D' é porta trancada.
const box=(x,y)=>({x:x+.5,y:y+.5});
function createMap(dividers,pillars){
  const w=25,h=16;
  const tiles=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>x===0||y===0||x===w-1||y===h-1?'#':'.'));
  for(const x of dividers){for(let y=1;y<h-1;y++)tiles[y][x]='#';tiles[8][x]='D';}
  for(const [x,y] of pillars){tiles[y][x]='#';}
  return tiles.map(r=>r.join(''));
}
const maps=[
  createMap([8,16],[[5,3],[5,4],[12,3],[12,4],[21,10]]),
  createMap([7,15],[[4,10],[4,11],[11,4],[12,4],[20,10],[21,10]]),
  createMap([8,16],[[5,4],[5,5],[12,10],[12,11],[20,4],[21,4]])
];
export const LEVELS=[
  {
    title:'SETOR 01 // ÁREA DE TRABALHO',map:maps[0],start:box(3,8),
    pickups:[{type:'key',...box(4,12)},{type:'backup',...box(4,3)},{type:'archive',...box(21,5)},{type:'shield',...box(12,12)},{type:'update',...box(20,12)}],
    terminals:[box(12,11)], exit:{type:'exit',...box(22,12)},
    enemies:[
      {type:'virus',...box(5,6)},{type:'worm',...box(6,12)},{type:'trojan',...box(12,8)},{type:'virus',...box(19,4)},{type:'worm',...box(21,13)},
      {type:'virus',...box(19,12)},{type:'virus',...box(21,6)},{type:'worm',...box(10,13)},{type:'trojan',...box(18,9)}
    ],
    extraSpawns:[['virus',11,13],['worm',20,3],['trojan',5,13],['virus',18,10],['virus',6,2],['worm',14,5],['virus',22,4],['worm',18,13],['trojan',10,5],['virus',14,12],['worm',3,5],['virus',22,10]],
    objectives:[['key','Coletar chave digital'],['doors','Liberar as 2 portas'],['archive','Recuperar arquivo importante'],['clear','Eliminar ameaças do setor'],['exit','Acessar setor seguinte']]
  },
  {
    title:'SETOR 02 // MEMÓRIA DO SISTEMA',map:maps[1],start:box(3,8),
    pickups:[{type:'key',...box(3,3)},{type:'backup',...box(4,13)},{type:'shield',...box(12,12)},{type:'update',...box(20,13)}],
    terminals:[box(11,11)],firewall:box(19,5),exit:{type:'exit',...box(22,12)},
    enemies:[
      {type:'worm',...box(5,5)},{type:'virus',...box(5,12)},{type:'trojan',...box(11,8)},{type:'virus',...box(13,12)},{type:'worm',...box(20,7)},{type:'trojan',...box(21,12)},
      {type:'virus',...box(18,3)},{type:'worm',...box(18,13)},{type:'virus',...box(10,6)},{type:'trojan',...box(17,8)}
    ],
    extraSpawns:[['virus',10,13],['worm',18,6],['trojan',5,2],['virus',20,11],['virus',12,6],['worm',3,10],['trojan',22,5],['virus',17,13],['worm',13,3],['virus',22,3],['trojan',9,12],['worm',6,7]],
    objectives:[['key','Coletar chave digital'],['doors','Liberar as 2 portas'],['firewall','Ativar firewall'],['clear','Eliminar ameaças do setor'],['exit','Acessar núcleo infectado']]
  },
  {
    title:'SETOR 03 // NÚCLEO INFECTADO',map:maps[2],start:box(3,8),
    pickups:[{type:'key',...box(3,12)},{type:'backup',...box(4,3)},{type:'update',...box(12,5)},{type:'shield',...box(13,12)}],
    terminals:[box(11,4)],exit:{type:'core',...box(22,12)},
    enemies:[
      {type:'virus',...box(5,11)},{type:'worm',...box(6,5)},{type:'trojan',...box(12,8)},{type:'worm',...box(14,12)},{type:'virus',...box(19,12)},{type:'ransomware',...box(21,8)},
      {type:'virus',...box(19,5)},{type:'worm',...box(18,10)},{type:'trojan',...box(17,12)},{type:'virus',...box(10,12)}
    ],
    extraSpawns:[['virus',5,2],['virus',20,13],['worm',14,3],['trojan',18,8],['virus',10,12],['worm',21,3],['virus',22,5],['worm',6,13],['trojan',12,5],['virus',17,3],['worm',19,9],['virus',14,13]],
    objectives:[['key','Coletar chave digital'],['doors','Liberar as 2 portas'],['update','Instalar atualização digital'],['boss','Derrotar ransomware'],['core','Restaurar núcleo do sistema']]
  }
];
export function solidAt(level,x,y){
  const ix=Math.floor(x),iy=Math.floor(y);
  if(iy<0||iy>=level.map.length||ix<0||ix>=level.map[0].length)return true;
  const tile=level.map[iy][ix];
  return tile==='#'||(tile==='D'&&!level.openDoors.has(`${ix},${iy}`));
}
export function canStand(level,x,y,r=.2){
  return !solidAt(level,x-r,y-r)&&!solidAt(level,x+r,y-r)&&!solidAt(level,x-r,y+r)&&!solidAt(level,x+r,y+r);
}
export function lineClear(level,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),steps=Math.ceil(len/.065);
  for(let i=1;i<steps;i++){const t=i/steps;if(solidAt(level,ax+dx*t,ay+dy*t))return false;}
  return true;
}
export function makeLevel(index,config){
  const base=LEVELS[index];
  const level={...base,openDoors:new Set(),pickups:base.pickups.map(p=>({...p,used:false})),
    terminals:base.terminals.map((p,i)=>({...p,used:false,id:`${index}-${i}`})),
    firewall:base.firewall?{...base.firewall,used:false}:null,
    doors:base.map.flatMap((row,y)=>[...row].flatMap((cell,x)=>cell==='D'?[{x:x+.5,y:y+.5,ix:x,iy:y}]:[])),
    tasks:Object.fromEntries(base.objectives.map(([k])=>[k,false])),exited:false};
  level.enemies=base.enemies.map((e,i)=>({ ...e,id:`${index}-${i}`,hp:0,maxHp:0,lastAttack:-10,pathCooldown:0,phase:Math.random()*6,dead:false }));
  if(config.extras){
    const options=base.extraSpawns||[];
    for(let i=0;i<Math.min(config.extras,options.length);i++){
      const [type,x,y]=options[i];
      if(!solidAt(level,x+.5,y+.5))level.enemies.push({type,x:x+.5,y:y+.5,id:`${index}-extra-${i}`,hp:0,maxHp:0,lastAttack:-10,pathCooldown:0,phase:0,dead:false});
    }
  }
  return level;
}
