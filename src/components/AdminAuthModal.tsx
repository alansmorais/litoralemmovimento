import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, KeyRound, CheckCircle, X } from 'lucide-react';
import { BRAND_IMAGES } from '../data/mockData';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const validFallbackPasswords = [
    'litoral2026',
    '12988506597',
    'admin',
    'admin2026',
    'spin7l',
    'eduardo',
    'eduardo2026',
    'edivam',
    'edivam2026',
    'edivan',
    'karine',
    'karine2026',
    'michelly',
    'michelly2026',
    'alan2026',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const sanitized = password.trim().toLowerCase();

    try {
      // 1. Try Backend Authentication
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: sanitized }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem('litoral_admin_token', data.token);
        }
        if (data.adminName) {
          sessionStorage.setItem('litoral_admin_name', data.adminName);
        }
        sessionStorage.setItem('litoral_admin_auth', 'true');
        sessionStorage.setItem('litoral_admin_auth_time', new Date().toISOString());
        setIsLoading(false);
        setPassword('');
        onSuccess();
        return;
      }
    } catch {
      // Offline / standalone fallback
    }

    // 2. Local Fallback Verification
    if (validFallbackPasswords.includes(sanitized)) {
      sessionStorage.setItem('litoral_admin_auth', 'true');
      sessionStorage.setItem('litoral_admin_auth_time', new Date().toISOString());
      setIsLoading(false);
      setPassword('');
      onSuccess();
    } else {
      setIsLoading(false);
      setError('Senha de administrador incorreta. Tente novamente.');
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

        {/* Header Icon & Brand */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-400/10">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full">
              Área Restrita da Gerência
            </span>
            <h3 className="font-serif-display font-extrabold text-2xl text-white">
              Acesso Administrativo
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Painel protegido para controle financeiro, gestão de motoristas, dados de clientes e integrações.
            </p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Digite a Senha ou PIN Master:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              disabled={isLoading || !password.trim()}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Validando Acesso...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Desbloquear Painel Admin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors text-center"
            >
              Voltar ao Site Público
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800 pt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Acesso autorizado para a equipe de gestão e administradores cadastrados.
          </p>
        </div>
      </div>
    </div>
  );
};
