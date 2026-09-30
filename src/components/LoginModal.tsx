import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { Shield, User, X, CheckCircle2, AlertCircle, ArrowRight, Palette } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { students, selectStudent, loginAsStudent, loginAsAdmin } = useStudio();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (selectedStudentId) {
      selectStudent(selectedStudentId);
      setSuccessMsg('Acessando o portal...');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 350);
    } else if (searchIdentifier.trim()) {
      const result = loginAsStudent(searchIdentifier);
      if (result.success) {
        setSuccessMsg('Acessando o portal...');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 350);
      } else {
        setErrorMsg(result.message || 'Aluno não encontrado.');
      }
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginAsAdmin();
    setSuccessMsg('Acesso administrativo concedido!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 350);
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
                  Ou digite seu e-mail / nome:
                </label>
                <input
                  type="text"
                  placeholder="ex: seu.email@exemplo.com ou nome"
                  value={searchIdentifier}
                  onChange={(e) => {
                    setSearchIdentifier(e.target.value);
                    if (e.target.value) setSelectedStudentId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-white text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D97736] hover:bg-[#C26224] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-99"
              >
                <span>Acessar Portal do Aluno</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#7A6A5E] text-center pt-1">
                Acesso livre e direto para visualização de peças, queimas e financeiro.
              </p>
            </form>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E6DFD5] text-xs text-[#6B5A4D]">
                Acesso direto e irrestrito ao painel administrativo e de gestão da Ollaria Ateliê.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2C241E] hover:bg-[#43372E] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-99"
              >
                <Shield className="w-4 h-4 text-[#E6A15C]" />
                <span>Entrar no Painel da Coordenação</span>
              </button>

              <p className="text-[11px] text-[#7A6A5E] text-center pt-1">
                Acesso livre para acompanhamento de turmas, chamadas e queimas.
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
