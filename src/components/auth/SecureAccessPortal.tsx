import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  ShieldCheck,
  UserCheck,
  Palette,
  Sparkles,
  ArrowRight,
  Search,
  Clock,
  Phone,
  Layers,
  Users
} from 'lucide-react';

interface SecureAccessPortalProps {
  onOpenRegistration: () => void;
}

export const SecureAccessPortal: React.FC<SecureAccessPortalProps> = ({ onOpenRegistration }) => {
  const { students, selectStudent, loginAsStudent, loginAsAdmin } = useStudio();

  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.nome.toLowerCase().includes(q) ||
      (s.registrationData?.nomePreferencia || '').toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.accessCode.toLowerCase().includes(q) ||
      s.turma.toLowerCase().includes(q)
    );
  });

  const handleStudentAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentId) {
      selectStudent(selectedStudentId);
    } else if (searchQuery.trim()) {
      loginAsStudent(searchQuery);
    } else if (students.length > 0) {
      selectStudent(students[0].id);
    }
  };

  const handleAdminAccess = () => {
    loginAsAdmin();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Brand Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D97736] to-[#A84A1A] text-white shadow-md mb-4 ring-4 ring-[#FAF0E6]">
          <Palette className="w-8 h-8" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C241E] tracking-tight mb-2">
          Ollaria Ateliê
        </h1>
        <p className="text-sm sm:text-base text-[#7A6A5E] font-medium">
          Arte • Cerâmica • Pesquisa & Acompanhamento de Alunas(os)
        </p>
        <p className="text-xs text-[#9E8B7E] mt-1">
          Brasília, Distrito Federal • Coordenação Sah Pereira
        </p>
      </div>

      {/* Main Access Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E6DFD5] shadow-lg overflow-hidden">
        
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

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'student' ? (
            <form onSubmit={handleStudentAccess} className="space-y-5">
              <div className="bg-[#FAF8F5] border border-[#EBE4DA] rounded-2xl p-4 text-xs text-[#6B5A4D] flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#D97736] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-[#2C241E] font-bold block text-sm mb-0.5">
                    Acesso Direto ao Portal do Aluno
                  </strong>
                  Selecione o seu nome na lista abaixo ou pesquise para acessar diretamente suas peças em forno, presenças e mensalidades.
                </div>
              </div>

              {/* Student Selector Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1.5">
                  Selecione o Aluno(a):
                </label>
                <select
                  id="select-student"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-[#2C241E] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D97736]/30 cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nome} • Turma: {st.turma} ({st.accessCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Or Quick Search */}
              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-1.5">
                  Ou busque por nome, turma ou e-mail:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8C7A6E] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite seu nome ou e-mail..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-[#2C241E] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                  />
                </div>
              </div>

              {/* Quick Click Badges for Enrolled Students */}
              <div>
                <p className="text-[11px] font-bold text-[#8C7A6E] uppercase tracking-wider mb-2">
                  Clique diretamente no seu nome para entrar:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredStudents.slice(0, 8).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => selectStudent(st.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        selectedStudentId === st.id
                          ? 'border-[#D97736] bg-[#FAF0E6]'
                          : 'border-[#E6DFD5] bg-white hover:bg-[#FAF8F5] hover:border-[#D5CBC0]'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-serif font-bold text-xs text-[#2C241E] block truncate">
                          {st.nome}
                        </span>
                        <span className="text-[10px] text-[#7A6A5E]">
                          {st.turma} • {st.modalidade}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D97736] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-enter-student-portal"
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D97736] hover:bg-[#C26224] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-99"
              >
                <span>Acessar Meu Portal de Aluno(a)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onOpenRegistration}
                  className="text-xs text-[#D97736] hover:text-[#A84A1A] font-semibold underline"
                >
                  Novo aluno? Preencher formulário de matrícula
                </button>
              </div>
            </form>
          ) : (
            /* Admin Panel Access */
            <div className="space-y-6">
              <div className="bg-[#FAF8F5] border border-[#E0D7CC] rounded-2xl p-4 text-xs text-[#4A3E35] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2C241E] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-[#2C241E] font-bold block text-sm mb-0.5">
                    Painel Geral da Coordenação
                  </strong>
                  Acesso para gerenciar turmas, registrar queimas no forno elétrico, fazer chamadas das aulas, controlar pagamentos e relatórios.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F3EE] border border-[#E6DFD5] space-y-3 text-xs text-[#6B5A4D]">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2C241E]">
                  <Users className="w-4 h-4 text-[#D97736]" />
                  <span>{students.length} alunos matriculados atualmente</span>
                </div>
                <p className="leading-relaxed">
                  Acesso livre e irrestrito para coordenação e professores do ateliê realizarem o acompanhamento diário.
                </p>
              </div>

              <button
                id="btn-enter-admin-panel"
                type="button"
                onClick={handleAdminAccess}
                className="w-full py-3.5 rounded-xl bg-[#2C241E] hover:bg-[#43372E] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-99"
              >
                <ShieldCheck className="w-4 h-4 text-[#E6A15C]" />
                <span>Entrar no Painel da Coordenação</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto text-xs text-[#6B5A4D]">
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <Layers className="w-5 h-5 text-[#D97736] mb-2" />
          <h4 className="font-serif font-bold text-sm text-[#2C241E] mb-1">Acesso Descomplicado</h4>
          <p className="text-[#7A6A5E] leading-relaxed">
            Consulte suas peças, avisos de fornadas, presenças e financeiro a qualquer momento sem necessidade de senhas.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <Clock className="w-5 h-5 text-[#D97736] mb-2" />
          <h4 className="font-serif font-bold text-sm text-[#2C241E] mb-1">Controle de Fornos</h4>
          <p className="text-[#7A6A5E] leading-relaxed">
            Acompanhe o ciclo das peças: secagem, 1ª queima (biscoito), esmaltação e queima final com prazo de retirada de 90 dias.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD5] shadow-xs">
          <Phone className="w-5 h-5 text-[#D97736] mb-2" />
          <h4 className="font-serif font-bold text-sm text-[#2C241E] mb-1">Atendimento Oficial</h4>
          <p className="text-[#7A6A5E] leading-relaxed">
            Dúvidas sobre turmas, reposições e ateliê: WhatsApp (61) 996101254 ou presencialmente na Ollaria Cerâmica.
          </p>
        </div>
      </div>

    </div>
  );
};
