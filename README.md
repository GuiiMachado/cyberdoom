# CYBER DOOM — OPERAÇÃO PC PROTEGIDO

**Elimine as ameaças. Restaure o sistema. Proteja o computador.**

Projeto original e educativo de FPS retrô para a feira de Técnico em Informática do SENAI. O jogador entra em corredores simulados em 3D (raycasting), elimina vírus, worms e troianos, interage com terminais de informática, coleta recursos de defesa e derrota o ransomware no núcleo. A primeira versão jogável inclui três fases de campanha.

## Início rápido (Windows + VS Code)

1. Extraia o ZIP em uma pasta chamada `cyber-doom`. Não copie só o `index.html`: as pastas `css` e `js` são obrigatórias.
2. Instale o **Visual Studio Code** em <https://code.visualstudio.com/> caso necessário.
3. No VS Code, vá a **Arquivo > Abrir Pasta** e escolha a pasta `cyber-doom`.
4. Clique em **Extensões** (atalho `Ctrl+Shift+X`), pesquise **Live Server** (por Ritwick Dey) e instale. A instalação inicial da extensão pode exigir internet; as partidas não exigem internet.
5. No explorador do VS Code, clique com o botão direito em `index.html` e escolha **Open with Live Server**. Alternativa: botão **Go Live** no rodapé.
6. O navegador abre um endereço como `http://127.0.0.1:5500/`. Clique em **Iniciar missão**, informe apelido com 3 a 12 letras/números/sublinhado e selecione uma dificuldade.
7. Clique no jogo para capturar o mouse; **ESC** pausa e permite acessar o menu.

**Não abra `index.html` com dois cliques diretamente**: os módulos JavaScript são servidos corretamente por um servidor HTTP local. Nenhuma API de internet é usada durante o jogo.

Alternativa sem Live Server, se o Python estiver instalado: abra um terminal na pasta e execute `python -m http.server 8000`, depois abra `http://localhost:8000/`. Para encerrar, pressione `Ctrl+C` no terminal.

## Controles

| Tecla | Ação |
|---|---|
| W/S | Avançar / recuar |
| A/D | Mover lateralmente |
| Mouse | Olhar / girar câmera |
| Clique esquerdo ou ESPAÇO | Atirar com o Disparador de Pulsos Digitais |
| E | Interagir com portas, terminais, firewall e saídas |
| Shift | Correr |
| ESC | Pausar e liberar o mouse |
| R | Na tela de resultado, preparar a próxima partida |

O minimapa fica no canto superior direito. As barras superiores mostram integridade do computador (inicia em 100%), pontuação, tempo, eliminações e proteção. O painel lateral mostra objetivos pendentes e concluídos.

## Campanha

**Fase 1 — Área de Trabalho:** ache a chave, abra ambas as portas com `E`, recupere o arquivo, elimine ameaças e ative a saída.

**Fase 2 — Memória do Sistema:** ache outra chave, abra as portas, ative o firewall e elimine ameaças antes de passar ao núcleo.

**Fase 3 — Núcleo Infectado:** pegue a chave, abra as portas, instale a atualização (ao se aproximar), derrote o ransomware e interaja com o núcleo para vencer. O ransomware executa ataques anunciados visualmente.

**Recursos:** pacotes de atualização e backups recuperam parte da integridade; escudos de firewall oferecem proteção temporária e reduzem dano; perguntas educativas fornecem pontos e uma pequena cura se respondidas corretamente. Apenas a primeira resposta de cada terminal vale pontuação.

**Dificuldades:** Fácil, Médio e Difícil alteram de verdade a vida e velocidade dos inimigos, dano causado, quantidade de inimigos e recuperação com itens.

## Pontuação

| Evento | Pontos |
|---|---:|
| Vírus | 100 |
| Worm | 150 |
| Troiano | 200 |
| Chefe ransomware | 1.000 |
| Questão correta | 150 |
| Objetivo secundário concluído | 200 |
| Fase terminada | 500 |
| Backup ou escudo coletado | 50 |
| Atualização coletada | 80 |
| Bônus de vitória | 5 × integridade restante |

Os itens e as missões podem conceder pontos cumulativos por motivos diferentes. Apenas eliminações de inimigos vivos rendem seus pontos. Resultados empatados seguem maior pontuação, vitória antes de derrota, menor tempo e maior integridade.

## Ranking local e administração

O **Hall da Fama** mostra até 10 resultados por dificuldade, com apelido, pontuação, tempo, eliminações e vitória/derrota. Os registros são gravados com a Web Storage API (**LocalStorage**) do navegador. Permanecem após fechar e reabrir o navegador, desde que os dados do site não sejam apagados.

