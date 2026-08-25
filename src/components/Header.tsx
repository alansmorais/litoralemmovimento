import React, { useState } from 'react';
import { BRAND_IMAGES, BRAND_COLORS, COMPANY_CONTACT } from '../data/mockData';
import { Calendar, Phone, ShieldCheck, Clock, MapPin, Menu, X, Car, LayoutDashboard, Smartphone, Search, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

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

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white transition-all w-full max-w-full overflow-x-hidden">
      {/* Top micro-bar */}
      <div className="bg-slate-900 text-xs py-1.5 px-3 sm:px-4 text-slate-300 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="flex items-center gap-1.5 font-medium tracking-wide truncate text-[11px] sm:text-xs">
              <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span className="truncate">SÃO PAULO ⇌ LITORAL NORTE</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300 text-xs flex-shrink-0">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              Chevrolet Spin 7L
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={onOpenAIModal}
              id="header-ai-advisor-btn"
              className="hidden sm:inline-flex items-center gap-1 text-xs bg-sky-950/80 hover:bg-sky-900 text-white px-2.5 py-0.5 rounded-full border border-sky-600/40 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Dicas IA</span>
            </button>
            <a
              href={`https://wa.me/${COMPANY_CONTACT.phoneRaw}?text=Ol%C3%A1%20Michelly!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20transfer%20Litoral%20em%20Movimento.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-amber-400 transition-colors text-[11px] sm:text-xs"
              title="Fale com Michelly pelo WhatsApp"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="font-semibold text-slate-200">
                <span className="hidden xs:inline">Michelly: </span>
                <strong className="text-amber-300 font-bold">{COMPANY_CONTACT.phone}</strong>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center gap-2 sm:gap-4">
        {/* Brand Logo & Wordmark */}
        <div
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 flex-shrink"
          id="header-brand-logo"
        >
          {/* Circular Emblem Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shadow-black/50 group-hover:scale-105 transition-transform bg-slate-900 flex items-center justify-center">
              <img
                src={BRAND_IMAGES.logo}
                alt="Litoral em Movimento Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
            </div>
            {/* Gold Arc Accent */}
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 border-2 border-slate-950" />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <span className="font-serif-display font-extrabold text-sm xs:text-base sm:text-xl lg:text-2xl tracking-wider text-white leading-none whitespace-nowrap">
              LITORAL
            </span>
            <span className="font-serif-display font-bold text-[9px] xs:text-[10px] sm:text-xs lg:text-sm tracking-wider sm:tracking-widest text-amber-400 leading-tight whitespace-nowrap mt-0.5">
              EM MOVIMENTO
            </span>
            <p className="hidden md:flex text-[10px] text-slate-400 tracking-widest uppercase font-medium items-center gap-1 mt-0.5">
              <span>Conforto</span> • <span>Segurança</span> • <span>Pontualidade</span>
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-200">
          <button
            onClick={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors hover:text-amber-400 cursor-pointer ${
              currentView === 'landing' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Início
          </button>
          <a
            href="#o-que-oferecemos"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                setCurrentView('landing');
                setTimeout(() => {
                  document.getElementById('o-que-oferecemos')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="transition-colors hover:text-amber-400"
          >
            O Que Oferecemos
          </a>
          <a
            href="#destinos"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                setCurrentView('landing');
                setTimeout(() => {
                  document.getElementById('destinos')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="transition-colors hover:text-amber-400"
          >
            Destinos
          </a>
          <a
            href="#frota"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                setCurrentView('landing');
                setTimeout(() => {
                  document.getElementById('frota')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="transition-colors hover:text-amber-400"
          >
            Frota Spin 7L
          </a>

          {/* Quick Track Ride Button */}
          <button
            onClick={onOpenTrackModal}
            id="nav-track-ride-btn"
            className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>Rastrear Viagem</span>
          </button>
        </nav>

        {/* Action Buttons & Portal Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
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
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-95 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 flex-shrink-0" />
            <span className="hidden sm:inline">AGENDAR VIAGEM</span>
            <span className="sm:hidden">AGENDAR</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Abrir menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2 text-sm font-medium">
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
            <a
              href="#o-que-oferecemos"
              onClick={() => {
                setCurrentView('landing');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-white"
            >
              O Que Oferecemos
            </a>
            <a
              href="#destinos"
              onClick={() => {
                setCurrentView('landing');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-white"
            >
              Destinos (São Sebastião · Ilhabela · Caraguá)
            </a>
            <a
              href="#frota"
              onClick={() => {
                setCurrentView('landing');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-white"
            >
              Frota Chevrolet Spin 7 Lugares
            </a>
            <button
              onClick={() => {
                onOpenTrackModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left py-2 px-3 rounded-lg bg-slate-800 text-slate-200"
            >
              <Search className="w-4 h-4 text-sky-400" />
              <span>Rastrear Viagem (Código ou Telefone)</span>
            </button>
            <button
              onClick={() => {
                onOpenAIModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left py-2 px-3 rounded-lg bg-sky-950 text-white border border-sky-700/50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Dicas de Rota & Balsa com IA</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('landing');
                setMobileMenuOpen(false);
                setTimeout(onScrollToBooking, 100);
              }}
              className="w-full mt-2 bg-amber-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>AGENDAMENTO DE VIAGENS</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
