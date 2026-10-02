import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileText,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  AttendanceRecord,
  ClassAttendanceStatus,
  ClassClassification,
  ReplacementDecision,
  ClassReplacement,
  ClassShift,
  normalizeAttendanceStatus,
  normalizeClassClassification
} from '../../../types';
import { useStudio } from '../../../context/StudioContext';

interface ClassRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: AttendanceRecord | null;
  defaultDate?: string;
  defaultStudentId?: string;
  defaultShift?: ClassShift;
}

export const ClassRecordModal: React.FC<ClassRecordModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  defaultDate,
  defaultStudentId,
  defaultShift
}) => {
  const {
    students,
    classReplacements,
    saveClassAttendance
  } = useStudio();

  const isEditing = !!recordToEdit;

  const [studentId, setStudentId] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [turma, setTurma] = useState<string>('quarta-tarde');
  const [horarioPrevisto, setHorarioPrevisto] = useState<string>('15h20 - 17h50');
  const [horarioRealizado, setHorarioRealizado] = useState<string>('15h20 - 17h50');
  const [duracaoPrevistaMinutos, setDuracaoPrevistaMinutos] = useState<number>(150);
  const [duracaoRealizadaMinutos, setDuracaoRealizadaMinutos] = useState<number>(150);
  const [tempoAReporMinutos, setTempoAReporMinutos] = useState<number>(0);
  
  // Status oficial padronizado (4 status da seção 2)
  const [status, setStatus] = useState<ClassAttendanceStatus>('Realizada');
  // Classificação da aula (seção 3)
  const [classificacao, setClassificacao] = useState<ClassClassification>('Mensalidade');
  // Decisão sobre reposição (seção 4)
  const [decisaoReposicao, setDecisaoReposicao] = useState<ReplacementDecision>('Sem reposição');
  
  // Vínculo com reposição utilizada quando classificação = Reposição
  const [replacementIdToUse, setReplacementIdToUse] = useState<string>('');
  const [minutosAAbater, setMinutosAAbater] = useState<number>(150);

  // Motivo e responsabilidade
  const [motivoAusenciaAlteracao, setMotivoAusenciaAlteracao] = useState<string>('');
  const [responsabilidadeAusencia, setResponsabilidadeAusencia] = useState<string>('Membr@');
  const [observacao, setObservacao] = useState<string>('');
  const [naoContabilizarMensalidade, setNaoContabilizarMensalidade] = useState<boolean>(false);

  // Cobrança associada
  const [temCobranca, setTemCobranca] = useState<boolean>(false);
  const [valorCobranca, setValorCobranca] = useState<number>(120);
  const [descricaoCobranca, setDescricaoCobranca] = useState<string>('Aula Extra / Consumo');
  const [statusCobranca, setStatusCobranca] = useState<'pendente' | 'pago'>('pendente');
  const [lancarFinanceiro, setLancarFinanceiro] = useState<boolean>(true);

  // Preenchimento inicial ao abrir modal
  useEffect(() => {
    if (recordToEdit) {
      setStudentId(recordToEdit.studentId);
      setData(recordToEdit.data);
      setTurma(recordToEdit.turma || 'quarta-tarde');
      setHorarioPrevisto(recordToEdit.horarioPrevisto || recordToEdit.horario || '15h20 - 17h50');
      setHorarioRealizado(recordToEdit.horarioRealizado || recordToEdit.horario || '15h20 - 17h50');
      setDuracaoPrevistaMinutos(recordToEdit.duracaoPrevistaMinutos || 150);
      setDuracaoRealizadaMinutos(recordToEdit.duracaoRealizadaMinutos !== undefined ? recordToEdit.duracaoRealizadaMinutos : 150);
      setTempoAReporMinutos(recordToEdit.tempoAReporMinutos || 0);
      
      const st = normalizeAttendanceStatus(recordToEdit.status);
      setStatus(st);
      const cl = normalizeClassClassification(recordToEdit);
      setClassificacao(cl);
      
      setDecisaoReposicao(recordToEdit.decisaoReposicao || (st === 'Falta da Ollaria' ? 'Reposição concedida' : st === 'Realizada' ? 'Sem reposição' : 'Reposição pendente de decisão'));
      setReplacementIdToUse(recordToEdit.reposicaoUtilizadaId || '');
      setMotivoAusenciaAlteracao(recordToEdit.motivoAusenciaAlteracao || '');
      setResponsabilidadeAusencia(recordToEdit.responsabilidadeAusencia || 'Membr@');
      setObservacao(recordToEdit.observacao || '');
      setNaoContabilizarMensalidade(!!recordToEdit.naoContabilizarMensalidade);
      
      setTemCobranca(!!recordToEdit.temCobranca);
      setValorCobranca(recordToEdit.valorCobranca || 120);
      setDescricaoCobranca(recordToEdit.descricaoCobranca || 'Aula Extra / Consumo');
      setStatusCobranca(recordToEdit.statusCobranca || 'pendente');
      setLancarFinanceiro(false); // Já foi salvo antes
    } else {
      setStudentId(defaultStudentId || (students[0]?.id || ''));
      setData(defaultDate || new Date().toISOString().split('T')[0]);
      setTurma(defaultShift || 'quarta-tarde');
      setHorarioPrevisto(defaultShift === 'quarta-noite' ? '18h20 - 20h50' : defaultShift === 'sabado-manha' ? '09h30 - 12h00' : '15h20 - 17h50');
      setHorarioRealizado(defaultShift === 'quarta-noite' ? '18h20 - 20h50' : defaultShift === 'sabado-manha' ? '09h30 - 12h00' : '15h20 - 17h50');
      setDuracaoPrevistaMinutos(150);
      setDuracaoRealizadaMinutos(150);
      setTempoAReporMinutos(0);
      setStatus('Realizada');
      setClassificacao('Mensalidade');
      setDecisaoReposicao('Sem reposição');
      setReplacementIdToUse('');
      setMinutosAAbater(150);
      setMotivoAusenciaAlteracao('');
      setResponsabilidadeAusencia('Membr@');
      setObservacao('');
      setNaoContabilizarMensalidade(false);
      setTemCobranca(false);
      setValorCobranca(120);
      setDescricaoCobranca('Aula Extra Avulsa');
      setStatusCobranca('pendente');
      setLancarFinanceiro(true);
    }
  }, [recordToEdit, defaultDate, defaultStudentId, defaultShift, isOpen, students]);

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.id === studentId);
  const pendingReplacementsOfStudent = classReplacements.filter(
    (r) => r.studentId === studentId && (r.status === 'Pendente' || r.status === 'Agendada')
  );

  // Efeito ao trocar status: Falta da Ollaria gera reposição concedida automaticamente (Seção 6)
  const handleStatusChange = (newStatus: ClassAttendanceStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Falta da Ollaria') {
      setDecisaoReposicao('Reposição concedida');
      setResponsabilidadeAusencia('Ollaria');
      setDuracaoRealizadaMinutos(0);
      if (!motivoAusenciaAlteracao) {
        setMotivoAusenciaAlteracao('Aula não realizada por responsabilidade da Ollaria');
      }
    } else if (newStatus === 'Falta do membr@') {
      setResponsabilidadeAusencia('Membr@');
      setDuracaoRealizadaMinutos(0);
      if (decisaoReposicao === 'Reposição concedida' && !isEditing) {
        setDecisaoReposicao('Sem reposição');
      }
    } else if (newStatus === 'Cancelada') {
      setDuracaoRealizadaMinutos(0);
      if (decisaoReposicao === 'Reposição concedida' && !isEditing) {
        setDecisaoReposicao('Reposição pendente de decisão');
      }
    } else if (newStatus === 'Realizada') {
      setDecisaoReposicao('Sem reposição');
      if (duracaoRealizadaMinutos === 0) {
        setDuracaoRealizadaMinutos(duracaoPrevistaMinutos || 150);
      }
    }
  };

  // Cálculo de atraso ou início tardio (Seção 10)
  const handleCalculateDelay = () => {
    const diff = Math.max(0, duracaoPrevistaMinutos - duracaoRealizadaMinutos);
    setTempoAReporMinutos(diff);
    if (diff > 0) {
      setDecisaoReposicao('Reposição concedida');
      if (!motivoAusenciaAlteracao) {
        setMotivoAusenciaAlteracao(`Início tardio / atraso de ${diff} minutos`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    const payload: AttendanceRecord = {
      id: recordToEdit?.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      data,
      horario: horarioRealizado || horarioPrevisto,
      horarioPrevisto,
      horarioRealizado,
      duracaoPrevistaMinutos,
      duracaoRealizadaMinutos: status === 'Realizada' ? duracaoRealizadaMinutos : 0,
      tempoNaoRealizadoMinutos: Math.max(0, duracaoPrevistaMinutos - duracaoRealizadaMinutos),
      tempoAReporMinutos: decisaoReposicao === 'Reposição concedida' ? (tempoAReporMinutos || (status !== 'Realizada' ? duracaoPrevistaMinutos : 0)) : 0,
      turma,
      status,
      classificacao,
      decisaoReposicao,
      motivoAusenciaAlteracao,
      responsabilidadeAusencia,
      naoContabilizarMensalidade,
      temCobranca,
      valorCobranca: temCobranca ? valorCobranca : undefined,
      descricaoCobranca: temCobranca ? descricaoCobranca : undefined,
      statusCobranca: temCobranca ? statusCobranca : undefined,
      reposicaoUtilizadaId: classificacao === 'Reposição' ? replacementIdToUse : undefined,
      reposicaoId: recordToEdit?.reposicaoId,
      transacaoId: recordToEdit?.transacaoId,
      observacao,
      registradoPor: recordToEdit?.registradoPor || 'Samira Rebello (Ollaria)',
      createdAt: recordToEdit?.createdAt || new Date().toISOString()
    };

    saveClassAttendance(payload, {
      createTransaction: temCobranca && lancarFinanceiro,
      valorCobranca: temCobranca ? valorCobranca : undefined,
      descricaoCobranca: temCobranca ? descricaoCobranca : undefined,
      replacementIdToUse: classificacao === 'Reposição' ? replacementIdToUse : undefined,
      minutosUtilizados: classificacao === 'Reposição' ? minutosAAbater : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#D5CBC0] shadow-2xl max-w-2xl w-full overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D97736]/15 flex items-center justify-center text-[#D97736]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                {isEditing ? `Editar Registro de Aula` : 'Novo Registro de Aula'}
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                {isEditing
                  ? 'Atualiza a aula existente preservando todo o histórico (sem criar duplicatas)'
                  : 'Registre presença, falta, reposição e cobrança associada'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EBE4DA] text-[#7A6A5E] hover:text-[#2C241E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* 1. SELEÇÃO DO MEMBR@ */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2C241E] flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-[#D97736]" /> Membr@ Ollaria *
              </label>
              {selectedStudent && (
                <span className="text-[11px] font-semibold text-[#7A6A5E]">
                  Cód: {selectedStudent.accessCode} • Plano: {selectedStudent.modalidade}
                </span>
              )}
            </div>

            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-sm font-semibold text-[#2C241E] focus:outline-hidden focus:ring-2 focus:ring-[#D97736]"
            >
              <option value="">Selecione um membr@...</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.nome} ({st.accessCode}) — Turma: {st.turma}
                </option>
              ))}
            </select>
          </div>

          {/* 2. DATA, TURMA E HORÁRIOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C241E] mb-1.5">
                Data da Aula *
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C241E] mb-1.5">
                Turma / Turno
              </label>
              <select
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E]"
              >
                <option value="quarta-tarde">Quarta Tarde (15h20 às 17h50)</option>
                <option value="quarta-noite">Quarta Noite (18h20 às 20h50)</option>
                <option value="sabado-manha">Sábado Manhã (09h30 às 12h00)</option>
                <option value="terca-noite">Terça Noite (18h20 às 20h50)</option>
                <option value="avulso">Horário Personalizado / Avulso</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C241E] mb-1.5 flex items-center justify-between">
                <span>Horário Previsto</span>
                <span className="text-[10px] text-[#7A6A5E]">ex: 15h20 - 17h50</span>
              </label>
              <input
                type="text"
                value={horarioPrevisto}
                onChange={(e) => setHorarioPrevisto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs text-[#2C241E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C241E] mb-1.5 flex items-center justify-between">
                <span>Horário Efetivo Realizado</span>
                <span className="text-[10px] text-[#7A6A5E]">ex: 15h50 - 17h50</span>
              </label>
              <input
                type="text"
                value={horarioRealizado}
                onChange={(e) => setHorarioRealizado(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs text-[#2C241E]"
              />
            </div>
          </div>

          {/* DURAÇÃO & CÁLCULO DE ATRASO / INÍCIO TARDIO (Seções 9 e 10) */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E6DFD5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C241E] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D97736]" /> Duração Prevista vs Realizada (minutos)
              </span>
              <button
                type="button"
                onClick={handleCalculateDelay}
                className="text-[11px] font-bold text-[#D97736] hover:underline"
              >
                Calcular Tempo a Repor
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#7A6A5E] block">Prevista (min)</span>
                <input
                  type="number"
                  value={duracaoPrevistaMinutos}
                  onChange={(e) => setDuracaoPrevistaMinutos(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] bg-white font-semibold"
                />
              </div>

              <div>
                <span className="text-[10px] text-[#7A6A5E] block">Realizada (min)</span>
                <input
                  type="number"
                  value={duracaoRealizadaMinutos}
                  onChange={(e) => setDuracaoRealizadaMinutos(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] bg-white font-semibold"
                />
              </div>

              <div>
                <span className="text-[10px] text-[#7A6A5E] block">A Repor (min)</span>
                <input
                  type="number"
                  value={tempoAReporMinutos}
                  onChange={(e) => setTempoAReporMinutos(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] bg-white font-semibold text-[#D97736]"
                />
              </div>
            </div>

            {tempoAReporMinutos > 0 && (
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                Atraso ou tempo não realizado detectado: <strong>{tempoAReporMinutos} minutos</strong> a repor.
              </p>
            )}
          </div>

          {/* 3. STATUS DA AULA (SEÇÃO 2: 4 STATUS PADRONIZADOS) */}
          <div>
            <label className="block text-xs font-bold text-[#2C241E] mb-2 uppercase tracking-wider">
              Status da Aula (Nomenclatura Padronizada Ollaria) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Realizada', desc: 'Participou normalmente', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                { id: 'Falta do membr@', desc: 'Não compareceu', color: 'border-rose-400 bg-rose-50 text-rose-900' },
                { id: 'Falta da Ollaria', desc: 'Responsabilidade ateliê', color: 'border-purple-500 bg-purple-50 text-purple-900' },
                { id: 'Cancelada', desc: 'Aula desmarcada', color: 'border-stone-400 bg-stone-100 text-stone-800' }
              ].map((item) => {
                const isSelected = status === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleStatusChange(item.id as ClassAttendanceStatus)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? `${item.color} ring-2 ring-[#D97736] font-bold shadow-xs`
                        : 'border-[#E6DFD5] bg-white text-[#5C4D41] hover:border-[#D5CBC0]'
                    }`}
                  >
                    <span className="block text-xs font-bold">{item.id}</span>
                    <span className="text-[10px] text-[#7A6A5E] block mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. CLASSIFICAÇÃO DA AULA (SEÇÃO 3) */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5] space-y-2.5">
            <label className="block text-xs font-bold text-[#2C241E] uppercase tracking-wider">
              Classificação da Aula (Diferenciação Obrigatória) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Mensalidade', desc: '1 das 4 aulas mensais', badge: 'bg-blue-100 text-blue-900' },
                { id: 'Reposição', desc: 'Abate crédito anterior', badge: 'bg-purple-100 text-purple-900' },
                { id: 'Extra', desc: 'Aula avulsa além do plano', badge: 'bg-amber-100 text-amber-900' }
              ].map((item) => {
                const isSelected = classificacao === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setClassificacao(item.id as ClassClassification)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#D97736] bg-white ring-2 ring-[#D97736] font-bold shadow-xs'
                        : 'border-[#D5CBC0] bg-[#FAF8F5] text-[#5C4D41] hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.id}</span>
                    <span className="text-[10px] text-[#7A6A5E] block mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* SE CLASSIFICAÇÃO = REPOSIÇÃO: SELETOR DE REPOSIÇÃO PENDENTE (Seção 13 e 14) */}
            {classificacao === 'Reposição' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-purple-200 space-y-2">
                <span className="text-xs font-bold text-purple-900 block">
                  Vincular a qual reposição pendente do membr@?
                </span>
                {pendingReplacementsOfStudent.length === 0 ? (
                  <p className="text-xs text-[#7A6A5E]">
                    Este membr@ não possui reposições pendentes no momento.
                  </p>
                ) : (
                  <select
                    value={replacementIdToUse}
                    onChange={(e) => setReplacementIdToUse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 text-xs font-semibold text-[#2C241E]"
                  >
                    <option value="">Selecione a reposição a abater...</option>
                    {pendingReplacementsOfStudent.map((r) => (
                      <option key={r.id} value={r.id}>
                        {new Date(r.dataOrigem).toLocaleDateString('pt-BR')} — {r.motivo} (Saldo: {r.tipo === 'tempo_minutos' ? `${r.minutosRestantes} min` : `${r.minutosRestantes} min / 1 aula`})
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-[#7A6A5E]">Tempo a abater nesta aula:</span>
                  <input
                    type="number"
                    value={minutosAAbater}
                    onChange={(e) => setMinutosAAbater(Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded-lg border border-[#D5CBC0] text-center font-bold"
                  />
                  <span className="text-[#7A6A5E]">minutos (saldo restante será preservado)</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. DECISÃO SOBRE REPOSIÇÃO (SEÇÕES 4, 5, 6, 7) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2C241E] uppercase tracking-wider">
              Decisão sobre Reposição *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'Sem reposição', desc: 'Falta/cancelamento sem reposição' },
                { id: 'Reposição pendente de decisão', desc: 'Não cria crédito ainda; decide depois' },
                { id: 'Reposição concedida', desc: 'Gera 1 reposição pendente para o membr@' }
              ].map((item) => {
                const isSelected = decisaoReposicao === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={status === 'Falta da Ollaria' && item.id !== 'Reposição concedida'}
                    onClick={() => setDecisaoReposicao(item.id as ReplacementDecision)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#D97736] bg-[#FAF8F5] ring-2 ring-[#D97736] font-bold'
                        : 'border-[#E6DFD5] bg-white text-[#5C4D41] hover:border-[#D5CBC0]'
                    } ${status === 'Falta da Ollaria' && item.id !== 'Reposição concedida' ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-xs font-bold block">{item.id}</span>
                    <span className="text-[10px] text-[#7A6A5E] block mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>

            {status === 'Falta da Ollaria' && (
              <p className="text-[11px] text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-200 flex items-center gap-1.5 font-medium">
                <Info className="w-4 h-4 text-purple-700 shrink-0" />
                Regra Ollaria: Falta da Ollaria gera automaticamente 1 reposição concedida pendente vinculada à aula.
              </p>
            )}
          </div>

          {/* 6. MOTIVO DA AUSÊNCIA E RESPONSABILIDADE */}
          {(status !== 'Realizada' || tempoAReporMinutos > 0) && (
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5] space-y-3">
              <h4 className="font-bold text-xs text-[#2C241E] uppercase tracking-wider">
                Justificativa & Responsabilidade da Ausência / Alteração
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Responsabilidade
                  </label>
                  <select
                    value={responsabilidadeAusencia}
                    onChange={(e) => setResponsabilidadeAusencia(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs font-semibold"
                  >
                    <option value="Membr@">Membr@ (Aluna/o)</option>
                    <option value="Ollaria">Ollaria / Professora</option>
                    <option value="Ambos">Ambos</option>
                    <option value="Força Maior">Força Maior (Chuva forte, energia, etc.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C241E] mb-1">
                    Motivo Detalhado
                  </label>
                  <input
                    type="text"
                    value={motivoAusenciaAlteracao}
                    onChange={(e) => setMotivoAusenciaAlteracao(e.target.value)}
                    placeholder="Ex: Viagem avisada com 25 dias / Pane elétrica no estúdio"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. COBRANÇA ASSOCIADA À AULA (Seção 1 e 24) */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={temCobranca}
                  onChange={(e) => setTemCobranca(e.target.checked)}
                  className="rounded text-[#D97736] focus:ring-[#D97736] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#2C241E] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                  Cobrança Associada à Aula (Aula extra, argila extra, queima avulsa)
                </span>
              </label>
            </div>

            {temCobranca && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-[#7A6A5E] mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorCobranca}
                    onChange={(e) => setValorCobranca(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs font-bold text-emerald-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#7A6A5E] mb-1">Descrição da Cobrança</label>
                  <input
                    type="text"
                    value={descricaoCobranca}
                    onChange={(e) => setDescricaoCobranca(e.target.value)}
                    placeholder="Ex: Aula Extra - Quarta Tarde / Argila 10kg"
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="statusCobranca"
                      value="pendente"
                      checked={statusCobranca === 'pendente'}
                      onChange={() => setStatusCobranca('pendente')}
                      className="text-[#D97736]"
                    />
                    <span>Cobrança Pendente</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="statusCobranca"
                      value="pago"
                      checked={statusCobranca === 'pago'}
                      onChange={() => setStatusCobranca('pago')}
                      className="text-[#D97736]"
                    />
                    <span>Já Pago (PIX / Dinheiro)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 8. OBSERVAÇÕES E REGRA DE NÃO CONTABILIZAR NA MENSALIDADE */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#2C241E] mb-1">
                Observações Pedagógicas / Anotações Gerais
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                placeholder="Ex: Técnicas praticadas no torno, retoques de engobe, peças esmaltadas..."
                className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs text-[#2C241E]"
              />
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6DFD5]">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-[#5C4D41]">
                <input
                  type="checkbox"
                  checked={naoContabilizarMensalidade}
                  onChange={(e) => setNaoContabilizarMensalidade(e.target.checked)}
                  className="rounded text-[#D97736] focus:ring-[#D97736] w-4 h-4 mt-0.5"
                />
                <span>
                  <strong>Não contabilizar esta aula na cota mensal de 4 aulas</strong> (exceção deliberada do administrador).
                </span>
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-[#E6DFD5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D5CBC0] text-[#5C4D41] hover:bg-[#FAF8F5] text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#D97736] hover:bg-[#C26224] text-white text-xs font-bold transition-colors shadow-xs"
            >
              {isEditing ? 'Salvar Alterações na Aula' : 'Confirmar e Registrar Aula'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
