import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Clock, Car } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Como faço meu agendamento? Preciso agendar pelo WhatsApp?',
      a: 'Não! O agendamento é feito 100% online diretamente pelo simulador em nosso site. Você preenche a origem, destino, data e passageiros, e recebe na hora seu Voucher de Reserva com código de rastreamento digital. A central e o motorista recebem a notificação imediatamente no sistema.',
    },
    {
      q: 'Como funciona a travessia de balsa para Ilhabela no transfer?',
      a: 'Nosso motorista realiza a travessia de balsa com hora marcada ou fila convencional assistida. No serviço privativo, você permanece confortavelmente na minivan com ar-condicionado até o desembarque na porta da sua pousada ou hotel em Ilhabela.',
    },
    {
      q: 'Qual o espaço para bagagens na Chevrolet Spin de 7 Lugares?',
      a: 'A Chevrolet Spin acomoda confortavelmente até 7 passageiros com bagagens de mão, ou 4 a 5 passageiros com malas grandes e volumes adicionais. Pranchas de surf com capas de proteção também podem ser transportadas mediante aviso prévio no agendamento.',
    },
    {
      q: 'O que acontece se meu voo em Guarulhos (GRU) ou Congonhas (CGH) atrasar?',
      a: 'Nossa central monitora o código do seu voo em tempo real. Se houver atrasos na aterrissagem ou na liberação de bagagens, nossa equipe ajusta o horário da saída sem cobrança de multas adicionais.',
    },
    {
      q: 'Como funciona a cobrança caso eu precise fazer uma parada ou desvio fora da rota?',
      a: 'Trabalhamos com rotas estritas pré-acordadas. Caso precise adicionar uma parada intermediária ou desvio fora do trajeto padrão, o valor é calculado de forma transparente via GPS por taxa fixa (R$ 50,00 por parada) ou por km excedente (R$ 4,50/km) sem taxímetro abusivo.',
    },
    {
      q: 'Quais são as formas de pagamento aceitas?',
      a: 'Aceitamos PIX com chave instantânea, cartões de crédito/débito com máquina a bordo na minivan, e transferência bancária antecipada para emissão de Nota Fiscal para empresas.',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-400/40 mb-3 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="font-serif-display text-3xl font-extrabold text-slate-900">
            PERGUNTAS FREQUENTES
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50"
              >
                <span className="font-serif-display font-bold text-sm sm:text-base text-slate-900">
                  {faq.q}
                </span>
                <span className="p-1.5 rounded-full bg-slate-100 text-slate-700 flex-shrink-0">
                  {openIndex === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {openIndex === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
