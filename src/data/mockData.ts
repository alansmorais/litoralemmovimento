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
  name: 'Central de Atendimento',
  role: 'Atendimento & Agendamento',
  phone: '(12) 98850-6597',
  phoneInternational: '+55 12 98850-6597',
  phoneRaw: '5512988506597',
  email: 'contato@litoralemmovimento.com.br',
  whatsappUrl: 'https://wa.me/5512988506597',
  pixKey: '12988506597',
  pixKeyType: 'Telefone (Celular)',
  pixBeneficiary: 'Litoral em Movimento • Transfer Executivo',
  pixBank: 'Banco Inter',
};

export const BRAND_IMAGES = {
  logo: '/images/logo.jpg',
  iconLogo: '/images/icon-logo.jpg',
  spinVehicle: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/CHEVROLET-Spin-7-Lugares.jpg',
  saoSebastiao: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/Praias-de-Sao-Sebastiao-Credito-dsa-foto-Marcos-Bonello-1024x575.webp',
  ilhabela: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/turismo-em-ilhabela.jpg',
  caraguatatuba: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/caraguatatuba.jpg',
  driverCarlos: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
  driverMarcos: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
};

export const OFFICIAL_TIMETABLE = {
  durationEstimate: '2h30 a 3h00',
  subida: {
    title: 'Subida (Litoral ➔ São Paulo & GRU)',
    description: 'Saídas de São Sebastião e Caraguatatuba com destino ao Metrô Portuguesa-Tietê e Aeroporto de Guarulhos (GRU).',
    rates: [
      { from: 'São Sebastião (Balsa & Centro Histórico)', to: 'Metrô Portuguesa-Tietê', price: 90 },
      { from: 'Caraguatatuba (a partir da Rodoviária)', to: 'Metrô Portuguesa-Tietê', price: 80 },
      { from: 'São Sebastião / Caraguatatuba', to: 'Aeroporto Internacional de Guarulhos (GRU)', price: 150 },
    ],
    timesDaily: ['05:00', '08:30', '14:00', '18:30'],
  },
  descida: {
    title: 'Descida (São Paulo / GRU ➔ Litoral)',
    description: 'Saídas do Metrô Portuguesa-Tietê e Aeroporto de Guarulhos (GRU) com destino a Caraguatatuba e São Sebastião.',
    rates: [
      { from: 'Metrô Portuguesa-Tietê', to: 'Caraguatatuba (até a Rodoviária)', price: 80 },
      { from: 'Metrô Portuguesa-Tietê', to: 'Balsa em São Sebastião (Ilhabela)', price: 90 },
      { from: 'Aeroporto Internacional de Guarulhos (GRU)', to: 'Caraguá / São Sebastião', price: 150 },
    ],
    timesWeekday: ['11:30', '14:30', '17:30', '22:00'],
    timesWeekend: ['11:30', '13:00', '17:30', '21:30'],
    weekendNotes: 'Aos sábados e domingos, a saída das 14:30 é antecipada para 13:00 e a das 22:00 é antecipada para 21:30.',
  },
};

export const DESTINATIONS: DestinationInfo[] = [
  {
    id: 'sao-sebastiao',
    name: 'São Sebastião',
    tagline: 'Porto da Balsa para Ilhabela, Centro Histórico e Região Central',
    description: 'Conexão direta com a Balsa de Ilhabela e Centro de São Sebastião a partir de R$ 90/vaga (Metrô Tietê) ou privativo porta a porta em Spin 7L.',
    popularSpots: ['Porto da Balsa', 'Centro Histórico', 'Rua da Praia', 'Terminal Urbano'],
    estimatedDistanceKm: 195,
    estimatedTimeHours: '2h30 a 3h00',
    startingPriceIndividual: 700,
    startingPriceShared: 90,
    imageUrl: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/Praias-de-Sao-Sebastiao-Credito-dsa-foto-Marcos-Bonello-1024x575.webp',
    highlightBadge: 'R$ 90 / assento',
  },
  {
    id: 'ilhabela',
    name: 'Ilhabela (Balsa São Sebastião)',
    tagline: 'Desembarque no Porto da Balsa (R$ 90/vaga) ou Travessia Fechada',
    description: 'Desembarque direto no terminal da Balsa de São Sebastião a R$ 90/assento. Para travessia com carro fechado para o interior da ilha, serviço exclusivo sob consulta prévia.',
    popularSpots: ['Porto da Balsa (São Sebastião)', 'Embarque Balsa', 'Travessia Ilha (Carro Fechado - Sob Consulta)'],
    estimatedDistanceKm: 210,
    estimatedTimeHours: '2h30 a 3h00',
    startingPriceIndividual: 700,
    startingPriceShared: 90,
    imageUrl: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/turismo-em-ilhabela.jpg',
    highlightBadge: 'R$ 90 / Balsa',
  },
  {
    id: 'caraguatatuba',
    name: 'Caraguatatuba (Rodoviária / Sentido S. Sebastião)',
    tagline: 'A partir da Rodoviária e bairros sentido São Sebastião (R$ 80/vaga)',
    description: 'Atendimento na Rodoviária de Caraguatatuba e bairros sentido São Sebastião (Porto Novo, Praia das Palmeiras, Travessão). Vagas regulares por R$ 80 até Metrô Tietê.',
    popularSpots: ['Rodoviária de Caraguatatuba', 'Porto Novo', 'Praia das Palmeiras', 'Travessão'],
    estimatedDistanceKm: 175,
    estimatedTimeHours: '2h15 a 2h45',
    startingPriceIndividual: 700,
    startingPriceShared: 80,
    imageUrl: 'https://raw.githubusercontent.com/alansmorais/litoralemmovimento/refs/heads/main/images/caraguatatuba.jpg',
    highlightBadge: 'R$ 80 / Rodoviária',
  },
];

