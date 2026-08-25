import React from 'react';
import { BRAND_IMAGES, COMPANY_CONTACT } from '../data/mockData';
import { ShieldCheck, Wind, Clock, MapPin, Phone, Mail, Instagram, MessageCircle, Heart, User } from 'lucide-react';

interface FooterProps {
  onScrollToBooking: () => void;
  onOpenAdmin: () => void;
  onOpenDriver: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollToBooking,
  onOpenAdmin,
  onOpenDriver,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-200 border-t-2 border-amber-400 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* TRUST BADGES ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-amber-400 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-serif-display font-bold text-base text-white">SEGURANÇA</h4>
              <p className="text-xs text-slate-400">Motoristas credenciados e seguro de passageiros</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-amber-400 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Wind className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-serif-display font-bold text-base text-white">CONFORTO</h4>
              <p className="text-xs text-slate-400">Chevrolet Spin 7L climatizada e espaçosa</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-amber-400 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-serif-display font-bold text-base text-white">PONTUALIDADE</h4>
              <p className="text-xs text-slate-400">Monitoramento de trânsito em tempo real</p>
            </div>
          </div>
        </div>

        {/* Route Reminder */}
        <div className="text-center py-4 border-y border-slate-800">
          <span className="font-serif-display text-sm sm:text-base font-bold tracking-widest text-slate-300 block uppercase">
            São Paulo ⇌ São Sebastião · Ilhabela · Caraguatatuba
          </span>
        </div>

        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-900">
                <img
                  src={BRAND_IMAGES.logo}
                  alt="Litoral em Movimento"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif-display font-extrabold text-lg text-white block">
                  LITORAL
                </span>
                <span className="font-serif-display font-bold text-xs text-amber-400 tracking-widest -mt-1 block">
                  EM MOVIMENTO
                </span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Transporte executivo e viagens programadas entre São Paulo e as mais belas praias do Litoral Norte Paulista.
            </p>
          </div>

          {/* Col 2: Destinations */}
          <div className="space-y-2">
            <h5 className="font-serif-display font-bold text-sm text-white uppercase tracking-wider">
              Destinos
            </h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>São Sebastião (Maresias, Juquehy, Cambury)</li>
              <li>Ilhabela (Vila, Praia do Curral, Balsa)</li>
              <li>Caraguatatuba (Martim de Sá, Cocanha)</li>
              <li>Aeroporto de Guarulhos (GRU) & Congonhas (CGH)</li>
            </ul>
          </div>

          {/* Col 3: Contacts */}
          <div className="space-y-2">
            <h5 className="font-serif-display font-bold text-sm text-white uppercase tracking-wider">
              Atendimento & Reservas
            </h5>
            <div className="space-y-1.5 text-slate-400">
              <a
                href={COMPANY_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200">
                  <strong>{COMPANY_CONTACT.name}:</strong> {COMPANY_CONTACT.phone} (WhatsApp)
                </span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>{COMPANY_CONTACT.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>São Paulo ⇌ Litoral Norte (SP)</span>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Portals */}
          <div className="space-y-2">
            <h5 className="font-serif-display font-bold text-sm text-white uppercase tracking-wider">
              Acesso Operacional
            </h5>
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenAdmin}
                className="bg-slate-900 hover:bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white p-2.5 rounded-xl text-left border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                🔐 Painel de Controle Admin
              </button>
              <button
                onClick={onOpenDriver}
                className="bg-slate-900 hover:bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white p-2.5 rounded-xl text-left border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                📱 Aplicativo do Motorista (Carlos & Marcos)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400">
          <span>© {new Date().getFullYear()} Litoral em Movimento. Todos os direitos reservados.</span>
          <span>Frota Oficial: Chevrolet Spin 7 Lugares • Cadastur Regularizado</span>
        </div>
      </div>
    </footer>
  );
};
