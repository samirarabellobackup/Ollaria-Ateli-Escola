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

// 4 Status padronizados da aula (Seção 2)
export type ClassAttendanceStatus = 
  | 'Realizada'
  | 'Falta do membr@'
  | 'Falta da Ollaria'
  | 'Cancelada';

// Classificação da aula (Seção 3)
export type ClassClassification = 
  | 'Mensalidade'
  | 'Reposição'
  | 'Extra';

// Decisão sobre reposição (Seção 4)
export type ReplacementDecision = 
  | 'Sem reposição'
  | 'Reposição pendente de decisão'
  | 'Reposição concedida';

// Status da reposição (Seção 11)
export type ReplacementStatus = 
  | 'Pendente'
  | 'Agendada'
  | 'Realizada'
  | 'Cancelada'
  | 'Dispensada';

// Mantém suporte para compatibilidade com dados legados
export type AttendanceStatus = ClassAttendanceStatus | 'presente' | 'falta' | 'reposicao' | 'trancado' | 'agendada';

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

export interface StudentResidenteData {
  projeto: string;
  dataInicio: string;
  dataTermino: string;
  condicoesResidencia?: string;
  valorTotal?: number;
  materiaisInclusos?: string;
  observacoes?: string;
}

export interface StudentPesquisadorData {
  projetoPesquisa: string;
  dataInicio: string;
  dataTermino?: string;
  atividadesPrevistas?: string;
  temCobranca: boolean;
  valorContribuicao?: number;
  observacoes?: string;
}

export interface StudentAulasPorHoraData {
  horasContratadas: number;
  valorPorHora: number;
  valorTotal: number;
  horasUtilizadas: number;
  horasAgendadas: number;
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
  modalidade: PlanType; // Aluno Regular: sempre 'mensal' contínuo
  valorPlano: number;
  dataInicioPlano: string;
  dataFimPlano?: string; // Não obrigatória para Aluno Regular contínuo!
  status: 'ativo' | 'trancado' | 'inadimplente' | 'finalizado';
  aulasTotaisPlano: number;
  aulasFeitas: number;
  aulasRestantes: number;
  trancamentosUtilizadosDias: number;
  
  // Ficha de matrícula completa
  registrationData: RegistrationFormData;
  dataMatricula: string;

  // NOVO CONCEITO: MEMBR@ OLLARIA E MULTI-MEMBRESIAS
  membresias?: MemberMembership[];
  servicosAtivos?: MembershipType[];
  
  horasConsultoriaContratadas?: number;
  horasConsultoriaUtilizadas?: number;
  coworkingHorasMensais?: number;
  professorModalidade?: 'sublocacao' | 'porcentagem';
  professorPercentualRepasse?: number;

  consultoriaData?: StudentConsultoriaData;
  coworkingData?: StudentCoworkingData;
  professorData?: StudentProfessorData;
  cursoData?: StudentCursoData;
  residenteData?: StudentResidenteData;
  pesquisadorData?: StudentPesquisadorData;
  aulasPorHoraData?: StudentAulasPorHoraData;
}

export type MembroOllaria = Student;

