import {CONFIG,ENEMY_TYPES} from './config.js';
import {solidAt} from './levels.js';
const palette={virus:'#ff5a6b',worm:'#d8f45d',trojan:'#b88dfd',ransomware:'#ff3864',key:'#fff16a',backup:'#5fddff',shield:'#68f6cd',update:'#67ff8c',archive:'#ffc377',terminal:'#65ccff',firewall:'#8cffc9',exit:'#5df7ec',core:'#fbf27a'};
const spriteCache=new Map();
const wallCache=new Map();
function patternRect(c,x,y,w,h,color,alpha=.2){c.fillStyle=color;c.globalAlpha=alpha;c.fillRect(x,y,w,h);c.globalAlpha=1;}
function drawVirus(c,color){
  c.fillStyle='#300a10';c.strokeStyle=color;c.lineWidth=4;
  const spikes=[[40,10],[51,18],[64,16],[69,29],[75,40],[69,51],[64,65],[52,68],[40,78],[28,68],[15,65],[10,51],[5,40],[10,29],[15,16],[28,18]];
  c.beginPath();c.moveTo(...spikes[0]);
  for(const [x,y] of spikes.slice(1))c.lineTo(x,y);
  c.closePath();c.fill();c.stroke();
  c.save();c.clip();
  patternRect(c,0,18,80,8,color,.2);patternRect(c,0,40,80,6,'#ffffff',.12);patternRect(c,0,58,80,6,color,.16);
  for(let i=0;i<5;i++)patternRect(c,13+i*12,0,2,100,'#ffffff',.05);
  c.restore();
  c.fillStyle='#ffced1';c.beginPath();c.arc(28,39,5,0,Math.PI*2);c.arc(52,39,5,0,Math.PI*2);c.fill();
  c.fillStyle='#24070c';c.beginPath();c.arc(28,39,2.3,0,Math.PI*2);c.arc(52,39,2.3,0,Math.PI*2);c.fill();
  c.fillStyle='#ffd9dd';c.fillRect(27,55,26,4);c.fillStyle='#ff9aa4';for(let i=0;i<4;i++)c.fillRect(29+i*6,55,2,6);
}
function drawWorm(c,color){
  c.strokeStyle=color;c.lineWidth=10;c.lineCap='round';
  c.beginPath();c.moveTo(14,74);c.bezierCurveTo(28,80,24,55,37,52);c.bezierCurveTo(52,47,48,27,66,29);c.stroke();
  const segments=[[16,73],[29,63],[41,52],[53,41],[66,30]];
  segments.forEach(([x,y],i)=>{c.fillStyle=i%2?color:'#425414';c.strokeStyle='#f6ffd0';c.lineWidth=2;c.beginPath();c.arc(x,y,7-i*.35,0,Math.PI*2);c.fill();c.stroke();});
  c.fillStyle='#121907';c.beginPath();c.arc(63,28,2,0,Math.PI*2);c.arc(68,29,2,0,Math.PI*2);c.fill();
  c.fillStyle='#dbff89';c.fillRect(55,38,10,2);c.fillRect(28,60,10,2);
}
function drawTrojan(c,color){
  c.fillStyle='#181126';c.strokeStyle=color;c.lineWidth=4;
  c.beginPath();c.moveTo(18,58);c.lineTo(18,36);c.lineTo(28,22);c.lineTo(50,19);c.lineTo(61,26);c.lineTo(66,38);c.lineTo(64,58);c.lineTo(55,70);c.lineTo(29,70);c.closePath();c.fill();c.stroke();
  c.fillStyle='#2b1d42';c.fillRect(16,70,52,10);c.strokeRect(16,70,52,10);
  c.save();c.beginPath();c.moveTo(20,60);c.lineTo(20,38);c.lineTo(29,26);c.lineTo(49,23);c.lineTo(58,29);c.lineTo(62,39);c.lineTo(60,58);c.lineTo(53,66);c.lineTo(31,66);c.closePath();c.clip();
  patternRect(c,0,28,80,8,color,.16);patternRect(c,0,47,80,6,'#ffffff',.08);for(let i=0;i<5;i++)patternRect(c,18+i*8,24,2,50,'#ffffff',.05);
  c.restore();
  c.fillStyle='#e4d5ff';c.fillRect(31,36,7,4);c.fillRect(46,36,7,4);c.fillStyle='#1a112a';c.fillRect(33,37,3,2);c.fillRect(48,37,3,2);
  c.fillStyle='#f4e7ff';c.fillRect(38,51,12,3);c.fillStyle='#7154a0';c.fillRect(55,24,7,10);
}
function drawRansomware(c,color){
  c.fillStyle='#230912';c.strokeStyle=color;c.lineWidth=4;
  c.beginPath();c.moveTo(14,27);c.lineTo(25,12);c.lineTo(55,12);c.lineTo(66,27);c.lineTo(62,64);c.lineTo(52,81);c.lineTo(28,81);c.lineTo(18,64);c.closePath();c.fill();c.stroke();
  c.save();c.clip();patternRect(c,0,20,80,10,color,.18);patternRect(c,0,48,80,7,'#ffffff',.08);for(let i=0;i<6;i++)patternRect(c,13+i*9,0,2,100,'#ffffff',.05);c.restore();
  c.fillStyle='#f4f4f6';c.beginPath();c.arc(31,41,6,0,Math.PI*2);c.arc(49,41,6,0,Math.PI*2);c.fill();
  c.fillStyle='#25070d';c.beginPath();c.arc(31,42,2.5,0,Math.PI*2);c.arc(49,42,2.5,0,Math.PI*2);c.fill();
  c.fillStyle='#f4d7de';c.fillRect(31,58,18,4);c.fillStyle='#ff5a76';c.font='bold 17px monospace';c.textAlign='center';c.fillText('!',40,22);
  c.strokeStyle='#ffbdca';c.lineWidth=3;c.strokeRect(30,24,20,15);
}
function sprite(type){
  if(spriteCache.has(type))return spriteCache.get(type);
  const canvas=document.createElement('canvas');canvas.width=80;canvas.height=100;
  const c=canvas.getContext('2d'); const color=palette[type]||'#fff';
  c.shadowColor=color;c.shadowBlur=13;
  if(type==='virus')drawVirus(c,color);
  else if(type==='worm')drawWorm(c,color);
  else if(type==='trojan')drawTrojan(c,color);
  else if(type==='ransomware')drawRansomware(c,color);
  else if(type==='terminal'){
    c.fillStyle='#061422';c.fillRect(13,9,55,69);c.strokeStyle=color;c.lineWidth=5;c.strokeRect(13,9,55,69);
    patternRect(c,16,15,49,12,color,.15);patternRect(c,16,35,49,22,'#ffffff',.08);
    c.fillStyle=color;c.font='bold 35px monospace';c.fillText('?',29,58);
    c.fillRect(34,79,12,13);c.fillRect(22,92,36,5);
  }else if(type==='exit'||type==='core'){
    c.fillStyle='#0d2435';c.fillRect(7,8,65,84);c.strokeStyle=color;c.lineWidth=5;c.strokeRect(7,8,65,84);
    patternRect(c,13,14,53,60,color,.12);
    c.fillStyle=color;c.font='bold 35px monospace';c.fillText(type==='exit'?'→':'◆',21,65);
  }else if(type==='firewall'){
    c.fillStyle='#132a33';c.strokeStyle=color;c.lineWidth=5;
    c.beginPath();c.moveTo(40,8);c.lineTo(69,22);c.lineTo(63,69);c.lineTo(40,92);c.lineTo(17,69);c.lineTo(11,22);c.closePath();c.fill();c.stroke();
    c.fillStyle=color;c.font='bold 28px monospace';c.fillText('✓',27,58);patternRect(c,20,24,40,9,'#fff',.12);
  }else{
    c.fillStyle=color;c.beginPath();c.moveTo(40,7);c.lineTo(73,42);c.lineTo(40,82);c.lineTo(7,42);c.closePath();c.fill();
    patternRect(c,14,26,52,16,'#fff',.15);
    c.shadowBlur=0;c.fillStyle='#082436';c.font='bold 25px monospace';c.textAlign='center';
    const symbols={key:'K',backup:'+',shield:'S',update:'U',archive:'F'};
    c.fillText(symbols[type]||'!',40,51);
  }
  spriteCache.set(type,canvas);return canvas;
}
function wallTexture(type='wall'){
  if(wallCache.has(type))return wallCache.get(type);
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
  const c=canvas.getContext('2d');
  if(type==='door'){
    const g=c.createLinearGradient(0,0,64,64);g.addColorStop(0,'#20313d');g.addColorStop(.45,'#6e8796');g.addColorStop(1,'#223340');
    c.fillStyle=g;c.fillRect(0,0,64,64);
    // metal panels
    c.strokeStyle='#8ca8b9';c.lineWidth=2;
    c.strokeRect(6,6,52,52);
    c.strokeRect(12,12,40,40);
    patternRect(c,30,0,4,64,'#d6eef8',.35);
    for(let y=8;y<64;y+=12)patternRect(c,0,y,64,2,'#0e151a',.25);
    for(let x=8;x<64;x+=12)patternRect(c,x,0,2,64,'#c2d8e3',.08);
    // bolts and stripe
    c.fillStyle='#d7e8ef';[[10,10],[54,10],[10,54],[54,54],[20,20],[44,20],[20,44],[44,44]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,1.6,0,Math.PI*2);c.fill();});
    patternRect(c,5,28,54,8,'#55d4ff',.35);
    patternRect(c,7,30,50,4,'#d8f5ff',.3);
  }else{
    const g=c.createLinearGradient(0,0,64,64);g.addColorStop(0,'#162732');g.addColorStop(.52,'#325363');g.addColorStop(1,'#13212b');
    c.fillStyle=g;c.fillRect(0,0,64,64);
    // metal wall plates
    c.strokeStyle='#203543';c.lineWidth=1.5;
    for(let yy=0;yy<64;yy+=16)for(let xx=0;xx<64;xx+=16)c.strokeRect(xx+.5,yy+.5,15,15);
    for(let i=0;i<4;i++){
      const x=4+i*15;
      patternRect(c,x,4,10,8,'#93eaff',.18);
      patternRect(c,x+1,23,12,3,'#deffff',.18);
      patternRect(c,x,39,11,8,'#081621',.35);
      patternRect(c,x,52,10,4,'#55ccef',.15);
    }
    for(let y=0;y<64;y+=8)patternRect(c,0,y,64,1,'#0d1920',.28);
    for(let x=0;x<64;x+=8)patternRect(c,x,0,1,64,'#e8feff',.03);
    // bolts
    c.fillStyle='#d8ebf4';
    for(let yy=2;yy<64;yy+=16)for(let xx=2;xx<64;xx+=16){c.beginPath();c.arc(xx,yy,1.3,0,Math.PI*2);c.fill();}
    patternRect(c,0,0,64,64,'#fff',.03);
  }
  wallCache.set(type,canvas);return canvas;
}
function castRay(level,ox,oy,angle){
  const dx=Math.cos(angle),dy=Math.sin(angle);
  let mx=Math.floor(ox),my=Math.floor(oy);
  const ddx=Math.abs(1/dx),ddy=Math.abs(1/dy);
  const sx=dx<0?-1:1,sy=dy<0?-1:1;
  let sideX=(dx<0?ox-mx:mx+1-ox)*ddx,sideY=(dy<0?oy-my:my+1-oy)*ddy,side=0;
  for(let i=0;i<64;i++){
    if(sideX<sideY){mx+=sx;sideX+=ddx;side=0;}else{my+=sy;sideY+=ddy;side=1;}
    if(solidAt(level,mx+.5,my+.5)){
      const dist=Math.max(.03,side===0?sideX-ddx:sideY-ddy);
      const pos=side===0?oy+dist*dy:ox+dist*dx;
      return {dist,side,tile:level.map[my]?.[mx]||'#',tex:pos-Math.floor(pos)};
    }
  }
  return {dist:CONFIG.MAX_DISTANCE,side:0,tile:'#',tex:0};
}
export class Renderer{
  constructor(canvas,minimap){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.minimap=minimap;this.mapCtx=minimap.getContext('2d');this.z=new Float32Array(canvas.width);}
  draw(game){
    const c=this.ctx,W=this.canvas.width,H=this.canvas.height;
    const horizon=H*.49+Math.sin(game.player.walkTime)*1.8;
    const sky=c.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#050c20');sky.addColorStop(1,'#244461');c.fillStyle=sky;c.fillRect(0,0,W,horizon);
    const floor=c.createLinearGradient(0,horizon,0,H);floor.addColorStop(0,'#1b3440');floor.addColorStop(1,'#060f16');c.fillStyle=floor;c.fillRect(0,horizon,W,H-horizon);
    c.strokeStyle='#58d8fa18';c.lineWidth=1;
    for(let i=1;i<13;i++){const yy=horizon+Math.pow(i/12,1.7)*(H-horizon);c.beginPath();c.moveTo(0,yy);c.lineTo(W,yy);c.stroke();}
    for(let x=0;x<W;x+=3){
      const offset=Math.atan((x/W*2-1)*Math.tan(CONFIG.FOV/2));
      const ray=castRay(game.level,game.player.x,game.player.y,game.player.angle+offset);
      const corrected=ray.dist*Math.cos(offset),height=Math.min(2800,H/corrected*0.88);
      const top=Math.round(horizon-height/2);
      const shade=Math.max(.16,1-ray.dist/21)*(ray.side===1?.72:1);
      const texture=wallTexture(ray.tile==='D'?'door':'wall');
      const sx=Math.max(0,Math.min(texture.width-1,Math.floor(ray.tex*(texture.width-1))));
      c.drawImage(texture,sx,0,1,texture.height,x,top,3,Math.ceil(height)+1);
      c.fillStyle=`rgba(0,0,0,${Math.max(0,.82-shade)})`;c.fillRect(x,top,3,Math.ceil(height)+1);
      c.fillStyle='rgba(255,255,255,.045)';c.fillRect(x,top+height*.11,3,Math.max(1,height*.013));c.fillRect(x,top+height*.86,3,Math.max(1,height*.013));
      for(let j=x;j<x+3&&j<W;j++)this.z[j]=corrected;
    }
    const objects=[...game.level.pickups.filter(p=>!p.used),...game.level.terminals.filter(t=>!t.used).map(p=>({...p,type:'terminal'}))];
    if(game.level.firewall&&!game.level.firewall.used)objects.push({...game.level.firewall,type:'firewall'});
    if(!game.level.exited)objects.push(game.level.exit);
    for(const e of game.level.enemies)if(!e.dead)objects.push({...e,enemy:true});
    objects.sort((a,b)=>Math.hypot(b.x-game.player.x,b.y-game.player.y)-Math.hypot(a.x-game.player.x,a.y-game.player.y));
    for(const obj of objects){
      const dx=obj.x-game.player.x,dy=obj.y-game.player.y;
      const angle=Math.atan2(Math.sin(Math.atan2(dy,dx)-game.player.angle),Math.cos(Math.atan2(dy,dx)-game.player.angle));
      if(Math.abs(angle)>CONFIG.FOV*.68)continue;
      const dist=Math.hypot(dx,dy)*Math.cos(angle);if(dist<=.16||dist>CONFIG.MAX_DISTANCE)continue;
      const scale=obj.enemy?ENEMY_TYPES[obj.type].size:.7;
      const size=Math.min(H*5,H/dist*.84*scale),sw=size*.81;
      const cx=W/2+Math.tan(angle)/Math.tan(CONFIG.FOV/2)*W/2;
      const top=horizon-size*.56+(obj.enemy?0:Math.sin(game.elapsed*3+obj.x)*5);
      const tex=sprite(obj.type),x1=Math.floor(cx-sw/2),x2=Math.ceil(cx+sw/2);
      for(let x=Math.max(0,x1);x<Math.min(W,x2);x+=3){
        if(dist>this.z[x]+.2)continue;
        const sx=(x-(cx-sw/2))/sw*tex.width;
        c.drawImage(tex,Math.max(0,Math.floor(sx)),0,Math.max(1,Math.min(3/sw*tex.width,tex.width-sx)),tex.height,x,top,3,size);
      }
      if(obj.enemy&&obj.hp<obj.maxHp){c.fillStyle='#1c1225';c.fillRect(cx-sw*.37,top-8,sw*.74,4);c.fillStyle=obj.type==='ransomware'?'#ff5264':'#8dfb6a';c.fillRect(cx-sw*.37,top-8,sw*.74*Math.max(0,obj.hp/obj.maxHp),4);}
      if(obj.enemy&&obj.type==='ransomware'&&obj.warning>=0){c.strokeStyle='#ff415b';c.lineWidth=4;c.strokeRect(cx-sw/2,top,sw,size);}
    }
    c.fillStyle='#00000009';for(let y=0;y<H;y+=5)c.fillRect(0,y,W,1);
    if(game.muzzle>0){
      const flashColor=game.weaponKey==='mp40'?'#ffd09a':game.weaponKey==='ak47'?'#c2ff93':'#bbffff';
      c.fillStyle=flashColor;c.globalAlpha=Math.min(1,game.muzzle*5);c.beginPath();c.arc(W/2,H*.79,game.muzzle*250,0,Math.PI*2);c.fill();c.globalAlpha=1;
    }
    if(game.hitMarker>0){c.strokeStyle='#ffffff';c.lineWidth=3;for(const [a,b] of [[-12,-12],[12,-12],[-12,12],[12,12]]){c.beginPath();c.moveTo(W/2+a*.5,H*.49+b*.5);c.lineTo(W/2+a,H*.49+b);c.stroke();}}
    this.drawMap(game);
  }
  drawMap(game){
    const c=this.mapCtx,level=game.level,map=level.map;
    const W=this.minimap.width,H=this.minimap.height,cell=6;
    c.fillStyle='#021422';c.fillRect(0,0,W,H);
    const ox=W/2-game.player.x*cell,oy=H/2-game.player.y*cell;
    for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){
      const tile=map[y][x];
      c.fillStyle=tile==='D'&&!level.openDoors.has(`${x},${y}`)?'#b4e963':tile==='#'?'#42647e':'#0a2332';
      c.fillRect(ox+x*cell,oy+y*cell,cell-1,cell-1);
    }
    for(const e of level.enemies){if(e.dead)continue;c.fillStyle=e.type==='ransomware'?'#ff1d4e':'#fc6674';c.fillRect(ox+e.x*cell-2,oy+e.y*cell-2,4,4);}
    c.fillStyle='#45eafa';c.beginPath();c.arc(W/2,H/2,3,0,Math.PI*2);c.fill();
    c.strokeStyle='#45eafa';c.beginPath();c.moveTo(W/2,H/2);c.lineTo(W/2+Math.cos(game.player.angle)*11,H/2+Math.sin(game.player.angle)*11);c.stroke();
    c.strokeStyle='#44bdde';c.strokeRect(.5,.5,W-1,H-1);
  }
}
