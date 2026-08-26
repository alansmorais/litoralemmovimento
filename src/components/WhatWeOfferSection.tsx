import React from 'react';
import { Wind, Clock, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const WhatWeOfferSection: React.FC = () => {
  const benefits = [
    {
      title: 'Conforto',
      description: 'Veículos climatizados com ar-condicionado duplo, espaço para pernas e acomodação dedicada para bagagens e equipamentos de praia.',
      icon: Wind,
      badge: 'Ar Duplo Digital',
    },
    {
      title: 'Pontualidade',
      description: 'Horários combinados com antecedência, saídas organizadas e monitoramento em tempo real do tráfego nas rodovias e voos.',
      icon: Clock,
      badge: 'Monitoramento Real',
    },
    {
      title: 'Segurança',
      description: 'Motoristas profissionais experientes nas rodovias da serra e veículos submetidos a revisões mecânicas rigorosas.',
      icon: ShieldCheck,
      badge: 'Direção Defensiva',
    },
    {
      title: 'Atendimento Próximo',
      description: 'Comunicação direta e transparente pelo WhatsApp com a nossa equipe do primeiro contato até o desembarque no seu hotel.',
      icon: HeartHandshake,
      badge: 'Suporte Humanizado',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>O Que Oferecemos</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Viaje com tranquilidade do início ao fim
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Estrutura pensada para você relaxar enquanto nós cuidamos de todo o trajeto entre São Paulo e as praias.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-6 sm:p-7 border border-slate-200 hover:border-amber-400 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-serif-display font-bold text-xl text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
