import React, { useState } from 'react';
import { OFFICIAL_TIMETABLE, COMPANY_CONTACT } from '../data/mockData';
import {
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Car,
  Plane,
  Sparkles,
  Phone,
  Headphones,
  MessageSquare,
} from 'lucide-react';

interface TimetableSectionProps {
  onSelectRouteTime?: (origin: string, destination: string, time: string, tripType: 'Individual' | 'Compartilhada') => void;
  onScrollToBooking: () => void;
  onOpenContactModal?: () => void;
}

export const TimetableSection: React.FC<TimetableSectionProps> = ({
  onSelectRouteTime,
  onScrollToBooking,
  onOpenContactModal,
}) => {
  const [activeTab, setActiveTab] = useState<'subida' | 'descida'>('subida');

  const handleBookSlot = (from: string, to: string, time: string) => {
    let orig = 'São Sebastião';
    let dest = 'São Paulo';

    if (activeTab === 'subida') {
      if (from.includes('Caraguatatuba')) {
        orig = 'Caraguatatuba (Rodoviária / Sentido S. Sebastião)';
      } else {
        orig = 'São Sebastião';
      }

      if (to.includes('Guarulhos')) {
        dest = 'São Paulo';
      } else {
        dest = 'São Paulo';
      }
    } else {
      orig = 'São Paulo';
      if (to.includes('Caraguatatuba')) {
        dest = 'Caraguatatuba (Rodoviária / Sentido S. Sebastião)';
      } else if (to.includes('Ilhabela') || to.includes('Balsa')) {
        dest = 'Ilhabela (Balsa São Sebastião)';
      } else {
        dest = 'São Sebastião';
      }
    }

    if (onSelectRouteTime) {
      onSelectRouteTime(orig, dest, time, 'Compartilhada');
    }
    onScrollToBooking();
  };

  return (
    <section id="horarios" className="py-16 sm:py-24 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Horários & Tarifas Oficiais de Linha</span>
          </div>

          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Quadro de Horários e Valores por Vaga
          </h2>

          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Viagens regulares entre o <strong>Metrô Portuguesa-Tietê</strong>, <strong>Aeroporto de Guarulhos (GRU)</strong>, <strong>Caraguatatuba</strong> e a <strong>Balsa de São Sebastião</strong>.
          </p>

          {/* Average Travel Duration Banner */}
          <div className="mt-5 inline-flex items-center gap-2.5 bg-slate-900 text-white text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-sm border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Duração média da viagem:</span>
            <strong className="text-amber-300 font-bold font-mono">2h30 a 3h00</strong>
            <span className="text-slate-400 text-xs hidden sm:inline">(conforme condições da serra e rodovias)</span>
          </div>
        </div>

        {/* Tab Switcher: Subida vs Descida */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 inline-flex shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('subida')}
              className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'subida'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>SUBIDA (Litoral ➔ São Paulo / GRU)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('descida')}
              className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'descida'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-sky-400" />
              <span>DESCIDA (São Paulo / GRU ➔ Litoral)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: SUBIDA */}
        {activeTab === 'subida' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Rates Table (6 cols) */}
            <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    ↑
                  </div>
                  <div>
                    <h3 className="font-serif-display font-bold text-lg text-slate-900">
                      Tarifas de Subida (por passageiro)
                    </h3>
                    <span className="text-xs text-slate-500">
                      Vagas individuais na linha regular
                    </span>
                  </div>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                  Econômico
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wider">
                      Saída de São Sebastião
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      São Sebastião ➔ Metrô Portuguesa-Tietê
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Centro, balsa e pontos combinados
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Valor por vaga</span>
                    <strong className="text-xl font-serif-display font-extrabold text-slate-900">
                      R$ 90,00
                    </strong>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-sky-700 block uppercase tracking-wider">
                      Saída de Caraguatatuba
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Caraguatatuba ➔ Metrô Portuguesa-Tietê
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      A partir da Rodoviária e sentido São Sebastião
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Valor por vaga</span>
                    <strong className="text-xl font-serif-display font-extrabold text-slate-900">
                      R$ 80,00
                    </strong>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-amber-700 block uppercase tracking-wider flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      Aeroporto Internacional
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Litoral ➔ Aeroporto de Guarulhos (GRU)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Desembarque direto nos terminais 2 e 3
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Valor por vaga</span>
                    <strong className="text-xl font-serif-display font-extrabold text-amber-600">
                      R$ 150,00
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Departure Times Grid (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Grade de Saídas
                  </span>
                  <h3 className="font-serif-display font-bold text-lg text-white">
                    Horários de Subida (Diariamente)
                  </h3>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 font-medium">
                  Segunda a Domingo
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Escolha o horário ideal para sua subida e garanta sua vaga com 50% de sinal via PIX:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {OFFICIAL_TIMETABLE.subida.timesDaily.map((slotTime, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-amber-400 transition-all text-center group flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">
                        {idx === 0 ? 'Madrugada' : idx === 1 ? 'Manhã' : idx === 2 ? 'Início Tarde' : 'Fim de Tarde'}
                      </span>
                      <strong className="text-2xl font-mono font-extrabold text-amber-300 block group-hover:scale-105 transition-transform">
                        {slotTime}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookSlot('São Sebastião', 'Metrô Portuguesa-Tietê', slotTime)}
                      className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Reservar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Point of Origin summary */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                  <span><strong>Pontos de Embarque:</strong> Balsa de São Sebastião, Centro, e Rodoviária de Caraguatatuba.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Tempo de Viagem:</strong> ~2h30 a 3h00 até São Paulo / Guarulhos.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: DESCIDA */}
        {activeTab === 'descida' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Rates Table (6 cols) */}
            <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    ↓
                  </div>
                  <div>
                    <h3 className="font-serif-display font-bold text-lg text-slate-900">
                      Tarifas de Descida (por passageiro)
                    </h3>
                    <span className="text-xs text-slate-500">
                      Saída de São Paulo / GRU rumo ao Litoral
                    </span>
                  </div>
                </div>
                <span className="text-xs bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full font-bold">
                  Linha Regular
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-sky-700 block uppercase tracking-wider">
                      Desembarque Caraguatatuba
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Metrô Portuguesa-Tietê ➔ Caraguatatuba
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Até a Rodoviária e bairros sentido São Sebastião
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Valor por vaga</span>
                    <strong className="text-xl font-serif-display font-extrabold text-slate-900">
                      R$ 80,00
                    </strong>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wider">
                      Desembarque São Sebastião
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Metrô Portuguesa-Tietê ➔ Balsa em São Sebastião
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Acesso direto à Balsa para Ilhabela ou Centro
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Valor por vaga</span>
                    <strong className="text-xl font-serif-display font-extrabold text-slate-900">
                      R$ 90,00
                    </strong>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-amber-700 block uppercase tracking-wider flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      Aeroporto Internacional
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Aeroporto de Guarulhos (GRU) ➔ Litoral
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Coleta nos terminais do Aeroporto de Guarulhos
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Valor por vaga</span>
                    <strong className="text-xl font-serif-display font-extrabold text-amber-600">
                      R$ 150,00
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Ponto de Embarque em SP:</strong> Metrô Portuguesa-Tietê (local de fácil acesso integrado a metrô e rodoviária) ou Aeroporto Internacional de Guarulhos (GRU).
                </span>
              </div>
            </div>

            {/* Departure Times Grid: Weekday vs Weekend (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Grade de Saídas
                </span>
                <h3 className="font-serif-display font-bold text-lg text-white">
                  Horários de Descida (São Paulo ➔ Litoral)
                </h3>
              </div>

              {/* Weekday Schedule */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Segunda a Sexta-feira:
                  </span>
                  <span className="text-[10px] text-slate-400">4 saídas programadas</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {OFFICIAL_TIMETABLE.descida.timesWeekday.map((slotTime, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleBookSlot('São Paulo', 'São Sebastião', slotTime)}
                      className="bg-slate-950 hover:bg-slate-850 p-3 rounded-2xl border border-slate-800 hover:border-amber-400 transition-all text-center group cursor-pointer"
                    >
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        {idx === 0 ? 'Almoço' : idx === 1 ? 'Tarde' : idx === 2 ? 'Fim de Tarde' : 'Noturno'}
                      </span>
                      <strong className="text-lg font-mono font-bold text-white group-hover:text-amber-400">
                        {slotTime}
                      </strong>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekend Schedule */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Sábados e Domingos (Horários Ajustados):
                  </span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md font-bold">
                    Finais de Semana
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {OFFICIAL_TIMETABLE.descida.timesWeekend.map((slotTime, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleBookSlot('São Paulo', 'São Sebastião', slotTime)}
                      className="bg-slate-950 hover:bg-slate-850 p-3 rounded-2xl border border-amber-500/40 hover:border-amber-400 transition-all text-center group cursor-pointer"
                    >
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        {idx === 0 ? 'Almoço' : idx === 1 ? '13:00 (Ajuste)' : idx === 2 ? 'Fim de Tarde' : '21:30 (Ajuste)'}
                      </span>
                      <strong className="text-lg font-mono font-bold text-amber-300 group-hover:text-amber-200">
                        {slotTime}
                      </strong>
                    </button>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Atenção Finais de Semana:</strong> A saída das 14:30 é antecipada para as <strong>13:00</strong> e a saída das 22:00 é antecipada para as <strong>21:30</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SAC / Atendimento Form Footer */}
        <div className="mt-10 p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Precisa de um horário personalizado ou tirar dúvidas?
              </h4>
              <p className="text-xs text-slate-500">
                Envie sua solicitação diretamente para nossa equipe de Atendimento SAC no painel administrativo.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenContactModal?.()}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 whitespace-nowrap border border-amber-400/30"
          >
            <span>Solicitar Atendimento SAC</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
