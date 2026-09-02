import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let aiInstance: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

// Full ServerReservation matching client-side Reservation type
export interface ServerReservation {
  id: string;
  code: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  origin: string;
  originDetails?: string;
  destination: string;
  destinationDetails?: string;
  pickupAddress: string;
  dropoffAddress: string;
  flightNumber?: string;
  date: string;
  time: string;
  passengers: number;
  luggageCount: number;
  hasChildSeat?: boolean;
  tripType: string;
  vehicleCategory?: string;
  basePrice?: number;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  depositPaid: boolean;
  paymentMethod?: string;
  paymentStatus: string;
  status: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  driverPlate?: string;
  notes?: string;
  internalAdminNotes?: string;
  gpsDeviation?: any;
}

export interface ServerDriver {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  vehicleModel: string;
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

const INITIAL_SERVER_DRIVERS: ServerDriver[] = [
  {
    id: 'drv-01',
    name: 'Eduardo',
    email: 'eduardo.motorista@litoralemmovimento.com.br',
    phone: '(12) 98850-6597',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    vehicleModel: 'Chevrolet Spin Premier 7L • 2024 (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    plate: 'SP-LIT7A24',
    rating: 4.98,
    totalTrips: 420,
    activeStatus: 'Disponível',
    currentLocation: {
      lat: -23.5505,
      lng: -45.4158,
      address: 'Rodovia dos Tamoios (SP-099) - Sentido Litoral',
    },
  },
  {
    id: 'drv-02',
    name: 'Edivam Santos',
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

const INITIAL_SERVER_RESERVATIONS: ServerReservation[] = [
  {
    id: 'res-101',
    code: 'LM-8921',
    customerName: 'Dra. Fernanda Albuquerque',
    customerPhone: '(11) 99123-4567',
    customerEmail: 'fernanda.albuquerque@clinica.med.br',
    origin: 'São Paulo',
    originDetails: 'Aeroporto de Congonhas (CGH) - Desembarque',
    destination: 'São Sebastião',
    destinationDetails: 'Maresias (Condomínio Barramares)',
    pickupAddress: 'Av. Washington Luís, s/n - Congonhas, São Paulo - SP',
    dropoffAddress: 'Av. Francisco Loup, 1140 - Maresias, São Sebastião - SP',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    passengers: 4,
    luggageCount: 4,
    tripType: 'Individual',
    status: 'Confirmado',
    totalPrice: 700,
    depositAmount: 350,
    remainingAmount: 350,
    depositPaid: true,
    paymentStatus: 'Sinal 50% Pago (Confirmado)',
    assignedDriverId: 'drv-01',
    assignedDriverName: 'Eduardo',
    driverPhone: '(12) 98850-6597',
    driverVehicle: 'Chevrolet Spin Premier 7L • 2024 (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    driverPlate: 'SP-LIT7A24',
    flightNumber: 'G3-1492 (Chegada 07:55)',
    notes: 'Cliente solicitou ar-condicionado duplo e água mineral.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'res-102',
    code: 'LM-8922',
    customerName: 'Eduardo Guimarães & Família',
    customerPhone: '(11) 98234-5678',
    customerEmail: 'eduardo.guimaraes@techcorp.com.br',
    origin: 'São Paulo',
    originDetails: 'Aeroporto Internacional de Guarulhos (GRU) - Terminal 2',
    destination: 'Ilhabela',
    destinationDetails: 'Balsa de São Sebastião / Praia do Curral',
    pickupAddress: 'Aeroporto Internacional de Guarulhos, Terminal 2',
    dropoffAddress: 'Av. José Pacheco do Nascimento, 8000 - Praia do Curral, Ilhabela - SP',
    date: new Date().toISOString().split('T')[0],
    time: '13:00',
    passengers: 5,
    luggageCount: 5,
    tripType: 'Individual',
    status: 'Confirmado',
    totalPrice: 700,
    depositAmount: 350,
    remainingAmount: 350,
    depositPaid: true,
    paymentStatus: 'Sinal 50% Pago (Confirmado)',
    assignedDriverId: 'drv-02',
    assignedDriverName: 'Edivam Santos',
    driverPhone: '(12) 98850-6597',
    driverVehicle: 'Chevrolet Spin Premier 7L • 2024 (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    driverPlate: 'SP-MOV7B88',
    flightNumber: 'LA-3021 (Chegada 12:15)',
    notes: 'Família com 2 crianças e malas grandes no bagageiro estendido.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'res-103',
    code: 'LM-8923',
    customerName: 'Lucas Ferreira Mendes',
    customerPhone: '(11) 97112-9844',
    customerEmail: 'lucas.mendes@consultoria.com.br',
    origin: 'São Paulo',
    originDetails: 'Metrô Portuguesa-Tietê',
    destination: 'Caraguatatuba',
    destinationDetails: 'Praia Martin de Sá',
    pickupAddress: 'Rua Marechal Odylio Denys, Terminal Tietê, São Paulo - SP',
    dropoffAddress: 'Av. Dr. Aldino Schiavi, 500 - Martin de Sá, Caraguatatuba - SP',
    date: new Date().toISOString().split('T')[0],
    time: '16:30',
    passengers: 1,
    luggageCount: 1,
    tripType: 'Compartilhado',
    status: 'Confirmado',
    totalPrice: 80,
    depositAmount: 40,
    remainingAmount: 40,
    depositPaid: true,
    paymentStatus: 'Sinal 50% Pago (Confirmado)',
    assignedDriverId: 'drv-03',
    assignedDriverName: 'Karine Souza',
    driverPhone: '(12) 98850-6597',
    driverVehicle: 'Chevrolet Spin Premier 7L • 2024 (Ar-Cond. Duplo, 6 Pass. + Mot.)',
    driverPlate: 'SP-LIT7C50',
    notes: 'Transfer compartilhado pontual.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

// File-based persistence directory and helpers
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data dir', e);
  }
}

const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const DRIVERS_FILE = path.join(DATA_DIR, 'drivers.json');

function loadReservationsFromDisk(): ServerReservation[] {
  try {
    if (fs.existsSync(RESERVATIONS_FILE)) {
      const raw = fs.readFileSync(RESERVATIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading reservations from disk:', err);
  }
  return [...INITIAL_SERVER_RESERVATIONS];
}

function saveReservationsToDisk(list: ServerReservation[]) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reservations to disk:', err);
  }
}

function loadDriversFromDisk(): ServerDriver[] {
  try {
    if (fs.existsSync(DRIVERS_FILE)) {
      const raw = fs.readFileSync(DRIVERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading drivers from disk:', err);
  }
  return [...INITIAL_SERVER_DRIVERS];
}

function saveDriversToDisk(list: ServerDriver[]) {
  try {
    fs.writeFileSync(DRIVERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving drivers to disk:', err);
  }
}

let serverReservations: ServerReservation[] = loadReservationsFromDisk();
let serverDrivers: ServerDriver[] = loadDriversFromDisk();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Explicitly serve Service Worker, Offline fallback and Manifest with proper PWA headers
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
  });

  app.get('/offline.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(process.cwd(), 'public', 'offline.html'));
  });

  app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
  });