export const DRIVERS: Driver[] = [
  {
    id: 'drv-01',
    name: 'Eduardo Silveira',
    username: 'eduardo',
    pin: '1234',
    mustChangePassword: true,
    email: 'eduardo.motorista@litoralemmovimento.com.br',
    phone: '(12) 98850-6597',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
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
    name: 'Edivam Santos',
    username: 'edivam',
    pin: '1234',
    mustChangePassword: true,
    email: 'edivam.motorista@litoralemmovimento.com.br',
    phone: '(12) 98850-6597',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    vehicleModel: 'Chevrolet Spin Premier 7L • 2024 (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    plate: 'SP-MOV7B88',
    rating: 4.97,
    totalTrips: 310,
    activeStatus: 'Disponível',
    currentLocation: {
      lat: -23.5505,
      lng: -46.6333,
      address: 'Aeroporto Internacional de Guarulhos (GRU) - Terminal 2',
    },
  },
  {
    id: 'drv-03',
    name: 'Karine Souza',
    username: 'karine',
    pin: '1234',
    mustChangePassword: true,
    email: 'karine.motorista@litoralemmovimento.com.br',
    phone: '(12) 98850-6597',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    vehicleModel: 'Chevrolet Spin Premier 7L • 2024 (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    plate: 'SP-LIT7C50',
    rating: 4.99,
    totalTrips: 275,
    activeStatus: 'Disponível',
    currentLocation: {
      lat: -23.7785,
      lng: -45.3571,
      address: 'Balsa de São Sebastião / Ilhabela',
    },
  },
];

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'adm-05',
    username: 'alan',
    password: 'alan2026',
    mustChangePassword: false,
    name: 'Alan Morais',
    email: 'alanpkmorais@gmail.com',
    role: 'Super Admin',
    phone: '(12) 98850-6597',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status: 'Ativo',
  },
  {
    id: 'adm-01',
    username: 'eduardo',
    password: 'litoral2026',
    mustChangePassword: true,
    name: 'Eduardo',
    email: 'eduardo@litoralemmovimento.com.br',
    role: 'Gestão Operacional',
    phone: '(12) 98850-6597',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'Ativo',
  },
  {
    id: 'adm-02',
    username: 'edivam',
    password: 'litoral2026',
    mustChangePassword: true,
    name: 'Edivam',
    email: 'edivam@litoralemmovimento.com.br',
    role: 'Gestão de Frota',
    phone: '(12) 98850-6597',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'Ativo',
  },
  {
    id: 'adm-03',
    username: 'karine',
    password: 'litoral2026',
    mustChangePassword: true,
    name: 'Karine',
    email: 'karine@litoralemmovimento.com.br',
    role: 'Gestão de Atendimento',
    phone: '(12) 98850-6597',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    status: 'Ativo',
  },
  {
    id: 'adm-04',
    username: 'michelly',
    password: 'litoral2026',
    mustChangePassword: true,
    name: 'Michelly',
    email: 'michelly@litoralemmovimento.com.br',
    role: 'Gestão Administrativa',
    phone: '(12) 98850-6597',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    status: 'Ativo',
  },
  {
    id: 'adm-06',
    username: 'admin',
    password: 'litoral2026',
    mustChangePassword: false,
    name: 'Administrador Geral',
    email: 'contato@litoralemmovimento.com.br',
    role: 'Gestão Geral',
    phone: '(12) 98850-6597',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    status: 'Ativo',
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
    'São Sebastião': 90,
    'Ilhabela': 90,
    'Caraguatatuba': 80,
    'Metrô Portuguesa-Tietê': 90,
    'Aeroporto de Guarulhos (GRU)': 150,
  },
  regularFares: {
    saoSebastiaoTiete: 90,
    caraguaTiete: 80,
    aeroportoGuarulhos: 150,
  },
  extraStopFixedFee: 50.0, // R$ 50,00 flat rate for predefined stops
  offRouteKmRate: 4.5, // R$ 4,50 per extra km detected by GPS
  maxPassengersSpin: 6, // Chevrolet Spin 7-Lugares (6 pass. + motorista)
  maxPassengersSedan: 4, // Carro Executivo 4 Lugares
  childSeatFee: 0, // Cortesia gratuita para segurança
  depositPercentage: 50, // 50% de sinal necessário para confirmação da reserva
  remainingPercentage: 50, // 50% pago no embarque diretamente
};
