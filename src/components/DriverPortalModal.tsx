import React, { useState, useEffect } from 'react';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle2,
  DollarSign,
  User,
  Users,
  Luggage,
  Baby,
  Plane,
  AlertCircle,
  X,
  RefreshCw,
  Search,
  ArrowRight,
  Sparkles,
  Shield,
  Key,
  LogOut,
  ChevronRight,
  TrendingUp,
  Map,
  PlusCircle,
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Reservation, Driver, GPSDeviation } from '../types';

interface DriverPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export const DriverPortalModal: React.FC<DriverPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>(() => StorageService.getDrivers());
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    try {
      const savedAuth = localStorage.getItem('litoral_driver_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed?.driverId) return parsed.driverId;
      }
    } catch {}
    const list = StorageService.getDrivers();
    return list[0]?.id || 'drv-01';
  });

  const [activeTab, setActiveTab] = useState<'my_trips' | 'all_trips' | 'earnings' | 'gps'>('my_trips');
  const [reservations, setReservations] = useState<Reservation[]>(() => StorageService.getReservations());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'upcoming'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // GPS Deviation modal state
  const [deviationModalTrip, setDeviationModalTrip] = useState<Reservation | null>(null);
  const [deviationKm, setDeviationKm] = useState('10');
  const [deviationReason, setDeviationReason] = useState('Parada adicional solicitada pelo passageiro');
  const [deviationPricingMode, setDeviationPricingMode] = useState<'fixed' | 'km'>('fixed');

  // Load and subscribe to real-time events
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      await StorageService.syncWithServer();
    } catch (e) {
      console.warn('Sync server delayed:', e);
    }
    const currentReservations = StorageService.getReservations();
    const currentDrivers = StorageService.getDrivers();
    setReservations(currentReservations);
    setDrivers(currentDrivers);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }

    const handleResUpdated = () => {
      setReservations(StorageService.getReservations());
    };
    const handleDrvUpdated = () => {
      setDrivers(StorageService.getDrivers());
    };

    window.addEventListener('reservations_updated', handleResUpdated);
    window.addEventListener('drivers_updated', handleDrvUpdated);

    // Periodic auto-sync every 8 seconds while open
    const interval = setInterval(() => {
      if (isOpen) {
        StorageService.syncWithServer().then(() => {
          setReservations(StorageService.getReservations());
          setDrivers(StorageService.getDrivers());
        });
      }
    }, 8000);

    return () => {
      window.removeEventListener('reservations_updated', handleResUpdated);
      window.removeEventListener('drivers_updated', handleDrvUpdated);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  // Helper to check if a reservation is assigned to this driver
  const isTripAssignedToCurrentDriver = (r: Reservation): boolean => {
    if (!currentDriver) return false;
    if (r.assignedDriverId && r.assignedDriverId === currentDriver.id) return true;
    if (r.assignedDriverName) {
      const normAssigned = r.assignedDriverName.toLowerCase().trim();
      const normDriver = currentDriver.name.toLowerCase().trim();
      if (normAssigned === normDriver) return true;
      if (normAssigned.includes(normDriver) || normDriver.includes(normAssigned)) return true;
    }
    return false;
  };

  // Switch driver
  const handleSelectDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    try {
      localStorage.setItem('litoral_driver_auth', JSON.stringify({ driverId }));
    } catch {}
  };

  // Change driver active status (Disponível, Em Viagem, Descanso)
  const handleUpdateStatus = (status: 'Disponível' | 'Em Viagem' | 'Descanso') => {
    if (!currentDriver) return;
    StorageService.updateDriverStatus(currentDriver.id, status);
    setDrivers(StorageService.getDrivers());
    setActionSuccessMsg(`Seu status agora é: ${status}`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Change reservation status (A caminho, Em andamento, Concluído)
  const handleTripStatusChange = (
    reservationId: string,
    newStatus: 'A caminho' | 'Em andamento' | 'Concluído'
  ) => {
    StorageService.updateReservationStatus(reservationId, newStatus);
    if (newStatus === 'Concluído') {
      StorageService.confirmBoardingPayment(reservationId, 'PIX');
    }
    setReservations(StorageService.getReservations());
    setActionSuccessMsg(`Viagem atualizada para: ${newStatus}!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Self-assign an unassigned trip
  const handleSelfAssignTrip = async (reservationId: string) => {
    if (!currentDriver) return;
    await StorageService.assignDriver(reservationId, currentDriver.id);
    setReservations(StorageService.getReservations());
    setActionSuccessMsg(`Você assumiu esta viagem com sucesso! Ela agora está na sua aba de viagens.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Submit GPS Deviation
  const handleSaveDeviation = () => {
    if (!deviationModalTrip) return;
    const kmNum = Number(deviationKm) || 0;
    const deviation: GPSDeviation = {
      detected: true,
      distanceKm: kmNum,
      detourLocation: deviationReason,
      rateType: deviationPricingMode === 'fixed' ? 'flat' : 'per_km',
      calculatedSurcharge: deviationPricingMode === 'fixed' ? 50 : Number((kmNum * 4.5).toFixed(2)),
      approvedByAdmin: true,
      timestamp: new Date().toISOString(),
      reason: deviationReason,
    };

    StorageService.addGpsDeviation(deviationModalTrip.id, deviation, true);
    setReservations(StorageService.getReservations());
    setDeviationModalTrip(null);
    setActionSuccessMsg('Desvio/Parada extra registrado e calculado com sucesso!');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Filtered trips for "Minhas Viagens"
  const todayStr = new Date().toISOString().split('T')[0];
  const myAssignedTrips = reservations.filter((r) => {
    if (!isTripAssignedToCurrentDriver(r)) return false;
    if (r.status === 'Cancelado') return false;

    if (filterDate === 'today') {
      const normDate = StorageService.normalizeDate(r.date);
      return normDate === todayStr;
    }
    if (filterDate === 'upcoming') {
      return r.status !== 'Concluído';
    }
    return true;
  });

  // Filtered trips for "Todas as Viagens"
  const allFilteredTrips = reservations.filter((r) => {
    if (r.status === 'Cancelado') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = r.code.toLowerCase().includes(q);
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchOrigin = r.origin.toLowerCase().includes(q);
      const matchDest = r.destination.toLowerCase().includes(q);
      const matchDriver = (r.assignedDriverName || '').toLowerCase().includes(q);
      return matchCode || matchName || matchOrigin || matchDest || matchDriver;
    }
    return true;
  });

  // Earnings calculations
  const completedDriverTrips = reservations.filter(
    (r) => isTripAssignedToCurrentDriver(r) && r.status === 'Concluído'
  );
  const totalRevenue = completedDriverTrips.reduce((acc, r) => acc + (r.totalPrice || 0), 0);
  const totalDriverEarnings = totalRevenue * 0.7; // 70% share for driver
  const pendingBoardingPayments = myAssignedTrips
    .filter((r) => r.status !== 'Concluído' && !r.depositPaid && r.remainingAmount > 0)
    .reduce((acc, r) => acc + r.remainingAmount, 0);

  return (
    <div
      id="driver-portal-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="driver-portal-modal-container"
        className="bg-slate-900 border border-slate-700/80 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto text-slate-100"
      >
        {/* Top Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Portal do Motorista
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                    Spin 7L • Litoral
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Escala operacional em tempo real sincronizada com o Painel Central e Google Sheets
              </p>
            </div>
          </div>

          {/* Quick Actions / Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            {onOpenAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                title="Ir para o Painel Administrativo"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Painel Admin</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Driver Profile Bar & Status Selector */}
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Driver Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedDriverId}
                onChange={(e) => handleSelectDriver(e.target.value)}
                className="bg-slate-950 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-2xl outline-none cursor-pointer hover:border-amber-400 pr-8 transition-colors shadow-inner"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white font-medium">
                    👤 {d.name} ({d.vehicleModel.split(' ')[0]} • Placa {d.plate.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            {currentDriver && (
              <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  {currentDriver.vehicleModel} ({currentDriver.plate})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {currentDriver.phone}
                </span>
              </div>
            )}
          </div>

          {/* Real-time Status Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleUpdateStatus('Disponível')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentDriver?.activeStatus === 'Disponível'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Disponível</span>
            </button>
            <button
              onClick={() => handleUpdateStatus('Em Viagem')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentDriver?.activeStatus === 'Em Viagem'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Em Viagem</span>
            </button>
            <button
              onClick={() => handleUpdateStatus('Descanso')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentDriver?.activeStatus === 'Descanso'
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Descanso</span>
            </button>
          </div>
        </div>

        {/* Action Notification Toast */}
        {actionSuccessMsg && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('my_trips')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'my_trips'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Minhas Viagens Escaladas</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                activeTab === 'my_trips' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {myAssignedTrips.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all_trips')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all_trips'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Quadro Geral de Escala</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                activeTab === 'all_trips' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {reservations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'earnings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Meus Ganhos & Extrato</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: MINHAS VIAGENS ESCALADAS */}
          {activeTab === 'my_trips' && (
            <div className="space-y-4">
              {/* Filter Sub-bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Exibir:</span>
                  <button
                    onClick={() => setFilterDate('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      filterDate === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Todas ({reservations.filter(isTripAssignedToCurrentDriver).length})
                  </button>
                  <button
                    onClick={() => setFilterDate('upcoming')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      filterDate === 'upcoming'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Próximas / Em Andamento
                  </button>
                  <button
                    onClick={() => setFilterDate('today')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      filterDate === 'today'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Hoje
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Motorista selecionado: <span className="text-amber-300 font-bold">{currentDriver?.name}</span>
                </div>
              </div>

              {/* Trips List */}
              {myAssignedTrips.length === 0 ? (
                <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Nenhuma viagem atribuída para {currentDriver?.name} no momento
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Você pode visualizar todas as reservas pendentes na aba{' '}
                    <strong className="text-amber-300">"Quadro Geral de Escala"</strong> e assumir qualquer
                    corrida livre com um clique!
                  </p>
                  <button
                    onClick={() => setActiveTab('all_trips')}
                    className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Ver Quadro Geral de Escala</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {myAssignedTrips.map((trip) => {
                    const isCompleted = trip.status === 'Concluído';
                    const isEnRoute = trip.status === 'A caminho';
                    const isInProgress = trip.status === 'Em andamento';

                    // Phone format for WhatsApp
                    const cleanPhone = trip.customerPhone.replace(/\D/g, '');
                    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                    const whatsappMsg = encodeURIComponent(
                      `Olá ${trip.customerName}, aqui é o seu motorista ${currentDriver.name} da Litoral em Movimento. Estou com a sua reserva #${trip.code} (${trip.origin} ➔ ${trip.destination}) agendada para ${trip.date} às ${trip.time}. Tudo pronto!`
                    );

                    // Navigation URL (Waze / Maps)
                    const mapsQuery = encodeURIComponent(
                      `${trip.pickupAddress || trip.origin} to ${trip.dropoffAddress || trip.destination}`
                    );
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                      trip.pickupAddress || trip.origin
                    )}&destination=${encodeURIComponent(trip.dropoffAddress || trip.destination)}`;

                    return (
                      <div
                        key={trip.id}
                        id={`driver-trip-card-${trip.id}`}
                        className={`rounded-3xl border p-5 space-y-4 transition-all shadow-md ${
                          isInProgress
                            ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                            : isEnRoute
                            ? 'bg-sky-950/20 border-sky-500/60'
                            : isCompleted
                            ? 'bg-slate-950/40 border-slate-800 opacity-80'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                #{trip.code}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : isInProgress
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                    : isEnRoute
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {trip.status}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                              {trip.customerName}
                            </h4>
                          </div>

                          {/* Date & Time Badge */}
                          <div className="text-right">
                            <div className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>{trip.date}</span>
                            </div>
                            <div className="text-xs font-extrabold text-white flex items-center justify-end gap-1 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-sky-400" />
                              <span>{trip.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Route Details */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                            <div>
                              <span className="text-slate-400 block text-[11px]">Origem (Embarque):</span>
                              <span className="text-white font-semibold">{trip.pickupAddress || trip.origin}</span>
                              {trip.originDetails && (
                                <span className="text-slate-400 block text-[10px]">{trip.originDetails}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                            <div>
                              <span className="text-slate-400 block text-[11px]">Destino (Desembarque):</span>
                              <span className="text-white font-semibold">{trip.dropoffAddress || trip.destination}</span>
                              {trip.destinationDetails && (
                                <span className="text-slate-400 block text-[10px]">{trip.destinationDetails}</span>
                              )}
                            </div>
                          </div>

                          {trip.flightNumber && (
                            <div className="bg-sky-950/40 border border-sky-800/40 rounded-xl p-2 flex items-center gap-2 text-sky-300 text-[11px]">
                              <Plane className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                Voo / Terminal Aeroporto: <strong>{trip.flightNumber}</strong>
                              </span>
                            </div>
                          )}

                          {trip.extraStops && trip.extraStops.length > 0 && (
                            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2 text-amber-300 text-[11px]">
                              <strong>{trip.extraStops.length} Parada(s) Adicional(is):</strong>{' '}
                              {trip.extraStops.map((s) => s.address).join(' ➔ ')}
                            </div>
                          )}
                        </div>

                        {/* Trip Specs / Amenities */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300 border-t border-slate-800/80">
                          <span className="bg-slate-900 px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-800">
                            <Users className="w-3 h-3 text-slate-400" />
                            {trip.passengers} passageiro(s)
                          </span>
                          <span className="bg-slate-900 px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-800">
                            <Luggage className="w-3 h-3 text-slate-400" />
                            {trip.luggageCount} mala(s)
                          </span>
                          {trip.hasChildSeat && (
                            <span className="bg-amber-950/40 text-amber-300 border border-amber-800/40 px-2 py-1 rounded-lg flex items-center gap-1 font-semibold">
                              <Baby className="w-3 h-3 text-amber-400" />
                              Cadeirinha/Assento
                            </span>
                          )}
                          <span className="bg-slate-900 px-2 py-1 rounded-lg text-slate-400 border border-slate-800">
                            {trip.tripType}
                          </span>
                        </div>

                        {/* Financial Box: Boarding Balance */}
                        <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">
                              Cobrança no Embarque
                            </span>
                            <div className="text-base sm:text-lg font-black text-amber-400">
                              {trip.remainingAmount > 0 ? (
                                `R$ ${trip.remainingAmount.toFixed(2).replace('.', ',')}`
                              ) : (
                                <span className="text-emerald-400 text-sm">✓ 100% Quitado</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Total Viagem: R$ {trip.totalPrice.toFixed(2).replace('.', ',')}
                              {trip.depositPaid && ' (Sinal 50% já pago)'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              Forma de Pagamento
                            </span>
                            <span className="text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 inline-block mt-0.5">
                              {trip.paymentMethod || 'PIX'}
                            </span>
                          </div>
                        </div>

                        {/* Direct Action Buttons for Driver */}
                        <div className="space-y-2 pt-1">
                          {/* Navigation & WhatsApp */}
                          <div className="grid grid-cols-2 gap-2">
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Abrir GPS / Waze</span>
                            </a>

                            <a
                              href={`https://wa.me/${fullPhone}?text=${whatsappMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>

                          {/* Status Progression Controls */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {!isEnRoute && !isInProgress && !isCompleted && (
                              <button
                                onClick={() => handleTripStatusChange(trip.id, 'A caminho')}
                                className="flex-1 bg-sky-700/60 hover:bg-sky-600 text-sky-100 font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer border border-sky-600/40"
                              >
                                🚀 A Caminho
                              </button>
                            )}

                            {!isInProgress && !isCompleted && (
                              <button
                                onClick={() => handleTripStatusChange(trip.id, 'Em andamento')}
                                className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer shadow-sm"
                              >
                                ⏱️ Iniciar Corrida
                              </button>
                            )}

                            {isInProgress && !isCompleted && (
                              <button
                                onClick={() => handleTripStatusChange(trip.id, 'Concluído')}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Concluir Corrida & Cobrar</span>
                              </button>
                            )}

                            <button
                              onClick={() => setDeviationModalTrip(trip)}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                              title="Registrar desvio de rota ou parada extra solicitada pelo cliente"
                            >
                              + Parada GPS
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUADRO GERAL DE ESCALA (TODAS AS RESERVAS) */}
          {activeTab === 'all_trips' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por código, passageiro, origem, destino..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Total de Reservas: <strong className="text-amber-400">{allFilteredTrips.length}</strong>
                </div>
              </div>

              {/* Table / Grid */}
              <div className="space-y-3">
                {allFilteredTrips.map((res) => {
                  const isAssignedToMe = isTripAssignedToCurrentDriver(res);
                  const isUnassigned = !res.assignedDriverName && !res.assignedDriverId;

                  return (
                    <div
                      key={res.id}
                      className={`bg-slate-950/70 border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isAssignedToMe
                          ? 'border-amber-500/50 bg-amber-950/10'
                          : isUnassigned
                          ? 'border-dashed border-amber-500/30'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">#{res.code}</span>
                          <span className="text-xs font-bold text-white">{res.customerName}</span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            {res.date} às {res.time}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              res.status === 'Concluído'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : res.status === 'Confirmado'
                                ? 'bg-sky-500/20 text-sky-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">{res.origin}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-amber-400 font-semibold">{res.destination}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{res.passengers} passageiro(s)</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-amber-300 font-bold">
                            R$ {res.totalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {/* Driver Assigned Indicator */}
                        <div className="text-xs">
                          {isAssignedToMe ? (
                            <span className="text-emerald-300 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Atribuído a você ({currentDriver.name})
                            </span>
                          ) : res.assignedDriverName ? (
                            <span className="text-slate-400">
                              Motorista escalado: <strong className="text-white">{res.assignedDriverName}</strong>
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              Sem Motorista Atribuído (Corrida Livre)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        {isUnassigned ? (
                          <button
                            onClick={() => handleSelfAssignTrip(res.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Assumir Esta Corrida</span>
                          </button>
                        ) : isAssignedToMe ? (
                          <button
                            onClick={() => setActiveTab('my_trips')}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
                          >
                            Ver Meus Detalhes
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">Escalado</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MEUS GANHOS & EXTRATO */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              {/* Financial Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">Viagens Concluídas</span>
                  <div className="text-2xl font-black text-white">{completedDriverTrips.length}</div>
                  <span className="text-[11px] text-emerald-400">Histórico do motorista</span>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">Faturamento Bruto</span>
                  <div className="text-2xl font-black text-amber-400">
                    R$ {totalRevenue.toFixed(2).replace('.', ',')}
                  </div>
                  <span className="text-[11px] text-slate-400">Total movimentado</span>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-semibold block">Repasse Estimado (70%)</span>
                  <div className="text-2xl font-black text-emerald-400">
                    R$ {totalDriverEarnings.toFixed(2).replace('.', ',')}
                  </div>
                  <span className="text-[11px] text-emerald-300 font-mono">Líquido do motorista</span>
                </div>
              </div>

              {/* Boarding Collection Alert */}
              {pendingBoardingPayments > 0 && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-200 text-xs">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>
                      Você tem <strong>R$ {pendingBoardingPayments.toFixed(2).replace('.', ',')}</strong> a receber
                      diretamente dos passageiros nos próximos embarques.
                    </span>
                  </div>
                </div>
              )}

              {/* Completed Trips List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Histórico de Viagens Concluídas
                </h4>
                {completedDriverTrips.length === 0 ? (
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
                    Nenhuma viagem concluída registrada ainda.
                  </div>
                ) : (
                  completedDriverTrips.map((ct) => (
                    <div
                      key={ct.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-amber-400 font-bold">#{ct.code}</span> •{' '}
                        <strong className="text-white">{ct.customerName}</strong> ({ct.origin} ➔{' '}
                        {ct.destination})
                        <span className="text-slate-500 block text-[11px]">{ct.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 block">
                          R$ {((ct.totalPrice || 0) * 0.7).toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] text-slate-400">Repasse motorista</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* GPS Deviation Modal Sub-window */}
        {deviationModalTrip && (
          <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  Registrar Parada / Desvio GPS
                </h3>
                <button
                  onClick={() => setDeviationModalTrip(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Reserva <strong className="text-amber-300">#{deviationModalTrip.code}</strong> (
                {deviationModalTrip.customerName})
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tipo de Cobrança do Desvio:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeviationPricingMode('fixed')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                        deviationPricingMode === 'fixed'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">Taxa Fixa</div>
                      <div className="text-[10px] opacity-80">R$ 50,00 por parada</div>
                    </button>

                    <button
                      onClick={() => setDeviationPricingMode('km')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                        deviationPricingMode === 'km'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">Por Km Rodado</div>
                      <div className="text-[10px] opacity-80">R$ 4,50 por km extra</div>
                    </button>
                  </div>
                </div>

                {deviationPricingMode === 'km' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Distância Extra Estimada (km):
                    </label>
                    <input
                      type="number"
                      value={deviationKm}
                      onChange={(e) => setDeviationKm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Motivo / Local da Parada:</label>
                  <input
                    type="text"
                    value={deviationReason}
                    onChange={(e) => setDeviationReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-400"
                    placeholder="Ex: Parada na padaria / hotel secundário"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
                  <span className="text-[11px] text-slate-400 block">Acréscimo no valor total:</span>
                  <span className="text-base font-black text-amber-400">
                    + R${' '}
                    {deviationPricingMode === 'fixed'
                      ? '50,00'
                      : ((Number(deviationKm) || 0) * 4.5).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeviationModalTrip(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveDeviation}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Confirmar e Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
