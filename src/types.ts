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

export type PaymentCategory = 'mensalidade' | 'argila' | 'queima' | 'ferramentas' | 'material' | 'servico' | 'consultoria' | 'coworking' | 'curso' | 'outro';
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

export interface StudentConsultoriaData {
  horasContratadas: number;
  horasUtilizadas: number;
  horasAgendadas: number;
  valorHora: number;
  observacoes?: string;
}

export interface StudentCoworkingData {
  horasContratadas: number;
  horasUtilizadas: number;
  horasAgendadas: number;
  periodoContratado?: string;
  observacoes?: string;
}

export interface StudentProfessorData {
  tipoAcordo: 'sublocacao_espaco' | 'percentual_turma';
  nomeTurma?: string;
  quantidadeAlunos?: number;
  valorTurma?: number;
  percentualAcordado?: number;
  valorDevidoProfessor?: number;
  valorPagoProfessor?: number;
  historicoAcordo?: string;
  valorMensalSublocacao?: number;
  horarioSublocacao?: string;
}

export interface StudentCursoData {
  nomeCurso: string;
  dataInicio: string;
  dataTermino: string;
  quantidadeEncontros: number;
  encontrosRealizados: number;
  encontrosRestantes: number;
  statusCiclo: 'inicio' | 'desenvolvimento' | 'conclusao';
  calendarioDescricao?: string;
  materiaisInclusos?: string;
  observacoes?: string;
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
  servicosAtivos?: ServiceType[];
  horasConsultoriaContratadas?: number;
  horasConsultoriaUtilizadas?: number;
  coworkingHorasMensais?: number;
  professorModalidade?: 'sublocacao' | 'porcentagem';
  professorPercentualRepasse?: number;

  consultoriaData?: StudentConsultoriaData;
  coworkingData?: StudentCoworkingData;
  professorData?: StudentProfessorData;
  cursoData?: StudentCursoData;
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

export type ServiceType =
  | 'aluno_regular'
  | 'cliente_queima'
  | 'cliente_consultoria'
  | 'artista_coworking'
  | 'professor_visitante'
  | 'aluno_curso';

export type FiringStatus =
  | 'solicitado'
  | 'aguardando_queima'
  | 'em_queima'
  | 'queima_concluida'
  | 'aguardando_retirada'
  | 'retirado'
  | 'cancelado';

export interface FiringOrder {
  id: string;
  userId: string;
  identificacao: string;
  tipoQueima: 'biscoito_baixa' | 'esmalte_alta' | 'outro' | string;
  temperatura?: string;
  quantidadePecas: number;
  pecasEntregues?: number;
  status: FiringStatus;
  observacoes?: string;
  dataEntrada: string;
  dataPrevista?: string;
  dataRealizada?: string;
  valorQueima: number;
  valorPago: number;
  formaPagamento?: PaymentMethod | string;
  createdAt: string;
}

export interface ConsultingAppointment {
  id: string;
  userId: string;
  data: string;
  horario: string;
  duracaoHoras: number;
  temaObservacoes: string;
  status: 'agendado' | 'realizado' | 'cancelado';
  createdAt: string;
}

export interface CoworkingBooking {
  id: string;
  userId: string;
  data: string;
  horario: string;
  horas: number;
  status: 'solicitado' | 'confirmado' | 'realizado' | 'cancelado';
  observacoes?: string;
  solicitadoEm: string;
  decididoEm?: string;
}

export interface MaterialUsage {
  id: string;
  userId: string;
  userName: string;
  servicoRelacionado: ServiceType | string;
  material: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  formaCompensacao: 'cobrar' | 'repor' | 'incluido';
  data: string;
  observacoes?: string;
  statusCobranca: 'pendente' | 'pago' | 'nao_aplicavel';
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  userId?: string;
  userName?: string;
  modulo: string;
  acao: string;
  infoAnterior?: string;
  novaInfo: string;
  responsavel: string;
  data: string;
}

