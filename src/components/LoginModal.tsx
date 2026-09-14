import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { KeyRound, Shield, User, X, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAsStudent, loginAsAdmin } = useStudio();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const result = loginAsStudent(identifier, pin);
    if (result.success) {
      setSuccessMsg('Login realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 500);
    } else {
      setErrorMsg(result.message || 'Código ou PIN incorretos.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const result = loginAsAdmin(adminPassword);
    if (result.success) {
      setSuccessMsg('Acesso administrativo concedido!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 500);
    } else {
      setErrorMsg(result.message || 'Senha incorreta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241E]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#E6DFD5] w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#F2ECE3] px-6 py-4 border-b border-[#E0D7CC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#D97736]" />
            <h3 className="font-serif font-bold text-lg text-[#2C241E]">
              Autenticação Ollaria
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7A6A5E] hover:text-[#2C241E] p-1 rounded-lg hover:bg-[#E6DFD5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-6">
          <div className="flex bg-[#EBE4DA] p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setActiveTab('student');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-white text-[#2C241E] shadow-xs'
                  : 'text-[#6B5A4D] hover:text-[#2C241E]'
              }`}
            >
              <User className="w-4 h-4 text-[#D97736]" />
              Área do Aluno (Individual)
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-white text-[#2C241E] shadow-xs'
                  : 'text-[#6B5A4D] hover:text-[#2C241E]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#D97736]" />
              Painel do Ateliê
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Student Login Form */}
          {activeTab === 'student' ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  E-mail de Cadastro no Aplicativo
                </label>
                <input
                  type="text"
                  placeholder="ex: seu.email@exemplo.com ou OL-4921"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30 font-medium"
                  required
                />
                <p className="text-[11px] text-[#8C7A6E] mt-1">
                  O mesmo e-mail informado na sua matrícula.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                  Senha Gerada pelo Ateliê (PIN)
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha gerada pelo app"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30 font-medium tracking-wide"
                  required
                />
                <p className="text-[11px] text-[#8C7A6E] mt-1">
                  Senha numérica gerada exclusivamente para seu acesso.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D97736] text-white font-semibold text-sm hover:bg-[#C26224] transition-colors shadow-xs"
              >
                Acessar Minha Área de Aluno(a)
              </button>

              {/* Demo quick-fill buttons */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-[#8C7A6E] mb-1.5">Acessos de demonstração:</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('beatriz@email.com');
                      setPin('4921');
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-[#FAF0E6] text-[#D97736] hover:bg-[#F3DEC9] font-medium border border-[#EAC9B0]"
                  >
                    Aluno Teste: beatriz@email.com (4921)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('admin');
                      setAdminPassword('ollariagestao');
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-[#FAF8F5] text-[#4A3E35] hover:bg-[#EBE4DA] font-medium border border-[#D5CBC0]"
                  >
                    Coordenação: ollariagestao
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E6DFD5] text-center">
                <p className="text-[11px] text-[#7A6A5E] leading-relaxed">
                  O acesso é individual e protegido. A senha e o código são gerados e repassados exclusivamente pela coordenação do ateliê.
                </p>
              </div>
            </form>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                  Senha da Coordenação (Ateliê)
                </label>
                <input
                  type="password"
                  placeholder="Digite a senha de acesso administrativo"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#2C241E] text-white font-semibold text-sm hover:bg-[#43372E] transition-colors shadow-xs"
              >
                Entrar no Painel do Ateliê
              </button>

              <div className="mt-4 pt-4 border-t border-[#E6DFD5] text-center">
                <p className="text-[11px] text-[#7A6A5E] leading-relaxed">
                  Área restrita à gestão da Ollaria Ateliê para emissão de chaves, controle de fornos e chamadas.
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
