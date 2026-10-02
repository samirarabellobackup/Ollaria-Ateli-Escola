import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  RotateCcw,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  DollarSign,
  AlertCircle,
  Sparkles,
  Info,
  CalendarCheck,
  Check,
  X
} from 'lucide-react';
import {
  AttendanceRecord,
  ClassAttendanceStatus,
  ClassClassification,
  ReplacementDecision,
  ClassReplacement,
  ClassShift,
  Student,
  normalizeAttendanceStatus,
  normalizeClassClassification,
  getMemberMonthlyClassSummary
} from '../../../types';
import { useStudio } from '../../../context/StudioContext';
import { ClassRecordModal } from './ClassRecordModal';
import { ClassReplacementModal } from './ClassReplacementModal';

export const ClassAttendanceManager: React.FC = () => {
  const {
    students,
    attendance,
    classReplacements,
    saveClassAttendance,
    deleteAttendance,
    deleteClassReplacement,
    markReplacementCompleted,
    dismissClassReplacement,
    cancelClassReplacement
  } = useStudio();

  // 3 Formas Principais de Visualização (Seção 19)
  const [activeView, setActiveView] = useState<'data' | 'membro' | 'reposicoes'>('data');

  // Modais de Criação e Edição
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<AttendanceRecord | null>(null);
  
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [replacementToEdit, setReplacementToEdit] = useState<ClassReplacement | null>(null);

  // Estados da Visão por Data
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('todos');
  const [searchQueryDate, setSearchQueryDate] = useState<string>('');

  // Estados da Visão por Membr@
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // YYYY-MM
  );
  const [classFilterMembro, setClassFilterMembro] = useState<string>('todas');

  // Estados da Visão Geral de Reposições
  const [replacementStatusFilter, setReplacementStatusFilter] = useState<string>('todos');
  const [replacementStudentFilter, setReplacementStudentFilter] = useState<string>('todos');
  const [replacementSearch, setReplacementSearch] = useState<string>('');

  // Navegação rápida de datas
  const handleDateShift = (days: number) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Formatação do cabeçalho da data (ex: "QUARTA-FEIRA — 30/09/2026")
  const formattedDateTitle = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
      const dateFormatted = d.toLocaleDateString('pt-BR');
      return `${weekday} — ${dateFormatted}`;
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Aulas da data selecionada
  const classesOnSelectedDate = useMemo(() => {
    return attendance.filter((a) => {
      if (a.data !== selectedDate) return false;
      if (selectedShiftFilter !== 'todos' && a.turma !== selectedShiftFilter) return false;
      if (searchQueryDate.trim()) {
        const q = searchQueryDate.toLowerCase();
        const st = students.find((s) => s.id === a.studentId);
        const matchName = st?.nome.toLowerCase().includes(q);
        const matchCode = st?.accessCode.toLowerCase().includes(q);
        const matchObs = a.observacao?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchObs) return false;
      }
      return true;
    });
  }, [attendance, selectedDate, selectedShiftFilter, searchQueryDate, students]);

  // Alunos matriculados no turno selecionado para a chamada rápida
  const shiftStudentsForRollCall = useMemo(() => {
    if (selectedShiftFilter === 'todos') {
      return students.slice(0, 10);
    }
    return students.filter((s) => s.turma === selectedShiftFilter);
  }, [students, selectedShiftFilter]);

  // Ações de alteração rápida de status em 1 clique
  const handleQuickStatusChange = (record: AttendanceRecord, newStatus: ClassAttendanceStatus) => {
    saveClassAttendance({
      ...record,
      status: newStatus,
      decisaoReposicao:
        newStatus === 'Falta da Ollaria'
          ? 'Reposição concedida'
          : newStatus === 'Realizada'
          ? 'Sem reposição'
          : record.decisaoReposicao,
      responsabilidadeAusencia:
        newStatus === 'Falta da Ollaria' ? 'Ollaria' : record.responsabilidadeAusencia
    });
  };

  // Registro rápido para aluno que ainda não tem aula registrada na data
  const handleQuickCreateAttendance = (student: Student, newStatus: ClassAttendanceStatus) => {
    const defaultHorario =
      student.turma === 'quarta-noite'
        ? '18h20 - 20h50'
        : student.turma === 'sabado-manha'
        ? '09h30 - 12h00'
        : '15h20 - 17h50';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: student.id,
      data: selectedDate,
      horario: defaultHorario,
      horarioPrevisto: defaultHorario,
      horarioRealizado: newStatus === 'Realizada' ? defaultHorario : undefined,
      duracaoPrevistaMinutos: 150,
      duracaoRealizadaMinutos: newStatus === 'Realizada' ? 150 : 0,
      turma: student.turma,
      status: newStatus,
      classificacao: 'Mensalidade',
      decisaoReposicao:
        newStatus === 'Falta da Ollaria'
          ? 'Reposição concedida'
          : newStatus === 'Realizada'
          ? 'Sem reposição'
          : 'Reposição pendente de decisão',
      responsabilidadeAusencia: newStatus === 'Falta da Ollaria' ? 'Ollaria' : 'Membr@',
      observacao: `Chamada realizada em ${selectedDate}`,
      registradoPor: 'Samira Rebello (Ollaria)',
      createdAt: new Date().toISOString()
    };

    saveClassAttendance(newRecord);
  };

  // Membro selecionado na visão por membro
  const currentMember = students.find((s) => s.id === selectedStudentId) || students[0];

  // Sumário do mês do membro selecionado (Seções 15, 16, 17)
  const memberMonthlySummary = useMemo(() => {
    if (!currentMember) return null;
    return getMemberMonthlyClassSummary(currentMember.id, attendance, classReplacements, selectedMonth);
  }, [currentMember, attendance, classReplacements, selectedMonth]);

  // Histórico de aulas do membro selecionado
  const memberAttendanceHistory = useMemo(() => {
    if (!currentMember) return [];
    return attendance.filter((a) => {
      if (a.studentId !== currentMember.id) return false;
      if (selectedMonth && !a.data.startsWith(selectedMonth)) return false;
      if (classFilterMembro !== 'todas') {
        const cl = normalizeClassClassification(a);
        if (cl !== classFilterMembro) return false;
      }
      return true;
    });
  }, [currentMember, attendance, selectedMonth, classFilterMembro]);

  // Reposições do membro selecionado
  const memberReplacements = useMemo(() => {
    if (!currentMember) return [];
    return classReplacements.filter((r) => r.studentId === currentMember.id);
  }, [currentMember, classReplacements]);

  // Filtro geral de reposições (Visão 3)
  const filteredAllReplacements = useMemo(() => {
    return classReplacements.filter((r) => {
      if (replacementStatusFilter !== 'todos' && r.status !== replacementStatusFilter) return false;
      if (replacementStudentFilter !== 'todos' && r.studentId !== replacementStudentFilter) return false;
      if (replacementSearch.trim()) {
        const q = replacementSearch.toLowerCase();
        const st = students.find((s) => s.id === r.studentId);
        const matchName = st?.nome.toLowerCase().includes(q);
        const matchMotivo = r.motivo.toLowerCase().includes(q);
        const matchData = r.dataOrigem.includes(q);
        if (!matchName && !matchMotivo && !matchData) return false;
      }
      return true;
    });
  }, [classReplacements, replacementStatusFilter, replacementStudentFilter, replacementSearch, students]);

  // Totais de reposições
  const totalPendingReplacements = classReplacements.filter((r) => r.status === 'Pendente').length;
  const totalScheduledReplacements = classReplacements.filter((r) => r.status === 'Agendada').length;
  const totalCompletedReplacements = classReplacements.filter((r) => r.status === 'Realizada').length;
  const totalDismissedOrCancelled = classReplacements.filter((r) => r.status === 'Dispensada' || r.status === 'Cancelada').length;

  return (
    <div className="space-y-6">

      {/* TOP HEADER: CHAMADA & REGISTRO DE AULAS */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#2C241E] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D97736]" />
            Chamada & Registro de Aulas
          </h3>
          <p className="text-xs text-[#7A6A5E] mt-0.5">
            Controle de aulas, frequência, reposições, horas, consumos e cobranças dos Membr@s Ollaria
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setRecordToEdit(null);
              setIsRecordModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#D97736] hover:bg-[#C26224] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Nova Aula / Registro
          </button>

          <button
            onClick={() => {
              setReplacementToEdit(null);
              setIsReplacementModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-purple-700" /> Conceder Reposição
          </button>
        </div>
      </div>

      {/* 3 FORMAS PRINCIPAIS DE VISUALIZAÇÃO (Seção 19) */}
      <div className="flex items-center gap-2 border-b border-[#E6DFD5] pb-1">
        <button
          onClick={() => setActiveView('data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeView === 'data'
              ? 'bg-[#2C241E] text-white shadow-xs'
              : 'text-[#7A6A5E] hover:text-[#2C241E] hover:bg-[#FAF8F5]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Por Data
        </button>

        <button
          onClick={() => setActiveView('membro')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeView === 'membro'
              ? 'bg-[#2C241E] text-white shadow-xs'
              : 'text-[#7A6A5E] hover:text-[#2C241E] hover:bg-[#FAF8F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          Por Membr@
        </button>

        <button
          onClick={() => setActiveView('reposicoes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeView === 'reposicoes'
              ? 'bg-[#2C241E] text-white shadow-xs'
              : 'text-[#7A6A5E] hover:text-[#2C241E] hover:bg-[#FAF8F5]'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Reposições
          {totalPendingReplacements > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-black">
              {totalPendingReplacements}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. VISÃO POR DATA (Seção 20) */}
      {/* ========================================================================= */}
      {activeView === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Barra de Seleção e Navegação da Data */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6DFD5] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Controles da Data */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleDateShift(-1)}
                className="p-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] hover:bg-[#EBE4DA] text-[#5C4D41] transition-colors"
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-bold text-[#2C241E]"
              />

              <button
                onClick={() => handleDateShift(1)}
                className="p-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] hover:bg-[#EBE4DA] text-[#5C4D41] transition-colors"
                title="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSetToday}
                className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#D97736] transition-colors"
              >
                Hoje
              </button>

              <div className="h-6 w-px bg-[#E6DFD5] mx-1 hidden sm:block" />

              <span className="font-serif font-black text-sm sm:text-base text-[#2C241E] uppercase tracking-wide">
                {formattedDateTitle}
              </span>
            </div>

            {/* Filtros da Data */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedShiftFilter}
                onChange={(e) => setSelectedShiftFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E]"
              >
                <option value="todos">Todas as Turmas / Turnos</option>
                <option value="quarta-tarde">Quarta Tarde (15h20 às 17h50)</option>
                <option value="quarta-noite">Quarta Noite (18h20 às 20h50)</option>
                <option value="sabado-manha">Sábado Manhã (09h30 às 12h00)</option>
                <option value="terca-noite">Terça Noite (18h20 às 20h50)</option>
                <option value="avulso">Horários Avulsos</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5E]" />
                <input
                  type="text"
                  value={searchQueryDate}
                  onChange={(e) => setSearchQueryDate(e.target.value)}
                  placeholder="Buscar membr@..."
                  className="pl-8 pr-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs text-[#2C241E] w-36 sm:w-48"
                />
              </div>
            </div>

          </div>

          {/* CHAMADA RÁPIDA DA TURMA DO DIA */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-2.5">
              <div>
                <h4 className="font-serif font-bold text-base text-[#2C241E] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#D97736]" />
                  Chamada Rápida dos Membr@s: {selectedShiftFilter === 'todos' ? 'Todos os Membr@s' : selectedShiftFilter}
                </h4>
                <p className="text-[11px] text-[#7A6A5E]">
                  Bata a presença ou registre a ausência em 1 clique. Falta da Ollaria gera reposição automática.
                </p>
              </div>
              <span className="text-xs font-bold text-[#7A6A5E]">
                {shiftStudentsForRollCall.length} membr@s listados
              </span>
            </div>

            <div className="divide-y divide-[#EBE4DA]">
              {shiftStudentsForRollCall.map((student) => {
                // Verificar se o aluno já tem aula registrada nessa data
                const existingClass = classesOnSelectedDate.find((a) => a.studentId === student.id);
                const summary = getMemberMonthlyClassSummary(student.id, attendance, classReplacements, selectedDate.substring(0, 7));

                return (
                  <div key={student.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={student.nome}
                        className="w-10 h-10 rounded-full object-cover border border-[#D5CBC0]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-serif text-[#2C241E]">{student.nome}</strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FAF8F5] text-[#7A6A5E] border border-[#E6DFD5]">
                            {student.accessCode}
                          </span>
                        </div>
                        <div className="text-xs text-[#7A6A5E] flex items-center gap-2 flex-wrap">
                          <span>Plano {student.modalidade}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#2C241E]">
                            Mensalidade: <strong>{summary.countMensalidade}/4</strong>
                          </span>
                          {summary.limiteAtingido && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                              Limite mensal atingido
                            </span>
                          )}
                          {summary.totalReposicoesPendentesCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-bold">
                              {summary.totalReposicoesPendentesCount} reposição pendente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de chamada rápida ou status atual */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {existingClass ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#7A6A5E] font-medium">Registrado como:</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            existingClass.status === 'Realizada'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : existingClass.status === 'Falta da Ollaria'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : existingClass.status === 'Cancelada'
                              ? 'bg-stone-200 text-stone-800 border border-stone-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {existingClass.status}
                          </span>
                          <button
                            onClick={() => {
                              setRecordToEdit(existingClass);
                              setIsRecordModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[#D5CBC0] hover:bg-[#FAF8F5] text-xs font-bold text-[#5C4D41]"
                            title="Editar detalhes da aula"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickCreateAttendance(student, 'Realizada')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Realizada
                          </button>

                          <button
                            onClick={() => handleQuickCreateAttendance(student, 'Falta do membr@')}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs transition-colors"
                          >
                            Falta do Membr@
                          </button>

                          <button
                            onClick={() => handleQuickCreateAttendance(student, 'Falta da Ollaria')}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs transition-colors"
                            title="Gera automaticamente 1 reposição concedida pendente"
                          >
                            Falta da Ollaria
                          </button>

                          <button
                            onClick={() => handleQuickCreateAttendance(student, 'Cancelada')}
                            className="px-2.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
                          >
                            Cancelada
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LISTA COMPLETA DAS AULAS REGISTRADAS NA DATA */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-3">
              <div>
                <h4 className="font-serif font-bold text-base text-[#2C241E]">
                  Aulas Registradas nesta Data ({classesOnSelectedDate.length})
                </h4>
                <p className="text-xs text-[#7A6A5E]">
                  Acompanhe horário previsto vs realizado, classificação, reposições geradas e cobranças
                </p>
              </div>

              <button
                onClick={() => {
                  setRecordToEdit(null);
                  setIsRecordModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#D97736] text-[#D97736] hover:bg-[#D97736]/10 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Aula nesta Data
              </button>
            </div>

            {classesOnSelectedDate.length === 0 ? (
              <div className="py-12 text-center text-[#7A6A5E] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D5CBC0]">
                <Calendar className="w-8 h-8 text-[#A89A8D] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">Nenhuma aula registrada para esta data.</p>
                <p className="text-xs text-[#A89A8D] mt-0.5">
                  Utilize os botões da Chamada Rápida acima ou clique em "Adicionar Aula nesta Data".
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EBE4DA]">
                {classesOnSelectedDate.map((c) => {
                  const student = students.find((s) => s.id === c.studentId);
                  const normSt = normalizeAttendanceStatus(c.status);
                  const normCl = normalizeClassClassification(c);

                  return (
                    <div key={c.id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={student?.nome}
                            className="w-10 h-10 rounded-full object-cover border border-[#D5CBC0] shrink-0 mt-0.5"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-base text-[#2C241E]">
                                {student ? student.nome : 'Membr@'}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FAF8F5] text-[#7A6A5E] border border-[#E6DFD5]">
                                {student?.accessCode}
                              </span>

                              {/* Classificação da Aula (Seção 3) */}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                normCl === 'Mensalidade'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : normCl === 'Reposição'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}>
                                {normCl}
                              </span>

                              {/* Status Oficial da Aula (Seção 2) */}
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                normSt === 'Realizada'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : normSt === 'Falta da Ollaria'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : normSt === 'Cancelada'
                                  ? 'bg-stone-200 text-stone-800 border border-stone-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}>
                                {normSt}
                              </span>

                              {/* Cobrança associada */}
                              {c.temCobranca && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                  c.statusCobranca === 'pago' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  <DollarSign className="w-3 h-3" />
                                  R$ {c.valorCobranca?.toFixed(2)} ({c.statusCobranca === 'pago' ? 'Pago' : 'Pendente'})
                                </span>
                              )}
                            </div>

                            {/* Detalhes de Horários e Duração */}
                            <div className="text-xs text-[#7A6A5E] mt-1 flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#D97736]" />
                                Horário: <strong>{c.horario}</strong>
                              </span>

                              {c.duracaoRealizadaMinutos !== undefined && (
                                <span>
                                  Duração: <strong>{c.duracaoRealizadaMinutos} min</strong>
                                  {c.duracaoPrevistaMinutos ? ` (de ${c.duracaoPrevistaMinutos} min previstos)` : ''}
                                </span>
                              )}

                              {c.turma && (
                                <span>Turma: <strong>{c.turma}</strong></span>
                              )}
                            </div>

                            {/* Situação da Reposição (Seções 4, 5, 6, 8, 9, 10) */}
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
                              {c.decisaoReposicao && (
                                <span className="text-[#5C4D41]">
                                  Situação Reposição: <strong>{c.decisaoReposicao}</strong>
                                </span>
                              )}

                              {c.tempoAReporMinutos && c.tempoAReporMinutos > 0 ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                                  Atraso: {c.tempoAReporMinutos} minutos a repor
                                </span>
                              ) : null}

                              {c.motivoAusenciaAlteracao && (
                                <span className="text-xs text-[#7A6A5E] italic">
                                  Motivo: "{c.motivoAusenciaAlteracao}"
                                </span>
                              )}
                            </div>

                            {c.observacao && (
                              <p className="text-xs text-[#4A3E35] mt-1 bg-[#FAF8F5] p-2 rounded-xl border border-[#E6DFD5]">
                                <strong>Obs:</strong> {c.observacao}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Botões de Ação para a Aula */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* 4 botões de 1 clique para alterar status */}
                          <div className="hidden lg:flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6DFD5]">
                            {(['Realizada', 'Falta do membr@', 'Falta da Ollaria', 'Cancelada'] as ClassAttendanceStatus[]).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleQuickStatusChange(c, st)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  normSt === st
                                    ? 'bg-[#2C241E] text-white shadow-2xs'
                                    : 'text-[#7A6A5E] hover:text-[#2C241E] hover:bg-white'
                                }`}
                                title={`Mudar para ${st}`}
                              >
                                {st === 'Realizada' ? 'Realizada' : st === 'Falta do membr@' ? 'Falta Membr@' : st === 'Falta da Ollaria' ? 'Falta Ollaria' : 'Cancelada'}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => {
                              setRecordToEdit(c);
                              setIsRecordModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] hover:bg-[#EBE4DA] text-xs font-bold text-[#2C241E] flex items-center gap-1.5 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#D97736]" />
                            Editar
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este registro de aula?')) {
                                deleteAttendance(c.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                            title="Excluir aula"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* ========================================================================= */}
      {/* 2. VISÃO POR MEMBR@ (Seção 21) */}
      {/* ========================================================================= */}
      {activeView === 'membro' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Seletor de Membro e Mês */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full md:w-auto flex-1 max-w-md">
              <label className="block text-xs font-bold text-[#2C241E] mb-1.5 uppercase">
                Selecione o Membr@ Ollaria
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-sm font-bold text-[#2C241E]"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.nome} ({st.accessCode}) — Turma: {st.turma}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
              <div>
                <label className="block text-[11px] font-bold text-[#7A6A5E] mb-1">
                  Mês de Referência
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-bold text-[#2C241E]"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setRecordToEdit(null);
                    setIsRecordModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#D97736] hover:bg-[#C26224] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Nova Aula para este Membr@
                </button>
              </div>
            </div>
          </div>

          {/* CARD DE RESUMO DO MEMBRO SELECIONADO (Seções 15, 16, 17) */}
          {memberMonthlySummary && currentMember && (
            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E6DFD5] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6DFD5] pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentMember.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                    alt={currentMember.nome}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#D97736]"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-lg text-[#2C241E]">
                      {currentMember.nome}
                    </h4>
                    <p className="text-xs text-[#7A6A5E]">
                      Código: <strong>{currentMember.accessCode}</strong> • Turma: <strong>{currentMember.turma}</strong> • Plano: <strong>{currentMember.modalidade}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReplacementToEdit(null);
                    setIsReplacementModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 text-purple-900 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4 text-purple-700" /> Conceder Reposição Manual
                </button>
              </div>

              {/* Grid de 4 Indicadores Cruciais (SEÇÃO 17: NUNCA MOSTRAR 5/4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. MENSALIDADE: 4 AULAS POR MÊS */}
                <div className="bg-white p-4 rounded-2xl border border-[#E6DFD5] space-y-2">
                  <span className="text-[11px] font-bold text-[#7A6A5E] uppercase tracking-wider block">
                    Mensalidade ({selectedMonth})
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif font-black text-2xl text-[#2C241E]">
                      {memberMonthlySummary.countMensalidade}
                    </span>
                    <span className="text-sm font-bold text-[#7A6A5E]">/ 4 aulas</span>
                  </div>

                  {/* Barra de 4 segmentos */}
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-2 rounded-full ${
                          step <= memberMonthlySummary.countMensalidade
                            ? 'bg-[#D97736]'
                            : 'bg-[#EBE4DA]'
                        }`}
                      />
                    ))}
                  </div>

                  {memberMonthlySummary.limiteAtingido ? (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md block mt-1">
                      4 aulas realizadas — limite mensal atingido
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#7A6A5E] block mt-1">
                      {4 - memberMonthlySummary.countMensalidade} aula(s) restante(s) neste mês
                    </span>
                  )}
                </div>

                {/* 2. REPOSIÇÕES PENDENTES */}
                <div className="bg-white p-4 rounded-2xl border border-purple-200 space-y-1">
                  <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                    Reposições Pendentes
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif font-black text-2xl text-purple-950">
                      {memberMonthlySummary.totalReposicoesPendentesCount}
                    </span>
                    <span className="text-xs font-semibold text-purple-800">
                      ({memberMonthlySummary.aulasInteirasPendentes} aula(s) + {memberMonthlySummary.minutosPendentes % 150} min)
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700 pt-1">
                    Total em saldo: <strong>{memberMonthlySummary.minutosPendentes} minutos</strong>
                  </p>
                </div>

                {/* 3. REPOSIÇÕES AGENDADAS E REALIZADAS */}
                <div className="bg-white p-4 rounded-2xl border border-blue-200 space-y-1">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                    Reposições Agendadas
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif font-black text-2xl text-blue-950">
                      {memberMonthlySummary.totalReposicoesAgendadasCount}
                    </span>
                    <span className="text-xs text-blue-800">marcadas p/ futuro</span>
                  </div>
                  <p className="text-[11px] text-blue-700 pt-1">
                    Realizadas total: <strong>{memberMonthlySummary.reposicoesRealizadasTotal.length}</strong>
                  </p>
                </div>

                {/* 4. AULAS EXTRAS */}
                <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                    Aulas Extras
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif font-black text-2xl text-amber-950">
                      {memberMonthlySummary.countExtrasMes}
                    </span>
                    <span className="text-xs text-amber-800">no mês de ref.</span>
                  </div>
                  <p className="text-[11px] text-amber-700 pt-1">
                    Faltas no mês: <strong>{memberMonthlySummary.faltasMembroNoMes + memberMonthlySummary.faltasOllariaNoMes}</strong>
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* EXTRATO DE REPOSIÇÕES DO MEMBRO */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD5] shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-base text-[#2C241E] flex items-center justify-between border-b border-[#EBE4DA] pb-3">
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-700" />
                Extrato de Reposições Deste Membr@ ({memberReplacements.length})
              </span>
              <span className="text-xs font-normal text-[#7A6A5E]">
                Histórico de créditos e débitos de tempo e aulas
              </span>
            </h4>

            {memberReplacements.length === 0 ? (
              <p className="text-xs text-[#7A6A5E] py-4 text-center">
                Nenhum crédito de reposição gerado ou concedido para este membr@.
              </p>
            ) : (
              <div className="divide-y divide-[#EBE4DA]">
                {memberReplacements.map((rep) => (
                  <div key={rep.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs font-serif text-[#2C241E]">
                          Data Origem: {new Date(rep.dataOrigem).toLocaleDateString('pt-BR')}
                        </strong>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rep.status === 'Pendente'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : rep.status === 'Agendada'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : rep.status === 'Realizada'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : 'bg-stone-200 text-stone-800'
                        }`}>
                          {rep.status}
                        </span>
                        <span className="text-xs font-semibold text-[#D97736]">
                          {rep.tipo === 'tempo_minutos' ? `${rep.minutosRestantes} min restantes` : `1 Aula (${rep.minutosRestantes} min restantes)`}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C4D41] mt-0.5">
                        Motivo: <strong>{rep.motivo}</strong> (Resp: {rep.responsabilidade || 'Ollaria'})
                      </p>
                      {rep.status === 'Agendada' && rep.dataAgendada && (
                        <p className="text-[11px] text-blue-800 font-semibold mt-0.5">
                          Agendada para: {new Date(rep.dataAgendada).toLocaleDateString('pt-BR')} às {rep.horarioAgendado}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {rep.status === 'Pendente' && (
                        <button
                          onClick={() => markReplacementCompleted(rep.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs"
                        >
                          Marcar Realizada
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setReplacementToEdit(rep);
                          setIsReplacementModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-[#D5CBC0] hover:bg-[#FAF8F5] text-xs font-bold text-[#5C4D41]"
                        title="Editar reposição"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir este crédito de reposição?')) {
                            deleteClassReplacement(rep.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTÓRICO COMPLETO DE AULAS DO MEMBRO */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-3 flex-wrap gap-2">
              <div>
                <h4 className="font-serif font-bold text-base text-[#2C241E]">
                  Diário & Histórico de Aulas ({memberAttendanceHistory.length})
                </h4>
                <p className="text-xs text-[#7A6A5E]">
                  Filtre por classificação para auditar as 4 aulas mensais e reposições
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={classFilterMembro}
                  onChange={(e) => setClassFilterMembro(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold"
                >
                  <option value="todas">Todas as Classificações</option>
                  <option value="Mensalidade">Mensalidade</option>
                  <option value="Reposição">Reposição</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>
            </div>

            {memberAttendanceHistory.length === 0 ? (
              <p className="text-xs text-[#7A6A5E] py-6 text-center">
                Nenhum registro de aula para os filtros selecionados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Horário & Duração</th>
                      <th className="p-3">Classificação</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Reposição</th>
                      <th className="p-3">Observações / Motivo</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4DA]">
                    {memberAttendanceHistory.map((a) => {
                      const st = normalizeAttendanceStatus(a.status);
                      const cl = normalizeClassClassification(a);

                      return (
                        <tr key={a.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="p-3 text-[#2C241E] font-medium">
                            {new Date(a.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-3 text-[#5C4D41]">
                            <span className="block font-semibold">{a.horario}</span>
                            <span className="text-[10px] text-[#7A6A5E]">
                              {a.duracaoRealizadaMinutos !== undefined ? `${a.duracaoRealizadaMinutos} min` : '150 min'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              cl === 'Mensalidade' ? 'bg-blue-100 text-blue-900' : cl === 'Reposição' ? 'bg-purple-100 text-purple-900' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {cl}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              st === 'Realizada'
                                ? 'bg-emerald-100 text-emerald-900'
                                : st === 'Falta da Ollaria'
                                ? 'bg-purple-100 text-purple-900'
                                : st === 'Cancelada'
                                ? 'bg-stone-200 text-stone-800'
                                : 'bg-rose-100 text-rose-900'
                            }`}>
                              {st}
                            </span>
                          </td>
                          <td className="p-3 text-[#5C4D41]">
                            {a.decisaoReposicao || '-'}
                            {a.tempoAReporMinutos ? ` (${a.tempoAReporMinutos} min)` : ''}
                          </td>
                          <td className="p-3 text-[#5C4D41] max-w-xs truncate">
                            {a.motivoAusenciaAlteracao || a.observacao || '-'}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setRecordToEdit(a);
                                  setIsRecordModalOpen(true);
                                }}
                                className="p-1 rounded-lg text-[#D97736] hover:bg-orange-50"
                                title="Editar aula"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Deseja excluir este registro de aula?')) {
                                    deleteAttendance(a.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                                title="Excluir aula"
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
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VISÃO DE REPOSIÇÕES (PAINEL GERAL) (Seção 22) */}
      {/* ========================================================================= */}
      {activeView === 'reposicoes' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Top Cards de Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs">
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                Reposições Pendentes
              </span>
              <span className="font-serif font-black text-2xl text-purple-950 mt-1 block">
                {totalPendingReplacements}
              </span>
              <p className="text-[10px] text-purple-700 mt-0.5">Aguardando agendamento ou realização</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                Reposições Agendadas
              </span>
              <span className="font-serif font-black text-2xl text-blue-950 mt-1 block">
                {totalScheduledReplacements}
              </span>
              <p className="text-[10px] text-blue-700 mt-0.5">Marcadas para data futura (saldo não abatido)</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                Reposições Realizadas
              </span>
              <span className="font-serif font-black text-2xl text-emerald-950 mt-1 block">
                {totalCompletedReplacements}
              </span>
              <p className="text-[10px] text-emerald-700 mt-0.5">Crédito efetivamente cumprido</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Canceladas / Dispensadas
              </span>
              <span className="font-serif font-black text-2xl text-stone-900 mt-1 block">
                {totalDismissedOrCancelled}
              </span>
              <p className="text-[10px] text-stone-600 mt-0.5">Dispensadas pelo administrador</p>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6DFD5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={replacementStatusFilter}
                onChange={(e) => setReplacementStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E]"
              >
                <option value="todos">Todos os Status de Reposição</option>
                <option value="Pendente">Apenas Pendentes</option>
                <option value="Agendada">Apenas Agendadas</option>
                <option value="Realizada">Apenas Realizadas</option>
                <option value="Cancelada">Apenas Canceladas</option>
                <option value="Dispensada">Apenas Dispensadas</option>
              </select>

              <select
                value={replacementStudentFilter}
                onChange={(e) => setReplacementStudentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E]"
              >
                <option value="todos">Todos os Membr@s</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.nome}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A5E]" />
                <input
                  type="text"
                  value={replacementSearch}
                  onChange={(e) => setReplacementSearch(e.target.value)}
                  placeholder="Buscar motivo, data..."
                  className="pl-8 pr-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs text-[#2C241E] w-48"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setReplacementToEdit(null);
                setIsReplacementModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Conceder Reposição Avulsa
            </button>
          </div>

          {/* TABELA GERAL DE REPOSIÇÕES */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] p-6 shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-base text-[#2C241E]">
              Listagem Geral de Reposições ({filteredAllReplacements.length})
            </h4>

            {filteredAllReplacements.length === 0 ? (
              <p className="text-xs text-[#7A6A5E] py-8 text-center">
                Nenhuma reposição encontrada para os filtros selecionados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                    <tr>
                      <th className="p-3">Membr@</th>
                      <th className="p-3">Origem & Motivo</th>
                      <th className="p-3">Tipo & Saldo</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Agendamento</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4DA]">
                    {filteredAllReplacements.map((r) => {
                      const st = students.find((s) => s.id === r.studentId);
                      return (
                        <tr key={r.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="p-3 font-semibold text-[#2C241E]">
                            <span className="block">{st ? st.nome : 'Membr@'}</span>
                            <span className="text-[10px] text-[#7A6A5E]">{st?.accessCode} • {st?.turma}</span>
                          </td>

                          <td className="p-3 text-[#4A3E35]">
                            <strong className="block text-[#2C241E]">
                              {new Date(r.dataOrigem).toLocaleDateString('pt-BR')} — Resp: {r.responsabilidade || 'Ollaria'}
                            </strong>
                            <span className="text-[11px] text-[#7A6A5E]">{r.motivo}</span>
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-[#2C241E] block">
                              {r.tipo === 'tempo_minutos' ? `${r.minutosRestantes} min` : `1 Aula (${r.minutosRestantes} min)`}
                            </span>
                            {r.minutosRestantes < r.minutosOriginal && (
                              <span className="text-[10px] text-amber-800">
                                Uso parcial (de {r.minutosOriginal} min)
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              r.status === 'Pendente'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : r.status === 'Agendada'
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : r.status === 'Realizada'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : 'bg-stone-200 text-stone-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>

                          <td className="p-3 text-[#5C4D41]">
                            {r.status === 'Agendada' && r.dataAgendada ? (
                              <div>
                                <span className="font-bold text-blue-950 block">
                                  {new Date(r.dataAgendada).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-[10px] text-blue-800">
                                  {r.horarioAgendado} • {r.turmaAgendada}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#7A6A5E] italic">Sem agendamento</span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {r.status === 'Pendente' && (
                                <button
                                  onClick={() => {
                                    setReplacementToEdit(r);
                                    setIsReplacementModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px]"
                                >
                                  Agendar
                                </button>
                              )}

                              {r.status !== 'Realizada' && (
                                <button
                                  onClick={() => markReplacementCompleted(r.id)}
                                  className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px]"
                                >
                                  Realizada
                                </button>
                              )}

                              {r.status === 'Pendente' && (
                                <button
                                  onClick={() => {
                                    const mot = prompt('Motivo para dispensar a reposição:');
                                    if (mot) dismissClassReplacement(r.id, mot);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px]"
                                >
                                  Dispensar
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setReplacementToEdit(r);
                                  setIsReplacementModalOpen(true);
                                }}
                                className="p-1 rounded-lg text-[#D97736] hover:bg-orange-50"
                                title="Editar reposição"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm('Deseja excluir permanentemente este crédito?')) {
                                    deleteClassReplacement(r.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                                title="Excluir"
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
            )}
          </div>

        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE AULA */}
      <ClassRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setRecordToEdit(null);
        }}
        recordToEdit={recordToEdit}
        defaultDate={selectedDate}
        defaultStudentId={activeView === 'membro' ? selectedStudentId : undefined}
        defaultShift={selectedShiftFilter !== 'todos' ? (selectedShiftFilter as ClassShift) : undefined}
      />

      {/* MODAL DE CONCESSÃO / EDIÇÃO DE REPOSIÇÃO */}
      <ClassReplacementModal
        isOpen={isReplacementModalOpen}
        onClose={() => {
          setIsReplacementModalOpen(false);
          setReplacementToEdit(null);
        }}
        replacementToEdit={replacementToEdit}
        defaultStudentId={activeView === 'membro' ? selectedStudentId : undefined}
      />

    </div>
  );
};
