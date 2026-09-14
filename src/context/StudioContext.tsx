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
  UserRole
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_PIECES,
  INITIAL_ATTENDANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHANGE_REQUESTS
} from '../data/seedData';

interface StudioContextType {
  role: UserRole;
  currentStudent: Student | null;
  students: Student[];
  pieces: PotteryPiece[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  notifications: SystemNotification[];
  changeRequests: ProfileChangeRequest[];
  
  // Auth & Roles
  setRole: (role: UserRole) => void;
  setCurrentStudentById: (studentId: string) => void;
  loginAsStudent: (identifier: string, pin: string) => { success: boolean; message?: string };
  loginAsAdmin: (password: string) => { success: boolean; message?: string };
  logout: () => void;

  // Student CRUD
  createStudentFromForm: (formData: RegistrationFormData) => Student;
  updateStudent: (updatedStudent: Student) => void;
  deleteStudent: (studentId: string) => void;
  generateNewAccessKey: (studentId: string) => string;

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
  // Load from localStorage or seed
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [pieces, setPieces] = useState<PotteryPiece[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}pieces`);
    return saved ? JSON.parse(saved) : INITIAL_PIECES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [changeRequests, setChangeRequests] = useState<ProfileChangeRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}changeRequests`);
    return saved ? JSON.parse(saved) : INITIAL_CHANGE_REQUESTS;
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}role`);
    return (saved as UserRole) || 'admin';
  });
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}currentStudentId`) || 'student-1';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}role`, newRole);
  };

  // Persistence effects
  useEffect(() => {
    if (currentStudentId) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}currentStudentId`, currentStudentId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}currentStudentId`);
    }
  }, [currentStudentId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}students`, JSON.stringify(students));
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

  const currentStudent = students.find((s) => s.id === currentStudentId) || null;

  const setCurrentStudentById = (id: string) => {
    setCurrentStudentId(id);
  };

  const loginAsStudent = (identifier: string, pin: string) => {
    const cleanId = identifier.trim().toUpperCase();
    const cleanPin = pin.trim();
    const student = students.find(
      (s) =>
        (s.accessCode.toUpperCase() === cleanId ||
          s.email.toLowerCase() === identifier.trim().toLowerCase() ||
          s.registrationData.cpfOuPassaporte.replace(/\D/g, '') === identifier.replace(/\D/g, '')) &&
        s.pin === cleanPin
    );

    if (student) {
      setCurrentStudentId(student.id);
      setRole('student');
      return { success: true };
    }
    return {
      success: false,
      message: 'Código de acesso ou PIN incorretos. A chave de acesso é estritamente pessoal e fornecida exclusivamente pela coordenação do ateliê.'
    };
  };

  const loginAsAdmin = (password: string) => {
    if (password.trim() === 'ollariagestao') {
      setRole('admin');
      return { success: true };
    }
    return { success: false, message: 'Senha incorreta para acesso administrativo.' };
  };

  const logout = () => {
    setRole('guest');
    setCurrentStudentId(null);
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

  const resetDatabase = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}students`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}pieces`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}attendance`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}transactions`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}notifications`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}changeRequests`);
    setStudents(INITIAL_STUDENTS);
    setPieces(INITIAL_PIECES);
    setAttendance(INITIAL_ATTENDANCE);
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
        transactions,
        notifications,
        changeRequests,
        setRole,
        setCurrentStudentById,
        loginAsStudent,
        loginAsAdmin,
        logout,
        createStudentFromForm,
        updateStudent,
        deleteStudent,
        generateNewAccessKey,
        addPiece,
        updatePieceStage,
        updatePieceEvaluation,
        deletePiece,
        registerAttendance,
        deleteAttendance,
        addTransaction,
        markTransactionAsPaid,
        deleteTransaction,
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
