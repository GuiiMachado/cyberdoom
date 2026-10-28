import assert from 'node:assert/strict';
import {Game} from '../js/game.js';
import {canExit} from '../js/missions.js';
import {CONFIG,ENEMY_TYPES} from '../js/config.js';
import {canStand,lineClear,LEVELS,makeLevel} from '../js/levels.js';
import {validNickname,compareScores,formatTime,topScores,saveScore,clearScores} from '../js/leaderboard.js';
import {QUESTIONS} from '../js/quiz.js';
import {shoot,updateEnemies} from '../js/enemies.js';

const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
let count=0;function test(name,run){run();count++;console.log('✓',name)}
const setup=diff=>{
  let ended=null;
  const game=new Game({onEnd:result=>{ended=result;saveScore(result)},onQuiz:()=>{},onNotice:()=>{},onLevel:()=>{}});
  game.start('AGENTE_01',diff);
  return {game,getResult:()=>ended};
};
test('Os três mapas são fechados, retangulares e têm duas portas',()=>{
  assert.equal(LEVELS.length,3);
  for(let i=0;i<3;i++){
    const l=makeLevel(i,CONFIG.DIFFICULTIES.easy);assert.equal(l.doors.length,2);
    const w=l.map[0].length;
    for(let y=0;y<l.map.length;y++){
      assert.equal(l.map[y].length,w);assert.equal(l.map[y][0],'#');assert.equal(l.map[y][w-1],'#');
    }
    assert(!canStand(l,0.5,1.5));assert(canStand(l,l.start.x,l.start.y));
    assert(!canStand(l,l.doors[0].x,l.doors[0].y));
  }
});
test('Apelidos são validados e rankings têm critérios determinísticos',()=>{
  assert(validNickname('abc_123'));assert(!validNickname('ab'));assert(!validNickname('a b'));assert(!validNickname('ábc'));
  assert.equal(formatTime(125.1),'02:05');
  assert(compareScores({score:200,won:false,time:100,health:5},{score:1000,won:true,time:1,health:100})>0);
});
test('Perguntas são completas, distribuídas por áreas e sem duplicidade de resposta correta',()=>{
  assert(QUESTIONS.length>=15);assert(new Set(QUESTIONS.map(q=>q.topic)).size>=6);
  assert(QUESTIONS.every(q=>q.a.length===4&&q.correct>=0&&q.correct<4&&q.why));
});
test('Dificuldade realmente muda HP, velocidade, dano, itens e inimigos',()=>{
  const easy=setup('easy').game,hard=setup('hard').game;
  assert(hard.level.enemies[0].maxHp>easy.level.enemies[0].maxHp);
  assert(hard.level.enemies.length>easy.level.enemies.length);
  assert(hard.difficulty.speed>easy.difficulty.speed);
  assert(hard.difficulty.damage>easy.difficulty.damage);
  assert(hard.difficulty.recovery<easy.difficulty.recovery);
});
test('Teclas e colisão com paredes impedem atravessar o cenário',()=>{
  const {game:g}=setup('easy');g.player.x=7.5;g.player.y=5.5;g.player.angle=0;
  g.keys.add('KeyW');
  for(let i=0;i<60;i++)g.update(.04);
  assert(g.player.x<7.8,'Jogador atravessou parede');
  g.keys.clear();
});
test('Coleta, chave, duas portas e interação desbloqueiam próxima fase',()=>{
  const {game:g}=setup('easy');
  g.player.x=4.5;g.player.y=12.5;g.collectPickups();assert(g.player.hasKey&&g.level.tasks.key);
  for(const door of g.level.doors){g.player.x=door.x-.75;g.player.y=door.y;g.interact();}
  assert(g.level.tasks.doors);assert(canStand(g.level,8.5,8.5));
  g.player.x=21.5;g.player.y=5.5;g.collectPickups();assert(g.level.tasks.archive);
  g.level.enemies.forEach(e=>e.dead=true);g.onAllClear();assert(g.level.tasks.clear);
  g.player.x=22.5;g.player.y=12.5;g.interact();assert.equal(g.levelIndex,1);
  assert(g.score>=500);assert.equal(g.completedObjectives,5);
});
test('Sem a chave a porta não se abre; sem objetivos não sai do setor',()=>{
  const {game:g}=setup('easy');g.player.x=7.25;g.player.y=8.5;g.interact();assert.equal(g.level.openDoors.size,0);
  g.player.x=22.5;g.player.y=12.5;g.interact();assert.equal(g.levelIndex,0);
});
test('Disparos causam dano e pontuação é concedida uma vez por inimigo',()=>{
  const {game:g}=setup('easy');
  const e=g.level.enemies[0];
  e.x=g.player.x+2;e.y=g.player.y;
  g.player.angle=0;g.elapsed=1;
  assert(lineClear(g.level,g.player.x,g.player.y,e.x,e.y));
  const health=e.hp;
  g.fire();assert(e.hp<health,'Disparo não acertou o alvo');
  for(let i=0;i<10;i++){g.elapsed+=.35;g.fire();}
  assert(e.dead);const score=g.score,kills=g.kills;
  g.elapsed+=1;g.fire();assert.equal(g.score,score);assert.equal(g.kills,kills);
});
test('Integridade, cooldown de ataques e proteções afetam dano',()=>{
  const {game:g}=setup('medium');g.elapsed=1;g.takeDamage(20);assert.equal(g.health,80);
  g.takeDamage(20);assert.equal(g.health,80);
  g.elapsed+=.5;g.shieldUntil=g.elapsed+10;g.takeDamage(20);
  assert(g.health>60);
});
test('Questão pontua uma vez e terminal é consumido',()=>{
  const {game:g}=setup('easy');
  g.player.x=12.5;g.player.y=11.5;g.interact();assert.equal(g.status,'quiz');
  const question=g.currentQuestion, score=g.score;
  const ammo=g.weaponAmmo.disruptor;
  const result=g.answerQuiz(question.correct);assert(result.correct);assert(result.why&&result.hint);assert.equal(g.weaponAmmo.disruptor,ammo+10);assert.equal(g.score,score+150);
  assert.equal(g.answeredQuestions.size,1);assert(g.level.terminals[0].used);
  g.closeQuiz();assert.equal(g.status,'playing');
});
test('Missões opcionais de proteção e desarme funcionam e não bloqueiam a saída',()=>{
  const {game:g}=setup('easy');
  assert(g.level.defensePoint);
  for(const key of ['key','doors','archive','clear'])g.level.tasks[key]=true;
  assert(canExit(g));
  g.level.enemies.forEach(enemy=>{enemy.dead=true;});
  g.player.x=g.level.defensePoint.x;g.player.y=g.level.defensePoint.y;g.interact();
  assert(g.level.defensePoint.active);
  for(let i=0;i<260;i++){g.player.x=g.level.defensePoint.x;g.player.y=g.level.defensePoint.y;g.update(.05);}
  assert(g.level.tasks.defend);
  g.openLevel(1);assert(g.level.disarmPoint);
  for(const key of ['key','doors','firewall','clear'])g.level.tasks[key]=true;
  assert(canExit(g));
  g.player.x=g.level.disarmPoint.x;g.player.y=g.level.disarmPoint.y;g.interact();
  assert(g.level.tasks.disarm);
});
test('Estação de melhorias vende reparo, cadência, precisão e firewall',()=>{
  const {game:g}=setup('easy');g.score=2000;g.health=65;
  g.player.x=g.level.upgradePoint.x;g.player.y=g.level.upgradePoint.y;g.interact();
  assert.equal(g.status,'upgrade');
  assert(g.buyUpgrade('health'));assert.equal(g.health,95);
  assert(g.buyUpgrade('rapid'));assert(g.upgrades.rapid);
  assert(g.buyUpgrade('precision'));assert(g.upgrades.precision);
  assert(g.buyUpgrade('shield'));assert(g.shieldUntil>g.elapsed);
  assert(!g.buyUpgrade('rapid'));assert(g.score<2000);
  g.closeUpgrade();assert.equal(g.status,'playing');
});
test('Troiano e worm anunciam ataques especiais antes de atacar; ponto fraco do chefe dobra dano',()=>{
  const {game:g}=setup('easy');g.elapsed=10;
  const trojan=g.level.enemies.find(e=>e.type==='trojan');
  trojan.x=g.player.x+3;trojan.y=g.player.y;updateEnemies(g,.01);
  assert.equal(trojan.warningType,'charge');
  const worm=g.level.enemies.find(e=>e.type==='worm');
  worm.x=g.player.x+5;worm.y=g.player.y;updateEnemies(g,.01);
  assert.equal(worm.warningType,'spore');
  g.openLevel(2);g.elapsed=1;
  const boss=g.level.enemies.find(e=>e.type==='ransomware');
  boss.x=g.player.x+2;boss.y=g.player.y;g.player.angle=0;g.player.pitch=Math.atan2(.82,2);
  const hp=boss.hp;g.fire();assert.equal(hp-boss.hp,g.weapon.damage*2);
});
test('Chefe final libera núcleo e condições de vitória',()=>{
  const {game:g,getResult}=setup('hard');g.openLevel(2);
  g.level.enemies.find(e=>e.type==='ransomware').dead=true;g.onBossDead();
  assert(g.level.tasks.boss);
  g.level.tasks.key=true;g.level.tasks.doors=true;g.level.tasks.update=true;
  g.player.x=22.5;g.player.y=12.5;g.interact();
  assert.equal(g.status,'ended');assert(getResult()?.won);
  assert.equal(getResult().completed,5);
});
test('Derrota e registro único no Top 10; pontuações separadas por dificuldade',()=>{
  clearScores();const {game:g,getResult}=setup('medium');g.elapsed=2;
  g.takeDamage(200);assert.equal(g.status,'ended');assert.equal(g.health,0);
  const r=getResult();assert(r&&!r.won);
  assert.equal(topScores('medium').length,1);assert.equal(topScores('hard').length,0);
  const again=saveScore(r);assert.equal(topScores('medium').length,1);assert.equal(again.record,false);
  assert.equal(topScores('medium')[0].nick,'AGENTE_01');
  clearScores();assert.equal(topScores('medium').length,0);
});
console.log(`\n${count} testes de lógica concluídos com sucesso.`);
