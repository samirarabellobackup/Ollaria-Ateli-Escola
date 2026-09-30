import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  PotteryPiece,
  AttendanceRecord,
  FinancialTransaction,
  SystemNotification,
  ProfileChangeRequest,
  RegistrationFormData,
  PieceStage,
  AttendanceStatus,
  PaymentMethod,
  MonthlyReportData,
  UserRole,
  ServiceType,
  FiringOrder,
  FiringStatus,
  ConsultingAppointment,
  CoworkingBooking,
  MaterialUsage,
  SystemAuditLog
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_PIECES,
  INITIAL_ATTENDANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHANGE_REQUESTS,
  INITIAL_FIRINGS,
  INITIAL_CONSULTING_APPOINTMENTS,
  INITIAL_COWORKING_BOOKINGS,
  INITIAL_MATERIALS,
  INITIAL_AUDIT_LOGS
} from '../data/seedData';
import { exportStudentsToCSV, exportFullBackupJSON as exportBackupJSONHelper } from '../utils/spreadsheet';

interface StudioContextType {
  role: UserRole;
  currentStudent: Student | null;
  students: Student[];
  pieces: PotteryPiece[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  notifications: SystemNotification[];
  changeRequests: ProfileChangeRequest[];
  isAdminPreview: boolean;

  // NOVO MÓDULO: Serviços, Queimas, Horas, Materiais e Histórico
  firings: FiringOrder[];
  consultingAppointments: ConsultingAppointment[];
  coworkingBookings: CoworkingBooking[];
  materialsUsage: MaterialUsage[];
  auditLogs: SystemAuditLog[];

  toggleUserService: (userId: string, service: ServiceType) => void;
  updateUserServicesData: (userId: string, updates: Partial<Student>) => void;
  
  addFiringOrder: (order: Omit<FiringOrder, 'id' | 'createdAt'>) => FiringOrder;
  updateFiringOrderStatus: (orderId: string, status: FiringStatus, observacoes?: string) => void;
  deleteFiringOrder: (orderId: string) => void;

  addConsultingAppointment: (app: Omit<ConsultingAppointment, 'id' | 'createdAt'>) => ConsultingAppointment;
  updateConsultingAppointmentStatus: (appId: string, status: 'agendado' | 'realizado' | 'cancelado') => void;

  addCoworkingBooking: (booking: Omit<CoworkingBooking, 'id' | 'solicitadoEm'>) => CoworkingBooking;
  updateCoworkingBookingStatus: (bookingId: string, status: 'solicitado' | 'confirmado' | 'realizado' | 'cancelado') => void;

  registerMaterialUsage: (usage: Omit<MaterialUsage, 'id' | 'createdAt' | 'valorTotal'>) => MaterialUsage;
  deleteMaterialUsage: (usageId: string) => void;

  addAuditLog: (log: Omit<SystemAuditLog, 'id' | 'data'>) => void;
  
  // Auth & Roles
  setRole: (role: UserRole) => void;
  setCurrentStudentById: (studentId: string) => void;
  selectStudent: (studentId: string) => void;
  loginAsStudent: (identifier: string, pin?: string) => { success: boolean; message?: string };
  loginAsAdmin: (password?: string) => { success: boolean; message?: string };
  updateAdminPassword: (newPass: string) => void;
  logout: () => void;

  // Student CRUD & Spreadsheet Backup/Import
  createStudentFromForm: (formData: RegistrationFormData) => Student;
  updateStudent: (updatedStudent: Student) => void;
  deleteStudent: (studentId: string) => void;
  generateNewAccessKey: (studentId: string) => string;
  importStudents: (importedList: Student[], mode: 'merge' | 'replace') => void;
  exportStudentsCSV: () => void;
  exportFullBackupJSON: () => void;

  // Pieces
  addPiece: (piece: Omit<PotteryPiece, 'id' | 'createdAt'>) => PotteryPiece;
  updatePieceStage: (pieceId: string, newStage: PieceStage, observacoes?: string) => void;
  updatePieceEvaluation: (pieceId: string, aprovada: boolean, riscos?: string, obs?: string) => void;
  deletePiece: (pieceId: string) => void;

  // Attendance & Classes
  registerAttendance: (studentId: string, status: AttendanceStatus, data: string, horario: string, observacao?: string) => void;
  deleteAttendance: (attendanceId: string) => void;

  // Finance
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'createdAt'>) => FinancialTransaction;
  markTransactionAsPaid: (txId: string, metodo: PaymentMethod) => void;
  deleteTransaction: (txId: string) => void;

  // Registration & Changes
  acceptStudentTerms: (studentId: string, autorizacaoImagem?: 'autorizo' | 'nao_autorizo') => void;
  requestProfileChange: (studentId: string, campo: string, valorAnterior: string, novoValor: string, motivo?: string) => void;
  resolveProfileChange: (requestId: string, status: 'aprovado' | 'rejeitado') => void;

  // Notifications
  createNotification: (studentId: string | undefined, tipo: SystemNotification['tipo'], titulo: string, mensagem: string, urgencia?: 'baixa' | 'media' | 'alta') => void;
  markNotificationAsRead: (notificationId: string) => void;
  
  // Reports
  generateMonthlyReport: (mesAno: string) => MonthlyReportData;

