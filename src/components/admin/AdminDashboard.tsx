import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Users,
  Flame,
  Calendar,
  CreditCard,
  Bell,
  FileCheck,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  Check,
  Eye,
  KeyRound,
  Trash2,
  RefreshCw,
  Clock,
  FileText,
  AlertCircle,
  Pencil,
  UserPlus,
  Upload,
  Download,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import { MonthlyReportView } from './MonthlyReportView';
import { EditStudentModal } from './EditStudentModal';
import { AddStudentModal } from './AddStudentModal';
import { ImportStudentsModal } from './ImportStudentsModal';
import { PieceStage, AttendanceStatus, PaymentCategory, PaymentMethod, ClassShift, Student } from '../../types';

interface AdminDashboardProps {
  onOpenRegistration: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenRegistration }) => {
  const {
    students,
    pieces,
    attendance,
    transactions,
    notifications,
    changeRequests,
    setCurrentStudentById,
    setRole,
    generateNewAccessKey,
    deleteStudent,
    importStudents,
    exportStudentsCSV,
    exportFullBackupJSON,
    registerAttendance,
    deleteAttendance,
    addPiece,
    updatePieceStage,
    updatePieceEvaluation,
    deletePiece,
    addTransaction,
    markTransactionAsPaid,
    deleteTransaction,
    resolveProfileChange,
    createNotification
  } = useStudio();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'students' | 'attendance' | 'pieces' | 'finance' | 'reminders' | 'requests' | 'reports'
  >('overview');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<string>('todos');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Student CRUD Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // New Piece Modal
  const [isAddPieceOpen, setIsAddPieceOpen] = useState(false);
  const [newPieceStudentId, setNewPieceStudentId] = useState(students[0]?.id || '');
  const [newPieceTitle, setNewPieceTitle] = useState('');
  const [newPieceClay, setNewPieceClay] = useState('Argila Terracota Nacional');
  const [newPieceTech, setNewPieceTech] = useState('Torno elétrico');
  const [newPieceDim, setNewPieceDim] = useState('');
  const [newPieceGlaze, setNewPieceGlaze] = useState('');
  const [newPieceObs, setNewPieceObs] = useState('');
  const [newPieceRisk, setNewPieceRisk] = useState('');

  // New Transaction Modal
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [newTxStudentId, setNewTxStudentId] = useState(students[0]?.id || '');
  const [newTxDesc, setNewTxDesc] = useState('');
  const [newTxCat, setNewTxCat] = useState<PaymentCategory>('argila');
  const [newTxVal, setNewTxVal] = useState('75.00');
  const [newTxDueDate, setNewTxDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance filter in Attendance Tab
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceShift, setAttendanceShift] = useState<ClassShift>('quarta-tarde');

  // Quick stats calculations
  const totalActiveStudents = students.filter((s) => s.status === 'ativo').length;
  const piecesInKiln = pieces.filter((p) => p.etapa !== 'retirada_entregue').length;
  const piecesReady = pieces.filter((p) => p.etapa === 'queimada_pronta').length;
  const totalPendingFinance = transactions
    .filter((t) => t.status !== 'pago')
    .reduce((acc, cur) => acc + cur.valor, 0);
  const currentMonthRevenue = transactions
    .filter((t) => t.status === 'pago')
    .reduce((acc, cur) => acc + cur.valor, 0);

  const pendingRequestsCount = changeRequests.filter((r) => r.status === 'pendente').length;

  // 90-day critical pieces list
  const today = new Date();
  const criticalPieces = pieces.filter((p) => {
    if (p.etapa !== 'queimada_pronta' || !p.prazoLimiteRetirada) return false;
    const limit = new Date(p.prazoLimiteRetirada);
    const diffDays = Math.ceil((limit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // 30 days or less remaining
  });

  // Students requiring renewal reminder (<= 2 classes remaining)
  const studentsToRenew = students.filter((s) => s.aulasRestantes <= 2 && s.status === 'ativo');

  const copyStudentAccessText = (student: typeof students[0]) => {
    const text = `*OLLARIA ATELIÊ - ACESSO AO SEU PORTAL*\n\nOlá, ${student.registrationData.nomePreferencia || student.nome}!\n\nSegue seu link e código de matrícula para acompanhar suas aulas, peças no forno e financeiro:\n\n• Código do Aluno: *${student.accessCode}*\n• Turma: ${student.turma}\n\nChave PIX do ateliê para compras e mensalidade: *61 996101254*\n\n_Ateliê Sah Pereira | Ollaria Cerâmica - Brasília DF_`;
    navigator.clipboard.writeText(text);
    setCopiedKeyId(student.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleSavePiece = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPieceTitle.trim()) return;

    addPiece({
      studentId: newPieceStudentId,
      titulo: newPieceTitle,
      tipoArgila: newPieceClay,
      etapa: 'modelagem_secagem',
      dataEntrada: new Date().toISOString().split('T')[0],
      tecnica: newPieceTech,
      dimensoesAprox: newPieceDim || 'Padrão',
      esmalteCores: newPieceGlaze || undefined,
      avaliacaoTecnica: {
        aprovadaParaQueima: !newPieceRisk,
        riscosIdentificados: newPieceRisk || undefined,
        observacoes: newPieceObs || 'Peça cadastrada para acompanhamento.'
      },
      fotoUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&auto=format&fit=crop&q=80'
    });

    setIsAddPieceOpen(false);
    setNewPieceTitle('');
    setNewPieceDim('');
    setNewPieceObs('');
    setNewPieceRisk('');
  };

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxDesc.trim() || !newTxVal) return;

    addTransaction({
      studentId: newTxStudentId,
      descricao: newTxDesc,
      categoria: newTxCat,
      valor: parseFloat(newTxVal),
      status: 'pendente',
      dataVencimento: newTxDueDate,
      metodoPagamento: 'pix',
      observacoes: `Chave PIX: 61 996101254.`
    });

    setIsAddTxOpen(false);
    setNewTxDesc('');
  };

  const handleQuickAttendance = (studentId: string, status: AttendanceStatus) => {
    const shiftLabel = attendanceShift === 'quarta-tarde' ? '15h20 - 17h50' : '18h20 - 20h50';
    registerAttendance(studentId, status, attendanceDate, shiftLabel);
  };

  // Filtered student list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.accessCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = filterShift === 'todos' || s.turma === filterShift;
    return matchesSearch && matchesShift;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#2C241E] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Painel de Controle Ateliê
            </span>
            <span className="text-xs text-[#7A6A5E] font-medium">Sah Pereira</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E] mt-1">
            Gestão Integrada Ollaria Cerâmica
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A5E]">
            Controle de alunos, presença, queimas de fornos, cobranças e relatórios mensais
          </p>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenRegistration}
            className="px-4 py-2.5 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#E6A15C]" />
            Nova Matrícula
          </button>
          
          <button
            onClick={() => setIsAddPieceOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] flex items-center gap-2 shadow-xs"
          >
            <Flame className="w-4 h-4" />
            Lançar Peça
          </button>

          <button
            onClick={() => setIsAddTxOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-[#4A3E35] text-xs font-bold hover:bg-[#FAF8F5] flex items-center gap-2 shadow-xs"
          >
            <CreditCard className="w-4 h-4 text-[#D97736]" />
            Nova Cobrança
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#E0D7CC] gap-2 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
          { id: 'students', label: 'Alunos & Matrículas', icon: Users, badge: students.length },
          { id: 'attendance', label: 'Presença & Aulas', icon: Calendar },
          { id: 'pieces', label: 'Peças & Fornos', icon: Flame, badge: piecesInKiln },
          { id: 'finance', label: 'Financeiro & Vendas', icon: CreditCard, badge: totalPendingFinance > 0 ? `R$ ${totalPendingFinance.toFixed(0)}` : undefined },
          { id: 'reminders', label: 'Notificações & Lembretes', icon: Bell, badge: studentsToRenew.length || undefined },
          { id: 'requests', label: 'Solicitações Cadastrais', icon: FileCheck, badge: pendingRequestsCount || undefined },
          { id: 'reports', label: 'Relatórios Mensais', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 font-semibold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-all ${
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

      {/* 1. TAB: VISÃO GERAL */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 4 Overview Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <div className="flex items-center justify-between text-[#7A6A5E] mb-1">
                <span className="text-xs font-semibold">Alunos Ativos</span>
                <Users className="w-4 h-4 text-[#D97736]" />
              </div>
              <span className="text-3xl font-serif font-bold text-[#2C241E]">{totalActiveStudents}</span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">
                {students.filter((s) => s.status === 'inadimplente').length} com pendência
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <div className="flex items-center justify-between text-[#7A6A5E] mb-1">
                <span className="text-xs font-semibold">Peças em Forno / Ateliê</span>
                <Flame className="w-4 h-4 text-[#D97736]" />
              </div>
              <span className="text-3xl font-serif font-bold text-[#2C241E]">{piecesInKiln}</span>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                {piecesReady} prontas para retirada
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <div className="flex items-center justify-between text-[#7A6A5E] mb-1">
                <span className="text-xs font-semibold">Faturamento Recebido</span>
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-3xl font-serif font-bold text-emerald-800">
                R$ {currentMonthRevenue.toFixed(2)}
              </span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">
                Mensalidades + Argilas + Queimas
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <div className="flex items-center justify-between text-[#7A6A5E] mb-1">
                <span className="text-xs font-semibold">Cobranças Pendentes</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-3xl font-serif font-bold text-amber-800">
                R$ {totalPendingFinance.toFixed(2)}
              </span>
              <p className="text-[11px] text-[#7A6A5E] mt-1">
                Aguardando quitação PIX
              </p>
            </div>

          </div>

          {/* Urgent Alerts row: 90 days policy & Renewals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Alert: Peças no limite dos 90 dias */}
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="font-serif font-bold text-base text-[#2C241E]">
                    Alerta de Guarda: Peças Próximas de 90 Dias
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {criticalPieces.length} no prazo
                </span>
              </div>

              <p className="text-xs text-[#7A6A5E] mb-3">
                Conforme o Regulamento da Ollaria, peças não retiradas após 90 dias da queima podem ser recicladas. Notifique os alunos:
              </p>

              {criticalPieces.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#7A6A5E] bg-[#FAF8F5] rounded-xl">
                  Nenhuma peça com prazo crítico no momento. Todas em dia!
                </div>
              ) : (
                <div className="space-y-2">
                  {criticalPieces.map((p) => {
                    const student = students.find((s) => s.id === p.studentId);
                    return (
                      <div key={p.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6DFD5] flex items-center justify-between gap-3 text-xs">
                        <div>
                          <strong className="text-[#2C241E] block">{p.titulo}</strong>
                          <span className="text-[#7A6A5E]">
                            Aluno: <strong>{student?.nome}</strong> • Limite: {p.prazoLimiteRetirada ? new Date(p.prazoLimiteRetirada).toLocaleDateString('pt-BR') : '90 dias'}
                          </span>
                        </div>

                        {student && (
                          <a
                            href={`https://wa.me/55${student.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(student.registrationData.nomePreferencia || student.nome)}!%20Lembramos%20que%20sua%20pe%C3%A7a%20"${encodeURIComponent(p.titulo)}"%20est%C3%A1%20pronta%20no%20Ollaria%20Ateli%C3%AA%20e%20o%20prazo%20de%20guarda%20de%2090%20dias%20est%C3%A1%20se%20esgotando.`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors shrink-0"
                            title="Avisar no WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Alert: Renovações de Plano Necessárias */}
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D97736]" />
                  <h3 className="font-serif font-bold text-base text-[#2C241E]">
                    Lembretes de Renovação de Matrícula
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-[#D97736] bg-[#D97736]/10 px-2 py-0.5 rounded-full">
                  {studentsToRenew.length} alunos
                </span>
              </div>

              <p className="text-xs text-[#7A6A5E] mb-3">
                Alunos com 2 ou menos aulas restantes no plano atual. Envie mensagem de renovação:
              </p>

              {studentsToRenew.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#7A6A5E] bg-[#FAF8F5] rounded-xl">
                  Nenhum plano terminando nesta semana.
                </div>
              ) : (
                <div className="space-y-2">
                  {studentsToRenew.map((st) => (
                    <div key={st.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6DFD5] flex items-center justify-between gap-3 text-xs">
                      <div>
                        <strong className="text-[#2C241E] block">{st.nome} ({st.accessCode})</strong>
                        <span className="text-[#7A6A5E]">
                          Restam apenas <strong>{st.aulasRestantes} aulas</strong> no plano {st.modalidade}
                        </span>
                      </div>

                      <a
                        href={`https://wa.me/55${st.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(st.registrationData.nomePreferencia || st.nome)}!%20Seu%20plano%20${st.modalidade}%20no%20Ollaria%20Ateli%C3%AA%20est%C3%A1%20chegando%20ao%20fim%20(restam%20${st.aulasRestantes}%20aulas).%20Gostaria%20de%20renovar%20sua%20vaga%20para%20o%20pr%C3%B3ximo%20per%C3%ADodo?%20Chave%20PIX:%2061%20996101254.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#D97736] text-white font-bold text-[11px] hover:bg-[#C26224] transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-3 h-3" /> Lembrar Renovação
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. TAB: ALUNOS & MATRÍCULAS */}
      {activeAdminTab === 'students' && (
        <div className="space-y-4">
          
          {/* Backup, Import and Export Actions Bar */}
          <div className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#2C241E]">
                    Base de Cadastros e Preservação de Dados
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {students.length} alunos preservados
                  </span>
                </div>
                <p className="text-[11px] text-[#7A6A5E] mt-0.5 leading-relaxed">
                  Os dados ficam guardados no seu navegador e não são perdidos ao atualizar. Se você precisar recadastrar, restaurar respostas ou levar para outro computador, use as opções de importação e exportação de planilha abaixo.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
              <button
                id="btn-import-spreadsheet"
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-[#D5CBC0] bg-white hover:bg-[#FAF0E6] text-[#2C241E] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Importar planilha de respostas (CSV/Excel) para cadastrar alunos em lote"
              >
                <Upload className="w-3.5 h-3.5 text-[#D97736]" />
                <span>Importar Planilha</span>
              </button>

              <button
                id="btn-export-spreadsheet"
                type="button"
                onClick={exportStudentsCSV}
                className="px-3.5 py-2 rounded-xl border border-[#D5CBC0] bg-white hover:bg-[#FAF0E6] text-[#2C241E] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Baixar planilha de todos os alunos em formato CSV compatível com Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Baixar Alunos (Excel/CSV)</span>
              </button>

              <button
                id="btn-export-backup-json"
                type="button"
                onClick={exportFullBackupJSON}
                className="px-3 py-2 rounded-xl bg-[#2C241E] hover:bg-[#43372E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Baixar arquivo de backup completo com alunos, peças, chamadas e pagamentos"
              >
                <Database className="w-3.5 h-3.5 text-[#E6A15C]" />
                <span>Backup Geral</span>
              </button>
            </div>
          </div>

          {/* Filter and search bar + Incluir Aluno */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6DFD5] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A6A5E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, código (ex: OL-4821) ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#4A3E35]"
              >
                <option value="todos">Todas as Turmas</option>
                <option value="quarta-tarde">Quarta Tarde (15h20)</option>
                <option value="quarta-noite">Quarta Noite (18h20)</option>
                <option value="sabado-manha">Sábado Manhã (09h30)</option>
                <option value="terca-noite">Terça Noite (18h20)</option>
              </select>

              <button
                id="btn-incluir-aluno-tab"
                onClick={() => setIsAddStudentOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap"
                title="Incluir novo aluno no ateliê"
              >
                <UserPlus className="w-4 h-4 text-[#E6A15C]" />
                <span>Incluir Aluno</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                  <tr>
                    <th className="p-3.5">Aluno & Contato</th>
                    <th className="p-3.5">Matrícula</th>
                    <th className="p-3.5">Turma & Plano</th>
                    <th className="p-3.5">Progresso Aulas</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4DA]">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={st.nome}
                            className="w-10 h-10 rounded-xl object-cover border border-[#E6DFD5]"
                          />
                          <div>
                            <strong className="text-[#2C241E] block font-serif text-sm">{st.nome}</strong>
                            <span className="text-xs text-[#7A6A5E]">{st.whatsapp}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[#D97736] tracking-wider text-xs bg-[#FAF0E6] px-2 py-0.5 rounded-md border border-[#F0D5C3] inline-block">
                            {st.accessCode}
                          </span>
                          <span className="text-[11px] text-[#7A6A5E] block font-mono truncate max-w-[140px]">{st.email}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-[#2C241E] block capitalize">{st.turma}</span>
                        <span className="text-xs text-[#7A6A5E] capitalize">Plano {st.modalidade}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-[#2C241E]">{st.aulasFeitas} / {st.aulasTotaisPlano}</span>
                            <span className="text-[#7A6A5E]">{st.aulasRestantes} restam</span>
                          </div>
                          <div className="w-full bg-[#EBE4DA] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#D97736] h-full"
                              style={{ width: `${Math.min(100, (st.aulasFeitas / st.aulasTotaisPlano) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          st.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {st.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Student Profile */}
                          <button
                            id={`btn-edit-student-${st.id}`}
                            onClick={() => setEditingStudent(st)}
                            className="p-1.5 rounded-lg border border-[#D5CBC0] bg-[#FAF8F5] text-[#2C241E] hover:bg-[#EBE4DA] hover:text-[#D97736] transition-colors"
                            title="Editar perfil completo do aluno"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Student */}
                          <button
                            id={`btn-delete-student-${st.id}`}
                            onClick={() => setDeletingStudent(st)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                            title="Excluir aluno do ateliê"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Copy WhatsApp Credentials */}
                          <button
                            onClick={() => copyStudentAccessText(st)}
                            className="p-1.5 rounded-lg border border-[#D5CBC0] bg-[#FAF8F5] text-[#4A3E35] hover:bg-[#EBE4DA] transition-colors"
                            title="Copiar dados para enviar no WhatsApp do aluno"
                          >
                            {copiedKeyId === st.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </button>

                          {/* View as Student */}
                          <button
                            onClick={() => {
                              setCurrentStudentById(st.id);
                              setRole('student');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#2C241E] text-white text-xs font-semibold hover:bg-[#43372E] flex items-center gap-1 transition-colors"
                            title="Acessar portal isolado deste aluno"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#E6A15C]" />
                            <span>Ver</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3. TAB: PRESENÇA & AULAS */}
      {activeAdminTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Quick Roll-Call Bar */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Chamada & Registro de Aulas
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                Marque presenças, faltas e reposições das alunas(os) em tempo real
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E]"
              />

              <select
                value={attendanceShift}
                onChange={(e) => setAttendanceShift(e.target.value as ClassShift)}
                className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E]"
              >
                <option value="quarta-tarde">Quarta Tarde (15h20 às 17h50)</option>
                <option value="quarta-noite">Quarta Noite (18h20 às 20h50)</option>
                <option value="sabado-manha">Sábado Manhã (09h30 às 12h00)</option>
              </select>
            </div>
          </div>

          {/* Students in chosen shift for roll-call */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-base text-[#2C241E] border-b border-[#EBE4DA] pb-2">
              Alunos Matriculados na Turma: {attendanceShift}
            </h4>

            <div className="divide-y divide-[#EBE4DA]">
              {students
                .filter((s) => s.turma === attendanceShift)
                .map((st) => (
                  <div key={st.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <strong className="text-[#2C241E] block font-serif text-base">{st.nome}</strong>
                      <span className="text-xs text-[#7A6A5E]">
                        Plano {st.modalidade} • <strong>{st.aulasFeitas} de {st.aulasTotaisPlano} feitas</strong> ({st.aulasRestantes} restantes)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAttendance(st.id, 'presente')}
                        className="px-3 py-1.5 rounded-xl bg-green-100 hover:bg-green-200 text-green-900 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                        Presente (+1 aula)
                      </button>

                      <button
                        onClick={() => handleQuickAttendance(st.id, 'falta')}
                        className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs transition-colors"
                      >
                        Falta
                      </button>

                      <button
                        onClick={() => handleQuickAttendance(st.id, 'reposicao')}
                        className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs transition-colors"
                      >
                        Reposição
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Attendance Log */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-base text-[#2C241E]">
              Histórico Recente de Presenças
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Aluno</th>
                    <th className="p-3">Horário</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Observação</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4DA]">
                  {attendance.slice(0, 10).map((a) => {
                    const st = students.find((s) => s.id === a.studentId);
                    return (
                      <tr key={a.id}>
                        <td className="p-3 text-[#2C241E] font-medium">{new Date(a.data).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3 font-semibold text-[#2C241E]">{st ? st.nome : 'Aluno'}</td>
                        <td className="p-3 text-[#7A6A5E]">{a.horario}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.status === 'presente' ? 'bg-green-100 text-green-800' : a.status === 'falta' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3 text-[#4A3E35]">{a.observacao || '-'}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deleteAttendance(a.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Excluir registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* 4. TAB: PEÇAS & FORNOS */}
      {activeAdminTab === 'pieces' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Acompanhamento Cerâmico das Peças
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                Mova as peças entre as etapas de queima e monitore o prazo de 90 dias de guarda
              </p>
            </div>

            <button
              onClick={() => setIsAddPieceOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Nova Peça de Aluno
            </button>
          </div>

          {/* Pieces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pieces.map((piece) => {
              const student = students.find((s) => s.id === piece.studentId);
              return (
                <div key={piece.id} className="bg-white rounded-2xl border border-[#E6DFD5] p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex gap-3">
                      <img
                        src={piece.fotoUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200&auto=format&fit=crop&q=80'}
                        alt={piece.titulo}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#E6DFD5]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#7A6A5E] block">
                          Aluno: {student?.registrationData.nomePreferencia || student?.nome}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#2C241E] truncate mt-0.5">
                          {piece.titulo}
                        </h4>
                        <p className="text-xs text-[#6B5A4D]">{piece.tipoArgila}</p>
                        <p className="text-[11px] text-[#7A6A5E]">{piece.tecnica}</p>
                      </div>
                    </div>

                    {/* Stage selector */}
                    <div className="mt-3">
                      <label className="block text-[11px] font-bold text-[#4A3E35] mb-1">
                        Etapa Atual:
                      </label>
                      <select
                        value={piece.etapa}
                        onChange={(e) => updatePieceStage(piece.id, e.target.value as PieceStage)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E]"
                      >
                        <option value="modelagem_secagem">1. Modelagem / Secagem</option>
                        <option value="aguardando_biscoito">2. Aguardando 1ª Queima (Biscoito)</option>
                        <option value="biscoito_queimado">3. Biscoitada (Pronta p/ Esmaltar)</option>
                        <option value="aguardando_esmalte">4. Aguardando Queima de Alta (Esmalte)</option>
                        <option value="queimada_pronta">5. Queimada • Pronta p/ Retirada (90 dias)</option>
                        <option value="retirada_entregue">6. Entregue / Retirada pelo Aluno</option>
                      </select>
                    </div>

                    {/* Technical note or risk */}
                    {piece.avaliacaoTecnica.riscosIdentificados && (
                      <div className="mt-2.5 p-2 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded-lg">
                        <strong>Risco:</strong> {piece.avaliacaoTecnica.riscosIdentificados}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EBE4DA] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#7A6A5E]">
                      {piece.etapa === 'queimada_pronta' ? `Prazo: ${piece.prazoLimiteRetirada ? new Date(piece.prazoLimiteRetirada).toLocaleDateString('pt-BR') : '90 dias'}` : 'Em processo'}
                    </span>
                    <button
                      onClick={() => deletePiece(piece.id)}
                      className="text-red-400 hover:text-red-700 p-1"
                      title="Remover peça"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 5. TAB: FINANCEIRO & VENDAS */}
      {activeAdminTab === 'finance' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Gestão Financeira do Ateliê
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                Controle de mensalidades, pães de argila, taxas de queimas e compras avulsas
              </p>
            </div>

            <button
              onClick={() => setIsAddTxOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#E6A15C]" /> Novo Lançamento
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                  <tr>
                    <th className="p-3.5">Aluno</th>
                    <th className="p-3.5">Descrição</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5">Valor</th>
                    <th className="p-3.5">Vencimento</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4DA]">
                  {transactions.map((tx) => {
                    const student = students.find((s) => s.id === tx.studentId);
                    const isPaid = tx.status === 'pago';

                    return (
                      <tr key={tx.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="p-3.5 font-semibold text-[#2C241E]">
                          {student?.nome || 'Aluno'}
                        </td>
                        <td className="p-3.5 text-[#4A3E35]">
                          {tx.descricao}
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
                            isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaid && (
                              <button
                                onClick={() => markTransactionAsPaid(tx.id, 'pix')}
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold"
                              >
                                Baixar (Pago)
                              </button>
                            )}

                            {!isPaid && student && (
                              <a
                                href={`https://wa.me/55${student.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(student.registrationData.nomePreferencia || student.nome)}!%20Lembrete%20da%20mensalidade/material%20do%20Ollaria%20Ateli%C3%AA:%20${encodeURIComponent(tx.descricao)}%20no%20valor%20de%20R$%20${tx.valor.toFixed(2)}.%20Chave%20PIX:%2061%20996101254.`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg border border-[#D5CBC0] bg-[#FAF8F5] text-[#4A3E35] hover:bg-[#EBE4DA]"
                                title="Cobrar no WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5 text-[#25D366]" />
                              </a>
                            )}

                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="text-red-400 hover:text-red-700 p-1"
                              title="Excluir lançamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* 6. TAB: LEMBRETES & COBRANÇAS */}
      {activeAdminTab === 'reminders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD5] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#2C241E]">
              Central de Notificações Automáticas e Cobranças
            </h3>
            <p className="text-xs text-[#7A6A5E]">
              O sistema monitora automaticamente os vencimentos de planos, saldo de aulas e peças queimadas aguardando retirada.
            </p>

            <div className="space-y-3">
              {notifications.map((notif) => {
                const student = students.find((s) => s.id === notif.studentId);
                return (
                  <div key={notif.id} className="p-4 rounded-xl border border-[#E6DFD5] bg-[#FAF8F5] flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white border border-[#E6DFD5] text-[#D97736] shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-[#2C241E] text-sm">{notif.titulo}</strong>
                          <span className="text-xs bg-[#EBE4DA] px-2 py-0.5 rounded-md font-semibold text-[#6B5A4D]">
                            {student ? student.nome : 'Global'}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C4D41] mt-1">{notif.mensagem}</p>
                        <span className="text-[11px] text-[#7A6A5E] block mt-1">
                          {new Date(notif.dataCriacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {notif.whatsappLink && (
                      <a
                        href={notif.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-[#20b859]"
                      >
                        <Send className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB: SOLICITAÇÕES CADASTRAIS (APROVAÇÃO DA ADMINISTRAÇÃO) */}
      {activeAdminTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD5] shadow-xs space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Solicitações de Alteração Cadastral dos Alunos
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                Conforme as regras do ateliê, os aceites de termos são imutáveis e quaisquer alterações em dados de cadastro (endereço, telefone, emergência) dependem da aprovação da administração.
              </p>
            </div>

            {changeRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7A6A5E] bg-[#FAF8F5] rounded-2xl">
                Nenhuma solicitação de alteração cadastral no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {changeRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-[#E6DFD5] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-[#2C241E] text-sm">{req.studentName}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.status === 'pendente' ? 'bg-amber-100 text-amber-800' : req.status === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A3E35]">
                        <strong>Campo:</strong> {req.campoAlterado}
                      </p>
                      <p className="text-xs text-[#7A6A5E]">
                        <strong>Anterior:</strong> "{req.valorAnterior}" &rarr; <strong>Novo:</strong> "<span className="text-[#2C241E] font-semibold">{req.novoValor}</span>"
                      </p>
                      {req.motivo && <p className="text-xs italic text-[#7A6A5E]">Motivo: {req.motivo}</p>}
                    </div>

                    {req.status === 'pendente' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => resolveProfileChange(req.id, 'aprovado')}
                          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Aprovar Alteração
                        </button>
                        <button
                          onClick={() => resolveProfileChange(req.id, 'rejeitado')}
                          className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-[#4A3E35] font-semibold text-xs hover:bg-[#FAF8F5]"
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB: RELATÓRIOS MENSAIS AUTOMÁTICOS */}
      {activeAdminTab === 'reports' && (
        <MonthlyReportView />
      )}

      {/* Modal: Lançar Nova Peça */}
      {isAddPieceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241E]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E6DFD5] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#F2ECE3] px-6 py-4 border-b border-[#E0D7CC] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Lançar Nova Peça Cerâmica
              </h3>
              <button onClick={() => setIsAddPieceOpen(false)} className="text-[#7A6A5E] hover:text-[#2C241E]">✕</button>
            </div>

            <form onSubmit={handleSavePiece} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">Aluno Proprietário *</label>
                <select
                  value={newPieceStudentId}
                  onChange={(e) => setNewPieceStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>{st.nome} ({st.accessCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">Título / Descrição da Peça *</label>
                <input
                  type="text"
                  placeholder="Ex: Bowl Texturizado, Vaso Garrafa, Prato de Sobremesa..."
                  value={newPieceTitle}
                  onChange={(e) => setNewPieceTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1">Argila Utilizada</label>
                  <select
                    value={newPieceClay}
                    onChange={(e) => setNewPieceClay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                  >
                    <option value="Argila Terracota Nacional">Terracota Nacional</option>
                    <option value="Argila Shiro Branca">Shiro Branca</option>
                    <option value="Argila Tabaco c/ Chamote">Tabaco c/ Chamote</option>
                    <option value="Argila Creme com Pintas">Creme com Pintas</option>
                    <option value="Porcelana">Porcelana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1">Técnica</label>
                  <select
                    value={newPieceTech}
                    onChange={(e) => setNewPieceTech(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                  >
                    <option value="Torno elétrico">Torno elétrico</option>
                    <option value="Placas">Placas</option>
                    <option value="Belisco">Belisco</option>
                    <option value="Rolinhos (Cobrinhas)">Rolinhos (Cobrinhas)</option>
                    <option value="Escultura">Escultura</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">Dimensões Aproximadas</label>
                <input
                  type="text"
                  placeholder="Ex: 15cm x 10cm"
                  value={newPieceDim}
                  onChange={(e) => setNewPieceDim(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">Riscos Identificados na Avaliação Técnica (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Espessura excessiva na base, bolha de ar ou umidade alta"
                  value={newPieceRisk}
                  onChange={(e) => setNewPieceRisk(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                />
              </div>

              <div className="pt-3 border-t border-[#E6DFD5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPieceOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5CBC0] bg-white text-[#4A3E35]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D97736] text-white font-bold"
                >
                  Cadastrar Peça
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Lançamento Financeiro */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241E]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E6DFD5] w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#F2ECE3] px-6 py-4 border-b border-[#E0D7CC] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#2C241E]">
                Nova Cobrança / Insumo
              </h3>
              <button onClick={() => setIsAddTxOpen(false)} className="text-[#7A6A5E] hover:text-[#2C241E]">✕</button>
            </div>

            <form onSubmit={handleSaveTx} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">Aluno *</label>
                <select
                  value={newTxStudentId}
                  onChange={(e) => setNewTxStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>{st.nome} ({st.accessCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">Categoria</label>
                <select
                  value={newTxCat}
                  onChange={(e) => setNewTxCat(e.target.value as PaymentCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                >
                  <option value="argila">Pão de Argila (cobrado à parte)</option>
                  <option value="queima">Taxa de Queima (Biscoito/Alta)</option>
                  <option value="mensalidade">Mensalidade Regular</option>
                  <option value="ferramentas">Ferramentas / Acessórios</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Pão de Argila Terracota 10kg, Taxa Queima 1.5kg..."
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTxVal}
                    onChange={(e) => setNewTxVal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={newTxDueDate}
                    onChange={(e) => setNewTxDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6DFD5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5CBC0] bg-white text-[#4A3E35]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2C241E] text-white font-bold"
                >
                  Lançar Cobrança
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-red-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="text-center">
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Excluir Matrícula do Aluno?
              </h3>
              <p className="text-xs text-[#7A6A5E] mt-1.5 leading-relaxed">
                Tem certeza que deseja excluir permanentemente o cadastro de <strong>{deletingStudent.nome}</strong> (Código: <span className="font-mono font-bold text-[#D97736]">{deletingStudent.accessCode}</span>)?
              </p>
              <p className="text-[11px] text-red-600 font-medium bg-red-50 p-2.5 rounded-xl mt-3 border border-red-100">
                Esta ação removerá as peças registradas, histórico de aulas e cobranças deste aluno no ateliê.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#D5CBC0] text-xs font-semibold text-[#4A3E35] hover:bg-[#FAF8F5] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-delete-student"
                onClick={() => {
                  deleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
              >
                Sim, Excluir Aluno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={!!editingStudent}
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onOpenFullWizard={onOpenRegistration}
      />

      {/* Import Students Spreadsheet Modal */}
      <ImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(importedList, mode) => {
          importStudents(importedList, mode);
        }}
      />

    </div>
  );
};
