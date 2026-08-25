import React from 'react';
import { BRAND_IMAGES, COMPANY_CONTACT } from '../data/mockData';
import { Wind, ShieldCheck, Clock, Users, Phone, CheckCircle2, ArrowRight, Sparkles, MessageCircle, Calendar } from 'lucide-react';

interface WhatWeOfferProps {
  onScrollToBooking: () => void;
}

export const WhatWeOfferSection: React.FC<WhatWeOfferProps> = ({ onScrollToBooking }) => {
  const whatsappUrl = `https://wa.me/${COMPANY_CONTACT.phoneRaw}?text=Ol%C3%A1%20Michelly!%20Gostaria%20de%20fazer%20um%20agendamento%20de%20transfer%20com%20a%20Litoral%20em%20Movimento.`;

  const offers = [
    {
      icon: Wind,
      title: 'Veículos confortáveis e climatizados',
      description:
        'Minivan Chevrolet Spin 7 lugares com ar-condicionado duplo digital, bancos ergonômicos e espaço para toda a família.',
    },
    {
      icon: ShieldCheck,
      title: 'Segurança e profissionalismo',
      description:
        'Motoristas experientes e credenciados, veículos revisados periodicamente com seguro de passageiros e rastreamento em tempo real.',
    },
    {
      icon: Clock,
      title: 'Pontualidade garantida',
      description:
        'Planejamento antecipado com monitoramento das condições da serra e balsas, sem surpresas nem atrasos no seu voo ou check-in.',
    },
    {
      icon: Users,
      title: 'Viagens individuais e compartilhadas',
      description:
        'Opção de transfer executivo privativo porta a porta ou modalidade compartilhada (shuttle) com saídas programadas e tarifas econômicas.',
    },
  ];

  return (
    <section
      id="o-que-oferecemos"
      className="relative bg-slate-900 text-white py-12 sm:py-20 border-y border-slate-800 overflow-hidden"
    >
      {/* Decorative Glow Effects */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-950 text-sky-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-sky-800/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nossos Diferenciais</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-wide">
            O QUE OFERECEMOS
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mt-3 font-normal">
            A melhor experiência de viagem entre a capital paulista e o paraíso do Litoral Norte.
          </p>
        </div>

        {/* 2-Column Grid Mirroring the Brand Flyer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: 4 Icon Items from Flyer */}
          <div className="lg:col-span-6 space-y-5">
            {offers.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400 p-5 sm:p-6 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl flex items-start gap-4"
                  id={`offer-card-${idx}`}
                >
                  <div className="p-3.5 rounded-xl bg-slate-900 border-2 border-amber-400 text-amber-400 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all flex-shrink-0 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif-display font-bold text-lg sm:text-xl text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                      <span>•</span>
                      <span>{item.title}</span>
                    </h3>
                    <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Spin Minivan showcase, Script slogan, and WhatsApp CTA */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Vehicle Showcase Card */}
            <div className="w-full bg-slate-800/90 border-2 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
              {/* Badge: Veículo confortável de 7 lugares */}
              <div className="absolute top-4 right-4 z-20 bg-slate-950/90 backdrop-blur-sm border border-amber-400 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                Minivan 7 Lugares • Chevrolet Spin
              </div>

              {/* Photo matching flyer */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 aspect-video sm:aspect-4/3 flex items-center justify-center">
                <img
                  src={BRAND_IMAGES.spinVehicle}
                  alt="Chevrolet Spin 7 Lugares - Litoral em Movimento"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback to high quality minivan photo if github raw image fails
                    const target = e.currentTarget;
                    target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20 pointer-events-none" />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-700">
                  <span className="font-semibold flex items-center gap-1.5 text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Veículo confortável de 7 lugares
                  </span>
                  <span className="text-slate-300 text-[11px]">Climatizado & Espaçoso</span>
                </div>
              </div>

              {/* Slogan with Script font: "DO SEU DESTINO ao seu melhor momento!" */}
              <div className="text-center my-6 space-y-1">
                <span className="font-serif-display uppercase text-xs sm:text-sm tracking-widest text-slate-300 font-bold block">
                  DO SEU DESTINO
                </span>
                <span className="font-script text-3xl sm:text-4xl lg:text-5xl text-amber-400 tracking-wide block transform -rotate-2">
                  ao seu melhor momento!
                </span>
              </div>

              {/* Online Booking Call to Action Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onScrollToBooking}
                  id="cta-online-booking-btn"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 border border-white/20 transform active:scale-95 group/btn cursor-pointer"
                >
                  <Calendar className="w-6 h-6 text-slate-950" />
                  <span className="font-serif-display tracking-wider">
                    FAÇA JÁ O SEU AGENDAMENTO ONLINE • CONFIRMAÇÃO IMEDIATA
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-950 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Agendamento 100% Online
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Voucher com Código Imediato
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Sem Taxímetro Abusivo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
