export type PlanType = 'mensal' | 'bimestral' | 'trimestral' | 'semestral';

export type ClassShift = 
  | 'quarta-tarde' // Quarta-feira (tarde) - 15h20 às 17h50
  | 'quarta-noite' // Quarta-feira (noite) - 18h20 às 20h50
  | 'sabado-manha' // Sábado (manhã) - 09h30 às 12h00
  | 'terca-noite';  // Terça-feira (noite) - 18h20 às 20h50

export type ExperienceLevel = 'nenhuma' | 'iniciante' | 'intermediário' | 'avançado';

export type PieceStage = 
  | 'modelagem_secagem' // Em secagem no ateliê
  | 'aguardando_biscoito' // Pronta para 1ª queima (biscoito)
  | 'biscoito_queimado' // Biscoitado, pronto p/ esmaltar
  | 'aguardando_esmalte' // Esmaltada, aguardando 2ª queima (alta temp)
  | 'queimada_pronta' // Queimada e disponível para retirada (prazo 90 dias)
  | 'retirada_entregue'; // Já retirada pelo aluno

export type AttendanceStatus = 'presente' | 'falta' | 'reposicao' | 'trancado' | 'agendada';

export type UserRole = 'admin' | 'student' | 'guest';

export type PaymentCategory = 'mensalidade' | 'argila' | 'queima' | 'ferramentas' | 'outro';
export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';
export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export interface RegistrationFormData {
  // Seção 1: Dados Pessoais & Contato
  email: string;
  nomeCompleto: string;
  nomePreferencia: string;
  dataNascimento: string;
  cpfOuPassaporte: string;
  profissao: string;
  telefoneWhatsapp: string;
  endereco: string;
  comoConheceu: 'Instagram' | 'Indicação' | 'CasaCor' | 'Google' | 'Outro';
  comoConheceuOutro?: string;

  // Seção 2: Experiência e Matrícula
  modalidade: PlanType;
  turmaDesejada: ClassShift;
  experiencia: ExperienceLevel;
  jaFezAulasOutroAtelie: 'Sim' | 'Não';
  historicoOutroAtelie?: string;

  // Seção 3: Informações Importantes & Menor de idade
  menor18: 'Sim' | 'Não';
  responsavelNome?: string;
  responsavelCpf?: string;
  responsavelWhatsapp?: string;
  responsavelEmail?: string;
  responsavelParentesco?: string;
  contatoEmergenciaNome: string;
  contatoEmergenciaRelacao: string;
  informacoesSaudeAtendimento: string;

  // Seção 4: Aceites e Termos (imutáveis pelo aluno após confirmação)
  aceitouRegrasCondicoes: boolean;
  dataAceiteRegrasCondicoes: string;
  aceitouTermoRegulamento: boolean;
  dataAceiteTermoRegulamento: string;
  cienciaProcessoCeramico: boolean;
  cienciaMateriaisQueimas: boolean;
  veracidadeInformacoes: boolean;
  autorizacaoImagem: 'autorizo' | 'nao_autorizo';
  formaPagamentoPretendida: 'pix' | 'cartao';
}

export interface Student {
  id: string;
  accessCode: string; // Ex: OL-4821 gerado pelo sistema
  pin: string; // Senha numérica simples para login de 4 a 6 dígitos
  nome: string;
  email: string;
  whatsapp: string;
  avatarUrl?: string;
  turma: ClassShift;
  modalidade: PlanType;
  valorPlano: number;
  dataInicioPlano: string;
  dataFimPlano: string;
  status: 'ativo' | 'trancado' | 'inadimplente' | 'finalizado';
  aulasTotaisPlano: number;
  aulasFeitas: number;
  aulasRestantes: number;
  trancamentosUtilizadosDias: number; // Max 15 dias p/ trimestral, 30 dias p/ semestral
  
  // Ficha de matrícula completa
  registrationData: RegistrationFormData;
  dataMatricula: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  data: string;
  horario: string;
  status: AttendanceStatus;
  observacao?: string;
  registradoPor: string;
  createdAt: string;
}

export interface PotteryPiece {
  id: string;
  studentId: string;
  titulo: string;
  tipoArgila: string; // Ex: Terracota, Tabaco, Creme com pintas, Porcelana
  etapa: PieceStage;
  dataEntrada: string;
  dataQueimaConcluida?: string;
  prazoLimiteRetirada?: string; // 90 dias após conclusão da queima
  tecnica: string; // Torno, Placa, Belisco, Rolo, Escultura
  dimensoesAprox?: string;
  esmalteCores?: string;
  avaliacaoTecnica: {
    aprovadaParaQueima: boolean;
    riscosIdentificados?: string; // Risco de umidade, bolhas, espessura excessiva
    observacoes?: string;
  };
  fotoUrl?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  studentId: string;
  descricao: string;
  categoria: PaymentCategory;
  valor: number;
  status: PaymentStatus;
  dataVencimento: string;
  dataPagamento?: string;
  metodoPagamento?: PaymentMethod;
  comprovanteUrl?: string;
  observacoes?: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  studentId?: string; // se nulo, é global do ateliê
  tipo: 'cobranca' | 'renovacao' | 'retirada_peca' | 'aviso_aula' | 'aprovacao_pendente' | 'comunicado';
  titulo: string;
  mensagem: string;
  urgencia: 'baixa' | 'media' | 'alta';
  lida: boolean;
  dataCriacao: string;
  whatsappLink?: string;
}

export interface ProfileChangeRequest {
  id: string;
  studentId: string;
  studentName: string;
  campoAlterado: string;
  valorAnterior: string;
  novoValor: string;
  motivo?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataSolicitacao: string;
  dataDecisao?: string;
}

export interface MonthlyReportData {
  mesAno: string; // Ex: "2026-09"
  totalAlunosAtivos: number;
  novasMatriculas: number;
  receitaTotal: number;
  receitaMensalidades: number;
  receitaArgilasEQueimas: number;
  totalPendente: number;
  totalAulasRealizadas: number;
  taxaPresencaPercentual: number;
  pecasQueimadasTotal: number;
  pecasAguardandoQueima: number;
  pecasRetiradas: number;
  pecasAlerta90Dias: number;
}
