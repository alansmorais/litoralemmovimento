import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storageService';
import { Reservation, Driver, TripStatus, GPSDeviation } from '../types';
import { DRIVERS, PRICING_RULES, COMPANY_CONTACT } from '../data/mockData';
import {
  Smartphone,
  Car,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Send,
  ArrowRight,
  Shield,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Users,
  Luggage,
  Compass,
  DollarSign,
  Calendar,
  ClipboardCheck,
  Award,
  LogOut,
  Radio,
  Fuel,
  Sparkles,
  Gauge,
  HelpCircle,
  CreditCard,
  AlertCircle,
  Check,
  Download,
  Share2,
  BellRing,
  Wifi,
} from 'lucide-react';

interface DriverAppViewProps {
  onBackToSite: () => void;
  onOpenAdmin?: () => void;
}

export const DriverAppView: React.FC<DriverAppViewProps> = ({
  onBackToSite,
  onOpenAdmin,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>(StorageService.getDrivers());
  const loggedId = StorageService.getLoggedDriverId() || DRIVERS[0].id;
  const currentDriver = StorageService.getDriverById(loggedId) || DRIVERS[0];
  const [selectedDriver, setSelectedDriver] = useState<Driver>(currentDriver);
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'schedule' | 'gps-nav' | 'checklist' | 'earnings'>('active');

  // PWA Deferred Prompt & Standalone Install Modal State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);

  // GPS & Telemetry Simulator State
  const [isGpsTracking, setIsGpsTracking] = useState(true);
  const [simulatedSpeedKmH, setSimulatedSpeedKmH] = useState(84);
  const [currentHighway, setCurrentHighway] = useState('Rodovia dos Tamoios (SP-099) • km 64');
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [offRouteDistanceKm, setOffRouteDistanceKm] = useState(0);

  // Quick Message Modal / Dropdown
  const [quickMsgOpen, setQuickMsgOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Vehicle Checklist state
  const [checklist, setChecklist] = useState({
    tires: true,
    oilWater: true,
    airConditioning: true,
    cleanliness: true,
    mineralWater: true,
    seatbelts: true,
    documentation: true,
  });
  const [odometerStart, setOdometerStart] = useState('42.380');
  const [odometerEnd, setOdometerEnd] = useState('');
  const [checklistSaved, setChecklistSaved] = useState(false);

  // Schedule Filter
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Real-time Multi-Device Synchronization state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('pt-BR'));
  const [newAssignedTripNotice, setNewAssignedTripNotice] = useState<Reservation | null>(null);
  const previousAssignedIdsRef = useRef<Set<string>>(new Set());

  const loadData = () => {
    const allReservations = StorageService.getReservations();
    setReservations(allReservations);
    const updatedDrivers = StorageService.getDrivers();
    setDrivers(updatedDrivers);
    const current = StorageService.getDriverById(selectedDriver.id) || updatedDrivers[0];
    setSelectedDriver(current);
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

      // If an assigned trip was NOT in previousIds and previousIds had at least 1 trip, trigger alert
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

    // Fast polling (3.5 seconds) for real-time dispatch from Admin or other devices
    const pollTimer = setInterval(() => {
      performSync();
    }, 3500);

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

    // Check if app is already running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandaloneMode(isStandalone);

    // Capture PWA install prompt
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

  // Handle Driver Switch
  const handleDriverChange = (driverId: string) => {
    const found = drivers.find((d) => d.id === driverId);
    if (found) {
      setSelectedDriver(found);
      StorageService.setLoggedDriverId(driverId);
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

  // Active trip: prioritize trips explicitly assigned to this driver
  const activeTrip =
    assignedToMeTrips.find((r) => r.status === 'Em andamento' || r.status === 'A caminho' || r.status === 'Confirmado') ||
    assignedToMeTrips[0] ||
    openAvailableTrips[0];

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

  const handleSimulateDetour = () => {
    setIsOffRoute(true);
    const newKm = +(offRouteDistanceKm + 4.5).toFixed(1);
    setOffRouteDistanceKm(newKm);
    if (activeTrip) {
      const surcharge = +(newKm * PRICING_RULES.offRouteKmRate).toFixed(2);
      StorageService.addGpsDeviation(
        activeTrip.id,
        {
          detected: true,
          distanceKm: newKm,
          detourLocation: 'Desvio registrado pelo motorista (Parada não programada / Tráfego)',
          rateType: 'per_km',
          calculatedSurcharge: surcharge,
          approvedByAdmin: true,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
        false
      );
    }
  };

  const handleResetDetour = () => {
    setIsOffRoute(false);
    setOffRouteDistanceKm(0);
  };

  const openWaze = (address: string) => {
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
    window.open(url, '_blank');
  };

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const openAppleMaps = (address: string) => {
    const url = `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const sendQuickPassengerMessage = (phone: string, text: string) => {
    const cleanPhone = '55' + phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setQuickMsgOpen(false);
  };

  const sendEmergencyWhatsApp = () => {
    const text = `🚨 *SUPORTE OPERACIONAL • MOTORISTA EM ROTA*\nMotorista: ${selectedDriver.name}\nVeículo: ${selectedDriver.vehicleModel}\nPlaca: ${selectedDriver.plate}\nLocal: ${currentHighway}\nViagem Código: ${activeTrip?.code || 'Sem viagem ativa'}\n\n_Por favor, entrar em contato com urgência._`;
    const cleanPhone = COMPANY_CONTACT.phoneRaw;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    setChecklistSaved(true);
    setTimeout(() => setChecklistSaved(false), 3000);
  };

  const completedTrips = myTrips.filter((t) => t.status === 'Concluído');
  const pendingTrips = myTrips.filter((t) => t.status !== 'Concluído' && t.status !== 'Cancelado');
  const todayEarnings = completedTrips.reduce((acc, t) => acc + (t.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. TOP NATIVE APP BAR (MOBILE-FIRST COCKPIT) */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          {/* Driver Avatar & Identity */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={selectedDriver.photoUrl}
                alt={selectedDriver.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  selectedDriver.activeStatus === 'Disponível'
                    ? 'bg-emerald-500'
                    : selectedDriver.activeStatus === 'Em Viagem'
                    ? 'bg-sky-400 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif-display font-extrabold text-sm text-white leading-tight">
                  {selectedDriver.name}
                </h1>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black tracking-tight">
                  ★ {selectedDriver.rating}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Car className="w-3 h-3 text-sky-400 inline" />
                <span>Spin 7L • {selectedDriver.plate}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Status Menu */}
          <div className="flex items-center gap-2">
            {/* Status Selector Pill */}
            <select
              value={selectedDriver.activeStatus}
              onChange={(e) => handleToggleDriverStatus(e.target.value as any)}
              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer transition-colors ${
                selectedDriver.activeStatus === 'Disponível'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : selectedDriver.activeStatus === 'Em Viagem'
                  ? 'bg-sky-950/80 text-sky-300 border-sky-500/50'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
              }`}
            >
              <option value="Disponível">🟢 Online</option>
              <option value="Em Viagem">🟣 Em Viagem</option>
              <option value="Descanso">🟡 Em Pausa</option>
            </select>

            {/* Install Standalone App Button */}
            {!isStandaloneMode && (
              <button
                onClick={handleInstallPWA}
                className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                title="Instalar App Standalone no Celular / Tela de Início"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Instalar App</span>
              </button>
            )}

            {/* Emergency Support Modal Toggle */}
            <button
              onClick={() => setEmergencyOpen(true)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Suporte Operacional da Central"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Exit to Site / Switch Driver */}
            <button
              onClick={onBackToSite}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl text-xs transition-colors cursor-pointer"
              title="Encerrar sessão do motorista"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN COCKPIT BODY */}
      <main className="max-w-lg mx-auto w-full px-4 py-3 flex-1 space-y-4">
        {/* Real-time Multi-Device Sync Status Bar */}
        <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl flex items-center justify-between gap-2 shadow-sm text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              Sincronizado em tempo real <span className="text-slate-400 font-mono text-[10px]">({lastSyncTime})</span>
            </span>
          </div>

          <button
            onClick={performSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Forçar sincronização com a central agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isSyncing ? 'Atualizando...' : 'Sincronizar'}</span>
          </button>
        </div>

        {/* New Assigned Trip Alert Notification Banner (Cross-Device Real-Time Notification) */}
        {newAssignedTripNotice && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-pulse border-2 border-amber-300">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center flex-shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded">Novo Pedido</span>
                  <p className="font-black text-xs">Motorista Atribuído!</p>
                </div>
                <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                  {newAssignedTripNotice.code} • {newAssignedTripNotice.customerName.split(' ')[0]} ({newAssignedTripNotice.origin} ➔ {newAssignedTripNotice.destination})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setActiveTab('active');
                  setNewAssignedTripNotice(null);
                }}
                className="bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs px-3 py-1.5 rounded-xl font-black shadow transition-transform active:scale-95 cursor-pointer"
              >
                Ver Viagem
              </button>
              <button
                onClick={() => setNewAssignedTripNotice(null)}
                className="text-slate-950/70 hover:text-slate-950 p-1 text-sm font-bold cursor-pointer"
                title="Dispensar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Cockpit Modules) */}
        <nav aria-label="Navegação do Motorista" className="grid grid-cols-5 gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold shadow-md">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm scale-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Viagem</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
              activeTab === 'schedule'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Escala</span>
            {pendingTrips.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('gps-nav')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'gps-nav'
                ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>GPS</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Ganhos</span>
          </button>
        </nav>

        {/* ========================================================================= */}
        {/* TAB 1: VIAGEM ATUAL (ACTIVE TRIP COCKPIT) */}
        {/* ========================================================================= */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {!activeTrip ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif-display font-extrabold text-xl text-white">
                    Sem viagens no momento
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Você está com status <strong>{selectedDriver.activeStatus}</strong>. Novas corridas e transfers aparecerão automaticamente aqui.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Ver Próximos Agendamentos</span>
                  </button>
                  <button
                    onClick={() => handleToggleDriverStatus('Disponível')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Ficar Online para Novos Clientes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
                {/* Visual Top Glow Status Accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    activeTrip.status === 'Confirmado'
                      ? 'bg-sky-500'
                      : activeTrip.status === 'A caminho'
                      ? 'bg-amber-400'
                      : activeTrip.status === 'Em andamento'
                      ? 'bg-purple-500 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />

                {/* Header: Code & Live Status Badge */}
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                      Transfer Ativo
                    </span>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-lg text-white font-extrabold tracking-tight">
                        {activeTrip.code}
                      </strong>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
                        {activeTrip.tripType === 'Individual' ? 'Privativo' : 'Compartilhado'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border ${
                      activeTrip.status === 'Confirmado'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-400/30'
                        : activeTrip.status === 'A caminho'
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                        : activeTrip.status === 'Em andamento'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-400/30 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30'
                    }`}
                  >
                    {activeTrip.status}
                  </span>
                </div>

                {/* Driver Assignment Status & Claim Action */}
                {activeTrip.assignedDriverId ? (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Motorista Atribuído: <strong>{activeTrip.assignedDriverName || selectedDriver.name}</strong></span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-black uppercase tracking-tight">
                      {activeTrip.assignedDriverId === selectedDriver.id ? 'Sua Corrida' : 'Designado'}
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-400/15 border border-amber-400/40 p-3 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-amber-300">Aguardando Atribuição de Motorista</p>
                      <p className="text-[11px] text-slate-300">Corrida aberta. Você pode assumir o atendimento agora.</p>
                    </div>
                    <button
                      onClick={() => handleAcceptAvailableTrip(activeTrip.id)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      <span>Assumir Corrida</span>
                    </button>
                  </div>
                )}

                {/* Passenger Information Card */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-serif-display font-extrabold text-lg text-white">
                        {activeTrip.customerName}
                      </h4>
                      <p className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{activeTrip.passengers} passageiro(s)</span>
                        <span className="text-slate-600">•</span>
                        <Luggage className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-300">{activeTrip.luggageCount} malas</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Valor Total</span>
                      <span className="font-serif-display font-black text-lg text-emerald-400">
                        R$ {activeTrip.totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {activeTrip.flightNumber && (
                    <div className="bg-sky-950/60 border border-sky-500/30 px-3 py-1.5 rounded-xl text-xs text-sky-300 flex items-center justify-between">
                      <span className="font-semibold">✈️ Voo de Desembarque:</span>
                      <strong className="font-mono text-white">{activeTrip.flightNumber}</strong>
                    </div>
                  )}

                  {/* Direct Contact Buttons with WhatsApp Quick Messages */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${activeTrip.customerPhone.replace(/\D/g, '')}`}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-sky-400" />
                      <span>Ligar Agora</span>
                    </a>

                    <button
                      onClick={() => setQuickMsgOpen(!quickMsgOpen)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Mensagens Rápidas</span>
                    </button>
                  </div>

                  {/* Quick Message Dropdown Sheet */}
                  {quickMsgOpen && (
                    <div className="bg-slate-900 border border-emerald-500/40 p-3 rounded-xl space-y-2 mt-2 animate-fadeIn">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                        Enviar no WhatsApp do Passageiro:
                      </span>
                      <button
                        onClick={() =>
                          sendQuickPassengerMessage(
                            activeTrip.customerPhone,
                            `Olá ${activeTrip.customerName}! Sou o motorista ${selectedDriver.name} da Litoral em Movimento (Chevrolet Spin placa ${selectedDriver.plate}). Estou a caminho do seu ponto de embarque.`
                          )
                        }
                        className="w-full text-left bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800 transition-colors flex items-center justify-between"
                      >
                        <span>1. "Estou a caminho do seu embarque..."</span>
                        <Send className="w-3 h-3 text-emerald-400" />
                      </button>

                      <button
                        onClick={() =>
                          sendQuickPassengerMessage(
                            activeTrip.customerPhone,
                            `Olá ${activeTrip.customerName}! Acabei de chegar no seu local de embarque. Estou com a Chevrolet Spin placa ${selectedDriver.plate}. Quando estiver pronto(a), pode vir ao carro.`
                          )
                        }
                        className="w-full text-left bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800 transition-colors flex items-center justify-between"
                      >
                        <span>2. "Cheguei no local de embarque..."</span>
                        <Send className="w-3 h-3 text-emerald-400" />
                      </button>

                      <button
                        onClick={() =>
                          sendQuickPassengerMessage(
                            activeTrip.customerPhone,
                            `Olá ${activeTrip.customerName}! Estou aguardando no desembarque do aeroporto com identificação da Litoral em Movimento.`
                          )
                        }
                        className="w-full text-left bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800 transition-colors flex items-center justify-between"
                      >
                        <span>3. "Aguardando no desembarque..."</span>
                        <Send className="w-3 h-3 text-emerald-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Route Itinerary & Waypoints */}
                <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
                  {/* Origin */}
                  <div className="flex items-start gap-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0 ring-4 ring-emerald-500/20" />
                    <div className="flex-1">
                      <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block">
                        Ponto de Embarque
                      </span>
                      <strong className="text-white text-sm block font-bold">{activeTrip.origin}</strong>
                      <p className="text-slate-400 text-xs leading-tight mt-0.5">
                        {activeTrip.pickupAddress || activeTrip.originDetails || 'Endereço a confirmar'}
                      </p>
                    </div>
                  </div>

                  {/* Extra Stops */}
                  {activeTrip.extraStops && activeTrip.extraStops.length > 0 && (
                    <div className="pl-1 space-y-2 border-l-2 border-dashed border-amber-500/40 ml-1.5 my-1">
                      {activeTrip.extraStops.map((stop, sIdx) => (
                        <div key={stop.id} className="flex items-start gap-3 pl-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] text-amber-400 uppercase font-bold block">
                              Parada Extra {sIdx + 1}
                            </span>
                            <span className="text-slate-200 text-xs block font-semibold">{stop.address}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Destination */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-sky-400 mt-1 flex-shrink-0 ring-4 ring-sky-400/20" />
                    <div className="flex-1">
                      <span className="text-[10px] text-sky-400 uppercase font-black tracking-wider block">
                        Ponto de Desembarque
                      </span>
                      <strong className="text-white text-sm block font-bold">{activeTrip.destination}</strong>
                      <p className="text-slate-400 text-xs leading-tight mt-0.5">
                        {activeTrip.dropoffAddress || activeTrip.destinationDetails || 'Endereço a confirmar'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Tap External Navigation Launchers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Abrir Navegador GPS Oficial:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => openWaze(activeTrip.dropoffAddress || activeTrip.destination)}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Waze</span>
                    </button>

                    <button
                      onClick={() => openGoogleMaps(activeTrip.dropoffAddress || activeTrip.destination)}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95"
                    >
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>Google Maps</span>
                    </button>

                    <button
                      onClick={() => openAppleMaps(activeTrip.dropoffAddress || activeTrip.destination)}
                      className="bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95"
                    >
                      <Compass className="w-4 h-4 text-sky-400" />
                      <span>Apple Maps</span>
                    </button>
                  </div>
                </div>

                {/* Payment Breakdown & Boarding Balance Collection */}
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Acerto Financeiro do Transfer:</span>
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                      {activeTrip.paymentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Sinal 50% (Reserva)</span>
                      <strong className="text-emerald-400 font-mono font-bold text-sm">
                        R$ {activeTrip.depositAmount?.toFixed(2).replace('.', ',') || (activeTrip.totalPrice * 0.5).toFixed(2).replace('.', ',')}
                      </strong>
                      <span className="text-[10px] text-emerald-500 block font-semibold">✓ Pago Online</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Saldo Restante (50%)</span>
                      <strong className="text-amber-400 font-mono font-bold text-sm">
                        R$ {activeTrip.remainingAmount?.toFixed(2).replace('.', ',') || (activeTrip.totalPrice * 0.5).toFixed(2).replace('.', ',')}
                      </strong>
                      <span className="text-[10px] text-amber-300 block font-semibold">No Embarque</span>
                    </div>
                  </div>

                  {activeTrip.remainingAmount && activeTrip.remainingAmount > 0 && activeTrip.paymentStatus !== 'Pago (PIX)' && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleConfirmBoardingPayment(activeTrip.id, 'PIX')}
                        className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Confirmar Recebimento do Saldo de R$ {activeTrip.remainingAmount.toFixed(2).replace('.', ',')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary Progress Action Stepper (Large In-Car Buttons) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">
                    Ação da Etapa Atual:
                  </span>

                  {activeTrip.status === 'Confirmado' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'A caminho')}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 transition-transform active:scale-98 cursor-pointer"
                    >
                      <Car className="w-5 h-5" />
                      <span>ETAPA 1: INICIAR (A CAMINHO DA COLETA)</span>
                    </button>
                  )}

                  {activeTrip.status === 'A caminho' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'Em andamento')}
                      className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 transition-transform active:scale-98 cursor-pointer"
                    >
                      <Users className="w-5 h-5" />
                      <span>ETAPA 2: PASSAGEIRO A BORDO (EM VIAGEM)</span>
                    </button>
                  )}

                  {activeTrip.status === 'Em andamento' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'Concluído')}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-transform active:scale-98 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>ETAPA 3: FINALIZAR E CONCLUIR VIAGEM</span>
                    </button>
                  )}

                  {activeTrip.status === 'Concluído' && (
                    <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-3.5 rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Viagem concluída com sucesso! Sistema liberado.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MINHA ESCALA & HISTÓRICO */}
        {/* ========================================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display font-bold text-base text-white">
                Escala de Viagens ({myTrips.length})
              </h3>

              <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-xs">
                <button
                  onClick={() => setScheduleFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    scheduleFilter === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setScheduleFilter('pending')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    scheduleFilter === 'pending' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setScheduleFilter('completed')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    scheduleFilter === 'completed' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Concluídas
                </button>
              </div>
            </div>

            {myTrips.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-xs text-slate-400">
                Nenhuma viagem cadastrada na sua escala no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {myTrips
                  .filter((t) => {
                    if (scheduleFilter === 'pending') return t.status !== 'Concluído' && t.status !== 'Cancelado';
                    if (scheduleFilter === 'completed') return t.status === 'Concluído';
                    return true;
                  })
                  .map((trip) => (
                    <div
                      key={trip.id}
                      className={`bg-slate-900 border rounded-2xl p-4 space-y-2.5 transition-all ${
                        activeTrip?.id === trip.id
                          ? 'border-amber-400/80 shadow-lg shadow-amber-400/5'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {trip.code}
                          </span>
                          <span className="text-xs text-amber-400 font-bold">
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
                        <strong className="text-white text-sm block font-bold">
                          {trip.customerName}
                        </strong>
                        <p className="text-slate-400 text-xs mt-0.5">
                          📍 {trip.origin} ➔ {trip.destination}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-400 font-semibold">
                          👥 {trip.passengers} passageiro(s) • {trip.tripType}
                        </span>
                        <span className="font-serif-display font-bold text-emerald-400">
                          R$ {trip.totalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {trip.status !== 'Concluído' && (
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              StorageService.updateReservationStatus(trip.id, 'Confirmado');
                              setActiveTab('active');
                            }}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Abrir no Cockpit da Viagem</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TELEMETRIA GPS & ROTA */}
        {/* ========================================================================= */}
        {activeTab === 'gps-nav' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif-display font-extrabold text-base text-white">
                  Telemetria GPS do Veículo
                </h3>
              </div>

              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SINAL GPS 100%</span>
              </span>
            </div>

            {/* Simulated Live Gauge & Speedometer */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  <span>Velocímetro Operacional:</span>
                </span>
                <strong className="font-mono text-2xl font-black text-amber-400">
                  {simulatedSpeedKmH} <span className="text-xs text-slate-400 font-normal">km/h</span>
                </strong>
              </div>

              {/* Highway segment */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Trecho Atual:</span>
                <span className="text-white font-bold">{currentHighway}</span>
              </div>

              {/* On-Route vs Off-Route Status Indicator */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-black ${
                  isOffRoute
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isOffRoute ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  <span>
                    {isOffRoute
                      ? `DESVIO DE ROTA DETECTADO (+${offRouteDistanceKm} km)`
                      : 'NA ROTA OFICIAL AUTORIZADA (SEM DESVIOS)'}
                  </span>
                </div>
              </div>

              {/* Surcharge preview if off route */}
              {isOffRoute && (
                <div className="bg-slate-900 p-3 rounded-xl border border-amber-500/40 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Taxa Extra Calculada:</span>
                    <strong className="text-amber-400 font-bold text-sm">
                      + R$ {(offRouteDistanceKm * PRICING_RULES.offRouteKmRate).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Tarifa por km adicional ({offRouteDistanceKm} km × R$ 4,50/km) conforme regra operacional da Litoral em Movimento.
                  </p>
                </div>
              )}

              {/* Simulation test buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSimulateDetour}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-2.5 px-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  ⚠️ Registrar Desvio (+4.5 km)
                </button>
                <button
                  type="button"
                  onClick={handleResetDetour}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 px-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  ✓ Retornar à Rota Oficial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CHECKLIST & VEÍCULO SPIN 7L */}
        {/* ========================================================================= */}
        {activeTab === 'checklist' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-display font-extrabold text-base text-white">
                  Inspeção Diária do Veículo
                </h3>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Spin 7L • 2024
              </span>
            </div>

            <form onSubmit={handleSaveChecklist} className="space-y-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Itens Obrigatórios de Segurança & Conforto:
                </span>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-200">1. Pneus calibrados (inclusive estepe)</span>
                  <input
                    type="checkbox"
                    checked={checklist.tires}
                    onChange={(e) => setChecklist({ ...checklist, tires: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-200">2. Nível de óleo do motor e fluido de arrefecimento</span>
                  <input
                    type="checkbox"
                    checked={checklist.oilWater}
                    onChange={(e) => setChecklist({ ...checklist, oilWater: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-200">3. Ar-condicionado duplo funcionando e higienizado</span>
                  <input
                    type="checkbox"
                    checked={checklist.airConditioning}
                    onChange={(e) => setChecklist({ ...checklist, airConditioning: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-200">4. Interior limpo, higienizado e aspirado</span>
                  <input
                    type="checkbox"
                    checked={checklist.cleanliness}
                    onChange={(e) => setChecklist({ ...checklist, cleanliness: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-200">5. Garrafas de água mineral de cortesia abastecidas</span>
                  <input
                    type="checkbox"
                    checked={checklist.mineralWater}
                    onChange={(e) => setChecklist({ ...checklist, mineralWater: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-200">6. Cintos de segurança dos 7 assentos revisados</span>
                  <input
                    type="checkbox"
                    checked={checklist.seatbelts}
                    onChange={(e) => setChecklist({ ...checklist, seatbelts: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                </label>
              </div>

              {/* Odometer Tracking */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Registro de Odômetro (KM):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">KM Inicial do Dia:</label>
                    <input
                      type="text"
                      value={odometerStart}
                      onChange={(e) => setOdometerStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">KM Final do Dia:</label>
                    <input
                      type="text"
                      placeholder="Ex: 42.610"
                      value={odometerEnd}
                      onChange={(e) => setOdometerEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Salvar Checklist & Liberar Veículo</span>
              </button>

              {checklistSaved && (
                <div className="p-3 bg-emerald-950 border border-emerald-500/50 rounded-xl text-center text-xs text-emerald-300 font-bold">
                  ✓ Checklist registrado com sucesso no banco de dados!
                </div>
              )}
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MEUS GANHOS & EXTRATO */}
        {/* ========================================================================= */}
        {activeTab === 'earnings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif-display font-extrabold text-base text-white">
                  Extrato de Produção & Ganhos
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                Semana Vigente
              </span>
            </div>

            {/* Big Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Hoje</span>
                <strong className="font-serif-display font-black text-xl text-emerald-400 block mt-1">
                  R$ {todayEarnings.toFixed(2).replace('.', ',')}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {completedTrips.length} viagem(ns) finalizada(s)
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Geral</span>
                <strong className="font-serif-display font-black text-xl text-amber-400 block mt-1">
                  {selectedDriver.totalTrips} viagens
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Nota média: ★ {selectedDriver.rating}
                </span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                Métricas Operacionais:
              </span>
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                <span>Pontualidade no Embarque:</span>
                <strong className="text-emerald-400">99.4%</strong>
              </div>
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/80">
                <span>Taxa de Aceite de Viagens:</span>
                <strong className="text-emerald-400">100%</strong>
              </div>
              <div className="flex justify-between text-slate-300 py-1">
                <span>Revisão do Veículo:</span>
                <strong className="text-sky-400">Em dia (Spin 7L)</strong>
              </div>
            </div>

            {/* Driver Guidelines */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <strong className="text-slate-200 block">Padrão Executivo Litoral em Movimento:</strong>
              <p>• Ar-condicionado ligado na temperatura ideal.</p>
              <p>• Oferecer água mineral no embarque.</p>
              <p>• Direção defensiva e respeito à velocidade máxima na Tamoios e Rio-Santos.</p>
            </div>
          </div>
        )}
      </main>

      {/* 3. EMERGENCY / DISPATCH MODAL */}
      {emergencyOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEmergencyOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border-2 border-red-500 text-red-500 mx-auto flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display font-extrabold text-xl text-white">
                Suporte Operacional
              </h3>
              <p className="text-xs text-slate-400">
                Central de Atendimento & Despacho de Motoristas da Litoral em Movimento.
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${COMPANY_CONTACT.phoneRaw}`}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Ligar para Central ({COMPANY_CONTACT.phone})</span>
              </a>

              <button
                onClick={sendEmergencyWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp de Suporte com Localização</span>
              </button>

              <button
                type="button"
                onClick={() => setEmergencyOpen(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 text-center"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INSTALL STANDALONE APP MODAL */}
      {isInstallModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsInstallModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="font-serif-display font-extrabold text-xl text-white">
                Instalar App Standalone
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use este aplicativo como um App nativo no celular ou tablet sem barras de navegação do navegador.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="space-y-1">
                <strong className="text-amber-400 font-bold block flex items-center gap-1.5">
                  <span>📱 No iPhone / iPad (Safari):</span>
                </strong>
                <p className="text-slate-300">
                  1. Toque no botão de <strong>Compartilhar</strong> (<Share2 className="w-3.5 h-3.5 inline text-sky-400" />) na barra inferior do Safari.
                </p>
                <p className="text-slate-300">
                  2. Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1">
                <strong className="text-emerald-400 font-bold block">
                  🤖 No Android (Chrome / Edge):
                </strong>
                <p className="text-slate-300">
                  1. Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito do navegador.
                </p>
                <p className="text-slate-300">
                  2. Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </p>
              </div>

              <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-400">
                ⭐ O app funcionará em tela cheia (modo standalone), com inicialização direta no cockpit do motorista.
              </div>
            </div>

            <div className="space-y-2">
              {deferredPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Agora em 1 Toque</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DRIVER BOTTOM STATUS FOOTER */}
      <footer className="bg-slate-900/90 border-t border-slate-800 py-2.5 px-4 text-center text-[10px] text-slate-400 sticky bottom-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Motorista Conectado • {selectedDriver.name}</span>
          </span>
          <span className="text-slate-400">
            Central: {COMPANY_CONTACT.phone}
          </span>
        </div>
      </footer>
    </div>
  );
};
