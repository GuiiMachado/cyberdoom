# Guia para iniciantes — configurar, editar e executar o CYBER DOOM no Windows

## 1. Preparar a pasta

Baixe o ZIP entregue junto com este projeto. No Explorador de Arquivos do Windows, abra `Downloads`, clique com o botão direito no ZIP e escolha **Extrair Tudo**. Escolha um local fácil, como `Documentos`. Ao terminar, abra a pasta `cyber-doom` e confirme que nela estão `index.html`, `README.md`, `package.json` e as subpastas `css`, `js`, `assets`, `docs` e `tests`.

Se houver uma pasta `cyber-doom` dentro de outra pasta `cyber-doom`, abra a interna, aquela que contém `index.html`.

## 2. Instalar e abrir VS Code

1. Se não tiver VS Code, acesse https://code.visualstudio.com/ e instale a versão do Windows, usando opções padrão.
2. Abra o VS Code, clique em **Arquivo > Abrir Pasta**.
3. Selecione `cyber-doom` e clique em **Selecionar Pasta**.
4. No painel Explorador do VS Code (ícone de arquivos à esquerda), localize `index.html`, `css/style.css` e os arquivos dentro de `js`.
5. Caso apareça uma tela perguntando sobre confiar no diretório, escolha a opção adequada se você realmente confia na pasta que acabou de extrair.

## 3. Instalar Live Server e jogar

1. Na barra lateral, clique em **Extensões**, ou pressione `Ctrl+Shift+X`.
2. Procure por **Live Server** e confira se o autor é **Ritwick Dey**.
3. Clique em **Instalar**. Para baixar a extensão, será necessária internet uma única vez. O jogo não precisa de internet durante a execução.
4. Abra `index.html`, clique com o botão direito e escolha **Open with Live Server**. Você também pode usar **Go Live** na parte inferior do VS Code.
5. Chrome ou Edge deve mostrar o menu **CYBER DOOM** em um endereço `http://127.0.0.1:5500/` ou similar.
6. Entre no jogo com um apelido como `ALUNO_01`, selecione **Fácil** e clique em **Iniciar Operação**.
7. Se a mira não girar, clique dentro do cenário; o navegador poderá solicitar permissão para usar o ponteiro. Pressione `ESC` para pausar.
8. Se quiser manter a janela do jogo aberta, não feche a aba nem pare o Live Server.

**Sem internet para jogar:** depois de instalado, o Live Server roda na própria máquina. Outra opção é instalar o Python previamente, entrar na pasta pelo terminal e executar `python -m http.server 8000`, abrindo `http://localhost:8000` no navegador. O servidor é local; não depende de serviços remotos.

## 4. Quais arquivos modificar

| Arquivo | O que modifica |
|---|---|
| `index.html` | Textos, botões, campos, HUD, menus, telas |
| `css/style.css` | Cores, letras, tamanhos, disposição |
| `js/config.js` | Dificuldades, dano, velocidade, PIN administrativo, pontos |
| `js/levels.js` | Mapas, inimigos posicionados, chaves, itens, terminais, objetivos |
| `js/renderer.js` | Paredes, perspectiva 3D simulada, sprites, minimapa |
| `js/player.js` | Movimentação, correr, colisão |
| `js/enemies.js` | Comportamento dos inimigos, tiro e dano |
| `js/game.js` | Missões, vida, proteções, fases, vitória e derrota |
| `js/quiz.js` | Perguntas com quatro opções e explicações |
| `js/leaderboard.js` | Ordenação e persistência de recordes |
| `js/storage.js` | Acesso ao armazenamento do navegador |
| `js/audio.js` | Sons sintéticos |
| `js/main.js` | Eventos dos botões, HUD, menus e controles |

Para alterar um arquivo, clique nele no painel esquerdo, edite o código e pressione `Ctrl+S`. O Live Server normalmente recarrega a página. **Cuidado:** salvar mudanças com uma partida aberta reinicia aquela partida, mas o ranking em LocalStorage normalmente permanece.

### Exemplos simples

