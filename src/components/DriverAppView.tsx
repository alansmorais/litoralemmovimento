import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Reservation, Driver, TripStatus, GPSDeviation } from '../types';
import { DRIVERS, PRICING_RULES } from '../data/mockData';
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
} from 'lucide-react';

interface DriverAppViewProps {
  onBackToSite: () => void;
  onOpenAdmin: () => void;
}

export const DriverAppView: React.FC<DriverAppViewProps> = ({
  onBackToSite,
  onOpenAdmin,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>(DRIVERS);
  const [selectedDriver, setSelectedDriver] = useState<Driver>(DRIVERS[0]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'schedule' | 'gps-nav'>('active');

  // GPS Simulation State for Driver
  const [isGpsTracking, setIsGpsTracking] = useState(true);
  const [simulatedSpeedKmH, setSimulatedSpeedKmH] = useState(82);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [offRouteDistanceKm, setOffRouteDistanceKm] = useState(0);

  const loadDriverData = () => {
    const all = StorageService.getReservations();
    setReservations(all);
  };

  useEffect(() => {
    loadDriverData();
    const handleUpdate = () => loadDriverData();
    window.addEventListener('reservations_updated', handleUpdate);
    return () => window.removeEventListener('reservations_updated', handleUpdate);
  }, []);

  // Filter trips for this driver
  const myTrips = reservations.filter((r) => r.assignedDriverId === selectedDriver.id);
  const activeTrip = myTrips.find(
    (r) => r.status === 'Em andamento' || r.status === 'A caminho' || r.status === 'Confirmado'
  ) || myTrips[0];

  const handleUpdateStatus = (tripId: string, newStatus: TripStatus) => {
    StorageService.updateReservationStatus(tripId, newStatus);
    loadDriverData();
  };

  const handleSimulateDetour = () => {
    setIsOffRoute(true);
    setOffRouteDistanceKm((prev) => +(prev + 4.2).toFixed(1));
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

  const sendQuickPassengerMessage = (phone: string, template: string) => {
    const cleanPhone = '55' + phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(template)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between">
      {/* Driver Top Navigation / Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={selectedDriver.photoUrl}
                alt={selectedDriver.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="font-serif-display font-bold text-sm text-white">
                  {selectedDriver.name}
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                  ★ {selectedDriver.rating}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Chevrolet Spin • {selectedDriver.plate}
              </span>
            </div>
          </div>

          {/* Switch Driver Account Selector (2 Drivers) */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedDriver.id}
              onChange={(e) => {
                const found = DRIVERS.find((d) => d.id === e.target.value);
                if (found) setSelectedDriver(found);
              }}
              className="bg-slate-900 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 outline-none cursor-pointer"
            >
              <option value="drv-01">Motorista 1: Carlos Silva</option>
              <option value="drv-02">Motorista 2: Marcos Oliveira</option>
            </select>

            <button
              onClick={onBackToSite}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Sair do modo motorista"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Container - Mobile Format Layout */}
      <div className="max-w-md mx-auto w-full px-4 py-4 flex-1 space-y-4">
        {/* Navigation Tabs for Driver */}
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-xs">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚗 Viagem Atual
          </button>
          <button
            onClick={() => setActiveTab('gps-nav')}
            className={`py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              activeTab === 'gps-nav'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛰️ Rota & GPS
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📅 Escala ({myTrips.length})
          </button>
        </div>

        {/* TAB 1: ACTIVE TRIP CARD */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {!activeTrip ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-serif-display font-bold text-lg text-slate-900">
                  Nenhuma viagem em andamento
                </h3>
                <p className="text-xs text-slate-500">
                  Você está livre no momento. Verifique sua escala ou aguarde novas viagens atribuídas pela central.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                {/* Header Status & Code */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Código da Viagem
                    </span>
                    <strong className="font-mono text-base text-slate-900">{activeTrip.code}</strong>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      activeTrip.status === 'Confirmado'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : activeTrip.status === 'A caminho'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : activeTrip.status === 'Em andamento'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {activeTrip.status}
                  </span>
                </div>

                {/* Passenger Info Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-display font-bold text-base text-slate-900">
                        {activeTrip.customerName}
                      </h3>
                      <span className="text-xs text-sky-600 font-semibold">
                        {activeTrip.passengers} passageiro(s) • {activeTrip.tripType}
                      </span>
                    </div>

                    <span className="font-serif-display font-bold text-sm text-slate-900">
                      R$ {activeTrip.totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <a
                      href={`tel:${activeTrip.customerPhone.replace(/\D/g, '')}`}
                      className="bg-sky-600 hover:bg-sky-500 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Ligar</span>
                    </a>

                    <button
                      onClick={() =>
                        sendQuickPassengerMessage(
                          activeTrip.customerPhone,
                          `Olá ${activeTrip.customerName}! Sou o motorista ${selectedDriver.name} da Litoral em Movimento (Chevrolet Spin ${selectedDriver.plate}). Estou a caminho do seu ponto de embarque.`
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Route Waypoints */}
                <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-start gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Embarque</span>
                      <strong className="text-slate-900 text-xs block">{activeTrip.origin}</strong>
                      <span className="text-[11px] text-slate-600 block">
                        {activeTrip.pickupAddress || activeTrip.originDetails || 'Endereço a confirmar'}
                      </span>
                    </div>
                  </div>

                  {activeTrip.extraStops.map((stop, sIdx) => (
                    <div key={stop.id} className="flex items-start gap-2.5 pl-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-amber-700 uppercase block font-semibold">
                          Parada Extra {sIdx + 1}
                        </span>
                        <span className="text-[11px] text-slate-800 block">{stop.address}</span>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-start gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-sky-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Desembarque</span>
                      <strong className="text-slate-900 text-xs block">{activeTrip.destination}</strong>
                      <span className="text-[11px] text-slate-600 block">
                        {activeTrip.dropoffAddress || activeTrip.destinationDetails || 'Endereço a confirmar'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation App Launchers (Waze & Google Maps) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openWaze(activeTrip.dropoffAddress || activeTrip.destination)}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Navegar no Waze</span>
                  </button>

                  <button
                    onClick={() => openGoogleMaps(activeTrip.dropoffAddress || activeTrip.destination)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>Google Maps</span>
                  </button>
                </div>

                {/* Step-by-Step Status Flow Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Atualizar Etapa da Viagem:
                  </span>

                  {activeTrip.status === 'Confirmado' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'A caminho')}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <Car className="w-4 h-4" />
                      <span>INICIAR: A CAMINHO DA COLETA</span>
                    </button>
                  )}

                  {activeTrip.status === 'A caminho' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'Em andamento')}
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>PASSAGEIRO A BORDO: EM VIAGEM</span>
                    </button>
                  )}

                  {activeTrip.status === 'Em andamento' && (
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'Concluído')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>FINALIZAR E CONCLUIR VIAGEM</span>
                    </button>
                  )}

                  {activeTrip.status === 'Concluído' && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-center text-xs font-bold">
                      ✓ Viagem concluída com sucesso!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GPS ROUTE & DEVIATION MONITOR */}
        {activeTab === 'gps-nav' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-600" />
                <h3 className="font-serif-display font-bold text-base text-slate-900">
                  Telemetria GPS em Tempo Real
                </h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                GPS ATIVO
              </span>
            </div>

            {/* Simulated Live Route Canvas / Graphic */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Velocidade Atual:</span>
                <strong className="text-slate-900 text-sm font-mono">{simulatedSpeedKmH} km/h</strong>
              </div>

              {/* Status pill: On-Route vs Off-Route */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  isOffRoute
                    ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isOffRoute ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>
                    {isOffRoute
                      ? `DESVIO DE ROTA DETECTADO (+${offRouteDistanceKm} km)`
                      : 'NA ROTA AUTORIZADA (TAMOIOS / RIO-SANTOS)'}
                  </span>
                </div>
              </div>

              {/* Surcharge preview if off route */}
              {isOffRoute && (
                <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-800">
                    <span>Taxa Extra Calculada:</span>
                    <strong className="text-amber-600 font-bold">
                      + R$ {(offRouteDistanceKm * PRICING_RULES.offRouteKmRate).toFixed(2)}
                    </strong>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Calculado por km ({offRouteDistanceKm} km x R$ 4,50/km) sem taxímetro.
                  </span>
                </div>
              )}

              {/* Simulation test buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSimulateDetour}
                  className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  ⚠️ Simular Desvio (+4.2 km)
                </button>
                <button
                  type="button"
                  onClick={handleResetDetour}
                  className="bg-slate-800 hover:bg-slate-900 text-white py-2 px-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  ✓ Retornar à Rota Padrão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <h3 className="font-serif-display font-bold text-sm text-slate-700 uppercase tracking-wider">
              Viagens Atribuídas a {selectedDriver.name}
            </h3>

            {myTrips.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Nenhuma viagem agendada no momento.
              </div>
            ) : (
              myTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                      {trip.code}
                    </span>
                    <span className="text-amber-600 font-bold">
                      {trip.date} às {trip.time}
                    </span>
                  </div>

                  <strong className="text-slate-900 text-sm block">{trip.customerName}</strong>
                  <p className="text-slate-600">
                    📍 {trip.origin} ➔ {trip.destination}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-slate-500">{trip.passengers} passageiro(s)</span>
                    <span className="font-bold text-slate-900 font-serif-display">R$ {trip.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Driver Bottom Quick Info Bar */}
      <div className="bg-slate-950 border-t border-slate-800 py-2 px-4 text-center text-[10px] text-slate-400">
        Suporte Operacional Central Litoral: (11) 9 9999-9999 • Chevrolet Spin 7L
      </div>
    </div>
  );
};
