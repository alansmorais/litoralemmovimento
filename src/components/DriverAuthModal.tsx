import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, KeyRound, AlertTriangle, UserCheck, X } from 'lucide-react';
import { DRIVERS } from '../data/mockData';

interface DriverAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DriverAuthModal: React.FC<DriverAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState(DRIVERS[0]?.id || 'drv-01');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validPins = ['1234', '2026', 'spin7l', 'carlos', 'marcos'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sanitized = pin.trim().toLowerCase();
    if (validPins.includes(sanitized) || sanitized.length >= 4) {
      sessionStorage.setItem('litoral_driver_auth', selectedDriverId);
      onSuccess();
    } else {
      setError('PIN de motorista incorreto. Padrão operacional: 1234');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border-2 border-sky-400 text-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/10">
            <Smartphone className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase bg-sky-400/10 px-2.5 py-0.5 rounded-full">
            Área Exclusiva da Frota
          </span>
          <h3 className="font-serif-display font-extrabold text-2xl text-white">
            Login do Motorista
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Acesso reservado aos motoristas oficiais da minivan Spin 7L para atualização de GPS e status de viagens.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Selecione o Motorista:
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-sky-400"
            >
              {DRIVERS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.vehicleModel.split('•')[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              PIN do Motorista (4 dígitos):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                maxLength={6}
                placeholder="PIN operacional (ex: 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 tracking-widest"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Acessar Painel de Viagens</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 text-center"
            >
              Voltar ao Site
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800 pt-3 text-center">
          <p className="text-[11px] text-slate-500">
            PIN Padrão de Demonstração: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">1234</code>
          </p>
        </div>
      </div>
    </div>
  );
};