- Quer deixar os inimigos mais lentos? Em `js/config.js`, diminua `speed` no modo escolhido.
- Quer alterar a senha de limpeza do ranking? Em `js/config.js`, altere `ADMIN_PIN: '2468'` para outro PIN entre aspas. É uma barreira local e não segurança real.
- Quer colocar mais perguntas? Adicione novos objetos ao vetor `QUESTIONS` em `js/quiz.js` seguindo o formato dos existentes (`topic`, `q`, `a`, `correct`, `why`). O campo `correct` começa em **0**: 0=A, 1=B, 2=C, 3=D.
- Quer mudar a cor do título? Procure `.menu-content h1 span` em `css/style.css`.

## 5. Como detectar e resolver erros

**Tela branca ou sem menus:** pressione `F12` no Chrome/Edge e vá a **Console**. Mensagens em vermelho podem indicar nome de arquivo errado ou erro de JavaScript. Confirme que abriu o projeto via **Live Server**, não por `file:///`.

**404 ou Failed to load module script:** confira os caminhos: `js/main.js` deve estar dentro da pasta `js`, e `css/style.css` dentro de `css`. Mantenha a mesma grafia de nomes e extensões.

**O mouse não controla a câmera:** clique na área do cenário para ativar o travamento do ponteiro. Se estiver em pausa, pressione **Continuar**. Em alguns computadores administrados, o navegador pode restringir pointer lock; ajuste as permissões do site com a equipe responsável.

**Sem som:** verifique volume e fones; o navegador normalmente libera áudio após a interação do usuário com a página. O jogo continua funcionando sem áudio.

**Ranking sumiu:** verifique se o navegador é o mesmo e se a URL utiliza o mesmo domínio, porta e perfil. `127.0.0.1:5500` e `localhost:5500` são origens diferentes. Não use aba anônima nem limpe os dados do site. Confirme no DevTools: **Application > Local Storage > [origem atual] > `cyberdoom-v1-leaderboard`**.

**Movimentação lenta:** feche outros programas, deixe navegador em tela cheia (`F11`) e use um PC com aceleração gráfica. O jogo renderiza internamente em 960×540 para reduzir custo.

**O jogador não consegue passar pela parede verde da porta:** pegue a chave amarela do setor, aproxime-se da porta e pressione `E` para abrir. A segunda porta também precisa ser aberta.

**Terminais não respondem:** chegue perto do terminal azul e pressione `E`. Cada terminal aceita apenas uma pergunta por partida.

**Os resultados não persistem:** cheque o LocalStorage e as políticas do navegador do laboratório. Alguns perfis temporários são limpos automaticamente ao encerrar a sessão.

## 6. Testar alterações sem perder tudo

1. Faça uma cópia da pasta original como `cyber-doom-backup` antes de mudanças grandes.
2. Mude **uma coisa de cada vez** e salve (`Ctrl+S`).
3. Atualize o navegador e teste a função alterada.
4. Verifique o Console do navegador (`F12`) após cada mudança importante.
5. Se algo parou de funcionar, volte à última cópia íntegra.
6. Para testar lógica sem abrir navegador, instale Node.js (opcional) e execute `npm test` na pasta principal. Não é preciso usar `npm install`.

## 7. Levar ao outro computador do SENAI

Copie a **pasta inteira** `cyber-doom` para um pendrive, ou faça um ZIP novo pelo Explorador do Windows (**Enviar para > Pasta compactada**). No PC da feira, extraia tudo, abra a pasta no VS Code e inicie um servidor local. Faça um teste completo **sem internet** antes do dia do evento.

Atenção: os recordes **não vão junto com a pasta do código**, porque são armazenados no perfil do navegador que executa o jogo. Se vários computadores tiverem o projeto, terão rankings diferentes, a menos que a equipe crie futuramente um sistema de sincronização. Para competição oficial, escolha um único computador para as partidas.

## 8. Resumo de primeira execução

`Extrair ZIP → Abrir pasta no VS Code → Live Server → Navegador → Iniciar Missão → Apelido → Dificuldade → Jogar.`
