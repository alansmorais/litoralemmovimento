import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Reservation } from '../types';
import {
  Search,
  X,
  MapPin,
  Clock,
  Car,
  Phone,
  MessageCircle,
  CheckCircle2,
  Navigation,
  AlertCircle,
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react';

interface TrackRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const TrackRideModal: React.FC<TrackRideModalProps> = ({ isOpen, onClose, initialCode }) => {
  const [query, setQuery] = useState(initialCode || '');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Reservation | null>(null);

  React.useEffect(() => {
    if (isOpen && initialCode) {
      setQuery(initialCode);
      performSearch(initialCode);
    }
  }, [isOpen, initialCode]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const performSearch = (searchVal: string) => {
    if (!searchVal.trim()) return;
    const list = StorageService.getReservations();
    const cleanQuery = searchVal.trim().toUpperCase();
    const cleanPhone = searchVal.replace(/\D/g, '');

    const found = list.find((r) => {
      const matchCode =
        r.code.toUpperCase() === cleanQuery ||
        r.code.replace('LM-', '') === cleanQuery ||
        r.code.toUpperCase().includes(cleanQuery);
      const matchPhone = cleanPhone && r.customerPhone.replace(/\D/g, '').includes(cleanPhone);
      return matchCode || matchPhone;
    });

    setResult(found || null);
    setSearched(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Get timeline step index (0 to 4)
  const getStepIndex = (status?: string) => {
    switch (status) {
      case 'Pendente':
        return 0;
      case 'Confirmado':
        return 1;
      case 'A caminho':
        return 2;
      case 'Em andamento':
        return 3;
      case 'Concluído':
        return 4;
      default:
        return 1;
    }
  };

  const steps = [
    { title: 'Reserva Registrada', desc: 'Central processando' },
    { title: 'Motorista Escalado', desc: 'Chevrolet Spin pronta' },
    { title: 'Embarque Realizado', desc: 'Passageiros a bordo' },
    { title: 'Na Rodovia / Serra', desc: 'Deslocamento seguro' },
    { title: 'Desembarque', desc: 'Chegada ao destino' },
  ];

  const currentStep = getStepIndex(result?.status);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white text-slate-900 border-2 border-amber-400 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto mb-2.5 border border-slate-700 shadow-md">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display font-bold text-2xl text-slate-900">
            Rastrear Minha Viagem
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Acompanhe o status do seu transfer, motorista escalado e estimativa de trajeto em tempo real.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Digite o código da reserva (ex: LM-1234) ou seu WhatsApp"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-xl text-sm text-slate-900 outline-none transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Buscar</span>
          </button>
        </form>

        {/* Search Results */}
        {searched && (
          <div>
            {!result ? (
              <div className="bg-slate-50 p-6 rounded-2xl text-center text-xs text-slate-600 border border-slate-200 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold text-slate-900">Nenhuma reserva encontrada</p>
                <p className="text-[11px] text-slate-500">
                  Verifique o código digitado ou clique em um dos botões de teste acima.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-5">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Código da Reserva
                    </span>
                    <strong className="font-serif-display text-xl text-slate-950 font-extrabold">
                      {result.code}
                    </strong>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      result.status === 'Confirmado'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : result.status === 'A caminho' || result.status === 'Em andamento'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : result.status === 'Concluído'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>

                {/* 5-Step Live Timeline Stepper */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                    Etapas do Trajeto
                  </span>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {steps.map((st, sIdx) => {
                      const isCompleted = sIdx < currentStep;
                      const isCurrent = sIdx === currentStep;
                      return (
                        <div key={sIdx} className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isCurrent
                                ? 'bg-slate-900 text-amber-400 ring-2 ring-amber-400 scale-110'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isCompleted ? '✓' : sIdx + 1}
                          </div>
                          <span className="text-[10px] font-bold text-slate-900 leading-tight block">
                            {st.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Route & Passenger Details */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Passageiro Principal:</span>
                    <strong className="text-slate-950 font-bold">{result.customerName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Trajeto:</span>
                    <strong className="text-slate-950 font-bold">
                      {result.origin} ➔ {result.destination}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Embarque:</span>
                    <span className="text-slate-800 font-medium text-right max-w-[60%]">
                      {result.pickupAddress || result.originDetails}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Destino:</span>
                    <span className="text-slate-800 font-medium text-right max-w-[60%]">
                      {result.dropoffAddress || result.destinationDetails}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Data & Horário:</span>
                    <strong className="text-slate-950 font-bold">
                      {result.date} às {result.time}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Passageiros & Modalidade:</span>
                    <strong className="text-slate-950">
                      {result.passengers} pessoa(s) • {result.tripType}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2 text-xs">
                    <span>Valor Total:</span>
                    <strong className="text-slate-950 font-bold">
                      R$ {result.totalPrice.toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs">
                    <div>
                      <span className="text-amber-900 font-bold block">Sinal de Confirmação (50%):</span>
                      <span className="text-[10px] text-slate-500">Exigido para bloqueio do veículo</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-amber-900 font-extrabold block">
                        R$ {(result.depositAmount ?? result.totalPrice * 0.5).toFixed(2).replace('.', ',')}
                      </strong>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block ${
                        result.depositPaid || result.paymentStatus?.includes('Pago')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {result.depositPaid || result.paymentStatus?.includes('Pago') ? '✓ SINAL PAGO' : 'AGUARDANDO SINAL'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 px-1">
                    <span>Saldo Restante no Embarque (50%):</span>
                    <span className="font-semibold text-slate-700">
                      R$ {(result.remainingAmount ?? result.totalPrice * 0.5).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Driver & Vehicle Box */}
                {result.assignedDriverName ? (
                  <div className="bg-slate-900 text-white p-4 rounded-xl border-2 border-amber-400 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        Motorista & Minivan Escalada
                      </span>
                      <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono">
                        {result.driverPlate || 'SP-LIT7A24'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white text-sm block">{result.assignedDriverName}</strong>
                        <span className="text-[11px] text-slate-300">
                          {result.driverVehicle || 'Chevrolet Spin Premier 7L'} • Ar Duplo Digital
                        </span>
                      </div>

                      {result.driverPhone && (
                        <a
                          href={`https://wa.me/55${result.driverPhone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(result.assignedDriverName)},%20sou%20o%20passageiro%20da%20reserva%20${result.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <MessageCircle className="w-4 h-4 fill-current" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Motorista sendo designado pela central operacional. Você receberá uma notificação no WhatsApp assim que a Spin for escalada.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
