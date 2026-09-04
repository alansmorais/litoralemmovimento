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
import { FloatingContactButton } from './components/FloatingContactButton';
import { AdminDashboard } from './components/AdminDashboard';
import { TrackRideModal } from './components/TrackRideModal';
import { AISmartAssistantModal } from './components/AISmartAssistantModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { AdminAuthModal } from './components/AdminAuthModal';
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

    // Initial synchronization with central server backend & Google Sheets
    StorageService.syncWithServer().catch((e) => console.warn('Boot sync with server:', e));
    StorageService.fetchFromGoogleSheets().catch((e) => console.warn('Boot sync with Google Sheets:', e));

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
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
    // Reservation booked directly in system
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

            {/* 3. Quick Trust / Benefits (O Que Oferecemos) */}
            <WhatWeOfferSection />

            {/* 3.5 Quadro de Horários & Tarifas Oficiais */}
            <TimetableSection
              onSelectRouteTime={handleSelectRouteTime}
              onScrollToBooking={scrollToBooking}
            />

            {/* 4. Booking Section ("Reserve seu transfer") */}
            <BookingFormSection
              initialDestination={selectedDestination}
              preloadRoute={preloadRoute}
              onBookingSuccess={handleBookingSuccess}
              onOpenTrackModal={handleOpenTrackModal}
            />

            {/* 5. Como Funciona (3-Step Clear Flow) */}
            <HowItWorksSection onScrollToBooking={scrollToBooking} />

            {/* 6. Serviços (Privativo, Compartilhado, Aeroportos, Eventos) */}
            <ServicesSection onScrollToBooking={scrollToBooking} />

            {/* 7. Destinos (São Sebastião, Ilhabela, Caraguatatuba) */}
            <DestinationsGrid
              onSelectDestination={handleSelectDestination}
              onScrollToBooking={scrollToBooking}
            />

            {/* 8. Frota (Chevrolet Spin 7 Lugares) */}
            <VehicleFleetSection />

            {/* 9. Por Que Litoral em Movimento (Trust & Operational Strength) */}
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

            {/* Floating Contact & Support Button (Opens modal form) */}
            <FloatingContactButton onOpenContactModal={() => setIsContactModalOpen(true)} />
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
