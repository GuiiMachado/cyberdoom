import {CONFIG} from './config.js';
import {canStand} from './levels.js';
export function movePlayer(player,level,keys,dt){
  let forward=0,strafe=0;
  if(keys.has('KeyW')||keys.has('ArrowUp'))forward++;
  if(keys.has('KeyS')||keys.has('ArrowDown'))forward--;
  if(keys.has('KeyD'))strafe++;
  if(keys.has('KeyA'))strafe--;
  if(keys.has('ArrowLeft'))player.angle-=dt*1.85;
  if(keys.has('ArrowRight'))player.angle+=dt*1.85;
  if(forward===0&&strafe===0)return;
  const magnitude=Math.hypot(forward,strafe),speed=CONFIG.PLAYER_SPEED*(keys.has('ShiftLeft')||keys.has('ShiftRight')?1.50:1)*dt;
  const dx=(Math.cos(player.angle)*forward-Math.sin(player.angle)*strafe)/magnitude*speed;
  const dy=(Math.sin(player.angle)*forward+Math.cos(player.angle)*strafe)/magnitude*speed;
  if(canStand(level,player.x+dx,player.y,CONFIG.PLAYER_RADIUS))player.x+=dx;
  if(canStand(level,player.x,player.y+dy,CONFIG.PLAYER_RADIUS))player.y+=dy;
  player.walkTime+=dt*11;
}
