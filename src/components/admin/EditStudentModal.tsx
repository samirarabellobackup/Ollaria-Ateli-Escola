import React, { useState, useEffect } from 'react';
import { Student, ClassShift, PlanType } from '../../types';
import { useStudio } from '../../context/StudioContext';
import {
  X,
  Save,
  User,
  Calendar,
  KeyRound,
  Shield,
  HeartPulse,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface EditStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  onClose
}) => {
  const { updateStudent } = useStudio();

  const [activeTab, setActiveTab] = useState<'dados' | 'plano' | 'acesso' | 'emergencia'>('dados');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    nomePreferencia: '',
    email: '',
    whatsapp: '',
    cpfOuPassaporte: '',
    dataNascimento: '',
    profissao: '',
    endereco: '',
    turma: 'quarta-tarde' as ClassShift,
    modalidade: 'trimestral' as PlanType,
    status: 'ativo' as 'ativo' | 'trancado' | 'inadimplente' | 'finalizado',
    valorPlano: 460,
    aulasTotaisPlano: 12,
    aulasFeitas: 0,
    aulasRestantes: 12,
    dataInicioPlano: '',
    dataFimPlano: '',
    trancamentosUtilizadosDias: 0,
    accessCode: '',
    pin: '',
    menor18: 'Não' as 'Sim' | 'Não',
    responsavelNome: '',
    responsavelCpf: '',
    responsavelWhatsapp: '',
    responsavelEmail: '',
    responsavelParentesco: '',
    contatoEmergenciaNome: '',
    contatoEmergenciaRelacao: '',
    informacoesSaudeAtendimento: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        nome: student.nome || '',
        nomePreferencia: student.registrationData?.nomePreferencia || '',
        email: student.email || '',
        whatsapp: student.whatsapp || '',
        cpfOuPassaporte: student.registrationData?.cpfOuPassaporte || '',
        dataNascimento: student.registrationData?.dataNascimento || '',
        profissao: student.registrationData?.profissao || '',
        endereco: student.registrationData?.endereco || '',
        turma: student.turma || 'quarta-tarde',
        modalidade: student.modalidade || 'trimestral',
        status: student.status || 'ativo',
        valorPlano: student.valorPlano || 0,
        aulasTotaisPlano: student.aulasTotaisPlano || 0,
        aulasFeitas: student.aulasFeitas || 0,
        aulasRestantes: student.aulasRestantes || 0,
        dataInicioPlano: student.dataInicioPlano || '',
        dataFimPlano: student.dataFimPlano || '',
        trancamentosUtilizadosDias: student.trancamentosUtilizadosDias || 0,
        accessCode: student.accessCode || '',
        pin: student.pin || '',
        menor18: student.registrationData?.menor18 || 'Não',
        responsavelNome: student.registrationData?.responsavelNome || '',
        responsavelCpf: student.registrationData?.responsavelCpf || '',
        responsavelWhatsapp: student.registrationData?.responsavelWhatsapp || '',
        responsavelEmail: student.registrationData?.responsavelEmail || '',
        responsavelParentesco: student.registrationData?.responsavelParentesco || '',
        contatoEmergenciaNome: student.registrationData?.contatoEmergenciaNome || '',
        contatoEmergenciaRelacao: student.registrationData?.contatoEmergenciaRelacao || '',
        informacoesSaudeAtendimento: student.registrationData?.informacoesSaudeAtendimento || ''
      });
      setSuccessMsg('');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleGeneratePin = () => {
    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    setFormData((prev) => ({ ...prev, pin: newPin }));
  };

  const handleGenerateCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, accessCode: `OL-${randomDigits}` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedRegistrationData = {
      ...student.registrationData,
      nomeCompleto: formData.nome,
      nomePreferencia: formData.nomePreferencia,
      email: formData.email,
      telefoneWhatsapp: formData.whatsapp,
      cpfOuPassaporte: formData.cpfOuPassaporte,
      dataNascimento: formData.dataNascimento,
      profissao: formData.profissao,
      endereco: formData.endereco,
      modalidade: formData.modalidade,
      turmaDesejada: formData.turma,
      menor18: formData.menor18,
      responsavelNome: formData.responsavelNome,
      responsavelCpf: formData.responsavelCpf,
      responsavelWhatsapp: formData.responsavelWhatsapp,
      responsavelEmail: formData.responsavelEmail,
      responsavelParentesco: formData.responsavelParentesco,
      contatoEmergenciaNome: formData.contatoEmergenciaNome,
      contatoEmergenciaRelacao: formData.contatoEmergenciaRelacao,
      informacoesSaudeAtendimento: formData.informacoesSaudeAtendimento
    };

    const updatedStudent: Student = {
      ...student,
      nome: formData.nome,
      email: formData.email,
      whatsapp: formData.whatsapp,
      turma: formData.turma,
      modalidade: formData.modalidade,
      status: formData.status,
      valorPlano: Number(formData.valorPlano),
      aulasTotaisPlano: Number(formData.aulasTotaisPlano),
      aulasFeitas: Number(formData.aulasFeitas),
      aulasRestantes: Number(formData.aulasRestantes),
      dataInicioPlano: formData.dataInicioPlano,
      dataFimPlano: formData.dataFimPlano,
      trancamentosUtilizadosDias: Number(formData.trancamentosUtilizadosDias),
      accessCode: formData.accessCode.trim().toUpperCase(),
      pin: formData.pin.trim(),
      registrationData: updatedRegistrationData
    };

    updateStudent(updatedStudent);
    setSuccessMsg('Perfil do aluno atualizado com sucesso!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl border border-[#E6DFD5] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] border border-[#F0D5C3] flex items-center justify-center text-[#D97736]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#2C241E]">
                Editar Perfil do Aluno
              </h2>
              <p className="text-xs text-[#7A6A5E]">
                {student.nome} • Código: <span className="font-mono font-bold text-[#D97736]">{student.accessCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A6A5E] hover:text-[#2C241E] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E6DFD5] bg-[#F4EFEA] px-4 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'dados'
                ? 'border-[#D97736] text-[#2C241E] font-bold bg-[#FAF8F5]'
                : 'border-transparent text-[#7A6A5E] hover:text-[#2C241E]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Dados & Contato</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plano')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'plano'
                ? 'border-[#D97736] text-[#2C241E] font-bold bg-[#FAF8F5]'
                : 'border-transparent text-[#7A6A5E] hover:text-[#2C241E]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Turma & Plano</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acesso')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'acesso'
                ? 'border-[#D97736] text-[#2C241E] font-bold bg-[#FAF8F5]'
                : 'border-transparent text-[#7A6A5E] hover:text-[#2C241E]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Acesso & Senha</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergencia')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'emergencia'
                ? 'border-[#D97736] text-[#2C241E] font-bold bg-[#FAF8F5]'
                : 'border-transparent text-[#7A6A5E] hover:text-[#2C241E]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Emergência & Saúde</span>
          </button>
        </div>

        {/* Success message banner */}
        {successMsg && (
          <div className="m-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            
            {/* TAB 1: DADOS & CONTATO */}
            {activeTab === 'dados' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs font-medium text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Nome de Preferência (como gosta de ser chamada/o)
                    </label>
                    <input
                      type="text"
                      value={formData.nomePreferencia}
                      onChange={(e) => setFormData({ ...formData, nomePreferencia: e.target.value })}
                      placeholder="Ex: Bia, Lucas..."
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      CPF ou Passaporte
                    </label>
                    <input
                      type="text"
                      value={formData.cpfOuPassaporte}
                      onChange={(e) => setFormData({ ...formData, cpfOuPassaporte: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.profissao}
                      onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: TURMA & PLANO */}
            {activeTab === 'plano' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Turma
                    </label>
                    <select
                      value={formData.turma}
                      onChange={(e) => setFormData({ ...formData, turma: e.target.value as ClassShift })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs font-medium text-[#2C241E]"
                    >
                      <option value="quarta-tarde">Quarta Tarde (15h20 às 17h50)</option>
                      <option value="quarta-noite">Quarta Noite (18h20 às 20h50)</option>
                      <option value="sabado-manha">Sábado Manhã (09h30 às 12h00)</option>
                      <option value="terca-noite">Terça Noite (18h20 às 20h50)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Modalidade do Plano
                    </label>
                    <select
                      value={formData.modalidade}
                      onChange={(e) => setFormData({ ...formData, modalidade: e.target.value as PlanType })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs font-medium text-[#2C241E]"
                    >
                      <option value="mensal">Mensal (4 aulas)</option>
                      <option value="bimestral">Bimestral (8 aulas)</option>
                      <option value="trimestral">Trimestral (12 aulas)</option>
                      <option value="semestral">Semestral (24 aulas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Status da Matrícula
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs font-bold text-[#2C241E]"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="trancado">Trancado</option>
                      <option value="inadimplente">Inadimplente</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-[#E6DFD5]">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A6A5E] mb-1">
                      Valor do Plano (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valorPlano}
                      onChange={(e) => setFormData({ ...formData, valorPlano: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] text-xs font-bold text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A6A5E] mb-1">
                      Total de Aulas
                    </label>
                    <input
                      type="number"
                      value={formData.aulasTotaisPlano}
                      onChange={(e) => {
                        const total = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          aulasTotaisPlano: total,
                          aulasRestantes: Math.max(0, total - formData.aulasFeitas)
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] text-xs font-bold text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A6A5E] mb-1">
                      Aulas Concluídas
                    </label>
                    <input
                      type="number"
                      value={formData.aulasFeitas}
                      onChange={(e) => {
                        const feitas = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          aulasFeitas: feitas,
                          aulasRestantes: Math.max(0, formData.aulasTotaisPlano - feitas)
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] text-xs font-bold text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#7A6A5E] mb-1">
                      Aulas Restantes
                    </label>
                    <input
                      type="number"
                      value={formData.aulasRestantes}
                      onChange={(e) => setFormData({ ...formData, aulasRestantes: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] text-xs font-bold text-[#D97736]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Início do Plano
                    </label>
                    <input
                      type="date"
                      value={formData.dataInicioPlano}
                      onChange={(e) => setFormData({ ...formData, dataInicioPlano: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Fim do Plano (Validade)
                    </label>
                    <input
                      type="date"
                      value={formData.dataFimPlano}
                      onChange={(e) => setFormData({ ...formData, dataFimPlano: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Dias Trancados Utilizados
                    </label>
                    <input
                      type="number"
                      value={formData.trancamentosUtilizadosDias}
                      onChange={(e) => setFormData({ ...formData, trancamentosUtilizadosDias: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACESSO & SENHA */}
            {activeTab === 'acesso' && (
              <div className="space-y-4">
                <div className="bg-[#FAF0E6] p-4 rounded-xl border border-[#F0D5C3] text-xs text-[#6B5A4D] space-y-1">
                  <strong className="text-[#2C241E] block">Credenciais Individuais do Aluno</strong>
                  <p>
                    O aluno utiliza este código e PIN numérico para acessar suas peças, presenças e financeiro na página de entrada. Você pode editar diretamente ou regerar se o aluno solicitar.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[#E6DFD5] space-y-2">
                    <label className="block text-xs font-bold text-[#4A3E35]">
                      Código de Acesso
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.accessCode}
                        onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                        className="flex-1 px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-sm font-mono font-bold text-[#D97736]"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGenerateCode}
                        className="px-3 py-2 rounded-xl border border-[#D5CBC0] text-xs font-semibold text-[#4A3E35] hover:bg-[#FAF8F5] flex items-center gap-1"
                        title="Gerar novo código aleatório"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[#7A6A5E] block">Padrão Ollaria: OL-XXXX</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#E6DFD5] space-y-2">
                    <label className="block text-xs font-bold text-[#4A3E35]">
                      PIN Numérico (Senha)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.pin}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-sm font-mono font-bold text-[#2C241E]"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGeneratePin}
                        className="px-3 py-2 rounded-xl border border-[#D5CBC0] text-xs font-semibold text-[#4A3E35] hover:bg-[#FAF8F5] flex items-center gap-1"
                        title="Gerar novo PIN de 4 dígitos"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[#7A6A5E] block">Senha numérica de 4 a 6 dígitos</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: EMERGÊNCIA & SAÚDE */}
            {activeTab === 'emergencia' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                    O(a) aluno(a) é menor de 18 anos? *
                  </label>
                  <div className="flex gap-4">
                    {(['Não', 'Sim'] as const).map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                        <input
                          type="radio"
                          name="edit-menor18"
                          value={opt}
                          checked={formData.menor18 === opt}
                          onChange={(e) => setFormData({ ...formData, menor18: e.target.value as any })}
                          className="text-[#D97736] focus:ring-[#D97736]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.menor18 === 'Sim' && (
                  <div className="p-4 rounded-xl bg-[#F2ECE3] border border-[#E0D7CC] space-y-3">
                    <p className="text-xs font-bold text-[#9E4C1D]">Dados do Responsável Legal:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A3E35] mb-0.5">Nome do responsável</label>
                        <input
                          type="text"
                          value={formData.responsavelNome}
                          onChange={(e) => setFormData({ ...formData, responsavelNome: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A3E35] mb-0.5">CPF do responsável</label>
                        <input
                          type="text"
                          value={formData.responsavelCpf}
                          onChange={(e) => setFormData({ ...formData, responsavelCpf: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A3E35] mb-0.5">WhatsApp / telefone</label>
                        <input
                          type="tel"
                          value={formData.responsavelWhatsapp}
                          onChange={(e) => setFormData({ ...formData, responsavelWhatsapp: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4A3E35] mb-0.5">Grau de parentesco</label>
                        <input
                          type="text"
                          value={formData.responsavelParentesco}
                          onChange={(e) => setFormData({ ...formData, responsavelParentesco: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Contato de Emergência (Nome e Telefone)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Maria (irmã) - 61 98888-7777"
                      value={formData.contatoEmergenciaNome}
                      onChange={(e) => setFormData({ ...formData, contatoEmergenciaNome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                      Relação com o Contato
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Cônjuge, Mãe, Irmão..."
                      value={formData.contatoEmergenciaRelacao}
                      onChange={(e) => setFormData({ ...formData, contatoEmergenciaRelacao: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                    Informações de Saúde / Observações para Atendimento
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: restrições de coluna, sensibilidade a poeiras, etc."
                    value={formData.informacoesSaudeAtendimento}
                    onChange={(e) => setFormData({ ...formData, informacoesSaudeAtendimento: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 bg-white border-t border-[#E6DFD5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#D5CBC0] text-xs font-semibold text-[#4A3E35] hover:bg-[#FAF8F5] transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-save-student-profile"
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Save className="w-4 h-4 text-[#E6A15C]" />
              Salvar Alterações
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
