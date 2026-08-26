import React from 'react';
import { Car, Users, Plane, Compass, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';

interface ServicesSectionProps {
  onScrollToBooking: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onScrollToBooking }) => {
  const services = [
    {
      id: 'privativo',
      title: 'Transfer Privativo Porta a Porta',
      description: 'Veículo exclusivo para você, sua família ou grupo. Embarque no endereço ou aeroporto de sua preferência direto até seu destino no litoral.',
      badge: 'Mais Escolhido',
      features: ['Horário 100% flexível', 'Até 6 passageiros + motorista', 'Paradas personalizadas', 'Privacidade total'],
      icon: Car,
      highlight: true,
    },
    {
      id: 'compartilhado',
      title: 'Shuttle Compartilhado',
      description: 'Vagas individuais em viagens programadas com excelente custo-benefício, mantendo o mesmo padrão de conforto e segurança.',
      badge: 'Econômico',
      features: ['Saídas programadas', 'Tarifa por assento individual', 'Veículo climatizado', 'Ideal para viagens solo'],
      icon: Users,
      highlight: false,
    },
    {
      id: 'aeroportos',
      title: 'Transfers para Aeroportos (GRU & CGH)',
      description: 'Recepção pontual nos terminais de Guarulhos e Congonhas com monitoramento do número do seu voo para evitar desencontros.',
      badge: 'Sem Estresse',
      features: ['Monitoramento de voo', 'Recepção nos terminais', 'Espaço para bagagens', 'Descida direta para a serra'],
      icon: Plane,
      highlight: false,
    },
    {
      id: 'eventos',
      title: 'Passeios & Viagens Especiais',
      description: 'Deslocamentos exclusivos para casamentos, eventos corporativos, praias distantes e passeios no Litoral Norte.',
      badge: 'Sob Medida',
      features: ['Disponibilidade diária', 'Roteiros de praias e cachoeiras', 'Atendimento a pousadas', 'Cobrança transparente'],
      icon: Compass,
      highlight: false,
    },
  ];

  return (
    <section id="servicos" className="py-16 sm:py-24 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-950 text-sky-300 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-sky-800/60 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Nossos Serviços</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Opções de transfer sob medida
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mt-3 leading-relaxed">
            Seja em viagem de férias, negócios ou finais de semana, temos o formato perfeito para o seu trajeto.
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className={`rounded-2xl p-6 sm:p-8 border transition-all flex flex-col justify-between ${
                  svc.highlight
                    ? 'bg-slate-800/90 border-amber-400 shadow-lg shadow-black/30'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        svc.highlight
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {svc.badge}
                    </span>
                  </div>

                  <h3 className="font-serif-display font-bold text-xl sm:text-2xl text-white mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {svc.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-slate-800 mb-6">
                    {svc.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onScrollToBooking}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    svc.highlight
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Solicitar disponibilidade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
