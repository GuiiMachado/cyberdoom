# Apresentação formal do projeto — Feira de Técnico em Informática SENAI

## 1. Descrição formal

**CYBER DOOM — Operação PC Protegido** é um jogo educativo original de tiro em primeira pessoa, com estilo visual inspirado no gênero retrô de FPS. O jogo simula a defesa de um computador infectado. O participante assume o papel de agente de proteção digital e percorre três setores, elimina ameaças digitais, restaura recursos do computador, responde a questões de informática e derrota uma ameaça ransomware.

## 2. Problema e justificativa

A segurança da informação envolve conceitos que podem parecer abstratos para visitantes, como vírus, backups, firewalls, ransomware e atualizações de software. O projeto transforma esses conceitos em situações interativas, com feedback imediato, pontuação e um ranking competitivo. A proposta não é substituir o ensino teórico, mas despertar curiosidade e relacionar conteúdos do curso a uma experiência acessível.

## 3. Objetivos

**Objetivo geral:** criar um jogo educativo original, offline, gratuito para executar localmente, com uma experiência de defesa digital baseada em JavaScript e conceitos do curso Técnico em Informática.

**Objetivos específicos:**

1. Aplicar HTML5, CSS3 e JavaScript em uma aplicação web interativa.
2. Criar renderização pseudo-3D no Canvas por raycasting.
3. Implementar controles, colisões, combate, vida, inimigos e objetivos de missão.
4. Utilizar LocalStorage para armazenamento local e ranking por dificuldade.
5. Integrar perguntas de hardware, redes, segurança, banco de dados, programação e sistemas operacionais.
6. Demonstrar o ciclo de desenvolvimento, teste e documentação de software.

## 4. Tecnologias e arquitetura

- **HTML5:** estrutura das telas, botões e Canvas.
- **CSS3:** interface, HUD, cores e adaptação visual.
- **JavaScript com módulos ES:** regras de jogo e separação por responsabilidades.
- **Canvas 2D / raycasting:** simulação de corredores e paredes com profundidade, sprites escalados por distância e oclusão.
- **Web Audio API:** efeitos sonoros sintéticos criados em tempo real.
- **LocalStorage:** conservação dos melhores resultados apenas na origem local do navegador.
- **VS Code + Live Server:** desenvolvimento e execução com servidor HTTP local.

Fluxo resumido: entrada do usuário → controlador de interface (`main.js`) → estado da partida (`game.js`) → movimentação/inimigos/missões → renderização no Canvas (`renderer.js`) → relatório final e ranking (`leaderboard.js` e `storage.js`).

## 5. Desafios técnicos e soluções

**Perspectiva:** o browser não é um motor 3D; o raycasting calcula distâncias até as paredes para desenhá-las com perspectiva.

**Colisões:** jogador e inimigos devem respeitar obstáculos, enquanto as portas só permitem passagem depois de abertas.

**IA básica:** cada inimigo usa velocidade, vida e comportamento distintos; a movimentação utiliza perseguição direta quando há linha de visão, ou busca de caminho em grade quando não há.

**Persistência:** o ranking precisa continuar depois de fechar a página; usa LocalStorage e evita registros duplicados da mesma partida. Esse armazenamento tem limites e não equivale a banco de dados seguro.

**Prazo e desempenho:** foram priorizadas 3 fases curtas, sprites desenhados em código e renderização interna a 960×540. O modo sobrevivência foi adiado para reduzir risco de entrega.

## 6. Resultados esperados

Visitantes conseguem iniciar uma missão, escolher nível, controlar o personagem, disparar contra ameaças, aprender em terminais, alcançar um resultado e disputar posições no ranking. O projeto demonstra conceitos de lógica, programação, redes, segurança e interface, reforçando a aprendizagem por meio de interação.

## 7. Melhorias futuras

