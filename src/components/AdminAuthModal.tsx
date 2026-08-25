import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, KeyRound, CheckCircle } from 'lucide-react';
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

  if (!isOpen) return null;

  const validPasswords = [
    'litoral2026',
    '12988506597',
    'admin',
    'spin7l',
    'michelly2026',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const sanitized = password.trim().toLowerCase();
      if (validPasswords.includes(sanitized)) {
        // Save session flag in sessionStorage
        sessionStorage.setItem('litoral_admin_auth', 'true');
        sessionStorage.setItem('litoral_admin_auth_time', new Date().toISOString());
        setIsLoading(false);
        setPassword('');
        onSuccess();
      } else {
        setIsLoading(false);
        setError('Senha de administrador incorreta. Tente novamente.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          ✕
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
                placeholder="Senha de acesso (ex: litoral2026)"
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
          <p className="text-[11px] text-slate-500">
            Dica rápida da gerência: Use <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">litoral2026</code> ou WhatsApp da Michelly.
          </p>
        </div>
      </div>
    </div>
  );
};
