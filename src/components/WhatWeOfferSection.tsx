import React from 'react';
import { ShieldCheck, Clock, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';

export const WhatWeOfferSection: React.FC = () => {
  const trustPillars = [
    {
      title: 'TRANSFER PRIVADO',
      subtitle: 'Sem compartilhar o veículo',
      description: 'Conforto absoluto e exclusividade para você, sua família ou sua equipe durante todo o trajeto.',
      icon: ShieldCheck,
      badge: 'Exclusivo',
    },
    {
      title: 'PONTUALIDADE',
      subtitle: 'Seu horário é prioridade',
      description: 'Motoristas pontuais com monitoramento em tempo real de voos (GRU/CGH) e das rodovias.',
      icon: Clock,
      badge: 'Garantido',
    },
    {
      title: 'PAGAMENTO PIX',
      subtitle: 'Simples, rápido e seguro',
      description: 'Sinal de 50% via PIX instantâneo para reserva imediata e saldo restante pago no embarque.',
      icon: CreditCard,
      badge: 'Pix Instantâneo',
    },
    {
      title: 'CONHECIMENTO LOCAL',
      subtitle: 'São Paulo e Litoral Norte',
      description: 'Especialistas nas rotas da Tamoios, Imigrantes e Oswaldo Cruz com destino a São Sebastião e Ilhabela.',
      icon: MapPin,
      badge: 'Especialistas',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Excelência & Confiança</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Por que escolher a Litoral em Movimento?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Padrão executivo em transporte privado entre São Paulo e o Litoral Norte.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-amber-400 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-serif-display font-extrabold text-lg text-slate-900 tracking-wide mb-1">
                    {item.title}
                  </h3>
                  <span className="text-xs font-semibold text-amber-700 block mb-2.5">
                    {item.subtitle}
                  </span>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
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
