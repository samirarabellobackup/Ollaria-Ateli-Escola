import React from 'react';
import { useStudio } from '../context/StudioContext';
import {
  Palette,
  ShieldCheck,
  User,
  PlusCircle,
  Bell,
  LogOut,
  KeyRound,
  Shield
} from 'lucide-react';

interface NavbarProps {
  onOpenRegistration: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegistration, onOpenLogin }) => {
  const {
    role,
    setRole,
    currentStudent,
    logout,
    notifications,
    changeRequests
  } = useStudio();

  const unreadCount = notifications.filter(
    (n) => !n.lida && (role === 'admin' ? true : n.studentId === currentStudent?.id)
  ).length;
  const pendingApprovalsCount = changeRequests.filter((r) => r.status === 'pendente').length;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6DFD5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Ateliê Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D97736] to-[#A84A1A] flex items-center justify-center text-white shadow-sm ring-1 ring-[#D97736]/30">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-[#2C241E]">
                  OLLARIA ATELIÊ
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBE4DA] text-[#6B5A4D]">
                  Brasília — DF
                </span>
              </div>
              <p className="text-xs text-[#7A6A5E] font-medium hidden sm:block">
                Arte • Cerâmica • Pesquisa & Gestão
              </p>
            </div>
          </div>

          {/* Context status indicator */}
          <div className="hidden md:flex items-center gap-3">
            {role === 'admin' ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#2C241E] text-[#FAF8F5] text-xs font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#E6A15C]" />
                <span>Painel da Coordenação</span>
                {pendingApprovalsCount > 0 && (
                  <span className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingApprovalsCount} pendência{pendingApprovalsCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            ) : role === 'student' && currentStudent ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF0E6] border border-[#F0D5C3] text-[#2C241E] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Aluno(a): <strong>{currentStudent.registrationData.nomePreferencia || currentStudent.nome}</strong></span>
                <span className="text-[#7A6A5E] text-[11px]">({currentStudent.accessCode})</span>
              </div>
            ) : (
              <div className="text-xs text-[#7A6A5E] font-medium">
                Portal de Acesso Restrito
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Nova Matrícula (visible only for admin or guests) */}
            {role === 'admin' && (
              <button
                id="btn-open-matricula"
                onClick={onOpenRegistration}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#2C241E] text-[#FAF8F5] hover:bg-[#43372E] active:scale-98 transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-[#E6A15C]" />
                <span className="hidden sm:inline">Nova Matrícula</span>
              </button>
            )}

            {/* If logged in (admin or student), show Logout button */}
            {role !== 'guest' ? (
              <button
                id="btn-logout"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[#D5CBC0] bg-[#FAF8F5] text-[#4A3E35] hover:bg-[#EBE4DA] transition-all"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4 text-[#8C3A16]" />
                <span>Sair</span>
              </button>
            ) : (
              /* If guest, show Login button */
              <button
                id="btn-open-login"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#D97736] text-white hover:bg-[#C26224] transition-all shadow-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </button>
            )}

            {/* Notification Badge indicator if logged in */}
            {role !== 'guest' && (
              <div className="relative">
                <div
                  className="p-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-[#5C4D41]"
                  title="Notificações ativas"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D97736] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Sub-bar for mobile status */}
      <div className="md:hidden flex border-t border-[#E6DFD5] bg-[#F5F0E8] px-4 py-2 justify-between items-center text-xs">
        {role === 'admin' ? (
          <span className="font-bold text-[#2C241E] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D97736]" /> Painel da Coordenação
          </span>
        ) : role === 'student' && currentStudent ? (
          <span className="font-semibold text-[#2C241E] truncate max-w-[200px]">
            {currentStudent.registrationData.nomePreferencia || currentStudent.nome} ({currentStudent.accessCode})
          </span>
        ) : (
          <span className="text-[#7A6A5E]">Acesso restrito Ollaria Ateliê</span>
        )}

        {role === 'admin' ? (
          <button
            onClick={onOpenRegistration}
            className="text-[#9E4C1D] font-bold flex items-center gap-1 hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Nova Matrícula
          </button>
        ) : role === 'guest' ? (
          <button
            onClick={onOpenLogin}
            className="text-[#D97736] font-bold flex items-center gap-1 hover:underline"
          >
            <KeyRound className="w-3.5 h-3.5" /> Entrar
          </button>
        ) : null}
      </div>
    </header>
  );
};
