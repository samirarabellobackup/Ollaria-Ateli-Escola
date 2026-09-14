import { Student, ClassShift, PlanType } from '../types';

/**
 * Utility for exporting and importing student spreadsheets (CSV, TSV, JSON)
 * specifically designed for Ollaria Ateliê with UTF-8 BOM encoding for Excel/Google Sheets.
 */

// Helper to escape CSV values
const escapeCsv = (val: any): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// Generates a clean CSV file from students list
export const exportStudentsToCSV = (students: Student[]): void => {
  const headers = [
    'Código de Acesso',
    'Senha Gerada (PIN)',
    'Nome Completo',
    'Nome de Preferência',
    'E-mail (Login)',
    'WhatsApp / Telefone',
    'CPF ou Passaporte',
    'Data de Nascimento',
    'Profissão',
    'Endereço Completo',
    'Turma / Turno',
    'Modalidade / Plano',
    'Valor do Plano (R$)',
    'Status da Matrícula',
    'Aulas Feitas',
    'Total Aulas Plano',
    'Aulas Restantes',
    'Data Início Plano',
    'Data Fim Plano',
    'Menor de 18 Anos',
    'Contato de Emergência (Nome)',
    'Contato de Emergência (Relação)',
    'Informações de Saúde / Restrições',
    'Forma de Pagamento Pretendida',
    'Regulamento Aceito',
    'Data Aceite Regulamento',
    'Autorização de Uso de Imagem'
  ];

  const rows = students.map((s) => [
    escapeCsv(s.accessCode),
    escapeCsv(s.pin),
    escapeCsv(s.nome),
    escapeCsv(s.registrationData?.nomePreferencia || s.nome),
    escapeCsv(s.email),
    escapeCsv(s.whatsapp),
    escapeCsv(s.registrationData?.cpfOuPassaporte || ''),
    escapeCsv(s.registrationData?.dataNascimento || ''),
    escapeCsv(s.registrationData?.profissao || ''),
    escapeCsv(s.registrationData?.endereco || ''),
    escapeCsv(s.turma),
    escapeCsv(s.modalidade),
    escapeCsv(s.valorPlano),
    escapeCsv(s.status),
    escapeCsv(s.aulasFeitas),
    escapeCsv(s.aulasTotaisPlano),
    escapeCsv(s.aulasRestantes),
    escapeCsv(s.dataInicioPlano),
    escapeCsv(s.dataFimPlano),
    escapeCsv(s.registrationData?.menor18 || 'Não'),
    escapeCsv(s.registrationData?.contatoEmergenciaNome || ''),
    escapeCsv(s.registrationData?.contatoEmergenciaRelacao || ''),
    escapeCsv(s.registrationData?.informacoesSaudeAtendimento || ''),
    escapeCsv(s.registrationData?.formaPagamentoPretendida || 'pix'),
    escapeCsv(s.registrationData?.aceitouTermoRegulamento ? 'Sim' : 'Não'),
    escapeCsv(s.registrationData?.dataAceiteTermoRegulamento || ''),
    escapeCsv(s.registrationData?.autorizacaoImagem === 'autorizo' ? 'Autorizado' : 'Não Autorizado')
  ]);

  // Include UTF-8 Byte Order Mark (BOM) \uFEFF for proper rendering of special chars in Microsoft Excel
  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map((row) => row.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Ollaria_Cadastros_Alunos_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generates complete system backup file (JSON)
export const exportFullBackupJSON = (databaseSnapshot: any): void => {
  const dataToExport = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    studio: 'Ollaria Ateliê de Cerâmica',
    ...databaseSnapshot
  };

  const jsonContent = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Ollaria_Backup_Completo_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Download a blank / template spreadsheet CSV for easy manual filling
export const downloadSpreadsheetTemplate = (): void => {
  const headers = [
    'Nome Completo',
    'Nome de Preferência',
    'E-mail',
    'WhatsApp',
    'CPF ou Passaporte',
    'Data de Nascimento',
    'Profissão',
    'Endereço',
    'Turma (quarta-tarde / quarta-noite / sabado-manha / terca-noite)',
    'Plano (mensal / bimestral / trimestral / semestral)',
    'Contato de Emergência Nome',
    'Contato de Emergência Relação',
    'Informações de Saúde'
  ];

  const sampleRow = [
    'Maria Oliveira Silva',
    'Mari',
    'maria.silva@exemplo.com',
    '(61) 98888-7777',
    '123.456.789-00',
    '1995-05-12',
    'Arquiteta',
    'Asa Norte, Brasília - DF',
    'sabado-manha',
    'mensal',
    'Carlos Silva',
    'Esposo',
    'Sem restrições'
  ].map(escapeCsv);

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    sampleRow.join(';')
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Modelo_Importacao_Alunos_Ollaria.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Robust parser for CSV / TSV / Semicolon separated text (including Google Forms responses)
export const parseSpreadsheetText = (rawText: string): { students: Student[]; errors: string[] } => {
  const errors: string[] = [];
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { students: [], errors: ['O arquivo ou texto fornecido está vazio ou não contém cabeçalho e linhas.'] };
  }

  // Detect delimiter: semicolon, comma or tab
  const firstLine = lines[0];
  let delimiter = ';';
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;

  if (tabs > semicolons && tabs > commas) {
    delimiter = '\t';
  } else if (commas > semicolons) {
    delimiter = ',';
  }

  // Helper to split a CSV line respecting quoted fields
  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let currentVal = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentVal += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim());

  // Function to find column index by synonyms
  const findColIndex = (...keywords: string[]): number => {
    for (const kw of keywords) {
      const normalizedKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const idx = headers.findIndex((h) => h.includes(normalizedKw));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idxNome = findColIndex('nome completo', 'nome da aluna', 'nome do aluno', 'nome');
  const idxNomePref = findColIndex('preferencia', 'como gosta de ser chamada', 'apelido');
  const idxEmail = findColIndex('e-mail', 'email', 'endereco de e-mail');
  const idxWhatsapp = findColIndex('whatsapp', 'telefone', 'celular', 'contato');
  const idxCpf = findColIndex('cpf', 'passaporte', 'documento');
  const idxNascimento = findColIndex('nascimento', 'data de nascimento');
  const idxProfissao = findColIndex('profissao', 'ocupacao');
  const idxEndereco = findColIndex('endereco', 'residencia');
  const idxTurma = findColIndex('turma', 'turno', 'dia', 'horario');
  const idxPlano = findColIndex('modalidade', 'plano');
  const idxPin = findColIndex('senha', 'pin');
  const idxAccessCode = findColIndex('codigo de acesso', 'codigo');
  const idxEmergNome = findColIndex('emergencia nome', 'contato de emergencia', 'emergencia');
  const idxEmergRel = findColIndex('emergencia relacao', 'parentesco');
  const idxSaude = findColIndex('saude', 'restricao', 'atendimento', 'alergia');

  if (idxNome === -1 && idxEmail === -1) {
    return {
      students: [],
      errors: ['Não foi possível identificar colunas de "Nome" ou "E-mail" no cabeçalho da planilha. Verifique o arquivo.']
    };
  }

  const students: Student[] = [];
  const usedCodes = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i]);
    if (row.length === 0 || row.every((c) => !c)) continue;

    const nome = (idxNome !== -1 ? row[idxNome] : '') || `Aluno ${i}`;
    const email = (idxEmail !== -1 ? row[idxEmail] : '') || `aluno${i}@ollaria.com.br`;
    const whatsapp = (idxWhatsapp !== -1 ? row[idxWhatsapp] : '') || '(61) 99999-9999';
    const rawTurma = (idxTurma !== -1 ? row[idxTurma] : '').toLowerCase();
    const rawPlano = (idxPlano !== -1 ? row[idxPlano] : '').toLowerCase();

    // Map shift
    let turma: ClassShift = 'quarta-tarde';
    if (rawTurma.includes('noite') && rawTurma.includes('terca')) turma = 'terca-noite';
    else if (rawTurma.includes('sabado') || rawTurma.includes('manha')) turma = 'sabado-manha';
    else if (rawTurma.includes('noite')) turma = 'quarta-noite';
    else if (rawTurma.includes('quarta')) turma = 'quarta-tarde';

    // Map plan
    let modalidade: PlanType = 'mensal';
    let valorPlano = 560;
    let totalAulas = 4;
    if (rawPlano.includes('semestral')) {
      modalidade = 'semestral';
      valorPlano = 3000;
      totalAulas = 24;
    } else if (rawPlano.includes('trimestral')) {
      modalidade = 'trimestral';
      valorPlano = 1560;
      totalAulas = 12;
    } else if (rawPlano.includes('bimestral')) {
      modalidade = 'bimestral';
      valorPlano = 1080;
      totalAulas = 8;
    }

    // Code & PIN: Use existing or generate automatically
    let accessCode = (idxAccessCode !== -1 ? row[idxAccessCode] : '').toUpperCase().trim();
    if (!accessCode || !accessCode.startsWith('OL-')) {
      let codeCandidate = `OL-${Math.floor(1000 + Math.random() * 9000)}`;
      while (usedCodes.has(codeCandidate)) {
        codeCandidate = `OL-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      accessCode = codeCandidate;
    }
    usedCodes.add(accessCode);

    let pin = (idxPin !== -1 ? row[idxPin] : '').trim();
    if (!pin || pin.length < 3) {
      pin = String(Math.floor(1000 + Math.random() * 9000));
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const endStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const student: Student = {
      id: `student-import-${Date.now()}-${i}`,
      accessCode,
      pin,
      nome,
      email,
      whatsapp,
      turma,
      modalidade,
      valorPlano,
      dataInicioPlano: todayStr,
      dataFimPlano: endStr,
      status: 'ativo',
      aulasTotaisPlano: totalAulas,
      aulasFeitas: 0,
      aulasRestantes: totalAulas,
      trancamentosUtilizadosDias: 0,
      dataMatricula: todayStr,
      registrationData: {
        email,
        nomeCompleto: nome,
        nomePreferencia: (idxNomePref !== -1 ? row[idxNomePref] : '') || nome.split(' ')[0],
        dataNascimento: (idxNascimento !== -1 ? row[idxNascimento] : '') || '1995-01-01',
        cpfOuPassaporte: (idxCpf !== -1 ? row[idxCpf] : '') || '',
        profissao: (idxProfissao !== -1 ? row[idxProfissao] : '') || 'Outra',
        telefoneWhatsapp: whatsapp,
        endereco: (idxEndereco !== -1 ? row[idxEndereco] : '') || 'Brasília - DF',
        comoConheceu: 'Instagram',
        modalidade,
        turmaDesejada: turma,
        experiencia: 'nenhuma',
        jaFezAulasOutroAtelie: 'Não',
        menor18: 'Não',
        contatoEmergenciaNome: (idxEmergNome !== -1 ? row[idxEmergNome] : '') || '',
        contatoEmergenciaRelacao: (idxEmergRel !== -1 ? row[idxEmergRel] : '') || '',
        informacoesSaudeAtendimento: (idxSaude !== -1 ? row[idxSaude] : '') || 'Importado via planilha',
        aceitouRegrasCondicoes: false,
        dataAceiteRegrasCondicoes: '',
        aceitouTermoRegulamento: false,
        dataAceiteTermoRegulamento: '',
        cienciaProcessoCeramico: false,
        cienciaMateriaisQueimas: false,
        veracidadeInformacoes: false,
        autorizacaoImagem: 'autorizo',
        formaPagamentoPretendida: 'pix'
      }
    };

    students.push(student);
  }

  return { students, errors };
};
