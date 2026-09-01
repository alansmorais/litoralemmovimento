import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, KeyRound, AlertTriangle, UserCheck, Database, X } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface SuperAdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuperAdminAuthModal: React.FC<SuperAdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Try background syncing config from Google Sheets if available
      StorageService.syncConfigFromGoogleSheets().catch(() => {});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const customPass = StorageService.getSuperAdminPassword();

    try {
      // 1. Try Backend Authentication
      const res = await fetch('/api/auth/superadmin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, customPassword: customPass }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem('litoral_superadmin_token', data.token);
        }
        sessionStorage.setItem('litoral_superadmin_auth', 'true');
        setIsLoading(false);
        setPassword('');
        onSuccess();
        return;
      }
    } catch {
      // Offline / standalone fallback
    }

    // 2. Local Fallback Verification
    const isValid = StorageService.verifySuperAdminPassword(password);
    if (isValid) {
      sessionStorage.setItem('litoral_superadmin_auth', 'true');
      setIsLoading(false);
      setPassword('');
      onSuccess();
    } else {
      setIsLoading(false);
      setError('Senha de Super Admin incorreta. Acesso restrito a Alan Morais.');
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
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              <UserCheck className="w-3 h-3 text-amber-400" />
              <span>Restrito: Super Admin Alan Morais</span>
            </div>
            <h3 className="font-serif-display font-extrabold text-2xl text-white">
              Conexão & Banco de Dados em Nuvem
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Insira a senha de segurança do Super Administrador <strong>Alan Morais</strong> para gerenciar conexões técnicas e sincronização do sistema.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Senha Master Super Admin:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a senha master"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-400" />
                <span>Armazenamento Central em Nuvem:</span>
              </span>
              <span className="text-amber-400 font-mono text-[10px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Segurança • Ativa
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Acesso exclusivo para gerenciamento de banco de dados, motoristas e integrações do sistema.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Desbloquear API'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
