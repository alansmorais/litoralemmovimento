import React from 'react';
import { Calendar, Search, Clock, Phone, Home } from 'lucide-react';

interface MobileBottomNavProps {
  onScrollToBooking: () => void;
  onOpenTrackModal: () => void;
  onOpenContactModal: () => void;
  onNavigateHome: () => void;
  onNavigateHorarios: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onScrollToBooking,
  onOpenTrackModal,
  onOpenContactModal,
  onNavigateHome,
  onNavigateHorarios,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-white px-2 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={onNavigateHome}
        className="flex flex-col items-center justify-center p-1.5 text-slate-300 hover:text-amber-400 text-[10px] font-medium transition-colors cursor-pointer"
        aria-label="Início"
      >
        <Home className="w-5 h-5 text-amber-400 mb-0.5" />
        <span>Início</span>
      </button>

      <button
        onClick={onNavigateHorarios}
        className="flex flex-col items-center justify-center p-1.5 text-slate-300 hover:text-amber-400 text-[10px] font-medium transition-colors cursor-pointer"
        aria-label="Horários"
      >
        <Clock className="w-5 h-5 text-sky-400 mb-0.5" />
        <span>Horários</span>
      </button>

      <button
        onClick={onScrollToBooking}
        className="flex flex-col items-center justify-center p-2 bg-amber-400 text-slate-950 rounded-2xl shadow-lg font-extrabold text-[11px] transform active:scale-95 transition-all cursor-pointer -mt-4 border-2 border-slate-950"
        aria-label="Agendar"
      >
        <Calendar className="w-5 h-5 text-slate-950 mb-0.5" />
        <span>Agendar</span>
      </button>

      <button
        onClick={onOpenTrackModal}
        className="flex flex-col items-center justify-center p-1.5 text-slate-300 hover:text-amber-400 text-[10px] font-medium transition-colors cursor-pointer"
        aria-label="Rastrear"
      >
        <Search className="w-5 h-5 text-emerald-400 mb-0.5" />
        <span>Rastrear</span>
      </button>

      <button
        onClick={onOpenContactModal}
        className="flex flex-col items-center justify-center p-1.5 text-slate-300 hover:text-amber-400 text-[10px] font-medium transition-colors cursor-pointer"
        aria-label="Contato"
      >
        <Phone className="w-5 h-5 text-amber-400 mb-0.5" />
        <span>Contato</span>
      </button>
    </nav>
  );
};
