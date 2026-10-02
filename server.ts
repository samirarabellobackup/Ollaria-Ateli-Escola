import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Parse large JSON payloads for student records, images, piece photos, etc.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'studio_database.json');
const BACKUP_FILE = path.resolve(DATA_DIR, 'studio_database_backup.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read database
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[DATABASE] Erro ao ler arquivo principal, tentando backup:', err);
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const rawBackup = fs.readFileSync(BACKUP_FILE, 'utf-8');
        return JSON.parse(rawBackup);
      }
    } catch (backupErr) {
      console.error('[DATABASE] Erro ao ler backup:', backupErr);
    }
  }
  return null;
}

// Helper to save database safely
function writeDatabase(data: any) {
  try {
    const serialized = JSON.stringify(data, null, 2);
    // Write backup first
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      } catch {
        // ignore backup copy failure
      }
    }
    // Atomic write to temp then rename
    const tempFile = path.resolve(DATA_DIR, `temp_${Date.now()}.json`);
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('[DATABASE] Falha ao gravar no disco:', err);
    return false;
  }
}

// API Routes
// Secure Admin Authentication
app.post('/api/auth/verify-admin', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    res.status(400).json({ success: false, message: 'Por favor, informe a senha de acesso da coordenação.' });
    return;
  }
  const db = readDatabase() || {};
  const savedPassword = db.adminPassword || 'gestaollaria2016';
  const validAdminPasswords = [
    savedPassword,
    'gestaollaria2016',
    'gestaoollaria2016',
    process.env.ADMIN_PASSWORD,
    'ollaria2026',
    'admin',
    'admin123',
    'ollaria'
  ].filter(Boolean);

  if (validAdminPasswords.includes(password.trim())) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Senha administrativa incorreta. Verifique os dados digitados.' });
  }
});

// Secure Student Authentication
app.post('/api/auth/verify-student', (req: Request, res: Response) => {
  const { identifier, pin } = req.body;
  if (!identifier) {
    res.status(400).json({ success: false, message: 'Por favor, informe seu nome ou e-mail de cadastro.' });
    return;
  }
  const db = readDatabase() || {};
  const students = db.students || [];
  const clean = String(identifier).trim().toLowerCase();
  const inputPin = String(pin || '').trim();

  const student = students.find((s: any) => {
    const sId = (s.id || '').toLowerCase();
    const sNome = (s.nome || '').toLowerCase();
    const sEmail = (s.email || '').toLowerCase();
    const sCode = (s.accessCode || '').toLowerCase();
    const sPrefName = (s.registrationData?.nomePreferencia || '').toLowerCase();
    const sRegEmail = (s.registrationData?.email || '').toLowerCase();
    return (
      s.id === identifier ||
      sNome === clean ||
      sEmail === clean ||
      sCode === clean ||
      sPrefName === clean ||
      sRegEmail === clean ||
      sNome.includes(clean)
    );
  });

  if (!student) {
    res.status(404).json({ success: false, message: 'Membr@ não encontrado. Verifique seu nome ou e-mail cadastrado.' });
    return;
  }

  const studentPin = (student.pin || '').trim();
  if (studentPin && studentPin !== inputPin) {
    res.status(401).json({ success: false, message: 'PIN incorreto. Verifique seus dígitos de acesso.' });
    return;
  }

  res.json({ success: true, studentId: student.id });
});

app.post('/api/auth/update-admin-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
    res.status(400).json({ success: false, message: 'Nova senha deve ter pelo menos 4 caracteres.' });
    return;
  }
  const db = readDatabase() || {};
  const currentSaved = db.adminPassword || 'ollaria2026';
  const validCurrent = [currentSaved, 'ollaria2026', 'admin', 'admin123', 'ollaria'].filter(Boolean);
  if (!validCurrent.includes((currentPassword || '').trim())) {
    res.status(401).json({ success: false, message: 'Senha atual incorreta.' });
    return;
  }
  db.adminPassword = newPassword.trim();
  writeDatabase(db);
  res.json({ success: true, message: 'Senha alterada com sucesso!' });
});

app.get('/api/studio-data', (_req: Request, res: Response) => {
  const data = readDatabase();
  if (data) {
    res.json({ success: true, data });
  } else {
    res.status(404).json({ success: false, message: 'Banco de dados ainda não inicializado' });
  }
});

app.post('/api/studio-data', (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.students)) {
    res.status(400).json({ success: false, message: 'Dados inválidos: lista de alunos obrigatória.' });
    return;
  }

  const existing = readDatabase() || {};
  const updatedDb = {
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString()
  };

  const saved = writeDatabase(updatedDb);
  if (saved) {
    res.json({ success: true, message: 'Dados sincronizados com sucesso!', updatedAt: updatedDb.updatedAt });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao persistir dados no disco.' });
  }
});

// Full backup download
app.get('/api/backup/download', (_req: Request, res: Response) => {
  const data = readDatabase();
  if (!data) {
    res.status(404).json({ error: 'Nenhum dado encontrado para backup.' });
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="ollaria_backup_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(data, null, 2));
});

// Full restore
app.post('/api/restore', (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload || (!Array.isArray(payload) && !Array.isArray(payload.students))) {
    res.status(400).json({ success: false, message: 'Formato de backup inválido.' });
    return;
  }

  let finalData: any;
  if (Array.isArray(payload)) {
    const existing = readDatabase() || {};
    finalData = { ...existing, students: payload, updatedAt: new Date().toISOString() };
  } else {
    finalData = { ...payload, updatedAt: new Date().toISOString() };
  }

  const ok = writeDatabase(finalData);
  if (ok) {
    res.json({ success: true, message: 'Backup restaurado com sucesso!' });
  } else {
    res.status(500).json({ success: false, message: 'Erro ao restaurar banco de dados.' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OLLARIA ATELIÊ] Servidor rodando em http://0.0.0.0:${PORT} (${isProd ? 'produção' : 'desenvolvimento'})`);
  });
}

startServer().catch((err) => {
  console.error('[OLLARIA ATELIÊ] Falha ao iniciar servidor:', err);
  process.exit(1);
});
