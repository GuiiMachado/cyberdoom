import {ENEMY_TYPES} from './config.js';
import {canStand,solidAt,lineClear} from './levels.js';
import {sound} from './audio.js';
function gridPath(level,enemy,player){
  const sx=Math.floor(enemy.x),sy=Math.floor(enemy.y),tx=Math.floor(player.x),ty=Math.floor(player.y);
  if(sx===tx&&sy===ty)return null;
  const width=level.map[0].length,height=level.map.length;
  const toId=(x,y)=>y*width+x;
  const start=toId(sx,sy),goal=toId(tx,ty);
  const queue=[start],parent=new Map([[start,-1]]);
  for(let qi=0;qi<queue.length;qi++){
    const id=queue[qi];if(id===goal)break;
    const x=id%width,y=Math.floor(id/width);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,nid=toId(nx,ny);
      if(nx<0||ny<0||nx>=width||ny>=height||parent.has(nid)||solidAt(level,nx+.5,ny+.5))continue;
      parent.set(nid,id);queue.push(nid);
    }
  }
  if(!parent.has(goal))return null;
  let id=goal;
  while(parent.get(id)!==start&&parent.get(id)!==-1)id=parent.get(id);
  return {x:id%width+.5,y:Math.floor(id/width)+.5};
}
export function initEnemies(level,config){
  for(const e of level.enemies){const base=ENEMY_TYPES[e.type];e.maxHp=Math.ceil(base.hp*config.hp);e.hp=e.maxHp;e.dead=false;e.warning=-1;e.target=null;}
}
export function updateEnemies(game,dt){
  const {level,player,elapsed,difficulty}=game;
  for(const e of level.enemies){
    if(e.dead)continue;
    const type=ENEMY_TYPES[e.type];const dx=player.x-e.x,dy=player.y-e.y,dist=Math.hypot(dx,dy);
    const canSee=dist<11&&lineClear(level,e.x,e.y,player.x,player.y);
    if(e.warning>=0&&elapsed>=e.warning){
      if(game.status==='playing'&&canSee){
        if(e.warningType==='charge'&&dist<3.2)game.takeDamage(type.damage*1.8*difficulty.damage);
        else if(e.warningType==='spore'&&dist<7){game.takeDamage(type.damage*difficulty.damage);game.poisonUntil=elapsed+4;game.poisonTickAt=elapsed+1;game.notice('ESPOROS TÓXICOS! AFASTE-SE DO WORM.');}
        else if(e.type==='ransomware'&&dist<type.range)game.takeDamage(type.damage*difficulty.damage);
      }
      e.warning=-1;e.warningType=null;
    }
    if(e.type==='trojan'&&dist>type.range&&dist<4.2&&canSee&&elapsed-e.lastAttack>2.8&&e.warning<0){
      e.lastAttack=elapsed;e.warning=elapsed+.82;e.warningType='charge';game.notice('TROIANO PREPARANDO INVESTIDA!');
    }else if(e.type==='worm'&&dist>type.range&&dist<7&&canSee&&elapsed-e.lastAttack>3.2&&e.warning<0){
      e.lastAttack=elapsed;e.warning=elapsed+.68;e.warningType='spore';game.notice('WORM CARREGANDO NUVEM DE ESPOROS!');
    }
    if(e.type==='ransomware'&&dist<type.range&&canSee&&elapsed-e.lastAttack>2.5&&e.warning<0){
      e.lastAttack=elapsed;e.warning=elapsed+.72;e.warningType='boss';game.notice('RANSOMWARE CARREGANDO ATAQUE!');
    }else if(dist<type.range&&canSee&&e.type!=='ransomware'){
      if(elapsed-e.lastAttack>1.15){e.lastAttack=elapsed;game.takeDamage(type.damage*difficulty.damage);}
    }
    if(dist>.62&&dist<14){
      e.pathCooldown-=dt;
      if(e.pathCooldown<=0){e.pathCooldown=.55+Math.random()*.2;e.target=canSee?null:gridPath(level,e,player);}
      const tx=e.target?.x??player.x,ty=e.target?.y??player.y;
      const ex=tx-e.x,ey=ty-e.y,d=Math.hypot(ex,ey);
      if(d>.06){
        const chaseSpeed=type.speed*difficulty.speed*(e.type==='ransomware'?.85:1);
        const step=Math.min(chaseSpeed*dt,d);
        const mx=ex/d*step,my=ey/d*step;
        if(canStand(level,e.x+mx,e.y,.24))e.x+=mx;
        if(canStand(level,e.x,e.y+my,.24))e.y+=my;
      }
    }
  }
}
function registerHit(game,enemy,damage){
  enemy.hp-=damage;
  if(enemy.hp<=0&&!enemy.dead){
    enemy.dead=true;game.score+=ENEMY_TYPES[enemy.type].points;game.kills++;
    if(game.upgrades?.drain)game.health=Math.min(100,game.health+4);
    sound('kill');game.onNotice?.(`${ENEMY_TYPES[enemy.type].name} NEUTRALIZADO  +${ENEMY_TYPES[enemy.type].points}`);
    if(enemy.type==='ransomware')game.onBossDead?.();
    else if(game.level.enemies.every(e=>e.dead))game.onAllClear?.();
  }
}
export function shoot(game){
  const weapon=game.weapon;
  if(game.status!=='playing')return;
  if(Number.isFinite(weapon.ammo)&&game.weaponAmmo[weapon.key]<=0){game.notice('DISRUPTOR SEM MUNIÇÃO. ALTERNE PARA A ARMA 1.');return;}
  const cooldown=weapon.cooldown*(game.upgrades?.rapid?.78:1);
  if(game.elapsed-game.lastShot<cooldown)return;
  if(Number.isFinite(weapon.ammo))game.weaponAmmo[weapon.key]--;
  game.lastShot=game.elapsed;game.muzzle=.13;
  sound(weapon.sound);
  const hits=new Map();
  let hitCount=0;
  for(let pellet=0;pellet<(weapon.pellets||1);pellet++){
    let selected=null,selectedD=Infinity;
    const spread=(weapon.spread||0)*(game.upgrades?.precision?.55:1);
    const pelletAngle=game.player.angle+((Math.random()*2-1)*spread);
    for(const e of game.level.enemies){
      if(e.dead)continue;
      const dx=e.x-game.player.x,dy=e.y-game.player.y,dist=Math.hypot(dx,dy);
      if(dist>weapon.range)continue;
      const diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-pelletAngle),Math.cos(Math.atan2(dy,dx)-pelletAngle));
      if(Math.abs(diff)<Math.atan2(ENEMY_TYPES[e.type].size*.42,dist)&&lineClear(game.level,game.player.x,game.player.y,e.x,e.y)&&dist<selectedD){selected=e;selectedD=dist;}
    }
    if(selected){
      const weakAngle=Math.atan2(.82,selectedD);
      const weakpoint=selected.type==='ransomware'&&Math.abs(game.player.pitch-weakAngle)<.11;
      const damage=weapon.damage*(game.upgrades?.damage?1.25:1)*(weakpoint?2:1);
      hits.set(selected,(hits.get(selected)||0)+damage);
      if(weakpoint)game.weakHitFlash=.45;
      hitCount++;
    }
  }
  if(hitCount>0){
    sound('hit');game.hitMarker=.12;
    for(const [enemy,damage] of hits.entries())registerHit(game,enemy,damage);
  }
}
