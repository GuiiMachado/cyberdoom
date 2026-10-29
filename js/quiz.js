// 24 perguntas originais: exatamente uma resposta correta por questão.
export const QUESTIONS=[
{topic:'Hardware',q:'Qual componente executa instruções dos programas?',a:['Processador (CPU)','Monitor','Teclado','Fonte de alimentação'],correct:0,why:'A CPU processa instruções e operações dos programas.'},
{topic:'Hardware',q:'Para que serve a memória RAM?',a:['Guardar arquivos permanentemente','Armazenar dados temporários em uso','Resfriar o processador','Enviar Wi-Fi'],correct:1,why:'A RAM é memória volátil usada enquanto programas estão em execução.'},
{topic:'Hardware',q:'Qual dispositivo armazena arquivos após desligar o PC?',a:['RAM','Registrador','SSD','Cache L1'],correct:2,why:'SSDs e HDs conservam os dados sem energia.'},
{topic:'Hardware',q:'Qual desses é um periférico de entrada?',a:['Impressora','Caixa de som','Projetor','Teclado'],correct:3,why:'O teclado envia dados do usuário para o computador.'},
{topic:'Redes',q:'Para que serve um endereço IP?',a:['Identificar um dispositivo na rede','Aumentar RAM','Carregar a bateria','Substituir o antivírus'],correct:0,why:'O IP identifica interfaces e permite o encaminhamento de pacotes na rede.'},
{topic:'Redes',q:'Qual tecnologia conecta dispositivos por rede sem fio local?',a:['HDMI','Wi-Fi','SATA','USB-A'],correct:1,why:'Wi-Fi é usado para conexões de rede local sem fio.'},
{topic:'Redes',q:'Qual é uma função típica de um roteador?',a:['Imprimir documentos','Instalar aplicativos','Encaminhar pacotes entre redes','Editar imagens'],correct:2,why:'Roteadores encaminham pacotes entre redes IP.'},
{topic:'Redes',q:'Qual protocolo normalmente entrega páginas web com segurança?',a:['FTP','SMTP','DNS','HTTPS'],correct:3,why:'HTTPS protege a comunicação HTTP com TLS.'},
{topic:'Segurança',q:'O que é phishing?',a:['Golpe que tenta obter dados por engano','Um tipo de memória','Um cabo de rede','Um tipo de placa-mãe'],correct:0,why:'Phishing tenta enganar pessoas para coletar credenciais e informações.'},
{topic:'Segurança',q:'Qual ameaça criptografa arquivos e exige resgate?',a:['Firewall','Ransomware','Antivírus','Backup'],correct:1,why:'Ransomware pode bloquear arquivos e exigir pagamento por sua liberação.'},
{topic:'Segurança',q:'Qual a função principal de um firewall?',a:['Aumentar o clock','Editar fotos','Filtrar tráfego de rede segundo regras','Limpar o teclado'],correct:2,why:'Firewalls permitem ou bloqueiam conexões conforme regras.'},
{topic:'Segurança',q:'Qual prática ajuda a recuperar arquivos após incidente?',a:['Ignorar atualizações','Compartilhar senha','Desligar o monitor','Manter backups testados'],correct:3,why:'Backups recuperáveis reduzem perdas após falhas e ataques.'},
{topic:'Banco de dados',q:'Em um banco relacional, o que é uma tabela?',a:['Conjunto de linhas e colunas','Um cabo','Uma tela','Uma senha'],correct:0,why:'Tabelas organizam dados em registros (linhas) e campos (colunas).'},
{topic:'Banco de dados',q:'O que é um registro em uma tabela?',a:['Um índice gráfico','Uma linha de dados','Um monitor','Um firewall'],correct:1,why:'Um registro corresponde a uma linha da tabela.'},
{topic:'Banco de dados',q:'Para que serve uma chave primária?',a:['Aumentar conexão','Desligar o servidor','Identificar cada linha sem duplicidade','Compactar imagens'],correct:2,why:'A chave primária identifica unicamente um registro da tabela.'},
{topic:'Banco de dados',q:'Qual comando SQL consulta registros?',a:['REMOVE','PAUSE','COMPILE','SELECT'],correct:3,why:'SELECT recupera dados de tabelas ou outras fontes de consulta.'},
{topic:'Programação',q:'O que é uma variável?',a:['Local nomeado para guardar um valor','Uma placa de vídeo','Um roteador','Uma impressora'],correct:0,why:'Variáveis permitem armazenar ou referenciar valores durante a execução.'},
{topic:'Programação',q:'Qual estrutura executa um bloco dependendo de condição?',a:['Comentário','if / else','import','console.log'],correct:1,why:'if e else escolhem o fluxo de execução a partir de condições.'},
{topic:'Programação',q:'Para que serve um laço de repetição?',a:['Apagar o HD','Trocar monitor','Repetir instruções segundo uma condição','Alterar IP automaticamente'],correct:2,why:'Laços como for e while permitem executar instruções repetidamente.'},
{topic:'Programação',q:'O que é um algoritmo?',a:['Um antivírus','Um chip','Um monitor','Sequência definida de passos para resolver problema'],correct:3,why:'Algoritmos descrevem passos para executar uma tarefa.'},
{topic:'Sistemas operacionais',q:'O que é um arquivo?',a:['Conjunto identificado de dados armazenados','Um endereço IP','Um cooler','Um periférico de saída'],correct:0,why:'Arquivos organizam dados persistentes com um nome e metadados.'},
{topic:'Sistemas operacionais',q:'O que é um processo no sistema operacional?',a:['Um tipo de monitor','Uma instância de programa em execução','Um cabo USB','Um antivírus'],correct:1,why:'Processos são programas em execução gerenciados pelo sistema operacional.'},
{topic:'Sistemas operacionais',q:'Por que atualizar softwares é importante?',a:['Para aumentar o peso do PC','Para mudar o mouse','Para corrigir falhas e vulnerabilidades','Para apagar backups'],correct:2,why:'Atualizações corrigem bugs e vulnerabilidades conhecidas.'},
{topic:'Segurança',q:'Qual comportamento reduz o risco de vírus?',a:['Abrir todos anexos','Desativar proteção','Reutilizar a mesma senha','Baixar programas de fontes confiáveis'],correct:3,why:'Fontes confiáveis e verificação de arquivos reduzem exposição a malware.'}
];
const TOPIC_HINTS={
  'Hardware':'Relembre a função das peças físicas e dos componentes internos do computador.',
  'Redes':'Pense em como os dispositivos se identificam e trocam dados em uma rede.',
  'Segurança':'Considere práticas de proteção, prevenção de golpes e recuperação de dados.',
  'Banco de dados':'Revise como tabelas organizam registros e como consultas localizam dados.',
  'Programação':'Pense nos conceitos usados para guardar valores e controlar a execução de um programa.',
  'Sistemas operacionais':'Relembre como o sistema organiza arquivos, programas e atualizações.'
};
export function nextQuestion(game){
  const available=QUESTIONS.map((q,i)=>i).filter(i=>!game.answeredQuestions.has(i));
  if(!available.length)return null;
  // Distribuição determinística distinta por nível/terminal, sem repetição na partida.
  const i=available[(game.answeredQuestions.size*7+game.levelIndex*3)%available.length];
  return {index:i,...QUESTIONS[i],hint:TOPIC_HINTS[QUESTIONS[i].topic]||'Revise os conceitos deste tema.'};
}
