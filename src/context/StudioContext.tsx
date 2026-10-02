import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  PotteryPiece,
  AttendanceRecord,
  ClassReplacement,
  ClassAttendanceStatus,
  ClassClassification,
  ReplacementDecision,
  ReplacementStatus,
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
  SystemAuditLog,
  normalizeAttendanceStatus,
  normalizeClassClassification,
  getMemberMonthlyClassSummary
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_PIECES,
  INITIAL_ATTENDANCE,
  INITIAL_REPLACEMENTS,
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
  isServerSynced: boolean;
  lastSavedTime: string;

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
  loginAsAdmin: (password?: string) => Promise<{ success: boolean; message?: string }>;
  updateAdminPassword: (newPass: string, currentPass?: string) => void;
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

  // Attendance, Classes & Makeups (CHAMADA & REGISTRO DE AULAS)
  classReplacements: ClassReplacement[];
  registerAttendance: (studentId: string, status: AttendanceStatus, data: string, horario: string, observacao?: string) => void;
  saveClassAttendance: (
    record: AttendanceRecord,
    options?: {
      createTransaction?: boolean;
      valorCobranca?: number;
      descricaoCobranca?: string;
      replacementIdToUse?: string;
      minutosUtilizados?: number;
    }
  ) => void;
  deleteAttendance: (attendanceId: string) => void;
  addClassReplacement: (rep: Omit<ClassReplacement, 'id' | 'createdAt'>) => ClassReplacement;
  updateClassReplacement: (id: string, updates: Partial<ClassReplacement>) => void;
  deleteClassReplacement: (id: string) => void;
  scheduleClassReplacement: (replacementId: string, dataAgendada: string, horarioAgendado: string, turma?: string) => void;
  markReplacementCompleted: (replacementId: string, aulaRealizadaId?: string) => void;
  dismissClassReplacement: (replacementId: string, motivo?: string) => void;
  cancelClassReplacement: (replacementId: string, motivo?: string) => void;

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

  const [classReplacements, setClassReplacements] = useState<ClassReplacement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}classReplacements`);
      return saved ? JSON.parse(saved) : INITIAL_REPLACEMENTS;
    } catch {
      return INITIAL_REPLACEMENTS;
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
  const [isServerSynced, setIsServerSynced] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => new Date().toLocaleTimeString('pt-BR'));

  // Request persistent browser storage to avoid automatic eviction
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {
        // ignore if browser disallows
      });
    }
  }, []);

  // Sync with Server Database on mount: loads all registrations stored on the server disk
  useEffect(() => {
    let isMounted = true;

    fetch('/api/studio-data')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!isMounted || !payload || !payload.success || !payload.data) return;
        const serverData = payload.data;

        if (Array.isArray(serverData.students) && serverData.students.length > 0) {
          setStudents((localStudents) => {
            // Merge server and local students so any student created locally is preserved
            const serverMap = new Map<string, Student>();
            serverData.students.forEach((st: Student) => serverMap.set(st.id, st));

            // Include local students not yet on server
            localStudents.forEach((localSt) => {
              if (!serverMap.has(localSt.id)) {
                serverMap.set(localSt.id, localSt);
              }
            });

            return Array.from(serverMap.values());
          });
        }

        if (Array.isArray(serverData.pieces) && serverData.pieces.length > 0) {
          setPieces(serverData.pieces);
        }
        if (Array.isArray(serverData.attendance)) {
          setAttendance(serverData.attendance);
        }
        if (Array.isArray(serverData.classReplacements)) {
          setClassReplacements(serverData.classReplacements);
        }
        if (Array.isArray(serverData.transactions)) {
          setTransactions(serverData.transactions);
        }
        if (Array.isArray(serverData.notifications)) {
          setNotifications(serverData.notifications);
        }
        if (Array.isArray(serverData.changeRequests)) {
          setChangeRequests(serverData.changeRequests);
        }
        if (Array.isArray(serverData.firings)) {
          setFirings(serverData.firings);
        }
        if (Array.isArray(serverData.consultingAppointments)) {
          setConsultingAppointments(serverData.consultingAppointments);
        }
        if (Array.isArray(serverData.coworkingBookings)) {
          setCoworkingBookings(serverData.coworkingBookings);
        }
        if (Array.isArray(serverData.materialsUsage)) {
          setMaterialsUsage(serverData.materialsUsage);
        }
        if (Array.isArray(serverData.auditLogs)) {
          setAuditLogs(serverData.auditLogs);
        }

        setIsServerSynced(true);
        setLastSavedTime(new Date().toLocaleTimeString('pt-BR'));
      })
      .catch((err) => {
        console.warn('[OLLARIA] Servidor local indisponível, usando armazenamento do navegador:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
    localStorage.setItem(`${STORAGE_KEY_PREFIX}classReplacements`, JSON.stringify(classReplacements));
  }, [classReplacements]);

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

  // Synchronize state changes to Server File Database automatically with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/studio-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students,
          pieces,
          attendance,
          classReplacements,
          transactions,
          notifications,
          changeRequests,
          firings,
          consultingAppointments,
          coworkingBookings,
          materialsUsage,
          auditLogs
        })
      })
        .then((res) => {
          if (res.ok) {
            setIsServerSynced(true);
            setLastSavedTime(new Date().toLocaleTimeString('pt-BR'));
          }
        })
        .catch(() => {
          // ignore background sync network error
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    students,
    pieces,
    attendance,
    classReplacements,
    transactions,
    notifications,
    changeRequests,
    firings,
    consultingAppointments,
    coworkingBookings,
    materialsUsage,
    auditLogs
  ]);

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
        message: 'Membr@ não encontrado. Selecione seu nome na lista ou confira o e-mail informado.'
      };
    }

    // Verify PIN if set
    const inputPin = (pin || '').trim();
    const studentPin = (student.pin || '').trim();

    if (studentPin) {
      if (!inputPin) {
        return {
          success: false,
          message: 'Por favor, digite seu PIN de acesso individual.'
        };
      }
      if (inputPin !== studentPin) {
        return {
          success: false,
          message: 'PIN incorreto para este membr@. Verifique seus dígitos de acesso.'
        };
      }
    }

    setCurrentStudentId(student.id);
    setRole('student');
    setIsAdminPreview(false);
    return { success: true };
  };

  const loginAsAdmin = async (password?: string): Promise<{ success: boolean; message?: string }> => {
    const inputPass = (password || '').trim();
    if (!inputPass) {
      return {
        success: false,
        message: 'Por favor, informe a senha de acesso da coordenação.'
      };
    }

    try {
      const resp = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPass })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setRole('admin');
        setIsAdminPreview(false);
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}role`, 'admin');
        } catch {
          // ignore
        }
        return { success: true };
      }
      return {
        success: false,
        message: data.message || 'Senha administrativa incorreta. Verifique os dados digitados.'
      };
    } catch {
      // In case the network is temporarily offline or server fallback
      let savedPass = '';
      try {
        savedPass = localStorage.getItem(`${STORAGE_KEY_PREFIX}admin_password`) || '';
      } catch {
        // ignore
      }
      if (savedPass && inputPass === savedPass) {
        setRole('admin');
        setIsAdminPreview(false);
        return { success: true };
      }
      return {
        success: false,
        message: 'Senha administrativa incorreta. Verifique os dados digitados.'
      };
    }
  };

  const updateAdminPassword = async (newPass: string, currentPass?: string) => {
    if (newPass.trim()) {
      try {
        await fetch('/api/auth/update-admin-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword: newPass.trim(), currentPassword: currentPass || '' })
        });
      } catch {
        // ignore
      }
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}admin_password`, newPass.trim());
      } catch {
        // ignore
      }
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

    // Aluno Regular: contratação exclusivamente MENSAL e CONTÍNUA (sem data de término obrigatória)
    const totalAulas = 4;
    const valorPlano = formData.formaPagamentoPretendida === 'pix' ? 460 : 506;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const newStudent: Student = {
      id: newId,
      accessCode,
      pin,
      nome: formData.nomeCompleto,
      email: formData.email,
      whatsapp: formData.telefoneWhatsapp,
      turma: formData.turmaDesejada,
      modalidade: 'mensal',
      valorPlano,
      dataInicioPlano: todayStr,
      // Aluno Regular não possui data de término obrigatória; é contínuo
      dataFimPlano: undefined,
      status: 'ativo',
      aulasTotaisPlano: totalAulas,
      aulasFeitas: 0,
      aulasRestantes: totalAulas,
      trancamentosUtilizadosDias: 0,
      registrationData: {
        ...formData,
        modalidade: 'mensal'
      },
      dataMatricula: todayStr,
      servicosAtivos: ['aluno_regular'],
      membresias: [
        {
          id: `mem-${Date.now()}`,
          tipo: 'aluno_regular',
          status: 'ativa',
          dataInicio: todayStr,
          modalidadeContratacao: 'mensal',
          observacoes: 'Matrícula contínua com renovação e cobranças mensais automáticas.'
        }
      ]
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Create initial invoice transaction
    const initialTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      studentId: newId,
      descricao: `Membresia Ollaria – Aluno Regular (Mensalidade Contínua - 4 aulas/mês)`,
      categoria: 'mensalidade',
      valor: valorPlano,
      status: 'pendente',
      dataVencimento: todayStr,
      metodoPagamento: formData.formaPagamentoPretendida,
      observacoes: `Primeira mensalidade contínua via ${formData.formaPagamentoPretendida.toUpperCase()} (Chave PIX: 61 996101254).`,
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

  const recalculateStudentAttendanceBalance = (studentId: string, currentAttList: AttendanceRecord[]) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        // Conta aulas da mensalidade realizadas (não conta faltas, reposições nem extras)
        const realizadasMensalidade = currentAttList.filter(
          (a) =>
            a.studentId === studentId &&
            normalizeAttendanceStatus(a.status) === 'Realizada' &&
            normalizeClassClassification(a) === 'Mensalidade' &&
            !a.naoContabilizarMensalidade
        );
        const newFeitas = realizadasMensalidade.length;
        const newRestantes = Math.max(0, s.aulasTotaisPlano - newFeitas);
        return {
          ...s,
          aulasFeitas: newFeitas,
          aulasRestantes: newRestantes
        };
      })
    );
  };

  // Salva ou edita uma aula (REGRA CRÍTICA: se ID já existe, atualiza sem criar novo registro)
  const saveClassAttendance = (
    record: AttendanceRecord,
    options?: {
      createTransaction?: boolean;
      valorCobranca?: number;
      descricaoCobranca?: string;
      replacementIdToUse?: string;
      minutosUtilizados?: number;
    }
  ) => {
    const isEdit = attendance.some((a) => a.id === record.id);
    const normStatus = normalizeAttendanceStatus(record.status);
    const normClassif = normalizeClassClassification(record);

    // Se for falta da Ollaria, reposição é concedida automaticamente (Seção 6)
    let decisao = record.decisaoReposicao;
    if (normStatus === 'Falta da Ollaria') {
      decisao = 'Reposição concedida';
    } else if (!decisao) {
      if (normStatus === 'Realizada') {
        decisao = 'Sem reposição';
      } else {
        decisao = 'Reposição pendente de decisão';
      }
    }

    let reposicaoGeradaId = record.reposicaoId;

    // Regras de geração de reposição
    const isTimeOnly = (record.tempoAReporMinutos !== undefined && record.tempoAReporMinutos > 0 && normStatus === 'Realizada');
    const shouldGenerateReplacement =
      decisao === 'Reposição concedida' &&
      (normStatus === 'Falta da Ollaria' || normStatus === 'Falta do membr@' || normStatus === 'Cancelada' || isTimeOnly);

    if (shouldGenerateReplacement) {
      // Verificar se já existe reposição associada
      const existingRep = classReplacements.find(
        (r) => r.aulaOrigemId === record.id || (reposicaoGeradaId && r.id === reposicaoGeradaId)
      );

      const durPrev = record.duracaoPrevistaMinutos || 150;
      const durRepor = isTimeOnly ? record.tempoAReporMinutos! : durPrev;

      if (!existingRep) {
        const newRep: ClassReplacement = {
          id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: record.studentId,
          aulaOrigemId: record.id,
          dataOrigem: record.data,
          motivo:
            record.motivoAusenciaAlteracao ||
            (normStatus === 'Falta da Ollaria'
              ? 'Falta da Ollaria (automática)'
              : normStatus === 'Falta do membr@'
              ? 'Falta do membr@ com reposição concedida'
              : isTimeOnly
              ? `Início tardio / atraso (${durRepor} min a repor)`
              : 'Aula cancelada com reposição concedida'),
          responsabilidade: record.responsabilidadeAusencia || (normStatus === 'Falta da Ollaria' ? 'Ollaria' : 'Membr@'),
          tipo: isTimeOnly ? 'tempo_minutos' : 'aula_inteira',
          quantidadeAulas: isTimeOnly ? 0 : 1,
          minutosOriginal: durRepor,
          minutosRestantes: durRepor,
          status: 'Pendente',
          observacoes: record.observacao,
          createdAt: new Date().toISOString()
        };
        reposicaoGeradaId = newRep.id;
        setClassReplacements((prev) => [newRep, ...prev]);
      } else {
        // Atualiza a reposição existente vinculada à aula
        setClassReplacements((prev) =>
          prev.map((r) => {
            if (r.id !== existingRep.id) return r;
            return {
              ...r,
              dataOrigem: record.data,
              motivo: record.motivoAusenciaAlteracao || r.motivo,
              responsabilidade: record.responsabilidadeAusencia || r.responsabilidade,
              observacoes: record.observacao || r.observacoes,
              minutosOriginal: durRepor,
              updatedAt: new Date().toISOString()
            };
          })
        );
      }
    }

    // Se for uma aula de reposição que foi realizada, atualiza a reposição utilizada
    const repToUseId = options?.replacementIdToUse || record.reposicaoUtilizadaId;
    if (normClassif === 'Reposição' && repToUseId) {
      setClassReplacements((prev) =>
        prev.map((r) => {
          if (r.id !== repToUseId) return r;
          if (normStatus === 'Realizada') {
            if (r.tipo === 'tempo_minutos' && options?.minutosUtilizados) {
              const rest = Math.max(0, r.minutosRestantes - options.minutosUtilizados);
              return {
                ...r,
                minutosRestantes: rest,
                status: rest === 0 ? 'Realizada' : 'Pendente',
                aulaAgendadaId: record.id,
                updatedAt: new Date().toISOString()
              };
            }
            return {
              ...r,
              minutosRestantes: 0,
              status: 'Realizada',
              aulaAgendadaId: record.id,
              updatedAt: new Date().toISOString()
            };
          } else if (normStatus === 'Cancelada') {
            return {
              ...r,
              status: 'Pendente',
              aulaAgendadaId: undefined,
              updatedAt: new Date().toISOString()
            };
          }
          return r;
        })
      );
    }

    // Cobrança associada
    let transacaoId = record.transacaoId;
    if (options?.createTransaction && options.valorCobranca && options.valorCobranca > 0) {
      const tx = addTransaction({
        studentId: record.studentId,
        descricao: options.descricaoCobranca || `Cobrança aula ${normClassif} (${record.data})`,
        categoria: normClassif === 'Extra' ? 'curso' : 'outro',
        valor: options.valorCobranca,
        status: record.statusCobranca || 'pendente',
        dataVencimento: record.data,
        metodoPagamento: 'pix',
        observacoes: `Gerado a partir da aula registrada em ${record.data}`
      });
      transacaoId = tx.id;
    }

    const finalRecord: AttendanceRecord = {
      ...record,
      id: record.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: normStatus,
      classificacao: normClassif,
      decisaoReposicao: decisao,
      reposicaoId: reposicaoGeradaId,
      reposicaoUtilizadaId: repToUseId,
      transacaoId,
      temCobranca: record.temCobranca || (!!options?.createTransaction && (options?.valorCobranca ?? 0) > 0),
      valorCobranca: options?.valorCobranca ?? record.valorCobranca,
      descricaoCobranca: options?.descricaoCobranca ?? record.descricaoCobranca,
      statusCobranca: record.statusCobranca || 'pendente',
      registradoPor: record.registradoPor || 'Samira Rebello (Ollaria)',
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let nextAttList: AttendanceRecord[];
    if (isEdit) {
      nextAttList = attendance.map((a) => (a.id === finalRecord.id ? finalRecord : a));
    } else {
      nextAttList = [finalRecord, ...attendance];
    }

    setAttendance(nextAttList);
    recalculateStudentAttendanceBalance(record.studentId, nextAttList);
  };

  const registerAttendance = (
    studentId: string,
    status: AttendanceStatus,
    data: string,
    horario: string,
    observacao?: string
  ) => {
    const normStatus = normalizeAttendanceStatus(status);
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      data,
      horario,
      horarioPrevisto: horario,
      horarioRealizado: normStatus === 'Realizada' ? horario : undefined,
      duracaoPrevistaMinutos: 150,
      duracaoRealizadaMinutos: normStatus === 'Realizada' ? 150 : 0,
      status: normStatus,
      classificacao: status === 'reposicao' ? 'Reposição' : 'Mensalidade',
      decisaoReposicao:
        normStatus === 'Falta da Ollaria'
          ? 'Reposição concedida'
          : normStatus === 'Realizada'
          ? 'Sem reposição'
          : 'Reposição pendente de decisão',
      observacao,
      registradoPor: 'Samira Rebello (Ollaria)',
      createdAt: new Date().toISOString()
    };
    saveClassAttendance(newRecord);
  };

  const deleteAttendance = (attendanceId: string) => {
    const rec = attendance.find((a) => a.id === attendanceId);
    const nextList = attendance.filter((a) => a.id !== attendanceId);
    setAttendance(nextList);

    if (rec) {
      // Se havia reposição gerada a partir desta aula e ainda estava pendente, remove ou cancela
      if (rec.reposicaoId) {
        setClassReplacements((prev) =>
          prev.filter((r) => r.id !== rec.reposicaoId || r.status !== 'Pendente')
        );
      }
      recalculateStudentAttendanceBalance(rec.studentId, nextList);
    }
  };

  // Funções de Gerenciamento de Reposições
  const addClassReplacement = (repData: Omit<ClassReplacement, 'id' | 'createdAt'>): ClassReplacement => {
    const newRep: ClassReplacement = {
      ...repData,
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setClassReplacements((prev) => [newRep, ...prev]);
    return newRep;
  };

  const updateClassReplacement = (id: string, updates: Partial<ClassReplacement>) => {
    setClassReplacements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  };

  const deleteClassReplacement = (id: string) => {
    setClassReplacements((prev) => prev.filter((r) => r.id !== id));
  };

  const scheduleClassReplacement = (
    replacementId: string,
    dataAgendada: string,
    horarioAgendado: string,
    turma?: string
  ) => {
    const rep = classReplacements.find((r) => r.id === replacementId);
    if (!rep) return;

    // Reposição agendada NÃO é reposição realizada (Seção 12)
    // Cria uma aula com status 'Realizada' no futuro ou pendente, ou atualiza a reposição com status 'Agendada'
    const newClassId = `att-sched-${Date.now()}`;
    const scheduledClass: AttendanceRecord = {
      id: newClassId,
      studentId: rep.studentId,
      data: dataAgendada,
      horario: horarioAgendado,
      horarioPrevisto: horarioAgendado,
      turma: turma,
      duracaoPrevistaMinutos: rep.minutosOriginal || 150,
      duracaoRealizadaMinutos: 0,
      status: 'Realizada',
      classificacao: 'Reposição',
      reposicaoUtilizadaId: replacementId,
      observacao: `Reposição agendada para ${dataAgendada}. Origem: ${rep.motivo}`,
      registradoPor: 'Samira Rebello (Ollaria)',
      createdAt: new Date().toISOString()
    };

    setClassReplacements((prev) =>
      prev.map((r) =>
        r.id === replacementId
          ? {
              ...r,
              status: 'Agendada',
              dataAgendada,
              horarioAgendado,
              turmaAgendada: turma,
              aulaAgendadaId: newClassId,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    setAttendance((prev) => [scheduledClass, ...prev]);
  };

  const markReplacementCompleted = (replacementId: string, aulaRealizadaId?: string) => {
    setClassReplacements((prev) =>
      prev.map((r) =>
        r.id === replacementId
          ? {
              ...r,
              status: 'Realizada',
              minutosRestantes: 0,
              aulaAgendadaId: aulaRealizadaId || r.aulaAgendadaId,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );
  };

  const dismissClassReplacement = (replacementId: string, motivo?: string) => {
    setClassReplacements((prev) =>
      prev.map((r) =>
        r.id === replacementId
          ? {
              ...r,
              status: 'Dispensada',
              motivoDispensadaCancelada: motivo || 'Dispensada pela coordenação',
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );
  };

  const cancelClassReplacement = (replacementId: string, motivo?: string) => {
    setClassReplacements((prev) =>
      prev.map((r) =>
        r.id === replacementId
          ? {
              ...r,
              status: 'Cancelada',
              motivoDispensadaCancelada: motivo || 'Cancelada pela coordenação',
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );
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

  const toggleUserService = (userId: string, service: ServiceType) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== userId) return s;
        const currentServices = s.servicosAtivos || ['aluno_regular'];
        const exists = currentServices.includes(service);
        const updated = exists ? currentServices.filter((x) => x !== service) : [...currentServices, service];
        return { ...s, servicosAtivos: updated };
      })
    );
  };

  const updateUserServicesData = (userId: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === userId ? { ...s, ...updates } : s))
    );
  };

  const addFiringOrder = (order: Omit<FiringOrder, 'id' | 'createdAt'>): FiringOrder => {
    const newOrder: FiringOrder = {
      ...order,
      id: `fire-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setFirings((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateFiringOrderStatus = (orderId: string, status: FiringStatus, observacoes?: string) => {
    setFirings((prev) =>
      prev.map((f) => {
        if (f.id !== orderId) return f;
        const now = new Date().toISOString().split('T')[0];
        return {
          ...f,
          status,
          ...(status === 'queima_concluida' ? { dataRealizada: now } : {}),
          ...(observacoes ? { observacoes: `${f.observacoes || ''} [${status}]: ${observacoes}`.trim() } : {})
        };
      })
    );
  };

  const deleteFiringOrder = (orderId: string) => {
    setFirings((prev) => prev.filter((f) => f.id !== orderId));
  };

  const addConsultingAppointment = (app: Omit<ConsultingAppointment, 'id' | 'createdAt'>): ConsultingAppointment => {
    const newApp: ConsultingAppointment = {
      ...app,
      id: `consult-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setConsultingAppointments((prev) => [newApp, ...prev]);
    return newApp;
  };

  const updateConsultingAppointmentStatus = (appId: string, status: 'agendado' | 'realizado' | 'cancelado') => {
    setConsultingAppointments((prev) =>
      prev.map((c) => (c.id === appId ? { ...c, status } : c))
    );
  };

  const addCoworkingBooking = (booking: Omit<CoworkingBooking, 'id' | 'solicitadoEm'>): CoworkingBooking => {
    const newBooking: CoworkingBooking = {
      ...booking,
      id: `cowork-${Date.now()}`,
      solicitadoEm: new Date().toISOString()
    };
    setCoworkingBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateCoworkingBookingStatus = (bookingId: string, status: 'solicitado' | 'confirmado' | 'realizado' | 'cancelado') => {
    setCoworkingBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status, decididoEm: new Date().toISOString() } : b))
    );
  };

  const registerMaterialUsage = (usage: Omit<MaterialUsage, 'id' | 'createdAt' | 'valorTotal'>): MaterialUsage => {
    const valorTotal = usage.quantidade * usage.valorUnitario;
    const newUsage: MaterialUsage = {
      ...usage,
      id: `mat-${Date.now()}`,
      valorTotal,
      createdAt: new Date().toISOString()
    };
    setMaterialsUsage((prev) => [newUsage, ...prev]);
    return newUsage;
  };

  const deleteMaterialUsage = (usageId: string) => {
    setMaterialsUsage((prev) => prev.filter((m) => m.id !== usageId));
  };

  const addAuditLog = (log: Omit<SystemAuditLog, 'id' | 'data'>) => {
    const newLog: SystemAuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      data: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const resetDatabase = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}students_v2`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}students`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}students_backup`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}pieces`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}attendance`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}transactions`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}notifications`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}changeRequests`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}classReplacements`);
    setStudents(INITIAL_STUDENTS);
    setPieces(INITIAL_PIECES);
    setAttendance(INITIAL_ATTENDANCE);
    setClassReplacements(INITIAL_REPLACEMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChangeRequests(INITIAL_CHANGE_REQUESTS);
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
        classReplacements,
        transactions,
        notifications,
        changeRequests,
        isAdminPreview,
        isServerSynced,
        lastSavedTime,
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
        saveClassAttendance,
        deleteAttendance,
        addClassReplacement,
        updateClassReplacement,
        deleteClassReplacement,
        scheduleClassReplacement,
        markReplacementCompleted,
        dismissClassReplacement,
        cancelClassReplacement,
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
