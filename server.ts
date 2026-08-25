import express from 'express';
import path from 'path';
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

// In-memory backing store for server-side persistence & sync
interface ServerReservation {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  tripType: string;
  status: string;
  totalPrice: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  createdAt: string;
}

const serverReservations: ServerReservation[] = [
  {
    id: 'res-101',
    code: 'LM-8921',
    customerName: 'Dra. Fernanda Albuquerque',
    customerPhone: '(11) 99123-4567',
    customerEmail: 'fernanda.albuquerque@clinica.med.br',
    origin: 'São Paulo (CGH)',
    destination: 'São Sebastião (Maresias)',
    date: '2026-08-26',
    time: '08:30',
    passengers: 4,
    tripType: 'Individual',
    status: 'Em andamento',
    totalPrice: 640,
    assignedDriverId: 'drv-01',
    assignedDriverName: 'Carlos Silva',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-102',
    code: 'LM-8922',
    customerName: 'Eduardo Guimarães & Família',
    customerPhone: '(11) 98234-5678',
    customerEmail: 'eduardo.guimaraes@techcorp.com.br',
    origin: 'São Paulo (GRU)',
    destination: 'Ilhabela (Curral)',
    date: '2026-08-26',
    time: '13:00',
    passengers: 5,
    tripType: 'Individual',
    status: 'Confirmado',
    totalPrice: 640,
    assignedDriverId: 'drv-02',
    assignedDriverName: 'Marcos Oliveira',
    createdAt: new Date().toISOString(),
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Litoral em Movimento API',
      timestamp: new Date().toISOString(),
      activeFleet: '2 x Chevrolet Spin Premier 7 Lugares',
    });
  });

  // Get reservations
  app.get('/api/reservations', (req, res) => {
    res.json({ success: true, count: serverReservations.length, data: serverReservations });
  });

  // Create new reservation
  app.post('/api/reservations', (req, res) => {
    const body = req.body;
    const code = `LM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReservation: ServerReservation = {
      id: `res-${Date.now()}`,
      code,
      customerName: body.customerName || 'Cliente Litoral',
      customerPhone: body.customerPhone || '',
      customerEmail: body.customerEmail || '',
      origin: body.origin || 'São Paulo',
      destination: body.destination || 'São Sebastião',
      date: body.date || '',
      time: body.time || '',
      passengers: Number(body.passengers) || 1,
      tripType: body.tripType || 'Individual',
      status: 'Pendente',
      totalPrice: Number(body.totalPrice) || 580,
      createdAt: new Date().toISOString(),
    };

    serverReservations.unshift(newReservation);

    res.status(201).json({
      success: true,
      message: 'Reserva registrada com sucesso.',
      data: newReservation,
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
