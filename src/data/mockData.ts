import { DestinationInfo, Driver, AdminAccount, Reservation } from '../types';

export const BRAND_COLORS = {
  primaryNavy: '#0B192C',
  navyDark: '#0F172A',
  lightBg: '#F8FAFC',
  cardBg: '#FFFFFF',
  borderLight: '#E2E8F0',
  goldAccent: '#D97706',
  goldSecondary: '#F59E0B',
  oceanBlue: '#0284C7',
  skyBlue: '#38BDF8',
  slateDark: '#1E293B',
  slateMuted: '#64748B',
  white: '#FFFFFF',
};

export const COMPANY_CONTACT = {
  name: 'Michelly',
  role: 'Atendimento & Agendamento',
  phone: '(12) 98850-6597',
  phoneInternational: '+55 12 98850-6597',
  phoneRaw: '5512988506597',
  email: 'contato@litoralemmovimento.com.br',
  whatsappUrl: 'https://wa.me/5512988506597',
  pixKey: '12988506597',
  pixKeyType: 'Telefone (Celular)',
  pixBeneficiary: 'Litoral em Movimento • Michelly',
  pixBank: 'Banco Inter',
};

export const BRAND_IMAGES = {
  logo: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/logo.jpg',
  spinVehicle: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/CHEVROLET-Spin-7-Lugares.jpg',
  saoSebastiao: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/Praias-de-Sao-Sebastiao-Credito-dsa-foto-Marcos-Bonello-1024x575.webp',
  ilhabela: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/turismo-em-ilhabela.jpg',
  caraguatatuba: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/caraguatatuba.jpg',
  driverCarlos: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
  driverMarcos: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
};

export const DESTINATIONS: DestinationInfo[] = [
  {
    id: 'sao-sebastiao',
    name: 'São Sebastião',
    tagline: 'Maresias, Juquehy, Cambury, Boiçucanga e Centro Histórico / Balsa',
    description: 'Praias renomadas com atendimento porta a porta, descida pela serra com conforto e segurança.',
    popularSpots: ['Maresias', 'Juquehy', 'Cambury', 'Boiçucanga', 'Centro / Balsa'],
    estimatedDistanceKm: 195,
    estimatedTimeHours: '2h45 a 3h15',
    startingPriceIndividual: 700,
    startingPriceShared: 180,
    imageUrl: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/Praias-de-Sao-Sebastiao-Credito-dsa-foto-Marcos-Bonello-1024x575.webp',
    highlightBadge: 'Praias Famosas',
  },
  {
    id: 'ilhabela',
    name: 'Ilhabela (Balsa São Sebastião)',
    tagline: 'Desembarque no Porto da Balsa (R$ 700) ou Travessia Fechada (a partir de R$ 900)',
    description: 'Desembarque direto no terminal da Balsa de São Sebastião. Para travessia com carro fechado para o interior da ilha, serviço exclusivo a partir de R$ 900 sujeito a consulta e disponibilidade.',
    popularSpots: ['Porto da Balsa (São Sebastião)', 'Embarque Balsa', 'Travessia Ilha (Carro Fechado - Sob Consulta)'],
    estimatedDistanceKm: 210,
    estimatedTimeHours: '3h00 a 3h30',
    startingPriceIndividual: 700,
    startingPriceShared: 180,
    imageUrl: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/turismo-em-ilhabela.jpg',
    highlightBadge: 'Porto da Balsa',
  },
  {
    id: 'caraguatatuba',
    name: 'Caraguatatuba (Rodoviária / Sentido S. Sebastião)',
    tagline: 'Apenas Rodoviária e bairros sentido São Sebastião',
    description: 'Atendimento exclusivo na Rodoviária de Caraguatatuba e bairros sentido São Sebastião (Porto Novo, Praia das Palmeiras, Travessão).',
    popularSpots: ['Rodoviária de Caraguatatuba', 'Porto Novo', 'Praia das Palmeiras', 'Travessão'],
    estimatedDistanceKm: 175,
    estimatedTimeHours: '2h15 a 2h45',
    startingPriceIndividual: 700,
    startingPriceShared: 180,
    imageUrl: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/caraguatatuba.jpg',
    highlightBadge: 'Rodoviária & Sul',
  },
];

export const DRIVERS: Driver[] = [
  {
    id: 'drv-01',
    name: 'Carlos Silva',
    email: 'carlos.motorista@litoralemmovimento.com.br',
    phone: '(11) 98765-4321',
    photoUrl: BRAND_IMAGES.driverCarlos,
    vehicleModel: 'Chevrolet Spin Premier 7L • 2024 (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    plate: 'SP-LIT7A24',
    rating: 4.98,
    totalTrips: 342,
    activeStatus: 'Em Viagem',
    currentLocation: {
      lat: -23.5505,
      lng: -45.4158,
      address: 'Rodovia dos Tamoios, km 64 - Sentido Litoral',
    },
  },
  {
    id: 'drv-02',
    name: 'Marcos Oliveira',
    email: 'marcos.motorista@litoralemmovimento.com.br',
    phone: '(11) 97654-3210',
    photoUrl: BRAND_IMAGES.driverMarcos,
    vehicleModel: 'Sedã Executivo 4L • 2024 (Ar-Condicionado, até 4 Pass.)',
    plate: 'SP-MOV7B88',
    rating: 4.95,
    totalTrips: 289,
    activeStatus: 'Disponível',
    currentLocation: {
      lat: -23.5505,
      lng: -46.6333,
      address: 'Aeroporto Internacional de Guarulhos (GRU) - Terminal 2',
    },
  },
];

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'adm-01',
    name: 'Alan Morais',
    email: 'alanpkmorais@gmail.com',
    role: 'Super Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'adm-02',
    name: 'Michelly',
    email: 'michelly@litoralemmovimento.com.br',
    role: 'Atendimento',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'adm-03',
    name: 'Rodrigo Ramos',
    email: 'rodrigo.atendimento@litoralemmovimento.com.br',
    role: 'Atendimento',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'adm-04',
    name: 'Beatriz Almeida',
    email: 'financeiro@litoralemmovimento.com.br',
    role: 'Financeiro',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  },
];

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const PRICING_RULES = {
  fixedRoutes: {
    'São Paulo -> São Sebastião': 700,
    'São Sebastião -> São Paulo': 700,
    'São Paulo -> Ilhabela (Balsa São Sebastião)': 700,
    'Ilhabela (Balsa São Sebastião) -> São Paulo': 700,
    'São Paulo -> Ilhabela (Travessia Fechada)': 900,
    'Ilhabela (Travessia Fechada) -> São Paulo': 900,
    'São Paulo -> Caraguatatuba': 700,
    'Caraguatatuba -> São Paulo': 700,
  },
  sharedSeatPrice: {
    'São Sebastião': 180,
    'Ilhabela': 180,
    'Caraguatatuba': 180,
  },
  extraStopFixedFee: 50.0, // R$ 50,00 flat rate for predefined stops
  offRouteKmRate: 4.5, // R$ 4,50 per extra km detected by GPS
  maxPassengersSpin: 6, // Chevrolet Spin 7-Lugares (6 pass. + motorista)
  maxPassengersSedan: 4, // Carro Executivo 4 Lugares
  childSeatFee: 0, // Cortesia gratuita para segurança
  depositPercentage: 50, // 50% de sinal necessário para confirmação da reserva
  remainingPercentage: 50, // 50% pago no embarque diretamente
};
