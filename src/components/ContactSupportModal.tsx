import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { ContactMessage } from '../types';
import confetti from 'canvas-confetti';
import {
  MessageSquare,
  X,
  Send,
  User,
  Phone,
  Mail,
  HelpCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Headphones,
} from 'lucide-react';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
  initialSubject = 'Dúvidas sobre Horários & Rotas',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [preferredContact, setPreferredContact] = useState<'WhatsApp' | 'E-mail' | 'Telefone'>('WhatsApp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<ContactMessage | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleResetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      alert('Por favor, preencha nome, telefone e sua mensagem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = StorageService.createContactMessage({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        preferredContact,
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      setSubmittedMessage(created);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedMessage(null);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-white leading-tight">
                Central de Atendimento & Suporte
              </h3>
              <p className="text-xs text-slate-400">
                Envie sua dúvida diretamente para nossa equipe de gestão
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7">
          {submittedMessage ? (
            /* Success View */
            <div className="text-center py-4 space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Mensagem Registrada com Sucesso
                </span>
                <h4 className="font-serif-display font-extrabold text-2xl text-slate-900 mt-2">
                  Recebemos sua mensagem!
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1.5 leading-relaxed">
                  Sua solicitação foi enviada diretamente ao nosso <strong>Painel Administrativo</strong>. Nossa equipe responderá via <strong>{submittedMessage.preferredContact}</strong>.
                </p>
              </div>

              {/* Protocol Badge */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left max-w-sm mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Protocolo de Atendimento:</span>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {submittedMessage.ticketCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Responsável:</span>
                  <span className="font-semibold text-slate-900">{submittedMessage.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Assunto:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[180px]">{submittedMessage.subject}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer shadow-sm text-sm"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <form onSubmit={handleSubmit} className="space-y-4" id="support-modal-form">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Preencha os campos abaixo. Sua dúvida entrará instantaneamente na fila de atendimento do nosso painel com notificação para a gestão.
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mariana Costa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Subject Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Assunto Principal
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all font-medium cursor-pointer"
                >
                  <option value="Dúvidas sobre Horários & Rotas">Dúvidas sobre Horários & Rotas</option>
                  <option value="Cotação para Grupo / Evento (Spin 7L)">Cotação para Grupo / Evento (Spin 7 Lugares)</option>
                  <option value="Bagagens Extras, Pranchas ou Pets">Bagagens Extras, Pranchas ou Pets</option>
                  <option value="Trajeto Personalizado / Paradas Extras">Trajeto Personalizado / Paradas Extras</option>
                  <option value="Nota Fiscal / Faturamento Corporativo">Nota Fiscal / Faturamento Corporativo</option>
                  <option value="Outro Assunto">Outro Assunto</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Como podemos ajudar você? *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Escreva detalhes da sua viagem, data pretendida, dúvidas sobre bagagem ou solicitações especiais..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-900 outline-none transition-all resize-none"
                />
              </div>

              {/* Preferred Contact method */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Como você prefere receber o retorno?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['WhatsApp', 'E-mail', 'Telefone'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPreferredContact(method)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        preferredContact === method
                          ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 text-xs sm:text-sm"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>{isSubmitting ? 'Enviando ao Painel...' : 'ENVIAR MENSAGEM PARA A CENTRAL'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Dados protegidos
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Retorno rápido
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
