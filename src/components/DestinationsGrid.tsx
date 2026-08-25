import React from 'react';
import { DESTINATIONS } from '../data/mockData';
import { MapPin, Navigation, Clock, Compass, ArrowRight, ShieldCheck, Sun, Waves } from 'lucide-react';

interface DestinationsGridProps {
  onSelectDestination: (destName: string) => void;
  onScrollToBooking: () => void;
}

export const DestinationsGrid: React.FC<DestinationsGridProps> = ({
  onSelectDestination,
  onScrollToBooking,
}) => {
  return (
    <section id="destinos" className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-slate-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-400/40 mb-3">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Rotas & Cidades Atendidas</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-wide">
            DESTINOS NO LITORAL NORTE
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Rotas seguras através da Rodovia dos Tamoios, Ayrton Senna/Carvalho Pinto e Rodovia dos Imigrantes.
          </p>
        </div>

        {/* 3 Large Destination Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Photo & Badge */}
              <div className="relative h-56 overflow-hidden bg-slate-900">
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <span className="absolute top-3 left-3 bg-slate-950/90 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/40 shadow-sm">
                  {dest.highlightBadge}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Litoral Norte Paulista</span>
                  </div>
                  <h3 className="font-serif-display text-2xl font-extrabold text-white mt-0.5">
                    {dest.name}
                  </h3>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-xs font-semibold text-sky-700 mb-2">{dest.tagline}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{dest.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block mb-2">
                      Principais Praias & Pontos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.popularSpots.map((spot, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded-lg border border-slate-200"
                        >
                          {spot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Info: Travel Time & Pricing */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Tempo médio: {dest.estimatedTimeHours}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ~{dest.estimatedDistanceKm} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Privativo a partir de</span>
                      <strong className="text-lg font-serif-display text-slate-900">
                        R$ {dest.startingPriceIndividual},00
                      </strong>
                    </div>

                    <button
                      onClick={() => {
                        onSelectDestination(dest.name);
                        onScrollToBooking();
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-100 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs group/btn cursor-pointer"
                    >
                      <span>Reservar</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
