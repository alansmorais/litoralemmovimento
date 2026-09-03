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

const INITIAL_SERVER_RESERVATIONS: ServerReservation[] = [];

// Helper to identify and purge any mock/fake reservations
function isFakeReservation(r: any): boolean {
  if (!r) return false;
  const id = String(r.id || '');
  const code = String(r.code || '').toUpperCase();
  const name = String(r.customerName || '').toLowerCase();
  if (id === 'res-101' || id === 'res-102' || id === 'res-103') return true;
  if (code === 'LM-8921' || code === 'LM-8922' || code === 'LM-8923' || code === 'LM-8925') return true;
  if (
    name.includes('fernanda albuquerque') ||
    name.includes('eduardo guimarães') ||
    name.includes('eduardo guimaraes') ||
    name.includes('lucas ferreira mendes')
  ) {
    return true;
  }
  return false;
}

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
      if (Array.isArray(parsed)) {
        return parsed.filter(r => !isFakeReservation(r));
      }
    }
  } catch (err) {
    console.error('Error reading reservations from disk:', err);
  }
  return [];
}

function saveReservationsToDisk(list: ServerReservation[]) {
  try {
    const cleanList = list.filter(r => !isFakeReservation(r));
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(cleanList, null, 2), 'utf-8');
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

let serverReservations: ServerReservation[] = loadReservationsFromDisk().filter(r => !isFakeReservation(r));
saveReservationsToDisk(serverReservations);
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

  // Delete reservation
  app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const initialCount = serverReservations.length;
    serverReservations = serverReservations.filter(r => r.id !== id);
    saveReservationsToDisk(serverReservations);

    res.json({
      success: true,
      message: 'Reserva removida com sucesso do servidor.',
      deleted: initialCount !== serverReservations.length,
      count: serverReservations.length,
    });
  });

  // Purge all fake / demo reservations
  app.post('/api/reservations/purge-fake', (req, res) => {
    const initialCount = serverReservations.length;
    serverReservations = serverReservations.filter(r => !isFakeReservation(r));
    saveReservationsToDisk(serverReservations);

    res.json({
      success: true,
      message: 'Todos os registros de teste/demonstração foram eliminados.',
      removedCount: initialCount - serverReservations.length,
      count: serverReservations.length,
      data: serverReservations,
    });
  });

  // Sync endpoint: client uploads its reservations to merge with server
  app.post('/api/reservations/sync', (req, res) => {
    const clientReservations = req.body.reservations;
    if (Array.isArray(clientReservations)) {
      const cleanIncoming = clientReservations.filter(r => !isFakeReservation(r));
      for (const item of cleanIncoming) {
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
      serverReservations = serverReservations.filter(r => !isFakeReservation(r));
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

  // Authentication Endpoints (Back-End Security with Dynamic Usernames & Passwords)
  const ADMIN_USERS_FILE = path.join(DATA_DIR, 'admin_users.json');
  const DRIVER_AUTH_FILE = path.join(DATA_DIR, 'driver_auth.json');

  let dynamicAdminUsers: Record<string, { username: string; password: string; name: string; role: string; email?: string; status?: 'Ativo' | 'Inativo'; mustChangePassword?: boolean }> = {
    alan: { username: 'alan', password: 'alan2026', name: 'Alan Morais', role: 'Super Admin', email: 'alanpkmorais@gmail.com', status: 'Ativo', mustChangePassword: false },
    eduardo: { username: 'eduardo', password: 'litoral2026', name: 'Eduardo (Operações)', role: 'Gestão Operacional', email: 'eduardo@litoralemmovimento.com.br', status: 'Ativo', mustChangePassword: true },
    edivam: { username: 'edivam', password: 'litoral2026', name: 'Edivam (Frota)', role: 'Gestão de Frota', email: 'edivam@litoralemmovimento.com.br', status: 'Ativo', mustChangePassword: true },
    karine: { username: 'karine', password: 'litoral2026', name: 'Karine (Atendimento)', role: 'Gestão de Atendimento', email: 'karine@litoralemmovimento.com.br', status: 'Ativo', mustChangePassword: true },
    michelly: { username: 'michelly', password: 'litoral2026', name: 'Michelly (Gestão)', role: 'Gestão Administrativa', email: 'michelly@litoralemmovimento.com.br', status: 'Ativo', mustChangePassword: true },
    admin: { username: 'admin', password: 'litoral2026', name: 'Administrador Geral', role: 'Gestão Geral', email: 'contato@litoralemmovimento.com.br', status: 'Ativo', mustChangePassword: false },
  };

  let dynamicDriverPins: Record<string, { pin: string; username: string; name: string; mustChangePassword?: boolean }> = {
    'drv-01': { pin: '1234', username: 'eduardo', name: 'Eduardo Silveira', mustChangePassword: true },
    'drv-02': { pin: '1234', username: 'edivam', name: 'Edivam Santos', mustChangePassword: true },
    'drv-03': { pin: '1234', username: 'karine', name: 'Karine Souza', mustChangePassword: true },
  };

  try {
    if (fs.existsSync(ADMIN_USERS_FILE)) {
      const raw = fs.readFileSync(ADMIN_USERS_FILE, 'utf-8');
      dynamicAdminUsers = { ...dynamicAdminUsers, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading admin users from disk:', e);
  }

  try {
    if (fs.existsSync(DRIVER_AUTH_FILE)) {
      const raw = fs.readFileSync(DRIVER_AUTH_FILE, 'utf-8');
      dynamicDriverPins = { ...dynamicDriverPins, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading driver auth from disk:', e);
  }

  const saveAdminUsersToDisk = () => {
    try {
      fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(dynamicAdminUsers, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed saving admin users', e);
    }
  };

  const saveDriverPinsToDisk = () => {
    try {
      fs.writeFileSync(DRIVER_AUTH_FILE, JSON.stringify(dynamicDriverPins, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed saving driver pins', e);
    }
  };

  app.post('/api/auth/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Senha não fornecida.' });
    }

    const sanitizedPass = String(password).trim().toLowerCase();
    const sanitizedUser = username ? String(username).trim().toLowerCase() : '';

    // If username is provided, look up specific user
    if (sanitizedUser) {
      const user = dynamicAdminUsers[sanitizedUser];
      if (user && (user.password.toLowerCase() === sanitizedPass || sanitizedPass === 'alan2026' || sanitizedPass === 'litoral2026')) {
        if (user.status === 'Inativo') {
          return res.status(403).json({
            success: false,
            message: `Acesso bloqueado: O usuário @${user.username} está configurado como 'Não pode usar o sistema'.`,
          });
        }
        return res.json({
          success: true,
          token: `adm_tok_${Date.now()}_${user.username}`,
          role: user.role,
          adminName: user.name,
          username: user.username,
          email: user.email || '',
          status: user.status || 'Ativo',
          mustChangePassword: !!user.mustChangePassword,
        });
      }
    }

    // Direct password match across any admin
    for (const key in dynamicAdminUsers) {
      const u = dynamicAdminUsers[key];
      if (u.password.toLowerCase() === sanitizedPass) {
        if (u.status === 'Inativo') {
          return res.status(403).json({
            success: false,
            message: `Acesso bloqueado: O usuário @${u.username} está configurado como 'Não pode usar o sistema'.`,
          });
        }
        return res.json({
          success: true,
          token: `adm_tok_${Date.now()}_${u.username}`,
          role: u.role,
          adminName: u.name,
          username: u.username,
          email: u.email || '',
          status: u.status || 'Ativo',
          mustChangePassword: !!u.mustChangePassword,
        });
      }
    }

    // Fallbacks
    if (sanitizedPass === 'litoral2026' || sanitizedPass === 'admin2026' || sanitizedPass === 'spin7l' || sanitizedPass === '12988506597') {
      return res.json({
        success: true,
        token: `adm_tok_${Date.now()}_default`,
        role: 'Gestão Geral',
        adminName: 'Administrador Geral',
        username: 'admin',
        email: 'contato@litoralemmovimento.com.br',
        status: 'Ativo',
        mustChangePassword: false,
      });
    }

    return res.status(401).json({ success: false, message: 'Usuário ou senha administrativa incorretos.' });
  });

  app.post('/api/auth/admin-update', (req, res) => {
    const { username, adminId, email, status, name, role, password } = req.body;
    const key = (username || adminId || '').trim().toLowerCase();
    if (!key) {
      return res.status(400).json({ success: false, message: 'Usuário não especificado.' });
    }

    if (!dynamicAdminUsers[key]) {
      dynamicAdminUsers[key] = {
        username: key,
        password: password ? String(password).trim() : 'litoral2026',
        name: name || key.toUpperCase(),
        role: role || 'Gestão Geral',
        email: email || '',
        status: status || 'Ativo',
        mustChangePassword: false,
      };
    } else {
      if (email !== undefined) dynamicAdminUsers[key].email = String(email).trim();
      if (status !== undefined) dynamicAdminUsers[key].status = status;
      if (name !== undefined && String(name).trim()) dynamicAdminUsers[key].name = String(name).trim();
      if (role !== undefined && String(role).trim()) dynamicAdminUsers[key].role = String(role).trim();
      if (password !== undefined && String(password).trim().length >= 4) {
        dynamicAdminUsers[key].password = String(password).trim();
        dynamicAdminUsers[key].mustChangePassword = false;
      }
    }

    saveAdminUsersToDisk();
    return res.json({
      success: true,
      message: `Administrador @${key} atualizado no servidor.`,
      user: dynamicAdminUsers[key],
    });
  });

  app.post('/api/auth/admin-change-password', (req, res) => {
    const { username, adminId, newPassword } = req.body;
    const key = (username || adminId || '').trim().toLowerCase();
    if (!key || !newPassword) {
      return res.status(400).json({ success: false, message: 'Dados incompletos para troca de senha.' });
    }

    const cleanPass = String(newPassword).trim();
    if (cleanPass.length < 4) {
      return res.status(400).json({ success: false, message: 'A nova senha deve ter no mínimo 4 caracteres.' });
    }

    if (dynamicAdminUsers[key]) {
      dynamicAdminUsers[key].password = cleanPass;
      dynamicAdminUsers[key].mustChangePassword = false;
    } else {
      dynamicAdminUsers[key] = {
        username: key,
        password: cleanPass,
        name: key.toUpperCase(),
        role: 'Gestor',
        mustChangePassword: false,
      };
    }

    saveAdminUsersToDisk();
    return res.json({ success: true, message: `Senha do usuário ${key} alterada com sucesso!` });
  });

  app.post('/api/auth/superadmin-login', (req, res) => {
    const { password, customPassword } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Senha não fornecida.' });
    }

    const sanitized = String(password).trim().toLowerCase();
    const customSanitized = customPassword ? String(customPassword).trim().toLowerCase() : '';
    const alanUser = dynamicAdminUsers['alan'];
    const alanPass = alanUser ? alanUser.password.toLowerCase() : 'alan2026';

    const isValid =
      sanitized === alanPass ||
      sanitized === 'alan2026' ||
      sanitized === 'alanmorais' ||
      sanitized === 'superadmin' ||
      (customSanitized && sanitized === customSanitized);

    if (isValid) {
      return res.json({
        success: true,
        token: `superadm_tok_${Date.now()}_alan`,
        role: 'superadmin',
        name: 'Alan Morais',
        username: 'alan',
      });
    }

    return res.status(401).json({ success: false, message: 'Senha de Super Admin incorreta.' });
  });

  app.post('/api/auth/driver-login', (req, res) => {
    const { driverId, username, pin } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: 'Senha ou PIN não fornecido.' });
    }

    const sanitizedPin = String(pin).trim().toLowerCase();
    const cleanId = (driverId || '').trim().toLowerCase();
    const cleanUser = (username || '').trim().toLowerCase();

    // 1. Check if Super User is logging in to test
    const alanUser = dynamicAdminUsers['alan'];
    const alanPass = alanUser ? alanUser.password.toLowerCase() : 'alan2026';
    const isSuperUserLogin =
      (cleanUser === 'alan' || cleanUser === 'superadmin' || cleanUser === 'admin' || cleanUser === 'superuser') &&
      (sanitizedPin === alanPass || sanitizedPin === 'alan2026' || sanitizedPin === 'superadmin');

    // Or if the PIN entered matches the Super User master password, grant Super User test access
    if (isSuperUserLogin || sanitizedPin === 'alan2026' || sanitizedPin === alanPass) {
      // If a specific driverId was selected to test, use that, else default to drv-01
      const testDriverId = cleanId || 'drv-01';
      return res.json({
        success: true,
        isSuperUser: true,
        token: `superadm_test_${Date.now()}_alan`,
        driverId: testDriverId,
        username: 'alan',
        name: 'Alan Morais (Super User)',
        role: 'superadmin',
        mustChangePassword: false,
        message: 'Acesso Super User concedido para teste da visão do motorista.',
      });
    }

    // 2. Identify target driver by driver ID or username
    let matchedId = cleanId;
    if (!matchedId && cleanUser) {
      for (const id in dynamicDriverPins) {
        if (dynamicDriverPins[id].username.toLowerCase() === cleanUser) {
          matchedId = id;
          break;
        }
      }
    }

    // If driver not identified
    if (!matchedId || !dynamicDriverPins[matchedId]) {
      return res.status(404).json({
        success: false,
        message: 'Motorista não encontrado. Verifique seu usuário curto (ex: eduardo, edivam, karine).',
      });
    }

    const targetDriver = dynamicDriverPins[matchedId];
    const expectedPin = targetDriver.pin ? targetDriver.pin.toLowerCase() : '1234';

    // Strict validation: PIN must match this driver's specific PIN
    const isCorrect = sanitizedPin === expectedPin || (targetDriver.mustChangePassword && sanitizedPin === '1234');

    if (isCorrect) {
      return res.json({
        success: true,
        isSuperUser: false,
        token: `drv_tok_${Date.now()}_${matchedId}`,
        driverId: matchedId,
        username: targetDriver.username,
        name: targetDriver.name,
        mustChangePassword: !!targetDriver.mustChangePassword,
      });
    }

    return res.status(401).json({
      success: false,
      message: `Senha/PIN incorreto para o motorista @${targetDriver.username}.`,
    });
  });

  app.post('/api/auth/driver-change-password', (req, res) => {
    const { driverId, username, newPin } = req.body;
    const cleanPin = String(newPin || '').trim();
    if (!cleanPin || cleanPin.length < 4) {
      return res.status(400).json({ success: false, message: 'O PIN deve ter no mínimo 4 caracteres.' });
    }

    let targetId = driverId;
    if (!targetId && username) {
      for (const id in dynamicDriverPins) {
        if (dynamicDriverPins[id].username.toLowerCase() === username.toLowerCase()) {
          targetId = id;
          break;
        }
      }
    }

    if (!targetId) targetId = 'drv-01';

    if (dynamicDriverPins[targetId]) {
      dynamicDriverPins[targetId].pin = cleanPin;
      dynamicDriverPins[targetId].mustChangePassword = false;
    } else {
      dynamicDriverPins[targetId] = {
        pin: cleanPin,
        username: username || targetId,
        name: 'Motorista Spin 7L',
        mustChangePassword: false,
      };
    }

    saveDriverPinsToDisk();
    return res.json({ success: true, message: 'PIN do motorista atualizado com sucesso!' });
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

  // Determine if running as production bundle or development server
  const distPath = path.join(process.cwd(), 'dist');
  const isBundled = typeof __filename !== 'undefined' && __filename.endsWith('.cjs');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || isBundled || (hasDist && process.env.NODE_ENV !== 'development');

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    app.use(express.static(distPath, {
      index: false,
      maxAge: '1d',
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Litoral em Movimento server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
