import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Quais são os horários e valores das viagens regulares (por vaga)?',
      a: 'Nossas saídas regulares conectam o Metrô Portuguesa-Tietê, Aeroporto de Guarulhos (GRU), Caraguatatuba e São Sebastião (Balsa): \n• Subidas (Litoral ➔ SP/GRU): 05:00, 08:30, 14:00 e 18:30.\n• Descidas (SP/GRU ➔ Litoral): 11:30, 14:30, 17:30 e 22:00 (Segunda a Sexta) | Finais de semana: 11:30, 13:00, 17:30 e 21:30.\n• Tarifas por vaga: R$ 80 (Caraguatatuba até Rodoviária), R$ 90 (São Sebastião/Balsa) e R$ 150 (Aeroporto GRU). Duração média: 2h30 a 3h00.',
    },
    {
      q: 'Como faço meu agendamento? Posso agendar pelo site ou WhatsApp?',
      a: 'Você pode fazer sua simulação e agendamento diretamente no formulário do site, escolhendo seu veículo (Spin 7L ou Sedã 4L), origem, destino, data e passageiros. Ao clicar em reservar, geramos seu voucher instantâneo e enviamos as informações diretamente para a nossa central de atendimento via WhatsApp para confirmação rápida.',
    },
    {
      q: 'Como funciona a ida para Ilhabela e a travessia de balsa?',
      a: 'Temos duas modalidades: 1) Desembarque no Porto da Balsa em São Sebastião (com saídas regulares por R$ 90/vaga ou carro privativo sob consulta); 2) Travessia com Carro Fechado para dentro da ilha (a partir de R$ 900, sujeita a consulta prévia e disponibilidade de escala do motorista).',
    },
    {
      q: 'Quais tipos de veículos estão disponíveis para reserva?',
      a: 'Disponibilizamos a Chevrolet Spin de 7 Lugares (com ar-condicionado duplo digital, acomodando até 6 passageiros com malas grandes) e Carro Executivo de 4 Lugares (ideal para atendimentos individuais, casais ou executivos até 4 passageiros).',
    },
    {
      q: 'Qual a área de atendimento em Caraguatatuba?',
      a: 'Em Caraguatatuba atendemos exclusivamente a Rodoviária e os bairros situados no sentido São Sebastião (como Porto Novo, Praia das Palmeiras e Travessão).',
    },
    {
      q: 'O que acontece se meu voo em Guarulhos (GRU) ou Congonhas (CGH) atrasar?',
      a: 'Nossa equipe acompanha o status do seu voo pelo código informado. Se houver atraso na aterrissagem ou na restituição de bagagens, nossa programação é ajustada para que seu motorista esteja aguardando no desembarque sem estresse.',
    },
    {
      q: 'Como funciona caso eu precise fazer uma parada intermediária?',
      a: 'Trabalhamos com total transparência. Paradas intermediárias para buscar outro passageiro ou fazer uma parada rápida podem ser adicionadas diretamente no simulador de agendamento por uma taxa fixa de R$ 50/parada, sem surpresas de taxímetro.',
    },
    {
      q: 'Quais são as formas de pagamento aceitas?',
      a: 'Aceitamos PIX com confirmação instantânea, cartões de crédito e débito na máquina a bordo da minivan, e faturamento para empresas com emissão de Nota Fiscal.',
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3">
            Respostas claras sobre nossos transfers, horários, balsa e bagagens.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                id={`faq-toggle-${idx}`}
              >
                <span className="font-serif-display font-bold text-base sm:text-lg text-slate-900">
                  {faq.q}
                </span>
                <span className="p-1.5 rounded-full bg-white text-slate-600 border border-slate-200 flex-shrink-0">
                  {openIndex === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {openIndex === idx && (
                <div className="px-5 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-200/60 pt-4 bg-white">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Need more help */}
        <div className="mt-10 text-center">
          <p className="text-xs sm:text-sm text-slate-500 mb-3">
            Ainda tem alguma dúvida específica sobre seu trajeto?
          </p>
          <a
            href={COMPANY_CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar agora no WhatsApp com {COMPANY_CONTACT.name}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