- Modo sobrevivência com ondas progressivas e ranking próprio.
- Ranking centralizado com backend, autenticação e mecanismos antifraude.
- Novos mapas, animações, sons e padrões de ataque.
- Acessibilidade, personalização de teclas, opção de baixo desempenho e suporte a controles externos.
- Mais perguntas, feedback explicativo ampliado e painel de estatísticas de aprendizado.

## 8. Roteiro oral de 8–10 minutos

| Tempo | Integrante | Texto-guia e ação |
|---|---|---|
| 0:00–1:00 | 1 | “Bem-vindos ao CYBER DOOM, Operação PC Protegido. Criamos um jogo que transforma ameaças virtuais em desafios visuais. Aqui o computador está infectado e o jogador precisa protegê-lo.” Mostrar tela inicial. |
| 1:00–2:00 | 2 | “O jogo trabalha com os conceitos de vírus, worm, troiano, ransomware, firewall e backup. A ideia é mostrar a importância da segurança da informação de forma interativa.” Explicar objetivo. |
| 2:00–3:15 | 3 | “Usamos HTML para organizar a tela, CSS para o visual e JavaScript para todas as regras. A câmera em primeira pessoa é simulada com raycasting no Canvas, sem precisar instalar motor gráfico pesado.” Mostrar movimentação e parede. |
| 3:15–4:45 | 4 | “Os inimigos têm resistência, velocidade e dano diferentes. Há três dificuldades e o jogador usa um disparador de pulsos para neutralizar as ameaças. Itens de backup e firewall ajudam a defender o sistema.” Demonstrar tiro e item. |
| 4:45–6:00 | 5 | “Nos terminais aparecem perguntas reais do curso, como redes, hardware, programação e banco de dados. Acertar dá pontos, e a resposta explica o conteúdo.” Demonstrar uma pergunta. |
| 6:00–7:15 | 3 | “O Hall da Fama grava até dez pontuações por dificuldade neste navegador. Usamos LocalStorage, então o sistema é gratuito e offline, mas o ranking não é compartilhado automaticamente entre computadores.” Mostrar ranking. |
| 7:15–8:30 | 1 | “Desenvolvemos por módulos e testamos colisão, pontuação, vida, objetivos e armazenamento. O desafio técnico mais importante foi integrar a visão tridimensional simulada com o funcionamento real dos inimigos.” Mostrar estrutura no VS Code. |
| 8:30–9:30 | Todos | “O projeto mostra na prática o que estudamos no Técnico em Informática: desenvolvimento web, lógica, redes, segurança, persistência e testes. Agora convidamos vocês a jogar e disputar o ranking.” Abrir missão para visitante. |

O roteiro é uma sugestão; adaptem a fala ao tempo disponível e ao número de integrantes.

## 9. Sugestão de 9 slides

| Slide | Conteúdo |
|---|---|
| 1 | Título, slogan e integrantes |
| 2 | Problema: ameaças digitais e importância da segurança |
| 3 | Objetivo geral e objetivos específicos |
| 4 | Tecnologias: HTML5, CSS3, JavaScript, Canvas e LocalStorage |
| 5 | Arquitetura: telas, lógica, renderização, armazenamento |
| 6 | Jogabilidade: fases, inimigos, itens e chefão |
| 7 | Conteúdo educativo: terminais com questões do curso |
| 8 | Ranking, testes e limitações da versão atual |
| 9 | Demonstração, conclusões e convite para jogar |

## 10. Demonstração rápida para o público

1. Diga: “Escolha seu apelido e uma dificuldade”.
2. Peça para o visitante iniciar a missão.
3. Explique controles em uma frase: “WASD anda, mouse mira, clique atira, E interage, ESC pausa”.
4. Oriente sobre ícones de chave, backup e terminal, sem jogar pela pessoa.
5. Quando o visitante terminar, mostre o resultado e o Hall da Fama.
6. Clique em Novo Jogador para a próxima pessoa.

Recomenda-se um **único PC oficial** para o ranking da feira, com o jogo previamente instalado e testado sem internet.
