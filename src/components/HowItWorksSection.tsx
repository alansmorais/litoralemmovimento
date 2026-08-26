import React from 'react';
import { Compass, CheckCircle2, Navigation, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onScrollToBooking: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onScrollToBooking }) => {
  const steps = [
    {
      number: '01',
      title: 'Escolha sua rota',
      description: 'Informe a origem, o destino desejado, a data e a quantidade de passageiros no nosso simulador online.',
      icon: Compass,
    },
    {
      number: '02',
      title: 'Confirme sua reserva',
      description: 'Confira o valor transparente sem taxímetro, escolha o tipo de transfer e garanta sua vaga com facilidade.',
      icon: CheckCircle2,
    },
    {
      number: '03',
      title: 'Viaje com tranquilidade',
      description: 'Receba seu voucher digital com código de rastreamento e todas as informações para o embarque pontual.',
      icon: Navigation,
    },
  ];

  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Passo a Passo Simples</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Como funciona seu transfer
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Planeje sua viagem com segurança, transparência e sem complicações.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-50 rounded-2xl p-7 sm:p-8 border border-slate-200 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
                id={`how-it-works-step-${step.number}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif-display font-extrabold text-3xl text-amber-500/80 group-hover:text-amber-500 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-amber-400 group-hover:border-slate-900 transition-all shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif-display font-bold text-xl text-slate-900 mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/70 flex items-center gap-1 text-xs font-semibold text-sky-700 group-hover:text-amber-600 transition-colors">
                  <span>Etapa {step.number}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick CTA banner */}
        <div className="mt-12 text-center">
          <button
            onClick={onScrollToBooking}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Fazer simulação agora</span>
          </button>
        </div>
      </div>
    </section>
  );
};