  // Serve static assets and images
  app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));
  app.use('/images', express.static(path.join(process.cwd(), 'images')));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Litoral em Movimento API',
      timestamp: new Date().toISOString(),
      activeFleet: '2 x Chevrolet Spin Premier 7 Lugares',
    });
  });

  // Get reservations with cache busting headers
  app.get('/api/reservations', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      count: serverReservations.length,
      data: serverReservations,
      serverTime: new Date().toISOString(),
    });
  });

  // Create or add reservation
  app.post('/api/reservations', (req, res) => {
    const body = req.body;
    const code = body.code || `LM-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalPrice = Number(body.totalPrice) || 700;
    const depositAmount = Number(body.depositAmount) || Number((totalPrice * 0.5).toFixed(2));
    const remainingAmount = Number(body.remainingAmount) || Number((totalPrice - depositAmount).toFixed(2));

    const newReservation: ServerReservation = {
      id: body.id || `res-${Date.now()}`,
      code,
      customerName: body.customerName || 'Cliente Litoral',
      customerPhone: body.customerPhone || '',
      customerEmail: body.customerEmail || '',
      origin: body.origin || 'São Paulo',
      originDetails: body.originDetails || '',
      destination: body.destination || 'São Sebastião',
      destinationDetails: body.destinationDetails || '',
      pickupAddress: body.pickupAddress || body.origin || '',
      dropoffAddress: body.dropoffAddress || body.destination || '',
      flightNumber: body.flightNumber || '',
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || '09:00',
      passengers: Number(body.passengers) || 1,
      luggageCount: Number(body.luggageCount) || 1,
      tripType: body.tripType || 'Individual',
      status: body.status || 'Pendente',
      totalPrice,
      depositAmount,
      remainingAmount,
      depositPaid: !!body.depositPaid,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus || 'Pendente (Aguardando Sinal 50%)',
      assignedDriverId: body.assignedDriverId,
      assignedDriverName: body.assignedDriverName,
      driverPhone: body.driverPhone,
      driverVehicle: body.driverVehicle,
      driverPlate: body.driverPlate,
      notes: body.notes || '',
      internalAdminNotes: body.internalAdminNotes || '',
      gpsDeviation: body.gpsDeviation,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const existingIdx = serverReservations.findIndex(r => r.id === newReservation.id);
    if (existingIdx >= 0) {
      serverReservations[existingIdx] = { ...serverReservations[existingIdx], ...newReservation };
    } else {
      serverReservations.unshift(newReservation);
    }
    saveReservationsToDisk(serverReservations);

    res.status(201).json({
      success: true,
      message: 'Reserva registrada e sincronizada com sucesso.',
      data: newReservation,
    });
  });

  // Assign Driver to Reservation (CRITICAL FOR MULTI-DEVICE DRIVER DISPATCH)
  app.post('/api/reservations/:id/assign-driver', (req, res) => {
    const { id } = req.params;
    const { driverId, driverName, driverPhone, driverVehicle, driverPlate, status } = req.body;

    const idx = serverReservations.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Reserva não encontrada no servidor.' });
    }

    if (driverId) {
      serverReservations[idx].assignedDriverId = driverId;
      serverReservations[idx].assignedDriverName = driverName || '';
      serverReservations[idx].driverPhone = driverPhone || '';
      serverReservations[idx].driverVehicle = driverVehicle || '';
      serverReservations[idx].driverPlate = driverPlate || '';
      if (serverReservations[idx].status === 'Pendente') {
        serverReservations[idx].status = status || 'Confirmado';
      }
    } else {
      delete serverReservations[idx].assignedDriverId;
      delete serverReservations[idx].assignedDriverName;
      delete serverReservations[idx].driverPhone;
      delete serverReservations[idx].driverVehicle;
      delete serverReservations[idx].driverPlate;
    }

    saveReservationsToDisk(serverReservations);

    res.json({
      success: true,
      message: 'Motorista atribuído com sucesso no servidor.',
      data: serverReservations[idx],
    });
  });

  // Update existing reservation (status, payment, notes, gps, etc.)
  app.put('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const idx = serverReservations.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Reserva não encontrada.' });
    }

    serverReservations[idx] = { ...serverReservations[idx], ...updates };
    saveReservationsToDisk(serverReservations);

    res.json({
      success: true,
      message: 'Reserva atualizada com sucesso no servidor.',
      data: serverReservations[idx],
    });
  });

  // Sync endpoint: client uploads its reservations to merge with server
  app.post('/api/reservations/sync', (req, res) => {
    const clientReservations = req.body.reservations;
    if (Array.isArray(clientReservations)) {
      for (const item of clientReservations) {
        const existingIdx = serverReservations.findIndex(r => r.id === item.id);
        if (existingIdx === -1) {
          serverReservations.push(item);
        } else {
          // Keep server's assigned driver if client didn't have it, or take client's if set
          serverReservations[existingIdx] = {
            ...item,
            ...serverReservations[existingIdx],
            ...(item.assignedDriverId ? {
              assignedDriverId: item.assignedDriverId,
              assignedDriverName: item.assignedDriverName,
              driverPhone: item.driverPhone,
              driverVehicle: item.driverVehicle,
              driverPlate: item.driverPlate,
            } : {}),
            ...(item.status && item.status !== 'Pendente' ? { status: item.status } : {}),
          };
        }
      }
      saveReservationsToDisk(serverReservations);
    }

    res.json({
      success: true,
      count: serverReservations.length,
      data: serverReservations,
      serverTime: new Date().toISOString(),
    });
  });

  // Get drivers
  app.get('/api/drivers', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      count: serverDrivers.length,
      data: serverDrivers,
    });
  });

  // Update driver status/telemetry
  app.put('/api/drivers/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const idx = serverDrivers.findIndex(d => d.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Motorista não encontrado.' });
    }

    serverDrivers[idx] = { ...serverDrivers[idx], ...updates };
    saveDriversToDisk(serverDrivers);

    res.json({
      success: true,
      message: 'Status do motorista atualizado no servidor.',
      data: serverDrivers[idx],
    });
  });

  // GPS Deviation & Extra km calculator endpoint
  app.post('/api/gps-deviation/calculate', (req, res) => {
    const { actualKm, plannedKm, rateType, fixedStopCount } = req.body;
    const diffKm = Math.max(0, (Number(actualKm) || 0) - (Number(plannedKm) || 0));
    const flatRatePerStop = 50.0;
    const perKmRate = 4.5;

    let surcharge = 0;
    if (rateType === 'flat') {
      surcharge = (Number(fixedStopCount) || 1) * flatRatePerStop;
    } else {
      surcharge = diffKm * perKmRate;
    }

    res.json({
      success: true,
      diffKm: Number(diffKm.toFixed(1)),
      rateType: rateType || 'per_km',
      unitRate: rateType === 'flat' ? flatRatePerStop : perKmRate,
      calculatedSurcharge: Number(surcharge.toFixed(2)),
      explanation:
        rateType === 'flat'
          ? `Taxa fixa de desvio/parada: R$ ${surcharge.toFixed(2)} (${fixedStopCount || 1} parada(s))`
          : `Cobrança por km excedente: ${diffKm.toFixed(1)} km x R$ 4,50/km = R$ ${surcharge.toFixed(2)}`,
    });
  });

  // Authentication Endpoints (Back-End Security)
  const ADMIN_PASSWORDS = [
    'litoral2026',
    '12988506597',
    'spin7l',
    'admin',
    'admin2026',
    'eduardo',
    'eduardo2026',
    'edivam',
    'edivam2026',
    'karine',
    'karine2026',
    'michelly',
    'michelly2026',
  ];

  const SUPERADMIN_PASSWORDS = [
    'alan2026',
    'alanmorais',
    'alanpkmorais',
    'superadmin',
    'alan@2026',
  ];

  const DRIVER_PINS: Record<string, string[]> = {
    'drv-01': ['1234', '2026', 'spin7l', 'eduardo'],
    'drv-02': ['1234', '2026', 'spin7l', 'edivam'],
    'drv-03': ['1234', '2026', 'spin7l', 'karine'],
  };

  app.post('/api/auth/admin-login', (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Senha não fornecida.' });
    }

    const sanitized = String(password).trim().toLowerCase();
    const isValid = ADMIN_PASSWORDS.includes(sanitized) || sanitized === 'litoral2026';

    if (isValid) {
      return res.json({
        success: true,
        token: `adm_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        role: 'admin',
        adminName: sanitized.includes('eduardo')
          ? 'Eduardo (Operações)'
          : sanitized.includes('edivam')
          ? 'Edivam (Frota)'
          : sanitized.includes('karine')
          ? 'Karine (Atendimento)'
          : sanitized.includes('michelly')
          ? 'Michelly (Gestão)'
          : 'Gestão Administrativa',
      });
    }

    return res.status(401).json({ success: false, message: 'Senha administrativa incorreta.' });
  });

  app.post('/api/auth/superadmin-login', (req, res) => {
    const { password, customPassword } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Senha não fornecida.' });
    }

    const sanitized = String(password).trim().toLowerCase();
    const customSanitized = customPassword ? String(customPassword).trim().toLowerCase() : '';
    const isValid =
      SUPERADMIN_PASSWORDS.includes(sanitized) ||
      (customSanitized && sanitized === customSanitized);

    if (isValid) {
      return res.json({
        success: true,
        token: `superadm_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        role: 'superadmin',
        name: 'Alan Morais',
      });
    }

    return res.status(401).json({ success: false, message: 'Senha de Super Admin incorreta.' });
  });

  app.post('/api/auth/driver-login', (req, res) => {
    const { driverId, pin } = req.body;
    if (!driverId || !pin) {
      return res.status(400).json({ success: false, message: 'Motorista e PIN são obrigatórios.' });
    }

    const validPins = DRIVER_PINS[driverId] || ['1234', '2026', 'spin7l'];
    const sanitizedPin = String(pin).trim().toLowerCase();

    if (validPins.includes(sanitizedPin)) {
      return res.json({
        success: true,
        token: `drv_tok_${Date.now()}_${driverId}`,
        driverId,
      });
    }

    return res.status(401).json({ success: false, message: 'PIN de acesso inválido.' });
  });

  // Google Sheets / Apps Script Integration relay & export
  app.post('/api/sync/apps-script', async (req, res) => {
    const { scriptUrl, action, ...payload } = req.body;
    if (!scriptUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL do Google Apps Script não fornecida.',
      });
    }

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: action || 'syncAll', ...payload }),
      });

      let jsonRes: any = {};
      try {
        jsonRes = await response.json();
      } catch {
        jsonRes = { status: 'success', message: 'Payload enviado com sucesso para a planilha!' };
      }

      res.json({
        success: true,
        message: jsonRes.message || 'Dados sincronizados com o Google Apps Script via Backend.',
        data: jsonRes,
      });
    } catch (err: any) {
      console.error('Apps Script proxy error:', err);
      res.status(500).json({
        success: false,
        message: `Erro ao comunicar com o Google Apps Script: ${err.message}`,
      });
    }
  });

  // Google Sheets / Apps Script Integration simulation & export
  app.post('/api/sync/google-sheets', (req, res) => {
    const payload = req.body;
    res.json({
      success: true,
      message: 'Sincronização com Google Apps Script / Sheets simulada com sucesso!',
      syncedRows: Array.isArray(payload.reservations) ? payload.reservations.length : 1,
      sheetsWebhookStatus: 'CONNECTED',
      tip: 'A arquitetura Node.js integrada oferece menor latência e suporta webhooks em tempo real, enquanto o Google Sheets pode ser usado como espelho para o time financeiro.',
    });
  });

  // Gemini AI Trip Assistant
  app.post('/api/ai/trip-advisor', async (req, res) => {
    try {
      const { userQuery, origin, destination, date, passengers } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.json({
          success: true,
          response: `Olá! Para a rota ${origin || 'São Paulo'} até ${destination || 'Litoral Norte'}, recomendamos sair cedo (antes das 06h30 ou após as 10h00) para evitar o tráfego na Rodovia dos Tamoios e na Rodovia Ayrton Senna/Carvalho Pinto. Nosso Chevrolet Spin de 7 lugares possui ar-condicionado duplo e amplo porta-malas para até 7 passageiros com conforto e segurança.`,
        });
      }

      const prompt = `Você é o Concierge Virtual da "Litoral em Movimento", serviço premium de transfer executivo entre São Paulo e o Litoral Norte (São Sebastião, Ilhabela, Caraguatatuba) com frota de Chevrolet Spin 7 lugares.
Origem: ${origin || 'São Paulo'}
Destino: ${destination || 'Litoral Norte'}
Data: ${date || 'Próximo final de semana'}
Passageiros: ${passengers || 2}
Pergunta do cliente: "${userQuery || 'Quais as melhores dicas de horário e rota?'}"

Responda em tom profissional, caloroso, direto e conciso (em português brasileiro). Destaque a pontualidade, ar-condicionado, segurança da Tamoios/Imigrantes, e dicas sobre balsa de Ilhabela se aplicável. Máximo 3 parágrafos curtos.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({
        success: true,
        response: response.text || 'Dica da Litoral em Movimento gerada.',
      });
    } catch (error) {
      console.error('Error generating AI advice:', error);
      res.json({
        success: true,
        response: 'Para viajar com tranquilidade ao Litoral Norte, viaje com a Litoral em Movimento! Agende com antecedência para garantir seu horário ideal na travessia e na descida da serra.',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Litoral em Movimento server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
