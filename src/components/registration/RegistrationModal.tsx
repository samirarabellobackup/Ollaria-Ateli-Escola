import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { RegistrationFormData, PlanType, ClassShift, ExperienceLevel, Student } from '../../types';
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (student: Student) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createStudentFromForm, setCurrentStudentById, setRole } = useStudio();
  const [step, setStep] = useState<number>(1);
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    nomeCompleto: '',
    nomePreferencia: '',
    dataNascimento: '',
    cpfOuPassaporte: '',
    profissao: '',
    telefoneWhatsapp: '',
    endereco: '',
    comoConheceu: 'Instagram',
    comoConheceuOutro: '',
    modalidade: 'trimestral',
    turmaDesejada: 'quarta-tarde',
    experiencia: 'iniciante',
    jaFezAulasOutroAtelie: 'Não',
    historicoOutroAtelie: '',
    menor18: 'Não',
    responsavelNome: '',
    responsavelCpf: '',
    responsavelWhatsapp: '',
    responsavelEmail: '',
    responsavelParentesco: '',
    contatoEmergenciaNome: '',
    contatoEmergenciaRelacao: '',
    informacoesSaudeAtendimento: 'Nenhuma observação',
    aceitouRegrasCondicoes: false,
    dataAceiteRegrasCondicoes: '',
    aceitouTermoRegulamento: false,
    dataAceiteTermoRegulamento: '',
    cienciaProcessoCeramico: false,
    cienciaMateriaisQueimas: false,
    veracidadeInformacoes: false,
    autorizacaoImagem: 'autorizo',
    formaPagamentoPretendida: 'pix'
  });

  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.email || !formData.nomeCompleto || !formData.dataNascimento || !formData.cpfOuPassaporte || !formData.telefoneWhatsapp || !formData.endereco) {
        setValidationError('Por favor, preencha todos os campos obrigatórios marcados com * da Seção 1.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.modalidade || !formData.turmaDesejada || !formData.experiencia) {
        setValidationError('Por favor, selecione modalidade, turma e sua experiência cerâmica.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.contatoEmergenciaNome || !formData.contatoEmergenciaRelacao) {
        setValidationError('Por favor, informe quem devemos contatar em caso de emergência e o grau de relação.');
        return false;
      }
      if (formData.menor18 === 'Sim' && (!formData.responsavelNome || !formData.responsavelCpf || !formData.responsavelWhatsapp)) {
        setValidationError('Para alunos menores de idade, os dados do responsável legal são obrigatórios.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.aceitouRegrasCondicoes || !formData.aceitouTermoRegulamento || !formData.cienciaProcessoCeramico || !formData.cienciaMateriaisQueimas || !formData.veracidadeInformacoes) {
        setValidationError('Você deve ler e marcar todos os termos e declarações de ciência obrigatórios para prosseguir.');
        return false;
      }
    }
    setValidationError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const prevStep = () => {
    setValidationError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const finalData: RegistrationFormData = {
      ...formData,
      dataAceiteRegrasCondicoes: new Date().toISOString(),
      dataAceiteTermoRegulamento: new Date().toISOString()
    };

    const newStudent = createStudentFromForm(finalData);
    setCreatedStudent(newStudent);
    if (onSuccess) {
      onSuccess(newStudent);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdStudent) return;
    const text = `*OLLARIA ATELIÊ - CREDENCIAIS DE ACESSO*\nOlá ${createdStudent.nome}!\nSua matrícula foi realizada com sucesso.\n\nCódigo de Acesso: ${createdStudent.accessCode}\nPIN: ${createdStudent.pin}\nTurma: ${createdStudent.turma}\n\nAcesse seu portal exclusivo para acompanhar suas peças, aulas e pagamentos!`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const enterAsCreatedStudent = () => {
    if (!createdStudent) return;
    setCurrentStudentById(createdStudent.id);
    setRole('student');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2C241E]/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#E6DFD5] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#F2ECE3] px-6 py-4 border-b border-[#E0D7CC] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9E4C1D] bg-[#EBE4DA] px-2 py-0.5 rounded-md">
                Ollaria Ateliê
              </span>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-[#2C241E]">
                Formulário de Matrícula – Aulas Regulares
              </h2>
            </div>
            <p className="text-xs text-[#6B5A4D] mt-0.5">
              Seja bem-vinda(o) à Ollaria Ateliê • Arte, Cerâmica e Pesquisa
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#7A6A5E] hover:text-[#2C241E] p-1.5 rounded-lg hover:bg-[#E6DFD5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen after submission */}
        {createdStudent ? (
          <div className="p-6 sm:p-8 text-center flex-1 overflow-y-auto">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#2C241E] mb-2">
              Matrícula Confirmada com Sucesso!
            </h3>
            <p className="text-sm text-[#6B5A4D] max-w-md mx-auto mb-6">
              As informações foram registradas no sistema da Ollaria Ateliê. O sistema gerou um código de acesso exclusivo e protegido para que apenas este aluno acesse sua própria página.
            </p>

            {/* Credential Card */}
            <div className="bg-white border-2 border-[#D97736]/30 p-6 rounded-2xl max-w-md mx-auto mb-6 text-left shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EBE4DA] pb-3 mb-4">
                <span className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wider">
                  Credenciais Geradas pelo Sistema
                </span>
                <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-[#7A6A5E] block">Aluno(a):</span>
                  <strong className="text-[#2C241E] text-base">{createdStudent.nome}</strong>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#E6DFD5]">
                  <div>
                    <span className="text-xs text-[#7A6A5E] block">Código de Acesso:</span>
                    <strong className="text-xl font-mono text-[#D97736] tracking-wider">{createdStudent.accessCode}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#7A6A5E] block">PIN de Segurança:</span>
                    <strong className="text-xl font-mono text-[#2C241E] tracking-wider">{createdStudent.pin}</strong>
                  </div>
                </div>

                <div className="text-xs text-[#6B5A4D] pt-2">
                  <p><strong>Plano:</strong> {createdStudent.modalidade.toUpperCase()} (Total: {createdStudent.aulasTotaisPlano} aulas contratadas)</p>
                  <p><strong>Forma de Pagamento:</strong> {createdStudent.registrationData.formaPagamentoPretendida.toUpperCase()} • Chave PIX Ateliê: <code className="font-bold text-[#9E4C1D]">61 996101254</code></p>
                </div>
              </div>

              <button
                onClick={handleCopyCredentials}
                className="mt-4 w-full py-2.5 rounded-xl border border-[#D97736] text-[#D97736] hover:bg-[#D97736]/10 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copiedKey ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copiedKey ? 'Copiado para a área de transferência!' : 'Copiar Credenciais para WhatsApp'}
              </button>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={enterAsCreatedStudent}
                className="px-6 py-2.5 bg-[#D97736] text-white font-semibold text-sm rounded-xl hover:bg-[#C26224] transition-colors shadow-xs"
              >
                Acessar Portal do Aluno Agora
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#EBE4DA] text-[#4A3E35] font-semibold text-sm rounded-xl hover:bg-[#DDD5C9] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Wizard indicator */}
            <div className="px-6 pt-4 pb-2 bg-[#FAF8F5] border-b border-[#E6DFD5] shrink-0">
              <div className="flex items-center justify-between text-xs font-semibold text-[#7A6A5E] mb-2">
                <span className={step === 1 ? 'text-[#D97736] font-bold' : ''}>1. Dados Pessoais</span>
                <span className={step === 2 ? 'text-[#D97736] font-bold' : ''}>2. Experiência & Turma</span>
                <span className={step === 3 ? 'text-[#D97736] font-bold' : ''}>3. Emergência & Apoio</span>
                <span className={step === 4 ? 'text-[#D97736] font-bold' : ''}>4. Termos & Regulamento</span>
              </div>
              <div className="w-full bg-[#EBE4DA] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D97736] h-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Error Message */}
            {validationError && (
              <div className="mx-6 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">

              {/* SECTION 1: Dados Pessoais */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-[#E6DFD5] pb-2">
                    <h3 className="font-serif font-bold text-base text-[#2C241E]">
                      Seção 1 de 4: Informações de Cadastro
                    </h3>
                    <p className="text-xs text-[#7A6A5E]">
                      Este formulário reúne as informações necessárias para sua matrícula nas aulas regulares de cerâmica da Ollaria Ateliê.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        placeholder="Nome completo do aluno"
                        value={formData.nomeCompleto}
                        onChange={(e) => handleChange('nomeCompleto', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Nome de preferência (como prefere ser chamada/o)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Bia, Mari, Edu..."
                        value={formData.nomePreferencia}
                        onChange={(e) => handleChange('nomePreferencia', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Data de nascimento *
                      </label>
                      <input
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) => handleChange('dataNascimento', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        CPF (ou Passaporte para estrangeiros) *
                      </label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={formData.cpfOuPassaporte}
                        onChange={(e) => handleChange('cpfOuPassaporte', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Profissão / Área de atuação *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Arquiteto, Designer, Servidor público..."
                        value={formData.profissao}
                        onChange={(e) => handleChange('profissao', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        placeholder="(61) 90000-0000"
                        value={formData.telefoneWhatsapp}
                        onChange={(e) => handleChange('telefoneWhatsapp', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Endereço completo para cadastro *
                      </label>
                      <input
                        type="text"
                        placeholder="Quadra, Bloco, Número, Bairro, Cidade - UF"
                        value={formData.endereco}
                        onChange={(e) => handleChange('endereco', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Como conheceu o Ollaria? *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {['Instagram', 'Indicação', 'CasaCor', 'Google', 'Outro'].map((item) => (
                          <label
                            key={item}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              formData.comoConheceu === item
                                ? 'border-[#D97736] bg-[#D97736]/10 text-[#2C241E] font-bold'
                                : 'border-[#D5CBC0] bg-white text-[#6B5A4D]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="comoConheceu"
                              value={item}
                              checked={formData.comoConheceu === item}
                              onChange={(e) => handleChange('comoConheceu', e.target.value)}
                              className="text-[#D97736] focus:ring-[#D97736]"
                            />
                            <span className="text-xs">{item}</span>
                          </label>
                        ))}
                      </div>
                      {formData.comoConheceu === 'Outro' && (
                        <input
                          type="text"
                          placeholder="Se marcou outro: Qual?"
                          value={formData.comoConheceuOutro || ''}
                          onChange={(e) => handleChange('comoConheceuOutro', e.target.value)}
                          className="mt-2 w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: Experiência e Matrícula */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-[#E6DFD5] pb-2">
                    <h3 className="font-serif font-bold text-base text-[#2C241E]">
                      Seção 2 de 4: Sobre Sua Experiência e Matrícula
                    </h3>
                    <p className="text-xs text-[#7A6A5E]">
                      Escolha a modalidade, turma e informe seu contato prévio com cerâmica.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3E35] mb-2">
                      Qual modalidade de matrícula você deseja realizar? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'mensal', label: 'Mensal', valorCartao: 'R$ 506', valorPix: 'Pix R$ 460', aulas: '4 aulas / mês' },
                        { id: 'bimestral', label: 'Bimestral', valorCartao: 'R$ 1.012', valorPix: 'Pix R$ 920', aulas: '8 aulas / 2 meses' },
                        { id: 'trimestral', label: 'Trimestral', valorCartao: 'R$ 1.472,45', valorPix: 'Pix R$ 1.338,60', aulas: '12 aulas (1 trancamento até 15 dias)' },
                        { id: 'semestral', label: 'Semestral', valorCartao: 'R$ 3.036', valorPix: 'Pix R$ 2.539,20', aulas: '24 aulas (1 trancamento até 30 dias)' }
                      ].map((mod) => (
                        <label
                          key={mod.id}
                          className={`p-3.5 rounded-xl border cursor-pointer block transition-all ${
                            formData.modalidade === mod.id
                              ? 'border-[#D97736] bg-[#D97736]/10 ring-1 ring-[#D97736]'
                              : 'border-[#D5CBC0] bg-white hover:border-[#B5A89B]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#2C241E]">{mod.label}</span>
                            <span className="text-xs font-bold text-[#D97736] bg-[#D97736]/15 px-2 py-0.5 rounded-md">
                              {mod.valorPix}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B5A4D] mt-1">{mod.valorCartao} no cartão</p>
                          <p className="text-[11px] text-[#7A6A5E] italic mt-0.5">{mod.aulas}</p>
                          <input
                            type="radio"
                            name="modalidade"
                            value={mod.id}
                            checked={formData.modalidade === mod.id}
                            onChange={(e) => handleChange('modalidade', e.target.value as PlanType)}
                            className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3E35] mb-2">
                      Qual turma você deseja frequentar? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'quarta-tarde', label: 'Quarta-feira (tarde)', horario: '15h20 às 17h50 (2h30)' },
                        { id: 'quarta-noite', label: 'Quarta-feira (noite)', horario: '18h20 às 20h50 (2h30)' },
                        { id: 'sabado-manha', label: 'Sábado (manhã)', horario: '09h30 às 12h00 (2h30)' },
                        { id: 'terca-noite', label: 'Terça-feira (noite)', horario: '18h20 às 20h50 (2h30)' }
                      ].map((turma) => (
                        <label
                          key={turma.id}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            formData.turmaDesejada === turma.id
                              ? 'border-[#D97736] bg-[#D97736]/10 text-[#2C241E] font-bold'
                              : 'border-[#D5CBC0] bg-white text-[#6B5A4D]'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-xs">{turma.label}</p>
                            <p className="text-[11px] text-[#7A6A5E]">{turma.horario}</p>
                          </div>
                          <input
                            type="radio"
                            name="turmaDesejada"
                            value={turma.id}
                            checked={formData.turmaDesejada === turma.id}
                            onChange={(e) => handleChange('turmaDesejada', e.target.value as ClassShift)}
                            className="text-[#D97736] focus:ring-[#D97736]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                      Você já possui experiência com cerâmica? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['nenhuma', 'iniciante', 'intermediário', 'avançado'].map((exp) => (
                        <label
                          key={exp}
                          className={`p-2.5 rounded-xl border text-center cursor-pointer capitalize text-xs ${
                            formData.experiencia === exp
                              ? 'border-[#D97736] bg-[#D97736]/10 text-[#2C241E] font-bold'
                              : 'border-[#D5CBC0] bg-white text-[#6B5A4D]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="experiencia"
                            value={exp}
                            checked={formData.experiencia === exp}
                            onChange={(e) => handleChange('experiencia', e.target.value as ExperienceLevel)}
                            className="hidden"
                          />
                          {exp}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                      Você já fez aulas de cerâmica em outro ateliê? *
                    </label>
                    <div className="flex gap-4 mb-2">
                      {['Sim', 'Não'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="jaFezAulas"
                            value={opt}
                            checked={formData.jaFezAulasOutroAtelie === opt}
                            onChange={(e) => handleChange('jaFezAulasOutroAtelie', e.target.value)}
                            className="text-[#D97736] focus:ring-[#D97736]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    {formData.jaFezAulasOutroAtelie === 'Sim' && (
                      <textarea
                        rows={2}
                        placeholder="Conte brevemente onde e por quanto tempo estudou cerâmica."
                        value={formData.historicoOutroAtelie || ''}
                        onChange={(e) => handleChange('historicoOutroAtelie', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 3: Informações Importantes & Emergência */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-[#E6DFD5] pb-2">
                    <h3 className="font-serif font-bold text-base text-[#2C241E]">
                      Seção 3 de 4: Informações Importantes & Contatos
                    </h3>
                    <p className="text-xs text-[#7A6A5E]">
                      Caso o aluno seja menor de idade ou tenha um responsável, e informações de emergência/saúde.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                      O(a) aluno(a) é menor de 18 anos? *
                    </label>
                    <div className="flex gap-4">
                      {['Não', 'Sim'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                          <input
                            type="radio"
                            name="menor18"
                            value={opt}
                            checked={formData.menor18 === opt}
                            onChange={(e) => handleChange('menor18', e.target.value)}
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
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-0.5">Nome completo do responsável *</label>
                          <input
                            type="text"
                            value={formData.responsavelNome || ''}
                            onChange={(e) => handleChange('responsavelNome', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-0.5">CPF do responsável *</label>
                          <input
                            type="text"
                            value={formData.responsavelCpf || ''}
                            onChange={(e) => handleChange('responsavelCpf', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-0.5">WhatsApp / telefone do responsável *</label>
                          <input
                            type="tel"
                            value={formData.responsavelWhatsapp || ''}
                            onChange={(e) => handleChange('responsavelWhatsapp', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-0.5">E-mail do Responsável</label>
                          <input
                            type="email"
                            value={formData.responsavelEmail || ''}
                            onChange={(e) => handleChange('responsavelEmail', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-[#4A3E35] mb-0.5">Grau de parentesco / relação com a/o aluna/o</label>
                          <input
                            type="text"
                            placeholder="Mãe, Pai, Tutor..."
                            value={formData.responsavelParentesco || ''}
                            onChange={(e) => handleChange('responsavelParentesco', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#D5CBC0] bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Em caso de emergência, quem devemos contatar? *
                      </label>
                      <input
                        type="text"
                        placeholder="Nome e telefone"
                        value={formData.contatoEmergenciaNome}
                        onChange={(e) => handleChange('contatoEmergenciaNome', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                        Qual a relação dessa pessoa com você? *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Cônjuge, Irmão, Amiga, Mãe..."
                        value={formData.contatoEmergenciaRelacao}
                        onChange={(e) => handleChange('contatoEmergenciaRelacao', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                      Existe alguma informação importante que você gostaria de nos comunicar para que possamos oferecer um atendimento adequado durante as atividades? *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: alergias, sensibilidade a poeira de argila, restrições motoras, etc."
                      value={formData.informacoesSaudeAtendimento}
                      onChange={(e) => handleChange('informacoesSaudeAtendimento', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 4: Regras, Condições, Termos e Regulamento */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-[#E6DFD5] pb-2">
                    <h3 className="font-serif font-bold text-base text-[#2C241E]">
                      Seção 4 de 4: Regras, Condições, Termos e Regulamento
                    </h3>
                    <p className="text-xs text-[#7A6A5E]">
                      Leia atentamente as condições e orientações a seguir. Ao matricular-se, o aluno firma seu acordo formal com o Ateliê Ollaria.
                    </p>
                  </div>

                  {/* Scrollable Terms Box */}
                  <div className="max-h-56 overflow-y-auto p-4 rounded-xl bg-white border border-[#D5CBC0] text-xs space-y-3 leading-relaxed text-[#4A3E35] shadow-inner">
                    <div className="text-center font-bold text-sm text-[#2C241E] border-b pb-2">
                      OLLARIA ATELIÊ • Arte • Cerâmica • Pesquisa • Brasília — DF
                    </div>

                    <h4 className="font-bold text-[#9E4C1D]">REGRAS E CONDIÇÕES DE MATRÍCULA</h4>
                    <p><strong>1. DA MATRÍCULA E DAS AULAS:</strong> Cada encontro tem duração de 2h30. A matrícula garante a reserva da vaga na turma escolhida durante o período contratado. As vagas são pessoais e intransferíveis. O valor do plano corresponde exclusivamente às aulas e à utilização do espaço e ferramentas. Argila, queimas e outros materiais específicos não estão incluídos no valor do plano.</p>
                    <p><strong>2. DA FREQUÊNCIA, FALTAS E REPOSIÇÕES:</strong> A ausência da/o aluna/o não gera desconto, crédito financeiro ou reposição automática. Nos planos trimestral e semestral, poderá ser autorizada uma reposição excepcional comunicada com antecedência mínima de 20 dias e previamente agendada.</p>
                    <p><strong>3. DO TRANCAMENTO:</strong> Plano mensal não permite trancamento. Plano trimestral permite 1 período de até 15 dias corridos (até 2 aulas). Plano semestral permite 1 período de até 30 dias corridos (até 4 aulas).</p>
                    <p><strong>4. DOS PAGAMENTOS:</strong> O atraso no pagamento poderá resultar na suspensão da participação nas aulas até a regularização.</p>
                    <p><strong>5. DO CANCELAMENTO:</strong> Em caso de cancelamento antecipado de planos trimestral/semestral, haverá recálculo com base no valor mensal sem desconto.</p>

                    <h4 className="font-bold text-[#9E4C1D] pt-2">TERMO DE MATRÍCULA E REGULAMENTO</h4>
                    <p><strong>3. DOS MATERIAIS, ENGOBES E QUEIMAS:</strong> A argila é adquirida e cobrada separadamente. As queimas de biscoito e esmalte também são cobradas separadamente. As peças somente serão encaminhadas para queima após confirmação do pagamento correspondente.</p>
                    <p><strong>4. DO PROCESSO CERÂMICO:</strong> A cerâmica é um processo artesanal sujeito a variáveis naturais e técnicas (trincas, deformações, quebras, alterações de cor). O resultado final não é garantido contra variáveis naturais.</p>
                    <p><strong>5. DA AVALIAÇÃO TÉCNICA:</strong> Peças que apresentem risco ao forno ou outras peças (umidade inadequada, espessura excessiva, ar ocluso) não serão queimadas.</p>
                    <p><strong>6. DA GUARDA E RETIRADA DAS PEÇAS (PRAZO DE 90 DIAS):</strong> Após a comunicação de que a peça está pronta para retirada, a/o aluna/o terá o prazo de 90 dias corridos para buscá-la. Peças não retiradas dentro desse período poderão ser recicladas ou descartadas por limitação de espaço.</p>
                  </div>

                  {/* Checkboxes of Consent */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#D5CBC0] bg-white cursor-pointer hover:bg-[#FAF8F5]">
                      <input
                        type="checkbox"
                        checked={formData.aceitouRegrasCondicoes}
                        onChange={(e) => handleChange('aceitouRegrasCondicoes', e.target.checked)}
                        className="mt-0.5 rounded text-[#D97736] focus:ring-[#D97736]"
                        required
                      />
                      <span className="text-xs text-[#2C241E] font-medium">
                        * Li e concordo com as <strong>Regras e Condições de Matrícula</strong> da Ollaria Ateliê.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#D5CBC0] bg-white cursor-pointer hover:bg-[#FAF8F5]">
                      <input
                        type="checkbox"
                        checked={formData.aceitouTermoRegulamento}
                        onChange={(e) => handleChange('aceitouTermoRegulamento', e.target.checked)}
                        className="mt-0.5 rounded text-[#D97736] focus:ring-[#D97736]"
                        required
                      />
                      <span className="text-xs text-[#2C241E] font-medium">
                        * Declaro que li, compreendi e concordo com o <strong>Termo de Matrícula e Regulamento</strong> da Ollaria Ateliê, ciente das orientações de segurança e do prazo de 90 dias para retirada das peças.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#D5CBC0] bg-white cursor-pointer hover:bg-[#FAF8F5]">
                      <input
                        type="checkbox"
                        checked={formData.cienciaProcessoCeramico}
                        onChange={(e) => handleChange('cienciaProcessoCeramico', e.target.checked)}
                        className="mt-0.5 rounded text-[#D97736] focus:ring-[#D97736]"
                        required
                      />
                      <span className="text-xs text-[#2C241E] font-medium">
                        * <strong>CIÊNCIA SOBRE O PROCESSO CERÂMICO:</strong> Declaro estar ciente de que a cerâmica é um processo artesanal sujeito a variações e que peças podem apresentar trincas, quebras ou alterações decorrentes da queima.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#D5CBC0] bg-white cursor-pointer hover:bg-[#FAF8F5]">
                      <input
                        type="checkbox"
                        checked={formData.cienciaMateriaisQueimas}
                        onChange={(e) => handleChange('cienciaMateriaisQueimas', e.target.checked)}
                        className="mt-0.5 rounded text-[#D97736] focus:ring-[#D97736]"
                        required
                      />
                      <span className="text-xs text-[#2C241E] font-medium">
                        * <strong>CIÊNCIA SOBRE MATERIAIS E QUEIMAS:</strong> Declaro estar ciente de que argila, queimas e materiais adicionais não estão incluídos no valor das aulas e serão cobrados separadamente conforme utilização.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#D5CBC0] bg-white cursor-pointer hover:bg-[#FAF8F5]">
                      <input
                        type="checkbox"
                        checked={formData.veracidadeInformacoes}
                        onChange={(e) => handleChange('veracidadeInformacoes', e.target.checked)}
                        className="mt-0.5 rounded text-[#D97736] focus:ring-[#D97736]"
                        required
                      />
                      <span className="text-xs text-[#2C241E] font-medium">
                        * <strong>VERACIDADE DAS INFORMAÇÕES:</strong> Declaro que todas as informações fornecidas são verdadeiras e estou ciente de que a matrícula será confirmada após pagamento.
                      </span>
                    </label>

                    {/* Image rights */}
                    <div className="p-3 rounded-xl border border-[#D5CBC0] bg-white">
                      <p className="text-xs font-bold text-[#4A3E35] mb-1">
                        * AUTORIZAÇÃO DE USO DE IMAGEM:
                      </p>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="autorizacaoImagem"
                            value="autorizo"
                            checked={formData.autorizacaoImagem === 'autorizo'}
                            onChange={() => handleChange('autorizacaoImagem', 'autorizo')}
                            className="text-[#D97736] focus:ring-[#D97736]"
                          />
                          <span>Autorizo o uso de fotografias e vídeos realizados durante a atividade para divulgação do Ateliê Sah Pereira | Ollaria Cerâmica.</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="autorizacaoImagem"
                            value="nao_autorizo"
                            checked={formData.autorizacaoImagem === 'nao_autorizo'}
                            onChange={() => handleChange('autorizacaoImagem', 'nao_autorizo')}
                            className="text-[#D97736] focus:ring-[#D97736]"
                          />
                          <span>Não autorizo.</span>
                        </label>
                      </div>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="p-3 rounded-xl bg-[#F2ECE3] border border-[#E0D7CC]">
                      <p className="text-xs font-bold text-[#2C241E] mb-1">
                        * Forma de Pagamento da Matrícula:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="radio"
                            name="formaPagamento"
                            value="pix"
                            checked={formData.formaPagamentoPretendida === 'pix'}
                            onChange={() => handleChange('formaPagamentoPretendida', 'pix')}
                            className="text-[#D97736] focus:ring-[#D97736]"
                          />
                          <span><strong>PIX com Desconto</strong> (Chave: 61 996101254)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="radio"
                            name="formaPagamento"
                            value="cartao"
                            checked={formData.formaPagamentoPretendida === 'cartao'}
                            onChange={() => handleChange('formaPagamentoPretendida', 'cartao')}
                            className="text-[#D97736] focus:ring-[#D97736]"
                          />
                          <span>Cartão de Crédito (Máquina no Ateliê)</span>
                        </label>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="pt-4 border-t border-[#E6DFD5] flex items-center justify-between shrink-0">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-[#4A3E35] font-semibold text-xs hover:bg-[#F2ECE3] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D97736] text-white font-semibold text-xs hover:bg-[#C26224] transition-colors shadow-xs"
                  >
                    Avançar para Seção {step + 1} <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2C241E] text-white font-bold text-xs hover:bg-[#43372E] transition-colors shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#E6A15C]" />
                    Concluir e Assinar Matrícula
                  </button>
                )}
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
};
