import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Printer, 
  X, 
  Calendar,
  Sparkles,
  Camera
} from 'lucide-react';
import { Student } from '../../types';
import { OFFICIAL_STUDIO_TERMS } from './officialTermsText';

interface StudentTermsModalProps {
  isOpen: boolean;
  student: Student;
  mode: 'accept' | 'view';
  onClose?: () => void;
  onAccept?: (autorizacaoImagem: 'autorizo' | 'nao_autorizo') => void;
}

export const StudentTermsModal: React.FC<StudentTermsModalProps> = ({
  isOpen,
  student,
  mode,
  onClose,
  onAccept
}) => {
  const [hasReadRegras, setHasReadRegras] = useState(false);
  const [hasReadRegulamento, setHasReadRegulamento] = useState(false);
  const [hasCienciaCeramica, setHasCienciaCeramica] = useState(false);
  const [hasCienciaQueimas, setHasCienciaQueimas] = useState(false);
  const [hasDeclaracaoVeracidade, setHasDeclaracaoVeracidade] = useState(false);
  const [autorizacaoImagem, setAutorizacaoImagem] = useState<'autorizo' | 'nao_autorizo'>(
    student.registrationData?.autorizacaoImagem || 'autorizo'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAcceptedAlready = Boolean(
    student.registrationData?.aceitouTermoRegulamento &&
    student.registrationData?.dataAceiteTermoRegulamento
  );

  const allMandatoryChecked =
    hasReadRegras &&
    hasReadRegulamento &&
    hasCienciaCeramica &&
    hasCienciaQueimas &&
    hasDeclaracaoVeracidade;

  const handleConfirmAcceptance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allMandatoryChecked) {
      setErrorMsg('Por favor, leia e marque todos os termos e ciências obrigatórias (*) antes de confirmar.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    if (onAccept) {
      onAccept(autorizacaoImagem);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const dateAcceptedFormatted = student.registrationData?.dataAceiteTermoRegulamento
    ? new Date(student.registrationData.dataAceiteTermoRegulamento).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-2xl border border-[#D5CBC0] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E6DFD5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
              mode === 'view' || isAcceptedAlready
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-[#D97736]/15 text-[#D97736]'
            }`}>
              {mode === 'view' || isAcceptedAlready ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C241E]">
                {mode === 'accept' && !isAcceptedAlready
                  ? 'Termos, Regras & Regulamento do Ateliê'
                  : 'Termos & Regulamento do Ateliê (Cópia Autenticada)'}
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                Ollaria Ateliê de Cerâmica • Aluno(a): <strong>{student.nome}</strong> ({student.accessCode})
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7A6A5E] hover:text-[#2C241E] hover:bg-[#FAF8F5] transition-colors"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Informative Banner */}
        {mode === 'accept' && !isAcceptedAlready ? (
          <div className="bg-amber-50 px-6 py-3 border-b border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Aceite Obrigatório e Individual do Aluno:</strong>
              <span>
                As regras e o regulamento devem ser aceitos pessoalmente por você ao acessar o portal. Conforme as normas do ateliê, <strong>a coordenação não pode aceitar em seu nome</strong> e, <strong>após confirmado, este documento se torna imutável</strong>.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-200/80 flex items-center justify-between gap-3 text-xs text-emerald-900 shrink-0">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Documento Assinado e Bloqueado:</strong> Aceito digitalmente por <strong>{student.nome}</strong> em <strong>{dateAcceptedFormatted || 'Data Registrada'}</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar</span>
            </button>
          </div>
        )}

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed text-[#4A3E35] print:text-black">
          
          <div className="text-center pb-2 border-b border-[#E6DFD5]">
            <h4 className="font-serif font-bold text-base text-[#2C241E]">
              OLLARIA ATELIÊ • ARTE • CERÂMICA • BRASÍLIA / DF
            </h4>
            <p className="text-[11px] text-[#7A6A5E] mt-0.5">
              Condições Gerais de Prestação de Serviços de Ensino em Cerâmica Manual & Torno
            </p>
          </div>

          {/* Full Official Clauses */}
          {OFFICIAL_STUDIO_TERMS.map((sec, idx) => (
            <div key={idx} className="space-y-3 bg-white p-4 rounded-xl border border-[#E6DFD5]">
              <h5 className="font-bold text-xs uppercase tracking-wide text-[#9E4C1D] border-b border-[#F0EAE1] pb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{sec.title}</span>
              </h5>
              <div className="space-y-2.5">
                {sec.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="space-y-0.5">
                    <strong className="block text-[#2C241E] font-semibold">{item.subtitle}</strong>
                    <p className="text-[#5C4D41]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* If Mode is ACCEPT: Interactive Form */}
          {mode === 'accept' && !isAcceptedAlready && (
            <form onSubmit={handleConfirmAcceptance} className="space-y-4 pt-2">
              
              <div className="bg-white p-4 rounded-xl border border-[#D5CBC0] space-y-3 shadow-xs">
                <h5 className="font-serif font-bold text-sm text-[#2C241E] border-b border-[#EBE4DA] pb-1.5">
                  Declarações e Aceites Obrigatórios
                </h5>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Item 1 */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#EBE4DA] hover:bg-[#FAF8F5] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    id="checkbox-termo-regras"
                    checked={hasReadRegras}
                    onChange={(e) => setHasReadRegras(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#D97736] focus:ring-[#D97736]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#2C241E] block">
                      * 1. Regras e Condições de Matrícula
                    </span>
                    <span className="text-[#6B5A4D]">
                      Li e concordo com as regras de duração das aulas (2h30), reserva de vaga pessoal e intransferível, ausência de reposição automática para faltas sem aviso prévio de 20 dias, prazos de trancamento e política de pagamentos.
                    </span>
                  </div>
                </label>

                {/* Item 2 */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#EBE4DA] hover:bg-[#FAF8F5] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    id="checkbox-termo-regulamento"
                    checked={hasReadRegulamento}
                    onChange={(e) => setHasReadRegulamento(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#D97736] focus:ring-[#D97736]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#2C241E] block">
                      * 2. Termo de Matrícula e Regulamento do Ateliê
                    </span>
                    <span className="text-[#6B5A4D]">
                      Declaro que li e compreendi o Regulamento Interno da Ollaria Ateliê, as diretrizes de convivência, e estou ciente do <strong>prazo limite e improrrogável de 90 dias corridos</strong> para retirada das minhas peças após prontas.
                    </span>
                  </div>
                </label>

                {/* Item 3 */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#EBE4DA] hover:bg-[#FAF8F5] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    id="checkbox-termo-ceramica"
                    checked={hasCienciaCeramica}
                    onChange={(e) => setHasCienciaCeramica(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#D97736] focus:ring-[#D97736]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#2C241E] block">
                      * 3. Ciência sobre o Processo Cerâmico Artesanal
                    </span>
                    <span className="text-[#6B5A4D]">
                      Declaro ciência plena de que a cerâmica é um processo sujeito a variáveis térmicas e naturais (possibilidade de quebras, trincas, retração, bolhas ou variações de cor nos esmaltes), inerentes ao aprendizado.
                    </span>
                  </div>
                </label>

                {/* Item 4 */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#EBE4DA] hover:bg-[#FAF8F5] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    id="checkbox-termo-materiais"
                    checked={hasCienciaQueimas}
                    onChange={(e) => setHasCienciaQueimas(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#D97736] focus:ring-[#D97736]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#2C241E] block">
                      * 4. Ciência sobre Materiais e Cobrança de Queimas
                    </span>
                    <span className="text-[#6B5A4D]">
                      Declaro ciência de que massas cerâmicas e as queimas de biscoito e alta temperatura <strong>são cobradas separadamente</strong> conforme peso utilizado, sendo liberadas para os fornos somente após a confirmação do pagamento.
                    </span>
                  </div>
                </label>

                {/* Item 5 */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#EBE4DA] hover:bg-[#FAF8F5] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    id="checkbox-termo-veracidade"
                    checked={hasDeclaracaoVeracidade}
                    onChange={(e) => setHasDeclaracaoVeracidade(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#D97736] focus:ring-[#D97736]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#2C241E] block">
                      * 5. Veracidade das Informações Cadastrais
                    </span>
                    <span className="text-[#6B5A4D]">
                      Declaro que todas as informações prestadas são verídicas, sob minha total responsabilidade cível e cadastral.
                    </span>
                  </div>
                </label>

                {/* Autorização de Imagem */}
                <div className="pt-2 border-t border-[#EBE4DA]">
                  <span className="block font-bold text-xs text-[#2C241E] mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#D97736]" />
                    Autorização de Uso de Imagem Institucional:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                      autorizacaoImagem === 'autorizo'
                        ? 'border-[#D97736] bg-[#FAF0E6] text-[#2C241E] font-semibold'
                        : 'border-[#E0D7CC] bg-[#FAF8F5] text-[#7A6A5E]'
                    }`}>
                      <input
                        type="radio"
                        name="autorizacaoImagem"
                        value="autorizo"
                        checked={autorizacaoImagem === 'autorizo'}
                        onChange={() => setAutorizacaoImagem('autorizo')}
                        className="text-[#D97736] focus:ring-[#D97736]"
                      />
                      <span className="text-xs">Autorizo divulgação dos trabalhos e ateliê</span>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                      autorizacaoImagem === 'nao_autorizo'
                        ? 'border-[#D97736] bg-[#FAF0E6] text-[#2C241E] font-semibold'
                        : 'border-[#E0D7CC] bg-[#FAF8F5] text-[#7A6A5E]'
                    }`}>
                      <input
                        type="radio"
                        name="autorizacaoImagem"
                        value="nao_autorizo"
                        checked={autorizacaoImagem === 'nao_autorizo'}
                        onChange={() => setAutorizacaoImagem('nao_autorizo')}
                        className="text-[#D97736] focus:ring-[#D97736]"
                      />
                      <span className="text-xs">Não autorizo uso de imagem</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Bottom Notice & Submit */}
              <div className="bg-[#FAF0E6] p-4 rounded-xl border border-[#E6A15C]/40 space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#7A4518]">
                  <Lock className="w-4 h-4 text-[#D97736] shrink-0 mt-0.5" />
                  <p>
                    <strong>Atenção:</strong> Ao clicar no botão abaixo, sua assinatura digital será gerada com carimbo de data e hora vinculados à sua matrícula ({student.accessCode}). <strong>Após aceito, este contrato não poderá ser editado nem por você nem pelo ateliê.</strong>
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="btn-confirmar-aceite-termos-aluno"
                    disabled={!allMandatoryChecked || isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#2C241E] text-white text-xs sm:text-sm font-bold hover:bg-[#43372E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {allMandatoryChecked
                        ? 'Li, Concordo e Assino Digitalmente os Termos'
                        : 'Marque todos os itens obrigatórios acima (*) para prosseguir'}
                    </span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* If Mode is VIEW or already accepted: Immutable Seal */}
          {(mode === 'view' || isAcceptedAlready) && (
            <div className="bg-white p-5 rounded-xl border border-[#D5CBC0] space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-serif font-bold text-sm border-b border-[#E6DFD5] pb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Certidão de Autenticação Digital & Aceite Formal</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                  <span className="text-[#7A6A5E] block text-[11px]">Aluno(a) Assinante:</span>
                  <strong className="text-sm text-[#2C241E]">{student.registrationData?.nomeCompleto || student.nome}</strong>
                  <span className="text-[11px] text-[#7A6A5E] block font-mono mt-0.5">Código: {student.accessCode}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                  <span className="text-[#7A6A5E] block text-[11px]">Data e Hora do Aceite:</span>
                  <strong className="text-sm text-emerald-800 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {dateAcceptedFormatted || 'Registrado'}
                  </strong>
                  <span className="text-[11px] text-[#7A6A5E] block mt-0.5">Status: Assinado pelo próprio aluno</span>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                  <span className="text-[#7A6A5E] block text-[11px]">Uso de Imagem Institucional:</span>
                  <strong className="text-[#2C241E]">
                    {student.registrationData?.autorizacaoImagem === 'autorizo'
                      ? 'Autorizado para divulgação'
                      : 'Não autorizado'}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                  <span className="text-[#7A6A5E] block text-[11px]">Status de Edição:</span>
                  <strong className="text-emerald-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Bloqueado (Documento Imutável)
                  </strong>
                </div>
              </div>

              <p className="text-[11px] text-[#7A6A5E] leading-relaxed pt-1">
                * Conforme as diretrizes da Ollaria Ateliê, este termo foi lido e aceito diretamente pela(o) aluna(o) através do seu acesso pessoal. Os registros de conformidade e ciências de queima e processo cerâmico estão permanentemente protegidos contra edição posterior.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        {mode === 'view' && onClose && (
          <div className="px-6 py-3.5 bg-white border-t border-[#E6DFD5] flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2C241E] text-white text-xs font-semibold hover:bg-[#43372E] transition-colors"
            >
              Fechar Visualização
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
