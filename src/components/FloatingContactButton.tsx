import React from 'react';
import { MessageSquare, Headphones } from 'lucide-react';

interface FloatingContactButtonProps {
  onOpenContactModal: () => void;
}

export const FloatingContactButton: React.FC<FloatingContactButtonProps> = ({ onOpenContactModal }) => {
  return (
    <aside aria-label="Atendimento e Suporte">
      <button
        onClick={onOpenContactModal}
        id="floating-support-modal-btn"
        className="fixed bottom-5 right-5 z-40 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-400/50 p-3 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2.5 group transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Fale Conosco / Suporte"
        aria-label="Abrir formulário de contato e suporte"
      >
        <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
          <Headphones className="w-4 h-4" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[11px] font-bold text-white leading-tight">
            Fale Conosco
          </span>
          <span className="text-[10px] text-amber-300 font-medium leading-tight">
            Central & Dúvidas
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>
    </aside>
  );
};
