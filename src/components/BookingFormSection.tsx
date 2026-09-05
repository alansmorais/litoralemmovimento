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
  // 3-Step Wizard State
  const [step, setStep] = useState<1 | 2 | 3>(1);

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
  const [heavyLuggageCount, setHeavyLuggageCount] = useState(0);
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

  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDate(d.toISOString().split('T')[0]);
  };

  // Price Calculation in real-time
  const privatePriceInfo = StorageService.calculatePrice({
    origin,
    destination,
    passengers,
    tripType: 'Individual',
    extraStopsCount: extraStops.length,
    vehicleCategory,
    heavyLuggageCount,
  });

  const sharedPriceInfo = StorageService.calculatePrice({
    origin,
    destination,
    passengers,
    tripType: 'Compartilhada',
    extraStopsCount: extraStops.length,
    vehicleCategory,
    heavyLuggageCount,
  });

  const rawPriceInfo = StorageService.calculatePrice({
    origin,
    destination,
    passengers,
    tripType,
    extraStopsCount: extraStops.length,
    vehicleCategory,
    heavyLuggageCount,
  });

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
        heavyLuggageCount,
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
  const [copiedOSText, setCopiedOSText] = useState(false);
  const [showOSModal, setShowOSModal] = useState(false);

  const generateOSText = (res: Reservation) => {
    const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const trackingLink = `${originUrl}/?rastreio=${res.code}`;
    const vehicleText = res.vehicleCategory === 'sedan_4' ? 'Sedã Executivo (Até 4 pass.)' : 'Chevrolet Spin 7 Lugares';
    const statusText = res.depositPaid ? 'Sinal 50% Confirmado ✓' : 'Aguardando Pagamento do Sinal (50%)';

    return `📋 *ORDEM DE SERVIÇO - LITORAL EM MOVIMENTO*
*OS Nº:* #${res.code}
*Status:* ${statusText}

👤 *DADOS DO PASSAGEIRO(A):*
• Nome: ${res.customerName}
• WhatsApp: ${res.customerPhone}
• E-mail: ${res.customerEmail}

🚗 *DADOS DO TRANSFER & ROTA:*
• Data da Viagem: ${res.date}
• Horário Previsto: ${res.time}
• Modalidade: ${res.tripType} (${vehicleText})
• Origem: ${res.origin}
  ↳ Local de Embarque: ${res.pickupAddress}
• Destino: ${res.destination}
  ↳ Local de Desembarque: ${res.dropoffAddress || 'Endereço fornecido na reserva'}
• Passageiros: ${res.passengers}
• Malas / Bagagens: ${res.luggageCount} volume(s)${res.heavyLuggageCount && res.heavyLuggageCount > 0 ? ` (Inclui ${res.heavyLuggageCount} mala(s) pesada(s) > 23kg)` : ''}

💰 *DEMONSTRATIVO FINANCEIRO:*
• Valor Total da Viagem: R$ ${res.totalPrice.toFixed(2).replace('.', ',')}
• Sinal de Confirmação (50%): R$ ${res.depositAmount.toFixed(2).replace('.', ',')} [${res.depositPaid ? 'QUITADO ✓' : 'PENDENTE'}]
• Saldo Restante no Embarque (50%): R$ ${res.remainingAmount.toFixed(2).replace('.', ',')}

🔑 *DADOS PIX PARA PAGAMENTO DO SINAL:*
• Chave PIX (Celular): ${COMPANY_CONTACT.pixKey}
• Favorecido: ${COMPANY_CONTACT.pixBeneficiary}
• Banco: ${COMPANY_CONTACT.pixBank}

🌐 *Acompanhar Corrida em Tempo Real:*
${trackingLink}

📞 Central de Atendimento & Suporte: ${COMPANY_CONTACT.phone}`;
  };

  const handleSendOSWhatsApp = (res: Reservation) => {
    const text = generateOSText(res);
    const cleanPhone = COMPANY_CONTACT.phone.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendOSEmail = (res: Reservation) => {
    const text = generateOSText(res);
    const subject = `[Litoral em Movimento] Ordem de Serviço #${res.code} - ${res.customerName}`;
    const mailto = `mailto:${res.customerEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailto;
  };

  const handleCopyOSText = (res: Reservation) => {
    const text = generateOSText(res);
    navigator.clipboard.writeText(text);
    setCopiedOSText(true);
    setTimeout(() => setCopiedOSText(false), 2500);
  };

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

  const isAirportRoute = origin.toLowerCase().includes('aeroporto') || pickupAddress.toLowerCase().includes('aeroporto') || pickupAddress.toLowerCase().includes('gru') || pickupAddress.toLowerCase().includes('congonhas');

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2 py-2 sm:py-4">
      {/* Rotas Populares Quick Presets */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100 text-xs font-bold text-slate-800">
          <Compass className="w-4 h-4 text-amber-500" />
          <span>Sugestões Rápidas de Rotas Populares:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {routePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                applyPreset(preset);
                setStep(1);
              }}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-400 transition-all text-left group flex flex-col justify-between gap-1.5 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                  {preset.title}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 flex-shrink-0" />
              </div>
              <span className="text-[10px] text-slate-500 truncate">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3-STEP PROGRESS INDICATOR */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs sm:text-sm font-semibold">
        <div className={`flex items-center gap-2 ${step === 1 ? 'text-amber-600 font-extrabold' : step > 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-amber-500 text-slate-950 font-black' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            {step > 1 ? '✓' : '1'}
          </span>
          <span>1. Rota & Horário</span>
        </div>

        <div className="h-0.5 flex-1 bg-slate-200 mx-3 hidden sm:block" />

        <div className={`flex items-center gap-2 ${step === 2 ? 'text-amber-600 font-extrabold' : step > 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-amber-500 text-slate-950 font-black' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            {step > 2 ? '✓' : '2'}
          </span>
          <span>2. Transfer Disponível</span>
        </div>

        <div className="h-0.5 flex-1 bg-slate-200 mx-3 hidden sm:block" />

        <div className={`flex items-center gap-2 ${step === 3 ? 'text-amber-600 font-extrabold' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'}`}>
            3
          </span>
          <span>3. Confirmação & Pagamento</span>
        </div>
      </div>

      {/* Two-Column Main Layout: Form Steps (Left) + Sticky Live Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        
        {/* LEFT: Step Content */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          
          {/* STEP 1: ROUTE & TIME */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-serif-display font-extrabold text-lg text-slate-900">
                  Etapa 1: Onde você está indo e quando?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecione os locais, data e horário do seu transfer.
                </p>
              </div>

              {/* Origin & Destination */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900">
                    FROM / Origem (Coleta) *
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-sm text-slate-900 outline-none font-medium cursor-pointer"
                  >
                    <option value="São Paulo">São Paulo (Capital / Aeroportos GRU e CGH)</option>
                    <option value="São Sebastião">São Sebastião (Balsa & Centro Histórico)</option>
                    <option value="Ilhabela (Balsa São Sebastião)">Ilhabela (Balsa São Sebastião)</option>
                    <option value="Caraguatatuba (Rodoviária / Sentido S. Sebastião)">Caraguatatuba (Rodoviária / Sentido S. Sebastião)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Endereço exato de coleta (Ex: GRU Terminal 2 ou Av. Paulista, 1000)"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none mt-1.5"
                  />
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-md">
                    ↓
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900">
                    TO / Destino Final *
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-sm text-slate-900 outline-none font-medium cursor-pointer"
                  >
                    <option value="São Sebastião">São Sebastião (Balsa & Centro Histórico)</option>
                    <option value="Ilhabela (Balsa São Sebastião)">Ilhabela (Balsa São Sebastião - Porto da Balsa)</option>
                    <option value="Ilhabela (Travessia Fechada)">Ilhabela (Travessia Fechada para a Ilha • a partir de R$ 900)</option>
                    <option value="Caraguatatuba (Rodoviária / Sentido S. Sebastião)">Caraguatatuba (Rodoviária & Sentido S. Sebastião)</option>
                    <option value="São Paulo">São Paulo Capital / Aeroportos</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Endereço de destino (Ex: Hotel, Pousada ou Residência)"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none mt-1.5"
                  />
                </div>
              </div>

              {/* Date & Time with Calendar */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900">
                    Data & Horário de Embarque *
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg cursor-pointer"
                    >
                      Amanhã
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(3)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg cursor-pointer"
                    >
                      Em 3 dias
                    </button>
                  </div>
                </div>

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

              {/* Passengers & Luggage Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      Passageiros:
                    </label>
                    <span className="font-extrabold text-sm text-slate-900 bg-amber-400 px-2 py-0.5 rounded-lg">
                      {passengers} pessoa(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-9 h-9 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-100 cursor-pointer flex items-center justify-center shadow-2xs"
                    >
                      −
                    </button>
                    <span className="text-xs text-slate-500 font-medium">Máx: 6 passageiros</span>
                    <button
                      type="button"
                      onClick={() => setPassengers(Math.min(6, passengers + 1))}
                      className="w-9 h-9 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-100 cursor-pointer flex items-center justify-center shadow-2xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                      Bagagens / Malas:
                    </label>
                    <span className="font-extrabold text-sm text-white bg-sky-700 px-2 py-0.5 rounded-lg">
                      {luggageCount} volume(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                      className="w-9 h-9 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-100 cursor-pointer flex items-center justify-center shadow-2xs"
                    >
                      −
                    </button>
                    <span className="text-xs text-slate-500 font-medium">Porta-malas espaçoso</span>
                    <button
                      type="button"
                      onClick={() => setLuggageCount(Math.min(6, luggageCount + 1))}
                      className="w-9 h-9 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-100 cursor-pointer flex items-center justify-center shadow-2xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Continue CTA */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-4 px-6 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border-2 border-amber-400"
                >
                  <span>Continuar para Escolha do Veículo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AVAILABLE TRANSFER */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-serif-display font-extrabold text-lg text-slate-900">
                    Etapa 2: Veículo & Transfer Disponível
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecione a modalidade ideal para sua viagem.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-bold underline cursor-pointer"
                >
                  ← Voltar
                </button>
              </div>

              {/* Transfer Options */}
              <div className="space-y-4">
                {/* Option 1: Chevrolet Spin 7 Lugares (Privativo) */}
                <div
                  onClick={() => {
                    setVehicleCategory('spin_7');
                    setTripType('Individual');
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
                    vehicleCategory === 'spin_7' && tripType === 'Individual'
                      ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                        RECOMENDADO • PRIVATIVO
                      </span>
                      <h4 className="font-serif-display font-extrabold text-lg text-slate-900 mt-1">
                        Chevrolet Spin Premier (7 Lugares)
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Total do Transfer</span>
                      <span className="text-xl font-extrabold text-amber-600">
                        R$ {privatePriceInfo.totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">
                    Veículo 100% exclusivo para seu grupo. Ar-condicionado dual zone, bagageiro amplo e motorista profissional.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 py-2 border-t border-b border-slate-100 mb-3">
                    <div>👥 Até {Math.max(passengers, 6)} passageiros</div>
                    <div>🧳 Até {Math.max(luggageCount, 6)} malas</div>
                    <div>⏱️ Duração: ~1h 35min</div>
                    <div>🛡️ Seguro inclusão</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Porta a porta garantido
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVehicleCategory('spin_7');
                        setTripType('Individual');
                        setStep(3);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Selecionar Privativo →
                    </button>
                  </div>
                </div>

                {/* Option 2: Chevrolet Spin (Compartilhado por Vaga) */}
                <div
                  onClick={() => {
                    setVehicleCategory('spin_7');
                    setTripType('Compartilhada');
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
                    vehicleCategory === 'spin_7' && tripType === 'Compartilhada'
                      ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                        ECONÔMICO • POR ASSENTO
                      </span>
                      <h4 className="font-serif-display font-extrabold text-lg text-slate-900 mt-1">
                        Transfer Compartilhado (Por Vaga)
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Por Passageiro</span>
                      <span className="text-xl font-extrabold text-sky-700">
                        R$ {(sharedPriceInfo.basePrice / Math.max(1, passengers)).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">
                    Compartilhe o veículo com outros passageiros na mesma rota. Ideal para quem viaja sozinho ou em duplas.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 py-2 border-t border-b border-slate-100 mb-3">
                    <div>👥 Vaga garantida</div>
                    <div>🧳 1 mala inclusa</div>
                    <div>⏱️ Horário programado</div>
                    <div>🛡️ Motorista experiente</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Melhor custo-benefício
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVehicleCategory('spin_7');
                        setTripType('Compartilhada');
                        setStep(3);
                      }}
                      className="bg-sky-700 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Selecionar Compartilhado →
                    </button>
                  </div>
                </div>
              </div>

              {/* Proceed to Step 3 */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-4 px-6 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border-2 border-amber-400"
                >
                  <span>Avançar para Confirmação & Pagamento</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM & PAY */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-serif-display font-extrabold text-lg text-slate-900">
                    Etapa 3: Dados do Passageiro & Pagamento PIX (50% Sinal)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preencha apenas o necessário para emitir sua Ordem de Serviço.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-bold underline cursor-pointer"
                >
                  ← Voltar
                </button>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dados de Contato do Passageiro
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silveira"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-sm text-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-sm text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">
                        E-mail (para Ordem de Serviço) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="seu.email@dominio.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-sm text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Airport Flight Number (Only shown if airport route) */}
                  {isAirportRoute && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-900 mb-1">
                        Número do Voo (Monitoreo de Aterrizagem) *
                      </label>
                      <div className="relative">
                        <Plane className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: LA 3450 / G3 1240"
                          value={flightNumber}
                          onChange={(e) => setFlightNumber(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Permite ao motorista acompanhar possíveis atrasos de voo sem custo extra.
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Observações Especiais / Cadeirinha (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Preciso de cadeirinha infantil, pranchas de surf, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Financial & PIX Deposit Breakdown */}
              <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Pagamento do Sinal de 50% via PIX
                  </span>
                  <span className="text-xs font-extrabold text-amber-900 bg-amber-300 px-2.5 py-0.5 rounded-full">
                    PIX INSTANTÂNEO
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Valor Total do Transfer:</span>
                    <strong className="text-slate-900 text-sm">
                      R$ {finalTotalPrice.toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <div className="flex justify-between bg-amber-400/20 p-2.5 rounded-xl border border-amber-400/50">
                    <div>
                      <strong className="text-amber-950 block">Sinal Obrigatório (50%):</strong>
                      <span className="text-[10px] text-slate-600">Garante bloqueio da minivan Spin</span>
                    </div>
                    <span className="text-base font-black text-amber-700">
                      R$ {(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Saldo Restante (50% no embarque):</span>
                    <span>R$ {(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chave PIX (Celular):</span>
                    <strong className="text-amber-300 font-mono">{COMPANY_CONTACT.pixKey}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Favorecido:</span>
                    <span className="text-slate-200">{COMPANY_CONTACT.pixBeneficiary}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-4 px-6 rounded-2xl text-base shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-400"
                >
                  <Send className="w-5 h-5 text-amber-400" />
                  <span>
                    {isSubmitting ? 'GERANDO VOUCHER & ORDEM DE SERVIÇO...' : `Pagar 50% (R$ ${(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}) com PIX`}
                  </span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* RIGHT: Sticky Live Booking Summary Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border-2 border-amber-400 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="font-serif-display font-extrabold text-sm tracking-wider text-amber-400 flex items-center gap-2">
                <Car className="w-4 h-4" />
                RESUMO EM TEMPO REAL
              </span>
              <span className="text-[10px] bg-sky-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                {tripType}
              </span>
            </div>

            {/* Route */}
            <div className="space-y-2 text-xs mb-4">
              <div className="flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Origem</span>
                  <strong className="text-white text-xs">{origin}</strong>
                </div>
              </div>
              <div className="w-0.5 h-4 bg-slate-700 ml-1.2" />
              <div className="flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Destino</span>
                  <strong className="text-white text-xs">{destination}</strong>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700 space-y-2 text-xs mb-4">
              <div className="flex justify-between text-slate-300">
                <span>Data & Horário:</span>
                <span className="text-amber-400 font-bold">{date} às {time}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Passageiros:</span>
                <span className="text-white font-medium">{passengers} pessoa(s)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Bagagens:</span>
                <span className="text-white font-medium">{luggageCount} volume(s)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Veículo:</span>
                <span className="text-white font-medium">Chevrolet Spin 7L</span>
              </div>
            </div>

            {/* Coupon Engine */}
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
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
              {appliedCoupon && (
                <span className="text-[10px] text-emerald-400 mt-1 block">✓ {appliedCoupon.description}</span>
              )}
            </div>

            {/* Price & Deposit Summary */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 block">
                  Total da Viagem
                </span>
                <div className="font-serif-display font-extrabold text-3xl text-amber-400 mt-0.5">
                  R$ {finalTotalPrice.toFixed(2).replace('.', ',')}
                </div>
              </div>

              <div className="bg-slate-800/90 rounded-2xl p-3 border border-amber-400/40 text-xs space-y-1.5">
                <div className="flex justify-between text-amber-300 font-bold">
                  <span>Sinal de 50% (para confirmar):</span>
                  <span className="text-amber-400 text-sm">
                    R$ {(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Saldo no embarque (50%):</span>
                  <span>R$ {(finalTotalPrice * 0.5).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {confirmedReservation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-2">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h3 className="font-serif-display font-extrabold text-2xl text-white">
                Reserva Realizada com Sucesso!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Ordem de Serviço gerada. Efetue o pagamento do sinal de 50% via PIX para garantir o veículo.
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl text-xs space-y-2 border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Código da Reserva:</span>
                <strong className="font-mono text-amber-400">#{confirmedReservation.code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Passageiro:</span>
                <span className="font-bold text-white">{confirmedReservation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rota:</span>
                <span className="font-bold text-white">{confirmedReservation.origin} ➔ {confirmedReservation.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sinal PIX (50%):</span>
                <strong className="text-amber-400 text-sm">R$ {confirmedReservation.depositAmount.toFixed(2).replace('.', ',')}</strong>
              </div>
            </div>

            {/* PIX Payment Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/50 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>Chave PIX (Celular):</span>
                <span className="font-mono">{COMPANY_CONTACT.pixKey}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyPixKey}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{copiedPixKey ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmDepositPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Simular Pagamento Confirmado (50%)</span>
              </button>
            </div>

            {/* OS Dispatch */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSendOSWhatsApp(confirmedReservation)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp OS</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendOSEmail(confirmedReservation)}
                className="bg-sky-700 hover:bg-sky-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>E-mail OS</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setConfirmedReservation(null)}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3 rounded-xl text-xs cursor-pointer text-center"
            >
              Fechar & Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
