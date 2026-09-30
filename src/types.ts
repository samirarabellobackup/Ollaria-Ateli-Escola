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

// Tipos de Serviços Contratados (Separar Perfil de Serviço)
export type ServiceType =
  | 'aluno_regular'
  | 'aluno_curso'
  | 'cliente_queima'
  | 'cliente_consultoria'
  | 'artista_coworking'
  | 'professor_visitante';

// Aluno Curso: ciclo INÍCIO -> DESENVOLVIMENTO -> CONCLUSÃO
export interface CourseServiceData {
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

// Cliente Queima: 9 estados regulamentares
export type FiringStatus =
  | 'aguardando_recebimento'
  | 'recebida'
  | 'aguardando_queima'
  | 'agendada'
  | 'em_queima'
  | 'queima_concluida'
  | 'aguardando_retirada'
  | 'retirada'
  | 'cancelada';

export interface FiringOrder {
  id: string;
  userId: string;
  identificacao: string; // Ex: "Lote 03 - Vasos Terracota"
  tipoQueima: 'biscoito_baixa' | 'esmalte_alta' | 'lustre_terceira' | 'outro';
  temperatura: string; // Ex: "1220°C" ou "980°C"
  quantidadePecas: number;
  pecasEntregues: number;
  status: FiringStatus;
  observacoes?: string;
  dataEntrada: string;
  dataPrevista?: string;
  dataRealizada?: string;
  valorQueima: number;
  valorPago: number;
  formaPagamento?: PaymentMethod;
  createdAt: string;
}

// Cliente Consultoria: controle automático de horas
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

export interface ConsultingServiceData {
  horasContratadas: number;
  horasUtilizadas: number;
  horasAgendadas: number;
  valorHora?: number;
  observacoes?: string;
}

// Artista Coworking
export interface CoworkingBooking {
  id: string;
  userId: string;
  data: string;
  horario: string; // Ex: "14:00 às 18:00"
  horas: number;
  status: 'solicitado' | 'confirmado' | 'realizado' | 'cancelado';
  observacoes?: string;
  solicitadoEm: string;
  decididoEm?: string;
}

export interface CoworkingServiceData {
  horasContratadas: number;
  horasUtilizadas: number;
  horasAgendadas: number;
  periodoContratado: string; // Ex: "Outubro 2026"
  observacoes?: string;
}

// Professor Visitante: Sublocação vs Percentual sobre turma
export type VisitingTeacherAgreementType = 'sublocacao' | 'percentual_turma';

export interface VisitingTeacherServiceData {
  tipoAcordo: VisitingTeacherAgreementType;
  // Sublocação
  periodo?: string;
  horasContratadas?: number;
  horasUtilizadas?: number;
  horasRestantes?: number;
  valorSublocacao?: number;
  // Percentual sobre turma
  nomeTurma?: string;
  quantidadeAlunos?: number;
  valorTurma?: number;
  percentualAcordado?: number; // Ex: 30 (%)
  valorDevidoProfessor?: number;
  valorPagoProfessor?: number;
  historicoAcordo?: string;
}

// Módulo de Materiais Utilizados
export type MaterialCompensationType = 'cobrar' | 'repor' | 'incluido';

export interface MaterialUsage {
  id: string;
  userId: string;
  userName?: string;
  servicoRelacionado: ServiceType;
  material: string; // Ex: "Argila Tabaco", "Esmalte Branco Acetinado", "Papel Refratário"
  quantidade: number;
  unidade: string; // Ex: "kg", "unidade", "g", "litro"
  valorUnitario: number;
  valorTotal: number; // quantidade * valorUnitario
  formaCompensacao: MaterialCompensationType;
  data: string;
  observacoes?: string;
  statusCobranca?: 'pendente' | 'pago' | 'nao_aplicavel';
  createdAt: string;
}

// Histórico e Auditoria do Sistema
export interface SystemAuditLog {
  id: string;
  userId?: string;
  userName?: string;
  modulo: 'servico' | 'queima' | 'horas' | 'material' | 'financeiro' | 'cadastro' | 'agendamento';
  acao: string;
  infoAnterior?: string;
  novaInfo?: string;
  responsavel: string;
  data: string;
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

  // NOVO MÓDULO: Perfis e Serviços Contratados (Separar Perfil de Serviço)
  servicosAtivos?: ServiceType[];
  cursoData?: CourseServiceData;
  consultoriaData?: ConsultingServiceData;
  coworkingData?: CoworkingServiceData;
  professorData?: VisitingTeacherServiceData;
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
