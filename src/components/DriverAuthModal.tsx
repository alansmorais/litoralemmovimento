import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, KeyRound, AlertTriangle, UserCheck, X, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { DRIVERS } from '../data/mockData';
import { Driver } from '../types';

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
  const [drivers, setDrivers] = useState<Driver[]>(DRIVERS);
  const [selectedDriverId, setSelectedDriverId] = useState(DRIVERS[0]?.id || 'drv-01');
  const [usernameInput, setUsernameInput] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States for Password Change (First Access Flow)
  const [step, setStep] = useState<'login' | 'change_password' | 'success'>('login');
  const [authenticatedDriver, setAuthenticatedDriver] = useState<Driver | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const allDrivers = StorageService.getDrivers();
      setDrivers(allDrivers);
      const activeId = StorageService.getLoggedDriverId();
      if (activeId && allDrivers.some((d) => d.id === activeId)) {
        setSelectedDriverId(activeId);
        const activeDrv = allDrivers.find((d) => d.id === activeId);
        if (activeDrv?.username) setUsernameInput(activeDrv.username);
      } else if (allDrivers.length > 0) {
        setSelectedDriverId(allDrivers[0].id);
        if (allDrivers[0].username) setUsernameInput(allDrivers[0].username);
      }
      setPin('');
      setNewPin('');
      setConfirmPin('');
      setError(null);
      setStep('login');
      setAuthenticatedDriver(null);
    }
  }, [isOpen]);

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

  const currentSelectedDriver = drivers.find((d) => d.id === selectedDriverId);

  const handleDriverSelect = (drv: Driver) => {
    setSelectedDriverId(drv.id);
    if (drv.username) setUsernameInput(drv.username);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const sanitizedPin = pin.trim();
    const cleanUser = usernameInput.trim().toLowerCase();

    // 1. Check if Super User login (Alan Morais)
    const isSuperUserAttempt = cleanUser === 'alan' || cleanUser === 'superadmin' || cleanUser === 'admin';
    if (isSuperUserAttempt && (sanitizedPin === 'alan2026' || sanitizedPin === 'superadmin')) {
      StorageService.setSuperUserTesting(true);
      StorageService.setLoggedDriverId(selectedDriverId || 'drv-01');
      setIsLoading(false);
      onSuccess();
      return;
    }

    // Identify target driver
    const targetDriver =
      drivers.find(
        (d) =>
          (cleanUser && d.username?.toLowerCase() === cleanUser) ||
          d.id === selectedDriverId ||
          (cleanUser && d.name.toLowerCase().includes(cleanUser))
      ) || currentSelectedDriver;

    try {
      // 1. Try backend authentication
      const res = await fetch('/api/auth/driver-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: targetDriver?.id || selectedDriverId,
          username: cleanUser || targetDriver?.username,
          pin: sanitizedPin,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.isSuperUser) {
          StorageService.setSuperUserTesting(true);
          StorageService.setLoggedDriverId(data.driverId || selectedDriverId || 'drv-01');
          setIsLoading(false);
          onSuccess();
          return;
        }

        const loggedDriver = drivers.find((d) => d.id === data.driverId) || targetDriver;
        if (loggedDriver) {
          StorageService.setSuperUserTesting(false);
          setAuthenticatedDriver(loggedDriver);

          if (data.mustChangePassword || loggedDriver.mustChangePassword) {
            setIsLoading(false);
            setStep('change_password');
            return;
          }

          StorageService.setLoggedDriverId(loggedDriver.id);
          setIsLoading(false);
          onSuccess();
          return;
        }
      } else {
        const errData = await res.json().catch(() => null);
        if (errData && errData.message) {
          setIsLoading(false);
          setError(errData.message);
          return;
        }
      }
    } catch {
      // Backend offline, fallback to local storage
    }

    // 2. Local Fallback Verification
    if (!targetDriver) {
      setIsLoading(false);
      setError('Motorista não identificado. Digite seu usuário (ex: eduardo, edivam, karine) ou selecione um perfil.');
      return;
    }

    const expectedPin = targetDriver.pin || '1234';
    const isPinCorrect = sanitizedPin === expectedPin || (targetDriver.mustChangePassword && sanitizedPin === '1234');

    if (isPinCorrect) {
      StorageService.setSuperUserTesting(false);
      setAuthenticatedDriver(targetDriver);

      if (targetDriver.mustChangePassword) {
        setIsLoading(false);
        setStep('change_password');
        return;
      }

      StorageService.setLoggedDriverId(targetDriver.id);
      setIsLoading(false);
      onSuccess();
    } else {
      setIsLoading(false);
      setError(`Senha ou PIN incorreto para o motorista @${targetDriver.username || targetDriver.name}.`);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPin.trim() || newPin.trim().length < 4) {
      setError('O novo PIN deve ter pelo menos 4 dígitos ou caracteres.');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setError('A confirmação do PIN não coincide com o novo PIN digitado.');
      return;
    }

    if (!authenticatedDriver) {
      setError('Sessão expirada. Faça login novamente.');
      setStep('login');
      return;
    }

    setIsLoading(true);

    try {
      // Update locally and sync to Google Sheets
      const res = await StorageService.updateDriverPassword(authenticatedDriver.id, newPin.trim());

      if (res.success) {
        StorageService.setLoggedDriverId(authenticatedDriver.id);
        setSuccessMessage('Novo PIN pessoal salvo com sucesso e atualizado na planilha!');
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setError(res.message || 'Erro ao atualizar o PIN. Tente novamente.');
      }
    } catch {
      setError('Erro ao salvar o novo PIN. Tente novamente.');
    } finally {
      setIsLoading(false);
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

        {/* STEP 1: LOGIN */}
        {step === 'login' && (
          <>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border-2 border-sky-400 text-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/10">
                <Smartphone className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase bg-sky-400/10 px-2.5 py-0.5 rounded-full">
                Portal de Acesso da Frota
              </span>
              <h3 className="font-serif-display font-extrabold text-2xl text-white">
                Login do Motorista
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada motorista entra com seu login e senha individual. O Super User também pode acessar para testes.
              </p>
            </div>

            {/* Super User Quick Test Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">👑</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-300 truncate">Super User (Acesso de Teste)</p>
                  <p className="text-[10px] text-amber-200/80">Permite testar a visão e escala de qualquer motorista</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUsernameInput('alan');
                  setPin('alan2026');
                  setError(null);
                }}
                className="text-[11px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Preencher Teste
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username Input with quick selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-300">
                    Usuário ou Login:
                  </label>
                  <span className="text-[10px] text-slate-400">Clique no seu nome abaixo ou digite</span>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {drivers.map((d) => {
                    const isSelected =
                      d.id === selectedDriverId ||
                      (usernameInput && d.username?.toLowerCase() === usernameInput.toLowerCase());
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDriverSelect(d)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-xs'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        <span>{d.name.split(' ')[0]}</span>
                        <span className="text-[10px] opacity-75">@{d.username}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput('alan');
                      setPin('alan2026');
                      setError(null);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      usernameInput.toLowerCase() === 'alan'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                        : 'bg-amber-950/40 text-amber-300 border-amber-700/60 hover:bg-amber-900/50'
                    }`}
                  >
                    <span>👑 @alan</span>
                    <span className="text-[10px] opacity-80">(Super User)</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Usuário (ex: eduardo, edivam, karine, alan)"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setError(null);
                    }}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 font-medium"
                  />
                </div>
              </div>

              {/* Password / PIN Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-300">
                    Senha ou PIN:
                  </label>
                  {currentSelectedDriver?.mustChangePassword && usernameInput !== 'alan' && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Padrão Inicial: 1234
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={20}
                    placeholder={usernameInput === 'alan' ? 'Senha do Super User (alan2026)' : 'Senha pessoal ou PIN operacional'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError(null);
                    }}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 tracking-wider font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                  disabled={isLoading || !pin.trim()}
                  className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Verificando...' : 'Acessar Painel de Viagens'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 text-center cursor-pointer"
                >
                  Voltar ao Site
                </button>
              </div>
            </form>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>PIN Inicial Padrão: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">1234</code></span>
              <button
                type="button"
                onClick={() => {
                  if (currentSelectedDriver) {
                    setAuthenticatedDriver(currentSelectedDriver);
                    setStep('change_password');
                  }
                }}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                Trocar meu PIN
              </button>
            </div>
          </>
        )}

        {/* STEP 2: MANDATORY FIRST ACCESS PIN CHANGE */}
        {step === 'change_password' && authenticatedDriver && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                Segurança • Primeiro Acesso
              </span>
              <h3 className="font-serif-display font-extrabold text-2xl text-white">
                Defina seu Novo PIN Pessoal
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Olá, <strong className="text-white">{authenticatedDriver.name}</strong> (@{authenticatedDriver.username})!
                Por segurança da frota, substitua o PIN provisório por um novo PIN pessoal exclusivo.
              </p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Novo PIN Pessoal (4 a 6 dígitos):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={8}
                    placeholder="Digite o novo PIN (ex: 5821)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    autoFocus
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 tracking-widest font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Confirme o Novo PIN:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={8}
                    placeholder="Repita o novo PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 tracking-widest font-mono"
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
                  disabled={isLoading || !newPin.trim() || !confirmPin.trim()}
                  className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Salvando e Sincronizando...' : 'Salvar Novo PIN e Iniciar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif-display font-extrabold text-2xl text-white">
              PIN Atualizado com Sucesso!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              {successMessage || 'Seu acesso seguro foi configurado e a planilha Google foi atualizada.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

