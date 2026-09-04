export type TripStatus = 'Pendente' | 'Confirmado' | 'A caminho' | 'Em andamento' | 'Concluído' | 'Cancelado';

export type TripType = 'Individual' | 'Compartilhada';

export type VehicleCategory = 'spin_7' | 'sedan_4';

export type DestinationCity = 'São Sebastião' | 'Ilhabela (Balsa São Sebastião)' | 'Ilhabela (Travessia Fechada)' | 'Caraguatatuba (Rodoviária / Sentido S. Sebastião)' | string;

export type OriginCity = 'São Paulo' | 'São Sebastião' | 'Ilhabela (Balsa São Sebastião)' | 'Caraguatatuba (Rodoviária / Sentido S. Sebastião)' | string;

export type UserRole = 'customer' | 'admin' | 'driver';

export interface ExtraStop {
  id: string;
  address: string;
  city: string;
  additionalCost: number;
  notes?: string;
}

export interface GPSDeviation {
  detected: boolean;
  distanceKm: number;
  detourLocation: string;
  rateType: 'flat' | 'per_km';
  calculatedSurcharge: number;
  approvedByAdmin: boolean;
  timestamp: string;
  reason?: string;
}

export interface Reservation {
  id: string;
  code: string; // e.g. LM-7821
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  origin: string;
  originDetails?: string;
  destination: string;
  destinationDetails?: string;
  date: string;
  time: string;
  passengers: number;
  tripType: TripType;
  vehicleCategory?: VehicleCategory;
  luggageCount: number;
  heavyLuggageCount?: number; // Malas pesadas (> 23 kg) com adicional de R$ 90/unidade
  hasChildSeat: boolean;
  extraStops: ExtraStop[];
  estimatedDistanceKm: number;
  basePrice: number;
  totalPrice: number;
  depositAmount: number; // 50% exigido para confirmação da reserva
  remainingAmount: number; // 50% pago no embarque
  depositPaid: boolean;
  paymentMethod?: 'PIX' | 'Cartão' | 'Transferência';
  status: TripStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  driverPlate?: string;
  notes?: string;
  internalAdminNotes?: string;
  gpsDeviation?: GPSDeviation;
  paymentStatus: 'Pendente (Aguardando Sinal 50%)' | 'Sinal 50% Pago (Confirmado)' | 'Pago (PIX)' | 'Pago (Cartão)' | 'No Embarque';
  pickupAddress: string;
  dropoffAddress: string;
  flightNumber?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  username?: string; // Login curto (ex: 'eduardo', 'edivam', 'karine')
  pin?: string; // PIN / Senha de acesso
  mustChangePassword?: boolean; // Trocar senha no 1º acesso
  email: string;
  phone: string;
  photoUrl?: string;
  vehicleModel: string; // e.g. Chevrolet Spin Premier 7 Lugares
  plate: string;
  rating: number;
  totalTrips: number;
  activeStatus: 'Disponível' | 'Em Viagem' | 'Descanso';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface AdminAccount {
  id: string;
  username: string; // Login curto (ex: 'alan', 'eduardo', 'edivam', 'karine', 'michelly', 'admin')
  password?: string; // Senha de acesso configurável no Google Sheets
  mustChangePassword?: boolean; // Trocar senha no 1º acesso
  name: string;
  email?: string;
  role: 'Super Admin' | 'Gestão Geral' | 'Gestor de Tráfego' | 'Atendimento' | 'Financeiro' | 'Operações' | string;
  phone?: string;
  avatarUrl?: string;
  status?: 'Ativo' | 'Inativo';
}

export interface DestinationInfo {
  id: string;
  name: DestinationCity;
  tagline: string;
  description: string;
  popularSpots: string[];
  estimatedDistanceKm: number;
  estimatedTimeHours: string;
  startingPriceIndividual: number;
  startingPriceShared: number;
  imageUrl: string;
  highlightBadge: string;
}

export type MessageStatus = 'Pendente' | 'Respondida' | 'Arquivada';

export interface ContactMessage {
  id: string;
  ticketCode: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  preferredContact: 'WhatsApp' | 'E-mail' | 'Telefone';
  status: MessageStatus;
  adminNotes?: string;
  answeredAt?: string;
  answeredBy?: string;
}
