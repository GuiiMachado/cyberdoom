import {CONFIG,WEAPONS} from './config.js';
import {makeLevel} from './levels.js';
import {movePlayer,jumpPlayer} from './player.js';
import {initEnemies,updateEnemies,shoot} from './enemies.js';
import {completeTask,canExit,totalCompleted} from './missions.js';
import {nextQuestion} from './quiz.js';
import {sound} from './audio.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const weaponOrder=['deagle','disruptor','mp40','ak47'];
export class Game{
  constructor({onEnd,onQuiz,onNotice,onLevel,onWeapon,onUpgrade}){
    this.onEnd=onEnd;this.onQuiz=onQuiz;this.onNotice=onNotice;this.onLevel=onLevel;this.onWeapon=onWeapon;this.onUpgrade=onUpgrade;
    this.status='menu';this.keys=new Set();this.answeredQuestions=new Set();
  }
  start(nick,difficultyName){
    this.nick=nick;this.difficultyName=difficultyName;this.difficulty=CONFIG.DIFFICULTIES[difficultyName];
    this.id=`${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.health=100;this.score=0;this.kills=0;this.elapsed=0;this.levelIndex=0;
    this.completedObjectives=0;this.answeredQuestions=new Set();this.shieldUntil=0;
    this.lastDamage=-10;this.lastShot=-10;this.muzzle=0;this.hitMarker=0;this.dmgFlash=0;
    this.resultSaved=false;this.keys.clear();this.weaponKey='deagle';this.weapon=WEAPONS[this.weaponKey];this.weaponAmmo={disruptor:WEAPONS.disruptor.ammo};
    this.upgrades={rapid:false,precision:false,health:0,overdrive:0,damage:false,drain:false};this.poisonUntil=0;this.poisonTickAt=0;this.weakHitFlash=0;
    this.openLevel(0);this.status='playing';
    this.onWeapon?.(this.weaponKey,this.weapon);
    this.notice('OPERAÇÃO REDE SEGURA: INVESTIGUE A INVASÃO, CONTENHA O MALWARE E RECUPERE O SERVIDOR.');
  }
  openLevel(index){
    this.levelIndex=index;this.level=makeLevel(index,this.difficulty);
    initEnemies(this.level,this.difficulty);
    this.player={...this.level.start,angle:0,pitch:0,walkTime:0,hasKey:false,jumpHeight:0,jumpVelocity:0};
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
  selectWeaponSlot(slot){this.setWeapon(slot===1?'deagle':slot===2?'disruptor':'');}
  update(dt){
    if(this.status!=='playing')return;
    dt=Math.min(.05,dt);this.elapsed+=dt;
    this.player.elapsed=this.elapsed;
    this.muzzle=Math.max(0,this.muzzle-dt);this.hitMarker=Math.max(0,this.hitMarker-dt);this.dmgFlash=Math.max(0,this.dmgFlash-dt*1.75);
    this.weakHitFlash=Math.max(0,this.weakHitFlash-dt);
    movePlayer(this.player,this.level,this.keys,dt);
    this.updateDefenseChallenge(dt);
    updateEnemies(this,dt);
    if(this.elapsed>=this.poisonTickAt&&this.elapsed<this.poisonUntil){this.poisonTickAt=this.elapsed+1;this.takeDamage(3);}
    this.collectPickups();
  }
  jump(){if(this.status==='playing')return jumpPlayer(this.player);return false;}
  closeUpgrade(){if(this.status==='upgrade'){this.status='playing';this.onUpgrade?.(false);}}
  buyUpgrade(key){
    if(this.status!=='upgrade')return false;
    const options={health:{cost:300,label:'Reparo de emergência'},rapid:{cost:450,label:'Disparos rápidos'},precision:{cost:350,label:'Mira calibrada'},shield:{cost:250,label:'Firewall temporário'},overdrive:{cost:400,label:'Overdrive de mobilidade'},damage:{cost:600,label:'Núcleo de impacto'},drain:{cost:550,label:'Recuperação por eliminação'}};
    const item=options[key];if(!item||this.score<item.cost)return false;
    if(key==='health'&&this.health>=100||key==='rapid'&&this.upgrades.rapid||key==='precision'&&this.upgrades.precision)return false;
    this.score-=item.cost;
    if(key==='health'){this.health=Math.min(100,this.health+30);this.upgrades.health++;}
    else if(key==='rapid')this.upgrades.rapid=true;
    else if(key==='precision')this.upgrades.precision=true;
    else if(key==='shield')this.shieldUntil=Math.max(this.shieldUntil,this.elapsed)+16;
    else if(key==='overdrive'){this.player.speedBoostUntil=this.elapsed+18;this.upgrades.overdrive++;}
    else if(key==='damage')this.upgrades.damage=true;
    else if(key==='drain')this.upgrades.drain=true;
    this.notice(`${item.label.toUpperCase()} ADQUIRIDO`);this.onUpgrade?.(true);return true;
  }
  updateDefenseChallenge(dt){
    const challenge=this.level.defensePoint;
    if(!challenge?.active||this.level.tasks.defend)return;
    if(distance(this.player,challenge)<=1.35){
      challenge.remaining=Math.max(0,challenge.remaining-dt);
      if(challenge.remaining===0){challenge.active=false;completeTask(this,'defend');this.notice('SERVIDOR PROTEGIDO!');}
    }
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
    if(this.level.upgradePoint)options.push({...this.level.upgradePoint,kind:'upgrade',label:'ACESSAR ESTAÇÃO DE MELHORIAS'});
    if(this.level.defensePoint&&!this.level.tasks.defend)options.push({...this.level.defensePoint,kind:'defend',label:this.level.defensePoint.active?'PROTEGER SERVIDOR':'INICIAR PROTEÇÃO DO SERVIDOR'});
    if(this.level.disarmPoint&&!this.level.tasks.disarm)options.push({...this.level.disarmPoint,kind:'disarm',label:'DESARMAR NÓ DE VÍRUS'});
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
    }else if(target.kind==='defend'){
      if(!this.level.defensePoint.active){this.level.defensePoint.active=true;this.notice('PROTEJA O SERVIDOR: FIQUE PERTO POR 12 SEGUNDOS.');}
    }else if(target.kind==='disarm'){
      this.level.disarmPoint.used=true;completeTask(this,'disarm');sound('success');this.notice('NÓ DE VÍRUS DESARMADO.');
    }else if(target.kind==='upgrade'){
      this.status='upgrade';this.keys.clear();this.onUpgrade?.(true);
    }else if(target.kind==='exit'){
      if(!canExit(this)){sound('error');this.notice('ACESSO NEGADO: CONCLUA OS OBJETIVOS PENDENTES.');return;}
      const key=this.levelIndex===2?'core':'exit';completeTask(this,key);
      this.level.exited=true;
      this.score+=CONFIG.POINTS.phase;
      if(this.levelIndex===2){this.win();}
      else{
        this.completedObjectives+=Object.values(this.level.tasks).filter(Boolean).length;
        this.health=Math.min(100,this.health+20);
        this.openLevel(this.levelIndex+1);sound('success');this.notice(`ETAPA ${this.levelIndex+1}/3 INICIADA. A OPERAÇÃO DE RECUPERAÇÃO CONTINUA.`);
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
    if(correct){
      this.score+=CONFIG.POINTS.quiz;this.health=Math.min(100,this.health+5);
      this.weaponAmmo.disruptor+=10;
      this.onWeapon?.(this.weaponKey,this.weapon);
      this.notice('RESPOSTA CORRETA! +10 DISPAROS DO DISRUPTOR');
      sound('success');
    }
    else sound('error');
    return{correct,answer:q.a[q.correct],why:q.why,hint:q.hint};
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
