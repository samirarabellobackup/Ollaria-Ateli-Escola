import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  FileText,
  Printer,
  Share2,
  Calendar,
  DollarSign,
  Users,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check
} from 'lucide-react';

export const MonthlyReportView: React.FC = () => {
  const { generateMonthlyReport, transactions, attendance, pieces, students } = useStudio();
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [copiedShare, setCopiedShare] = useState(false);

  const report = generateMonthlyReport(selectedMonth);

  const [year, month] = selectedMonth.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthLabel = `${monthNames[parseInt(month, 10) - 1]} de ${year}`;

  const monthTx = transactions.filter((t) => {
    const d = t.dataPagamento || t.dataVencimento;
    return d.startsWith(selectedMonth);
  });

  const monthAtt = attendance.filter((a) => a.data.startsWith(selectedMonth));

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `*RELATÓRIO MENSAL - OLLARIA ATELIÊ*\n*Período:* ${monthLabel}\n\n*Financeiro:*\n• Receita Total: R$ ${report.receitaTotal.toFixed(2)}\n  - Mensalidades: R$ ${report.receitaMensalidades.toFixed(2)}\n  - Argilas & Queimas: R$ ${report.receitaArgilasEQueimas.toFixed(2)}\n• Pendente / Em aberto: R$ ${report.totalPendente.toFixed(2)}\n\n*Alunos & Aulas:*\n• Alunos Ativos: ${report.totalAlunosAtivos}\n• Novas Matrículas: ${report.novasMatriculas}\n• Aulas Realizadas: ${report.totalAulasRealizadas}\n• Taxa de Presença: ${report.taxaPresencaPercentual}%\n\n*Produção & Forno:*\n• Peças Queimadas no Mês: ${report.pecasQueimadasTotal}\n• Peças em Andamento: ${report.pecasAguardandoQueima}\n• Alertas de 90 Dias (Retirada): ${report.pecasAlerta90Dias}\n\n_Ollaria Ateliê • Brasília DF_`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Report Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6DFD5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl text-[#D97736]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C241E]">
              Relatórios Mensais Automáticos da Gestão
            </h3>
            <p className="text-xs text-[#7A6A5E]">
              Consolidado de faturamento, presenças, queimas e alunos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] text-xs font-semibold text-[#2C241E] cursor-pointer"
          >
            <option value="2026-09">Setembro 2026</option>
            <option value="2026-08">Agosto 2026</option>
            <option value="2026-07">Julho 2026</option>
            <option value="2026-06">Junho 2026</option>
          </select>

          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl border border-[#D5CBC0] bg-[#FAF8F5] hover:bg-[#EBE4DA] text-xs font-semibold text-[#4A3E35] flex items-center gap-1.5 transition-all"
            title="Copiar texto formatado para WhatsApp da administração"
          >
            {copiedShare ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedShare ? 'Copiado!' : 'Copiar Resumo'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#2C241E] hover:bg-[#43372E] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#E6A15C]" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white rounded-3xl border border-[#E6DFD5] p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Formal Header for the Print Sheet */}
        <div className="border-b-2 border-[#2C241E] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#9E4C1D]">
              Relatório Executivo Mensal
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#2C241E] mt-1">
              OLLARIA ATELIÊ
            </h2>
            <p className="text-xs text-[#7A6A5E]">
              Arte • Cerâmica • Pesquisa | Brasília — DF
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#7A6A5E] uppercase font-semibold block">Mês de Referência:</span>
            <span className="font-serif text-xl font-bold text-[#2C241E]">{monthLabel}</span>
            <span className="text-[11px] text-[#7A6A5E] block mt-0.5">Gerado automaticamente pelo sistema</span>
          </div>
        </div>

        {/* 4 Main Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Receita Total */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <span className="text-xs font-semibold text-[#7A6A5E] block">Receita Total Recebida</span>
            <strong className="text-2xl font-serif text-emerald-800 block mt-1">
              R$ {report.receitaTotal.toFixed(2)}
            </strong>
            <div className="text-[11px] text-[#7A6A5E] mt-2 space-y-0.5">
              <p>Mensalidades: R$ {report.receitaMensalidades.toFixed(2)}</p>
              <p>Argilas e Queimas: R$ {report.receitaArgilasEQueimas.toFixed(2)}</p>
            </div>
          </div>

          {/* Saldo Pendente */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <span className="text-xs font-semibold text-[#7A6A5E] block">Cobranças Pendentes</span>
            <strong className="text-2xl font-serif text-amber-800 block mt-1">
              R$ {report.totalPendente.toFixed(2)}
            </strong>
            <p className="text-[11px] text-[#7A6A5E] mt-2">
              Mensalidades e argilas em aberto
            </p>
          </div>

          {/* Frequência & Aulas */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <span className="text-xs font-semibold text-[#7A6A5E] block">Presenças & Frequência</span>
            <strong className="text-2xl font-serif text-[#2C241E] block mt-1">
              {report.taxaPresencaPercentual}%
            </strong>
            <p className="text-[11px] text-[#7A6A5E] mt-2">
              {report.totalAulasRealizadas} aulas realizadas no mês
            </p>
          </div>

          {/* Produção Cerâmica */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <span className="text-xs font-semibold text-[#7A6A5E] block">Produção do Ateliê</span>
            <strong className="text-2xl font-serif text-[#D97736] block mt-1">
              {report.pecasQueimadasTotal} peças
            </strong>
            <p className="text-[11px] text-[#7A6A5E] mt-2">
              {report.pecasAguardandoQueima} em forno/secagem • {report.pecasAlerta90Dias} no limite de 90 dias
            </p>
          </div>

        </div>

        {/* Section: Financial Movements Breakdown */}
        <div>
          <h4 className="font-serif font-bold text-lg text-[#2C241E] mb-3 border-b border-[#E6DFD5] pb-2">
            1. Movimentações Financeiras de {monthLabel}
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF8F5] text-[#7A6A5E] uppercase text-[11px] font-semibold border-b border-[#E6DFD5]">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Aluno</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4DA]">
                {monthTx.map((tx) => {
                  const student = students.find((s) => s.id === tx.studentId);
                  return (
                    <tr key={tx.id}>
                      <td className="p-3 text-[#7A6A5E]">
                        {new Date(tx.dataPagamento || tx.dataVencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 font-semibold text-[#2C241E]">
                        {student ? student.nome : 'Aluno'}
                      </td>
                      <td className="p-3 text-[#4A3E35]">{tx.descricao}</td>
                      <td className="p-3 capitalize text-[#6B5A4D]">{tx.categoria}</td>
                      <td className="p-3 font-bold text-[#2C241E]">R$ {tx.valor.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Attendance & Class Balance */}
        <div>
          <h4 className="font-serif font-bold text-lg text-[#2C241E] mb-3 border-b border-[#E6DFD5] pb-2">
            2. Frequência e Aulas Ministradas
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A6A5E]">Total de Alunos Regulares Ativos:</span>
                <strong>{report.totalAlunosAtivos} alunos</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A5E]">Novas Matrículas no Mês:</span>
                <strong>{report.novasMatriculas} novas</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A5E]">Total de Horas/Aula Ministradas:</span>
                <strong>{(report.totalAulasRealizadas * 2.5).toFixed(1)} horas (2h30 cada)</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A6A5E]">Presenças Confirmadas:</span>
                <strong className="text-emerald-800">{monthAtt.filter((a) => a.status === 'presente').length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A5E]">Reposições Autorizadas (Regra 20 dias):</span>
                <strong className="text-purple-800">{monthAtt.filter((a) => a.status === 'reposicao').length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6A5E]">Faltas Registradas:</span>
                <strong className="text-red-800">{monthAtt.filter((a) => a.status === 'falta').length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="pt-6 border-t border-[#E6DFD5] text-[11px] text-[#7A6A5E] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Ollaria Ateliê • Arte, Cerâmica e Pesquisa — Brasília DF</span>
          <span>Chave PIX Ateliê: 61 996101254</span>
        </div>

      </div>

    </div>
  );
};
