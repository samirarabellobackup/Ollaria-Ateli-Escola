import React, { useState, useRef } from 'react';
import { Student } from '../../types';
import { parseSpreadsheetText, downloadSpreadsheetTemplate, exportStudentsToCSV } from '../../utils/spreadsheet';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Users,
  Copy,
  Check,
  RefreshCw,
  FileText,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Student[], mode: 'merge' | 'replace') => void;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const parsedJson = JSON.parse(content);
          const list = Array.isArray(parsedJson)
            ? parsedJson
            : Array.isArray(parsedJson.students)
            ? parsedJson.students
            : [];
          if (list.length === 0) {
            setParseErrors(['O arquivo JSON não contém uma lista de alunos válida.']);
          } else {
            setParsedStudents(list);
            setParseErrors([]);
            setStep('preview');
          }
        } catch (err: any) {
          setParseErrors(['Falha ao decodificar arquivo JSON: ' + err.message]);
        }
      } else {
        setRawText(content);
        processText(content);
      }
    };
    reader.readAsText(file);
  };

  const processText = (text: string) => {
    const { students, errors } = parseSpreadsheetText(text);
    if (errors.length > 0) {
      setParseErrors(errors);
    } else if (students.length === 0) {
      setParseErrors(['Nenhum aluno válido pôde ser extraído do texto.']);
    } else {
      setParsedStudents(students);
      setParseErrors([]);
      setStep('preview');
    }
  };

  const handleManualProcess = () => {
    if (!rawText.trim()) {
      setParseErrors(['Por favor, cole os dados da planilha ou selecione um arquivo.']);
      return;
    }
    processText(rawText);
  };

  const handleConfirmImport = () => {
    onImport(parsedStudents, importMode);
    setStep('success');
  };

  const handleCopyAccessList = () => {
    const lines = parsedStudents.map((st, idx) => {
      return `${idx + 1}. *${st.registrationData?.nomePreferencia || st.nome}*\n   📧 E-mail: ${st.email}\n   🏷️ Matrícula: ${st.accessCode}\n   📅 Turma: ${st.turma}`;
    });

    const fullMessage = `🌿 *OLLARIA ATELIÊ — LISTA DE ALUNOS CADASTRADOS*\n\nPrezadas(os) alunas(os), seus cadastros no aplicativo oficial da Ollaria Ateliê estão disponíveis:\n\n${lines.join(
      '\n\n'
    )}\n\n📌 *Como acessar:* Abra o aplicativo e selecione seu nome para acompanhar suas peças no forno, presenças e mensalidades.`;

    navigator.clipboard.writeText(fullMessage);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const resetState = () => {
    setStep('upload');
    setRawText('');
    setFileName('');
    setParsedStudents([]);
    setParseErrors([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C241E]/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E6DFD5] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#FAF8F5] px-6 py-5 border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FAF0E6] text-[#D97736]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C241E]">
                Importar Planilha de Alunos & Respostas
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                Restauração de cadastros e importação de formulários Google / Excel
              </p>
            </div>
          </div>
          <button
            onClick={resetState}
            className="p-1.5 rounded-lg text-[#7A6A5E] hover:text-[#2C241E] hover:bg-[#EBE4DA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: UPLOAD / PASTE */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD5] text-xs text-[#5C4D41] flex items-start gap-3 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2C241E] font-semibold text-sm mb-0.5">
                    Segurança e Preservação de Dados
                  </strong>
                  <span>
                    Caso precise recadastrar ou sincronizar respostas de formulários externos, envie sua planilha (.csv, .json) ou cole as linhas diretamente do Excel ou Google Sheets. O sistema identifica e-mails, nomes, turmas e <strong>gera automaticamente senhas numéricas seguras (PIN) e códigos de acesso</strong> para cada aluno.
                  </span>
                </div>
              </div>

              {parseErrors.length > 0 && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Atenção ao processar a planilha:</span>
                  </div>
                  {parseErrors.map((err, i) => (
                    <p key={i} className="pl-6">
                      • {err}
                    </p>
                  ))}
                </div>
              )}

              {/* File upload drag-and-drop zone */}
              <div>
                <label className="block text-xs font-bold text-[#4A3E35] mb-2 uppercase tracking-wide">
                  Opção 1: Selecionar Arquivo (.CSV ou .JSON de Backup)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#D5CBC0] hover:border-[#D97736] rounded-2xl p-6 text-center cursor-pointer bg-[#FAF8F5]/60 hover:bg-[#FAF0E6]/30 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-8 h-8 text-[#D97736]" />
                  <span className="text-sm font-semibold text-[#2C241E]">
                    {fileName ? fileName : 'Clique para selecionar a planilha (.csv ou backup .json)'}
                  </span>
                  <span className="text-xs text-[#7A6A5E]">
                    Compatível com planilhas do Excel, Google Sheets, LibreOffice ou backups Ollaria
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .tsv, .txt, .json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Option 2: Paste Raw Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#4A3E35] uppercase tracking-wide">
                    Opção 2: Ou Copie e Cole as Linhas da Sua Planilha
                  </label>
                  <button
                    type="button"
                    onClick={downloadSpreadsheetTemplate}
                    className="text-xs text-[#D97736] hover:text-[#B2571F] font-semibold flex items-center gap-1 underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar Modelo de Exemplo (.CSV)
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Cole aqui as linhas copiadas do Google Sheets ou Excel (com ou sem cabeçalho)..."
                  className="w-full p-3.5 rounded-2xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-mono text-[#2C241E] focus:outline-none focus:ring-2 focus:ring-[#D97736]/30"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetState}
                  className="px-4 py-2.5 rounded-xl border border-[#D5CBC0] text-xs font-semibold text-[#4A3E35] hover:bg-[#FAF8F5]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleManualProcess}
                  className="px-5 py-2.5 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] flex items-center gap-2 shadow-xs"
                >
                  <span>Analisar e Pré-visualizar Alunos</span>
                  <ArrowRight className="w-4 h-4 text-[#E6A15C]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 'preview' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2C241E]">
                    Planilha Reconhecida com Sucesso!
                  </h4>
                  <p className="text-xs text-[#7A6A5E]">
                    Identificados <strong>{parsedStudents.length} alunos</strong> prontos para cadastro.
                  </p>
                </div>

                {/* Import Mode Radio */}
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-[#D97736] focus:ring-[#D97736]"
                    />
                    <span className="font-semibold text-[#2C241E]">
                      Mesclar / Atualizar (Recomendado)
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-[#D97736] focus:ring-[#D97736]"
                    />
                    <span className="text-amber-800 font-semibold">
                      Substituir Todos
                    </span>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-[#E6DFD5] rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[10px] font-bold border-b border-[#E6DFD5] sticky top-0">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Aluno</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3">Matrícula</th>
                      <th className="p-3">Turma</th>
                      <th className="p-3">Plano</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE4DA]">
                    {parsedStudents.map((st, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]/70">
                        <td className="p-3 font-mono text-[11px] text-[#8C7A6E]">{idx + 1}</td>
                        <td className="p-3 font-semibold text-[#2C241E]">{st.nome}</td>
                        <td className="p-3 text-[#5C4D41] font-mono text-[11px]">{st.email}</td>
                        <td className="p-3 font-mono text-[11px] text-[#D97736] font-bold">{st.accessCode}</td>
                        <td className="p-3 text-[#5C4D41] capitalize">{st.turma.replace('-', ' ')}</td>
                        <td className="p-3 text-[#5C4D41] capitalize">{st.modalidade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-4 py-2.5 rounded-xl border border-[#D5CBC0] text-xs font-semibold text-[#4A3E35] hover:bg-[#FAF8F5]"
                >
                  Voltar e Escolher Outro Arquivo
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 rounded-xl bg-[#D97736] text-white text-xs font-bold hover:bg-[#C26224] transition-colors shadow-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Confirmar e Importar {parsedStudents.length} Alunos</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & CREDENTIALS EXPORT */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="font-serif font-bold text-xl text-[#2C241E]">
                  Alunos Importados com Sucesso!
                </h4>
                <p className="text-xs text-[#7A6A5E] mt-1 max-w-md mx-auto leading-relaxed">
                  Os cadastros foram integrados e salvos permanentemente no sistema para acompanhamento de aulas e queimas.
                </p>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                <button
                  type="button"
                  onClick={handleCopyAccessList}
                  className="p-4 rounded-2xl border border-[#D5CBC0] bg-[#FAF8F5] hover:bg-[#FAF0E6] transition-all flex items-start gap-3 shadow-2xs"
                >
                  <div className="p-2 rounded-xl bg-white text-[#D97736] shadow-2xs">
                    {copiedSummary ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </div>
                  <div>
                    <strong className="block text-xs font-bold text-[#2C241E]">
                      {copiedSummary ? 'Lista Copiada!' : 'Copiar Lista (WhatsApp)'}
                    </strong>
                    <span className="text-[11px] text-[#7A6A5E]">
                      Copia a lista formatada com nomes, turmas e matrículas dos alunos.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => exportStudentsToCSV(parsedStudents)}
                  className="p-4 rounded-2xl border border-[#D5CBC0] bg-[#FAF8F5] hover:bg-[#FAF0E6] transition-all flex items-start gap-3 shadow-2xs"
                >
                  <div className="p-2 rounded-xl bg-white text-emerald-600 shadow-2xs">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold text-[#2C241E]">
                      Baixar Planilha de Alunos
                    </strong>
                    <span className="text-[11px] text-[#7A6A5E]">
                      Salva arquivo Excel/CSV com os dados cadastrais completos.
                    </span>
                  </div>
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={resetState}
                  className="px-6 py-2.5 rounded-xl bg-[#2C241E] text-white text-xs font-bold hover:bg-[#43372E] transition-colors shadow-xs"
                >
                  Concluir e Ver Alunos no Painel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
