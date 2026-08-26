import React from 'react';
import { MessageCircle } from 'lucide-react';
import { COMPANY_CONTACT } from '../data/mockData';

export const FloatingWhatsApp: React.FC = () => {
  const message = encodeURIComponent('Olá Michelly! Gostaria de informações sobre o transfer da Litoral em Movimento.');
  const whatsappLink = `https://wa.me/${COMPANY_CONTACT.phoneRaw}?text=${message}`;

  return (
    <aside aria-label="Atendimento rápido WhatsApp">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        className="fixed bottom-5 right-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 group transform hover:scale-105 active:scale-95"
        title="Fale conosco no WhatsApp"
        aria-label="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white flex-shrink-0" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Fale com a gente
        </span>
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
      </a>
    </aside>
  );
};
