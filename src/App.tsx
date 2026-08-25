import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WhatWeOfferSection } from './components/WhatWeOfferSection';
import { BookingFormSection } from './components/BookingFormSection';
import { DestinationsGrid } from './components/DestinationsGrid';
import { VehicleFleetSection } from './components/VehicleFleetSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { DriverAppView } from './components/DriverAppView';
import { TrackRideModal } from './components/TrackRideModal';
import { AISmartAssistantModal } from './components/AISmartAssistantModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { DriverAuthModal } from './components/DriverAuthModal';
import { Reservation } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'admin' | 'driver' | 'tracking'>('landing');
  const [selectedDestination, setSelectedDestination] = useState<string>('São Sebastião');
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackRideCode, setTrackRideCode] = useState<string>('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isDriverAuthOpen, setIsDriverAuthOpen] = useState(false);

  const scrollToBooking = () => {
    const el = document.getElementById('agendar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdmin = () => {
    const isAuth = sessionStorage.getItem('litoral_admin_auth') === 'true';
    if (isAuth) {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleOpenDriver = () => {
    const isAuth = !!sessionStorage.getItem('litoral_driver_auth');
    if (isAuth) {
      setCurrentView('driver');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsDriverAuthOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthOpen(false);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDriverAuthSuccess = () => {
    setIsDriverAuthOpen(false);
    setCurrentView('driver');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('litoral_admin_auth');
    sessionStorage.removeItem('litoral_admin_auth_time');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header - Always visible with easy view switcher */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenTrackModal={() => handleOpenTrackModal()}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onScrollToBooking={scrollToBooking}
      />

      {/* Main Content Area based on active view */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <>
            {/* 1. Hero Section mirroring the Flyer Layout */}
            <HeroSection
              onSelectDestination={handleSelectDestination}
              onScrollToBooking={scrollToBooking}
              onOpenAIAdvisor={() => setIsAIModalOpen(true)}
            />

            {/* 2. "O Que Oferecemos" - Navy background with 4 icon items & Spin Minivan */}
            <WhatWeOfferSection onScrollToBooking={scrollToBooking} />

            {/* 3. Interactive Booking Form & Instant Price Engine */}
            <BookingFormSection
              initialDestination={selectedDestination}
              onBookingSuccess={handleBookingSuccess}
              onOpenTrackModal={handleOpenTrackModal}
            />

            {/* 4. Deep-dive into Destinations (São Sebastião, Ilhabela, Caraguatatuba) */}
            <DestinationsGrid
              onSelectDestination={handleSelectDestination}
              onScrollToBooking={scrollToBooking}
            />

            {/* 5. Chevrolet Spin 7 Lugares Minivan Fleet Details */}
            <VehicleFleetSection />

            {/* 6. FAQ Section */}
            <FAQSection />

            {/* 7. Footer with trust badges & contacts */}
            <Footer
              onScrollToBooking={scrollToBooking}
              onOpenAdmin={handleOpenAdmin}
              onOpenDriver={handleOpenDriver}
            />
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
            onBackToSite={() => setCurrentView('landing')}
            onOpenAdmin={handleOpenAdmin}
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

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      <DriverAuthModal
        isOpen={isDriverAuthOpen}
        onClose={() => setIsDriverAuthOpen(false)}
        onSuccess={handleDriverAuthSuccess}
      />
    </div>
  );
}
