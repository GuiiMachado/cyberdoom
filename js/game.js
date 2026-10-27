import {CONFIG,WEAPONS} from './config.js';
import {makeLevel} from './levels.js';
import {movePlayer} from './player.js';
import {initEnemies,updateEnemies,shoot} from './enemies.js';
import {completeTask,canExit,totalCompleted} from './missions.js';
import {nextQuestion} from './quiz.js';
import {sound} from './audio.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const weaponOrder=['deagle','mp40','ak47'];
export class Game{
  constructor({onEnd,onQuiz,onNotice,onLevel,onWeapon}){
    this.onEnd=onEnd;this.onQuiz=onQuiz;this.onNotice=onNotice;this.onLevel=onLevel;this.onWeapon=onWeapon;
    this.status='menu';this.keys=new Set();this.answeredQuestions=new Set();
  }
  start(nick,difficultyName){
    this.nick=nick;this.difficultyName=difficultyName;this.difficulty=CONFIG.DIFFICULTIES[difficultyName];
    this.id=`${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.health=100;this.score=0;this.kills=0;this.elapsed=0;this.levelIndex=0;
    this.completedObjectives=0;this.answeredQuestions=new Set();this.shieldUntil=0;
    this.lastDamage=-10;this.lastShot=-10;this.muzzle=0;this.hitMarker=0;this.dmgFlash=0;
    this.resultSaved=false;this.keys.clear();this.weaponKey='deagle';this.weapon=WEAPONS[this.weaponKey];
    this.openLevel(0);this.status='playing';
    this.onWeapon?.(this.weaponKey,this.weapon);
    this.notice('INICIALIZAÇÃO CONCLUÍDA. PROTEJA O SISTEMA!');
  }
  openLevel(index){
    this.levelIndex=index;this.level=makeLevel(index,this.difficulty);
    initEnemies(this.level,this.difficulty);
    this.player={...this.level.start,angle:0,walkTime:0,hasKey:false};
    this.onLevel?.();
  }
  notice(text){this.onNotice?.(text);}
  setWeapon(key){
    if(!WEAPONS[key]||this.weaponKey===key)return;
    this.weaponKey=key;this.weapon=WEAPONS[key];
    sound('swap');
    this.notice(`${this.weapon.name} SELECIONADA`);
    this.onWeapon?.(this.weaponKey,this.weapon);
  }
  cycleWeapon(){
    const idx=(weaponOrder.indexOf(this.weaponKey)+1)%weaponOrder.length;
    this.setWeapon(weaponOrder[idx]);
  }
  update(dt){
    if(this.status!=='playing')return;
    dt=Math.min(.05,dt);this.elapsed+=dt;
    this.muzzle=Math.max(0,this.muzzle-dt);this.hitMarker=Math.max(0,this.hitMarker-dt);this.dmgFlash=Math.max(0,this.dmgFlash-dt*1.75);
    movePlayer(this.player,this.level,this.keys,dt);
    updateEnemies(this,dt);
    this.collectPickups();
  }
  collectPickups(){
    for(const p of this.level.pickups){
      if(p.used||distance(this.player,p)>.64)continue;
      p.used=true;sound('pickup');
      if(p.type==='key'){
        this.player.hasKey=true;completeTask(this,'key');this.notice('CHAVE DIGITAL COLETADA');
      }else if(p.type==='backup'){
        const amount=Math.round(32*this.difficulty.recovery);
        this.health=Math.min(100,this.health+amount);this.score+=50;
        this.notice(`BACKUP RESTAURADO! +${amount} DE INTEGRIDADE`);
      }else if(p.type==='shield'){
        this.shieldUntil=this.elapsed+14;this.score+=50;this.notice('FIREWALL PESSOAL: 14 SEGUNDOS DE PROTEÇÃO');
      }else if(p.type==='update'){
        this.health=Math.min(100,this.health+Math.round(18*this.difficulty.recovery));
        this.score+=80;
        if(this.levelIndex===2)completeTask(this,'update');
        this.notice('PACOTE DE ATUALIZAÇÃO INSTALADO');
      }else if(p.type==='archive'){
        completeTask(this,'archive');this.notice('ARQUIVO CRÍTICO RECUPERADO!');
      }
    }
  }
  nearestInteraction(){
    const options=[];
    for(const d of this.level.doors){
      if(!this.level.openDoors.has(`${d.ix},${d.iy}`))options.push({...d,kind:'door',label:'ABRIR PORTA DIGITAL'});
    }
    for(const t of this.level.terminals)if(!t.used)options.push({...t,kind:'terminal',label:'ACESSAR TERMINAL'});
    if(this.level.firewall&&!this.level.firewall.used)options.push({...this.level.firewall,kind:'firewall',label:'ATIVAR FIREWALL'});
    options.push({...this.level.exit,kind:'exit',label:this.level.exit.type==='core'?'RESTAURAR NÚCLEO':'ACESSAR PRÓXIMO SETOR'});
    const close=options.filter(o=>distance(this.player,o)<1.42).sort((a,b)=>distance(this.player,a)-distance(this.player,b));
    return close[0]||null;
  }
  interact(){
    if(this.status!=='playing')return;
    const target=this.nearestInteraction();
    if(!target){this.notice('NENHUM DISPOSITIVO AO ALCANCE');return;}
    if(target.kind==='door'){
      if(!this.player.hasKey){this.notice('PORTA BLOQUEADA. ENCONTRE A CHAVE DIGITAL.');sound('error');return;}
      this.level.openDoors.add(`${target.ix},${target.iy}`);sound('success');
      this.notice('ACESSO AUTORIZADO. PORTA LIBERADA.');
      if(this.level.openDoors.size===this.level.doors.length)completeTask(this,'doors');
    }else if(target.kind==='terminal'){
      const terminal=this.level.terminals.find(t=>t.id===target.id);
      if(!terminal)return;
      const question=nextQuestion(this);
      if(!question){terminal.used=true;this.notice('TODAS AS QUESTÕES FORAM RESPONDIDAS');return;}
      this.status='quiz';this.activeTerminal=terminal;this.currentQuestion=question;this.keys.clear();this.onQuiz?.(question);
    }else if(target.kind==='firewall'){
      this.level.firewall.used=true;this.shieldUntil=this.elapsed+20;
      completeTask(this,'firewall');sound('success');this.notice('FIREWALL ATIVADO. PROTEÇÃO REFORÇADA.');
    }else if(target.kind==='exit'){
      if(!canExit(this)){sound('error');this.notice('ACESSO NEGADO: CONCLUA OS OBJETIVOS PENDENTES.');return;}
      const key=this.levelIndex===2?'core':'exit';completeTask(this,key);
      this.level.exited=true;
      this.score+=CONFIG.POINTS.phase;
      if(this.levelIndex===2){this.win();}
      else{
        this.completedObjectives+=Object.values(this.level.tasks).filter(Boolean).length;
        this.health=Math.min(100,this.health+20);
        this.openLevel(this.levelIndex+1);sound('success');this.notice('SETOR RESTAURADO! +500 PONTOS. PRÓXIMA MISSÃO.');
      }
    }
  }
  answerQuiz(index){
    if(this.status!=='quiz'||!this.currentQuestion)return null;
    const q=this.currentQuestion;
    this.answeredQuestions.add(q.index);
    this.activeTerminal.used=true;
    this.currentQuestion=null;
    const correct=index===q.correct;
    if(correct){this.score+=CONFIG.POINTS.quiz;this.health=Math.min(100,this.health+5);sound('success');}
    else sound('error');
    return{correct,answer:q.a[q.correct],why:q.why};
  }
  closeQuiz(){if(this.status==='quiz'){this.status='playing';this.activeTerminal=null;}}
  pause(){if(this.status==='playing'){this.status='paused';this.keys.clear();return true;}return false;}
  resume(){if(this.status==='paused'){this.status='playing';this.keys.clear();}}
  fire(){shoot(this);}
  takeDamage(amount){
    if(this.status!=='playing'||this.elapsed-this.lastDamage<.43)return;
    this.lastDamage=this.elapsed;
    const isShielded=this.shieldUntil>this.elapsed;
    const actual=Math.max(1,Math.ceil(amount*(isShielded?.28:1)));
    this.health=Math.max(0,this.health-actual);this.dmgFlash=.65;
    sound('damage');
    if(this.health<=0)this.lose();
  }
  onAllClear(){completeTask(this,'clear');}
  onBossDead(){completeTask(this,'boss');this.notice('RANSOMWARE DESTRUÍDO! ALCANCE O NÚCLEO.');}
  win(){this.finish(true);}
  lose(){this.finish(false);}
  finish(won){
    if(this.resultSaved)return;
    this.resultSaved=true;this.status='ended';this.keys.clear();this.won=won;
    if(won)this.score+=Math.round(this.health*5);
    this.onEnd?.({id:this.id,nick:this.nick,difficulty:this.difficultyName,score:this.score,time:this.elapsed,kills:this.kills,health:this.health,won,completed:totalCompleted(this)});
  }
}
