import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ClassShift, PlanType, RegistrationFormData, Student } from '../../types';
import {
  X,
  UserPlus,
  Copy,
  Check,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullWizard: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onOpenFullWizard
}) => {
  const { createStudentFromForm } = useStudio();

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomePreferencia, setNomePreferencia] = useState('');
  const [email, setEmail] = useState('');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const [cpfOuPassaporte, setCpfOuPassaporte] = useState('');
  const [turmaDesejada, setTurmaDesejada] = useState<ClassShift>('quarta-tarde');
  const [modalidade, setModalidade] = useState<PlanType>('trimestral');
  const [formaPagamentoPretendida, setFormaPagamentoPretendida] = useState<'pix' | 'cartao'>('pix');
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [endereco, setEndereco] = useState('Brasília - DF');
  const [profissao, setProfissao] = useState('');
  const [dataNascimento, setDataNascimento] = useState('1995-01-01');

  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleReset = () => {
    setCreatedStudent(null);
    setNomeCompleto('');
    setNomePreferencia('');
    setEmail('');
    setTelefoneWhatsapp('');
    setCpfOuPassaporte('');
    setEndereco('Brasília - DF');
    setProfissao('');
    setDataNascimento('1995-01-01');
    setTurmaDesejada('quarta-tarde');
    setModalidade('trimestral');
    setFormaPagamentoPretendida('pix');
    setShowMoreFields(false);
    setCopiedKey(false);
  };

  const handleResetAndClose = () => {
    handleReset();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: RegistrationFormData = {
      nomeCompleto: nomeCompleto.trim(),
      nomePreferencia: nomePreferencia.trim() || nomeCompleto.trim().split(' ')[0],
      email: email.trim(),
      telefoneWhatsapp: telefoneWhatsapp.trim(),
      cpfOuPassaporte: cpfOuPassaporte.trim() || '000.000.000-00',
      dataNascimento: dataNascimento,
      profissao: profissao.trim() || 'Não informada',
      endereco: endereco.trim() || 'Brasília - DF',
      comoConheceu: 'Instagram',
      modalidade,
      turmaDesejada,
      experiencia: 'iniciante',
      jaFezAulasOutroAtelie: 'Não',
      menor18: 'Não',
      contatoEmergenciaNome: '',
      contatoEmergenciaRelacao: '',
      informacoesSaudeAtendimento: 'Cadastrado pela coordenação do ateliê.',
      aceitouRegrasCondicoes: false,
      dataAceiteRegrasCondicoes: '',
      aceitouTermoRegulamento: false,
      dataAceiteTermoRegulamento: '',
      cienciaProcessoCeramico: false,
      cienciaMateriaisQueimas: false,
      veracidadeInformacoes: false,
      autorizacaoImagem: 'autorizo',
      formaPagamentoPretendida
    };

    const newStudent = createStudentFromForm(formData);
    setCreatedStudent(newStudent);
  };

  const handleCopyAccess = () => {
    if (!createdStudent) return;
    const msg = `Olá, ${createdStudent.registrationData.nomePreferencia || createdStudent.nome}! Seja muito bem-vinda(o) à Ollaria Ateliê de Cerâmica.\n\nSeu acesso ao Portal do Aluno está pronto:\n🏷️ Código de Matrícula: ${createdStudent.accessCode}\n🔑 Senha/PIN de Acesso: ${createdStudent.pin}\n📅 Turma: ${createdStudent.turma}\n\n📌 *Importante:* No seu primeiro acesso ao aplicativo, você visualizará as Regras e o Regulamento do Ateliê para sua leitura e aceite direto.\n\nAcesse o sistema da Ollaria para acompanhar suas peças, queimas, presenças e financeiro!`;
    navigator.clipboard.writeText(msg);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-[#FAF8F5] w-full max-w-lg rounded-2xl border border-[#E6DFD5] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D97736] to-[#A84A1A] flex items-center justify-center text-white shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#2C241E]">
                Incluir Novo Aluno
              </h2>
              <p className="text-xs text-[#7A6A5E]">
                Cadastro direto pela coordenação da Ollaria Ateliê
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-[#7A6A5E] hover:text-[#2C241E] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdStudent ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Aluno(a) Cadastrado com Sucesso!
              </h3>
              <p className="text-xs text-[#7A6A5E] mt-1">
                {createdStudent.nome} já consta na turma de {createdStudent.turma}.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E6DFD5] text-left space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-[#EBE4DA]">
                <span className="text-xs text-[#7A6A5E]">Código de Matrícula:</span>
                <span className="font-mono font-bold text-sm text-[#D97736] bg-[#FAF0E6] px-2.5 py-0.5 rounded-md border border-[#F0D5C3]">
                  {createdStudent.accessCode}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#EBE4DA]">
                <span className="text-xs text-[#7A6A5E]">Senha / PIN Individual:</span>
                <span className="font-mono font-bold text-sm text-[#2C241E] bg-[#F5EFEB] px-2.5 py-0.5 rounded-md border border-[#E6DFD5]">
                  {createdStudent.pin}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7A6A5E]">Turma & Plano:</span>
                <span className="font-semibold text-[#2C241E] capitalize">
                  {createdStudent.turma} • {createdStudent.modalidade}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyAccess}
                className="w-full py-2.5 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copiado para a área de transferência!' : 'Copiar Acesso para WhatsApp'}</span>
              </button>

              <button
                type="button"
                id="btn-cadastrar-outro-aluno"
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-[#E6A15C]" />
                <span>Cadastrar Outro Aluno</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-[#4A3E35] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do aluno"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Nome de Preferência
                </label>
                <input
                  type="text"
                  placeholder="Como gosta de ser chamado"
                  value={nomePreferencia}
                  onChange={(e) => setNomePreferencia(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  WhatsApp / Telefone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(61) 9...."
                  value={telefoneWhatsapp}
                  onChange={(e) => setTelefoneWhatsapp(e.target.value)}
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
                  placeholder="aluno@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  CPF ou Passaporte
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpfOuPassaporte}
                  onChange={(e) => setCpfOuPassaporte(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EBE4DA]">
              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Turma
                </label>
                <select
                  value={turmaDesejada}
                  onChange={(e) => setTurmaDesejada(e.target.value as ClassShift)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E] font-medium"
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
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value as PlanType)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CBC0] bg-white text-xs text-[#2C241E] font-medium"
                >
                  <option value="mensal">Mensal (4 aulas)</option>
                  <option value="bimestral">Bimestral (8 aulas)</option>
                  <option value="trimestral">Trimestral (12 aulas)</option>
                  <option value="semestral">Semestral (24 aulas)</option>
                </select>
              </div>
            </div>

            {/* Toggle extra fields */}
            <div>
              <button
                type="button"
                onClick={() => setShowMoreFields(!showMoreFields)}
                className="text-[11px] font-semibold text-[#D97736] hover:underline"
              >
                {showMoreFields ? '— Ocultar dados adicionais' : '+ Informar endereço, profissão e nascimento'}
              </button>

              {showMoreFields && (
                <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#E6DFD5] space-y-2.5 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A3E35] mb-0.5">Endereço</label>
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] text-xs text-[#2C241E]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A3E35] mb-0.5">Profissão</label>
                      <input
                        type="text"
                        value={profissao}
                        onChange={(e) => setProfissao(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] text-xs text-[#2C241E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4A3E35] mb-0.5">Data de Nascimento</label>
                      <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#D5CBC0] text-xs text-[#2C241E]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notice about terms acceptance */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Aceite das Regras & Regulamento:</strong>
                <span>
                  O aceite dos termos e condições é pessoal e obrigatório: ele será solicitado diretamente à(ao) aluna(o) ao acessar o aplicativo pela primeira vez, ficando bloqueado contra edição após assinado.
                </span>
              </div>
            </div>

            {/* Link to full registration wizard */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  onOpenFullWizard();
                }}
                className="text-xs text-[#7A6A5E] hover:text-[#2C241E] inline-flex items-center gap-1 underline"
              >
                <span>Ou use o formulário completo de matrícula com termos</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#E6DFD5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl border border-[#D5CBC0] text-xs font-semibold text-[#4A3E35] hover:bg-[#FAF8F5] transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-add-student"
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] flex items-center gap-1.5 transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-[#E6A15C]" />
                Cadastrar Aluno
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
