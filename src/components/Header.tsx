import React, { useState } from 'react';
import { BRAND_IMAGES, COMPANY_CONTACT } from '../data/mockData';
import { Calendar, Phone, MapPin, Menu, X, Search, Sparkles, Car } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'admin' | 'driver' | 'tracking';
  setCurrentView: (view: 'landing' | 'admin' | 'driver' | 'tracking') => void;
  onOpenTrackModal: () => void;
  onOpenAIModal: () => void;
  onScrollToBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenTrackModal,
  onOpenAIModal,
  onScrollToBooking,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white transition-all w-full max-w-full">
      {/* Subtle Top Micro-Bar */}
      <div className="bg-slate-900/90 text-xs py-1.5 px-3 sm:px-6 text-slate-300 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs text-slate-300 truncate">
              <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span className="truncate">São Paulo ⇌ Litoral Norte (São Sebastião · Ilhabela · Caraguá)</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <button
              onClick={onOpenAIModal}
              id="header-ai-advisor-btn"
              className="hidden md:inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-200 px-2.5 py-0.5 rounded-full border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Dicas de Rota com IA</span>
            </button>

            <a
              href={`https://wa.me/${COMPANY_CONTACT.phoneRaw}?text=Ol%C3%A1%20Michelly!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20transfer%20Litoral%20em%20Movimento.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors text-[11px] sm:text-xs"
              title="Fale com Michelly pelo WhatsApp"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                <span className="hidden sm:inline">{COMPANY_CONTACT.name}: </span>
                <strong className="text-white font-semibold">{COMPANY_CONTACT.phone}</strong>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center gap-3">
        {/* Brand Logo & Wordmark */}
        <div
          onClick={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0 flex-shrink"
          id="header-brand-logo"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-amber-400/80 shadow-xs bg-slate-900 flex items-center justify-center">
              <img
                src={BRAND_IMAGES.logo}
                alt="Litoral em Movimento Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <span className="font-serif-display font-extrabold text-base sm:text-lg tracking-wide text-white leading-none whitespace-nowrap">
              LITORAL
            </span>
            <span className="font-serif-display font-bold text-[10px] sm:text-xs tracking-widest text-amber-400 leading-tight whitespace-nowrap mt-0.5">
              EM MOVIMENTO
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors hover:text-white cursor-pointer ${
              currentView === 'landing' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Início
          </button>
          <button
            onClick={() => navigateToSection('como-funciona')}
            className="transition-colors hover:text-white cursor-pointer"
          >
            Como Funciona
          </button>
          <button
            onClick={() => navigateToSection('servicos')}
            className="transition-colors hover:text-white cursor-pointer"
          >
            Serviços
          </button>
          <button
            onClick={() => navigateToSection('destinos')}
            className="transition-colors hover:text-white cursor-pointer"
          >
            Destinos
          </button>
          <button
            onClick={() => navigateToSection('frota')}
            className="transition-colors hover:text-white cursor-pointer"
          >
            Frota Spin
          </button>
          <button
            onClick={() => navigateToSection('faq')}
            className="transition-colors hover:text-white cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Quick Track Ride Button */}
          <button
            onClick={onOpenTrackModal}
            id="nav-track-ride-btn"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>Rastrear Viagem</span>
          </button>

          {/* Main Booking CTA */}
          <button
            onClick={() => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
                setTimeout(onScrollToBooking, 100);
              } else {
                onScrollToBooking();
              }
            }}
            id="header-booking-btn"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer transform active:scale-95 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 flex-shrink-0" />
            <span>AGENDAR VIAGEM</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Abrir menu de navegação"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => {
                setCurrentView('landing');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-white"
            >
              Início
            </button>
            <button
              onClick={() => navigateToSection('como-funciona')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              Como Funciona
            </button>
            <button
              onClick={() => navigateToSection('servicos')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              Serviços
            </button>
            <button
              onClick={() => navigateToSection('destinos')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              Destinos (São Sebastião · Ilhabela · Caraguá)
            </button>
            <button
              onClick={() => navigateToSection('frota')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              Frota Chevrolet Spin
            </button>
            <button
              onClick={() => navigateToSection('faq')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              Perguntas Frequentes (FAQ)
            </button>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  onOpenTrackModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left py-2 px-3 rounded-lg bg-slate-900 text-slate-200 border border-slate-800"
              >
                <Search className="w-4 h-4 text-sky-400" />
                <span>Rastrear Viagem (Código ou Telefone)</span>
              </button>

              <button
                onClick={() => {
                  onOpenAIModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left py-2 px-3 rounded-lg bg-slate-900 text-slate-200 border border-slate-800"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Planejar Rota com IA</span>
              </button>

              <a
                href={`https://wa.me/${COMPANY_CONTACT.phoneRaw}?text=Ol%C3%A1%20Michelly!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20transfer%20Litoral%20em%20Movimento.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Falar no WhatsApp ({COMPANY_CONTACT.phone})</span>
              </a>

              <button
                onClick={() => {
                  setCurrentView('landing');
                  setMobileMenuOpen(false);
                  setTimeout(onScrollToBooking, 100);
                }}
                className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>AGENDAR TRANSFER AGORA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
