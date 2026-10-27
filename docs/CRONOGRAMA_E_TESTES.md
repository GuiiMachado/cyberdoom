# CYBER DOOM — divisão do grupo, cronograma de 10 dias e plano de testes

## Divisão para cinco integrantes

| Pessoa/função | Responsabilidade | Arquivos principais | Entrega verificável |
|---|---|---|---|
| 1. Motor 3D | Raycasting, minimapa, desempenho, câmera | `renderer.js`, `player.js` | FPS navegável sem atravessar paredes |
| 2. Inimigos e combate | Perseguição, dano, tiros, chefe | `enemies.js`, `config.js` | Inimigos podem atacar e morrer |
| 3. Ranking | Pontos, persistência, validações, administração | `leaderboard.js`, `storage.js`, `game.js` | Top 10 persiste após reiniciar navegador |
| 4. UI e efeitos | Telas, HUD, responsividade, áudio | `index.html`, `style.css`, `audio.js`, `main.js` | Menus e transições funcionam |
| 5. Conteúdo e qualidade | Terminais, perguntas, testes, documentação e feira | `quiz.js`, `missions.js`, `docs`, `tests` | 24 perguntas, checklist, slides e roteiro |

Caso exista sexta pessoa, ela pode assumir integração e controle de versão (Git), backups e testes de compatibilidade. Combine alterações entre os responsáveis antes de editar o mesmo arquivo. Reunião diária de 10 minutos para compartilhar progresso.

## Cronograma de 10 dias

| Dia | Atividade | Entrega concreta |
|---|---|---|
| 1 | Abrir projeto, testar no laboratório, identificar bugs | Menu, fase 1 e controles funcionando no PC escolhido |
| 2 | Refino de movimento, colisão e raycasting | Câmera fluida; portas não podem ser atravessadas fechadas |
| 3 | Inimigos e tiro | Vírus, worm, troiano e pontuação testados |
| 4 | Integridade, dano, backups, escudos | Barra de vida, cura e proteção validadas |
| 5 | Dificuldades e ranking | Três níveis com diferenças; dez recordes por dificuldade |
| 6 | Missões e fase 2 | Chave, portas, firewall e conclusão da segunda fase |
| 7 | Chefe e fase 3 | Batalha com ransomware; telas de vitória e derrota |
| 8 | Perguntas educativas e interface | Perguntas corretas; menus sem travamentos |
| 9 | Testes em computadores do SENAI e correções | Checklist marcado; problemas críticos resolvidos |
| 10 | Ensaio da feira e backup | Apresentação de 8–10 min, cópias e demonstração pronta |

O projeto foi entregue com uma primeira versão já desenvolvida, então o cronograma é voltado a **verificação e refinamento** antes da feira.

## Checklist de 20 testes manuais obrigatórios

Marque após executar **no computador que será usado na feira**. Estes itens são um plano de validação, não resultados já garantidos.

- [ ] **01. Abre:** com Live Server, menu inicial aparece sem erros vermelhos no Console (F12).
- [ ] **02. Movimento:** W/A/S/D andam; mouse gira; Shift aumenta velocidade.
- [ ] **03. Colisão:** correr na parede não permite atravessá-la; porta fechada bloqueia.
- [ ] **04. Disparo:** clique esquerdo ou Espaço apresenta pulso visual e sonoro.
- [ ] **05. Acerto:** a vida de um inimigo cai ao disparar com a mira sobre ele sem parede no caminho.
- [ ] **06. Pontuação:** ao derrotar um vírus, total cresce 100 pontos; outros tipos usam seus valores.
- [ ] **07. Dano:** aproximação do inimigo causa dano e reduz a barra de integridade.
- [ ] **08. Recuperação:** ao passar sobre um backup azul, integridade aumenta até no máximo 100%.
- [ ] **09. Dificuldades:** vida e velocidade de um inimigo, dano causado e quantidade variam entre Fácil e Difícil.
- [ ] **10. Derrota:** ao receber dano até chegar a zero, aparece tela de sistema comprometido.
- [ ] **11. Vitória:** cumpra todos objetivos nas 3 fases, derrote o ransomware e interaja com o núcleo.
- [ ] **12. Ranking:** após terminar, confira pontuação, apelido e tempo no Hall da Fama.
- [ ] **13. Persistência:** feche a aba, abra o mesmo endereço e confira o mesmo ranking.
- [ ] **14. Separação:** resultados em Fácil não aparecem quando ranking está filtrado em Difícil.
- [ ] **15. Único registro:** uma partida finalizada não aparece duas vezes por navegar nos menus.
- [ ] **16. Apelido:** vazios, `ab`, espaços ou símbolos proibidos impedem início; `AGENTE_01` é aceito.
- [ ] **17. Ranking vazio:** apague dados locais e confira mensagem “Nenhum agente...”.
- [ ] **18. Próximo visitante:** termine partida; clique “Novo Jogador”; novo apelido inicia pontuação zerada.
- [ ] **19. Desempenho:** rode em 1366×768 e 1920×1080; observe fluidez e uso de CPU no PC real.
- [ ] **20. Console:** durante partida normal, verifique que não surgem erros críticos no DevTools.

## Testes técnicos desta entrega

Executado com Node.js v22:

```bash
npm test
```

Resultado observado: **12 grupos de testes de lógica passaram**, cobrindo estrutura dos mapas, validação de apelidos, perguntas, dificuldades, movimento/colisão, portas e itens, saída bloqueada, combate, dano, quiz, vitória e derrota/ranking. A sintaxe dos scripts JavaScript também foi verificada com `node --check`.

O script adicional `tests/test_browser.py` pode ser usado com **Python + Playwright + Chromium** no computador que permite navegação automatizada para `http://127.0.0.1:8765`. Requer iniciar `python -m http.server 8765` na pasta do jogo e instalar Playwright no ambiente de testes, se necessário. **Não integra as dependências necessárias para jogar.** A tentativa de executá-lo no ambiente da criação recebeu bloqueio de navegação `ERR_BLOCKED_BY_ADMINISTRATOR`; por isso não foi declarado como aprovado.

## Procedimento antes de abrir a feira

1. Escolha um computador oficial do ranking e teste armazenamento permanente.
2. Copie a pasta original para outro pendrive para contingência.
3. Desative suspensão automática do PC durante a feira, conforme normas do laboratório.
4. Teste teclado, mouse, projetor/tela e volume.
5. Reinicie o computador, abra o jogo e confirme que ranking e configurações funcionam.
6. Faça ensaio com alguém que nunca jogou; peça para iniciar sozinho e veja se as instruções são suficientes.
7. Tenha duas pessoas disponíveis: uma apresenta e outra ajuda visitantes.

## Funcionalidades não desenvolvidas

- Modo Sobrevivência e ranking independente para esse modo.
- Controles touchscreen.
- Sincronização de ranking em rede ou banco de dados remoto.
- Antifraude real para o PIN e para o LocalStorage.