- O ranking pertence ao **navegador, perfil, computador e origem HTTP local** em que foi criado. Trocar `localhost` por `127.0.0.1` ou a porta pode criar outro armazenamento independente.
- Não há sincronização entre computadores. Não use navegação anônima ou a opção "apagar dados do site" no computador da feira.
- Quem tiver acesso ao navegador pode alterar os dados locais. O PIN administrativo é uma conveniência, **não uma proteção criptográfica**.
- Na tela de ranking, clique em **Administrar ranking**, informe o PIN definido em `js/config.js` (valor inicial `2468`) e confirme para remover os registros.
- Antes de usar na feira, altere `ADMIN_PIN` para o código do grupo e faça backup manual do perfil do navegador ou exporte os dados por procedimentos próprios do laboratório caso a preservação dos recordes seja essencial.

## Organização dos arquivos

```text
cyber-doom/
├── index.html                Entrada e telas da interface
├── css/style.css             Estilo, HUD e menus responsivos
├── js/main.js                Navegação de telas e eventos
├── js/game.js                Estado, integridade, fases e interação
├── js/renderer.js            Raycasting e desenho de sprites no Canvas
├── js/player.js              Controles, movimento e colisões
├── js/enemies.js             IA, perseguição, combate e tiros
├── js/weapons.js             (Não existe: tiros centralizados em enemies.js)
├── js/levels.js              Três mapas e barreiras
├── js/missions.js            Tarefas e objetivos
├── js/leaderboard.js         Ranking e ordenação
├── js/quiz.js                24 questões de informática
├── js/audio.js               Sons gerados em tempo real
├── js/storage.js             Leitura e gravação LocalStorage
├── js/config.js              Dificuldade, armas e pontuação
├── assets/README.md          Origem dos recursos
├── tests/test_logic.mjs      Testes automatizados sem dependências
├── tests/test_browser.py     Roteiro automatizado opcional de navegador
├── docs/GUIA_VS_CODE.md      Tutorial detalhado
├── docs/CRONOGRAMA_E_TESTES.md
└── docs/APRESENTACAO_FEIRA.md
```

`weapons.js` não foi criado porque a mecânica de tiro e a seleção do alvo estão intencionalmente reunidas em `enemies.js`; isso evita um módulo de fachada. `package.json` permite executar testes opcionais, mas o jogo **não precisa do Node.js nem de pacotes npm** para rodar.

## Testes executados nesta entrega

- **Executados:** verificação sintática dos 12 módulos JavaScript com `node --check`; **12 testes automatizados de lógica passaram com Node.js v22** (mapas, colisão, dificuldades, combate, integridade, chaves, objetivos, quiz, fases, vitória, derrota e ranking).
- **Não executados com êxito aqui:** os testes E2E com Chromium/Playwright, pois o navegador automatizado retornou `ERR_BLOCKED_BY_ADMINISTRATOR` ao tentar navegar para o servidor local. Isso é uma restrição do ambiente de testes e **não comprova** que a interface funciona ou deixa de funcionar no PC da feira.
- **Pendentes de validação manual em PC Windows:** teste integral da campanha com mouse, taxa de quadros do equipamento, áudio, troca de menus, gravação após fechar/abrir, tela em 1366×768 e 1920×1080.

Para repetir os testes de lógica, caso tenha Node.js instalado: abra o terminal na pasta `cyber-doom` e execute `npm test` (não instala dependências). Para ver erros do navegador: pressione `F12`, abra **Console**, procure mensagens em vermelho. Veja o checklist em `docs/CRONOGRAMA_E_TESTES.md`.

## Compatibilidade e limites da versão 1.0

- Campanha completa em 3 fases. **Modo Sobrevivência não foi implementado**: foi priorizada a campanha jogável.
- Raycasting 2.5D com sprites procedurais, sem bibliotecas ou recursos externos obrigatórios.
- FPS para computador com teclado e mouse; **não há controles de toque para celulares**.
- Ranking persistente somente no navegador local; não há servidor nem autenticação segura do administrador.
- Algumas máquinas podem bloquear o áudio até o primeiro clique, conforme política do navegador.
- Não utiliza arte, mapas ou músicas de Doom; o nome é referência de gênero, e o conteúdo visual e sonoro foi criado originalmente com Canvas, CSS e Web Audio API.

## Créditos e uso

Projeto didático para feira SENAI, curso Técnico em Informática. Códigos e recursos desenhados para esta entrega. Nenhum recurso de terceiros é necessário para jogar.
