import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WhatWeOfferSection } from './components/WhatWeOfferSection';
import { TimetableSection } from './components/TimetableSection';
import { BookingFormSection } from './components/BookingFormSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ServicesSection } from './components/ServicesSection';
import { DestinationsGrid } from './components/DestinationsGrid';
import { VehicleFleetSection } from './components/VehicleFleetSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { FAQSection } from './components/FAQSection';
import { FinalCTASection } from './components/FinalCTASection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { TrackRideModal } from './components/TrackRideModal';
import { AISmartAssistantModal } from './components/AISmartAssistantModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { FloatingContactButton } from './components/FloatingContactButton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Reservation, TripType } from './types';
import { StorageService } from './services/storageService';

function getInitialView(): 'landing' | 'admin' {
  try {
    const isAuth = typeof window !== 'undefined' && sessionStorage.getItem('litoral_admin_auth') === 'true';
    if (!isAuth) return 'landing';

    // 1. Check URL parameters: ?view=admin or ?mode=admin
    const params = new URLSearchParams(window.location.search);
    const viewParam = (params.get('view') || params.get('app') || params.get('mode') || '').toLowerCase();
    if (viewParam === 'admin' || viewParam === 'gestao') return 'admin';
    if (viewParam === 'landing' || viewParam === 'cliente' || viewParam === 'site') return 'landing';

    // 2. Check URL Hash: #admin, #gestao
    const hash = window.location.hash.toLowerCase();
    if (hash === '#admin' || hash === '#gestao') return 'admin';

    // 3. Check URL Pathname: /admin
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/admin')) return 'admin';

    // 4. Saved preference
    const preferred = StorageService.getPreferredView();
    if (preferred === 'admin') return 'admin';
  } catch (e) {
    // Ignore error in non-browser environments
  }
  return 'landing';
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>(getInitialView);
  const [selectedDestination, setSelectedDestination] = useState<string>('São Sebastião');
  const [preloadRoute, setPreloadRoute] = useState<{
    origin: string;
    destination: string;
    time: string;
    tripType: TripType;
  } | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackRideCode, setTrackRideCode] = useState<string>('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);

  // Sync with URL changes, hashes, and navigation events
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const viewParam = (params.get('view') || params.get('app') || '').toLowerCase();

      if (hash === '#admin' || hash === '#gestao' || viewParam === 'admin') {
        const isAuth = sessionStorage.getItem('litoral_admin_auth') === 'true';
        if (isAuth) {
          setCurrentView('admin');
        } else {
          setIsAdminAuthOpen(true);
        }
      } else if (hash === '#rastreio' || hash === '#tracking') {
        setIsTrackModalOpen(true);
      } else if (hash === '#reservas' || hash === '#cliente' || hash === '#publico') {
        setCurrentView('landing');
      }
    };

    // Deferred background synchronization with central server backend & Google Sheets
    const syncTimer = setTimeout(() => {
      StorageService.syncWithServer().catch((e) => console.warn('Boot sync with server:', e));
      StorageService.fetchFromGoogleSheets().catch((e) => console.warn('Boot sync with Google Sheets:', e));
    }, 1500);

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      clearTimeout(syncTimer);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleSelectSystem = (view: 'landing' | 'admin') => {
    StorageService.setPreferredView(view);
    if (view === 'landing') {
      window.location.hash = 'reservas';
      setCurrentView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'admin') {
      const isAuth = sessionStorage.getItem('litoral_admin_auth') === 'true';
      if (isAuth) {
        window.location.hash = 'admin';
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setIsAdminAuthOpen(true);
      }
    }
  };

  const scrollToBooking = () => {
    const el = document.getElementById('agendar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectRouteTime = (origin: string, destination: string, time: string, tripType: TripType) => {
    setPreloadRoute({ origin, destination, time, tripType });
    const el = document.getElementById('agendar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDestinations = () => {
    const el = document.getElementById('destinos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdmin = () => {
    handleSelectSystem('admin');
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthOpen(false);
    window.location.hash = 'admin';
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('litoral_admin_auth');
    sessionStorage.removeItem('litoral_admin_auth_time');
    StorageService.setPreferredView('landing');
    window.location.hash = 'reservas';
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrackModal = (code?: string) => {
    if (code) {
      setTrackRideCode(code);
    }
    setIsTrackModalOpen(true);
  };

  const handleSelectDestination = (destName: string) => {
    setSelectedDestination(destName);
  };

  const handleBookingSuccess = (reservation: Reservation) => {
    // Reservation booked successfully
  };

  return (
    <div
      className="w-full min-h-[100dvh] flex flex-col overflow-x-hidden bg-slate-50 text-slate-900 justify-between"
    >
      {/* 1. Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenTrackModal={() => handleOpenTrackModal()}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onScrollToBooking={scrollToBooking}
        onOpenContactModal={() => setIsContactModalOpen(true)}
      />

      {/* Main Content Area based on active view */}
      <main className="flex-1 flex flex-col w-full">
        {currentView === 'landing' && (
          <>
            {/* 2. Hero Section */}
            <HeroSection
              onSelectDestination={handleSelectDestination}
              onScrollToBooking={scrollToBooking}
              onScrollToDestinations={scrollToDestinations}
              onOpenAIModal={() => setIsAIModalOpen(true)}
            />

            {/* 3. Quick Trust / Benefits */}
            <WhatWeOfferSection />

            {/* 3.5 Quadro de Horários & Tarifas Oficiais */}
            <TimetableSection
              onSelectRouteTime={handleSelectRouteTime}
              onScrollToBooking={scrollToBooking}
            />

            {/* 4. Booking Section Standard Inline */}
            <div id="agendar" className="py-16 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white px-4 sm:px-6 border-y border-amber-400/20">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 inline-block shadow-sm">
                    Sistema Oficial de Agendamento 24h
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold font-serif-display tracking-tight text-white leading-tight">
                    Reserve Seu Transfer Executivo ou Compartilhado
                  </h2>
                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                    Frota oficial Chevrolet Spin 7 Lugares com ar-condicionado duplo, Wi-Fi e motoristas profissionais cadastrados. Garanta sua vaga com apenas 50% de sinal.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl">
                  <BookingFormSection
                    initialDestination={selectedDestination}
                    preloadRoute={preloadRoute}
                    onBookingSuccess={handleBookingSuccess}
                    onOpenTrackModal={handleOpenTrackModal}
                  />
                </div>
              </div>
            </div>

            {/* 5. Como Funciona */}
            <HowItWorksSection onScrollToBooking={scrollToBooking} />

            {/* 6. Serviços */}
            <ServicesSection onScrollToBooking={scrollToBooking} />

            {/* 7. Destinos */}
            <DestinationsGrid
              onSelectDestination={handleSelectDestination}
              onScrollToBooking={scrollToBooking}
            />

            {/* 8. Frota */}
            <VehicleFleetSection />

            {/* 9. Por Que Litoral em Movimento */}
            <WhyChooseUsSection />

            {/* 10. FAQ Section */}
            <FAQSection />

            {/* 11. Final Conversion CTA */}
            <FinalCTASection
              onScrollToBooking={scrollToBooking}
              onOpenContactModal={() => setIsContactModalOpen(true)}
            />

            {/* 12. Footer */}
            <Footer
              onScrollToBooking={scrollToBooking}
              onOpenAdmin={handleOpenAdmin}
              onOpenContactModal={() => setIsContactModalOpen(true)}
            />

            {/* Floating Contact & Support Button */}
            <FloatingContactButton onOpenContactModal={() => setIsContactModalOpen(true)} />

            {/* Mobile Bottom Responsive Navigation */}
            <MobileBottomNav
              onScrollToBooking={scrollToBooking}
              onOpenTrackModal={() => handleOpenTrackModal()}
              onOpenContactModal={() => setIsContactModalOpen(true)}
              onNavigateHome={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateHorarios={() => {
                const el = document.getElementById('horarios');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </>
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onBackToSite={handleLogoutAdmin}
          />
        )}
      </main>

      {/* Modals */}
      <TrackRideModal
        isOpen={isTrackModalOpen}
        initialCode={trackRideCode}
        onClose={() => {
          setIsTrackModalOpen(false);
          setTrackRideCode('');
        }}
      />

      <AISmartAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <ContactSupportModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />
    </div>
  );
}
