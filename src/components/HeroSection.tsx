import React from 'react';
import { BRAND_IMAGES, DESTINATIONS } from '../data/mockData';
import { Calendar, MapPin, ArrowRight, ShieldCheck, Clock, Award, Sparkles, Navigation } from 'lucide-react';
import { DestinationInfo } from '../types';

interface HeroSectionProps {
  onSelectDestination: (destName: string) => void;
  onScrollToBooking: () => void;
  onOpenAIAdvisor: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectDestination,
  onScrollToBooking,
  onOpenAIAdvisor,
}) => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-8 sm:py-14 border-b border-slate-200">
      {/* Subtle Background Pattern & Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Headline row mirroring the flyer header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-700 font-bold">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Transfer Executivo & Shuttle Litoral Norte SP</span>
          </div>

          <div className="bg-slate-900 text-slate-200 px-4 py-2 rounded-xl shadow-sm border border-amber-400/40 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="font-serif-display font-bold text-xs sm:text-sm tracking-wider uppercase text-white">
              VIAJE COM QUEM ENTENDE DE DESTINO
            </h2>
          </div>
        </div>

        {/* Two Column Layout mirroring the Flyer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT SIDE: Headline, Agendamento CTA, and Route Line */}
          <div className="lg:col-span-6 space-y-6">
            {/* Value Proposition Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Transfer Executivo Porta a Porta & Shuttle Oficial</span>
            </div>

            {/* Main Catchphrase */}
            <div className="space-y-3">
              <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                Seu transfer seguro e pontual para o{' '}
                <span className="text-sky-700 relative inline-block">
                  Litoral Norte
                  <svg className="absolute w-full h-2 -bottom-1 left-0 text-amber-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10, 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Transporte executivo porta a porta e shuttle compartilhado em{' '}
                <strong className="text-slate-900">Chevrolet Spin 7 Lugares</strong> com ar-condicionado duplo, motoristas profissionais e saídas diárias.
              </p>
            </div>

            {/* Agendamento de Viagens Button / Badge (From Flyer) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onScrollToBooking}
                id="hero-agendamento-btn"
                className="bg-slate-900 hover:bg-slate-800 text-slate-100 hover:text-white px-6 sm:px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 border-2 border-amber-400 transform active:scale-95 cursor-pointer group"
              >
                <div className="p-2 rounded-xl bg-amber-400 text-slate-950 group-hover:rotate-6 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-normal text-slate-300 uppercase tracking-wider">Garanta sua vaga</div>
                  <div className="font-serif-display tracking-wide font-extrabold text-white">AGENDAMENTO DE VIAGENS</div>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenAIAdvisor}
                className="px-4 py-3 rounded-2xl border border-sky-300 hover:border-sky-500 text-sky-800 bg-white hover:bg-sky-50 font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Planejar Rota com IA</span>
              </button>
            </div>

            {/* Route Line Banner (From Flyer) */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl border-l-4 border-amber-400 shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold block">
                    Linha Direta de Transfer
                  </span>
                  <span className="font-bold text-sm sm:text-base tracking-wide text-white">
                    SÃO PAULO ⇌ LITORAL — SÃO SEBASTIÃO · ILHA BELA · CARAGUÁ
                  </span>
                </div>
              </div>
            </div>

            {/* Key feature pills */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-900 block">100% Seguro</span>
                <span className="text-[10px] text-slate-500">Motoristas Credenciados</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-xs">
                <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-900 block">Pontualidade</span>
                <span className="text-[10px] text-slate-500">Sem esperas no aeroporto</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-xs">
                <Award className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-900 block">7 Lugares</span>
                <span className="text-[10px] text-slate-500">Chevrolet Spin Executiva</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: 3 Stacked Destination Image Cards (From Flyer) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Destinos Atendidos</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">Saídas de São Paulo & Litoral</span>
            </div>

            {DESTINATIONS.map((dest, idx) => (
              <div
                key={dest.id}
                onClick={() => {
                  onSelectDestination(dest.name);
                  onScrollToBooking();
                }}
                id={`hero-destination-card-${dest.id}`}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-amber-400 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-stretch"
              >
                {/* Destination Image */}
                <div className="sm:w-44 h-36 sm:h-auto relative overflow-hidden flex-shrink-0 bg-slate-900">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute top-2 left-2 bg-slate-950/85 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/40">
                    {dest.highlightBadge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        <h4 className="font-serif-display font-bold text-lg text-slate-900 group-hover:text-sky-700 transition-colors">
                          {dest.name}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        ~{dest.estimatedTimeHours}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 font-medium mb-2">
                      {dest.tagline}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {dest.popularSpots.slice(0, 3).map((spot, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200"
                        >
                          {spot}
                        </span>
                      ))}
                      {dest.popularSpots.length > 3 && (
                        <span className="text-[10px] text-sky-700 font-semibold self-center">
                          +{dest.popularSpots.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                    <div className="text-xs">
                      <span className="text-slate-500 text-[11px] block">A partir de</span>
                      <span className="font-bold text-sm text-slate-900">
                        R$ {dest.startingPriceIndividual},00{' '}
                        <span className="text-[10px] font-normal text-slate-500">privativo</span>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 group-hover:text-amber-600 transition-colors">
                      <span>Agendar</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
