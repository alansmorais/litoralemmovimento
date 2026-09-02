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
import { DriverAppView } from './components/DriverAppView';
import { TrackRideModal } from './components/TrackRideModal';
import { AISmartAssistantModal } from './components/AISmartAssistantModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { DriverAuthModal } from './components/DriverAuthModal';
import { Reservation, TripType } from './types';
import { StorageService } from './services/storageService';

function getInitialView(): 'landing' | 'admin' | 'driver' {
  try {
    // 1. Check URL parameters: ?view=driver or ?app=driver or ?mode=driver
    const params = new URLSearchParams(window.location.search);
    const viewParam = (params.get('view') || params.get('app') || params.get('mode') || '').toLowerCase();
    if (viewParam === 'driver' || viewParam === 'motorista' || viewParam === 'pista') return 'driver';
    if (viewParam === 'admin' || viewParam === 'gestao') return 'admin';
    if (viewParam === 'landing' || viewParam === 'cliente' || viewParam === 'site') return 'landing';

    // 2. Check URL Hash: #motorista, #driver, #pista, #admin, #gestao
    const hash = window.location.hash.toLowerCase();
    if (hash === '#driver' || hash === '#motorista' || hash === '#pista') return 'driver';
    if (hash === '#admin' || hash === '#gestao') return 'admin';

    // 3. Check URL Pathname: /motorista, /driver, /admin
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/motorista') || path.includes('/driver')) return 'driver';
    if (path.includes('/admin')) return 'admin';

    // 4. Standalone PWA detection or saved preference
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    const preferred = StorageService.getPreferredView();
    if (isStandalone && preferred === 'driver') return 'driver';
    if (preferred === 'driver' && StorageService.getLoggedDriverId()) return 'driver';
  } catch (e) {
    // Ignore error in non-browser environments
  }
  return 'landing';
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'admin' | 'driver' | 'tracking'>(getInitialView);
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
  const [isDriverAuthOpen, setIsDriverAuthOpen] = useState(false);

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
      } else if (
        hash === '#driver' ||
        hash === '#motorista' ||
        hash === '#pista' ||
        viewParam === 'driver' ||
        viewParam === 'motorista'
      ) {
        const isAuth = !!StorageService.getLoggedDriverId();
        setCurrentView('driver');
        if (!isAuth) {
          setIsDriverAuthOpen(true);
        }
      } else if (hash === '#rastreio' || hash === '#tracking') {
        setIsTrackModalOpen(true);
      } else if (hash === '#reservas' || hash === '#cliente' || hash === '#publico') {
        setCurrentView('landing');
      }
    };

    // Initial synchronization with central server backend
    StorageService.syncWithServer().catch((e) => console.warn('Boot sync with server:', e));

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleSelectSystem = (view: 'landing' | 'admin' | 'driver') => {
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
    } else if (view === 'driver') {
      const isAuth = !!StorageService.getLoggedDriverId();
      window.location.hash = 'motorista';
      setCurrentView('driver');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (!isAuth) {
        setIsDriverAuthOpen(true);
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

  const handleOpenDriver = () => {
    handleSelectSystem('driver');
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthOpen(false);
    window.location.hash = 'admin';
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDriverAuthSuccess = () => {
    setIsDriverAuthOpen(false);
    StorageService.setPreferredView('driver');
    window.location.hash = 'motorista';
    setCurrentView('driver');
    window.dispatchEvent(new CustomEvent('driver_auth_changed'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutDriver = () => {
    StorageService.setLoggedDriverId(null);
    StorageService.setPreferredView('landing');
    setIsDriverAuthOpen(true);
  };

  const handleSwitchDriver = () => {
    setIsDriverAuthOpen(true);
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('litoral_admin_auth');
    sessionStorage.removeItem('litoral_admin_auth_time');
    StorageService.setPreferredView('landing');
    window.location.hash = 'reservas';
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDriver = () => {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between overflow-x-hidden">
      {/* 1. Header - Visible on customer landing and admin, hidden on dedicated driver mobile cockpit */}
      {currentView !== 'driver' && (
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenTrackModal={() => handleOpenTrackModal()}
          onOpenAIModal={() => setIsAIModalOpen(true)}
          onOpenAdmin={handleOpenAdmin}
          onOpenDriver={handleOpenDriver}
          onScrollToBooking={scrollToBooking}
          onOpenContactModal={() => setIsContactModalOpen(true)}
        />
      )}

      {/* Main Content Area based on active view */}
      <main className="flex-1">
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
              onOpenDriver={handleOpenDriver}
              onOpenContactModal={() => setIsContactModalOpen(true)}
            />

            {/* Floating Contact & Support Button (Opens modal form) */}
            <FloatingContactButton onOpenContactModal={() => setIsContactModalOpen(true)} />
          </>
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onBackToSite={handleLogoutAdmin}
            onOpenDriverView={handleOpenDriver}
          />
        )}

        {currentView === 'driver' && (
          <DriverAppView
            onBackToSite={handleBackFromDriver}
            onOpenAdmin={handleOpenAdmin}
            onLogout={handleLogoutDriver}
            onSwitchDriver={handleSwitchDriver}
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

      <DriverAuthModal
        isOpen={isDriverAuthOpen}
        onClose={() => {
          setIsDriverAuthOpen(false);
          if (!StorageService.getLoggedDriverId() && currentView === 'driver') {
            handleBackFromDriver();
          }
        }}
        onSuccess={handleDriverAuthSuccess}
      />
    </div>
  );
}
