import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CampaignEngine,newProgress} from '../src/campaign/engine.ts';
import {adaptChapterToOperation,OPERATION_ID,OPERATION_TITLE} from '../src/campaign/operation.ts';
import type {Chapter,Command,Snapshot,Stage} from '../src/campaign/types.ts';
const command=(op:string,...args:(string|number)[]):Command=>({op,args,line:0});
const route=['m7_smithers_race1','m7_smithers_race2','m7_smithers_race3','m7_smithers_race5','m7_smithers_race6','m7_smithers_race7','m7_smithers_race9'];
const locators=Object.fromEntries(route.map((name,i)=>[name,{name,position:[i*10,0,0] as [number,number,number],kind:0,source:'test'}]));
const extra:Stage={index:0,args:[],commands:[],objective:{type:'timer',mode:''},conditions:[],checkpoint:false};
const chapter:Chapter={id:1,initial:[command('AddNPCCharacterBonusMission','other')],schedule:[],missions:[{id:'old',level:1,title:'Old',setup:[],stages:[extra],intro:null,load:[],introLoad:[],transition:false,optional:false,source:'test'},{id:'side',level:1,title:'Side',setup:[],stages:[extra],intro:null,load:[],introLoad:[],transition:false,optional:true,source:'test'}],locators,interiors:[]};
const snapshot=(position:[number,number,number]=[0,0,0]):Snapshot=>({position,onFoot:false,vehicle:'famil_v',health:1,interior:null,entities:{}});
function next(engine:CampaignEngine){engine.tick(.21,snapshot());engine.drain();if(engine.status==='loading')engine.ready();}
test('Springfield Offline replaces all missions with one five-stage mission and finishes through its quizzes',()=>{
 const adapted=adaptChapterToOperation(chapter);assert.equal(adapted.missions.length,1);assert.equal(adapted.missions[0].id,OPERATION_ID);assert.equal(adapted.missions[0].title,OPERATION_TITLE);assert.equal(adapted.missions[0].stages.length,5);assert.equal(adapted.initial.some(c=>c.op==='AddNPCCharacterBonusMission'),false);
 const engine=new CampaignEngine(adapted,newProgress());engine.start(OPERATION_ID);engine.drain();engine.ready();
 for(let i=0;i<route.length;i++)engine.tick(.01,snapshot([i*10,0,0]));assert.equal(engine.status,'between-stages');assert.equal(engine.progress.operationComponents,7);next(engine);
 for(let stage=1;stage<5;stage++){const questions=engine.stage.quiz!;assert.equal(engine.objective,'quiz');for(const q of questions){const wrong=(q.answer+1)%q.choices.length;assert.equal(engine.answerQuestion(wrong).correct,false);assert.match(engine.quizFeedback,/Tente novamente/);assert.equal(engine.answerQuestion(q.answer).correct,true);}if(stage<4)next(engine);}
 engine.tick(.21,snapshot());assert.equal(engine.status,'mission-complete');engine.tick(3.1,snapshot());assert.equal(engine.status,'complete');assert.equal(engine.progress.finished,true);assert.equal(engine.progress.operationCorrect,12);assert.equal(engine.progress.operationScore,3100);
});
