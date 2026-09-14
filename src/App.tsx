import React, { useState } from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { RegistrationModal } from './components/registration/RegistrationModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentPortal } from './components/student/StudentPortal';
import { SecureAccessPortal } from './components/auth/SecureAccessPortal';
import { Sparkles, Heart, Shield, Phone, MapPin, Layers, ArrowLeft } from 'lucide-react';

const StudioAppContent: React.FC = () => {
  const { role, currentStudent, setRole } = useStudio();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C241E] flex flex-col selection:bg-[#E6A15C]/30 selection:text-[#2C241E]">
      
      {/* Global Navigation Bar */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegistration={() => setIsRegistrationOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {role === 'admin' ? (
          <AdminDashboard onOpenRegistration={() => setIsRegistrationOpen(true)} />
        ) : role === 'student' && currentStudent ? (
          <div>
            <div className="bg-[#2C241E] text-white px-4 py-2.5 text-xs">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <span className="text-[#E6DFD5]">
                  Visualizando o portal de: <strong className="text-white">{currentStudent.registrationData.nomePreferencia || currentStudent.nome}</strong> ({currentStudent.accessCode})
                </span>
                <button
                  onClick={() => setRole('admin')}
                  className="inline-flex items-center gap-1.5 text-[#E6A15C] hover:text-white font-semibold underline transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar ao Painel do Ateliê
                </button>
              </div>
            </div>
            <StudentPortal />
          </div>
        ) : (
          <SecureAccessPortal onOpenRegistration={() => setIsRegistrationOpen(true)} />
        )}
      </main>

      {/* Footer with Studio Identity and Guidelines */}
      <footer className="bg-[#FAF8F5] border-t border-[#E6DFD5] py-8 text-[#7A6A5E] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-serif font-bold text-[#2C241E] text-sm tracking-wide">
              Ollaria Ateliê • Cerâmica & Pesquisa
            </p>
            <p className="text-[11px]">
              Coordenação: Sah Pereira • Brasília, Distrito Federal
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#D97736]" />
              WhatsApp: <strong>61 996101254</strong>
            </span>
            <span className="h-3 w-px bg-[#D5CBC0]" />
            <span>Chave PIX: <strong>61 996101254</strong></span>
          </div>

          <div className="text-[11px] text-[#A69588] text-center md:text-right">
            <span>Sistema seguro com isolamento individual de dados</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <StudioAppContent />
    </StudioProvider>
  );
}
