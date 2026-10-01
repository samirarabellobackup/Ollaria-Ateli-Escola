import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Calendar,
  Flame,
  CreditCard,
  FileCheck,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  Info,
  Layers,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Plus,
  Lock,
  FileText,
  Briefcase,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  UserCheck
} from 'lucide-react';
import { PieceStage, MembershipType, MEMBERSHIP_DEFINITIONS } from '../../types';
import { StudentTermsModal } from '../terms/StudentTermsModal';

type PortalTab =
  | 'pecas'
  | 'aulas'
  | 'queimas'
  | 'consultoria'
  | 'coworking'
  | 'curso'
  | 'professor'
  | 'financeiro'
  | 'matricula'
  | 'notificacoes';

const FIRING_STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; step: number }
> = {
  aguardando_recebimento: { label: 'Aguardando Recebimento', badge: 'bg-zinc-100 text-zinc-700 border-zinc-300', step: 1 },
  recebida: { label: 'Recebida no Ateliê', badge: 'bg-blue-100 text-blue-800 border-blue-300', step: 2 },
  aguardando_queima: { label: 'Aguardando Queima', badge: 'bg-amber-100 text-amber-800 border-amber-300', step: 3 },
  agendada: { label: 'Agendada no Forno', badge: 'bg-purple-100 text-purple-800 border-purple-300', step: 4 },
  em_queima: { label: 'Em Queima 🔥', badge: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse', step: 5 },
  queima_concluida: { label: 'Queima Concluída', badge: 'bg-teal-100 text-teal-800 border-teal-300', step: 6 },
  aguardando_retirada: { label: 'Aguardando Retirada', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', step: 7 },
  retirada: { label: 'Retirada Concluída', badge: 'bg-green-100 text-green-900 border-green-300', step: 8 },
  cancelada: { label: 'Cancelada', badge: 'bg-red-100 text-red-800 border-red-300', step: 0 },
  solicitado: { label: 'Aguardando Recebimento', badge: 'bg-zinc-100 text-zinc-700 border-zinc-300', step: 1 },
  retirado: { label: 'Retirada Concluída', badge: 'bg-green-100 text-green-900 border-green-300', step: 8 },
  cancelado: { label: 'Cancelada', badge: 'bg-red-100 text-red-800 border-red-300', step: 0 }
};

export const StudentPortal: React.FC = () => {
  const {
    currentStudent,
    pieces,
    attendance,
    transactions,
    notifications,
    changeRequests,
    acceptStudentTerms,
    requestProfileChange,
    markNotificationAsRead,
    firings,
    consultingAppointments,
    coworkingBookings,
    addCoworkingBooking,
    materialsUsage
  } = useStudio();

  const [activeTab, setActiveTab] = useState<PortalTab>('pecas');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Booking modal state for Coworking
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingShift, setBookingShift] = useState('14:00 às 18:00');
  const [bookingHours, setBookingHours] = useState(4);
  const [bookingNotes, setBookingNotes] = useState('Uso de bancada e torno elétrico Shimpo');
  const [bookingFeedback, setBookingFeedback] = useState('');

  // Terms modal state
  const [isViewTermsOpen, setIsViewTermsOpen] = useState(false);
  const [forceAcceptTermsOpen, setForceAcceptTermsOpen] = useState(false);

  // Edit request modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editField, setEditField] = useState('Endereço residencial');
  const [editNewValue, setEditNewValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  if (!currentStudent) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-[#E6DFD5] shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#D97736] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#2C241E] mb-2">
            Nenhum aluno autenticado
          </h3>
          <p className="text-sm text-[#7A6A5E] mb-4">
            Por favor, utilize o botão "Entrar" para acessar com o código de acesso e PIN fornecidos diretamente pelo ateliê.
          </p>
        </div>
      </div>
    );
  }

  // Filter student-specific data
  const myPieces = pieces.filter((p) => p.studentId === currentStudent.id);
  const myAttendance = attendance.filter((a) => a.studentId === currentStudent.id);
  const myTransactions = transactions.filter((t) => t.studentId === currentStudent.id);
  const myNotifications = notifications.filter((n) => n.studentId === currentStudent.id);
  const myChangeRequests = changeRequests.filter((r) => r.studentId === currentStudent.id);

  // Multi-membership records for this student
  const activeServices: MembershipType[] =
    currentStudent.servicosAtivos && currentStudent.servicosAtivos.length > 0
      ? currentStudent.servicosAtivos
      : ['aluno_regular'];

  const myFirings = firings.filter((f) => f.userId === currentStudent.id);
  const myConsultings = consultingAppointments.filter((c) => c.userId === currentStudent.id);
  const myBookings = coworkingBookings.filter((b) => b.userId === currentStudent.id);
  const myMaterials = materialsUsage.filter((m) => m.userId === currentStudent.id);

  // Consulting hours calculations (Horas contratadas - horas utilizadas = horas disponíveis)
  const consultoriaContratadas = currentStudent.consultoriaData?.horasContratadas || currentStudent.horasConsultoriaContratadas || 0;
  const consultoriaUtilizadas = currentStudent.consultoriaData?.horasUtilizadas || currentStudent.horasConsultoriaUtilizadas || 0;
  const consultoriaAgendadas = currentStudent.consultoriaData?.horasAgendadas || 0;
  const consultoriaDisponiveis = Math.max(0, consultoriaContratadas - consultoriaUtilizadas);

  // Coworking hours calculations
  const coworkingContratadas = currentStudent.coworkingData?.horasContratadas || currentStudent.coworkingHorasMensais || 0;
  const coworkingUtilizadas = currentStudent.coworkingData?.horasUtilizadas || 0;
  const coworkingAgendadas = currentStudent.coworkingData?.horasAgendadas || 0;
  const coworkingDisponiveis = Math.max(0, coworkingContratadas - coworkingUtilizadas);

  // Course & Professor details
  const cursoInfo = currentStudent.cursoData;
  const professorInfo = currentStudent.professorData;

  // Pieces split: to fire vs fired
  const piecesToFire = myPieces.filter((p) => p.etapa !== 'queimada_pronta' && p.etapa !== 'retirada_entregue');
  const piecesFired = myPieces.filter((p) => p.etapa === 'queimada_pronta' || p.etapa === 'retirada_entregue');

  // Pending financial balance
  const pendingAmount = myTransactions
    .filter((t) => t.status !== 'pago')
    .reduce((acc, cur) => acc + cur.valor, 0);

  const copyPixKey = () => {
    navigator.clipboard.writeText('61 996101254');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const copyAccessCode = () => {
    navigator.clipboard.writeText(currentStudent.accessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendEditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNewValue.trim()) return;

    let oldValue = '';
    if (editField === 'Endereço residencial') oldValue = currentStudent.registrationData.endereco;
    if (editField === 'Telefone / WhatsApp') oldValue = currentStudent.registrationData.telefoneWhatsapp;
    if (editField === 'Contato de emergência') oldValue = currentStudent.registrationData.contatoEmergenciaNome;
    if (editField === 'Profissão') oldValue = currentStudent.registrationData.profissao;
    if (editField === 'Informações de saúde / atendimento') oldValue = currentStudent.registrationData.informacoesSaudeAtendimento;

    requestProfileChange(currentStudent.id, editField, oldValue, editNewValue, editReason);
    setEditSuccessMsg('Solicitação enviada com sucesso! Aguarde a aprovação da administração do ateliê.');
    setTimeout(() => {
      setEditSuccessMsg('');
      setIsEditModalOpen(false);
      setEditNewValue('');
      setEditReason('');
    }, 1800);
  };

  const handleSendBookingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    addCoworkingBooking({
      userId: currentStudent.id,
      data: bookingDate,
      horario: bookingShift,
      horas: Number(bookingHours),
      status: 'solicitado',
      observacoes: bookingNotes
    });
    setBookingFeedback('Solicitação de horário enviada com sucesso! A administração da Ollaria avaliará a disponibilidade.');
    setTimeout(() => {
      setBookingFeedback('');
      setIsBookingModalOpen(false);
    }, 2000);
  };

  // Helper for 90-day countdown
  const getDaysRemaining = (limitDateStr?: string) => {
    if (!limitDateStr) return null;
    const limit = new Date(limitDateStr);
    const today = new Date();
    const diffTime = limit.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const hasAcceptedTerms = Boolean(
    currentStudent.registrationData?.aceitouTermoRegulamento &&
    currentStudent.registrationData?.dataAceiteTermoRegulamento
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Mandatory Terms Banner if student hasn't accepted yet */}
      {!hasAcceptedTerms && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-950">
                Ação Obrigatória: Aceite das Regras & Regulamento do Ateliê
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed max-w-3xl">
                Para sua segurança e conformidade, é necessário ler e aceitar formalmente o Regulamento Oficial da Ollaria Ateliê. <strong>O aceite deve ser realizado pessoalmente por você</strong> ao acessar o aplicativo e não pode ser feito pela coordenação. Após a confirmação, o documento fica registrado com data e hora e não poderá ser editado.
              </p>
            </div>
          </div>
          <button
            id="btn-open-accept-terms-top-banner"
            onClick={() => setForceAcceptTermsOpen(true)}
            className="px-5 py-3 rounded-xl bg-[#2C241E] text-white text-xs sm:text-sm font-bold hover:bg-[#43372E] transition-all shadow-sm flex items-center gap-2 shrink-0 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-[#E6A15C]" />
            <span>Ler e Aceitar Termos</span>
          </button>
        </div>
      )}
      
      {/* Student Welcome & Top Overview Card */}
      <div className="bg-white rounded-3xl border border-[#E6DFD5] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#D97736]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={currentStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentStudent.nome}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#D97736]/30 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                Ativo
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E]">
                  {currentStudent.registrationData.nomePreferencia || currentStudent.nome}
                </h1>
                <span className="bg-[#FAF0E6] text-[#A84A1A] font-semibold text-xs px-2.5 py-1 rounded-lg border border-[#F0D5C3] uppercase tracking-wide">
                  Membr@ Ollaria
                </span>
              </div>

              {/* Membresia Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {activeServices.map((srv) => {
                  const meta = MEMBERSHIP_DEFINITIONS[srv];
                  return (
                    <span
                      key={srv}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        meta?.corBadge || 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {meta?.titulo || srv}
                    </span>
                  );
                })}
              </div>

              {activeServices.includes('aluno_regular') && (
                <p className="text-xs sm:text-sm text-[#7A6A5E] mt-1.5 flex items-center gap-2">
                  <span>Turma Regular: <strong>{currentStudent.turma === 'quarta-tarde' ? 'Quarta-feira (Tarde) 15h20 às 17h50' : currentStudent.turma === 'quarta-noite' ? 'Quarta-feira (Noite) 18h20 às 20h50' : 'Sábado (Manhã) 09h30 às 12h00'}</strong></span>
                </p>
              )}
            </div>
          </div>

          {/* Access Credentials Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E6DFD5]">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-[#7A6A5E] tracking-wider block">
                Seu Código de Acesso Individual
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-[#D97736] tracking-wider">
                  {currentStudent.accessCode}
                </span>
                <button
                  onClick={copyAccessCode}
                  className="text-xs text-[#7A6A5E] hover:text-[#2C241E] p-1 rounded-md hover:bg-[#EBE4DA] transition-colors"
                  title="Copiar código"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="h-8 w-px bg-[#E6DFD5] hidden sm:block" />

            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-[#7A6A5E] tracking-wider block">
                Membresias Ativas
              </span>
              <span className="font-semibold text-sm text-[#2C241E]">
                {activeServices.length} {activeServices.length === 1 ? 'modalidade' : 'modalidades'}
              </span>
            </div>
          </div>

        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#EBE4DA]">
          
          {/* Card 1: Aulas / Membresias */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between text-[#7A6A5E] mb-1">
              <span className="text-xs font-semibold">
                {activeServices.includes('aluno_regular') ? 'Aulas Realizadas' : 'Membresias'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#D97736]" />
            </div>
            {activeServices.includes('aluno_regular') ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-serif text-[#2C241E]">{currentStudent.aulasFeitas}</span>
                  <span className="text-xs text-[#7A6A5E]">/ {currentStudent.aulasTotaisPlano} contratadas</span>
                </div>
                <div className="w-full bg-[#EBE4DA] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#D97736] h-full rounded-full"
                    style={{ width: `${Math.min(100, (currentStudent.aulasFeitas / currentStudent.aulasTotaisPlano) * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-serif text-[#2C241E]">{activeServices.length}</span>
                <span className="text-xs text-[#7A6A5E]">serviços contratados</span>
              </div>
            )}
          </div>

          {/* Card 2: Horas Disponíveis ou Aulas a Fazer */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between text-[#7A6A5E] mb-1">
              <span className="text-xs font-semibold">
                {consultoriaContratadas > 0
                  ? 'Saldo Consultoria'
                  : coworkingContratadas > 0
                  ? 'Saldo Coworking'
                  : 'Aulas a Fazer'}
              </span>
              <Clock className="w-4 h-4 text-[#D97736]" />
            </div>
            {consultoriaContratadas > 0 ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-serif text-[#D97736]">{consultoriaDisponiveis}h</span>
                  <span className="text-xs text-[#7A6A5E]">disponíveis</span>
                </div>
                <p className="text-[11px] text-[#7A6A5E] mt-1">
                  {consultoriaUtilizadas}h usadas • {consultoriaAgendadas}h agendadas
                </p>
              </>
            ) : coworkingContratadas > 0 ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-serif text-indigo-700">{coworkingDisponiveis}h</span>
                  <span className="text-xs text-[#7A6A5E]">disponíveis</span>
                </div>
                <p className="text-[11px] text-[#7A6A5E] mt-1">
                  {coworkingUtilizadas}h usadas • {coworkingAgendadas}h agendadas
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-serif text-[#2C241E]">{currentStudent.aulasRestantes}</span>
                  <span className="text-xs text-[#7A6A5E]">aulas no plano</span>
                </div>
                <p className="text-[11px] text-[#7A6A5E] mt-2">
                  Mensalidade Contínua
                </p>
              </>
            )}
          </div>

          {/* Card 3: Queimas / Peças */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between text-[#7A6A5E] mb-1">
              <span className="text-xs font-semibold">
                {myFirings.length > 0 ? 'Queimas no Forno' : 'Peças Prontas'}
              </span>
              <Flame className="w-4 h-4 text-emerald-600" />
            </div>
            {myFirings.length > 0 ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-serif text-[#2C241E]">{myFirings.length}</span>
                  <span className="text-xs text-[#7A6A5E]">lotes registrados</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                  {myFirings.filter((f) => f.status === 'queima_concluida' || f.status === 'aguardando_retirada').length} prontos para retirada
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-serif text-[#2C241E]">
                    {piecesFired.filter((p) => p.etapa === 'queimada_pronta').length}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold">prontas no ateliê</span>
                </div>
                <p className="text-[11px] text-[#7A6A5E] mt-2">
                  {piecesToFire.length} em secagem/queima
                </p>
              </>
            )}
          </div>

          {/* Card 4: Financeiro */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between text-[#7A6A5E] mb-1">
              <span className="text-xs font-semibold">Saldo Pendente</span>
              <CreditCard className="w-4 h-4 text-[#D97736]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-serif ${pendingAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                R$ {pendingAmount.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-[#7A6A5E] mt-2">
              {pendingAmount > 0 ? 'Chave PIX: 61 996101254' : 'Tudo quitado em dia!'}
            </p>
          </div>

        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E0D7CC] gap-2 overflow-x-auto pb-px">
        {[
          { id: 'pecas' as PortalTab, label: 'Minhas Peças Cerâmicas', icon: Flame, badge: myPieces.length },
          ...(activeServices.includes('aluno_regular')
            ? [{ id: 'aulas' as PortalTab, label: 'Presença & Aulas', icon: Calendar, badge: `${currentStudent.aulasFeitas}/${currentStudent.aulasTotaisPlano}` }]
            : []),
          ...(activeServices.includes('membro_queima') || activeServices.includes('cliente_queima') || myFirings.length > 0
            ? [{ id: 'queimas' as PortalTab, label: 'Queimas & Forno', icon: Flame, badge: myFirings.length }]
            : []),
          ...(activeServices.includes('membro_consultoria') || activeServices.includes('cliente_consultoria') || consultoriaContratadas > 0
            ? [{ id: 'consultoria' as PortalTab, label: 'Consultoria & Horas', icon: Briefcase, badge: `${consultoriaDisponiveis}h disp.` }]
            : []),
          ...(activeServices.includes('artista_coworking') || coworkingContratadas > 0
            ? [{ id: 'coworking' as PortalTab, label: 'Espaço Coworking', icon: Layers, badge: `${coworkingDisponiveis}h disp.` }]
            : []),
          ...(activeServices.includes('aluno_curso') || cursoInfo
            ? [{ id: 'curso' as PortalTab, label: 'Curso & Ciclo', icon: GraduationCap, badge: cursoInfo?.statusCiclo || 'Curso' }]
            : []),
          ...(activeServices.includes('professor_visitante') || professorInfo
            ? [{ id: 'professor' as PortalTab, label: 'Professor Visitante', icon: BookOpen }]
            : []),
          { id: 'financeiro' as PortalTab, label: 'Financeiro & Pagamentos', icon: CreditCard, badge: pendingAmount > 0 ? `R$ ${pendingAmount.toFixed(0)}` : undefined },
          { id: 'matricula' as PortalTab, label: 'Ficha do Membr@ & Termos', icon: FileCheck, badge: !hasAcceptedTerms ? 'Pendente' : undefined },
          { id: 'notificacoes' as PortalTab, label: 'Avisos & Lembretes', icon: Bell, badge: myNotifications.filter((n) => !n.lida).length || undefined }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-[#D97736] text-[#D97736] bg-[#FAF8F5]'
                  : 'border-transparent text-[#6B5A4D] hover:text-[#2C241E] hover:border-[#D5CBC0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-[#D97736] text-white' : 'bg-[#EBE4DA] text-[#6B5A4D]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: MINHAS PEÇAS */}
      {activeTab === 'pecas' && (
        <div className="space-y-6">
          
          {/* Important Studio Ceramic Policy Banner */}
          <div className="p-4 rounded-2xl bg-[#FFF8EE] border border-[#F3DFC7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#C26224] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#2C241E]">
                  Regulamento de Guarda e Retirada de Peças (Prazo Máximo de 90 Dias)
                </h4>
                <p className="text-xs text-[#7A6A5E] mt-0.5">
                  Conforme Cláusula 6 do Termo de Regulamento, após a conclusão da queima, o aluno tem até <strong>90 dias corridos</strong> para buscar a peça no ateliê antes de ser destinada a reciclagem ou descarte.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#8C3A16] bg-[#F5DFCC] px-3 py-1 rounded-full whitespace-nowrap">
              Cláusula 6 do Regulamento
            </span>
          </div>

          {/* Section: Peças Prontas para Retirada */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  Peças Queimadas & Prontas para Retirada
                </h3>
              </div>
              <span className="text-xs text-[#7A6A5E] font-medium">
                {piecesFired.length} {piecesFired.length === 1 ? 'peça' : 'peças'}
              </span>
            </div>

            {piecesFired.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E6DFD5] text-[#7A6A5E] text-xs">
                Nenhuma peça finalizada aguardando retirada no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {piecesFired.map((piece) => {
                  const daysRemaining = getDaysRemaining(piece.prazoLimiteRetirada);
                  const isUrgent = daysRemaining !== null && daysRemaining <= 20;

                  return (
                    <div
                      key={piece.id}
                      className="bg-white rounded-2xl border border-[#E6DFD5] p-5 shadow-xs flex flex-col justify-between relative overflow-hidden"
                    >
                      {isUrgent && (
                        <div className="bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 uppercase tracking-wider text-center -mx-5 -mt-5 mb-4">
                          Atenção: Prazo de 90 dias se esgotando!
                        </div>
                      )}

                      <div>
                        <div className="flex gap-4">
                          <img
                            src={piece.fotoUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&auto=format&fit=crop&q=80'}
                            alt={piece.titulo}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 border border-[#E6DFD5]"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 mb-1">
                              Queimada • Pronta
                            </span>
                            <h4 className="font-serif font-bold text-base text-[#2C241E] truncate">
                              {piece.titulo}
                            </h4>
                            <p className="text-xs text-[#6B5A4D] mt-0.5">
                              <strong>Argila:</strong> {piece.tipoArgila}
                            </p>
                            <p className="text-xs text-[#6B5A4D]">
                              <strong>Técnica:</strong> {piece.tecnica} • {piece.dimensoesAprox}
                            </p>
                            {piece.esmalteCores && (
                              <p className="text-xs text-[#7A6A5E] mt-0.5">
                                <strong>Esmalte:</strong> {piece.esmalteCores}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Technical evaluation from studio */}
                        {piece.avaliacaoTecnica.observacoes && (
                          <div className="mt-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] text-xs text-[#4A3E35]">
                            <span className="font-semibold text-[#8C3A16] block mb-0.5">Nota Técnica da Professora:</span>
                            {piece.avaliacaoTecnica.observacoes}
                          </div>
                        )}
                      </div>

                      {/* 90-day countdown badge */}
                      <div className="mt-4 pt-3 border-t border-[#EBE4DA] flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[11px] text-[#7A6A5E] block">Concluída em:</span>
                          <strong>{piece.dataQueimaConcluida ? new Date(piece.dataQueimaConcluida).toLocaleDateString('pt-BR') : 'Recente'}</strong>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-[#7A6A5E] block">Prazo final para retirada:</span>
                          <span className={`font-bold ${isUrgent ? 'text-amber-700' : 'text-emerald-800'}`}>
                            {piece.prazoLimiteRetirada ? new Date(piece.prazoLimiteRetirada).toLocaleDateString('pt-BR') : '90 dias'}
                            {daysRemaining !== null && ` (${daysRemaining} dias restantes)`}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Peças a Queimar & Em Produção */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D97736]" />
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  Peças a Queimar & Em Etapas de Produção
                </h3>
              </div>
              <span className="text-xs text-[#7A6A5E] font-medium">
                {piecesToFire.length} {piecesToFire.length === 1 ? 'peça' : 'peças'}
              </span>
            </div>

            {piecesToFire.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E6DFD5] text-[#7A6A5E] text-xs">
                Nenhuma peça em andamento no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {piecesToFire.map((piece) => {
                  let stageName = 'Modelagem / Secagem';
                  let stageColor = 'bg-amber-100 text-amber-900';
                  if (piece.etapa === 'aguardando_biscoito') {
                    stageName = 'Aguardando 1ª Queima (Biscoito)';
                    stageColor = 'bg-orange-100 text-orange-900';
                  } else if (piece.etapa === 'biscoito_queimado') {
                    stageName = 'Biscoitada (Pronta p/ Esmaltar)';
                    stageColor = 'bg-blue-100 text-blue-900';
                  } else if (piece.etapa === 'aguardando_esmalte') {
                    stageName = 'Esmaltada (Aguardando Queima de Alta)';
                    stageColor = 'bg-purple-100 text-purple-900';
                  }

                  return (
                    <div
                      key={piece.id}
                      className="bg-white rounded-2xl border border-[#E6DFD5] p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex gap-4">
                          <img
                            src={piece.fotoUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80'}
                            alt={piece.titulo}
                            className="w-24 h-24 rounded-xl object-cover shrink-0 border border-[#E6DFD5]"
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${stageColor} mb-1`}>
                              {stageName}
                            </span>
                            <h4 className="font-serif font-bold text-base text-[#2C241E] truncate">
                              {piece.titulo}
                            </h4>
                            <p className="text-xs text-[#6B5A4D] mt-0.5">
                              <strong>Argila:</strong> {piece.tipoArgila}
                            </p>
                            <p className="text-xs text-[#6B5A4D]">
                              <strong>Técnica:</strong> {piece.tecnica} • {piece.dimensoesAprox}
                            </p>
                            <p className="text-[11px] text-[#7A6A5E] mt-0.5">
                              Iniciada em: {new Date(piece.dataEntrada).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {/* Technical evaluation warning */}
                        {piece.avaliacaoTecnica.riscosIdentificados && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block">Aviso Técnico de Segurança da Queima:</strong>
                              <span>{piece.avaliacaoTecnica.riscosIdentificados}</span>
                            </div>
                          </div>
                        )}

                        {piece.avaliacaoTecnica.observacoes && !piece.avaliacaoTecnica.riscosIdentificados && (
                          <div className="mt-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] text-xs text-[#4A3E35]">
                            <span className="font-semibold text-[#8C3A16] block mb-0.5">Nota Técnica:</span>
                            {piece.avaliacaoTecnica.observacoes}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#EBE4DA] flex items-center justify-between text-[11px] text-[#7A6A5E]">
                        <span>Acompanhe o processo cerâmico semanalmente no ateliê</span>
                        <span className="font-medium text-[#2C241E]">Status: Em atelier</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: PRESENÇA & AULAS */}
      {activeTab === 'aulas' && (
        <div className="space-y-6">
          
          {/* Rules & Makeups summary box */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DFD5]">
            <h4 className="font-bold text-sm text-[#2C241E] mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D97736]" />
              Regras de Frequência, Faltas, Reposições e Trancamento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#5C4D41] leading-relaxed">
              <p>
                <strong>Reposições excepcionais:</strong> Permitidas apenas nos planos trimestral e semestral, desde que a ausência seja avisada com <strong>antecedência mínima de 20 dias</strong> e sujeita a vagas em outras turmas. Deve ocorrer no mesmo mês e não se acumula.
              </p>
              <p>
                <strong>Trancamento do plano:</strong> Mensal não permite trancamento. Trimestral: 1 trancamento de até 15 dias corridos (até 2 aulas). Semestral: 1 trancamento de até 30 dias corridos (até 4 aulas).
              </p>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Diário de Encontros e Presenças
              </h3>
              <span className="text-xs text-[#7A6A5E]">
                Total de {myAttendance.length} aulas registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                  <tr>
                    <th className="p-3.5">Data & Horário</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Atividade Realizada / Observações</th>
                    <th className="p-3.5">Registrado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4DA]">
                  {myAttendance.map((rec) => {
                    let badgeColor = 'bg-green-100 text-green-800';
                    let label = 'Presente';
                    if (rec.status === 'falta') {
                      badgeColor = 'bg-red-100 text-red-800';
                      label = 'Falta';
                    } else if (rec.status === 'reposicao') {
                      badgeColor = 'bg-purple-100 text-purple-800';
                      label = 'Reposição';
                    } else if (rec.status === 'agendada') {
                      badgeColor = 'bg-blue-100 text-blue-800';
                      label = 'Agendada';
                    }

                    return (
                      <tr key={rec.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="p-3.5 font-medium text-[#2C241E]">
                          {new Date(rec.data).toLocaleDateString('pt-BR')}
                          <span className="text-xs text-[#7A6A5E] block">{rec.horario}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeColor}`}>
                            {label}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#4A3E35]">
                          {rec.observacao || 'Aula regular ministrada.'}
                        </td>
                        <td className="p-3.5 text-[#7A6A5E] text-xs">
                          {rec.registradoPor}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: QUEIMAS & FORNO */}
      {activeTab === 'queimas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Regulation Notice */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DFD5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0 shadow-xs">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  Acompanhamento de Queimas & Fornos Ollaria
                </h3>
                <p className="text-xs text-[#7A6A5E] mt-0.5 max-w-3xl">
                  Acompanhe em tempo real as etapas de queima do seu acervo nos fornos elétricos do ateliê (biscoito em baixa temperatura e esmalte em alta temperatura a 1220°C).
                </p>
              </div>
            </div>

            <div className="bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
              🔒 <strong>Visualização Oficial:</strong> Somente a administração pode alterar status e financeiro.
            </div>
          </div>

          {/* 9 Stages Legend */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6DFD5] shadow-xs">
            <h4 className="text-xs font-bold text-[#4A3E35] mb-2 uppercase tracking-wider">
              Ciclo de Estados das Queimas (9 Etapas do Ateliê):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {[
                { id: 'aguardando_recebimento', label: '1. Aguardando Recebimento' },
                { id: 'recebida', label: '2. Recebida' },
                { id: 'aguardando_queima', label: '3. Aguardando Queima' },
                { id: 'agendada', label: '4. Agendada' },
                { id: 'em_queima', label: '5. Em Queima' },
                { id: 'queima_concluida', label: '6. Queima Concluída' },
                { id: 'aguardando_retirada', label: '7. Aguardando Retirada' },
                { id: 'retirada', label: '8. Retirada' },
                { id: 'cancelada', label: 'Cancelada' }
              ].map((stg) => {
                return (
                  <div
                    key={stg.id}
                    className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#D97736]" />
                    <span className="text-[11px] font-semibold text-[#4A3E35] truncate">
                      {stg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Firings List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Histórico de Lotes & Ordens de Queima ({myFirings.length})
              </h3>
              <span className="text-xs text-[#7A6A5E]">
                Atualizado pela coordenação do ateliê
              </span>
            </div>

            {myFirings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E6DFD5] text-[#7A6A5E] text-xs">
                Nenhum lote de queima registrado para seu cadastro até o momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myFirings.map((f) => {
                  const statusInfo = FIRING_STATUS_CONFIG[f.status] || {
                    label: f.status,
                    badge: 'bg-zinc-100 text-zinc-800 border-zinc-200',
                    step: 1
                  };
                  const isPaid = f.valorPago >= f.valorQueima;
                  const pendente = Math.max(0, f.valorQueima - f.valorPago);

                  return (
                    <div
                      key={f.id}
                      className="bg-white rounded-2xl border border-[#E6DFD5] p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#D97736] bg-[#FAF0E6] px-2 py-0.5 rounded-md border border-[#F0D5C3]">
                              {f.identificacao}
                            </span>
                            <h4 className="font-serif font-bold text-base text-[#2C241E] mt-1.5 capitalize">
                              {f.tipoQueima.replace('_', ' ')} • {f.temperatura || '1220°C'}
                            </h4>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.badge}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-[#6B5A4D] mt-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#E6DFD5]">
                          <div>
                            <span className="text-[10px] text-[#7A6A5E] block uppercase">Peças no Lote:</span>
                            <strong>{f.quantidadePecas} peças</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#7A6A5E] block uppercase">Peças Entregues:</span>
                            <strong>{f.pecasEntregues ?? f.quantidadePecas} peças</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#7A6A5E] block uppercase">Data Entrada:</span>
                            <span>{new Date(f.dataEntrada).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#7A6A5E] block uppercase">Data Prevista:</span>
                            <span>{f.dataPrevista ? new Date(f.dataPrevista).toLocaleDateString('pt-BR') : 'A definir'}</span>
                          </div>
                        </div>

                        {f.observacoes && (
                          <p className="text-xs text-[#5C4D41] bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 mt-3">
                            <strong>Obs:</strong> {f.observacoes}
                          </p>
                        )}
                      </div>

                      {/* Financial info for firing */}
                      <div className="mt-4 pt-3 border-t border-[#EBE4DA] flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-[#7A6A5E] block">Valor da Queima:</span>
                          <strong className="text-sm font-bold text-[#2C241E]">R$ {f.valorQueima.toFixed(2)}</strong>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isPaid ? '✓ Quitado' : `Pendente: R$ ${pendente.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: CONSULTORIA & BANCO DE HORAS */}
      {activeTab === 'consultoria' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DFD5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-800 shrink-0 shadow-xs">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  Consultoria Cerâmica & Banco de Horas
                </h3>
                <p className="text-xs text-[#7A6A5E] mt-0.5">
                  Acompanhamento de horas técnicas contratadas, agendamentos e histórico dos atendimentos com Sah Pereira.
                </p>
              </div>
            </div>

            <div className="bg-orange-50 px-3.5 py-2 rounded-xl border border-orange-200 text-[11px] text-orange-950 font-medium">
              🔒 Horas calculadas automaticamente: <strong>Contratadas − Utilizadas = Disponíveis</strong>
            </div>
          </div>

          {/* 4 Metric Cards for Hours Control */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <span className="text-xs font-semibold text-[#7A6A5E] block mb-1">Horas Contratadas</span>
              <span className="text-3xl font-serif font-bold text-[#2C241E]">{consultoriaContratadas}h</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">Total do pacote</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <span className="text-xs font-semibold text-[#7A6A5E] block mb-1">Horas Utilizadas</span>
              <span className="text-3xl font-serif font-bold text-[#8C3A16]">{consultoriaUtilizadas}h</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">Atendimentos concluídos</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <span className="text-xs font-semibold text-[#7A6A5E] block mb-1">Horas Agendadas</span>
              <span className="text-3xl font-serif font-bold text-blue-800">{consultoriaAgendadas}h</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">Próximos encontros</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs bg-gradient-to-br from-white to-[#FAF0E6]">
              <span className="text-xs font-semibold text-[#D97736] block mb-1">Saldo Disponível</span>
              <span className="text-3xl font-serif font-bold text-[#D97736]">{consultoriaDisponiveis}h</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">Livre para agendamento</p>
            </div>
          </div>

          {/* Appointments History */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Histórico de Atendimentos de Consultoria ({myConsultings.length})
              </h3>
              <span className="text-xs text-[#7A6A5E]">
                Datas, horários e pautas técnicas
              </span>
            </div>

            {myConsultings.length === 0 ? (
              <div className="p-8 text-center text-[#7A6A5E] text-xs">
                Nenhum atendimento registrado no histórico até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                    <tr>
                      <th className="p-3.5">Data & Horário</th>
                      <th className="p-3.5">Duração</th>
                      <th className="p-3.5">Pauta & Observações</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4DA]">
                    {myConsultings.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="p-3.5 font-semibold text-[#2C241E]">
                          {new Date(c.data).toLocaleDateString('pt-BR')} • {c.horario}
                        </td>
                        <td className="p-3.5 font-bold text-[#D97736]">
                          {c.duracaoHoras} hora{c.duracaoHoras > 1 ? 's' : ''}
                        </td>
                        <td className="p-3.5 text-[#5C4D41]">
                          {c.temaObservacoes}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.status === 'realizado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: ARTISTA COWORKING & ATELIÊ */}
      {activeTab === 'coworking' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DFD5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-800 shrink-0 shadow-xs">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  Artista Coworking • Uso do Ateliê
                </h3>
                <p className="text-xs text-[#7A6A5E] mt-0.5">
                  Acesso livre a tornos elétricos Shimpo, bancadas e equipamentos cerâmicos.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#E6A15C]" />
              <span>Solicitar Horário</span>
            </button>
          </div>

          {/* 4 Metric Cards for Hours Control */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <span className="text-xs font-semibold text-[#7A6A5E] block mb-1">Horas Contratadas</span>
              <span className="text-3xl font-serif font-bold text-[#2C241E]">{coworkingContratadas}h</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">Plano mensal de uso</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <span className="text-xs font-semibold text-[#7A6A5E] block mb-1">Horas Utilizadas</span>
              <span className="text-3xl font-serif font-bold text-[#8C3A16]">{coworkingUtilizadas}h</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">Uso de bancadas registrado</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <span className="text-xs font-semibold text-[#7A6A5E] block mb-1">Horas Agendadas</span>
              <span className="text-3xl font-serif font-bold text-blue-800">{coworkingAgendadas}h</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">Horários futuros reservados</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs bg-gradient-to-br from-white to-indigo-50/50">
              <span className="text-xs font-semibold text-indigo-700 block mb-1">Saldo Disponível</span>
              <span className="text-3xl font-serif font-bold text-indigo-700">{coworkingDisponiveis}h</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">Disponíveis para reservar</p>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Agenda de Utilização do Espaço ({myBookings.length})
              </h3>
              <span className="text-xs text-[#7A6A5E]">
                Horários passados e futuras reservas
              </span>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-8 text-center text-[#7A6A5E] text-xs">
                Nenhum agendamento de bancada registrado. Clique em "Solicitar Horário" para agendar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                    <tr>
                      <th className="p-3.5">Data & Horário</th>
                      <th className="p-3.5">Carga Horária</th>
                      <th className="p-3.5">Bancada / Equipamento</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4DA]">
                    {myBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="p-3.5 font-semibold text-[#2C241E]">
                          {new Date(b.data).toLocaleDateString('pt-BR')} • {b.horario}
                        </td>
                        <td className="p-3.5 font-bold text-indigo-700">
                          {b.horas} hora{b.horas > 1 ? 's' : ''}
                        </td>
                        <td className="p-3.5 text-[#5C4D41]">
                          {b.observacoes || 'Bancada e torno elétrico'}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'confirmado'
                              ? 'bg-green-100 text-green-800'
                              : b.status === 'solicitado'
                              ? 'bg-amber-100 text-amber-800'
                              : b.status === 'realizado'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {b.status === 'solicitado' ? 'Aguardando Confirmação' : b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Materials Used in Coworking */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Materiais e Insumos Utilizados no Ateliê ({myMaterials.length})
              </h3>
              <span className="text-xs text-[#7A6A5E]">
                Argilas, esmaltes e queimas
              </span>
            </div>

            {myMaterials.length === 0 ? (
              <div className="p-8 text-center text-[#7A6A5E] text-xs">
                Nenhum consumo adicional de materiais registrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                    <tr>
                      <th className="p-3.5">Material</th>
                      <th className="p-3.5">Quantidade</th>
                      <th className="p-3.5">Compensação</th>
                      <th className="p-3.5">Valor</th>
                      <th className="p-3.5">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4DA]">
                    {myMaterials.map((m) => (
                      <tr key={m.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="p-3.5 font-semibold text-[#2C241E]">
                          {m.material}
                        </td>
                        <td className="p-3.5 font-bold text-[#D97736]">
                          {m.quantidade} {m.unidade}
                        </td>
                        <td className="p-3.5 capitalize text-[#6B5A4D]">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            m.formaCompensacao === 'cobrar'
                              ? 'bg-amber-100 text-amber-800'
                              : m.formaCompensacao === 'repor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {m.formaCompensacao}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#2C241E]">
                          R$ {m.valorTotal.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-[#7A6A5E]">
                          {new Date(m.data).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: ALUNO DE CURSO */}
      {activeTab === 'curso' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DFD5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-sky-100 text-sky-800 shrink-0 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                  {cursoInfo?.nomeCurso || 'Curso de Cerâmica • Ollaria'}
                </h3>
                <p className="text-xs text-[#7A6A5E] mt-0.5">
                  Curso com duração definida, ciclo pedagógico completo e encontros estruturados.
                </p>
              </div>
            </div>

            <div className="bg-white px-4 py-2 rounded-xl border border-[#E6DFD5] text-xs font-semibold text-[#4A3E35]">
              Período: {cursoInfo?.dataInicio ? new Date(cursoInfo.dataInicio).toLocaleDateString('pt-BR') : 'Início'} até {cursoInfo?.dataTermino ? new Date(cursoInfo.dataTermino).toLocaleDateString('pt-BR') : 'Término'}
            </div>
          </div>

          {/* Visual Cycle Banner: INÍCIO -> DESENVOLVIMENTO -> CONCLUSÃO */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD5] shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#4A3E35] uppercase tracking-wider">
              Ciclo Oficial do Curso
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'inicio', title: '1. Início', desc: 'Apresentação, massas, segurança e primeiras formas' },
                { id: 'desenvolvimento', title: '2. Desenvolvimento', desc: 'Aprofundamento técnico, acabamentos e esmaltação' },
                { id: 'conclusao', title: '3. Conclusão', desc: 'Queima em alta temperatura e entrega do acervo' }
              ].map((stage) => {
                const isCurrent = (cursoInfo?.statusCiclo || 'desenvolvimento') === stage.id;
                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-[#D97736] bg-[#FAF0E6] shadow-xs'
                        : 'border-[#E6DFD5] bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className={`font-serif text-sm ${isCurrent ? 'text-[#8C3A16]' : 'text-[#2C241E]'}`}>
                        {stage.title}
                      </strong>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase bg-[#D97736] text-white px-2 py-0.5 rounded-full">
                          Etapa Atual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7A6A5E] mt-1 leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Meetings Progress */}
            <div className="pt-4 border-t border-[#EBE4DA]">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-[#2C241E]">
                  Encontros Realizados: {cursoInfo?.encontrosRealizados || 6} de {cursoInfo?.quantidadeEncontros || 8}
                </span>
                <span className="text-[#7A6A5E]">
                  {cursoInfo?.encontrosRestantes || 2} encontros restantes
                </span>
              </div>
              <div className="w-full bg-[#EBE4DA] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#D97736] h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((cursoInfo?.encontrosRealizados || 6) / (cursoInfo?.quantidadeEncontros || 8)) * 100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Course Materials */}
            {cursoInfo?.materiaisInclusos && (
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6DFD5] text-xs text-[#5C4D41]">
                <strong>Materiais Inclusos no Curso:</strong> {cursoInfo.materiaisInclusos}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: PROFESSOR VISITANTE */}
      {activeTab === 'professor' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DFD5] flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-800 shrink-0 shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Professor Visitante • Acordo & Turmas
              </h3>
              <p className="text-xs text-[#7A6A5E] mt-0.5">
                Acordo de sublocação de espaço ou percentual de faturamento sobre turma ministrada na Ollaria.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD5] shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-base text-[#2C241E]">
              Detalhes do Modelo de Acordo
            </h4>

            {professorInfo?.tipoAcordo === 'sublocacao_espaco' ? (
              <div className="space-y-3 text-xs">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  Modelo: Sublocação de Espaço
                </span>
                <p className="text-[#6B5A4D]">
                  Horário e período contratado: <strong>{professorInfo.horarioSublocacao || 'Sextas 14h às 18h'}</strong>
                </p>
                <p className="text-[#6B5A4D]">
                  Valor Mensal da Sublocação: <strong>R$ {professorInfo.valorMensalSublocacao?.toFixed(2) || '800,00'}</strong>
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  Modelo: Percentual sobre Turma
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E6DFD5]">
                  <div>
                    <span className="text-[10px] text-[#7A6A5E] block uppercase">Turma:</span>
                    <strong>{professorInfo?.nomeTurma || 'Workshop Torno Avançado'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A6A5E] block uppercase">Alunos:</span>
                    <strong>{professorInfo?.quantidadeAlunos || 6} alunos</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A6A5E] block uppercase">Percentual:</span>
                    <strong>{professorInfo?.percentualAcordado || 70}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7A6A5E] block uppercase">Valor Devido:</span>
                    <strong className="text-[#D97736]">R$ {professorInfo?.valorDevidoProfessor?.toFixed(2) || '2.100,00'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
      {activeTab === 'financeiro' && (
        <div className="space-y-6">
          
          {/* PIX Payment Box */}
          <div className="bg-gradient-to-r from-[#2C241E] to-[#43372E] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              
              <div>
                <span className="text-xs font-bold text-[#E6A15C] uppercase tracking-wider">
                  Chave Oficial para Pagamento
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1 text-white">
                  PIX Ollaria Ateliê
                </h3>
                <p className="text-xs text-[#D5CBC0] mt-1 max-w-md">
                  Chave Celular: <strong>61 996101254</strong> (Ateliê Sah Pereira / Ollaria Cerâmica).
                  Envie o comprovante para confirmação imediata de queimas e mensalidade.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={copyPixKey}
                  className="px-5 py-3 rounded-xl bg-[#D97736] hover:bg-[#C26224] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  {copiedPix ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                  {copiedPix ? 'Chave PIX Copiada!' : 'Copiar Chave PIX'}
                </button>

                <a
                  href={`https://wa.me/5561996101254?text=Ol%C3%A1%20Sah%20Pereira!%20Sou%20${encodeURIComponent(currentStudent.nome)}%20e%20estou%20enviando%20o%20comprovante%20do%20Ollaria%20Ateli%C3%AA.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-[#FAF8F5] hover:bg-white text-[#2C241E] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Send className="w-4 h-4 text-[#25D366]" />
                  Enviar Comprovante (WhatsApp)
                </a>
              </div>

            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Extrato de Mensalidades & Materiais
              </h3>
              <span className="text-xs text-[#7A6A5E]">
                Argilas e Queimas são cobradas separadamente
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                  <tr>
                    <th className="p-3.5">Descrição</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5">Valor</th>
                    <th className="p-3.5">Vencimento</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4DA]">
                  {myTransactions.map((tx) => {
                    const isPaid = tx.status === 'pago';
                    const isOverdue = tx.status === 'atrasado';

                    return (
                      <tr key={tx.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="p-3.5 font-semibold text-[#2C241E]">
                          {tx.descricao}
                          {tx.observacoes && (
                            <span className="text-xs text-[#7A6A5E] block font-normal mt-0.5">{tx.observacoes}</span>
                          )}
                        </td>
                        <td className="p-3.5 capitalize text-[#6B5A4D]">
                          <span className="bg-[#EBE4DA] px-2 py-0.5 rounded-md text-[11px] font-semibold">
                            {tx.categoria}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#2C241E]">
                          R$ {tx.valor.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-[#7A6A5E]">
                          {new Date(tx.dataVencimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-green-100 text-green-800'
                              : isOverdue
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isPaid ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: FICHA DE MATRÍCULA & TERMOS */}
      {activeTab === 'matricula' && (
        <div className="space-y-6">
          
          {/* Header with Edit Request trigger */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6DFD5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Ficha Cadastral Oficial da Matrícula
              </h3>
              <p className="text-xs text-[#7A6A5E] mt-0.5">
                Os termos e aceites foram formalmente assinados no momento da inscrição. Para alteração de endereço, telefone ou emergência, envie uma solicitação para aprovação da administração.
              </p>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#D97736] text-white font-semibold text-xs hover:bg-[#C26224] transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileCheck className="w-4 h-4" />
              Solicitar Alteração de Dados
            </button>
          </div>

          {/* Pending change request banner if any */}
          {myChangeRequests.filter((r) => r.status === 'pendente').map((req) => (
            <div key={req.id} className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Solicitação de Alteração Cadastral Pendente de Aprovação:</strong>
                <span>Você solicitou a alteração de <strong>{req.campoAlterado}</strong> para: "<em>{req.novoValor}</em>". A equipe do Ateliê Ollaria irá analisar e aprovar em breve.</span>
              </div>
            </div>
          ))}

          {/* Registration Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Dados Pessoais */}
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-3">
              <h4 className="font-serif font-bold text-base text-[#2C241E] border-b border-[#EBE4DA] pb-2">
                Dados Pessoais & Contato
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#7A6A5E] block">Nome Completo:</span>
                  <strong className="text-sm text-[#2C241E]">{currentStudent.registrationData.nomeCompleto}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#7A6A5E] block">Nome de Preferência:</span>
                    <strong className="text-[#2C241E]">{currentStudent.registrationData.nomePreferencia || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[#7A6A5E] block">Nascimento:</span>
                    <strong className="text-[#2C241E]">{new Date(currentStudent.registrationData.dataNascimento).toLocaleDateString('pt-BR')}</strong>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#7A6A5E] block">CPF / Passaporte:</span>
                    <strong className="text-[#2C241E]">{currentStudent.registrationData.cpfOuPassaporte}</strong>
                  </div>
                  <div>
                    <span className="text-[#7A6A5E] block">Profissão:</span>
                    <strong className="text-[#2C241E]">{currentStudent.registrationData.profissao}</strong>
                  </div>
                </div>
                <div>
                  <span className="text-[#7A6A5E] block">WhatsApp:</span>
                  <strong className="text-[#2C241E]">{currentStudent.registrationData.telefoneWhatsapp}</strong>
                </div>
                <div>
                  <span className="text-[#7A6A5E] block">E-mail:</span>
                  <strong className="text-[#2C241E]">{currentStudent.registrationData.email}</strong>
                </div>
                <div>
                  <span className="text-[#7A6A5E] block">Endereço Cadastrado:</span>
                  <strong className="text-[#2C241E]">{currentStudent.registrationData.endereco}</strong>
                </div>
                <div>
                  <span className="text-[#7A6A5E] block">Como conheceu o ateliê:</span>
                  <strong className="text-[#2C241E]">{currentStudent.registrationData.comoConheceu}</strong>
                </div>
              </div>
            </div>

            {/* Box 2: Curso & Turma */}
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] space-y-3">
              <h4 className="font-serif font-bold text-base text-[#2C241E] border-b border-[#EBE4DA] pb-2">
                Modalidade & Emergência
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#7A6A5E] block">Plano Contratado:</span>
                  <strong className="text-sm capitalize text-[#2C241E]">{currentStudent.modalidade} ({currentStudent.aulasTotaisPlano} aulas)</strong>
                </div>
                <div>
                  <span className="text-[#7A6A5E] block">Turma Escolhida:</span>
                  <strong className="text-[#2C241E]">{currentStudent.turma}</strong>
                </div>
                <div>
                  <span className="text-[#7A6A5E] block">Experiência prévia em cerâmica:</span>
                  <strong className="capitalize text-[#2C241E]">{currentStudent.registrationData.experiencia}</strong>
                </div>
                <div>
                  <span className="text-[#7A6A5E] block">Aulas em outro ateliê:</span>
                  <strong className="text-[#2C241E]">{currentStudent.registrationData.jaFezAulasOutroAtelie} {currentStudent.registrationData.historicoOutroAtelie ? `(${currentStudent.registrationData.historicoOutroAtelie})` : ''}</strong>
                </div>
                <div className="pt-2 border-t border-[#EBE4DA]">
                  <span className="text-[#7A6A5E] block">Contato de Emergência:</span>
                  <strong className="text-[#2C241E]">
                    {currentStudent.registrationData.contatoEmergenciaNome
                      ? `${currentStudent.registrationData.contatoEmergenciaNome} ${currentStudent.registrationData.contatoEmergenciaRelacao ? `(${currentStudent.registrationData.contatoEmergenciaRelacao})` : ''}`
                      : 'Não informado'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#7A6A5E] block">Informações de Saúde / Atendimento:</span>
                  <strong className="text-[#2C241E]">{currentStudent.registrationData.informacoesSaudeAtendimento || 'Nenhuma restrição informada.'}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Terms & Regulations Section */}
          {!hasAcceptedTerms ? (
            <div className="bg-amber-50/80 p-6 rounded-2xl border-2 border-dashed border-amber-300 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-amber-950">
                      Regras & Regulamento do Ateliê: Aceite Pendente
                    </h4>
                    <p className="text-xs text-amber-900 mt-1 max-w-xl leading-relaxed">
                      Conforme o regulamento da Ollaria Ateliê, as regras e condições de funcionamento devem ser lidas e aceitas diretamente por você para a confirmação plena da matrícula. A coordenação não assina em seu nome.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setForceAcceptTermsOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] transition-colors shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-center"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ler e Aceitar Agora</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-[#E6DFD5] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE4DA] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#2C241E]">
                      Termos Assinados & Declarações Jurídicas (Documento Imutável)
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                      Assinado digitalmente por você em{' '}
                      <strong>
                        {new Date(currentStudent.registrationData.dataAceiteTermoRegulamento).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </strong>{' '}
                      • Bloqueado para edição
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsViewTermsOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#D5CBC0] text-xs font-semibold text-[#2C241E] hover:bg-[#EBE4DA] flex items-center gap-1.5 transition-colors self-start sm:self-center shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-[#D97736]" />
                  <span>Visualizar Regulamento Completo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#2C241E]">Regras e Condições de Matrícula</strong>
                    <span className="text-[#7A6A5E] text-[11px]">
                      Aceito diretamente em {new Date(currentStudent.registrationData.dataAceiteRegrasCondicoes || currentStudent.registrationData.dataAceiteTermoRegulamento || currentStudent.dataMatricula).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#2C241E]">Termo de Matrícula e Regulamento Oficial</strong>
                    <span className="text-[#7A6A5E] text-[11px]">
                      Aceito diretamente em {new Date(currentStudent.registrationData.dataAceiteTermoRegulamento || currentStudent.dataMatricula).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#2C241E]">Ciência do Processo Cerâmico</strong>
                    <span className="text-[#7A6A5E] text-[11px]">Ciente das variáveis artesanais, secagem e queimas</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#2C241E]">Ciência sobre Materiais e Queimas</strong>
                    <span className="text-[#7A6A5E] text-[11px]">Cobrança separada de argilas, esmaltes e fornos</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] flex items-start gap-2.5 sm:col-span-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#2C241E]">
                      Autorização de Uso de Imagem: {currentStudent.registrationData.autorizacaoImagem === 'autorizo' ? 'Autorizado' : 'Não Autorizado'}
                    </strong>
                    <span className="text-[#7A6A5E] text-[11px]">
                      Divulgação institucional dos processos e peças nas mídias sociais do Ateliê Sah Pereira | Ollaria
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] flex items-center gap-2.5 text-[11px] text-[#7A6A5E]">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Registro Imutável:</strong> Por segurança jurídica e transparência, os termos aceitos não podem ser alterados ou revogados no aplicativo.
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: NOTIFICAÇÕES & AVISOS */}
      {activeTab === 'notificacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#2C241E]">
              Notificações do Ateliê para Você
            </h3>
            <span className="text-xs text-[#7A6A5E]">
              Lembretes de cobrança, renovação e peças prontas
            </span>
          </div>

          {myNotifications.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E6DFD5] text-[#7A6A5E] text-xs">
              Você não possui novas notificações no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {myNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    notif.lida ? 'bg-white border-[#E6DFD5]' : 'bg-[#FAF0E6]/50 border-[#E6A15C]/40 ring-1 ring-[#D97736]/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] text-[#D97736] shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#2C241E]">{notif.titulo}</h4>
                          {!notif.lida && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#D97736] text-white">
                              Nova
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5C4D41] mt-1 leading-relaxed">{notif.mensagem}</p>
                        <span className="text-[11px] text-[#7A6A5E] block mt-2">
                          {new Date(notif.dataCriacao).toLocaleDateString('pt-BR')} às {new Date(notif.dataCriacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {!notif.lida && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="text-xs font-semibold text-[#8C3A16] hover:underline shrink-0"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Request Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241E]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E6DFD5] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#F2ECE3] px-6 py-4 border-b border-[#E0D7CC] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Solicitar Alteração Cadastral
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#7A6A5E] hover:text-[#2C241E]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEditRequest} className="p-6 space-y-4 text-xs sm:text-sm">
              <p className="text-xs text-[#6B5A4D]">
                Os dados cadastrais serão enviados para avaliação da direção do Ateliê Ollaria. Após aprovação, constarão atualizados no sistema.
              </p>

              {editSuccessMsg && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  Campo que deseja alterar:
                </label>
                <select
                  value={editField}
                  onChange={(e) => setEditField(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white font-medium text-[#2C241E]"
                >
                  <option value="Endereço residencial">Endereço residencial</option>
                  <option value="Telefone / WhatsApp">Telefone / WhatsApp</option>
                  <option value="Contato de emergência">Contato de emergência</option>
                  <option value="Profissão">Profissão</option>
                  <option value="Informações de saúde / atendimento">Informações de saúde / atendimento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  Novo valor desejado:
                </label>
                <input
                  type="text"
                  placeholder="Informe os novos dados corretos"
                  value={editNewValue}
                  onChange={(e) => setEditNewValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  Motivo da alteração (opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Mudança de endereço recente, novo número de celular..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E]"
                />
              </div>

              <div className="pt-3 border-t border-[#E6DFD5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5CBC0] bg-white text-[#4A3E35] font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D97736] text-white font-bold text-xs hover:bg-[#C26224] transition-colors"
                >
                  Enviar para Aprovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coworking Booking Request Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241E]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E6DFD5] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#F2ECE3] px-6 py-4 border-b border-[#E0D7CC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-700" />
                <h3 className="font-serif font-bold text-base text-[#2C241E]">
                  Solicitar Horário de Ateliê (Coworking)
                </h3>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-[#7A6A5E] hover:text-[#2C241E]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBookingRequest} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-xs text-indigo-900">
                <strong>Regra de Agendamento:</strong> Seu pedido ficará registrado com status <em>"Solicitado"</em> e será confirmado pela coordenação da Ollaria conforme a disponibilidade de bancadas e tornos elétricos.
              </div>

              {bookingFeedback && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{bookingFeedback}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                    Data Pretendida *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                    Horário de Turno *
                  </label>
                  <select
                    value={bookingShift}
                    onChange={(e) => setBookingShift(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                  >
                    <option value="09:00 às 13:00">Manhã (09:00 às 13:00 - 4h)</option>
                    <option value="14:00 às 18:00">Tarde (14:00 às 18:00 - 4h)</option>
                    <option value="18:30 às 21:30">Noite (18:30 às 21:30 - 3h)</option>
                    <option value="09:00 às 17:00">Dia Completo (09:00 às 17:00 - 8h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  Quantidade de Horas Reservadas *
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={bookingHours}
                  onChange={(e) => setBookingHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                />
                <span className="text-[11px] text-[#7A6A5E] mt-0.5 block">
                  Saldo de horas disponíveis para reserva: <strong>{coworkingDisponiveis}h</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  Equipamento / Observações:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Torno elétrico Shimpo, bancada de acabamento..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                />
              </div>

              <div className="pt-3 border-t border-[#E6DFD5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5CBC0] bg-white text-[#4A3E35] font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-700 text-white font-bold text-xs hover:bg-indigo-800 transition-colors"
                >
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Acceptance Terms Modal when terms not accepted yet */}
      <StudentTermsModal
        isOpen={!hasAcceptedTerms || forceAcceptTermsOpen}
        student={currentStudent}
        mode={hasAcceptedTerms ? 'view' : 'accept'}
        onClose={() => {
          setForceAcceptTermsOpen(false);
          setIsViewTermsOpen(false);
        }}
        onAccept={(autorizacaoImagem) => {
          acceptStudentTerms(currentStudent.id, autorizacaoImagem);
          setForceAcceptTermsOpen(false);
        }}
      />

      {/* Consultation Modal when student wants to re-read the authenticated terms */}
      {hasAcceptedTerms && isViewTermsOpen && (
        <StudentTermsModal
          isOpen={isViewTermsOpen}
          student={currentStudent}
          mode="view"
          onClose={() => setIsViewTermsOpen(false)}
        />
      )}

    </div>
  );
};
