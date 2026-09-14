import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  KeyRound,
  ShieldCheck,
  UserCheck,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Palette,
  Shield,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';

interface SecureAccessPortalProps {
  onOpenRegistration: () => void;
}

export const SecureAccessPortal: React.FC<SecureAccessPortalProps> = ({ onOpenRegistration }) => {
  const { loginAsStudent, loginAsAdmin } = useStudio();

  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');

  // Student form state
  const [studentCode, setStudentCode] = useState('');
  const [studentPin, setStudentPin] = useState('');
  const [studentError, setStudentError] = useState('');
  const [studentSuccess, setStudentSuccess] = useState('');

  // Admin form state
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');
    const res = loginAsStudent(studentCode, studentPin);
    if (res.success) {
      setStudentSuccess('Autenticado com sucesso! Abrindo seu portal...');
    } else {
      setStudentError(res.message || 'Código de acesso ou PIN incorretos.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const res = loginAsAdmin(adminPassword);
    if (res.success) {
      setAdminSuccess('Autenticado com sucesso! Carregando painel...');
    } else {
      setAdminError(res.message || 'Senha administrativa incorreta.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Brand Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D97736] to-[#A84A1A] text-white shadow-md mb-4 ring-4 ring-[#FAF0E6]">
          <Palette className="w-8 h-8" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C241E] tracking-tight mb-2">
          Ollaria Ateliê
        </h1>
        <p className="text-sm sm:text-base text-[#7A6A5E] font-medium">
          Arte • Cerâmica • Pesquisa & Gestão de Alunas(os)
        </p>
        <p className="text-xs text-[#9E8B7E] mt-1">
          Brasília, Distrito Federal • Coordenação Sah Pereira
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#E6DFD5] shadow-lg overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E6DFD5] bg-[#F7F3EE]">
          <button
            id="tab-access-student"
            type="button"
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-4 px-4 text-center font-serif text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === 'student'
                ? 'bg-white text-[#2C241E] border-[#D97736]'
                : 'text-[#7A6A5E] hover:text-[#2C241E] border-transparent'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === 'student' ? 'text-[#D97736]' : 'text-[#7A6A5E]'}`} />
            <span>Área do Aluno</span>
          </button>

          <button
            id="tab-access-admin"
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-4 px-4 text-center font-serif text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === 'admin'
                ? 'bg-white text-[#2C241E] border-[#2C241E]'
                : 'text-[#7A6A5E] hover:text-[#2C241E] border-transparent'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-[#2C241E]' : 'text-[#7A6A5E]'}`} />
            <span>Coordenação / Ateliê</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          
          {activeTab === 'student' ? (
            /* Student Form */
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="bg-[#FAF8F5] border border-[#EBE4DA] rounded-xl p-3 text-xs text-[#6B5A4D] flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#D97736] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Para sua segurança, o acesso ao seu portal de peças, chamadas e pagamentos é estritamente pessoal. Utilize o <strong>e-mail informado na sua matrícula</strong> e a <strong>senha gerada pelo aplicativo</strong> e enviada a você pelo ateliê.
                </p>
              </div>

              {studentError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{studentError}</div>
                </div>
              )}

              {studentSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{studentSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  E-mail de Cadastro no Aplicativo
                </label>
                <div className="relative">
                  <input
                    id="input-student-code"
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="ex: seu.email@exemplo.com ou OL-4921"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30 font-medium"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-[#A69588] absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#8C7A6E] mt-1">
                  Digite o e-mail cadastrado (ou seu código OL-XXXX / CPF).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  Senha de Acesso Gerada pelo Ateliê
                </label>
                <div className="relative">
                  <input
                    id="input-student-pin"
                    type="password"
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value)}
                    placeholder="Digite a senha / PIN gerado pelo aplicativo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30 font-medium tracking-wide"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#A69588] absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#8C7A6E] mt-1">
                  Senha de acesso individual enviada pela coordenação do ateliê.
                </p>
              </div>

              <button
                id="btn-submit-student-login"
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D97736] text-white font-semibold text-sm hover:bg-[#C26224] transition-all shadow-md active:scale-99"
              >
                Acessar Minha Área de Aluno(a)
              </button>

              {/* Quick sample credentials helper for preview/testing */}
              <div className="pt-2 border-t border-[#EBE4DA] text-center">
                <p className="text-[11px] text-[#8C7A6E] mb-2 font-medium">
                  Para testes rápidos de demonstração:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentCode('beatriz@email.com');
                      setStudentPin('4921');
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#D97736] hover:bg-[#F3DEC9] font-medium border border-[#EAC9B0] transition-colors"
                  >
                    Aluno Teste: beatriz@email.com (Senha: 4921)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('admin');
                      setAdminPassword('ollariagestao');
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-[#4A3E35] hover:bg-[#EBE4DA] font-medium border border-[#D5CBC0] transition-colors"
                  >
                    Coordenação: ollariagestao
                  </button>
                </div>
              </div>

              <div className="pt-3 text-center">
                <p className="text-[11px] text-[#8C7A6E]">
                  Ainda não possui seus dados de acesso? Entre em contato com a coordenação via WhatsApp ou no ateliê.
                </p>
              </div>
            </form>
          ) : (
            /* Admin Form */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-[#F2ECE3] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#4A3E35] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2C241E] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Área restrita à gestão da Ollaria Ateliê. Permite gerenciar chamadas, registrar queimas, acompanhar pagamentos e emitir senhas individuais para alunos.
                </p>
              </div>

              {adminError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {adminSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{adminSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Senha de Acesso da Coordenação
                </label>
                <div className="relative">
                  <input
                    id="input-admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Digite a senha administrativa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C241E]/30 font-medium"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#A69588] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                id="btn-submit-admin-login"
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2C241E] text-white font-semibold text-sm hover:bg-[#43372E] transition-all shadow-md active:scale-99"
              >
                Entrar no Painel do Ateliê
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-[#8C7A6E]">
                  Acesso protegido por autenticação interna da Ollaria Ateliê.
                </p>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* Security & Studio Information Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto text-xs text-[#6B5A4D]">
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <Shield className="w-5 h-5 text-[#D97736] mb-2" />
          <h4 className="font-serif font-bold text-sm text-[#2C241E] mb-1">Privacidade Garantida</h4>
          <p className="text-[#7A6A5E] leading-relaxed">
            Cada aluno possui uma senha exclusiva gerada pelo ateliê. Nenhum aluno visualiza dados, peças ou finanças de outro.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <Clock className="w-5 h-5 text-[#D97736] mb-2" />
          <h4 className="font-serif font-bold text-sm text-[#2C241E] mb-1">Controle de Peças & Queimas</h4>
          <p className="text-[#7A6A5E] leading-relaxed">
            Acompanhe o ciclo completo de suas peças: secagem, biscoito, esmaltação e queima final com prazo de retirada de 90 dias.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <Phone className="w-5 h-5 text-[#D97736] mb-2" />
          <h4 className="font-serif font-bold text-sm text-[#2C241E] mb-1">Atendimento Oficial</h4>
          <p className="text-[#7A6A5E] leading-relaxed">
            Dúvidas sobre turmas, reposições ou chaves de acesso: WhatsApp (61) 996101254 ou presencialmente no ateliê.
          </p>
        </div>
      </div>

    </div>
  );
};
