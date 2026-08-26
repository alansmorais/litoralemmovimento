import React from 'react';
import { Car, Wind, ShieldCheck, Wifi, BatteryCharging, Users, Luggage, CheckCircle2 } from 'lucide-react';

export const VehicleFleetSection: React.FC = () => {
  const fleetFeatures = [
    {
      icon: Users,
      title: 'Até 6 Passageiros + Motorista',
      description: 'Disposição flexível de assentos para acomodar famílias, casais ou grupos com conforto durante toda a viagem.',
    },
    {
      icon: Wind,
      title: 'Ar-Condicionado Duplo Digital',
      description: 'Climatização eficiente com saídas dedicadas para a frente e fileiras traseiras da cabine.',
    },
    {
      icon: Luggage,
      title: 'Porta-Malas Amplo',
      description: 'Espaço generoso para malas de viagem, pranchas de surf com capa e equipamentos de praia.',
    },
    {
      icon: BatteryCharging,
      title: 'Entradas USB e Carregamento',
      description: 'Pontos de recarga para manter seus smartphones sempre prontos durante o percurso.',
    },
    {
      icon: Wifi,
      title: 'Conectividade e Som Bluetooth',
      description: 'Ambiente tranquilo para você relaxar com suas músicas preferidas na descida da serra.',
    },
    {
      icon: ShieldCheck,
      title: 'Segurança & Regularização',
      description: 'Freios ABS, airbags, controle de estabilidade e credenciamento nos órgãos oficiais de transporte.',
    },
  ];

  return (
    <section id="frota" className="py-16 sm:py-24 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-950 text-sky-300 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-sky-800/60 mb-3">
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span>Nossa Frota</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Conforto para chegar bem ao destino
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mt-3 leading-relaxed">
            A Chevrolet Spin 7 Lugares oferece o equilíbrio ideal entre espaço interno, estabilidade na serra e suavidade no trajeto.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Seating Layout Blueprint */}
          <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                  Configuração Executiva da Cabine
                </span>
                <h3 className="font-serif-display font-bold text-xl sm:text-2xl text-white">
                  Chevrolet Spin Premier
                </h3>
              </div>
              <span className="bg-slate-900 text-amber-300 border border-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
                7 Assentos
              </span>
            </div>

            {/* Visual Cabin Blueprint */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-medium text-slate-300">Acomodação dos assentos:</span>
                <span className="text-amber-400 font-mono text-[11px]">Capacidade: 6 passageiros + motorista</span>
              </div>

              {/* Row 1 */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  1ª Fileira (Dianteira)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 border border-amber-400/40 p-2.5 rounded-xl flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                      M
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Motorista Profissional</span>
                      <span className="text-[10px] text-slate-400">Credenciado</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Assento Dianteiro</span>
                      <span className="text-[10px] text-slate-400">Visão ampla</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  2ª Fileira (Intermediária com Ar Duplo)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((seatNum) => (
                    <div key={seatNum} className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center">
                      <div className="w-6 h-6 rounded-md bg-sky-600 text-white font-bold flex items-center justify-center text-xs mx-auto mb-1">
                        {seatNum}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 block">Passageiro</span>
                      <span className="text-[9px] text-slate-400">Reclinável</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3 */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  3ª Fileira (Traseira Modular)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[5, 6].map((seatNum) => (
                    <div key={seatNum} className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-sky-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {seatNum}
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-200 block">Assento {seatNum}</span>
                        <span className="text-[9px] text-slate-400">Cintos de 3 pontos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trunk Capacity */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Luggage className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Porta-malas espaçoso para bagagens</span>
                </div>
                <span className="text-amber-300 font-semibold text-[11px]">Até 710 Litros</span>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block text-sm">1.8 Flex</span>
                <span className="text-[10px] text-slate-400">Motorização Confiável</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-sky-400 font-bold block text-sm">Automático</span>
                <span className="text-[10px] text-slate-400">Trocas Suaves</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block text-sm">Ar Duplo</span>
                <span className="text-[10px] text-slate-400">Climatização Traseira</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fleetFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/80 p-5 rounded-2xl transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif-display font-bold text-white text-base mb-1.5">
                    {feat.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
