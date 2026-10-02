import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  ClassReplacement,
  ReplacementStatus
} from '../../../types';
import { useStudio } from '../../../context/StudioContext';

interface ClassReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  replacementToEdit?: ClassReplacement | null;
  defaultStudentId?: string;
}

export const ClassReplacementModal: React.FC<ClassReplacementModalProps> = ({
  isOpen,
  onClose,
  replacementToEdit,
  defaultStudentId
}) => {
  const {
    students,
    addClassReplacement,
    updateClassReplacement
  } = useStudio();

  const isEditing = !!replacementToEdit;

  const [studentId, setStudentId] = useState<string>('');
  const [dataOrigem, setDataOrigem] = useState<string>(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState<string>('Reposição concedida pela coordenação');
  const [responsabilidade, setResponsabilidade] = useState<string>('Ollaria');
  const [tipo, setTipo] = useState<'aula_inteira' | 'tempo_minutos'>('aula_inteira');
  const [minutosOriginal, setMinutosOriginal] = useState<number>(150);
  const [minutosRestantes, setMinutosRestantes] = useState<number>(150);
  const [status, setStatus] = useState<ReplacementStatus>('Pendente');
  const [dataAgendada, setDataAgendada] = useState<string>('');
  const [horarioAgendado, setHorarioAgendado] = useState<string>('15h20 - 17h50');
  const [turmaAgendada, setTurmaAgendada] = useState<string>('quarta-tarde');
  const [observacoes, setObservacoes] = useState<string>('');

  useEffect(() => {
    if (replacementToEdit) {
      setStudentId(replacementToEdit.studentId);
      setDataOrigem(replacementToEdit.dataOrigem);
      setMotivo(replacementToEdit.motivo);
      setResponsabilidade(replacementToEdit.responsabilidade || 'Ollaria');
      setTipo(replacementToEdit.tipo);
      setMinutosOriginal(replacementToEdit.minutosOriginal);
      setMinutosRestantes(replacementToEdit.minutosRestantes);
      setStatus(replacementToEdit.status);
      setDataAgendada(replacementToEdit.dataAgendada || '');
      setHorarioAgendado(replacementToEdit.horarioAgendado || '15h20 - 17h50');
      setTurmaAgendada(replacementToEdit.turmaAgendada || 'quarta-tarde');
      setObservacoes(replacementToEdit.observacoes || '');
    } else {
      setStudentId(defaultStudentId || (students[0]?.id || ''));
      setDataOrigem(new Date().toISOString().split('T')[0]);
      setMotivo('Reposição concedida administrativamente');
      setResponsabilidade('Ollaria');
      setTipo('aula_inteira');
      setMinutosOriginal(150);
      setMinutosRestantes(150);
      setStatus('Pendente');
      setDataAgendada('');
      setHorarioAgendado('15h20 - 17h50');
      setTurmaAgendada('quarta-tarde');
      setObservacoes('');
    }
  }, [replacementToEdit, defaultStudentId, isOpen, students]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    if (isEditing && replacementToEdit) {
      updateClassReplacement(replacementToEdit.id, {
        studentId,
        dataOrigem,
        motivo,
        responsabilidade,
        tipo,
        quantidadeAulas: tipo === 'aula_inteira' ? 1 : 0,
        minutosOriginal,
        minutosRestantes,
        status,
        dataAgendada: status === 'Agendada' ? dataAgendada : undefined,
        horarioAgendado: status === 'Agendada' ? horarioAgendado : undefined,
        turmaAgendada: status === 'Agendada' ? turmaAgendada : undefined,
        observacoes
      });
    } else {
      addClassReplacement({
        studentId,
        dataOrigem,
        motivo,
        responsabilidade,
        tipo,
        quantidadeAulas: tipo === 'aula_inteira' ? 1 : 0,
        minutosOriginal,
        minutosRestantes,
        status,
        dataAgendada: status === 'Agendada' ? dataAgendada : undefined,
        horarioAgendado: status === 'Agendada' ? horarioAgendado : undefined,
        turmaAgendada: status === 'Agendada' ? turmaAgendada : undefined,
        observacoes
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#D5CBC0] shadow-2xl max-w-lg w-full overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                {isEditing ? 'Editar Reposição' : 'Conceder Reposição Avulsa'}
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                Crédito de reposição por aula inteira ou tempo parcial
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Membro */}
          <div>
            <label className="block text-xs font-bold text-[#2C241E] mb-1.5 uppercase">
              Membr@ Ollaria *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-sm font-semibold text-[#2C241E]"
            >
              <option value="">Selecione um membr@...</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.nome} ({st.accessCode})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Reposição (Aula inteira vs Tempo) */}
          <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5] space-y-2">
            <label className="block text-xs font-bold text-[#2C241E]">
              Formato da Reposição *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTipo('aula_inteira');
                  setMinutosOriginal(150);
                  setMinutosRestantes(150);
                }}
                className={`p-2.5 rounded-xl border text-left text-xs ${
                  tipo === 'aula_inteira'
                    ? 'border-[#D97736] bg-white ring-2 ring-[#D97736] font-bold'
                    : 'border-[#D5CBC0] bg-white/50 text-[#7A6A5E]'
                }`}
              >
                <strong className="block text-[#2C241E]">1 Aula Inteira</strong>
                <span className="text-[10px] text-[#7A6A5E]">Padrão 2h30 (150 min)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipo('tempo_minutos');
                  setMinutosOriginal(30);
                  setMinutosRestantes(30);
                }}
                className={`p-2.5 rounded-xl border text-left text-xs ${
                  tipo === 'tempo_minutos'
                    ? 'border-[#D97736] bg-white ring-2 ring-[#D97736] font-bold'
                    : 'border-[#D5CBC0] bg-white/50 text-[#7A6A5E]'
                }`}
              >
                <strong className="block text-[#2C241E]">Tempo Parcial</strong>
                <span className="text-[10px] text-[#7A6A5E]">Minutos (ex: 30, 45, 60 min)</span>
              </button>
            </div>

            {tipo === 'tempo_minutos' && (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#7A6A5E] block">Minutos Concedidos</span>
                  <input
                    type="number"
                    value={minutosOriginal}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMinutosOriginal(v);
                      setMinutosRestantes(v);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#D5CBC0] text-xs font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#7A6A5E] block">Saldo Restante</span>
                  <input
                    type="number"
                    value={minutosRestantes}
                    onChange={(e) => setMinutosRestantes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#D5CBC0] text-xs font-bold text-[#D97736]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status da Reposição (Seção 11) */}
          <div>
            <label className="block text-xs font-bold text-[#2C241E] mb-1.5 uppercase">
              Status da Reposição *
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(['Pendente', 'Agendada', 'Realizada', 'Cancelada', 'Dispensada'] as ReplacementStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-2.5 rounded-xl border font-bold text-center transition-all ${
                    status === st
                      ? 'border-[#D97736] bg-[#FAF8F5] ring-2 ring-[#D97736] text-[#2C241E]'
                      : 'border-[#E6DFD5] bg-white text-[#7A6A5E] hover:border-[#D5CBC0]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Campos de Agendamento quando status === Agendada */}
          {status === 'Agendada' && (
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
              <span className="text-xs font-bold text-purple-900 block">
                Dados do Agendamento Futuro
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-purple-700 block">Data Agendada</span>
                  <input
                    type="date"
                    value={dataAgendada}
                    onChange={(e) => setDataAgendada(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-purple-700 block">Horário</span>
                  <input
                    type="text"
                    value={horarioAgendado}
                    onChange={(e) => setHorarioAgendado(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 bg-white"
                  />
                </div>
              </div>
              <p className="text-[11px] text-purple-800">
                Lembrete: Reposição agendada não debita o saldo até a aula ser realizada.
              </p>
            </div>
          )}

          {/* Data Origem e Responsabilidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C241E] mb-1">
                Data de Origem
              </label>
              <input
                type="date"
                value={dataOrigem}
                onChange={(e) => setDataOrigem(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C241E] mb-1">
                Responsabilidade
              </label>
              <select
                value={responsabilidade}
                onChange={(e) => setResponsabilidade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold"
              >
                <option value="Ollaria">Ollaria (Ateliê)</option>
                <option value="Membr@">Membr@ (Aluna/o)</option>
                <option value="Ambos">Ambos</option>
                <option value="Força Maior">Força Maior</option>
              </select>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-bold text-[#2C241E] mb-1">
              Motivo / Justificativa *
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              placeholder="Ex: Falta da Ollaria por manutenção / Viagem avisada com 25 dias"
              className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs text-[#2C241E]"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-[#2C241E] mb-1">
              Observações Adicionais
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs text-[#2C241E]"
            />
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
              {isEditing ? 'Salvar Reposição' : 'Conceder Reposição'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
