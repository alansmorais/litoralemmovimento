import React from 'react';
import { Calendar, Compass, Sparkles, MapPin, ArrowRight, ShieldCheck, Clock, Users, Car, Star } from 'lucide-react';
import { DESTINATIONS } from '../data/mockData';

interface HeroSectionProps {
  onScrollToBooking: () => void;
  onScrollToDestinations: () => void;
  onOpenAIModal: () => void;
  onSelectDestination: (destName: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToBooking,
  onScrollToDestinations,
  onOpenAIModal,
  onSelectDestination,
}) => {
  return (
    <section className="relative bg-slate-950 text-white pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-800">
      {/* Editorial Coastal Background Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
          alt="Litoral Norte Paulista"
          className="w-full h-full object-cover opacity-20 filter saturate-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Main Hero Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small Refined Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-slate-900/90 text-amber-300 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-400/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Transfer • Turismo • Litoral Norte de São Paulo</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Seu caminho para o Litoral começa aqui.
            </h1>

            {/* Supporting Copy */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Transfers confortáveis e personalizados entre São Paulo e o Litoral Norte. Viaje com conforto, pontualidade e atendimento próximo — do embarque ao seu destino.
            </p>

            {/* Route indicator banner */}
            <div className="inline-flex items-center gap-2 bg-slate-900/80 text-xs sm:text-sm text-slate-200 px-4 py-2 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span className="font-medium">
                São Paulo ⇌ São Sebastião · Ilhabela · Caraguatatuba
              </span>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onScrollToBooking}
                id="hero-reserve-btn"
                className="inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform active:scale-95 whitespace-nowrap"
              >
                <Calendar className="w-5 h-5 text-slate-950" />
                <span>RESERVE SUA VAGA</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={onScrollToDestinations}
                id="hero-destinations-btn"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-sky-400" />
                <span>CONHEÇA OS DESTINOS</span>
              </button>
            </div>

            {/* Subtle AI Assistant link */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={onOpenAIModal}
                className="text-xs text-slate-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer underline-offset-4 hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Planejar minha rota com IA (Dúvidas sobre trânsito, balsa e horários)</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Quick Destination Cards Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Principais Destinos Atendidos
                </span>
                <span className="text-[11px] text-slate-400">
                  Saídas diárias
                </span>
              </div>

              <div className="space-y-3">
                {DESTINATIONS.map((dest) => (
                  <div
                    key={dest.id}
                    onClick={() => {
                      onSelectDestination(dest.name);
                      onScrollToBooking();
                    }}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-400/80 hover:bg-slate-950 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-serif-display font-bold text-white text-sm sm:text-base group-hover:text-amber-400 transition-colors truncate">
                          {dest.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {dest.popularSpots.slice(0, 2).join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-400 block">A partir de</span>
                      <span className="text-xs sm:text-sm font-bold text-amber-300">
                        R$ {dest.startingPriceIndividual},00
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Veículos Climatizados</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Pontualidade em Voos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Até 6 Passageiros + Motorista</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Chevrolet Spin Espaçosa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
