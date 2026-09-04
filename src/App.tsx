import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FloatingContactButton } from './components/FloatingContactButton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Reservation, TripType } from './types';
import { StorageService } from './services/storageService';
import { X } from 'lucide-react';

const WhatWeOfferSection = lazy(() => import('./components/WhatWeOfferSection').then(m => ({ default: m.WhatWeOfferSection })));
const TimetableSection = lazy(() => import('./components/TimetableSection').then(m => ({ default: m.TimetableSection })));
const BookingFormSection = lazy(() => import('./components/BookingFormSection').then(m => ({ default: m.BookingFormSection })));
const HowItWorksSection = lazy(() => import('./components/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })));
const ServicesSection = lazy(() => import('./components/ServicesSection').then(m => ({ default: m.ServicesSection })));
const DestinationsGrid = lazy(() => import('./components/DestinationsGrid').then(m => ({ default: m.DestinationsGrid })));
const VehicleFleetSection = lazy(() => import('./components/VehicleFleetSection').then(m => ({ default: m.VehicleFleetSection })));
const WhyChooseUsSection = lazy(() => import('./components/WhyChooseUsSection').then(m => ({ default: m.WhyChooseUsSection })));
const FAQSection = lazy(() => import('./components/FAQSection').then(m => ({ default: m.FAQSection })));
const FinalCTASection = lazy(() => import('./components/FinalCTASection').then(m => ({ default: m.FinalCTASection })));
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TrackRideModal = lazy(() => import('./components/TrackRideModal').then(m => ({ default: m.TrackRideModal })));
const AISmartAssistantModal = lazy(() => import('./components/AISmartAssistantModal').then(m => ({ default: m.AISmartAssistantModal })));
const ContactSupportModal = lazy(() => import('./components/ContactSupportModal').then(m => ({ default: m.ContactSupportModal })));
const AdminAuthModal = lazy(() => import('./components/AdminAuthModal').then(m => ({ default: m.AdminAuthModal })));

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

    // Deferred synchronization with central server backend & Google Sheets to prioritize FCP/LCP
    const syncTimer = setTimeout(() => {
      StorageService.syncWithServer().catch((e) => console.warn('Boot sync with server:', e));
      StorageService.fetchFromGoogleSheets().catch((e) => console.warn('Boot sync with Google Sheets:', e));
    }, 1000);

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
    // Reservation booked directly in system
  };

  const SectionLoader = () => (
    <div className="py-16 flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

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
            {/* 2. Hero Section (Eagerly loaded for instant LCP) */}
            <HeroSection
              onSelectDestination={handleSelectDestination}
              onScrollToBooking={scrollToBooking}
              onScrollToDestinations={scrollToDestinations}
              onOpenAIModal={() => setIsAIModalOpen(true)}
            />

            <Suspense fallback={<SectionLoader />}>
              {/* 3. Quick Trust / Benefits (O Que Oferecemos) */}
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
            </Suspense>

            {/* Floating Contact & Support Button (Opens modal form) */}
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
          <Suspense fallback={<SectionLoader />}>
            <AdminDashboard
              onBackToSite={handleLogoutAdmin}
            />
          </Suspense>
        )}
      </main>

      {/* Modals (Lazy loaded when invoked) */}
      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  );
}
