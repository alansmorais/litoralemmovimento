import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Como faço meu agendamento? Posso agendar pelo site ou WhatsApp?',
      a: 'Você pode fazer sua simulação e reserva instantânea diretamente pelo simulador em nosso site, escolhendo origem, destino, data e passageiros. Após o preenchimento, nosso sistema gera seu voucher e nossa equipe (Michelly) faz o contato imediato para confirmar todos os detalhes.',
    },
    {
      q: 'Como funciona a travessia de balsa para Ilhabela no transfer privativo?',
      a: 'No transfer privativo, você não precisa desembarcar ou se preocupar com a travessia. Nosso motorista acompanha todo o embarque na balsa e leva você no conforto da minivan com ar-condicionado até a porta da sua pousada, hotel ou casa em Ilhabela.',
    },
    {
      q: 'Qual o espaço para bagagens na Chevrolet Spin de 7 Lugares?',
      a: 'A Chevrolet Spin acomoda com conforto até 6 passageiros mais o motorista. Com até 4 a 5 passageiros, o porta-malas comporta várias malas grandes de viagem. Pranchas de surf com capa e equipamentos de praia também são transportados com segurança mediante aviso na reserva.',
    },
    {
      q: 'O que acontece se meu voo em Guarulhos (GRU) ou Congonhas (CGH) atrasar?',
      a: 'Nossa equipe acompanha o status do seu voo pelo código informado. Se houver atraso na aterrissagem ou na restituição de bagagens, nossa programação é ajustada para que seu motorista esteja aguardando no desembarque sem estresse.',
    },
    {
      q: 'Como funciona caso eu precise fazer uma parada intermediária?',
      a: 'Trabalhamos com total transparência. Paradas intermediárias para buscar outro passageiro ou fazer uma parada rápida podem ser adicionadas diretamente no simulador de agendamento por uma taxa fixa clara, sem surpresas de taxímetro.',
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
