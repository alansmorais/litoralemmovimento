import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storageService';
import { Reservation, Driver, TripStatus } from '../types';
import { DRIVERS, COMPANY_CONTACT } from '../data/mockData';
import {
  Car,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle2,
  Send,
  ArrowRight,
  RefreshCw,
  Users,
  Luggage,
  DollarSign,
  Calendar,
  LogOut,
  CreditCard,
  Check,
  Download,
  Share2,
  BellRing,
  ArrowLeftRight,
  UserCheck,
  KeyRound,
  X,
  Smartphone,
  Plane,
} from 'lucide-react';

interface DriverAppViewProps {
  onBackToSite: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
  onSwitchDriver?: () => void;
}

export const DriverAppView: React.FC<DriverAppViewProps> = ({
  onBackToSite,
  onOpenAdmin,
  onLogout,
  onSwitchDriver,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>(StorageService.getDrivers());
  const loggedId = StorageService.getLoggedDriverId() || DRIVERS[0].id;
  const currentDriver = StorageService.getDriverById(loggedId) || DRIVERS[0];
  const [selectedDriver, setSelectedDriver] = useState<Driver>(currentDriver);
  const [isSwitchDriverModalOpen, setIsSwitchDriverModalOpen] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  // Only 2 essential tabs: active trip or schedule
  const [activeTab, setActiveTab] = useState<'active' | 'schedule'>('active');

  // PWA Deferred Prompt & Standalone Install Modal State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);

  // Quick Message Dropdown & Emergency Modal
  const [quickMsgOpen, setQuickMsgOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Schedule Filter
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // Real-time Multi-Device Synchronization state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('pt-BR'));
  const [newAssignedTripNotice, setNewAssignedTripNotice] = useState<Reservation | null>(null);
  const previousAssignedIdsRef = useRef<Set<string>>(new Set());

  const getDriverInitials = (name: string): string => {
    if (!name) return 'MT';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const loadData = () => {
    const allReservations = StorageService.getReservations();
    setReservations(allReservations);
    const updatedDrivers = StorageService.getDrivers();
    setDrivers(updatedDrivers);
    const activeLoggedId = StorageService.getLoggedDriverId();
    const current =
      (activeLoggedId ? StorageService.getDriverById(activeLoggedId) : null) ||
      (selectedDriver?.id ? StorageService.getDriverById(selectedDriver.id) : null) ||
      updatedDrivers[0] ||
      DRIVERS[0];
    if (current) setSelectedDriver(current);
  };

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    StorageService.setLoggedDriverId(driver.id);
    setIsSwitchDriverModalOpen(false);
    performSync();
  };

  const handleLogout = () => {
    if (window.confirm(`Deseja realmente sair da conta do motorista ${selectedDriver.name}?`)) {
      StorageService.setLoggedDriverId(null);
      if (onLogout) {
        onLogout();
      } else {
        onBackToSite();
      }
    }
  };

  const performSync = async () => {
    setIsSyncing(true);
    try {
      const { reservations: updatedRes } = await StorageService.syncWithServer();
      loadData();
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));

      // Check if there are newly assigned trips for this driver
      const currentAssigned = updatedRes.filter(
        (r) => r.assignedDriverId === selectedDriver.id && r.status !== 'Concluído' && r.status !== 'Cancelado'
      );
      const previousIds = previousAssignedIdsRef.current;

      const newlyAssigned = currentAssigned.find((r) => !previousIds.has(r.id));
      if (newlyAssigned && previousIds.size > 0) {
        setNewAssignedTripNotice(newlyAssigned);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([200, 100, 200, 100, 300]);
          } catch {}
        }
      }

      previousAssignedIdsRef.current = new Set(currentAssigned.map((r) => r.id));
    } catch (e) {
      console.warn('Sync error in DriverAppView:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    performSync();

    const pollTimer = setInterval(() => {
      performSync();
    }, 4000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        performSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    const handleUpdate = () => loadData();
    window.addEventListener('reservations_updated', handleUpdate);
    window.addEventListener('drivers_updated', handleUpdate);
    window.addEventListener('driver_auth_changed', handleUpdate);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandaloneMode(isStandalone);

    const initialLoggedId = StorageService.getLoggedDriverId();
    if (!initialLoggedId) {
      setIsSwitchDriverModalOpen(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('reservations_updated', handleUpdate);
      window.removeEventListener('drivers_updated', handleUpdate);
      window.removeEventListener('driver_auth_changed', handleUpdate);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [selectedDriver.id]);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Filter trips specifically assigned to this driver
  const assignedToMeTrips = reservations.filter(
    (r) => r.assignedDriverId === selectedDriver.id && r.status !== 'Concluído' && r.status !== 'Cancelado'
  );

  // Trips open for pickup/driver assignment
  const openAvailableTrips = reservations.filter(
    (r) => !r.assignedDriverId && r.status !== 'Concluído' && r.status !== 'Cancelado'
  );

  // All relevant trips for driver cockpit
  const myTrips = reservations.filter(
    (r) => r.assignedDriverId === selectedDriver.id || (!r.assignedDriverId && r.status !== 'Concluído' && r.status !== 'Cancelado')
  );

  // Active trip: prioritize trips in progress, on the way, confirmed
  const activeTrip =
    assignedToMeTrips.find((r) => r.status === 'Em andamento' || r.status === 'A caminho') ||
    assignedToMeTrips.find((r) => r.status === 'Confirmado') ||
    assignedToMeTrips[0] ||
    null;

  const handleAcceptAvailableTrip = async (tripId: string) => {
    await StorageService.assignDriver(tripId, selectedDriver.id);
    await performSync();
    setActiveTab('active');
  };

  const handleUpdateStatus = (tripId: string, newStatus: TripStatus) => {
    StorageService.updateReservationStatus(tripId, newStatus);
    if (newStatus === 'A caminho' || newStatus === 'Em andamento') {
      StorageService.updateDriverStatus(selectedDriver.id, 'Em Viagem');
    } else if (newStatus === 'Concluído') {
      StorageService.updateDriverStatus(selectedDriver.id, 'Disponível');
    }
    loadData();
  };

  const handleToggleDriverStatus = (status: 'Disponível' | 'Em Viagem' | 'Descanso') => {
    StorageService.updateDriverStatus(selectedDriver.id, status);
    loadData();
  };

  const handleConfirmBoardingPayment = (tripId: string, method: 'PIX' | 'Cartão' | 'Dinheiro' = 'PIX') => {
    StorageService.confirmBoardingPayment(tripId, method);
    loadData();
  };

  const openWaze = (address: string) => {
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
    window.open(url, '_blank');
  };

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const sendQuickPassengerMessage = (phone: string, text: string) => {
    const cleanPhone = '55' + phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setQuickMsgOpen(false);
  };

  const sendEmergencyWhatsApp = () => {
    const text = `🚨 *SUPORTE OPERACIONAL • MOTORISTA EM ROTA*\nMotorista: ${selectedDriver.name}\nVeículo: ${selectedDriver.vehicleModel}\nPlaca: ${selectedDriver.plate}\nViagem: ${activeTrip?.code || 'Sem viagem ativa'}\n\n_Por favor, entrar em contato._`;
    const cleanPhone = COMPANY_CONTACT.phoneRaw;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const completedTrips = myTrips.filter((t) => t.status === 'Concluído');
  const pendingTrips = myTrips.filter((t) => t.status !== 'Concluído' && t.status !== 'Cancelado');
  const todayEarnings = completedTrips.reduce((acc, t) => acc + (t.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. TOP HEADER (CLEAN, NO PHOTOS) */}
      <header className="bg-slate-900 border-b border-slate-800 px-3.5 py-2.5 sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Driver Monogram & Info (No Photo) */}
          <button
            type="button"
            onClick={() => setIsSwitchDriverModalOpen(true)}
            className="flex items-center gap-2.5 text-left p-1 -m-1 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Clique para alternar de motorista"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-sm flex items-center justify-center border border-amber-300 shadow-xs">
                {getDriverInitials(selectedDriver.name)}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  selectedDriver.activeStatus === 'Disponível'
                    ? 'bg-emerald-500'
                    : selectedDriver.activeStatus === 'Em Viagem'
                    ? 'bg-sky-400 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-white leading-tight truncate">
                  {selectedDriver.name}
                </h1>
                <ArrowLeftRight className="w-3 h-3 text-sky-400 shrink-0 opacity-70" />
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Spin 7L • <span className="font-mono text-slate-300 font-bold">{selectedDriver.plate}</span>
              </p>
            </div>
          </button>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status Selector */}
            <select
              value={selectedDriver.activeStatus}
              onChange={(e) => handleToggleDriverStatus(e.target.value as any)}
              className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors ${
                selectedDriver.activeStatus === 'Disponível'
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                  : selectedDriver.activeStatus === 'Em Viagem'
                  ? 'bg-sky-950/90 text-sky-300 border-sky-500/50'
                  : 'bg-amber-950/90 text-amber-300 border-amber-500/50'
              }`}
            >
              <option value="Disponível">🟢 Online</option>
              <option value="Em Viagem">🟣 Em Viagem</option>
              <option value="Descanso">🟡 Pausa</option>
            </select>

            {/* Emergency / Support button */}
            <button
              onClick={() => setEmergencyOpen(true)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Suporte Central"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN COCKPIT BODY */}
      <main className="max-w-md mx-auto w-full px-3.5 py-3 flex-1 space-y-3">
        {/* Real-time Sync & Notification Alert */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Sincronizado às {lastSyncTime}</span>
          </div>

          <button
            onClick={performSync}
            disabled={isSyncing}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>

        {/* New Assigned Trip Alert */}
        {newAssignedTripNotice && (
          <div className="bg-amber-400 text-slate-950 p-3 rounded-2xl shadow-lg flex items-center justify-between gap-2 border border-amber-300">
            <div className="flex items-center gap-2 min-w-0">
              <BellRing className="w-5 h-5 shrink-0 animate-bounce text-slate-950" />
              <div className="min-w-0">
                <p className="font-black text-xs">Nova Corrida Atribuída!</p>
                <p className="text-[11px] font-bold truncate">
                  {newAssignedTripNotice.code} • {newAssignedTripNotice.customerName.split(' ')[0]}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('active');
                setNewAssignedTripNotice(null);
              }}
              className="bg-slate-950 text-amber-300 text-xs px-2.5 py-1.5 rounded-xl font-bold shrink-0 cursor-pointer"
            >
              Ver Viagem
            </button>
          </div>
        )}

        {/* 2 SIMPLE TABS: VIAGEM ATUAL & MINHA ESCALA */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Viagem Atual</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'schedule'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Minha Escala</span>
            {pendingTrips.length > 0 && (
              <span className="bg-sky-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingTrips.length}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: VIAGEM ATUAL (ONLY NECESSARY INFO & ACTIONS) */}
        {/* ========================================================================= */}
        {activeTab === 'active' && (
          <div className="space-y-3">
            {!activeTrip ? (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">
                    Sem viagens em andamento
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Você está com status <strong>{selectedDriver.activeStatus}</strong>. Novas viagens despachadas pela central aparecerão diretamente aqui.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Ver Viagens Agendadas na Escala</span>
                  </button>

                  {openAvailableTrips.length > 0 && (
                    <div className="mt-2 text-left bg-slate-950 border border-amber-400/40 p-3 rounded-xl space-y-2">
                      <p className="text-[11px] font-bold text-amber-300">
                        {openAvailableTrips.length} corrida(s) aberta(s) na frota:
                      </p>
                      <div className="text-xs text-slate-300">
                        <strong>{openAvailableTrips[0].code}</strong>: {openAvailableTrips[0].origin} ➔ {openAvailableTrips[0].destination} ({openAvailableTrips[0].time})
                      </div>
                      <button
                        onClick={() => handleAcceptAvailableTrip(openAvailableTrips[0].id)}
                        className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Assumir esta Corrida</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
                {/* 1. Header: Code, Type & Status */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-white">
                        {activeTrip.code}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                        {activeTrip.tripType === 'Individual' ? 'Privativo' : 'Compartilhado'}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{activeTrip.date} às {activeTrip.time}</span>
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${
                      activeTrip.status === 'Confirmado'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-400/30'
                        : activeTrip.status === 'A caminho'
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                        : activeTrip.status === 'Em andamento'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-400/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30'
                    }`}
                  >
                    {activeTrip.status}
                  </span>
                </div>

                {/* 2. PRIMARY ACTION STEPPER (LARGE, ACCESSIBLE BUTTON) */}
                <div className="pt-1">
                  {activeTrip.status === 'Confirmado' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'A caminho')}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-98 transition-transform cursor-pointer"
                    >
                      <Car className="w-4 h-4" />
                      <span>1. INICIAR (A CAMINHO DA COLETA) ➔</span>
                    </button>
                  )}

                  {activeTrip.status === 'A caminho' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'Em andamento')}
                      className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-transform cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>2. PASSAGEIRO A BORDO (EM VIAGEM) ➔</span>
                    </button>
                  )}

                  {activeTrip.status === 'Em andamento' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'Concluído')}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-transform cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>3. FINALIZAR E CONCLUIR VIAGEM ✓</span>
                    </button>
                  )}

                  {activeTrip.status === 'Concluído' && (
                    <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 py-2.5 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Viagem concluída! Sistema liberado para novos transfers.</span>
                    </div>
                  )}
                </div>

                {/* 3. ITINERARY WITH 1-TAP GPS NAVIGATION */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 text-xs">
                  {/* Ponto de Embarque */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        Ponto de Embarque
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openWaze(activeTrip.pickupAddress || activeTrip.origin)}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Waze</span>
                        </button>
                        <button
                          onClick={() => openGoogleMaps(activeTrip.pickupAddress || activeTrip.origin)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border border-slate-700 cursor-pointer"
                        >
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>Maps</span>
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-white text-sm">
                      {activeTrip.origin}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {activeTrip.pickupAddress || activeTrip.originDetails || 'Endereço a confirmar'}
                    </p>
                  </div>

                  {/* Paradas extras se houver */}
                  {activeTrip.extraStops && activeTrip.extraStops.length > 0 && (
                    <div className="pl-2 border-l-2 border-dashed border-amber-400/40 my-2 space-y-1.5">
                      {activeTrip.extraStops.map((stop, sIdx) => (
                        <div key={stop.id} className="text-xs">
                          <span className="text-[10px] text-amber-400 uppercase font-bold block">
                            Parada {sIdx + 1}
                          </span>
                          <span className="text-slate-200">{stop.address}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ponto de Desembarque */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-sky-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                        Ponto de Desembarque
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openWaze(activeTrip.dropoffAddress || activeTrip.destination)}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Waze</span>
                        </button>
                        <button
                          onClick={() => openGoogleMaps(activeTrip.dropoffAddress || activeTrip.destination)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border border-slate-700 cursor-pointer"
                        >
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>Maps</span>
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-white text-sm">
                      {activeTrip.destination}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {activeTrip.dropoffAddress || activeTrip.destinationDetails || 'Endereço a confirmar'}
                    </p>
                  </div>
                </div>

                {/* 4. PASSENGER & DIRECT CONTACT */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Passageiro</span>
                      <strong className="text-white text-sm font-bold block">{activeTrip.customerName}</strong>
                      <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          {activeTrip.passengers} pessoa(s)
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Luggage className="w-3.5 h-3.5 text-slate-400" />
                          {activeTrip.luggageCount} mala(s)
                        </span>
                      </p>
                    </div>

                    {activeTrip.flightNumber && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block">Voo</span>
                        <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1">
                          <Plane className="w-3 h-3" />
                          {activeTrip.flightNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${activeTrip.customerPhone.replace(/\D/g, '')}`}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-sky-400" />
                      <span>Ligar</span>
                    </a>

                    <button
                      onClick={() => setQuickMsgOpen(!quickMsgOpen)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Quick Message Options */}
                  {quickMsgOpen && (
                    <div className="bg-slate-900 border border-emerald-500/40 p-2.5 rounded-xl space-y-1.5 mt-2">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                        Enviar mensagem rápida:
                      </span>
                      <button
                        onClick={() =>
                          sendQuickPassengerMessage(
                            activeTrip.customerPhone,
                            `Olá ${activeTrip.customerName}! Sou o motorista ${selectedDriver.name} da Litoral em Movimento (Spin placa ${selectedDriver.plate}). Estou a caminho do seu ponto de embarque.`
                          )
                        }
                        className="w-full text-left bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs p-2 rounded border border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>1. "Estou a caminho da coleta..."</span>
                        <Send className="w-3 h-3 text-emerald-400" />
                      </button>

                      <button
                        onClick={() =>
                          sendQuickPassengerMessage(
                            activeTrip.customerPhone,
                            `Olá ${activeTrip.customerName}! Cheguei no seu local de embarque. Estou com a Spin placa ${selectedDriver.plate}. Pode vir ao veículo!`
                          )
                        }
                        className="w-full text-left bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs p-2 rounded border border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>2. "Cheguei no local de embarque..."</span>
                        <Send className="w-3 h-3 text-emerald-400" />
                      </button>

                      <button
                        onClick={() =>
                          sendQuickPassengerMessage(
                            activeTrip.customerPhone,
                            `Olá ${activeTrip.customerName}! Estou aguardando no portão de desembarque do aeroporto com a Spin placa ${selectedDriver.plate}.`
                          )
                        }
                        className="w-full text-left bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs p-2 rounded border border-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>3. "Aguardando no desembarque..."</span>
                        <Send className="w-3 h-3 text-emerald-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. FINANCIAL: ONLY BOARDING COLLECTION IF PENDING */}
                {activeTrip.remainingAmount && activeTrip.remainingAmount > 0 && activeTrip.paymentStatus !== 'Pago (PIX)' ? (
                  <div className="bg-amber-400/10 border border-amber-400/30 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-300 font-bold flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        <span>Cobrar no Embarque:</span>
                      </span>
                      <strong className="font-mono text-sm text-amber-400 font-black">
                        R$ {activeTrip.remainingAmount.toFixed(2).replace('.', ',')}
                      </strong>
                    </div>

                    <button
                      onClick={() => handleConfirmBoardingPayment(activeTrip.id, 'PIX')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Recebimento do Saldo</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status Financeiro:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>100% Quitado (Total R$ {activeTrip.totalPrice.toFixed(2).replace('.', ',')})</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MINHA ESCALA (SCHEDULE & EARNINGS) */}
        {/* ========================================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            {/* Quick Earnings Bar */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Produção Hoje</span>
                <strong className="text-emerald-400 font-black text-lg">
                  R$ {todayEarnings.toFixed(2).replace('.', ',')}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Viagens Concluídas</span>
                <span className="font-bold text-white text-sm">
                  {completedTrips.length} viagem(ns)
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setScheduleFilter('pending')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  scheduleFilter === 'pending' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                Pendentes ({pendingTrips.length})
              </button>
              <button
                onClick={() => setScheduleFilter('completed')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  scheduleFilter === 'completed' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                Concluídas ({completedTrips.length})
              </button>
              <button
                onClick={() => setScheduleFilter('all')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  scheduleFilter === 'all' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                Todas ({myTrips.length})
              </button>
            </div>

            {/* Trips List */}
            {myTrips.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-400">
                Nenhuma viagem encontrada para este motorista.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myTrips
                  .filter((t) => {
                    if (scheduleFilter === 'pending') return t.status !== 'Concluído' && t.status !== 'Cancelado';
                    if (scheduleFilter === 'completed') return t.status === 'Concluído';
                    return true;
                  })
                  .map((trip) => {
                    const isSelectedAsActive = activeTrip?.id === trip.id;
                    return (
                      <div
                        key={trip.id}
                        className={`bg-slate-900 border rounded-2xl p-3.5 space-y-2 transition-all ${
                          isSelectedAsActive ? 'border-amber-400/80 bg-slate-900/90' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {trip.code}
                            </span>
                            <span className="text-amber-400 font-bold">
                              {trip.date} • {trip.time}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              trip.status === 'Concluído'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-sky-950 text-sky-400 border-sky-800'
                            }`}
                          >
                            {trip.status}
                          </span>
                        </div>

                        <div>
                          <strong className="text-white text-sm font-bold block">{trip.customerName}</strong>
                          <p className="text-xs text-slate-400 mt-0.5">
                            📍 {trip.origin} ➔ {trip.destination}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                          <span className="text-slate-400">
                            {trip.passengers} passageiro(s) • R$ {trip.totalPrice.toFixed(2).replace('.', ',')}
                          </span>

                          {trip.status !== 'Concluído' && (
                            <button
                              onClick={() => {
                                StorageService.updateReservationStatus(trip.id, 'Confirmado');
                                setActiveTab('active');
                              }}
                              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>Abrir Viagem</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. SWITCH DRIVER MODAL (NO PHOTOS, CLEAN INITIALS) */}
      {isSwitchDriverModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSwitchDriverModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setIsSwitchDriverModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-white">
                Trocar de Motorista
              </h3>
              <p className="text-xs text-slate-400">
                Selecione quem está conduzindo o veículo no momento:
              </p>
            </div>

            {/* List without photos */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {drivers.map((drv) => {
                const isCurrent = drv.id === selectedDriver.id;
                return (
                  <div
                    key={drv.id}
                    onClick={() => !isCurrent && handleSelectDriver(drv)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-400/10 border-amber-400/60 shadow-xs'
                        : 'bg-slate-950/70 border-slate-800 hover:border-sky-500/50 hover:bg-slate-950 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Monogram Box instead of Photo */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs border shrink-0 ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        {getDriverInitials(drv.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">{drv.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Spin 7L • Placa {drv.plate}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCurrent ? (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                          Ativo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectDriver(drv)}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          Selecionar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsSwitchDriverModalOpen(false);
                  if (onSwitchDriver) onSwitchDriver();
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <KeyRound className="w-4 h-4 text-sky-400" />
                <span>Entrar com PIN de Outro Motorista</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSwitchDriverModalOpen(false);
                  handleLogout();
                }}
                className="w-full bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sair da Conta (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EMERGENCY MODAL */}
      {emergencyOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEmergencyOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full text-white shadow-2xl space-y-3.5">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500 text-red-500 mx-auto flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">
                Suporte Operacional
              </h3>
              <p className="text-xs text-slate-400">
                Central de Atendimento Litoral em Movimento
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${COMPANY_CONTACT.phoneRaw}`}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Ligar ({COMPANY_CONTACT.phone})</span>
              </a>

              <button
                onClick={sendEmergencyWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp com Dados da Viagem</span>
              </button>

              <button
                type="button"
                onClick={() => setEmergencyOpen(false)}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 text-center cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MINIMAL BOTTOM BAR */}
      <footer className="bg-slate-900/95 border-t border-slate-800 py-2 px-4 text-center text-[10px] text-slate-400 sticky bottom-0 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <span className="truncate">
            Motorista: <strong>{selectedDriver.name}</strong> ({selectedDriver.plate})
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {!isStandaloneMode && (
              <button
                onClick={handleInstallPWA}
                className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
              >
                Instalar App
              </button>
            )}
            <span className="text-slate-600">•</span>
            <span>Central: {COMPANY_CONTACT.phone}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
