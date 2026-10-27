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
    if(e.type==='ransomware'&&e.warning>=0){
      if(elapsed>=e.warning){
        if(game.status==='playing'&&dist<type.range&&lineClear(level,e.x,e.y,player.x,player.y))game.takeDamage(type.damage*difficulty.damage);
        e.warning=-1;
      }
    }
    if(dist<type.range&&canSee){
      if(elapsed-e.lastAttack>(e.type==='ransomware'?2.5:1.15)){
        e.lastAttack=elapsed;
        if(e.type==='ransomware'){e.warning=elapsed+.72;game.onNotice?.('⚠ RANSOMWARE CARREGANDO ATAQUE!');}
        else game.takeDamage(type.damage*difficulty.damage);
      }
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
    sound('kill');game.onNotice?.(`${ENEMY_TYPES[enemy.type].name} NEUTRALIZADO  +${ENEMY_TYPES[enemy.type].points}`);
    if(enemy.type==='ransomware')game.onBossDead?.();
    else if(game.level.enemies.every(e=>e.dead))game.onAllClear?.();
  }
}
export function shoot(game){
  const weapon=game.weapon;
  if(game.status!=='playing'||game.elapsed-game.lastShot<weapon.cooldown)return;
  game.lastShot=game.elapsed;game.muzzle=.13;
  sound(weapon.sound);
  const hits=new Map();
  let hitCount=0;
  for(let pellet=0;pellet<(weapon.pellets||1);pellet++){
    let selected=null,selectedD=Infinity;
    const pelletAngle=game.player.angle+((Math.random()*2-1)*(weapon.spread||0));
    for(const e of game.level.enemies){
      if(e.dead)continue;
      const dx=e.x-game.player.x,dy=e.y-game.player.y,dist=Math.hypot(dx,dy);
      if(dist>weapon.range)continue;
      const diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-pelletAngle),Math.cos(Math.atan2(dy,dx)-pelletAngle));
      if(Math.abs(diff)<Math.atan2(ENEMY_TYPES[e.type].size*.42,dist)&&lineClear(game.level,game.player.x,game.player.y,e.x,e.y)&&dist<selectedD){selected=e;selectedD=dist;}
    }
    if(selected){
      hits.set(selected,(hits.get(selected)||0)+weapon.damage);
      hitCount++;
    }
  }
  if(hitCount>0){
    sound('hit');game.hitMarker=.12;
    for(const [enemy,damage] of hits.entries())registerHit(game,enemy,damage);
  }
}
