import {CONFIG,WEAPONS,MUSIC_TRACKS} from './config.js';
import {Game} from './game.js';
import {Renderer} from './renderer.js';
import {formatTime,validNickname,saveScore,topScores,clearScores} from './leaderboard.js';
import {readStorage,writeStorage} from './storage.js';
import {setAudioSettings,setMusicTrack,previewMusic} from './audio.js';
const $=id=>document.getElementById(id);
const screens=['menu','setup','game-screen','ranking','help','about','result'];
const SETTINGS_KEY='settings';
let currentScreen='menu',toastDeadline=0,lastFrame=0,lastHud=0;
const canvas=$('game-canvas'),renderer=new Renderer(canvas,$('minimap'));
let game;
let settings=readStorage(SETTINGS_KEY,CONFIG.DEFAULT_SETTINGS);
settings={...CONFIG.DEFAULT_SETTINGS,...settings};
function saveSettings(){writeStorage(SETTINGS_KEY,settings);}
function refreshPreviewText(){ $('menu-music-preview').textContent=`Trilha atual: ${MUSIC_TRACKS[settings.musicTrack]?.label||'Personalizada'} • Música ${Math.round(settings.musicVolume*100)}% • Efeitos ${Math.round(settings.sfxVolume*100)}%`; }
function bindSettingsToInputs(){
  $('mouse-sense').value=String(settings.mouseSensitivity);
  $('music-track').value=settings.musicTrack;
  $('music-volume').value=String(settings.musicVolume);
  $('sfx-volume').value=String(settings.sfxVolume);
  $('mouse-sense-value').textContent=`${Number(settings.mouseSensitivity).toFixed(1)}x`;
  $('music-volume-value').textContent=`${Math.round(settings.musicVolume*100)}%`;
  $('sfx-volume-value').textContent=`${Math.round(settings.sfxVolume*100)}%`;
  refreshPreviewText();
}
function applyAudioSettings(preview=false){
  setAudioSettings({musicVolume:settings.musicVolume,sfxVolume:settings.sfxVolume});
  if(preview)previewMusic(settings.musicTrack); else setMusicTrack(settings.musicTrack);
  refreshPreviewText();
}
function showScreen(id){
  currentScreen=id;
  screens.forEach(s=>$(s).classList.toggle('hidden',s!==id));
  $('pause').classList.add('hidden');$('quiz').classList.add('hidden');
  if(document.pointerLockElement)document.exitPointerLock();
  if(id==='setup')bindSettingsToInputs();
}
function notice(message){$('toast').textContent=message;$('toast').classList.add('visible');toastDeadline=performance.now()+2700;}
function updateObjectives(){
  $('level-label').textContent=game.level.title;
  $('objectives').replaceChildren();
  for(const [key,label] of game.level.objectives){
    const item=document.createElement('div');item.className='objective'+(game.level.tasks[key]?' done':'');
    const progress=key==='defend'&&game.level.defensePoint?.active?` (${Math.ceil(game.level.defensePoint.remaining)}s)` :'';
    item.textContent=(game.level.tasks[key]?'✓ ':'□ ')+label+progress;
    $('objectives').append(item);
  }
}
function updateWeaponHud(){
  $('weapon-name').textContent=game.weapon.name;
  const ammo=Number.isFinite(game.weapon.ammo)?game.weaponAmmo[game.weaponKey]:'∞';
  $('weapon-status').innerHTML=`${game.weapon.hud} <strong>${ammo}</strong>`;
  $('weapon').dataset.weapon=game.weaponKey;
}
function onEnd(result){
  const ranking=saveScore(result);
  $('result-title').textContent=result.won?'✓ COMPUTADOR PROTEGIDO!':'✕ SISTEMA COMPROMETIDO';
  $('result-title').style.color=result.won?'var(--green)':'var(--red)';
  $('result-message').textContent=result.won?'Você eliminou o ransomware e restaurou a operação!':'Sua integridade chegou a zero. A defesa digital falhou.';
  const values=[['AGENTE',result.nick],['DIFICULDADE',CONFIG.DIFFICULTIES[result.difficulty].label],['PONTUAÇÃO',result.score.toLocaleString('pt-BR')],['TEMPO',formatTime(result.time)],['INIMIGOS ELIMINADOS',String(result.kills)],['INTEGRIDADE',`${Math.round(result.health)}%`],['OBJETIVOS',String(result.completed)],['RANKING',ranking.position?`#${ranking.position}`:'Fora do Top 10']];
  $('result-stats').replaceChildren();
  for(const [label,value] of values){const box=document.createElement('div');box.className='stat';const tag=document.createElement('span');tag.textContent=label;const strong=document.createElement('strong');strong.textContent=value;box.append(tag,strong);$('result-stats').append(box);}
  $('result-record').textContent=ranking.record?'★ NOVO RECORDE!':ranking.position?'★ VOCÊ ENTROU PARA O HALL DA FAMA!':'Continue treinando para entrar no Top 10.';
  if(!ranking.stored)$('result-record').textContent+=' (Não foi possível persistir a pontuação neste navegador.)';
  showScreen('result');
}
function onQuiz(question){
  $('quiz-topic').textContent=question.topic.toUpperCase();$('quiz-question').textContent=question.q;
  $('quiz-feedback').textContent='';$('btn-quiz-close').classList.add('hidden');
  const holder=$('quiz-options');holder.replaceChildren();
  question.a.forEach((label,i)=>{
    const btn=document.createElement('button');btn.textContent=`${'ABCD'[i]}) ${label}`;
    btn.addEventListener('click',()=>{
      const result=game.answerQuiz(i);if(!result)return;
      for(const [j,child] of [...holder.children].entries()){
        child.disabled=true;
        if(j===question.correct)child.classList.add('correct');
        else if(j===i)child.classList.add('wrong');
      }
      $('quiz-feedback').textContent=result.correct
        ?`✓ CORRETO! +150 PONTOS, +5 INTEGRIDADE E +10 MUNIÇÕES DO DISRUPTOR.\n${result.why}`
        :`✕ INCORRETO. Dica: ${result.hint}\nResposta: ${result.answer}. ${result.why}`;
      $('btn-quiz-close').classList.remove('hidden');
    });holder.append(btn);
  });
  $('quiz').classList.remove('hidden');
  if(document.pointerLockElement)document.exitPointerLock();
}
function showUpgradeShop(open){
  $('upgrade-shop').classList.toggle('hidden',!open);
  if(!open)return;
  $('upgrade-score').textContent=game.score.toLocaleString('pt-BR');
  for(const button of $('upgrade-shop').querySelectorAll('[data-upgrade]')){
    const key=button.dataset.upgrade;
    button.disabled=game.score<{health:300,rapid:450,precision:350,shield:250,overdrive:400,damage:600,drain:550}[key]
      ||key==='health'&&game.health>=100
      ||key==='rapid'&&game.upgrades.rapid
      ||key==='precision'&&game.upgrades.precision
      ||key==='damage'&&game.upgrades.damage
      ||key==='drain'&&game.upgrades.drain;
  }
  if(document.pointerLockElement)document.exitPointerLock();
}
function renderRanking(){
  const records=topScores($('rank-difficulty').value),body=$('ranking-rows');body.replaceChildren();
  if(!records.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='Nenhum agente no ranking desta dificuldade. Seja o primeiro!';tr.append(td);body.append(tr);return;}
  records.forEach((record,i)=>{
    const tr=document.createElement('tr');
    [String(i+1),record.nick,record.score.toLocaleString('pt-BR'),formatTime(record.time),String(record.kills),record.won?'VITÓRIA':'DERROTA'].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});body.append(tr);
  });
}
function openRanking(){if(game?.difficultyName)$('rank-difficulty').value=game.difficultyName;renderRanking();showScreen('ranking');}
function startNew(){game.status='menu';$('nickname').value='';$('setup-error').textContent='';showScreen('setup');$('nickname').focus();applyAudioSettings(true);}
function launch(){
  const name=$('nickname').value.trim();
  if(!validNickname(name)){$('setup-error').textContent='Use 3 a 12 caracteres: letras (sem acentos), números e _.';$('nickname').focus();return;}
  saveSettings();applyAudioSettings(false);
  game.start(name,$('difficulty').value);showScreen('game-screen');lastFrame=performance.now();updateWeaponHud();
  canvas.requestPointerLock?.();
}
function resume(){game.resume();$('pause').classList.add('hidden');canvas.requestPointerLock?.();}
function pause(){if(game.pause()){$('pause').classList.remove('hidden');if(document.pointerLockElement)document.exitPointerLock();}}
function updateHud(){
  if(!game.level)return;
  $('health-fill').style.width=`${game.health}%`;
  $('health-number').textContent=`${Math.ceil(game.health)}%`;
  $('score').textContent=String(game.score).padStart(6,'0');
  $('timer').textContent=formatTime(game.elapsed);$('kills').textContent=String(game.kills);
  $('shield').textContent=game.shieldUntil>game.elapsed?`${Math.ceil(game.shieldUntil-game.elapsed)}s`:'OFF';
  $('damage-flash').style.opacity=String(Math.min(.24,game.dmgFlash*.3));
  $('boss-box').classList.toggle('hidden',game.levelIndex!==2||!game.level.enemies.some(e=>e.type==='ransomware'&&!e.dead));
  const boss=game.level.enemies.find(e=>e.type==='ransomware');if(boss)$('boss-fill').style.width=`${Math.max(0,boss.hp/boss.maxHp*100)}%`;
  const near=game.nearestInteraction();$('interaction-hint').classList.toggle('hidden',!near||game.status!=='playing');
  if(near)$('interaction-hint').textContent=`[ E ] ${near.label}`;
  updateObjectives();
  updateWeaponHud();
}
function loop(timestamp){
  const dt=lastFrame?Math.min(.05,(timestamp-lastFrame)/1000):0;lastFrame=timestamp;
  if(game.status==='playing')game.update(dt);
  if(currentScreen==='game-screen'&&game.level){
    renderer.draw(game);
    if(timestamp-lastHud>85){updateHud();lastHud=timestamp;}
  }
  if(timestamp>toastDeadline)$('toast').classList.remove('visible');
  requestAnimationFrame(loop);
}
game=new Game({onEnd,onQuiz,onNotice:notice,onLevel:()=>{},onWeapon:updateWeaponHud,onUpgrade:showUpgradeShop});
bindSettingsToInputs();applyAudioSettings(false);
$('btn-play').addEventListener('click',startNew);
$('btn-audio-setup').addEventListener('click',()=>{showScreen('setup');applyAudioSettings(true);});
$('btn-start').addEventListener('click',launch);
$('nickname').addEventListener('keydown',e=>{if(e.code==='Enter')launch();});
$('btn-ranking').addEventListener('click',openRanking);
$('btn-result-ranking').addEventListener('click',openRanking);
$('btn-help').addEventListener('click',()=>showScreen('help'));
$('btn-about').addEventListener('click',()=>showScreen('about'));
$('btn-again').addEventListener('click',startNew);
for(const b of document.querySelectorAll('.back-menu'))b.addEventListener('click',()=>{game.status='menu';showScreen('menu');applyAudioSettings(false);});
$('rank-difficulty').addEventListener('change',renderRanking);
$('btn-admin').addEventListener('click',()=>{
  const pin=window.prompt('PIN do administrador (configurado em js/config.js):');
  if(pin===null)return;
  if(pin!==CONFIG.ADMIN_PIN){window.alert('PIN incorreto.');return;}
  if(window.confirm('ATENÇÃO: apagar TODOS os rankings locais de forma permanente?')){
    if(clearScores()){renderRanking();window.alert('Ranking local apagado.');}
    else window.alert('Não foi possível apagar os dados locais.');
  }
});
$('btn-pause').addEventListener('click',pause);
$('btn-resume').addEventListener('click',resume);
$('btn-upgrade-close').addEventListener('click',()=>{game.closeUpgrade();canvas.requestPointerLock?.();});
$('upgrade-shop').querySelectorAll('[data-upgrade]').forEach(button=>button.addEventListener('click',()=>game.buyUpgrade(button.dataset.upgrade)));
$('btn-exit-game').addEventListener('click',()=>{game.status='menu';showScreen('menu');applyAudioSettings(false);});
$('btn-quiz-close').addEventListener('click',()=>{game.closeQuiz();$('quiz').classList.add('hidden');canvas.requestPointerLock?.();});
canvas.addEventListener('click',()=>{if(game.status==='playing'){if(!document.pointerLockElement)canvas.requestPointerLock?.();game.fire();}});
document.addEventListener('mousemove',e=>{
  if(game.status!=='playing'||document.pointerLockElement!==canvas)return;
  const sensitivity=CONFIG.MOUSE_SENSITIVITY*Number(settings.mouseSensitivity||1);
  game.player.angle+=e.movementX*sensitivity;
  game.player.pitch=Math.max(-.55,Math.min(.55,game.player.pitch-e.movementY*sensitivity));
});
for(const [inputId,valId,formatter,key] of [
  ['mouse-sense','mouse-sense-value',v=>`${Number(v).toFixed(1)}x`,'mouseSensitivity'],
  ['music-volume','music-volume-value',v=>`${Math.round(Number(v)*100)}%`,'musicVolume'],
  ['sfx-volume','sfx-volume-value',v=>`${Math.round(Number(v)*100)}%`,'sfxVolume']
]){
  $(inputId).addEventListener('input',e=>{settings[key]=Number(e.target.value);$(valId).textContent=formatter(e.target.value);saveSettings();if(key!=='mouseSensitivity')applyAudioSettings(true);});
}
$('music-track').addEventListener('change',e=>{settings.musicTrack=e.target.value;saveSettings();applyAudioSettings(true);});
document.addEventListener('pointerlockchange',()=>{
  if(document.pointerLockElement!==canvas&&game.status==='playing'&&currentScreen==='game-screen')pause();
});
document.addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)&&game.status==='playing')e.preventDefault();
  if(e.code==='Escape'){
    if(game.status==='upgrade'){game.closeUpgrade();canvas.requestPointerLock?.();return;}
    if(game.status==='playing')pause();
    else if(game.status==='paused')resume();
    return;
  }
  if(game.status==='playing'){
    game.keys.add(e.code);
    if(e.code==='KeyE'&&!e.repeat)game.interact();
    if(e.code==='Space'&&!e.repeat)game.jump();
    if(e.code==='KeyQ'&&!e.repeat)game.cycleWeapon();
    if(e.code==='Digit1'&&!e.repeat)game.selectWeaponSlot(1);
    if(e.code==='Digit2'&&!e.repeat)game.selectWeaponSlot(2);
    if(e.code==='Digit3'&&!e.repeat)game.setWeapon('ak47');
  }else if(game.status==='ended'&&e.code==='KeyR')startNew();
});
document.addEventListener('keyup',e=>game.keys.delete(e.code));
window.addEventListener('blur',()=>{if(game.status==='playing')pause();});
requestAnimationFrame(loop);