export interface AttendanceRecord {
  id: string;
  studentId: string;
  data: string; // Formato YYYY-MM-DD
  horario: string; // Ex: "15:20 - 17:50"
  horarioPrevisto?: string; // Ex: "15:20 - 17:50"
  horarioRealizado?: string; // Ex: "15:20 - 17:50" ou "15:50 - 17:50"
  duracaoPrevistaMinutos?: number; // Padrão: 150 minutos (2h30)
  duracaoRealizadaMinutos?: number; // Ex: 150 ou 120
  tempoNaoRealizadoMinutos?: number; // Ex: 30 minutos
  tempoAReporMinutos?: number; // Tempo calculado a repor
  turma?: string; // Ex: "quarta-tarde", "quarta-noite", "sabado-manha"
  status: AttendanceStatus; // "Realizada" | "Falta do membr@" | "Falta da Ollaria" | "Cancelada"
  classificacao?: ClassClassification; // "Mensalidade" | "Reposição" | "Extra"
  decisaoReposicao?: ReplacementDecision; // "Sem reposição" | "Reposição pendente de decisão" | "Reposição concedida"
  statusReposicao?: ReplacementStatus; // "Pendente" | "Agendada" | "Realizada" | "Cancelada" | "Dispensada"
  reposicaoId?: string; // ID da reposição gerada a partir desta falta/cancelamento
  reposicaoUtilizadaId?: string; // ID da reposição consumida nesta aula
  motivoAusenciaAlteracao?: string; // Motivo da falta/alteração/cancelamento
  responsabilidadeAusencia?: 'Membr@' | 'Ollaria' | 'Ambos' | 'Força Maior' | string;
  naoContabilizarMensalidade?: boolean; // Opção explícita de não contabilizar nas 4 aulas mensais
  temCobranca?: boolean; // Se há cobrança associada à aula
  valorCobranca?: number;
  descricaoCobranca?: string;
  statusCobranca?: 'pago' | 'pendente';
  transacaoId?: string; // ID da transação financeira gerada, se houver
  observacao?: string;
  registradoPor: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassReplacement {
  id: string;
  studentId: string;
  aulaOrigemId?: string; // Vinculada à aula original
  dataOrigem: string;
  motivo: string;
  responsabilidade?: 'Membr@' | 'Ollaria' | 'Ambos' | 'Força Maior' | string;
  tipo: 'aula_inteira' | 'tempo_minutos';
  quantidadeAulas: number; // Ex: 1 aula
  minutosOriginal: number; // Ex: 150 minutos ou 30 minutos
  minutosRestantes: number; // Ex: 150 min (ou 30 min se uso parcial)
  status: ReplacementStatus; // "Pendente" | "Agendada" | "Realizada" | "Cancelada" | "Dispensada"
  aulaAgendadaId?: string; // ID da aula futura em que foi agendada ou utilizada
  dataAgendada?: string;
  horarioAgendado?: string;
  turmaAgendada?: string;
  motivoDispensadaCancelada?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Helpers para garantir padronização rigorosa da nomenclatura
export function normalizeAttendanceStatus(rawStatus: string | undefined): ClassAttendanceStatus {
  if (!rawStatus) return 'Realizada';
  if (rawStatus === 'Realizada' || rawStatus === 'presente' || rawStatus === 'reposicao') return 'Realizada';
  if (rawStatus === 'Falta da Ollaria') return 'Falta da Ollaria';
  if (rawStatus === 'Cancelada' || rawStatus === 'trancado') return 'Cancelada';
  if (rawStatus === 'Falta do membr@' || rawStatus === 'falta') return 'Falta do membr@';
  return 'Realizada';
}

export function normalizeClassClassification(rec: Partial<AttendanceRecord> | undefined): ClassClassification {
  if (!rec) return 'Mensalidade';
  if (rec.classificacao) return rec.classificacao;
  if (rec.status === 'reposicao') return 'Reposição';
  return 'Mensalidade';
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

export type MembershipType =
  // FORMAÇÃO
  | 'aluno_regular'
  | 'aluno_curso'
  | 'professor_visitante'
  // SERVIÇOS
  | 'membro_queima'
  | 'membro_consultoria'
  | 'cliente_queima' // alias compatibilidade
  | 'cliente_consultoria' // alias compatibilidade
  // PESQUISA E PRODUÇÃO
  | 'membro_pesquisador'
  | 'artista_residente'
  | 'artista_coworking';

export type ServiceType = MembershipType;

export type MembershipCategory = 'formacao' | 'servicos' | 'pesquisa_producao';

export type MembershipStatus = 'ativa' | 'inativa' | 'suspensa' | 'encerrada';

export interface MemberMembership {
  id: string;
  tipo: MembershipType;
  status: MembershipStatus;
  dataInicio: string;
  dataTermino?: string; // Obrigatória para Curso e Residência; NÃO exigida para Aluno Regular contínuo!
  observacoes?: string;
  modalidadeContratacao?: string; // 'mensal' | 'curso' | 'horas' | 'servico' | 'sublocacao' | 'percentual' | 'periodo'
}

export type FiringStatus =
  | 'aguardando_recebimento'
  | 'recebida'
  | 'aguardando_queima'
  | 'agendada'
  | 'em_queima'
  | 'queima_concluida'
  | 'aguardando_retirada'
  | 'retirada'
  | 'cancelada'
  // compatibilidade com registros anteriores
  | 'solicitado'
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

export const MEMBERSHIP_DEFINITIONS: Record<
  MembershipType,
  {
    titulo: string;
    categoria: MembershipCategory;
    categoriaLabel: string;
    contratacaoPrincipal: string;
    corBadge: string;
    descricao: string;
  }
> = {
  aluno_regular: {
    titulo: 'Aluno Regular',
    categoria: 'formacao',
    categoriaLabel: 'Formação',
    contratacaoPrincipal: 'Mensalidade Contínua',
    corBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    descricao: 'Aulas recorrentes com cobrança mensal contínua, frequência e reposições.'
  },
  aluno_curso: {
    titulo: 'Aluno de Curso',
    categoria: 'formacao',
    categoriaLabel: 'Formação',
    contratacaoPrincipal: 'Curso com início e fim',
    corBadge: 'bg-sky-100 text-sky-800 border-sky-200',
    descricao: 'Curso fechado com ciclo Início -> Desenvolvimento -> Conclusão.'
  },
  professor_visitante: {
    titulo: 'Professor Visitante',
    categoria: 'formacao',
    categoriaLabel: 'Formação',
    contratacaoPrincipal: 'Sublocação ou Percentual',
    corBadge: 'bg-purple-100 text-purple-800 border-purple-200',
    descricao: 'Mestre visitante com modelo de sublocação de espaço ou percentual de turma.'
  },
  membro_queima: {
    titulo: 'Membro de Queima',
    categoria: 'servicos',
    categoriaLabel: 'Serviços',
    contratacaoPrincipal: 'Serviço por queima',
    corBadge: 'bg-amber-100 text-amber-800 border-amber-200',
    descricao: 'Utilização dos fornos cerâmicos com controle de 9 etapas de queima.'
  },
  cliente_queima: {
    titulo: 'Membro de Queima',
    categoria: 'servicos',
    categoriaLabel: 'Serviços',
    contratacaoPrincipal: 'Serviço por queima',
    corBadge: 'bg-amber-100 text-amber-800 border-amber-200',
    descricao: 'Utilização dos fornos cerâmicos com controle de 9 etapas de queima.'
  },
  membro_consultoria: {
    titulo: 'Membro de Consultoria',
    categoria: 'servicos',
    categoriaLabel: 'Serviços',
    contratacaoPrincipal: 'Contratação por Horas',
    corBadge: 'bg-orange-100 text-orange-800 border-orange-200',
    descricao: 'Atendimentos técnicos e consultorias com banco de horas contratadas e saldo.'
  },
  cliente_consultoria: {
    titulo: 'Membro de Consultoria',
    categoria: 'servicos',
    categoriaLabel: 'Serviços',
    contratacaoPrincipal: 'Contratação por Horas',
    corBadge: 'bg-orange-100 text-orange-800 border-orange-200',
    descricao: 'Atendimentos técnicos e consultorias com banco de horas contratadas e saldo.'
  },
  membro_pesquisador: {
    titulo: 'Membro Pesquisador',
    categoria: 'pesquisa_producao',
    categoriaLabel: 'Pesquisa e Produção',
    contratacaoPrincipal: 'Projeto / Período',
    corBadge: 'bg-teal-100 text-teal-800 border-teal-200',
    descricao: 'Pesquisa em cerâmica, testes de massas, queimas e materiais.'
  },
  artista_residente: {
    titulo: 'Artista Residente',
    categoria: 'pesquisa_producao',
    categoriaLabel: 'Pesquisa e Produção',
    contratacaoPrincipal: 'Período / Projeto definido',
    corBadge: 'bg-rose-100 text-rose-800 border-rose-200',
    descricao: 'Residência artística com duração previamente definida e produção de acervo.'
  },
  artista_coworking: {
    titulo: 'Artista Coworking',
    categoria: 'pesquisa_producao',
    categoriaLabel: 'Pesquisa e Produção',
    contratacaoPrincipal: 'Horas de uso do ateliê',
    corBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    descricao: 'Uso de bancadas, tornos elétricos e infraestrutura com agendamento prévio.'
  }
};

export function getMemberMonthlyClassSummary(
  studentId: string,
  attendanceList: AttendanceRecord[],
  replacementsList: ClassReplacement[] = [],
  targetMonth?: string // YYYY-MM, padrão: mês atual
) {
  const currentMonthStr = targetMonth || new Date().toISOString().substring(0, 7);
  
  // Aulas do mês selecionado para o membr@
  const monthAttendance = attendanceList.filter((a) => {
    return a.studentId === studentId && (a.data || '').startsWith(currentMonthStr);
  });

  // Aulas realizadas da mensalidade (Classificação = Mensalidade e Status = Realizada, sem flag de desconsiderar)
  const mensalidadeRealizadas = monthAttendance.filter((a) => {
    const status = normalizeAttendanceStatus(a.status);
    const classif = normalizeClassClassification(a);
    return status === 'Realizada' && classif === 'Mensalidade' && !a.naoContabilizarMensalidade;
  });

  // Reposições realizadas no mês
  const reposicoesRealizadasNoMes = monthAttendance.filter((a) => {
    const status = normalizeAttendanceStatus(a.status);
    const classif = normalizeClassClassification(a);
    return status === 'Realizada' && classif === 'Reposição';
  });

  // Aulas extras realizadas no mês
  const extrasRealizadasNoMes = monthAttendance.filter((a) => {
    const status = normalizeAttendanceStatus(a.status);
    const classif = normalizeClassClassification(a);
    return status === 'Realizada' && classif === 'Extra';
  });

  // Faltas no mês
  const faltasMembroNoMes = monthAttendance.filter((a) => normalizeAttendanceStatus(a.status) === 'Falta do membr@');
  const faltasOllariaNoMes = monthAttendance.filter((a) => normalizeAttendanceStatus(a.status) === 'Falta da Ollaria');
  const canceladasNoMes = monthAttendance.filter((a) => normalizeAttendanceStatus(a.status) === 'Cancelada');

  // Reposições gerais do aluno
  const studentReplacements = replacementsList.filter((r) => r.studentId === studentId);
  const reposicoesPendentes = studentReplacements.filter((r) => r.status === 'Pendente');
  const reposicoesAgendadas = studentReplacements.filter((r) => r.status === 'Agendada');
  const reposicoesRealizadasTotal = studentReplacements.filter((r) => r.status === 'Realizada');
  const reposicoesCanceladasTotal = studentReplacements.filter((r) => r.status === 'Cancelada');
  const reposicoesDispensadasTotal = studentReplacements.filter((r) => r.status === 'Dispensada');

  const minutosPendentes = reposicoesPendentes.reduce((acc, r) => acc + (r.minutosRestantes || 0), 0);
  const aulasInteirasPendentes = reposicoesPendentes.filter((r) => r.tipo === 'aula_inteira' && (r.minutosRestantes > 0 || r.quantidadeAulas > 0)).length;

  const countMensalidade = mensalidadeRealizadas.length;
  const limiteAtingido = countMensalidade >= 4;

  return {
    mesAno: currentMonthStr,
    countMensalidade, // ex: 1, 2, 3 ou 4
    totalMensalidadeMax: 4,
    limiteAtingido,
    countReposicoesMes: reposicoesRealizadasNoMes.length,
    countExtrasMes: extrasRealizadasNoMes.length,
    faltasMembroNoMes: faltasMembroNoMes.length,
    faltasOllariaNoMes: faltasOllariaNoMes.length,
    canceladasNoMes: canceladasNoMes.length,
    totalAulasMes: monthAttendance.length,
    // Reposições
    studentReplacements,
    reposicoesPendentes,
    reposicoesAgendadas,
    reposicoesRealizadasTotal,
    reposicoesCanceladasTotal,
    reposicoesDispensadasTotal,
    minutosPendentes,
    aulasInteirasPendentes,
    totalReposicoesPendentesCount: reposicoesPendentes.length,
    totalReposicoesAgendadasCount: reposicoesAgendadas.length
  };
}

