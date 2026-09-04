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
  logo: './images/logo.jpg',
  iconLogo: './images/icon-logo.jpg',
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

export const MAX_TOTAL_USERS = 6;
export const MAX_DRIVERS = 4;
export const MAX_ADMINS = 2;

export const DRIVERS: Driver[] = [
  {
    id: 'drv-01',
    name: 'Eduardo Silveira',
    username: 'eduardo',
    email: 'eduardo.motorista@litoralemmovimento.com.br',
    phone: '(12) 98850-6597',
    vehicleModel: 'Chevrolet Spin Premier 7L • (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    plate: 'SP-LIT7A24',
    rating: 5.0,
    totalTrips: 0,
    activeStatus: 'Disponível',
  },
  {
    id: 'drv-02',
    name: 'Edivam Santos',
    username: 'edivam',
    email: 'edivam.motorista@litoralemmovimento.com.br',
    phone: '(12) 98850-6597',
    vehicleModel: 'Chevrolet Spin Premier 7L • (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    plate: 'SP-MOV7B88',
    rating: 5.0,
    totalTrips: 0,
    activeStatus: 'Disponível',
  },
  {
    id: 'drv-03',
    name: 'Karine Souza',
    username: 'karine',
    email: 'karine.motorista@litoralemmovimento.com.br',
    phone: '(12) 98850-6597',
    vehicleModel: 'Chevrolet Spin Premier 7L • (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    plate: 'SP-SOU7C99',
    rating: 5.0,
    totalTrips: 0,
    activeStatus: 'Disponível',
  },
  {
    id: 'drv-04',
    name: 'Junior Ferreira',
    username: 'junior',
    email: 'ferreirasjunior10@gmail.com',
    phone: '(12) 98850-6597',
    vehicleModel: 'Siena Sedan 5L • (4 Pass + Mot.)',
    plate: 'SP-FER5D10',
    rating: 5.0,
    totalTrips: 0,
    activeStatus: 'Disponível',
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
  heavyLuggageFee: 90.0, // R$ 90,00 adicional por mala pesada acima de 23 kg
  maxPassengersSpin: 6, // Chevrolet Spin 7-Lugares (6 pass. + motorista)
  maxPassengersSedan: 4, // Carro Executivo 4 Lugares
  childSeatFee: 0, // Cortesia gratuita para segurança
  depositPercentage: 50, // 50% de sinal necessário para confirmação da reserva
  remainingPercentage: 50, // 50% pago no embarque diretamente
};
