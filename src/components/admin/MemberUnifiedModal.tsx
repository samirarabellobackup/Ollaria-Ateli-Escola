import React, { useState } from 'react';
import {
  Student,
  MembershipType,
  MembershipStatus,
  FiringStatus,
  PaymentMethod,
  MEMBERSHIP_DEFINITIONS,
  FiringOrder,
  MaterialUsage,
  CoworkingBooking,
  ConsultingAppointment
} from '../../types';
import { useStudio } from '../../context/StudioContext';
import {
  X,
  User,
  Layers,
  Flame,
  Clock,
  Sparkles,
  Calendar,
  CreditCard,
  History,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Send,
  Shield,
  FileText,
  PackageCheck,
  Building,
  GraduationCap
} from 'lucide-react';

interface MemberUnifiedModalProps {
  isOpen: boolean;
  member: Student | null;
  onClose: () => void;
}

export const MemberUnifiedModal: React.FC<MemberUnifiedModalProps> = ({
  isOpen,
  member,
  onClose
}) => {
  const {
    updateStudent,
    updateUserServicesData,
    firings,
    addFiringOrder,
    updateFiringOrderStatus,
    deleteFiringOrder,
    consultingAppointments,
    addConsultingAppointment,
    updateConsultingAppointmentStatus,
    coworkingBookings,
    addCoworkingBooking,
    updateCoworkingBookingStatus,
    materialsUsage,
    registerMaterialUsage,
    deleteMaterialUsage,
    transactions,
    addTransaction,
    markTransactionAsPaid,
    deleteTransaction,
    auditLogs,
    addAuditLog
  } = useStudio();

  const [activeTab, setActiveTab] = useState<
    'membresias' | 'operacional' | 'materiais' | 'financeiro' | 'historico'
  >('membresias');

  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form states for new firing order
  const [isAddFiringOpen, setIsAddFiringOpen] = useState(false);
  const [firingIdentificacao, setFiringIdentificacao] = useState('');
  const [firingTipo, setFiringTipo] = useState<'biscoito_baixa' | 'esmalte_alta' | 'outro'>('esmalte_alta');
  const [firingTemperatura, setFiringTemperatura] = useState('1220°C');
  const [firingQtdPecas, setFiringQtdPecas] = useState(6);
  const [firingValor, setFiringValor] = useState(90);
  const [firingDataEntrada, setFiringDataEntrada] = useState(() => new Date().toISOString().split('T')[0]);
  const [firingDataPrevista, setFiringDataPrevista] = useState('');
  const [firingStatus, setFiringStatus] = useState<FiringStatus>('aguardando_recebimento');
  const [firingObs, setFiringObs] = useState('');

  // Form states for new material usage
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [matNome, setMatNome] = useState('Argila Terracota Nacional');
  const [matQtd, setMatQtd] = useState(2);
  const [matUnidade, setMatUnidade] = useState('kg');
  const [matValorUnitario, setMatValorUnitario] = useState(12.00);
  const [matServico, setMatServico] = useState<MembershipType>('aluno_regular');
  const [matCompensacao, setMatCompensacao] = useState<'cobrar' | 'repor' | 'incluido'>('cobrar');
  const [matData, setMatData] = useState(() => new Date().toISOString().split('T')[0]);
  const [matObs, setMatObs] = useState('');

  // Form states for consulting
  const [isAddConsultingOpen, setIsAddConsultingOpen] = useState(false);
  const [consultData, setConsultData] = useState(() => new Date().toISOString().split('T')[0]);
  const [consultHorario, setConsultHorario] = useState('14:00 às 16:00');
  const [consultDuracao, setConsultDuracao] = useState(2);
  const [consultTema, setConsultTema] = useState('');

  // Form states for coworking booking
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [bookData, setBookData] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookHorario, setBookHorario] = useState('14:00 às 18:00');
  const [bookHoras, setBookHoras] = useState(4);
  const [bookObs, setBookObs] = useState('Uso de torno elétrico Shimpo e bancada de acabamento.');

  if (!isOpen || !member) return null;

  const activeServices: MembershipType[] =
    member.servicosAtivos && member.servicosAtivos.length > 0
      ? member.servicosAtivos
      : ['aluno_regular'];

  // Filter records for this member
  const memberFirings = firings.filter((f) => f.userId === member.id);
  const memberConsultings = consultingAppointments.filter((c) => c.userId === member.id);
  const memberBookings = coworkingBookings.filter((b) => b.userId === member.id);
  const memberMaterials = materialsUsage.filter((m) => m.userId === member.id);
  const memberTransactions = transactions.filter((t) => t.studentId === member.id);
  const memberLogs = auditLogs.filter((l) => l.userId === member.id);

  // Financial separation calculations
  const totalServiceCharges = memberTransactions
    .filter((t) => t.categoria === 'mensalidade' || t.categoria === 'queima' || t.categoria === 'consultoria' || t.categoria === 'coworking' || t.categoria === 'curso')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalMaterialCharges = memberTransactions
    .filter((t) => t.categoria === 'material' || t.categoria === 'argila')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalOtherCharges = memberTransactions
    .filter((t) => t.categoria === 'ferramentas' || t.categoria === 'outro' || t.categoria === 'servico')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalGeneral = memberTransactions.reduce((sum, t) => sum + t.valor, 0);
  const totalPaid = memberTransactions.filter((t) => t.status === 'pago').reduce((sum, t) => sum + t.valor, 0);
  const totalPending = memberTransactions.filter((t) => t.status !== 'pago').reduce((sum, t) => sum + t.valor, 0);

  // Consulting hours calculations
  const consultoriaContratadas = member.consultoriaData?.horasContratadas || member.horasConsultoriaContratadas || 0;
  const consultoriaUtilizadas = member.consultoriaData?.horasUtilizadas || member.horasConsultoriaUtilizadas || 0;
  const consultoriaAgendadas = member.consultoriaData?.horasAgendadas || 0;
  const consultoriaDisponiveis = Math.max(0, consultoriaContratadas - consultoriaUtilizadas);

  // Coworking hours calculations
  const coworkingContratadas = member.coworkingData?.horasContratadas || member.coworkingHorasMensais || 0;
  const coworkingUtilizadas = member.coworkingData?.horasUtilizadas || 0;
  const coworkingAgendadas = member.coworkingData?.horasAgendadas || 0;
  const coworkingDisponiveis = Math.max(0, coworkingContratadas - coworkingUtilizadas);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleToggleMembership = (tipo: MembershipType) => {
    const exists = activeServices.includes(tipo);
    let updated: MembershipType[];
    if (exists) {
      if (activeServices.length === 1) {
        showFeedback('Aviso: Um membr@ deve possuir ao menos uma membresia ativa.');
        return;
      }
      updated = activeServices.filter((x) => x !== tipo);
    } else {
      updated = [...activeServices, tipo];
    }

    updateUserServicesData(member.id, {
      servicosAtivos: updated,
      membresias: updated.map((t, idx) => ({
        id: `mem-${member.id}-${t}-${idx}`,
        tipo: t,
        status: 'ativa',
        dataInicio: new Date().toISOString().split('T')[0],
        modalidadeContratacao: t === 'aluno_regular' ? 'mensal' : t === 'membro_queima' ? 'servico' : 'horas'
      }))
    });

    addAuditLog({
      userId: member.id,
      userName: member.nome,
      modulo: 'membresia',
      acao: exists ? 'Remoção de Membresia' : 'Adição de Membresia',
      novaInfo: `${exists ? 'Removido' : 'Adicionado'}: ${MEMBERSHIP_DEFINITIONS[tipo]?.titulo || tipo}`,
      responsavel: 'Coordenação (Sah Pereira)'
    });

    showFeedback(`Membresias atualizadas com sucesso!`);
  };

  const handleSaveFiring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firingIdentificacao.trim()) return;

    addFiringOrder({
      userId: member.id,
      identificacao: firingIdentificacao.trim(),
      tipoQueima: firingTipo,
      temperatura: firingTemperatura,
      quantidadePecas: firingQtdPecas,
      pecasEntregues: firingQtdPecas,
      status: firingStatus,
      observacoes: firingObs,
      dataEntrada: firingDataEntrada,
      dataPrevista: firingDataPrevista || undefined,
      valorQueima: firingValor,
      valorPago: 0,
      formaPagamento: 'pix'
    });

    setIsAddFiringOpen(false);
    setFiringIdentificacao('');
    setFiringObs('');
    showFeedback('Queima registrada com sucesso no perfil do membr@!');
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matNome.trim() || matQtd <= 0) return;

    registerMaterialUsage({
      userId: member.id,
      userName: member.nome,
      material: matNome.trim(),
      quantidade: matQtd,
      unidade: matUnidade,
      valorUnitario: matValorUnitario,
      servicoRelacionado: matServico,
      formaCompensacao: matCompensacao,
      data: matData,
      observacoes: matObs,
      statusCobranca: matCompensacao === 'cobrar' ? 'pendente' : 'nao_aplicavel'
    });

    setIsAddMaterialOpen(false);
    setMatObs('');
    showFeedback(`Material registrado (${matCompensacao === 'cobrar' ? 'lançado no financeiro' : matCompensacao})!`);
  };

  const handleSaveConsulting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultTema.trim()) return;

    addConsultingAppointment({
      userId: member.id,
      data: consultData,
      horario: consultHorario,
      duracaoHoras: consultDuracao,
      temaObservacoes: consultTema.trim(),
      status: 'agendado'
    });

    // Update utilized/scheduled hours
    const currentContratadas = member.consultoriaData?.horasContratadas || 10;
    const currentUtilizadas = member.consultoriaData?.horasUtilizadas || 0;
    const currentAgendadas = (member.consultoriaData?.horasAgendadas || 0) + consultDuracao;

    updateUserServicesData(member.id, {
      consultoriaData: {
        horasContratadas: currentContratadas,
        horasUtilizadas: currentUtilizadas,
        horasAgendadas: currentAgendadas,
        valorHora: member.consultoriaData?.valorHora || 150,
        observacoes: member.consultoriaData?.observacoes
      }
    });

    setIsAddConsultingOpen(false);
    setConsultTema('');
    showFeedback('Atendimento de consultoria registrado com sucesso!');
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();

    addCoworkingBooking({
      userId: member.id,
      data: bookData,
      horario: bookHorario,
      horas: bookHoras,
      status: 'confirmado',
      observacoes: bookObs
    });

    setIsAddBookingOpen(false);
    showFeedback('Horário de coworking agendado e confirmado!');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-[#FAF8F5] w-full max-w-4xl rounded-3xl border border-[#E6DFD5] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#2C241E] text-white flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D97736] to-[#A84A1A] flex items-center justify-center text-white text-lg font-bold shadow-xs shrink-0">
              {member.nome.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E6A15C] text-[#2C241E]">
                  Membr@ Ollaria
                </span>
                <span className="text-xs font-mono text-[#D5CBC0]">
                  {member.accessCode}
                </span>
                <span className="text-xs text-[#A8988B]">
                  • PIN: {member.pin}
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">
                {member.nome}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#D5CBC0] hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Main Tabs */}
        <div className="px-6 pt-4 border-b border-[#E6DFD5] bg-white flex gap-2 overflow-x-auto">
          {[
            { id: 'membresias', label: 'Membresias & Participação', icon: Layers, badge: activeServices.length },
            { id: 'operacional', label: 'Gestão Operacional por Tipo', icon: Sparkles },
            { id: 'materiais', label: 'Materiais Utilizados', icon: PackageCheck, badge: memberMaterials.length || undefined },
            { id: 'financeiro', label: 'Financeiro Discriminado', icon: CreditCard, badge: totalPending > 0 ? `R$ ${totalPending.toFixed(0)}` : undefined },
            { id: 'historico', label: 'Histórico & Auditoria', icon: History, badge: memberLogs.length || undefined }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#D97736] text-[#D97736] bg-[#FAF8F5]'
                    : 'border-transparent text-[#7A6A5E] hover:text-[#2C241E]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#D97736] text-white' : 'bg-[#EBE4DA] text-[#7A6A5E]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">

          {/* TAB 1: MEMBRESIAS & PARTICIPAÇÃO */}
          {activeTab === 'membresias' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  Tipos de Membr@ Ollaria & Participação
                </h3>
                <p className="text-xs text-[#7A6A5E] mt-0.5">
                  1 Pessoa → 1 Cadastro → 1 Conta → Múltiplas Membresias simultâneas. Clique nos cartões para ativar ou desativar categorias de participação para este membr@.
                </p>
              </div>

              {/* Group 1: FORMAÇÃO */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#D97736]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A6A5E]">
                    Formação
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { tipo: 'aluno_regular' as MembershipType, titulo: 'Aluno Regular', desc: 'Mensalidade contínua (4 aulas/mês). Matrícula sem data de término.', badge: 'Mensal Contínuo' },
                    { tipo: 'aluno_curso' as MembershipType, titulo: 'Aluno de Curso', desc: 'Curso com início e término definidos. Ciclo: Início → Desenv. → Conclusão.', badge: 'Início & Fim' },
                    { tipo: 'professor_visitante' as MembershipType, titulo: 'Professor Visitante', desc: 'Modelo de sublocação de espaço ou percentual acordado sobre turma.', badge: 'Sublocação/Percentual' }
                  ].map((cat) => {
                    const isChecked = activeServices.includes(cat.tipo);
                    return (
                      <div
                        key={cat.tipo}
                        onClick={() => handleToggleMembership(cat.tipo)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#D97736] bg-[#D97736]/10 ring-1 ring-[#D97736]'
                            : 'border-[#E6DFD5] bg-white hover:border-[#D5CBC0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#2C241E]">{cat.titulo}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isChecked ? 'bg-[#D97736] text-white' : 'bg-[#EBE4DA] text-[#7A6A5E]'
                          }`}>
                            {isChecked ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5A4D] mt-1.5 leading-relaxed">{cat.desc}</p>
                        <span className="inline-block mt-2 text-[10px] font-semibold text-[#A84A1A] bg-[#FAF0E6] px-2 py-0.5 rounded-md">
                          {cat.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: SERVIÇOS */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#D97736]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A6A5E]">
                    Serviços
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { tipo: 'membro_queima' as MembershipType, titulo: 'Membro de Queima', desc: 'Cobrança por serviço de queima. Controle rigoroso de 9 etapas de forno.', badge: 'Por Queima' },
                    { tipo: 'membro_consultoria' as MembershipType, titulo: 'Membro de Consultoria', desc: 'Contratação baseada em horas. Controle de contratadas, utilizadas e saldo.', badge: 'Banco de Horas' }
                  ].map((cat) => {
                    const isChecked = activeServices.includes(cat.tipo) || (cat.tipo === 'membro_queima' && activeServices.includes('cliente_queima')) || (cat.tipo === 'membro_consultoria' && activeServices.includes('cliente_consultoria'));
                    return (
                      <div
                        key={cat.tipo}
                        onClick={() => handleToggleMembership(cat.tipo)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#D97736] bg-[#D97736]/10 ring-1 ring-[#D97736]'
                            : 'border-[#E6DFD5] bg-white hover:border-[#D5CBC0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#2C241E]">{cat.titulo}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isChecked ? 'bg-[#D97736] text-white' : 'bg-[#EBE4DA] text-[#7A6A5E]'
                          }`}>
                            {isChecked ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5A4D] mt-1.5 leading-relaxed">{cat.desc}</p>
                        <span className="inline-block mt-2 text-[10px] font-semibold text-[#A84A1A] bg-[#FAF0E6] px-2 py-0.5 rounded-md">
                          {cat.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: PESQUISA E PRODUÇÃO */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#D97736]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A6A5E]">
                    Pesquisa e Produção
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { tipo: 'artista_coworking' as MembershipType, titulo: 'Artista Coworking', desc: 'Contratação por horas de uso do espaço/tornos com agendamento.', badge: 'Horas de Ateliê' },
                    { tipo: 'artista_residente' as MembershipType, titulo: 'Artista Residente', desc: 'Residência baseada em projeto e período fechado com início e fim.', badge: 'Período/Projeto' },
                    { tipo: 'membro_pesquisador' as MembershipType, titulo: 'Membro Pesquisador', desc: 'Pesquisa acadêmica ou técnica de materiais, queimas e cerâmica.', badge: 'Pesquisa' }
                  ].map((cat) => {
                    const isChecked = activeServices.includes(cat.tipo);
                    return (
                      <div
                        key={cat.tipo}
                        onClick={() => handleToggleMembership(cat.tipo)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#D97736] bg-[#D97736]/10 ring-1 ring-[#D97736]'
                            : 'border-[#E6DFD5] bg-white hover:border-[#D5CBC0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#2C241E]">{cat.titulo}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isChecked ? 'bg-[#D97736] text-white' : 'bg-[#EBE4DA] text-[#7A6A5E]'
                          }`}>
                            {isChecked ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5A4D] mt-1.5 leading-relaxed">{cat.desc}</p>
                        <span className="inline-block mt-2 text-[10px] font-semibold text-[#A84A1A] bg-[#FAF0E6] px-2 py-0.5 rounded-md">
                          {cat.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTÃO OPERACIONAL POR TIPO DE MEMBRESIA */}
          {activeTab === 'operacional' && (
            <div className="space-y-6">
              
              {/* Aluno Regular */}
              {activeServices.includes('aluno_regular') && (
                <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-2.5">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-sm text-[#2C241E]">
                        Membresia: Aluno Regular (Mensalidade Contínua)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Recorrente Contínuo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Turma:</span>
                      <strong className="text-[#2C241E] text-sm capitalize">{member.turma}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Aulas Realizadas:</span>
                      <strong className="text-[#2C241E] text-sm">{member.aulasFeitas} / 4 no ciclo</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Mensalidade:</span>
                      <strong className="text-[#D97736] text-sm">R$ {member.valorPlano.toFixed(2)}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Data de Início:</span>
                      <strong className="text-[#2C241E] text-sm">{member.dataInicioPlano}</strong>
                      <span className="text-[10px] text-[#7A6A5E] block italic">Sem data de término (contínua)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Membro de Queima */}
              {(activeServices.includes('membro_queima') || activeServices.includes('cliente_queima')) && (
                <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-600" />
                      <h4 className="font-bold text-sm text-[#2C241E]">
                        Membresia: Membro de Queima (Controle de 9 Etapas)
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsAddFiringOpen(!isAddFiringOpen)}
                      className="px-3 py-1.5 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Lançar Queima
                    </button>
                  </div>

                  {/* Add firing form */}
                  {isAddFiringOpen && (
                    <form onSubmit={handleSaveFiring} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Identificação do Lote / Peças *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Lote 03 - 10 Tigelas e 2 Pratos"
                            value={firingIdentificacao}
                            onChange={(e) => setFiringIdentificacao(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Tipo de Queima</label>
                          <select
                            value={firingTipo}
                            onChange={(e) => setFiringTipo(e.target.value as any)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          >
                            <option value="esmalte_alta">Esmalte Alta (1220°C)</option>
                            <option value="biscoito_baixa">Biscoito Baixa (980°C)</option>
                            <option value="outro">Especial / Raku / Lustre</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Temperatura</label>
                          <input
                            type="text"
                            value={firingTemperatura}
                            onChange={(e) => setFiringTemperatura(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Qtd Peças</label>
                          <input
                            type="number"
                            min="1"
                            value={firingQtdPecas}
                            onChange={(e) => setFiringQtdPecas(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Valor do Serviço (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={firingValor}
                            onChange={(e) => setFiringValor(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs font-bold text-[#D97736]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Status da Queima</label>
                          <select
                            value={firingStatus}
                            onChange={(e) => setFiringStatus(e.target.value as FiringStatus)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs font-bold"
                          >
                            <option value="aguardando_recebimento">1. Aguardando recebimento</option>
                            <option value="recebida">2. Recebida</option>
                            <option value="aguardando_queima">3. Aguardando queima</option>
                            <option value="agendada">4. Agendada</option>
                            <option value="em_queima">5. Em queima</option>
                            <option value="queima_concluida">6. Queima concluída</option>
                            <option value="aguardando_retirada">7. Aguardando retirada</option>
                            <option value="retirada">8. Retirada</option>
                            <option value="cancelada">9. Cancelada</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddFiringOpen(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#D5CBC0] text-xs text-[#7A6A5E]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#2C241E] text-white text-xs font-bold"
                        >
                          Salvar Queima
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of firings */}
                  {memberFirings.length === 0 ? (
                    <p className="text-xs text-[#7A6A5E] italic py-2">Nenhuma queima registrada para este membr@ ainda.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {memberFirings.map((fire) => (
                        <div key={fire.id} className="p-3.5 rounded-xl border border-[#E6DFD5] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-[#2C241E] text-sm">{fire.identificacao}</strong>
                              <span className="font-mono text-[11px] text-[#7A6A5E]">({fire.quantidadePecas} peças • {fire.temperatura})</span>
                            </div>
                            <p className="text-[#7A6A5E] mt-0.5">
                              Entrada: {fire.dataEntrada} • Valor: <strong className="text-[#D97736]">R$ {fire.valorQueima.toFixed(2)}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={fire.status}
                              onChange={(e) => updateFiringOrderStatus(fire.id, e.target.value as FiringStatus)}
                              className="px-2.5 py-1 rounded-lg border border-[#D5CBC0] bg-white text-xs font-bold text-[#2C241E]"
                            >
                              <option value="aguardando_recebimento">Aguardando recebimento</option>
                              <option value="recebida">Recebida</option>
                              <option value="aguardando_queima">Aguardando queima</option>
                              <option value="agendada">Agendada</option>
                              <option value="em_queima">Em queima</option>
                              <option value="queima_concluida">Queima concluída</option>
                              <option value="aguardando_retirada">Aguardando retirada</option>
                              <option value="retirada">Retirada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>

                            <button
                              onClick={() => deleteFiringOrder(fire.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                              title="Excluir queima"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Membro de Consultoria */}
              {(activeServices.includes('membro_consultoria') || activeServices.includes('cliente_consultoria')) && (
                <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <h4 className="font-bold text-sm text-[#2C241E]">
                        Membresia: Membro de Consultoria (Banco de Horas)
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsAddConsultingOpen(!isAddConsultingOpen)}
                      className="px-3 py-1.5 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Registrar Atendimento
                    </button>
                  </div>

                  {/* Hours summary cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5]">
                      <span className="text-[#7A6A5E] block">Horas Contratadas:</span>
                      <strong className="text-base text-[#2C241E]">{consultoriaContratadas}h</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5]">
                      <span className="text-[#7A6A5E] block">Horas Utilizadas:</span>
                      <strong className="text-base text-emerald-700">{consultoriaUtilizadas}h</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5]">
                      <span className="text-[#7A6A5E] block">Horas Agendadas:</span>
                      <strong className="text-base text-amber-700">{consultoriaAgendadas}h</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#F3DFC7]">
                      <span className="text-[#A84A1A] block font-bold">Saldo Disponível:</span>
                      <strong className="text-base text-[#D97736] font-bold">{consultoriaDisponiveis}h</strong>
                    </div>
                  </div>

                  {isAddConsultingOpen && (
                    <form onSubmit={handleSaveConsulting} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Data</label>
                          <input
                            type="date"
                            value={consultData}
                            onChange={(e) => setConsultData(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Horário</label>
                          <input
                            type="text"
                            value={consultHorario}
                            onChange={(e) => setConsultHorario(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Duração (horas)</label>
                          <input
                            type="number"
                            min="1"
                            value={consultDuracao}
                            onChange={(e) => setConsultDuracao(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Tema / Observações do Atendimento *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Curvas de queima no controlador Novus e formulação de esmaltes"
                          value={consultTema}
                          onChange={(e) => setConsultTema(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddConsultingOpen(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#D5CBC0] text-xs text-[#7A6A5E]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#2C241E] text-white text-xs font-bold"
                        >
                          Confirmar Atendimento
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of appointments */}
                  <div className="space-y-2">
                    {memberConsultings.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl border border-[#E6DFD5] bg-[#FAF8F5] flex items-center justify-between gap-3 text-xs">
                        <div>
                          <strong className="text-[#2C241E]">{c.data} ({c.horario}) — {c.duracaoHoras}h</strong>
                          <p className="text-[#7A6A5E]">{c.temaObservacoes}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          c.status === 'realizado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Artista Coworking */}
              {activeServices.includes('artista_coworking') && (
                <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-sm text-[#2C241E]">
                        Membresia: Artista Coworking (Uso de Espaço / Tornos)
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsAddBookingOpen(!isAddBookingOpen)}
                      className="px-3 py-1.5 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agendar Horário
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Horas Contratadas:</span>
                      <strong className="text-base text-[#2C241E]">{coworkingContratadas}h</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Horas Utilizadas:</span>
                      <strong className="text-base text-emerald-700">{coworkingUtilizadas}h</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Horas Agendadas:</span>
                      <strong className="text-base text-amber-700">{coworkingAgendadas}h</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFF8EE]">
                      <span className="text-[#A84A1A] block font-bold">Saldo Disponível:</span>
                      <strong className="text-base text-[#D97736] font-bold">{coworkingDisponiveis}h</strong>
                    </div>
                  </div>

                  {isAddBookingOpen && (
                    <form onSubmit={handleSaveBooking} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Data</label>
                          <input
                            type="date"
                            value={bookData}
                            onChange={(e) => setBookData(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Horário</label>
                          <input
                            type="text"
                            value={bookHorario}
                            onChange={(e) => setBookHorario(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Horas Solicitadas</label>
                          <input
                            type="number"
                            min="1"
                            value={bookHoras}
                            onChange={(e) => setBookHoras(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddBookingOpen(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#D5CBC0] text-xs text-[#7A6A5E]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#2C241E] text-white text-xs font-bold"
                        >
                          Confirmar Horário
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Bookings list */}
                  <div className="space-y-2">
                    {memberBookings.map((b) => (
                      <div key={b.id} className="p-3 rounded-xl border border-[#E6DFD5] bg-[#FAF8F5] flex items-center justify-between gap-3 text-xs">
                        <div>
                          <strong className="text-[#2C241E]">{b.data} ({b.horario}) — {b.horas}h</strong>
                          <p className="text-[#7A6A5E]">{b.observacoes}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={b.status}
                            onChange={(e) => updateCoworkingBookingStatus(b.id, e.target.value as any)}
                            className="px-2.5 py-1 rounded-lg border border-[#D5CBC0] bg-white text-xs font-bold"
                          >
                            <option value="solicitado">Solicitado</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="realizado">Realizado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professor Visitante */}
              {activeServices.includes('professor_visitante') && (
                <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-2.5">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-sm text-[#2C241E]">
                        Membresia: Professor Visitante (Sublocação ou Percentual)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {member.professorData?.tipoAcordo === 'sublocacao_espaco' ? 'Sublocação' : 'Percentual Turma'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Turma:</span>
                      <strong className="text-[#2C241E]">{member.professorData?.nomeTurma || 'Workshop Especial'}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Participantes:</span>
                      <strong className="text-[#2C241E]">{member.professorData?.quantidadeAlunos || 0} alunos</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Percentual Acordado:</span>
                      <strong className="text-[#D97736]">{member.professorData?.percentualAcordado || 40}%</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Valor Devido:</span>
                      <strong className="text-emerald-700 font-bold">R$ {member.professorData?.valorDevidoProfessor?.toFixed(2) || '0.00'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Aluno de Curso */}
              {activeServices.includes('aluno_curso') && (
                <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-2.5">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-sky-600" />
                      <h4 className="font-bold text-sm text-[#2C241E]">
                        Membresia: Aluno de Curso (Duração Definida)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase">
                      Ciclo: {member.cursoData?.statusCiclo || 'Desenvolvimento'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] sm:col-span-2">
                      <span className="text-[#7A6A5E] block">Curso:</span>
                      <strong className="text-[#2C241E]">{member.cursoData?.nomeCurso || 'Imersão em Cerâmica'}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Encontros:</span>
                      <strong className="text-[#2C241E]">{member.cursoData?.encontrosRealizados || 0} / {member.cursoData?.quantidadeEncontros || 8} realizados</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[#7A6A5E] block">Término Obrigatório:</span>
                      <strong className="text-[#2C241E]">{member.cursoData?.dataTermino || '31/10/2026'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Artista Residente & Pesquisador */}
              {activeServices.includes('artista_residente') && (
                <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-2">
                  <h4 className="font-bold text-sm text-[#2C241E]">Membresia: Artista Residente</h4>
                  <p className="text-xs text-[#7A6A5E]">Projeto com período de permanência delimitado e acompanhamento de ateliê.</p>
                </div>
              )}
              {activeServices.includes('membro_pesquisador') && (
                <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-2">
                  <h4 className="font-bold text-sm text-[#2C241E]">Membresia: Membro Pesquisador</h4>
                  <p className="text-xs text-[#7A6A5E]">Pesquisa e experimentos cerâmicos autorais.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MATERIAIS UTILIZADOS */}
          {activeTab === 'materiais' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                    Consumo de Materiais do Ateliê
                  </h3>
                  <p className="text-xs text-[#7A6A5E]">
                    Permite registrar consumo para qualquer membresia e definir: Cobrar (lança no financeiro), Repor (obrigação de reposição) ou Incluído.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddMaterialOpen(!isAddMaterialOpen)}
                  className="px-3.5 py-2 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Lançar Material
                </button>
              </div>

              {/* Add Material Form */}
              {isAddMaterialOpen && (
                <form onSubmit={handleSaveMaterial} className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Material Utilizado *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Argila Tabaco, Esmalte Celadon, Suporte refratário..."
                        value={matNome}
                        onChange={(e) => setMatNome(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Membresia Relacionada</label>
                      <select
                        value={matServico}
                        onChange={(e) => setMatServico(e.target.value as MembershipType)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs font-medium"
                      >
                        {activeServices.map((srv) => (
                          <option key={srv} value={srv}>
                            {MEMBERSHIP_DEFINITIONS[srv]?.titulo || srv}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Quantidade</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        value={matQtd}
                        onChange={(e) => setMatQtd(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Unidade</label>
                      <select
                        value={matUnidade}
                        onChange={(e) => setMatUnidade(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                      >
                        <option value="kg">kg (Quilograma)</option>
                        <option value="g">g (Grama)</option>
                        <option value="litro">litro (Litro)</option>
                        <option value="unidade">unidade</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Valor Unitário (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={matValorUnitario}
                        onChange={(e) => setMatValorUnitario(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">Total Calculado</label>
                      <div className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-bold text-[#D97736]">
                        R$ {(matQtd * matValorUnitario).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Forma de Compensação */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#2C241E] mb-1.5">
                      Forma de Compensação do Material: *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cobrar', label: 'Cobrar do Membr@', desc: 'Gera cobrança no extrato financeiro' },
                        { id: 'repor', label: 'Reposição pelo Membr@', desc: 'Registra dever de reposição física' },
                        { id: 'incluido', label: 'Incluído na Membresia', desc: 'Sem custo adicional (benefício)' }
                      ].map((comp) => (
                        <label
                          key={comp.id}
                          className={`p-2.5 rounded-xl border cursor-pointer block text-left transition-all ${
                            matCompensacao === comp.id
                              ? 'border-[#D97736] bg-[#D97736]/10 ring-1 ring-[#D97736]'
                              : 'border-[#D5CBC0] bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="compensacao"
                            value={comp.id}
                            checked={matCompensacao === comp.id}
                            onChange={(e) => setMatCompensacao(e.target.value as any)}
                            className="hidden"
                          />
                          <strong className="text-xs text-[#2C241E] block">{comp.label}</strong>
                          <span className="text-[10px] text-[#7A6A5E] block leading-tight mt-0.5">{comp.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddMaterialOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-[#D5CBC0] text-xs text-[#7A6A5E]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#2C241E] text-white text-xs font-bold"
                    >
                      Confirmar Lançamento
                    </button>
                  </div>
                </form>
              )}

              {/* Material list */}
              {memberMaterials.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E6DFD5] text-xs text-[#7A6A5E]">
                  Nenhum material registrado para este membr@ ainda.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#E6DFD5] text-[#7A6A5E] font-semibold">
                      <tr>
                        <th className="p-3">Data</th>
                        <th className="p-3">Material</th>
                        <th className="p-3">Quantidade</th>
                        <th className="p-3">Valor Total</th>
                        <th className="p-3">Membresia</th>
                        <th className="p-3">Compensação</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE4DA]">
                      {memberMaterials.map((mat) => (
                        <tr key={mat.id} className="hover:bg-[#FAF8F5]/80">
                          <td className="p-3 text-[#7A6A5E]">{mat.data}</td>
                          <td className="p-3 font-semibold text-[#2C241E]">{mat.material}</td>
                          <td className="p-3">{mat.quantidade} {mat.unidade}</td>
                          <td className="p-3 font-bold text-[#D97736]">R$ {mat.valorTotal.toFixed(2)}</td>
                          <td className="p-3">
                            <span className="text-[10px] font-semibold text-[#7A6A5E]">
                              {MEMBERSHIP_DEFINITIONS[mat.servicoRelacionado as MembershipType]?.titulo || mat.servicoRelacionado}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              mat.formaCompensacao === 'cobrar'
                                ? 'bg-rose-100 text-rose-800'
                                : mat.formaCompensacao === 'repor'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {mat.formaCompensacao === 'cobrar' ? 'Cobrado' : mat.formaCompensacao === 'repor' ? 'A Repor' : 'Incluído'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteMaterialUsage(mat.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FINANCEIRO DISCRIMINADO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  Extrato Financeiro Discriminado
                </h3>
                <p className="text-xs text-[#7A6A5E]">
                  Discriminação rigorosa entre valores de membresias/contratações, serviços realizados e materiais consumidos.
                </p>
              </div>

              {/* Financial cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E6DFD5]">
                  <span className="text-[#7A6A5E] block font-semibold">Membresia / Contratos:</span>
                  <strong className="text-sm font-bold text-[#2C241E] mt-0.5 block">R$ {totalServiceCharges.toFixed(2)}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-[#E6DFD5]">
                  <span className="text-[#7A6A5E] block font-semibold">Materiais Cobrados:</span>
                  <strong className="text-sm font-bold text-[#A84A1A] mt-0.5 block">R$ {totalMaterialCharges.toFixed(2)}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 block font-semibold">Total Pago:</span>
                  <strong className="text-sm font-bold text-emerald-700 mt-0.5 block">R$ {totalPaid.toFixed(2)}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-800 block font-semibold">Saldo Pendente:</span>
                  <strong className="text-sm font-bold text-rose-700 mt-0.5 block">R$ {totalPending.toFixed(2)}</strong>
                </div>
              </div>

              {/* Transactions list */}
              <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E6DFD5] text-[#7A6A5E]">
                    <tr>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Descrição & Origem</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4DA]">
                    {memberTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FAF8F5]/80">
                        <td className="p-3 text-[#7A6A5E]">{tx.dataVencimento}</td>
                        <td className="p-3 font-semibold text-[#2C241E]">{tx.descricao}</td>
                        <td className="p-3 capitalize text-[#7A6A5E]">{tx.categoria}</td>
                        <td className="p-3 font-bold text-[#D97736]">R$ {tx.valor.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            tx.status === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {tx.status !== 'pago' ? (
                            <button
                              onClick={() => markTransactionAsPaid(tx.id, 'pix')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              Dar Baixa
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold">Quitado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: HISTÓRICO & AUDITORIA */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  Histórico de Auditoria & Modificações
                </h3>
                <p className="text-xs text-[#7A6A5E]">
                  Registro imutável de todas as ações administrativas, alterações de membresias, pagamentos, queimas e materiais.
                </p>
              </div>

              {memberLogs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E6DFD5] text-xs text-[#7A6A5E]">
                  Nenhum registro de auditoria arquivado ainda para este membr@.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {memberLogs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl border border-[#E6DFD5] bg-white text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2C241E]">{log.acao}</span>
                        <span className="text-[10px] text-[#7A6A5E]">
                          {new Date(log.data).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-[#4A3E35] font-medium">{log.novaInfo}</p>
                      <p className="text-[10px] text-[#A84A1A]">Responsável: {log.responsavel}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E6DFD5] flex items-center justify-between">
          <div className="text-xs text-[#7A6A5E]">
            Membresias ativas: <strong>{activeServices.length}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2C241E] hover:bg-[#43372E] text-white text-xs font-bold transition-all shadow-xs"
          >
            Fechar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
