import React from 'react';
import { BRAND_IMAGES } from '../data/mockData';
import { Car, Wind, ShieldCheck, Wifi, BatteryCharging, Sparkles, CheckCircle2, Users, Luggage } from 'lucide-react';

export const VehicleFleetSection: React.FC = () => {
  const fleetFeatures = [
    {
      icon: Users,
      title: '7 Assentos Confortáveis',
      description: 'Configuração versátil para famílias, grupos de amigos ou executivos com espaço para pernas.',
    },
    {
      icon: Wind,
      title: 'Ar-Condicionado Duplo Digital',
      description: 'Climatização independente para a frente e fileiras traseiras, essencial no calor do litoral.',
    },
    {
      icon: Luggage,
      title: 'Porta-Malas Amplo',
      description: 'Acomoda malas de viagem, pranchas de surf com proteção e equipamentos de praia.',
    },
    {
      icon: BatteryCharging,
      title: 'Tomadas USB & Carregamento',
      description: 'Pontos de recarga para smartphones e notebooks durante todo o trajeto da serra.',
    },
    {
      icon: Wifi,
      title: 'Wi-Fi a Bordo & Som Bluetooth',
      description: 'Conectividade ininterrupta para você trabalhar ou relaxar com suas playlists favoritas.',
    },
    {
      icon: ShieldCheck,
      title: 'Segurança Máxima & Cadastur',
      description: 'Freios ABS, airbags múltiplos, controle de estabilidade e credenciamento oficial nos órgãos de transporte.',
    },
  ];

  return (
    <section id="frota" className="py-14 sm:py-20 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-950 text-sky-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-sky-800/60 mb-3">
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span>Nossa Frota Executiva</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
            CHEVROLET SPIN 7 LUGARES
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            A minivan perfeita para sua viagem: conforto incomparável, espaço inteligente e suavidade na serra.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Vehicle Architecture & Cabin Capacity Showcase */}
          <div className="lg:col-span-6 bg-slate-800/95 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Configuração Executiva da Cabine
                </span>
                <h3 className="font-serif-display font-extrabold text-xl sm:text-2xl text-white">
                  Chevrolet Spin Premier 7L
                </h3>
              </div>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold px-3 py-1 rounded-full">
                Frota 2024
              </span>
            </div>

            {/* Visual Cabin Seating Map / Blueprint */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-300">Mapa de Acomodação dos 7 Assentos:</span>
                <span className="text-amber-400 font-mono text-[11px]">Capacidade Total: 6 Passageiros + Motorista</span>
              </div>

              {/* Row 1: Driver + Front Passenger */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  1ª Fileira (Dianteira)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 border border-amber-400/40 p-2.5 rounded-xl flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                      M
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Motorista Profissional</span>
                      <span className="text-[10px] text-slate-400">Credenciado Cadastur</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Assento Dianteiro</span>
                      <span className="text-[10px] text-slate-400">Visão panorâmica</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: 3 Passengers */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  2ª Fileira (Intermediária com Ar Duplo)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((seatNum) => (
                    <div key={seatNum} className="bg-slate-900 border border-slate-700 p-2 rounded-xl text-center">
                      <div className="w-6 h-6 rounded-md bg-sky-600/80 text-white font-bold flex items-center justify-center text-xs mx-auto mb-1">
                        {seatNum}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 block">Passageiro</span>
                      <span className="text-[9px] text-slate-400">Reclinável</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: 2 Passengers + Modular Space */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  3ª Fileira (Traseira Confort)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[5, 6].map((seatNum) => (
                    <div key={seatNum} className="bg-slate-900 border border-slate-700 p-2 rounded-xl flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-sky-600/80 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {seatNum}
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-200 block">Assento {seatNum}</span>
                        <span className="text-[9px] text-slate-400">Cintos 3 pontos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trunk Capacity Row */}
              <div className="bg-slate-900/90 border border-amber-400/30 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Luggage className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Porta-malas espaçoso para bagagens e compras</span>
                </div>
                <span className="text-amber-300 font-bold text-[11px]">Até 710 Litros</span>
              </div>
            </div>

            {/* Quick Spec Tags */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-amber-400 font-bold block text-sm">1.8 Flex</span>
                <span className="text-[10px] text-slate-400">Motorização Forte</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-sky-400 font-bold block text-sm">Automático</span>
                <span className="text-[10px] text-slate-400">6 Marchas Suaves</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-amber-400 font-bold block text-sm">Ar Duplo</span>
                <span className="text-[10px] text-slate-400">Digital p/ Traseira</span>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fleetFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700 hover:border-amber-400 p-4 rounded-2xl transition-all hover:bg-slate-800"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-400 text-amber-400 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif-display font-bold text-white text-sm mb-1">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
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
