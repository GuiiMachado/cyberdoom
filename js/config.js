export const CONFIG = Object.freeze({
  FOV: Math.PI / 2.75,
  MAX_DISTANCE: 26,
  PLAYER_SPEED: 2.65,
  PLAYER_RADIUS: 0.22,
  MOUSE_SENSITIVITY: 0.0025,
  SHOT_COOLDOWN: 0.29,
  SHOT_DAMAGE: 35,
  ADMIN_PIN: '2468', // Altere antes da feira. PIN local é apenas barreira de conveniência.
  DEFAULT_SETTINGS: Object.freeze({ mouseSensitivity:1, musicTrack:'tense1', musicVolume:.45, sfxVolume:.75 }),
  DIFFICULTIES: {
    easy: { label:'Fácil', hp:0.85, speed:0.95, damage:0.9, recovery:1.35, extras:4 },
    medium: { label:'Médio', hp:1.15, speed:1.18, damage:1.15, recovery:1, extras:7 },
    hard: { label:'Difícil', hp:1.65, speed:1.42, damage:1.55, recovery:0.72, extras:10 }
  },
  POINTS: { virus:100, trojan:200, worm:150, ransomware:1000, quiz:150, objective:200, phase:500 }
});

export const WEAPONS = Object.freeze({
  deagle:{key:'deagle',name:'DESERT EAGLE',damage:56,pellets:1,spread:.008,cooldown:.38,range:14,sound:'shotDeagle',hud:'DESERT EAGLE'},
  disruptor:{key:'disruptor',name:'DISRUPTOR',damage:112,pellets:1,spread:.004,cooldown:.5,range:16,sound:'shotDeagle',hud:'DISRUPTOR',ammo:10},
  mp40:{key:'mp40',name:'MP40',damage:18,pellets:1,spread:.018,cooldown:.10,range:13,sound:'shotMP40',hud:'MP40'},
  ak47:{key:'ak47',name:'AK-47',damage:32,pellets:1,spread:.014,cooldown:.145,range:15,sound:'shotAK47',hud:'AK-47'}
});

export const MUSIC_TRACKS = Object.freeze({
  none:{label:'Sem música'},
  tense1:{label:'Tensão baixa'},
  tense2:{label:'Tensão média'},
  tense3:{label:'Tensão máxima'}
});

export const ENEMY_TYPES = Object.freeze({
  virus:{hp:84,speed:1.25,damage:11,range:.9,points:100,color:'#fd5767',size:.78,name:'VÍRUS'},
  trojan:{hp:175,speed:.88,damage:19,range:1.02,points:200,color:'#b98bff',size:1.02,name:'TROIANO'},
  worm:{hp:58,speed:1.92,damage:9,range:.82,points:150,color:'#e2fa62',size:.68,name:'WORM'},
  ransomware:{hp:540,speed:.92,damage:23,range:6.2,points:1000,color:'#ff356b',size:1.58,name:'RANSOMWARE'}
});
