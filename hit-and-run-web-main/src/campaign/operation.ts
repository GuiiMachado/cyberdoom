import type {Chapter,Command,Mission,OperationQuestion,Stage} from './types';

export const OPERATION_ID='springfield-offline';
export const OPERATION_TITLE='O Chefão: Springfield Offline';
const cmd=(op:string,args:(string|number)[]):Command=>({op,args,line:0});
const question=(topic:string,prompt:string,choices:string[],answer:number,explanation:string):OperationQuestion=>({topic,prompt,choices,answer,explanation});

const stages:Stage[]=[
  {index:0,args:[],commands:[
    cmd('SetStageTime',[360]),
    ...['m7_smithers_race1','m7_smithers_race2','m7_smithers_race3','m7_smithers_race5','m7_smithers_race6','m7_smithers_race7','m7_smithers_race9'].map(name=>cmd('AddCollectible',[name]))
  ],objective:{type:'race',mode:''},conditions:[{type:'timeout',args:[],commands:[]}],checkpoint:true,
    message:'Etapa 1 — Corrida dos componentes: colete os 7 componentes antes que o tempo acabe.'},
  {index:1,args:[],commands:[],objective:{type:'quiz',mode:''},conditions:[],checkpoint:true,
    message:'Etapa 2 — Conserto do computador: identifique o hardware e diagnostique a falha.',quiz:[
      question('Hardware','Qual componente executa as instruções dos programas?', ['Processador (CPU)','SSD','Fonte de alimentação','Placa de rede'],0,'A CPU executa instruções e coordena operações. O SSD armazena dados, a fonte fornece energia e a placa de rede conecta o computador.'),
      question('Hardware','O computador liga, mas fica muito lento com vários programas abertos. Qual melhoria ajuda mais?', ['Adicionar memória RAM','Trocar o mouse','Aumentar a resolução do monitor','Desconectar a placa de rede'],0,'Mais RAM oferece espaço para manter programas e dados ativos. A lentidão com muitos programas pode ocorrer quando falta memória disponível.'),
      question('Diagnóstico','Antes de trocar uma peça, qual é o primeiro passo seguro para investigar uma falha?', ['Verificar mensagens de erro e conexões','Formatar o disco imediatamente','Abrir a fonte de alimentação','Apagar todos os arquivos'],0,'Verificar sintomas, mensagens e conexões ajuda a localizar a causa sem perder dados nem expor o técnico a riscos elétricos.')
    ]},
  {index:2,args:[],commands:[],objective:{type:'quiz',mode:''},conditions:[],checkpoint:true,
    message:'Etapa 3 — Recuperação da rede: restaure a comunicação entre os sistemas.',quiz:[
      question('Redes','Qual equipamento encaminha o tráfego entre redes diferentes?', ['Roteador','Teclado','Memória RAM','Impressora'],0,'O roteador encaminha pacotes entre redes. Um switch conecta dispositivos dentro de uma rede local.'),
      question('Redes','O que o DNS faz quando você acessa um site pelo nome?', ['Traduz o nome do domínio para um endereço IP','Aumenta a memória do computador','Criptografa automaticamente todos os arquivos','Atualiza o sistema operacional'],0,'O DNS consulta registros que associam nomes de domínio a endereços IP.'),
      question('Redes','Um computador não alcança nenhum serviço da rede. Qual teste inicial ajuda a verificar a conexão local?', ['Verificar o endereço IP e testar o gateway','Trocar o papel de parede','Desinstalar o navegador','Desativar o firewall sem análise'],0,'Conferir a configuração IP e testar o gateway ajuda a separar uma falha local de um problema externo.')
    ]},
  {index:3,args:[],commands:[],objective:{type:'quiz',mode:''},conditions:[],checkpoint:true,
    message:'Etapa 4 — Investigação digital: encontre e bloqueie a falha de segurança.',quiz:[
      question('Segurança','Uma mensagem inesperada pede sua senha por um link. O que você deve fazer?', ['Não abrir o link e confirmar a solicitação por um canal oficial','Responder com a senha para verificar','Encaminhar o link para todos os contatos','Desativar o antivírus'],0,'Pedidos urgentes de senha podem ser phishing. Confirme pelo site ou canal oficial e nunca envie sua senha por mensagem.'),
      question('Segurança','Qual medida dificulta o acesso à conta mesmo quando a senha vaza?', ['Autenticação multifator','Usar a mesma senha em todos os sites','Desativar atualizações','Compartilhar a conta'],0,'A autenticação multifator exige uma segunda prova de identidade além da senha.'),
      question('Segurança','Você suspeita que um computador está infectado. Qual ação ajuda a conter o problema?', ['Isolar o dispositivo da rede e avisar a equipe responsável','Conectar vários dispositivos USB','Ignorar os alertas','Copiar os arquivos suspeitos para outros computadores'],0,'Isolar o dispositivo reduz a propagação enquanto a equipe investiga e preserva os dados necessários.')
    ]},
  {index:4,args:[],commands:[],objective:{type:'quiz',mode:''},conditions:[],checkpoint:true,
    message:'Etapa 5 — O desafio final: combine seus conhecimentos para restaurar Springfield.',quiz:[
      question('Desafio final · Diagnóstico','O servidor falhou após uma atualização suspeita. Qual sequência é mais segura?', ['Isolar o servidor, verificar os registros e identificar a causa','Reiniciar todos os computadores sem avisar','Apagar os registros do servidor','Desativar todas as proteções'],0,'Isolar primeiro limita o impacto. A análise dos registros ajuda a entender a falha antes de qualquer restauração.'),
      question('Desafio final · Recuperação','Antes de restaurar um backup, o que deve ser confirmado?', ['Que a cópia está íntegra e anterior à infecção','Que o arquivo tem o nome mais curto','Que a cópia está no mesmo disco infectado','Que a restauração não precisa de verificação'],0,'Verifique a integridade e escolha uma cópia limpa anterior à infecção; depois aplique correções de segurança.'),
      question('Desafio final · Proteção','Qual combinação ajuda a manter a rede recuperada?', ['Atualizações verificadas, senhas únicas e backups testados','Uma senha compartilhada e atualizações adiadas','Desativar firewall e autenticação multifator','Manter o servidor infectado conectado'],0,'Atualizações corrigem vulnerabilidades, senhas únicas reduzem o impacto de vazamentos e backups testados permitem recuperação.')
    ]}
];

const mission:Mission={id:OPERATION_ID,level:1,title:OPERATION_TITLE,setup:[cmd('SetMissionResetPlayerInCar',['m7_car_start']),cmd('SetDynaLoadData',['l1z1.p3d;l1r1.p3d;l1r6.p3d;l1z6.p3d;'])],stages,intro:null,load:[],introLoad:[],transition:false,optional:false,source:'custom:operation'};

export function adaptChapterToOperation(chapter:Chapter):Chapter{
  if(chapter.id!==1)throw new Error('A operação Springfield Offline usa o mapa do primeiro capítulo.');
  return {...chapter,missions:[mission],initial:chapter.initial.filter(c=>!['AddNPCCharacterBonusMission','AddBonusMission','AddBonusMissionNPCWaypoint'].includes(c.op))};
}
