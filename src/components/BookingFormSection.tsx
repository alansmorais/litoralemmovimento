import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Reservation, TripType, ExtraStop } from '../types';
import { PRICING_RULES, COMPANY_CONTACT } from '../data/mockData';
import { MonthlyBookingCalendar } from './MonthlyBookingCalendar';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Car,
  Briefcase,
  Baby,
  Plus,
  Trash2,
  CheckCircle,
  MessageCircle,
  Mail,
  Send,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Plane,
  CreditCard,
  FileText,
  X,
  ExternalLink,
  Copy,
  Tag,
  ShieldCheck,
  Compass,
  ArrowRight,
  Check,
  Printer,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface BookingFormSectionProps {
  initialDestination?: string;
  preloadRoute?: {
    origin: string;
    destination: string;
    time: string;
    tripType: TripType;
  } | null;
  onBookingSuccess: (reservation: Reservation) => void;
  onOpenTrackModal?: (code?: string) => void;
}

export const BookingFormSection: React.FC<BookingFormSectionProps> = ({
  initialDestination = 'São Sebastião',
  preloadRoute,
  onBookingSuccess,
  onOpenTrackModal,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [origin, setOrigin] = useState('São Paulo');
  const [pickupAddress, setPickupAddress] = useState('Estação Metrô Portuguesa-Tietê, São Paulo - SP');
  const [destination, setDestination] = useState(initialDestination);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<'spin_7' | 'sedan_4'>('spin_7');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('11:30');
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState<TripType>('Compartilhada');

  React.useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  React.useEffect(() => {
    if (preloadRoute) {
      setOrigin(preloadRoute.origin);
      setDestination(preloadRoute.destination);
      setTime(preloadRoute.time);
      setTripType(preloadRoute.tripType);
      if (preloadRoute.origin === 'São Sebastião') {
        setPickupAddress('Balsa de São Sebastião / Centro Histórico');
        setDropoffAddress('Estação Metrô Portuguesa-Tietê, São Paulo - SP');
      } else if (preloadRoute.origin.includes('Caraguatatuba')) {
        setPickupAddress('Rodoviária de Caraguatatuba');
        setDropoffAddress('Estação Metrô Portuguesa-Tietê, São Paulo - SP');
      } else {
        setPickupAddress('Estação Metrô Portuguesa-Tietê, São Paulo - SP');
        setDropoffAddress('Balsa de São Sebastião / Rodoviária Caraguá');
      }
    }
  }, [preloadRoute]);
  const [luggageCount, setLuggageCount] = useState(2);
  const [hasChildSeat, setHasChildSeat] = useState(false);
  const [flightNumber, setFlightNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Promo code engine
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountPercent?: number;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Extra Stops
  const [extraStops, setExtraStops] = useState<ExtraStop[]>([]);
  const [newStopAddress, setNewStopAddress] = useState('');
  const [showStopInput, setShowStopInput] = useState(false);

  // Status & Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<'PIX' | 'Cartão'>('PIX');
  const [copiedPixKey, setCopiedPixKey] = useState(false);

  // Route Preset shortcuts
  const routePresets = [
    {
      title: '🚇 Tietê ➔ S. Sebastião (R$ 90)',
      label: 'Metrô Portuguesa-Tietê ➔ Balsa São Sebastião',
      orig: 'São Paulo',
      dest: 'São Sebastião',
      pick: 'Estação Metrô Portuguesa-Tietê, São Paulo - SP',
      drop: 'Balsa de São Sebastião / Centro Histórico',
      time: '11:30',
      type: 'Compartilhada' as TripType,
    },
    {
      title: '🚌 Tietê ➔ Caraguá (R$ 80)',
      label: 'Metrô Portuguesa-Tietê ➔ Rodoviária Caraguatatuba',
      orig: 'São Paulo',
      dest: 'Caraguatatuba (Rodoviária / Sentido S. Sebastião)',
      pick: 'Estação Metrô Portuguesa-Tietê, São Paulo - SP',
      drop: 'Rodoviária de Caraguatatuba / Porto Novo',
      time: '14:30',
      type: 'Compartilhada' as TripType,
    },
    {
      title: '✈️ Aeroporto GRU ➔ Litoral (R$ 150)',
      label: 'Aeroporto de Guarulhos (GRU) ➔ Litoral Norte',
      orig: 'São Paulo',
      dest: 'São Sebastião',
      pick: 'Aeroporto Internacional de Guarulhos (GRU) - Terminais 2/3',
      drop: 'Balsa São Sebastião / Caraguatatuba',
      time: '17:30',
      type: 'Compartilhada' as TripType,
    },
    {
      title: '🏖️ Subida: S. Sebastião ➔ Tietê (R$ 90)',
      label: 'São Sebastião ➔ Metrô Portuguesa-Tietê',
      orig: 'São Sebastião',
      dest: 'São Paulo',
      pick: 'Balsa de São Sebastião / Centro',
      drop: 'Estação Metrô Portuguesa-Tietê, São Paulo - SP',
      time: '08:30',
      type: 'Compartilhada' as TripType,
    },
  ];

  const applyPreset = (preset: typeof routePresets[0]) => {
    setOrigin(preset.orig);
    setDestination(preset.dest);
    setPickupAddress(preset.pick);
    setDropoffAddress(preset.drop);
    setTime(preset.time);
    if (preset.type) {
      setTripType(preset.type);
    }
  };

  // Quick Date presets
  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDate(d.toISOString().split('T')[0]);
  };

  // Price Calculation in real-time
  const rawPriceInfo = StorageService.calculatePrice({
    origin,
    destination,
    passengers,
    tripType,
    extraStopsCount: extraStops.length,
    vehicleCategory,
  });

  // Calculate discount
  let finalTotalPrice = rawPriceInfo.totalPrice;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      finalTotalPrice = Math.max(50, rawPriceInfo.totalPrice * (1 - appliedCoupon.discountPercent / 100));
    } else {
      finalTotalPrice = Math.max(50, rawPriceInfo.totalPrice - appliedCoupon.discountAmount);
    }
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'LITORAL10' || clean === 'VERAO10') {
      setAppliedCoupon({
        code: clean,
        discountAmount: rawPriceInfo.totalPrice * 0.1,
        discountPercent: 10,
        description: '10% de desconto aplicado com sucesso!',
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } else if (clean === 'PRIMEIRA' || clean === 'VERAO50') {
      setAppliedCoupon({
        code: clean,
        discountAmount: 50,
        description: 'R$ 50,00 de desconto na primeira viagem!',
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } else {
      setCouponError('Cupom inválido. Use "LITORAL10" ou "VERAO50".');
    }
  };

  const handleAddStop = () => {
    if (!newStopAddress.trim()) return;
    const newStop: ExtraStop = {
      id: `stop-${Date.now()}`,
      address: newStopAddress.trim(),
      city: origin,
      additionalCost: PRICING_RULES.extraStopFixedFee,
    };
    setExtraStops([...extraStops, newStop]);
    setNewStopAddress('');
    setShowStopInput(false);
  };

  const handleRemoveStop = (id: string) => {
    setExtraStops(extraStops.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      alert('Por favor, preencha nome, WhatsApp e e-mail para agendamento.');
      return;
    }

    setIsSubmitting(true);

    try {
      let distanceKm = 195;
      if (destination.includes('Ilhabela') || origin.includes('Ilhabela')) distanceKm = 210;
      if (destination.includes('Caraguatatuba') || origin.includes('Caraguatatuba')) distanceKm = 175;

      const depositAmount = Number((finalTotalPrice * 0.5).toFixed(2));
      const remainingAmount = Number((finalTotalPrice - depositAmount).toFixed(2));

      const newReservationData: Omit<Reservation, 'id' | 'code' | 'createdAt'> = {
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
        origin,
        originDetails: pickupAddress.trim(),
        pickupAddress: pickupAddress.trim(),
        destination,
        destinationDetails: dropoffAddress.trim() || `Centro / Pousada em ${destination}`,
        dropoffAddress: dropoffAddress.trim() || `Endereço em ${destination}`,
        date,
        time,
        passengers,
        tripType,
        vehicleCategory,
        luggageCount,
        hasChildSeat,
        extraStops,
        estimatedDistanceKm: distanceKm,
        basePrice: rawPriceInfo.basePrice,
        totalPrice: finalTotalPrice,
        depositAmount,
        remainingAmount,
        depositPaid: false,
        paymentMethod: selectedDepositMethod,
        status: 'Pendente',
        paymentStatus: 'Pendente (Aguardando Sinal 50%)',
        flightNumber: flightNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const saved = StorageService.addReservation(newReservationData);

      try {
        await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReservationData),
        });
      } catch (apiErr) {
        console.log('Backend sync offline, stored locally.', apiErr);
      }

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0B192C', '#D97706', '#0284C7', '#38BDF8'],
      });

      setConfirmedReservation(saved);
      onBookingSuccess(saved);
    } catch (err) {
      console.error(err);
      alert('Houve um erro ao processar seu agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [copiedReservationCode, setCopiedReservationCode] = useState(false);

  const handleCopyReservationCode = () => {
    if (!confirmedReservation) return;
    navigator.clipboard.writeText(confirmedReservation.code);
    setCopiedReservationCode(true);
    setTimeout(() => setCopiedReservationCode(false), 2500);
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(COMPANY_CONTACT.pixKey);
    setCopiedPixKey(true);
    setTimeout(() => setCopiedPixKey(false), 2500);
  };

  const handleConfirmDepositPayment = () => {
    if (!confirmedReservation) return;
    const updated = StorageService.confirmDepositPayment(confirmedReservation.id, selectedDepositMethod);
    if (updated) {
      setConfirmedReservation({ ...updated });
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10B981', '#059669', '#F59E0B', '#3B82F6'],
      });
    }
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <section id="agendar" className="py-16 sm:py-24 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading & Organized Presentation */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-14">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-amber-400 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>Simulador Online & Reserva Transparente</span>
            </div>

            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Reserve seu transfer
            </h2>

            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Informe sua viagem e veja as opções disponíveis com cálculo transparente e sem surpresas.
            </p>
          </div>

          {/* 4 Pillars Grid - Clean, high contrast & structured */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center text-center sm:text-left gap-2.5 transition-all hover:border-amber-400">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                  Atendimento personalizado
                </strong>
                <span className="text-[11px] text-slate-500 hidden sm:block">Apoio direto em cada etapa</span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center text-center sm:text-left gap-2.5 transition-all hover:border-amber-400">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                  Reserva com confirmação
                </strong>
                <span className="text-[11px] text-slate-500 hidden sm:block">Voucher e garantia de vaga</span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center text-center sm:text-left gap-2.5 transition-all hover:border-amber-400">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                  Veículo climatizado
                </strong>
                <span className="text-[11px] text-slate-500 hidden sm:block">Frota Spin 7 Lugares</span>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center text-center sm:text-left gap-2.5 transition-all hover:border-amber-400">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                  Até 6 passageiros + motorista
                </strong>
                <span className="text-[11px] text-slate-500 hidden sm:block">Espaço amplo com bagageiro</span>
              </div>
            </div>
          </div>

          {/* Rotas Populares - Organized Interactive Cards */}
          <div className="mt-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-serif-display">
                  Rotas Populares:
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Clique na rota para preencher automaticamente os campos do simulador:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {routePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-400 transition-all text-left group flex flex-col justify-between gap-2.5 cursor-pointer shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1.5 w-full">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900 leading-tight">
                      {preset.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                  </div>
                  <span className="text-[11px] text-slate-500 line-clamp-1 block">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Two-Column Booking Engine: Form + Live Price Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: Complete Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6" id="main-booking-form">
              {/* Step 1: Personal Contact */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                  <h3 className="font-serif-display font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-mono">
                      1
                    </span>
                    <span>Dados do Responsável pela Reserva</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Informações protegidas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dra. Mariana Costa"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-sky-600 focus:bg-white rounded-xl text-sm text-slate-900 outline-none transition-all"
                      id="input-customer-name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-sky-600 focus:bg-white rounded-xl text-sm text-slate-900 outline-none transition-all"
                      id="input-customer-phone"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      E-mail para Confirmação *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="mariana@exemplo.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-sky-600 focus:bg-white rounded-xl text-sm text-slate-900 outline-none transition-all"
                      id="input-customer-email"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Route & Trajectory */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                  <h3 className="font-serif-display font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-mono">
                      2
                    </span>
                    <span>Rota & Locais de Embarque / Desembarque</span>
                  </h3>
                  <span className="text-[11px] text-amber-600 font-semibold">
                    Porta a Porta
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Origin */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-900">
                      Origem (Cidade / Região) *
                    </label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-sky-600 focus:bg-white rounded-xl text-sm text-slate-900 outline-none font-medium cursor-pointer"
                      id="select-origin"
                    >
                      <option value="São Paulo">São Paulo (Capital / Aeroportos GRU e CGH)</option>
                      <option value="São Sebastião">São Sebastião (Balsa & Centro Histórico)</option>
                      <option value="Ilhabela (Balsa São Sebastião)">Ilhabela (Balsa São Sebastião)</option>
                      <option value="Caraguatatuba (Rodoviária / Sentido S. Sebastião)">Caraguatatuba (Rodoviária / Sentido S. Sebastião)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Endereço exato de coleta (Ex: GRU Terminal 2 ou Hotel em SP)"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-sky-600 rounded-xl text-xs text-slate-900 outline-none"
                      id="input-pickup-address"
                    />
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-900">
                      Destino Final *
                    </label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-sky-600 focus:bg-white rounded-xl text-sm text-slate-900 outline-none font-medium cursor-pointer"
                      id="select-destination"
                    >
                      <option value="São Sebastião">São Sebastião (Balsa & Centro Histórico)</option>
                      <option value="Ilhabela (Balsa São Sebastião)">Ilhabela (Balsa São Sebastião - Desembarque Porto da Balsa)</option>
                      <option value="Ilhabela (Travessia Fechada)">Ilhabela (Travessia Fechada para a Ilha • a partir de R$ 900)</option>
                      <option value="Caraguatatuba (Rodoviária / Sentido S. Sebastião)">Caraguatatuba (Apenas Rodoviária & Sentido São Sebastião)</option>
                      <option value="São Paulo">São Paulo Capital / Aeroportos</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Endereço de entrega (Ex: Hotel no Centro ou Porto da Balsa)"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-sky-600 rounded-xl text-xs text-slate-900 outline-none"
                      id="input-dropoff-address"
                    />
                  </div>
                </div>

                {/* Scope & Logistics Notice */}
                {destination.includes('Travessia') && (
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-amber-900">Aviso sobre Travessia de Balsa para Ilhabela:</strong>
                      A travessia com carro fechado para o interior da ilha inicia a partir de R$ 900,00 e está sujeita a confirmação prévia e disponibilidade de escala do motorista. Caso prefira o desembarque no Porto da Balsa em São Sebastião, o valor padrão é de R$ 700,00.
                    </div>
                  </div>
                )}

                {destination.includes('Caraguatatuba') && (
                  <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block text-sky-900">Área Atendida em Caraguatatuba:</strong>
                      Atendimento exclusivo na Rodoviária de Caraguatatuba e bairros no sentido São Sebastião (Porto Novo, Praia das Palmeiras e Travessão).
                    </div>
                  </div>
                )}

                {/* Extra Stops Section */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      Paradas Intermediárias / Coletas Adicionais:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStopInput(!showStopInput)}
                      className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showStopInput ? 'Cancelar Parada' : '+ Adicionar Parada (R$ 50/parada)'}</span>
                    </button>
                  </div>

                  {showStopInput && (
                    <div className="flex gap-2 mb-3 animate-in fade-in">
                      <input
                        type="text"
                        placeholder="Endereço da parada intermediária (Ex: Av. Faria Lima para pegar passageiro)"
                        value={newStopAddress}
                        onChange={(e) => setNewStopAddress(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddStop}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Confirmar Parada
                      </button>
                    </div>
                  )}

                  {extraStops.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {extraStops.map((stop) => (
                        <div
                          key={stop.id}
                          className="flex items-center justify-between bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl text-xs text-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>{stop.address}</span>
                            <span className="text-[10px] text-amber-700 font-semibold">
                              (+R$ {stop.additionalCost.toFixed(2)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStop(stop.id)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Date, Time & Mode with Minimalist Monthly Calendar */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 mb-4 gap-2">
                  <h3 className="font-serif-display font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-mono">
                      3
                    </span>
                    <span>Veículo, Modalidade & Horário de Embarque</span>
                  </h3>
                  {/* Quick date shortcuts */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 font-medium hidden sm:inline">Atalhos:</span>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                    >
                      Amanhã
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(3)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                    >
                      Em 3 dias
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
                    >
                      Em 1 semana
                    </button>
                  </div>
                </div>

                {/* Vehicle Choice & Trip Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {/* Vehicle Model Selector */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                      <Car className="w-3.5 h-3.5 text-amber-500" />
                      Tipo de Veículo:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVehicleCategory('spin_7');
                          if (passengers > 6) setPassengers(6);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                          vehicleCategory === 'spin_7'
                            ? 'bg-slate-900 text-white border-amber-400 shadow-sm ring-1 ring-amber-400'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[11px] font-bold">🚐 Spin 7 Lugares</span>
                        <span className="text-[9px] opacity-80">Até 6 passageiros + malas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVehicleCategory('sedan_4');
                          if (passengers > 4) setPassengers(4);
                          if (luggageCount > 4) setLuggageCount(4);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                          vehicleCategory === 'sedan_4'
                            ? 'bg-slate-900 text-white border-amber-400 shadow-sm ring-1 ring-amber-400'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[11px] font-bold">🚗 Carro 4 Lugares</span>
                        <span className="text-[9px] opacity-80">Sedã executivo (até 4 pass.)</span>
                      </button>
                    </div>
                  </div>

                  {/* Trip Mode Selector */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-sky-500" />
                      Modalidade:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTripType('Individual')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                          tripType === 'Individual'
                            ? 'bg-slate-900 text-white border-amber-400 shadow-sm ring-1 ring-amber-400'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[11px] font-bold">✨ Privativo</span>
                        <span className="text-[9px] opacity-80">Veículo 100% exclusivo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTripType('Compartilhada')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                          tripType === 'Compartilhada'
                            ? 'bg-slate-900 text-white border-amber-400 shadow-sm ring-1 ring-amber-400'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[11px] font-bold">👥 Compartilhado</span>
                        <span className="text-[9px] opacity-80">Por vaga / assento</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Minimalist & Elegant Monthly Booking Calendar with Available Hours */}
                <MonthlyBookingCalendar
                  selectedDate={date}
                  selectedTime={time}
                  origin={origin}
                  destination={destination}
                  tripType={tripType}
                  onDateChange={setDate}
                  onTimeChange={setTime}
                />
              </div>

              {/* Step 4: Passenger & Seat Map Visualizer */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                  <h3 className="font-serif-display font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-mono">
                      4
                    </span>
                    <span>
                      Ocupação & Mapa de Assentos ({vehicleCategory === 'sedan_4' ? 'Carro 4 Lugares' : 'Chevrolet Spin 7L'})
                    </span>
                  </h3>
                  <span className="text-[11px] text-sky-700 font-semibold">
                    {passengers} de {vehicleCategory === 'sedan_4' ? 4 : 6} Assentos Ocupados
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Sliders & Inputs (7 cols) */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Passengers */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-900">
                          Nº de Passageiros ({passengers} {passengers === 1 ? 'pessoa' : 'pessoas'})
                        </label>
                        <span className="text-[10px] text-slate-500">
                          Capacidade máx: {vehicleCategory === 'sedan_4' ? '4 passageiros' : '6 passageiros + motorista'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max={vehicleCategory === 'sedan_4' ? 4 : 6}
                          value={passengers}
                          onChange={(e) => setPassengers(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                        />
                        <span className="font-bold text-sm bg-slate-900 text-white w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0">
                          {passengers}
                        </span>
                      </div>
                    </div>

                    {/* Luggage */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-900">
                          Malas / Volumes de Bagagem ({luggageCount} malas)
                        </label>
                        <span className="text-[10px] text-slate-500">
                          {vehicleCategory === 'sedan_4' ? 'Porta-malas sedã (até 4 malas)' : 'Porta-malas espaçoso (até 6 malas)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max={vehicleCategory === 'sedan_4' ? 4 : 6}
                          value={luggageCount}
                          onChange={(e) => setLuggageCount(Number(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                        />
                        <span className="font-bold text-sm bg-sky-700 text-white w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0">
                          {luggageCount}
                        </span>
                      </div>
                    </div>

                    {/* Flight & Child seat */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">
                          Nº do Voo (Opcional)
                        </label>
                        <div className="relative">
                          <Plane className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Ex: LA 3450 / AF 456"
                            value={flightNumber}
                            onChange={(e) => setFlightNumber(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-600"
                          />
                        </div>
                      </div>

                      <div className="flex items-end">
                        <label className="w-full flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={hasChildSeat}
                            onChange={(e) => setHasChildSeat(e.target.checked)}
                            className="w-4 h-4 text-sky-600 rounded accent-sky-600"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <Baby className="w-3.5 h-3.5 text-sky-600" />
                              Cadeirinha Infantil
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                              Cortesia Gratuita
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Seat Chart (5 cols) */}
                  <div className="md:col-span-5 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
                    <div className="text-center mb-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Layout da Cabine • {vehicleCategory === 'sedan_4' ? 'Carro 4 Lugares' : 'Spin 7L'}
                      </span>
                      <span className="text-[9px] text-slate-400">Frente / Para-brisa</span>
                    </div>

                    <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      {/* Row 1: Driver + Front Passenger */}
                      <div className="flex justify-center gap-4">
                        <div className="w-12 h-9 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-[9px] text-slate-400">
                          <span>🚗</span>
                          <span className="font-semibold">Motorista</span>
                        </div>
                        <div
                          className={`w-12 h-9 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold transition-all ${
                            passengers >= 1
                              ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-300'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          <span>👤</span>
                          <span>{passengers >= 1 ? 'Passageiro' : 'Livre'}</span>
                        </div>
                      </div>

                      {/* Row 2: Rear Seats */}
                      <div className="flex justify-center gap-2">
                        {[2, 3, 4].map((seatNum) => {
                          const isOccupied = passengers >= seatNum;
                          const isBabySeat = hasChildSeat && seatNum === 2;
                          return (
                            <div
                              key={seatNum}
                              className={`w-11 h-9 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold transition-all ${
                                isBabySeat
                                  ? 'bg-sky-500 text-white shadow-xs'
                                  : isOccupied
                                  ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-300'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}
                            >
                              <span>{isBabySeat ? '👶' : '👤'}</span>
                              <span>{isBabySeat ? 'Bebê' : isOccupied ? `Assento ${seatNum}` : 'Livre'}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 3: 3rd Row only if Spin 7 */}
                      {vehicleCategory === 'spin_7' && (
                        <div className="flex justify-center gap-4">
                          {[5, 6].map((seatNum) => {
                            const isOccupied = passengers >= seatNum;
                            return (
                              <div
                                key={seatNum}
                                className={`w-12 h-9 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold transition-all ${
                                  isOccupied
                                    ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-300'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                              >
                                <span>👤</span>
                                <span>{isOccupied ? `Assento ${seatNum}` : 'Livre'}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Trunk Luggage Indicator */}
                      <div className="text-center pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-sky-400" />
                        <span>Porta-malas: {luggageCount} volumes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Observações Especiais / Pranchas de Surf / Pets
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Informe se trará pranchas de surf com capa de proteção, pets em caixa de transporte ou paradas específicas."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-sky-600 focus:bg-white rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Step 5: Condições de Pagamento & Sinal de 50% */}
              <div className="bg-amber-500/5 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <h3 className="font-serif-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs flex items-center justify-center font-mono font-bold">
                      5
                    </span>
                    <span>Condições de Pagamento: Sinal de 50% Obrigatório</span>
                  </h3>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    50% Sinal + 50% Embarque
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-amber-200 text-xs space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 leading-relaxed text-xs">
                      Para garantir a <strong>minivan Chevrolet Spin 7 Lugares</strong> e a dedicação exclusiva do motorista na sua data e horário, 
                      <strong> é exigido o pagamento de 50% do valor como sinal de confirmação</strong>. Os 50% restantes são pagos diretamente ao motorista no embarque.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-300">
                      <span className="text-[10px] text-amber-900 uppercase font-extrabold block">
                        1ª Parcela • Sinal (50%)
                      </span>
                      <span className="text-base font-extrabold text-slate-950 block my-0.5">
                        R$ {(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold block">
                        Garante o agendamento
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-600 uppercase font-bold block">
                        2ª Parcela • Saldo (50%)
                      </span>
                      <span className="text-base font-extrabold text-slate-950 block my-0.5">
                        R$ {(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        No embarque com motorista
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deposit payment method choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Escolha a forma de pagamento do Sinal de 50%:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDepositMethod('PIX')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedDepositMethod === 'PIX'
                          ? 'bg-amber-400/20 border-amber-500 text-slate-950 ring-2 ring-amber-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          PIX
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 block font-bold">PIX Instantâneo</strong>
                          <span className="text-[10px] text-slate-500">Chave PIX / Liberação Imediata</span>
                        </div>
                      </div>
                      {selectedDepositMethod === 'PIX' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDepositMethod('Cartão')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedDepositMethod === 'Cartão'
                          ? 'bg-amber-400/20 border-amber-500 text-slate-950 ring-2 ring-amber-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-xs text-slate-900 block font-bold">Cartão de Crédito</strong>
                          <span className="text-[10px] text-slate-500">Link Seguro de Pagamento</span>
                        </div>
                      </div>
                      {selectedDepositMethod === 'Cartão' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="btn-submit-reservation"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 hover:text-white font-extrabold text-base sm:text-lg py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 border-2 border-amber-400 cursor-pointer transform active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-amber-400" />
                  <span>
                    {isSubmitting ? 'PROCESSANDO AGENDAMENTO ONLINE...' : 'CONFIRMAR AGENDAMENTO ONLINE & GERAR VOUCHER'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Price Card, Coupon & Guarantees */}
          <div className="lg:col-span-4 space-y-6">
            {/* Realtime Quote Ticket */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border-2 border-amber-400 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-400" />
                  <span className="font-serif-display font-bold text-sm tracking-wider text-white">
                    RESUMO DO TRANSFER
                  </span>
                </div>
                <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                  {tripType}
                </span>
              </div>

              {/* Route snippet */}
              <div className="space-y-2 text-xs mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Origem</span>
                    <strong className="text-white text-xs">{origin}</strong>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-slate-700 ml-1" />

                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Destino</span>
                    <strong className="text-white text-xs">{destination}</strong>
                  </div>
                </div>
              </div>

              {/* Specs Breakdown */}
              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-2 text-xs mb-4">
                <div className="flex justify-between text-slate-300">
                  <span>Veículo:</span>
                  <span className="text-white font-medium">Chevrolet Spin 7 Lugares</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Data & Hora:</span>
                  <span className="text-white font-medium">{date} às {time}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Passageiros:</span>
                  <span className="text-white font-medium">{passengers} pessoa(s)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Bagagens:</span>
                  <span className="text-white font-medium">{luggageCount} volume(s)</span>
                </div>
                {extraStops.length > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Paradas extras ({extraStops.length}):</span>
                    <span className="text-amber-400 font-medium">+ R$ {rawPriceInfo.stopsCost.toFixed(2)}</span>
                  </div>
                )}
                {hasChildSeat && (
                  <div className="flex justify-between text-emerald-400 text-[11px]">
                    <span>Cadeirinha Infantil:</span>
                    <span>Inclusa (Grátis)</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-amber-300 text-[11px] font-bold border-t border-slate-700 pt-1.5">
                    <span>Desconto ({appliedCoupon.code}):</span>
                    <span>- R$ {(rawPriceInfo.totalPrice - finalTotalPrice).toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
              </div>

              {/* Promo code engine inside summary */}
              <div className="mb-4 pt-2 border-t border-slate-800">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cupom (Ex: LITORAL10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
                {appliedCoupon && (
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    ✓ {appliedCoupon.description}
                  </span>
                )}
                {couponError && (
                  <span className="text-[10px] text-red-400 mt-1 block">
                    {couponError}
                  </span>
                )}
              </div>

              {/* Total Price Display & 50% Deposit Breakdown */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="text-center">
                  <span className="text-[11px] uppercase tracking-widest text-slate-400 block">
                    Valor Total da Corrida
                  </span>
                  <div className="font-serif-display font-extrabold text-3xl sm:text-4xl text-amber-400 mt-0.5">
                    R$ {finalTotalPrice.toFixed(2).replace('.', ',')}
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    {tripType === 'Individual'
                      ? 'Tarifa fechada para a minivan Chevrolet Spin inteira'
                      : `Tarifa compartilhada (R$ ${(finalTotalPrice / passengers).toFixed(2).replace('.', ',')} por pessoa)`}
                  </p>
                </div>

                {/* 50% Deposit Notice Box */}
                <div className="bg-slate-800/90 rounded-2xl p-3 border border-amber-400/40 text-xs space-y-2">
                  <div className="flex justify-between items-center text-amber-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Sinal de Confirmação (50%):
                    </span>
                    <span className="text-sm text-amber-400 font-extrabold">
                      R$ {(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 text-[11px]">
                    <span>Saldo Restante no Embarque (50%):</span>
                    <span className="font-medium text-slate-200">
                      R$ {(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-200/90 pt-1.5 border-t border-slate-700/60 leading-tight">
                    🔒 Pagamento de 50% exigido para bloqueio do veículo Spin e garantia da data.
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  PIX / Cartão de Crédito
                </span>
                <span>•</span>
                <span>Sem taxa de cancelamento</span>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-serif-display font-bold text-sm text-slate-900">
                Garantias Litoral em Movimento
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Agendamento 100% online com confirmação instantânea no sistema</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Regra transparente de 50% de sinal para reserva garantida</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Minivan Chevrolet Spin climatizada com ar duplo e Wi-Fi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Monitoramento de voo em GRU e CGH sem custo adicional</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal / Digital Voucher */}
      {confirmedReservation && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Close Button */}
            <button
              onClick={() => setConfirmedReservation(null)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800 border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Header */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-2.5 shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Agendamento Registrado Online!
              </span>
              <h3 className="font-serif-display font-extrabold text-2xl text-white mt-1">
                Voucher #{confirmedReservation.code}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Sua reserva está cadastrada no sistema. Efetue o pagamento do sinal de 50% para confirmação definitiva.
              </p>
            </div>

            {/* Details Box / Digital Voucher */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Passageiro:</span>
                <span className="font-bold text-white">{confirmedReservation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contato:</span>
                <span className="font-bold text-white">{confirmedReservation.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rota:</span>
                <span className="font-bold text-white text-right">
                  {confirmedReservation.origin} ➔ {confirmedReservation.destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Embarque:</span>
                <span className="text-slate-200 text-right truncate max-w-[220px]" title={confirmedReservation.pickupAddress}>
                  {confirmedReservation.pickupAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data & Hora:</span>
                <span className="font-bold text-amber-400">
                  {confirmedReservation.date} às {confirmedReservation.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Modalidade:</span>
                <span className="font-bold text-white">
                  {confirmedReservation.tripType} • {confirmedReservation.passengers} passageiro(s) • {confirmedReservation.luggageCount} volume(s)
                </span>
              </div>

              {/* Financial Breakdown: Total, 50% Deposit, 50% Remaining */}
              <div className="pt-2 border-t border-slate-700 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Valor Total da Viagem:</span>
                  <span className="font-bold text-white">
                    R$ {confirmedReservation.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between bg-amber-400/10 p-2 rounded-xl border border-amber-400/30 items-center">
                  <div>
                    <span className="text-amber-300 font-bold block">Sinal de Confirmação (50%):</span>
                    <span className="text-[10px] text-slate-300">Necessário para confirmar reserva</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-400 text-sm block">
                      R$ {confirmedReservation.depositAmount.toFixed(2).replace('.', ',')}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block ${
                      confirmedReservation.depositPaid
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {confirmedReservation.depositPaid ? '✓ SINAL PAGO' : 'AGUARDANDO SINAL'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px] px-1">
                  <span>Saldo Restante no Embarque (50%):</span>
                  <span className="font-medium text-slate-200">
                    R$ {confirmedReservation.remainingAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* PIX Instant Payment Box if Deposit is Pending */}
            {!confirmedReservation.depositPaid ? (
              <div className="bg-slate-950 border border-amber-400/60 rounded-2xl p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      PIX
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Pagar Sinal de 50% via PIX</h4>
                      <span className="text-[10px] text-slate-400">Confirmação e bloqueio imediato do veículo</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-400">
                    R$ {confirmedReservation.depositAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chave PIX (Celular):</span>
                    <span className="font-mono font-bold text-amber-300">{COMPANY_CONTACT.pixKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Favorecido:</span>
                    <span className="text-slate-200">{COMPANY_CONTACT.pixBeneficiary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Instituição:</span>
                    <span className="text-slate-200">{COMPANY_CONTACT.pixBank}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPixKey}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedPixKey ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmDepositPayment}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar Pagamento (50%)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="text-xs">
                  <strong className="text-emerald-300 font-bold block">Sinal de 50% Confirmado!</strong>
                  <span className="text-slate-300 text-[11px]">
                    Veículo Chevrolet Spin e motorista garantidos. Saldo de R$ {confirmedReservation.remainingAmount.toFixed(2).replace('.', ',')} a pagar no embarque.
                  </span>
                </div>
              </div>
            )}

            {/* Direct In-App Actions */}
            <div className="space-y-2.5">
              {onOpenTrackModal && (
                <button
                  type="button"
                  onClick={() => {
                    const code = confirmedReservation.code;
                    setConfirmedReservation(null);
                    onOpenTrackModal(code);
                  }}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Acompanhar Status da Corrida em Tempo Real</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyReservationCode}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copiedReservationCode ? 'Código Copiado!' : 'Copiar Código'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Imprimir Voucher</span>
                </button>
              </div>

              <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-800">
                <span>Agendamento 100% online. Central de Atendimento & Dúvidas: </span>
                <strong className="text-slate-200">{COMPANY_CONTACT.phone}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
