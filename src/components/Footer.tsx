import React from 'react';
import { BRAND_IMAGES, COMPANY_CONTACT } from '../data/mockData';
import { ShieldCheck, Wind, Clock, MapPin, Phone, Mail, Lock, Smartphone } from 'lucide-react';

interface FooterProps {
  onScrollToBooking: () => void;
  onOpenAdmin: () => void;
  onOpenDriver: () => void;
  onOpenContactModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollToBooking,
  onOpenAdmin,
  onOpenDriver,
  onOpenContactModal,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs sm:text-sm">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400 bg-slate-900 flex-shrink-0">
                <img
                  src={BRAND_IMAGES.logo}
                  alt="Litoral em Movimento"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('raw.githubusercontent.com')) {
                      target.src = 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/logo.jpg';
                    }
                  }}
                />
              </div>
              <div>
                <span className="font-serif-display font-bold text-lg text-white block">
                  LITORAL
                </span>
                <span className="font-serif-display font-semibold text-xs text-amber-400 tracking-widest block -mt-1">
                  EM MOVIMENTO
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Transporte executivo e transfers confortáveis entre São Paulo e as principais praias do Litoral Norte Paulista.
            </p>
          </div>

          {/* Col 2: Destinations */}
          <div className="space-y-2.5">
            <h5 className="font-serif-display font-bold text-sm text-white uppercase tracking-wider">
              Destinos Atendidos
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>São Sebastião (Balsa & Centro Histórico)</li>
              <li>Ilhabela (Vila, Praia do Curral, Balsa)</li>
              <li>Caraguatatuba (Martim de Sá, Cocanha)</li>
              <li>Aeroportos de Guarulhos (GRU) e Congonhas (CGH)</li>
            </ul>
          </div>

          {/* Col 3: Contacts */}
          <div className="space-y-2.5">
            <h5 className="font-serif-display font-bold text-sm text-white uppercase tracking-wider">
              Atendimento & Central
            </h5>
            <div className="space-y-2 text-xs text-slate-400">
              {onOpenContactModal ? (
                <button
                  onClick={onOpenContactModal}
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer text-left"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Enviar Mensagem para a Central</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-200">
                    <strong>{COMPANY_CONTACT.name}:</strong> {COMPANY_CONTACT.phone}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span>{COMPANY_CONTACT.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>São Paulo ⇌ Litoral Norte (SP)</span>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Portals */}
          <div className="space-y-2.5">
            <h5 className="font-serif-display font-bold text-sm text-white uppercase tracking-wider">
              Acesso Operacional
            </h5>
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenAdmin}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2.5 rounded-xl text-left border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-2 text-xs"
                id="footer-admin-btn"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Painel de Controle Admin</span>
              </button>
              <button
                onClick={onOpenDriver}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2.5 rounded-xl text-left border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-2 text-xs"
                id="footer-driver-btn"
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Aplicativo do Motorista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Litoral em Movimento. Todos os direitos reservados.</span>
          <span>Veículo Oficial: Chevrolet Spin 7 Lugares • Cadastur Regularizado</span>
        </div>
      </div>
    </footer>
  );
};