  // Reset
  resetDatabase: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'ollaria_atelie_';

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Multi-tier load from localStorage to guarantee no data loss on reload or update
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const v2 = localStorage.getItem(`${STORAGE_KEY_PREFIX}students_v2`);
      if (v2) {
        const parsed = JSON.parse(v2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacy = localStorage.getItem(`${STORAGE_KEY_PREFIX}students`);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const backup = localStorage.getItem(`${STORAGE_KEY_PREFIX}students_backup`);
      if (backup) {
        const parsed = JSON.parse(backup);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Erro ao ler alunos do armazenamento local:', err);
    }
    return INITIAL_STUDENTS;
  });

  const [pieces, setPieces] = useState<PotteryPiece[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}pieces`);
      return saved ? JSON.parse(saved) : INITIAL_PIECES;
    } catch {
      return INITIAL_PIECES;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}attendance`);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [changeRequests, setChangeRequests] = useState<ProfileChangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}changeRequests`);
      return saved ? JSON.parse(saved) : INITIAL_CHANGE_REQUESTS;
    } catch {
      return INITIAL_CHANGE_REQUESTS;
    }
  });

  // NOVO MÓDULO: Queimas, Consultoria, Coworking, Materiais e Histórico
  const [firings, setFirings] = useState<FiringOrder[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}firings`);
      return saved ? JSON.parse(saved) : INITIAL_FIRINGS;
    } catch {
      return INITIAL_FIRINGS;
    }
  });

  const [consultingAppointments, setConsultingAppointments] = useState<ConsultingAppointment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}consulting`);
      return saved ? JSON.parse(saved) : INITIAL_CONSULTING_APPOINTMENTS;
    } catch {
      return INITIAL_CONSULTING_APPOINTMENTS;
    }
  });

  const [coworkingBookings, setCoworkingBookings] = useState<CoworkingBooking[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}coworking`);
      return saved ? JSON.parse(saved) : INITIAL_COWORKING_BOOKINGS;
    } catch {
      return INITIAL_COWORKING_BOOKINGS;
    }
  });

  const [materialsUsage, setMaterialsUsage] = useState<MaterialUsage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}materials`);
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // Default to 'guest' when accessing the app URL unless an active session was already authenticated
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem(`${STORAGE_KEY_PREFIX}role`);
      if (savedRole === 'admin' || savedRole === 'student') {
        return savedRole as UserRole;
      }
    } catch (err) {
      console.error(err);
    }
    return 'guest';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY_PREFIX}currentStudentId`) || null;
    } catch {
      return null;
    }
  });

  const [isAdminPreview, setIsAdminPreview] = useState(false);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'guest') {
      setIsAdminPreview(false);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}role`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}currentStudentId`);
    } else {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}role`, newRole);
    }
  };

  // Persistence effects with mirrors
  useEffect(() => {
    if (currentStudentId) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}currentStudentId`, currentStudentId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}currentStudentId`);
    }
  }, [currentStudentId]);

  useEffect(() => {
    try {
      const json = JSON.stringify(students);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}students_v2`, json);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}students`, json);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}students_backup`, json);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}last_sync`, new Date().toISOString());
    } catch (err) {
      console.error('Erro ao salvar alunos:', err);
    }
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}pieces`, JSON.stringify(pieces));
  }, [pieces]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}attendance`, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}changeRequests`, JSON.stringify(changeRequests));
  }, [changeRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}firings`, JSON.stringify(firings));
  }, [firings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}consulting`, JSON.stringify(consultingAppointments));
  }, [consultingAppointments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}coworking`, JSON.stringify(coworkingBookings));
  }, [coworkingBookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}materials`, JSON.stringify(materialsUsage));
  }, [materialsUsage]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const currentStudent = students.find((s) => s.id === currentStudentId) || null;

  const setCurrentStudentById = (id: string) => {
    setCurrentStudentId(id);
    if (role === 'admin') {
      setIsAdminPreview(true);
    }
  };

  const selectStudent = (studentId: string) => {
    // Only allow direct switch if currently in admin session
    if (role !== 'admin' && !isAdminPreview) {
      console.warn('Para acessar como aluno, informe o identificador e PIN no login.');
      return;
    }
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setCurrentStudentId(student.id);
      setRole('student');
      setIsAdminPreview(true);
    }
  };

  const loginAsStudent = (identifier: string, pin?: string) => {
    const cleanInput = identifier.trim();

    if (!cleanInput) {
      return {
        success: false,
        message: 'Por favor, selecione seu nome ou informe seu e-mail de cadastro.'
      };
    }

    const cleanEmail = cleanInput.toLowerCase();
    const cleanCode = cleanInput.toUpperCase();
    const cleanCpf = cleanInput.replace(/\D/g, '');

    const student = students.find((s) => {
      const sId = s.id;
      const sName = (s.nome || '').toLowerCase();
      const sPrefName = (s.registrationData?.nomePreferencia || '').toLowerCase();
      const sEmail = (s.email || '').trim().toLowerCase();
      const sRegEmail = (s.registrationData?.email || '').trim().toLowerCase();
      const sCode = (s.accessCode || '').trim().toUpperCase();
      const sCpf = (s.registrationData?.cpfOuPassaporte || '').replace(/\D/g, '');

      return (
        sId === cleanInput ||
        sEmail === cleanEmail ||
        sRegEmail === cleanEmail ||
        sCode === cleanCode ||
        (cleanCpf.length >= 8 && sCpf === cleanCpf) ||
        sName === cleanEmail ||
        sPrefName === cleanEmail ||
        sName.includes(cleanEmail)
      );
    });

    if (!student) {
      return {
        success: false,
        message: 'Aluno não encontrado. Selecione seu nome na lista ou confira o e-mail/código informado.'
      };
    }

    // Verify PIN if set
    const inputPin = (pin || '').trim();
    const studentPin = (student.pin || '').trim();

    if (studentPin) {
      if (!inputPin) {
        return {
          success: false,
          message: 'Por favor, digite seu PIN/senha de acesso individual.'
        };
      }
      if (inputPin !== studentPin) {
        return {
          success: false,
          message: 'PIN incorreto para este aluno. Verifique seus dígitos de acesso.'
        };
      }
    }

    setCurrentStudentId(student.id);
    setRole('student');
    setIsAdminPreview(false);
    return { success: true };
  };

  const loginAsAdmin = (password?: string) => {
    const inputPass = (password || '').trim();
    if (!inputPass) {
      return {
        success: false,
        message: 'Por favor, informe a senha de acesso da coordenação.'
      };
    }

    let savedPass = '';
    try {
      savedPass = localStorage.getItem(`${STORAGE_KEY_PREFIX}admin_password`) || '';
    } catch {
      // ignore
    }

    // Valid passwords: custom saved password, default 'ollaria2026', or standard keys
    const validPasswords = [savedPass, 'ollaria2026', 'admin', 'admin123', 'sah2026', 'ollaria'].filter(Boolean);

    if (validPasswords.includes(inputPass)) {
      setRole('admin');
      setIsAdminPreview(false);
      return { success: true };
    }

    return {
      success: false,
      message: 'Senha administrativa incorreta. Verifique os dados digitados.'
    };
  };

  const updateAdminPassword = (newPass: string) => {
    if (newPass.trim()) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}admin_password`, newPass.trim());
    }
  };

  const logout = () => {
    setRole('guest');
    setCurrentStudentId(null);
    setIsAdminPreview(false);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}role`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}currentStudentId`);
  };

  const generateNewAccessKey = (studentId: string): string => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `OL-${randomDigits}`;
    const newPin = String(Math.floor(1000 + Math.random() * 9000));

    setStudents((prev) =>
      prev.map((st) => (st.id === studentId ? { ...st, accessCode: newCode, pin: newPin } : st))
    );
    return newCode;
  };

  const createStudentFromForm = (formData: RegistrationFormData): Student => {
    const newId = `student-${Date.now()}`;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const accessCode = `OL-${randomDigits}`;
    const pin = String(Math.floor(1000 + Math.random() * 9000));

    // Calculate total plan classes
    let totalAulas = 4;
    let valorPlano = 460;
    let diasValidade = 30;

    switch (formData.modalidade) {
      case 'mensal':
        totalAulas = 4;
        valorPlano = formData.formaPagamentoPretendida === 'pix' ? 460 : 506;
        diasValidade = 30;
        break;
      case 'bimestral':
        totalAulas = 8;
        valorPlano = formData.formaPagamentoPretendida === 'pix' ? 920 : 1012;
        diasValidade = 60;
        break;
      case 'trimestral':
        totalAulas = 12;
        valorPlano = formData.formaPagamentoPretendida === 'pix' ? 1338.60 : 1472.45;
        diasValidade = 90;
        break;
      case 'semestral':
        totalAulas = 24;
        valorPlano = formData.formaPagamentoPretendida === 'pix' ? 2539.20 : 3036;
        diasValidade = 180;
        break;
    }

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + diasValidade);

    const todayStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const newStudent: Student = {
      id: newId,
      accessCode,
      pin,
      nome: formData.nomeCompleto,
      email: formData.email,
      whatsapp: formData.telefoneWhatsapp,
      turma: formData.turmaDesejada,
      modalidade: formData.modalidade,
      valorPlano,
      dataInicioPlano: todayStr,
      dataFimPlano: endStr,
      status: 'ativo',
      aulasTotaisPlano: totalAulas,
      aulasFeitas: 0,
      aulasRestantes: totalAulas,
      trancamentosUtilizadosDias: 0,
      registrationData: formData,
      dataMatricula: todayStr
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Create initial invoice transaction
    const initialTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      studentId: newId,
      descricao: `Matrícula Aulas Regulares - Plano ${formData.modalidade.toUpperCase()} (${totalAulas} aulas)`,
      categoria: 'mensalidade',
      valor: valorPlano,
      status: 'pendente',
      dataVencimento: todayStr,
      metodoPagamento: formData.formaPagamentoPretendida,
      observacoes: `Aguardando confirmação de pagamento via ${formData.formaPagamentoPretendida.toUpperCase()} (Chave PIX: 61 996101254).`,
      createdAt: new Date().toISOString()
    };
    setTransactions((prev) => [initialTx, ...prev]);

    // Create initial welcome notification
    const welcomeNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      studentId: newId,
      tipo: 'aviso_aula',
      titulo: `Bem-vinda(o) à Ollaria Ateliê, ${formData.nomePreferencia || formData.nomeCompleto}!`,
      mensagem: `Sua matrícula no plano ${formData.modalidade} foi recebida. Seu código de acesso exclusivo é ${accessCode} (PIN: ${pin}). Guarde estas informações para acessar seu portal!`,
      urgencia: 'baixa',
      lida: false,
      dataCriacao: new Date().toISOString()
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);

    return newStudent;
  };

  const updateStudent = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setPieces((prev) => prev.filter((p) => p.studentId !== studentId));
    setAttendance((prev) => prev.filter((a) => a.studentId !== studentId));
    setTransactions((prev) => prev.filter((t) => t.studentId !== studentId));
    setNotifications((prev) => prev.filter((n) => n.studentId !== studentId));
    setChangeRequests((prev) => prev.filter((r) => r.studentId !== studentId));
    if (currentStudent?.id === studentId) {
      setCurrentStudentId(null);
      setRole('admin');
    }
  };

  const addPiece = (pieceData: Omit<PotteryPiece, 'id' | 'createdAt'>): PotteryPiece => {
    const newPiece: PotteryPiece = {
      ...pieceData,
      id: `piece-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPieces((prev) => [newPiece, ...prev]);
    return newPiece;
  };

  const updatePieceStage = (pieceId: string, newStage: PieceStage, observacoes?: string) => {
    setPieces((prev) =>
      prev.map((p) => {
        if (p.id !== pieceId) return p;

        const isNowReady = newStage === 'queimada_pronta';
        const now = new Date();
        const ninetyDaysLater = new Date();
        ninetyDaysLater.setDate(now.getDate() + 90);

        const updated: PotteryPiece = {
          ...p,
          etapa: newStage,
          dataQueimaConcluida: isNowReady ? now.toISOString().split('T')[0] : p.dataQueimaConcluida,
          prazoLimiteRetirada: isNowReady ? ninetyDaysLater.toISOString().split('T')[0] : p.prazoLimiteRetirada,
          avaliacaoTecnica: {
            ...p.avaliacaoTecnica,
            observacoes: observacoes !== undefined ? observacoes : p.avaliacaoTecnica.observacoes
          }
        };

        // If piece became ready, create a notification for the student
        if (isNowReady && p.etapa !== 'queimada_pronta') {
          const student = students.find((s) => s.id === p.studentId);
          createNotification(
            p.studentId,
            'retirada_peca',
            `Sua peça "${p.titulo}" foi concluída e está pronta!`,
            `A queima de sua peça foi finalizada e ela já está na estante de retiradas do ateliê. Lembre-se: prazo de 90 dias para retirada (até ${ninetyDaysLater.toLocaleDateString('pt-BR')}).`,
            'media'
          );
        }

        return updated;
      })
    );
  };

  const updatePieceEvaluation = (pieceId: string, aprovada: boolean, riscos?: string, obs?: string) => {
    setPieces((prev) =>
      prev.map((p) => {
        if (p.id !== pieceId) return p;
        return {
          ...p,
          avaliacaoTecnica: {
            aprovadaParaQueima: aprovada,
            riscosIdentificados: riscos,
            observacoes: obs
          }
        };
      })
    );
  };

  const deletePiece = (pieceId: string) => {
    setPieces((prev) => prev.filter((p) => p.id !== pieceId));
  };

  const registerAttendance = (
    studentId: string,
    status: AttendanceStatus,
    data: string,
    horario: string,
    observacao?: string
  ) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId,
      data,
      horario,
      status,
      observacao,
      registradoPor: 'Sah Pereira (Ollaria)',
      createdAt: new Date().toISOString()
    };

    setAttendance((prev) => [newRecord, ...prev]);

    // Recalculate student classes done and remaining
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        if (status === 'presente' || status === 'reposicao') {
          const newFeitas = s.aulasFeitas + 1;
          const newRestantes = Math.max(0, s.aulasTotaisPlano - newFeitas);
          return {
            ...s,
            aulasFeitas: newFeitas,
            aulasRestantes: newRestantes
          };
        }
        return s;
      })
    );
  };

  const deleteAttendance = (attendanceId: string) => {
    const rec = attendance.find((a) => a.id === attendanceId);
    if (rec && (rec.status === 'presente' || rec.status === 'reposicao')) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== rec.studentId) return s;
          const newFeitas = Math.max(0, s.aulasFeitas - 1);
          return {
            ...s,
            aulasFeitas: newFeitas,
            aulasRestantes: s.aulasTotaisPlano - newFeitas
          };
        })
      );
    }
    setAttendance((prev) => prev.filter((a) => a.id !== attendanceId));
  };

  const addTransaction = (txData: Omit<FinancialTransaction, 'id' | 'createdAt'>): FinancialTransaction => {
    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTransactions((prev) => [newTx, ...prev]);

    // If pending or overdue, optionally generate alert
    if (newTx.status !== 'pago') {
      createNotification(
        newTx.studentId,
        'cobranca',
        `Novo lançamento: ${newTx.descricao}`,
        `Valor: R$ ${newTx.valor.toFixed(2)}. Chave PIX: 61 996101254. Vencimento: ${new Date(newTx.dataVencimento).toLocaleDateString('pt-BR')}.`,
        'baixa'
      );
    }

    return newTx;
  };

  const markTransactionAsPaid = (txId: string, metodo: PaymentMethod) => {
    const today = new Date().toISOString().split('T')[0];
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'pago', metodoPagamento: metodo, dataPagamento: today } : t))
    );
  };

  const deleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  const acceptStudentTerms = (studentId: string, autorizacaoImagem: 'autorizo' | 'nao_autorizo' = 'autorizo') => {
    const timestamp = new Date().toISOString();
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        // Do not overwrite if already accepted - strictly immutable
        if (s.registrationData.aceitouTermoRegulamento && s.registrationData.dataAceiteTermoRegulamento) {
          return s;
        }
        return {
          ...s,
          registrationData: {
            ...s.registrationData,
            aceitouRegrasCondicoes: true,
            dataAceiteRegrasCondicoes: timestamp,
            aceitouTermoRegulamento: true,
            dataAceiteTermoRegulamento: timestamp,
            cienciaProcessoCeramico: true,
            cienciaMateriaisQueimas: true,
            veracidadeInformacoes: true,
            autorizacaoImagem: autorizacaoImagem || s.registrationData.autorizacaoImagem || 'autorizo'
          }
        };
      })
    );

    // Create persistent confirmation notification for student
    const student = students.find((s) => s.id === studentId);
    createNotification(
      studentId,
      'comunicado',
      'Termos e Regulamento Aceitos com Sucesso',
      `Olá ${student?.nome || 'aluno(a)'}! Você formalizou e assinou digitalmente o Regulamento Oficial da Ollaria Ateliê em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Uma via autenticada está permanentemente registrada na sua Ficha de Matrícula.`,
      'baixa'
    );
  };

  const requestProfileChange = (
    studentId: string,
    campo: string,
    valorAnterior: string,
    novoValor: string,
    motivo?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    const newReq: ProfileChangeRequest = {
      id: `req-${Date.now()}`,
      studentId,
      studentName: student ? student.nome : 'Aluno',
      campoAlterado: campo,
      valorAnterior,
      novoValor,
      motivo,
      status: 'pendente',
      dataSolicitacao: new Date().toISOString()
    };
    setChangeRequests((prev) => [newReq, ...prev]);

    // Notify admin
    createNotification(
      undefined,
      'aprovacao_pendente',
      `Solicitação de alteração cadastral: ${student?.nome}`,
      `O aluno solicitou alteração do campo "${campo}". Novo valor: "${novoValor}". Aprovação necessária.`,
      'media'
    );
  };

  const resolveProfileChange = (requestId: string, status: 'aprovado' | 'rejeitado') => {
    setChangeRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status,
          dataDecisao: new Date().toISOString()
        };
      })
    );

    const req = changeRequests.find((r) => r.id === requestId);
    if (!req) return;

    if (status === 'aprovado') {
      // Update student record accordingly
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== req.studentId) return s;

          const updatedReg = { ...s.registrationData };
          let updatedFields: Partial<Student> = {};

          if (req.campoAlterado.toLowerCase().includes('endereço')) {
            updatedReg.endereco = req.novoValor;
          } else if (req.campoAlterado.toLowerCase().includes('telefone') || req.campoAlterado.toLowerCase().includes('whatsapp')) {
            updatedReg.telefoneWhatsapp = req.novoValor;
            updatedFields.whatsapp = req.novoValor;
          } else if (req.campoAlterado.toLowerCase().includes('emergência')) {
            updatedReg.contatoEmergenciaNome = req.novoValor;
          } else if (req.campoAlterado.toLowerCase().includes('preferência')) {
            updatedReg.nomePreferencia = req.novoValor;
          } else if (req.campoAlterado.toLowerCase().includes('profissão')) {
            updatedReg.profissao = req.novoValor;
          } else if (req.campoAlterado.toLowerCase().includes('saúde')) {
            updatedReg.informacoesSaudeAtendimento = req.novoValor;
          }

          return {
            ...s,
            ...updatedFields,
            registrationData: updatedReg
          };
        })
      );

      createNotification(
        req.studentId,
        'aviso_aula',
        'Sua alteração cadastral foi aprovada!',
        `A administração do ateliê aprovou sua alteração em "${req.campoAlterado}".`,
        'baixa'
      );
    } else {
      createNotification(
        req.studentId,
        'aviso_aula',
        'Solicitação de alteração cadastral não aceita',
        `A alteração de "${req.campoAlterado}" não foi aprovada pelo ateliê. Entre em contato com a equipe.`,
        'baixa'
      );
    }
  };

  const createNotification = (
    studentId: string | undefined,
    tipo: SystemNotification['tipo'],
    titulo: string,
    mensagem: string,
    urgencia: 'baixa' | 'media' | 'alta' = 'media'
  ) => {
    const student = studentId ? students.find((s) => s.id === studentId) : null;
    let whatsappLink: string | undefined;

    if (student && student.whatsapp) {
      const cleanPhone = student.whatsapp.replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      const textEncoded = encodeURIComponent(`*Ollaria Ateliê - ${titulo}*\n\nOlá, ${student.registrationData.nomePreferencia || student.nome}!\n${mensagem}\n\n_Ateliê Ollaria Cerâmica - Brasília DF_`);
      whatsappLink = `https://wa.me/${fullPhone}?text=${textEncoded}`;
    }

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      studentId,
      tipo,
      titulo,
      mensagem,
      urgencia,
      lida: false,
      dataCriacao: new Date().toISOString(),
      whatsappLink
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, lida: true } : n))
    );
  };

  const generateMonthlyReport = (mesAno: string): MonthlyReportData => {
    // Ex: "2026-09"
    const [year, month] = mesAno.split('-');
    
    // Total active students
    const activeStudents = students.filter((s) => s.status === 'ativo').length;
    
    // New registrations in month
    const newStudents = students.filter((s) => s.dataMatricula.startsWith(mesAno)).length;

    // Transactions in month
    const monthTx = transactions.filter((t) => {
      const date = t.dataPagamento || t.dataVencimento;
      return date.startsWith(mesAno);
    });

    const receitaMensalidades = monthTx
      .filter((t) => t.categoria === 'mensalidade' && t.status === 'pago')
      .reduce((acc, cur) => acc + cur.valor, 0);

    const receitaArgilasEQueimas = monthTx
      .filter((t) => (t.categoria === 'argila' || t.categoria === 'queima' || t.categoria === 'ferramentas') && t.status === 'pago')
      .reduce((acc, cur) => acc + cur.valor, 0);

    const receitaTotal = receitaMensalidades + receitaArgilasEQueimas;

    const totalPendente = monthTx
      .filter((t) => t.status !== 'pago')
      .reduce((acc, cur) => acc + cur.valor, 0);

    // Attendance in month
    const monthAtt = attendance.filter((a) => a.data.startsWith(mesAno));
    const totalAulasRealizadas = monthAtt.filter((a) => a.status === 'presente' || a.status === 'reposicao').length;
    const totalAulasAgendadasOuFaltas = monthAtt.length;
    const taxaPresencaPercentual = totalAulasAgendadasOuFaltas > 0
      ? Math.round((totalAulasRealizadas / totalAulasAgendadasOuFaltas) * 100)
      : 100;

    // Pieces
    const pecasQueimadasTotal = pieces.filter(
      (p) => (p.etapa === 'queimada_pronta' || p.etapa === 'retirada_entregue') && (p.dataQueimaConcluida ? p.dataQueimaConcluida.startsWith(mesAno) : true)
    ).length;

    const pecasAguardandoQueima = pieces.filter(
      (p) => p.etapa === 'aguardando_biscoito' || p.etapa === 'aguardando_esmalte' || p.etapa === 'modelagem_secagem'
    ).length;

    const pecasRetiradas = pieces.filter((p) => p.etapa === 'retirada_entregue').length;

    // Check pieces exceeding 60 days
    const today = new Date();
    const pecasAlerta90Dias = pieces.filter((p) => {
      if (p.etapa !== 'queimada_pronta' || !p.prazoLimiteRetirada) return false;
      const limit = new Date(p.prazoLimiteRetirada);
      const diffDays = Math.ceil((limit.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // 30 days or less remaining of the 90 days
    }).length;

    return {
      mesAno,
      totalAlunosAtivos: activeStudents,
      novasMatriculas: newStudents,
      receitaTotal,
      receitaMensalidades,
      receitaArgilasEQueimas,
      totalPendente,
      totalAulasRealizadas,
      taxaPresencaPercentual,
      pecasQueimadasTotal,
      pecasAguardandoQueima,
      pecasRetiradas,
      pecasAlerta90Dias
    };
  };

  const importStudents = (importedList: Student[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setStudents(importedList);
    } else {
      // Merge mode: update existing students by email or CPF, append new ones
      setStudents((prev) => {
        const updated = [...prev];
        for (const imp of importedList) {
          const impEmail = imp.email.trim().toLowerCase();
          const impCpf = imp.registrationData?.cpfOuPassaporte?.replace(/\D/g, '') || '';
          
          const existingIdx = updated.findIndex((s) => {
            const sEmail = s.email.trim().toLowerCase();
            const sCpf = s.registrationData?.cpfOuPassaporte?.replace(/\D/g, '') || '';
            return sEmail === impEmail || (impCpf.length >= 8 && sCpf === impCpf);
          });

          if (existingIdx !== -1) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              nome: imp.nome || updated[existingIdx].nome,
              whatsapp: imp.whatsapp || updated[existingIdx].whatsapp,
              turma: imp.turma || updated[existingIdx].turma,
              modalidade: imp.modalidade || updated[existingIdx].modalidade,
              pin: updated[existingIdx].pin || imp.pin,
              accessCode: updated[existingIdx].accessCode || imp.accessCode,
              registrationData: {
                ...updated[existingIdx].registrationData,
                ...imp.registrationData,
                aceitouTermoRegulamento:
                  updated[existingIdx].registrationData.aceitouTermoRegulamento ||
                  imp.registrationData.aceitouTermoRegulamento,
                dataAceiteTermoRegulamento:
                  updated[existingIdx].registrationData.dataAceiteTermoRegulamento ||
                  imp.registrationData.dataAceiteTermoRegulamento
              }
            };
          } else {
            updated.push(imp);
          }
        }
        return updated;
      });
    }

    createNotification(
      undefined,
      'comunicado',
      'Planilha de Alunos Sincronizada',
      `${importedList.length} cadastros de alunos foram processados e integrados com sucesso.`,
      'baixa'
    );
  };

  const exportStudentsCSV = () => {
    exportStudentsToCSV(students);
  };

  const exportFullBackupJSON = () => {
    exportBackupJSONHelper({
      students,
      pieces,
      attendance,
      transactions,
      notifications,
      changeRequests
    });
  };

  // NOVO MÓDULO: Funções Operacionais de Serviços, Queimas, Horas, Materiais e Histórico
  const addAuditLog = (entry: Omit<SystemAuditLog, 'id' | 'data'>) => {
    const newLog: SystemAuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      data: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const toggleUserService = (userId: string, service: ServiceType) => {
    if (role !== 'admin' && !isAdminPreview) return;
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== userId) return st;
        const currentServices = st.servicosAtivos || ['aluno_regular'];
        const hasService = currentServices.includes(service);
        let updatedServices: ServiceType[];
        if (hasService) {
          if (currentServices.length === 1) return st;
          updatedServices = currentServices.filter((s) => s !== service);
        } else {
          updatedServices = [...currentServices, service];
        }

        let extraUpdates: Partial<Student> = {};
        if (!hasService) {
          if (service === 'cliente_consultoria' && !st.consultoriaData) {
            extraUpdates.consultoriaData = { horasContratadas: 10, horasUtilizadas: 0, horasAgendadas: 0, valorHora: 160 };
          }
          if (service === 'artista_coworking' && !st.coworkingData) {
            extraUpdates.coworkingData = { horasContratadas: 20, horasUtilizadas: 0, horasAgendadas: 0, periodoContratado: 'Mês corrente' };
          }
          if (service === 'aluno_curso' && !st.cursoData) {
            extraUpdates.cursoData = {
              nomeCurso: 'Curso de Cerâmica',
              dataInicio: new Date().toISOString().split('T')[0],
              dataTermino: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              quantidadeEncontros: 8,
              encontrosRealizados: 0,
              encontrosRestantes: 8,
              statusCiclo: 'inicio'
            };
          }
          if (service === 'professor_visitante' && !st.professorData) {
            extraUpdates.professorData = {
              tipoAcordo: 'percentual_turma',
              nomeTurma: 'Turma Convidada',
              quantidadeAlunos: 6,
              valorTurma: 2760,
              percentualAcordado: 40,
              valorDevidoProfessor: 1104,
              valorPagoProfessor: 0
            };
          }
        }

        addAuditLog({
          userId: st.id,
          userName: st.nome,
          modulo: 'servico',
          acao: hasService ? 'Remoção de Serviço' : 'Adição de Serviço',
          infoAnterior: currentServices.join(', '),
          novaInfo: updatedServices.join(', '),
          responsavel: 'Coordenação (Sah Pereira)'
        });

        return { ...st, ...extraUpdates, servicosAtivos: updatedServices };
      })
    );
  };

  const updateUserServicesData = (userId: string, updates: Partial<Student>) => {
    if (role !== 'admin' && !isAdminPreview) return;
    setStudents((prev) =>
      prev.map((st) => (st.id === userId ? { ...st, ...updates } : st))
    );
    addAuditLog({
      userId,
      modulo: 'servico',
      acao: 'Atualização de Dados do Serviço',
      responsavel: 'Coordenação (Sah Pereira)'
    });
  };

  const addFiringOrder = (orderData: Omit<FiringOrder, 'id' | 'createdAt'>): FiringOrder => {
    if (role !== 'admin' && !isAdminPreview) throw new Error('Apenas coordenação');
    const newOrder: FiringOrder = {
      ...orderData,
      id: `fire-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setFirings((prev) => [newOrder, ...prev]);

    if (orderData.valorQueima > 0) {
      addTransaction({
        studentId: orderData.userId,
        descricao: `Queima: ${orderData.identificacao} (${orderData.tipoQueima})`,
        categoria: 'queima',
        valor: orderData.valorQueima,
        status: orderData.valorPago >= orderData.valorQueima ? 'pago' : 'pendente',
        metodoPagamento: orderData.formaPagamento,
        dataVencimento: orderData.dataPrevista || new Date().toISOString().split('T')[0]
      });
    }

    addAuditLog({
      userId: orderData.userId,
      modulo: 'queima',
      acao: 'Entrada de Lote de Queima',
      novaInfo: `${orderData.identificacao} (${orderData.temperatura}, ${orderData.quantidadePecas} peças) - Status: ${orderData.status}`,
      responsavel: 'Coordenação (Sah Pereira)'
    });
    return newOrder;
  };

  const updateFiringOrderStatus = (orderId: string, status: FiringStatus, observacoes?: string) => {
    if (role !== 'admin' && !isAdminPreview) return;
    setFirings((prev) =>
      prev.map((f) => {
        if (f.id !== orderId) return f;
        const prevStatus = f.status;
        const isFinished = status === 'queima_concluida' || status === 'aguardando_retirada' || status === 'retirada';
        const updated = {
          ...f,
          status,
          observacoes: observacoes !== undefined ? observacoes : f.observacoes,
          dataRealizada: isFinished && !f.dataRealizada ? new Date().toISOString().split('T')[0] : f.dataRealizada
        };
        addAuditLog({
          userId: f.userId,
          modulo: 'queima',
          acao: 'Mudança de Status de Queima',
          infoAnterior: prevStatus,
          novaInfo: status,
          responsavel: 'Coordenação (Sah Pereira)'
        });
        if (status === 'queima_concluida' || status === 'aguardando_retirada') {
          createNotification(
            f.userId,
            'retirada_peca',
            `Queima Concluída: ${f.identificacao}`,
            `Sua queima de ${f.quantidadePecas} peças (${f.temperatura}) está pronta para retirada no ateliê.`,
            'media'
          );
        }
        return updated;
      })
    );
  };

  const deleteFiringOrder = (orderId: string) => {
    if (role !== 'admin' && !isAdminPreview) return;
    setFirings((prev) => prev.filter((f) => f.id !== orderId));
  };

  const addConsultingAppointment = (appData: Omit<ConsultingAppointment, 'id' | 'createdAt'>): ConsultingAppointment => {
    if (role !== 'admin' && !isAdminPreview) throw new Error('Apenas coordenação');
    const newApp: ConsultingAppointment = {
      ...appData,
      id: `consult-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setConsultingAppointments((prev) => [newApp, ...prev]);

    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== appData.userId || !st.consultoriaData) return st;
        const data = st.consultoriaData;
        const agendadas = appData.status === 'agendado' ? data.horasAgendadas + appData.duracaoHoras : data.horasAgendadas;
        const utilizadas = appData.status === 'realizado' ? data.horasUtilizadas + appData.duracaoHoras : data.horasUtilizadas;
        return { ...st, consultoriaData: { ...data, horasAgendadas: agendadas, horasUtilizadas: utilizadas } };
      })
    );

    addAuditLog({
      userId: appData.userId,
      modulo: 'horas',
      acao: 'Atendimento de Consultoria',
      novaInfo: `${appData.data} às ${appData.horario} (${appData.duracaoHoras}h) - ${appData.temaObservacoes}`,
      responsavel: 'Coordenação (Sah Pereira)'
    });
    return newApp;
  };

  const updateConsultingAppointmentStatus = (appId: string, status: 'agendado' | 'realizado' | 'cancelado') => {
    if (role !== 'admin' && !isAdminPreview) return;
    setConsultingAppointments((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  };

  const addCoworkingBooking = (bookingData: Omit<CoworkingBooking, 'id' | 'solicitadoEm'>): CoworkingBooking => {
    const newBooking: CoworkingBooking = {
      ...bookingData,
      id: `cowork-${Date.now()}`,
      status: role === 'admin' ? bookingData.status : 'solicitado',
      solicitadoEm: new Date().toISOString()
    };
    setCoworkingBookings((prev) => [newBooking, ...prev]);

    addAuditLog({
      userId: bookingData.userId,
      modulo: 'agendamento',
      acao: 'Agendamento Coworking',
      novaInfo: `${bookingData.data} (${bookingData.horario}) - ${bookingData.horas}h`,
      responsavel: role === 'admin' ? 'Coordenação (Sah Pereira)' : 'Artista Coworking'
    });
    return newBooking;
  };

  const updateCoworkingBookingStatus = (bookingId: string, status: 'solicitado' | 'confirmado' | 'realizado' | 'cancelado') => {
    if (role !== 'admin' && !isAdminPreview) return;
    setCoworkingBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status, decididoEm: new Date().toISOString() } : b))
    );
    addAuditLog({
      modulo: 'agendamento',
      acao: 'Status de Agendamento Coworking',
      novaInfo: `Agendamento ${bookingId} marcado como ${status}`,
      responsavel: 'Coordenação (Sah Pereira)'
    });
  };

  const registerMaterialUsage = (usageData: Omit<MaterialUsage, 'id' | 'createdAt' | 'valorTotal'>): MaterialUsage => {
    if (role !== 'admin' && !isAdminPreview) throw new Error('Apenas coordenação');
    const valorTotal = Number((usageData.quantidade * usageData.valorUnitario).toFixed(2));
    const newUsage: MaterialUsage = {
      ...usageData,
      valorTotal,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setMaterialsUsage((prev) => [newUsage, ...prev]);

    if (usageData.formaCompensacao === 'cobrar' && valorTotal > 0) {
      addTransaction({
        studentId: usageData.userId,
        descricao: `Material: ${usageData.material} (${usageData.quantidade} ${usageData.unidade})`,
        categoria: 'argila',
        valor: valorTotal,
        status: 'pendente',
        dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    addAuditLog({
      userId: usageData.userId,
      userName: usageData.userName,
      modulo: 'material',
      acao: 'Registro de Material Utilizado',
      novaInfo: `${usageData.material} (${usageData.quantidade} ${usageData.unidade}) - R$ ${valorTotal.toFixed(2)} [Forma: ${usageData.formaCompensacao}]`,
      responsavel: 'Coordenação (Sah Pereira)'
    });
    return newUsage;
  };

  const deleteMaterialUsage = (usageId: string) => {
    if (role !== 'admin' && !isAdminPreview) return;
    setMaterialsUsage((prev) => prev.filter((m) => m.id !== usageId));
  };

  const resetDatabase = () => {
    localStorage.clear();
    setStudents(INITIAL_STUDENTS);
    setPieces(INITIAL_PIECES);
    setAttendance(INITIAL_ATTENDANCE);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChangeRequests(INITIAL_CHANGE_REQUESTS);
    setFirings(INITIAL_FIRINGS);
    setConsultingAppointments(INITIAL_CONSULTING_APPOINTMENTS);
    setCoworkingBookings(INITIAL_COWORKING_BOOKINGS);
    setMaterialsUsage(INITIAL_MATERIALS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentStudentId('student-1');
  };

  return (
    <StudioContext.Provider
      value={{
        role,
        currentStudent,
        students,
        pieces,
        attendance,
        transactions,
        notifications,
        changeRequests,
        isAdminPreview,
        firings,
        consultingAppointments,
        coworkingBookings,
        materialsUsage,
        auditLogs,
        toggleUserService,
        updateUserServicesData,
        addFiringOrder,
        updateFiringOrderStatus,
        deleteFiringOrder,
        addConsultingAppointment,
        updateConsultingAppointmentStatus,
        addCoworkingBooking,
        updateCoworkingBookingStatus,
        registerMaterialUsage,
        deleteMaterialUsage,
        addAuditLog,
        setRole,
        setCurrentStudentById,
        selectStudent,
        loginAsStudent,
        loginAsAdmin,
        updateAdminPassword,
        logout,
        createStudentFromForm,
        updateStudent,
        deleteStudent,
        generateNewAccessKey,
        importStudents,
        exportStudentsCSV,
        exportFullBackupJSON,
        addPiece,
        updatePieceStage,
        updatePieceEvaluation,
        deletePiece,
        registerAttendance,
        deleteAttendance,
        addTransaction,
        markTransactionAsPaid,
        deleteTransaction,
        acceptStudentTerms,
        requestProfileChange,
        resolveProfileChange,
        createNotification,
        markNotificationAsRead,
        generateMonthlyReport,
        resetDatabase
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
