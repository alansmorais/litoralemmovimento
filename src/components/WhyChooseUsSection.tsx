import React from 'react';
import { ShieldCheck, Clock, Users, HeartHandshake, Phone, Sparkles, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';

export const WhyChooseUsSection: React.FC = () => {
  const points = [
    {
      title: 'Atendimento humanizado',
      description: 'Contato direto com a nossa equipe antes, durante e após a viagem para tirar dúvidas e alinhar detalhes do embarque.',
      icon: HeartHandshake,
    },
    {
      title: 'Pontualidade e acompanhamento',
      description: 'Monitoramos condições de trânsito nas serras (Tamoios e Anchieta/Imigrantes) e horários de voos em GRU e Congonhas.',
      icon: Clock,
    },
    {
      title: 'Veículos preparados',
      description: 'Chevrolet Spin com ar-condicionado duplo, espaço para até 6 passageiros com malas e manutenção periódica em dia.',
      icon: ShieldCheck,
    },
    {
      title: 'Preço transparente',
      description: 'Valores combinados com antecedência na sua reserva. Sem taxas ocultas, surpresas no desembarque ou taxímetro abusivo.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-200/80 text-slate-800 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Nossos Compromissos</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Por que viajar com a Litoral em Movimento?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Combinamos pontualidade, veículos confortáveis e atendimento de verdade para que sua ida ao litoral seja tranquila.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((point, idx) => {
            const Icon = point.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mb-5 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-display font-bold text-lg text-slate-900 mb-2">
                    {point.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif-display font-bold text-base sm:text-lg text-slate-900">
                Fale diretamente com nossa central de reservas
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Atendimento com {COMPANY_CONTACT.name} via WhatsApp: <strong>{COMPANY_CONTACT.phone}</strong>
              </p>
            </div>
          </div>

          <a
            href={COMPANY_CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all flex-shrink-0"
          >
            <span>Conversar no WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
