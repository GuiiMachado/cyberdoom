"""Testes automatizados reais em Chromium. Execute: python tests/test_browser.py (servidor local em :8765)."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

URL='http://127.0.0.1:8765'
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        context=await browser.new_context(viewport={'width':1366,'height':768},permissions=[])
        page=await context.new_page()
        errors=[]
        page.on('pageerror',lambda err: errors.append(str(err)))
        await page.goto(URL)
        await page.wait_for_timeout(400)
        assert await page.locator('#menu').is_visible(),'Menu inicial'
        await page.locator('#btn-play').click()
        assert await page.locator('#setup').is_visible(),'Preparação da missão'
        await page.locator('#btn-start').click()
        assert '3 a 12' in await page.locator('#setup-error').inner_text(),'Apelido inválido bloqueado'
        await page.locator('#nickname').fill('SENAI_01')
        await page.locator('#difficulty').select_option('easy')
        await page.locator('#btn-start').click()
        await page.wait_for_timeout(650)
        assert await page.locator('#game-screen').is_visible(),'Canvas jogável'
        assert await page.locator('#health-number').inner_text()=='100%','HUD inicial'
        await page.screenshot(path=str(Path(__file__).with_name('tela-jogo.png')))
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(160)
        assert await page.locator('#pause').is_visible(),'ESC pausa'
        await page.locator('#btn-exit-game').click()
        assert await page.locator('#menu').is_visible(),'Voltar ao menu'
        # Validar regras reais importando os mesmos módulos utilizados no navegador.
        result=await page.evaluate('''async () => {
          const {Game}=await import('./js/game.js');
          const {CONFIG}=await import('./js/config.js');
          const {canStand}=await import('./js/levels.js');
          const {saveScore,topScores,clearScores,validNickname}=await import('./js/leaderboard.js');
          const {QUESTIONS}=await import('./js/quiz.js');
          const assert=(c,m)=>{if(!c)throw new Error(m)};
          assert(QUESTIONS.length>=15,'Quantidade de perguntas');
          assert(QUESTIONS.every(q=>q.a.length===4&&q.correct>=0&&q.correct<4&&q.why),'Questões válidas');
          assert(validNickname('Ab_123')&&!validNickname('a')&&!validNickname('a b')&&!validNickname('<script>'),'Regras do apelido');
          clearScores();
          let ended=null;
          const g=new Game({onEnd:r=>ended=r,onQuiz:()=>{},onNotice:()=>{},onLevel:()=>{}});
          g.start('TESTE_01','easy');
          assert(g.level.enemies.every(e=>e.hp>0),'Inimigos iniciam com HP');
          assert(!canStand(g.level,8.5,7.5),'Colisão com parede');
          assert(!canStand(g.level,8.5,8.5),'Porta começa fechada');
          const hpEasy=g.level.enemies[0].maxHp;
          g.start('TESTE_01','hard');
          assert(g.level.enemies[0].maxHp>hpEasy,'Dificuldade altera inimigos');
          assert(g.level.enemies.length>5,'Difícil adiciona inimigos');
          g.start('TESTE_01','easy');
          g.player.x=4.5;g.player.y=12.5;g.collectPickups();
          assert(g.player.hasKey&&g.level.tasks.key,'Chave coletada');
          for(const door of g.level.doors){g.player.x=door.x-.75;g.player.y=door.y;g.interact()}
          assert(g.level.tasks.doors,'Portas liberadas');
          assert(canStand(g.level,8.5,8.5),'Porta aberta deixa passar');
          g.player.x=21.5;g.player.y=5.5;g.collectPickups();
          assert(g.level.tasks.archive,'Arquivo coletado');
          for(const e of g.level.enemies)e.dead=true;
          g.onAllClear();
          assert(g.level.tasks.clear,'Ameaças eliminadas');
          g.player.x=22.5;g.player.y=12.5;g.interact();
          assert(g.levelIndex===1,'Avançar à fase 2');
          assert(g.score>=500,'Bônus fase');
          g.health=18;g.takeDamage(1000);
          assert(g.status==='ended'&&ended&&!ended.won,'Derrota por integridade zerada');
          const n=topScores('easy').length;
          const r=saveScore(ended);
          assert(topScores('easy').length===n&&r.position!==null,'Sem duplicação no ranking');
          assert(topScores('hard').length===0,'Dificuldades separadas');
          const g2=new Game({onEnd:r=>ended=r,onQuiz:()=>{},onNotice:()=>{},onLevel:()=>{}});
          g2.start('TESTE_02','hard');g2.openLevel(2);
          g2.level.enemies.find(e=>e.type==='ransomware').dead=true;
          g2.onBossDead();g2.level.tasks.key=true;g2.level.tasks.doors=true;g2.level.tasks.update=true;
          g2.player.x=22.5;g2.player.y=12.5;g2.interact();
          assert(g2.status==='ended'&&ended.won,'Vitória no núcleo após chefe');
          assert(topScores('hard').length===1,'Ranking difícil');
          const persisted=localStorage.getItem('cyberdoom-v1-leaderboard');
          assert(Boolean(persisted),'Persistência em LocalStorage');
          clearScores();
          return {questions:QUESTIONS.length,difficulties:Object.keys(CONFIG.DIFFICULTIES),bossVictory:true,phaseChange:true,ranking:true};
        }''')
        await page.locator('#btn-ranking').click()
        assert 'Nenhum agente' in await page.locator('#ranking-rows').inner_text(),'Ranking vazio'
        await page.screenshot(path=str(Path(__file__).with_name('tela-ranking.png')))
        print('TESTES OK:',result)
        print('ERROS JS:',errors)
        assert not errors,errors
        await browser.close()
if __name__=='__main__':asyncio.run(main())
