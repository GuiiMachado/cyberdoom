import {readStorage,writeStorage,removeStorage} from './storage.js';
const KEY='leaderboard';
export const validNickname = name => /^[A-Za-z0-9_]{3,12}$/.test(name);
export const formatTime = seconds => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
export function compareScores(a,b){return b.score-a.score||Number(b.won)-Number(a.won)||a.time-b.time||b.health-a.health;}
function all(){const data=readStorage(KEY,[]);return Array.isArray(data)?data:[];}
export function topScores(difficulty){return all().filter(r=>r.difficulty===difficulty).sort(compareScores).slice(0,10);}
export function saveScore(entry){
  if(!validNickname(entry.nick))throw new Error('Apelido inválido');
  const data=all();
  const found=data.find(row=>row.id===entry.id);
  if(found)return{position:topScores(entry.difficulty).findIndex(r=>r.id===entry.id)+1||null,record:false,stored:true};
  const old=topScores(entry.difficulty); const record=old.length===0||compareScores(entry,old[0])<0;
  data.push({...entry});
  // Conservar top 10 por dificuldade; não salvar históricos ilimitados.
  const sorted=data.sort((a,b)=>a.difficulty.localeCompare(b.difficulty)||compareScores(a,b));
  const filtered=[];const counts={};
  for(const r of sorted){counts[r.difficulty]=(counts[r.difficulty]||0)+1;if(counts[r.difficulty]<=10)filtered.push(r);}
  const stored=writeStorage(KEY,filtered);
  const p=filtered.filter(r=>r.difficulty===entry.difficulty).findIndex(r=>r.id===entry.id);
  return {position:p<0?null:p+1,record,stored};
}
export function clearScores(){return removeStorage(KEY);}
