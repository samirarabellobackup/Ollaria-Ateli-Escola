import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { Shield, User, X, CheckCircle2, AlertCircle, ArrowRight, Palette, Eye, EyeOff, Lock, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { students, loginAsStudent, loginAsAdmin } = useStudio();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [studentPin, setStudentPin] = useState('');
  const [showStudentPin, setShowStudentPin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const target = selectedStudentId || searchIdentifier;
    if (!target.trim()) {
      setErrorMsg('Selecione ou informe um aluno.');
      return;
    }

    const result = loginAsStudent(target, studentPin);
    if (result.success) {
      setSuccessMsg('Acesso concedido! Redirecionando...');
      setTimeout(() => {
        setSuccessMsg('');
        setStudentPin('');
        onClose();
      }, 350);
    } else {
      setErrorMsg(result.message || 'Aluno não encontrado ou PIN incorreto.');
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
        setAdminPassword('');
        onClose();
      }, 350);
    } else {
      setErrorMsg(result.message || 'Senha incorreta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C241E]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#E6DFD5] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#F2ECE3] px-6 py-4 border-b border-[#E0D7CC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#D97736]" />
            <h3 className="font-serif font-bold text-lg text-[#2C241E]">
              Acesso Ollaria Ateliê
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7A6A5E] hover:text-[#2C241E] p-1.5 rounded-lg hover:bg-[#E6DFD5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-6">
          <div className="flex bg-[#EBE4DA] p-1 rounded-2xl mb-5">
            <button
              onClick={() => {
                setActiveTab('student');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'student'
                  ? 'bg-white text-[#2C241E] shadow-xs'
                  : 'text-[#6B5A4D] hover:text-[#2C241E]'
              }`}
            >
              <User className="w-4 h-4 text-[#D97736]" />
              Área do Aluno
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-white text-[#2C241E] shadow-xs'
                  : 'text-[#6B5A4D] hover:text-[#2C241E]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#D97736]" />
              Coordenação
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
                <label className="block text-xs font-bold text-[#4A3E35] mb-1.5">
                  Escolha o Aluno(a):
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D97736]/30 cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nome} • Turma: {st.turma} ({st.accessCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1.5">
                  Ou digite seu e-mail / matrícula:
                </label>
                <input
                  type="text"
                  placeholder="ex: seu.email@exemplo.com ou OL-XXXX"
                  value={searchIdentifier}
                  onChange={(e) => {
                    setSearchIdentifier(e.target.value);
                    if (e.target.value) setSelectedStudentId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#4A3E35]">
                    Senha / PIN de Acesso Individual *:
                  </label>
                  <span className="text-[11px] text-[#7A6A5E] font-medium">4 dígitos</span>
                </div>
                <div className="relative">
                  <input
                    type={showStudentPin ? 'text' : 'password'}
                    placeholder="Digite seu PIN (ex: 8421)"
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPin(!showStudentPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A5E] hover:text-[#2C241E]"
                  >
                    {showStudentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#8C7A6E] mt-1">
                  Exemplos de PIN de teste: Bia: 8421 • Rodrigo: 2345 • Mari: 3456 • Lucas: 4567
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D97736] hover:bg-[#C26224] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-99"
              >
                <Lock className="w-4 h-4" />
                <span>Acessar Portal do Aluno com PIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#7A6A5E] text-center pt-1">
                Acesso seguro com isolamento individual de dados e peças.
              </p>
            </form>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E6DFD5] text-xs text-[#6B5A4D]">
                Painel exclusivo para coordenação e gestão do ateliê (Samira Rebello).
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1.5">
                  Senha de Acesso da Coordenação *:
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    placeholder="Digite a senha de administrador"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A5E] hover:text-[#2C241E]"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#8C7A6E] mt-1">
                  Senha padrão da coordenação: <code className="bg-[#EBE4DA] px-1.5 py-0.5 rounded text-[#2C241E] font-mono">ollaria2026</code>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2C241E] hover:bg-[#43372E] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-99"
              >
                <Shield className="w-4 h-4 text-[#E6A15C]" />
                <span>Entrar no Painel da Coordenação</span>
              </button>

              <p className="text-[11px] text-[#7A6A5E] text-center pt-1">
                Acesso protegido para acompanhamento de turmas, chamadas e queimas.
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
