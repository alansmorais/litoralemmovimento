import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertTriangle, KeyRound, CheckCircle, X, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { ADMIN_ACCOUNTS } from '../data/mockData';
import { AdminAccount } from '../types';

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
  const [admins, setAdmins] = useState<AdminAccount[]>(ADMIN_ACCOUNTS);
  const [selectedUsername, setSelectedUsername] = useState('alan');
  const [usernameInput, setUsernameInput] = useState('alan');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States for Password Change (First Access Flow)
  const [step, setStep] = useState<'login' | 'change_password' | 'success'>('login');
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState<AdminAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedAdmins = StorageService.getAdmins();
      setAdmins(storedAdmins);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setStep('login');
      setAuthenticatedAdmin(null);
      setSelectedUsername('alan');
      setUsernameInput('alan');
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

  const validFallbackPasswords = [
    'litoral2026',
    '12988506597',
    'admin',
    'admin2026',
    'spin7l',
    'alan2026',
    'eduardo2026',
    'edivam2026',
    'karine2026',
    'michelly2026',
  ];

  const handleSelectAdmin = (adm: AdminAccount) => {
    setSelectedUsername(adm.username);
    setUsernameInput(adm.username);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanUser = usernameInput.trim().toLowerCase();
    const sanitizedPass = password.trim();

    const targetAdmin =
      admins.find((a) => a.username.toLowerCase() === cleanUser || a.id.toLowerCase() === cleanUser) ||
      admins.find((a) => a.username === selectedUsername);

    if (targetAdmin && targetAdmin.status === 'Inativo') {
      setIsLoading(false);
      setError(`Acesso bloqueado: O usuário @${targetAdmin.username} está desativado e não tem permissão para usar o sistema.`);
      return;
    }

    try {
      // 1. Try Backend Authentication
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          password: sanitizedPass,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const userObj: AdminAccount = data.admin || targetAdmin || {
          id: 'adm-01',
          username: cleanUser,
          name: data.adminName || cleanUser,
          role: 'Administrador',
          password: sanitizedPass,
          email: data.email || targetAdmin?.email || '',
          status: data.status || 'Ativo',
          mustChangePassword: data.mustChangePassword === true,
        };

        if (userObj.status === 'Inativo') {
          setIsLoading(false);
          setError(`Acesso bloqueado: O usuário @${userObj.username} está configurado como 'Não pode usar o sistema'.`);
          return;
        }

        if (data.token) {
          sessionStorage.setItem('litoral_admin_token', data.token);
        }
        sessionStorage.setItem('litoral_admin_name', userObj.name);
        sessionStorage.setItem('litoral_admin_auth', 'true');
        sessionStorage.setItem('litoral_admin_auth_time', new Date().toISOString());

        setAuthenticatedAdmin(userObj);

        if (userObj.mustChangePassword) {
          setIsLoading(false);
          setStep('change_password');
          return;
        }

        setIsLoading(false);
        setPassword('');
        onSuccess();
        return;
      } else {
        const errData = await res.json().catch(() => null);
        if (errData && errData.message && (res.status === 403 || errData.message.includes('bloqueado') || errData.message.includes('não pode usar'))) {
          setIsLoading(false);
          setError(errData.message);
          return;
        }
      }
    } catch {
      // Offline / standalone fallback
    }

    // 2. Local Fallback Verification
    const isTargetPasswordCorrect = targetAdmin && targetAdmin.password === sanitizedPass;
    const isFallbackPasswordCorrect = validFallbackPasswords.includes(sanitizedPass.toLowerCase());

    if (isTargetPasswordCorrect || isFallbackPasswordCorrect) {
      const userObj = targetAdmin || {
        id: 'adm-fallback',
        username: cleanUser || 'admin',
        name: targetAdmin?.name || 'Administrador Litoral',
        role: 'Administrador',
        password: sanitizedPass,
        mustChangePassword: targetAdmin?.mustChangePassword || false,
      };

      sessionStorage.setItem('litoral_admin_name', userObj.name);
      sessionStorage.setItem('litoral_admin_auth', 'true');
      sessionStorage.setItem('litoral_admin_auth_time', new Date().toISOString());

      setAuthenticatedAdmin(userObj);

      if (userObj.mustChangePassword) {
        setIsLoading(false);
        setStep('change_password');
        return;
      }

      setIsLoading(false);
      setPassword('');
      onSuccess();
    } else {
      setIsLoading(false);
      setError('Senha ou usuário de administrador incorreto. Verifique e tente novamente.');
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setError('A nova senha deve conter no mínimo 4 caracteres.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    if (!authenticatedAdmin) {
      setError('Sessão expirada. Faça login novamente.');
      setStep('login');
      return;
    }

    setIsLoading(true);

    try {
      const res = await StorageService.updateAdminPassword(authenticatedAdmin.id, newPassword.trim());

      if (res.success) {
        setSuccessMessage('Senha atualizada com sucesso e sincronizada com a planilha Google!');
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setError(res.message || 'Erro ao atualizar a senha. Tente novamente.');
      }
    } catch {
      setError('Erro ao salvar a nova senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentAdmin = admins.find((a) => a.username.toLowerCase() === usernameInput.trim().toLowerCase());

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

        {/* STEP 1: LOGIN */}
        {step === 'login' && (
          <>
            {/* Header Icon & Brand */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-400/10">
                <Lock className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                Área Restrita da Gerência
              </span>
              <h3 className="font-serif-display font-extrabold text-2xl text-white">
                Acesso Administrativo
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acesso com usuário curto e senha configurados na aba <strong>Usuarios_Admin</strong> do Google Sheets.
              </p>
            </div>

            {/* Quick User Selector Chips */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Usuários Cadastrados:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {admins.map((adm) => {
                  const isSelected = adm.username.toLowerCase() === usernameInput.trim().toLowerCase();
                  const isInactive = adm.status === 'Inativo';
                  return (
                    <button
                      key={adm.id}
                      type="button"
                      onClick={() => {
                        handleSelectAdmin(adm);
                        if (isInactive) {
                          setError(`O usuário @${adm.username} está bloqueado no sistema e não tem permissão de acesso.`);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? isInactive
                            ? 'bg-red-500 text-white font-bold border-red-500 shadow-sm'
                            : 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm'
                          : isInactive
                            ? 'bg-slate-950/70 border-red-900/50 text-red-400 hover:border-red-700 opacity-80'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{adm.username}</span>
                      {isInactive ? (
                        <span className="text-[10px] text-red-400 font-bold">• Bloqueado</span>
                      ) : (
                        adm.mustChangePassword && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Usuário Curto:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="ex: alan, eduardo, edivam, karine..."
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-300">
                    Senha de Acesso:
                  </label>
                  {currentAdmin?.mustChangePassword && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> 1º Acesso (Padrão: litoral2026)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
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
                      <span>Entrar no Painel Admin</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors text-center cursor-pointer"
                >
                  Voltar ao Site Público
                </button>
              </div>
            </form>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Super Admin: <code className="text-amber-300">alan / alan2026</code></span>
              <button
                type="button"
                onClick={() => {
                  if (currentAdmin) {
                    setAuthenticatedAdmin(currentAdmin);
                    setStep('change_password');
                  }
                }}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Trocar Senha
              </button>
            </div>
          </>
        )}

        {/* STEP 2: MANDATORY FIRST ACCESS ADMIN PASSWORD CHANGE */}
        {step === 'change_password' && authenticatedAdmin && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                Segurança • Primeiro Acesso
              </span>
              <h3 className="font-serif-display font-extrabold text-2xl text-white">
                Crie sua Nova Senha Pessoal
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Olá, <strong className="text-white">{authenticatedAdmin.name}</strong> (@{authenticatedAdmin.username})!
                Por política de segurança, altere sua senha temporária para uma nova senha pessoal definitiva.
              </p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Nova Senha Pessoal (mínimo 4 caracteres):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha pessoal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Confirme a Nova Senha:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 tracking-wide"
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
                  disabled={isLoading || !newPassword.trim() || !confirmPassword.trim()}
                  className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Salvando na Planilha...' : 'Salvar Nova Senha e Entrar'}</span>
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
              Senha Atualizada!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              {successMessage || 'Sua nova senha foi salva e sincronizada com a aba Usuarios_Admin da planilha Google.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

