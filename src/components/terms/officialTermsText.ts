export interface StudioRuleSection {
  title: string;
  items: { subtitle: string; text: string }[];
}

export const OFFICIAL_STUDIO_TERMS: StudioRuleSection[] = [
  {
    title: '1. REGRAS E CONDIÇÕES DE MATRÍCULA',
    items: [
      {
        subtitle: '1.1. Da Matrícula e das Aulas',
        text: 'Cada encontro tem duração de 2 horas e 30 minutos. A matrícula garante a reserva da vaga na turma e dia da semana escolhidos durante o período de vigência do plano contratado. As vagas são pessoais e intransferíveis. O valor do plano corresponde exclusivamente às aulas e à utilização da infraestrutura e ferramentas do ateliê. Argila, queimas, esmaltes e materiais específicos são cobrados separadamente conforme consumo.'
      },
      {
        subtitle: '1.2. Da Frequência, Faltas e Reposições',
        text: 'A ausência do(a) aluno(a) não gera desconto, crédito financeiro ou reposição automática. Nos planos trimestral e semestral, poderá ser concedida 1 (uma) reposição excepcional por ciclo contratual, desde que comunicada com antecedência mínima de 20 (vinte) dias corridos da data da aula e previamente agendada conforme disponibilidade de vaga nas turmas.'
      },
      {
        subtitle: '1.3. Do Trancamento de Matrícula',
        text: 'O plano mensal não permite trancamento. O plano trimestral permite 1 (um) único período de trancamento de até 15 dias corridos (máximo de 2 aulas). O plano semestral permite 1 (um) único período de trancamento de até 30 dias corridos (máximo de 4 aulas). As solicitações de trancamento devem ser comunicadas por escrito com no mínimo 7 dias de antecedência.'
      },
      {
        subtitle: '1.4. Dos Pagamentos e Mensalidades',
        text: 'As mensalidades e renovações devem ser quitadas até as datas de vencimento acordadas. O atraso superior a 5 dias poderá acarretar na suspensão da participação nas aulas práticas até a regularização do débito.'
      },
      {
        subtitle: '1.5. Do Cancelamento Antecipado',
        text: 'Em caso de solicitação de cancelamento antecipado de planos trimestrais ou semestrais, os encontros já realizados ou decorridos serão recalculados com base no valor da mensalidade avulsa sem o desconto promocional do pacote, sendo restituído o saldo remanescente, deduzida taxa administrativa de 10%.'
      }
    ]
  },
  {
    title: '2. TERMO DE MATRÍCULA E REGULAMENTO DO ATELIÊ',
    items: [
      {
        subtitle: '2.1. Da Natureza Artesanal e Processo Cerâmico',
        text: 'A cerâmica é uma arte ancestral e manual, dependente de secagem natural lenta, retração da argila e complexas reações químicas e térmicas sob temperaturas de até 1.240°C. O(a) aluno(a) declara estar plenamente ciente de que trincas, quebras térmicas, bolhas, deformações e variações tonais de esmaltes são inerentes ao aprendizado e à natureza da cerâmica, não configurando falha técnica do ateliê.'
      },
      {
        subtitle: '2.2. Dos Materiais, Argilas e Queimas',
        text: 'A aquisição de massa cerâmica (argila) é feita no ateliê e pesada individualmente. As queimas de biscoito e de alta temperatura (alta queima) são cobradas por peso (gramas/quilos) das peças ou fração de fornada. Nenhuma peça será introduzida no forno antes da quitação prévia da respectiva taxa de queima.'
      },
      {
        subtitle: '2.3. Da Avaliação Técnica e Segurança dos Fornos',
        text: 'Todas as peças passam por rigorosa inspeção técnica antes de irem aos fornos. Peças com excesso de umidade, paredes de espessura desregulada, bolhas de ar internas ou esmaltação incorreta na base (que possa escorrer e danificar as placas refratárias) NÃO serão queimadas até a devida correção pelo(a) aluno(a).'
      },
      {
        subtitle: '2.4. Da Guarda e Retirada das Peças (Prazo Limite de 90 Dias)',
        text: 'Após a notificação no aplicativo ou WhatsApp de que a peça concluiu a queima final e está pronta para retirada, o(a) aluno(a) dispõe de um prazo improrrogável de até 90 (noventa) dias corridos para retirá-la no ateliê. Em virtude do espaço físico limitado, peças não retiradas após 90 dias poderão ser recicladas, doadas ou descartadas pela direção do ateliê, sem direito a indenização.'
      },
      {
        subtitle: '2.5. Da Convivência, Ferramentas e Segurança',
        text: 'O ateliê preza pela harmonia, respeito mútuo e concentração. É dever de cada aluno(a) limpar as ferramentas utilizadas, a bancada de trabalho e sua bacia de torno ao término de cada aula. É proibido o manuseio dos fornos elétricos, quadros de energia ou equipamentos restritos aos professores.'
      }
    ]
  }
];
