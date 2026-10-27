let context=null;
let sfxGain=null;
let musicGain=null;
let musicTimer=null;
let currentTrack='none';
let currentSettings={musicVolume:.45,sfxVolume:.75};

function ensureAudio(){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return null;
  if(!context){
    context=new AC();
    sfxGain=context.createGain();
    musicGain=context.createGain();
    sfxGain.connect(context.destination);
    musicGain.connect(context.destination);
    applyVolumes();
  }
  if(context.state==='suspended')context.resume();
  return context;
}
function applyVolumes(){
  if(sfxGain)sfxGain.gain.value=currentSettings.sfxVolume;
  if(musicGain)musicGain.gain.value=currentSettings.musicVolume;
}
function tone({freq=220,endFreq=freq,duration=.25,wave='sine',volume=.1,when=0,destination=sfxGain,pan=0,attack=.01,release=.02}){
  const ctx=ensureAudio(); if(!ctx||!destination)return;
  const now=ctx.currentTime+when;
  const osc=ctx.createOscillator();
  const amp=ctx.createGain();
  const panner=ctx.createStereoPanner?.()||null;
  osc.type=wave;
  osc.frequency.setValueAtTime(Math.max(1,freq),now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),now+duration);
  amp.gain.setValueAtTime(0.0001,now);
  amp.gain.linearRampToValueAtTime(volume,now+attack);
  amp.gain.exponentialRampToValueAtTime(0.0001,now+duration+release);
  osc.connect(amp);
  if(panner){panner.pan.value=pan;amp.connect(panner);panner.connect(destination);} else amp.connect(destination);
  osc.start(now);
  osc.stop(now+duration+release+.02);
}

export function setAudioSettings(settings={}){
  currentSettings={...currentSettings,...settings};
  ensureAudio();
  applyVolumes();
}

function scheduleTrack(track){
  const ctx=ensureAudio(); if(!ctx)return;
  if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
  if(track==='none')return;
  const patterns={
    tense1:{tick:740,bass:[82,98,110,98],pulse:[220,247,233,196],accent:[330,392,349,392]},
    tense2:{tick:560,bass:[73,82,98,110],pulse:[196,233,247,294],accent:[392,440,370,523]},
    tense3:{tick:420,bass:[65,82,73,98],pulse:[165,196,220,247],accent:[330,392,494,466]}
  };
  const seq=patterns[track]||patterns.tense1;
  let step=0;
  const playStep=()=>{
    const bass=seq.bass[step%seq.bass.length];
    const pulse=seq.pulse[step%seq.pulse.length];
    const accent=seq.accent[step%seq.accent.length];
    tone({freq:bass,endFreq:bass*.98,duration:.58,wave:'triangle',volume:.08,destination:musicGain,attack:.02,release:.08,pan:-.2});
    tone({freq:pulse,endFreq:pulse*1.03,duration:.22,wave:'sawtooth',volume:.045,destination:musicGain,when:.07,release:.03,pan:.2});
    tone({freq:accent,endFreq:accent*1.01,duration:.18,wave:'square',volume:track==='tense3'?.04:.028,destination:musicGain,when:.18,release:.03,pan:step%2===0?.3:-.3});
    step++;
  };
  playStep();
  musicTimer=setInterval(playStep,seq.tick);
}

export function setMusicTrack(track='none'){
  currentTrack=track;
  scheduleTrack(track);
}
export function getMusicTrack(){return currentTrack;}
export function stopMusic(){
  currentTrack='none';
  if(musicTimer){clearInterval(musicTimer);musicTimer=null;}
}
export function previewMusic(track){ setMusicTrack(track); }

export function sound(type='shotDeagle'){
  try{
    ensureAudio();
    const specs={
      shotDeagle:[180,70,.18,'square',.11],
      shotMP40:[420,180,.09,'sawtooth',.065],
      shotAK47:[260,95,.11,'square',.09],
      hit:[110,42,.14,'square',.045],
      kill:[240,65,.19,'triangle',.07],
      pickup:[390,800,.24,'sine',.08],
      error:[120,70,.18,'square',.045],
      success:[500,950,.33,'sine',.08],
      damage:[90,42,.23,'sawtooth',.11],
      swap:[520,710,.16,'triangle',.05]
    };
    const [start,end,duration,wave,volume]=specs[type]||specs.shotDeagle;
    tone({freq:start,endFreq:end,duration,wave,volume,destination:sfxGain,attack:.002,release:.03});
    if(type==='shotDeagle')tone({freq:start*.52,endFreq:end*.9,duration:duration*.8,wave:'triangle',volume:volume*.45,destination:sfxGain,when:.015,attack:.002,release:.03,pan:-.15});
    if(type==='shotMP40')tone({freq:start*.7,endFreq:end*.7,duration:duration*.65,wave:'square',volume:volume*.35,destination:sfxGain,when:.008,attack:.002,release:.02,pan:.12});
    if(type==='shotAK47')tone({freq:start*.62,endFreq:end*.8,duration:duration*.82,wave:'triangle',volume:volume*.42,destination:sfxGain,when:.01,attack:.002,release:.025,pan:.08});
  }catch{/* Áudio opcional: o jogo funciona mesmo que o navegador bloqueie som. */}
}
