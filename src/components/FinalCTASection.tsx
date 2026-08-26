import React from 'react';
import { Calendar, Phone, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';

interface FinalCTAProps {
  onScrollToBooking: () => void;
}

export const FinalCTASection: React.FC<FinalCTAProps> = ({ onScrollToBooking }) => {
  return (
    <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-800 text-amber-400 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-slate-700 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>São Paulo ⇌ Litoral Norte Paulista</span>
        </div>

        <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
          Seu destino está mais perto do que parece.
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Escolha sua rota, consulte horários disponíveis e viaje com o conforto e a pontualidade que você merece.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onScrollToBooking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform active:scale-95"
            id="final-cta-booking-btn"
          >
            <Calendar className="w-5 h-5 text-slate-950" />
            <span>RESERVE SUA VAGA</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <a
            href={`https://wa.me/${COMPANY_CONTACT.phoneRaw}?text=Ol%C3%A1%20Michelly!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20transfer%20Litoral%20em%20Movimento.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base px-6 py-4 rounded-xl border border-slate-700 transition-all"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>FALE PELO WHATSAPP</span>
          </a>
        </div>

        {/* Quick Highlights */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Transfer privativo ou compartilhado
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Saídas diárias de São Paulo e Litoral
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Atendimento direto com confirmação
          </span>
        </div>
      </div>
    </section>
  );
};
