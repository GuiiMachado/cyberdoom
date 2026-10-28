import {CONFIG} from './config.js';
export function completeTask(game,key){
  if(!(key in game.level.tasks)||game.level.tasks[key])return false;
  game.level.tasks[key]=true;
  // Pontos por objetivos secundários; fases e objetivos finais têm bônus próprios.
  if(key!=='clear'&&key!=='boss'&&key!=='exit'&&key!=='core')game.score+=CONFIG.POINTS.objective;
  game.onNotice?.(`OBJETIVO COMPLETO: ${game.level.objectives.find(([k])=>k===key)?.[1]||key}`);
  return true;
}
export function canExit(game){return Object.entries(game.level.tasks).every(([key,val])=>key==='exit'||key==='core'||game.level.optionalTasks?.includes(key)||val);}
export function phaseProgress(game){return Object.values(game.level.tasks).filter(Boolean).length;}
export function totalCompleted(game){return game.completedObjectives+phaseProgress(game);}
