import { Reservation, Driver, TripStatus, GPSDeviation } from '../types';
import { INITIAL_RESERVATIONS, DRIVERS, PRICING_RULES, COMPANY_CONTACT } from '../data/mockData';

const RESERVATIONS_STORAGE_KEY = 'litoral_em_movimento_reservations_v2';
const DRIVERS_STORAGE_KEY = 'litoral_em_movimento_drivers_v1';
const GOOGLE_SCRIPT_STORAGE_KEY = 'litoral_em_movimento_gas_url_v1';
const SUPER_ADMIN_PASSWORD_KEY = 'litoral_superadmin_password_custom_v1';

export class StorageService {
  public static getSuperAdminPassword(): string {
    try {
      const saved = localStorage.getItem(SUPER_ADMIN_PASSWORD_KEY);
      if (saved && saved.trim()) return saved.trim();
      return 'alan2026';
    } catch {
      return 'alan2026';
    }
  }

  public static async setSuperAdminPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const sanitized = newPassword.trim();
    if (!sanitized) {
      return { success: false, message: 'A nova senha não pode ser vazia.' };
    }

    try {
      localStorage.setItem(SUPER_ADMIN_PASSWORD_KEY, sanitized);
      
      // Async sync to Google Apps Script / Google Sheets
      const scriptUrl = this.getGoogleScriptUrl();
      if (scriptUrl) {
        try {
          await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'updateSuperAdminPassword',
              password: sanitized,
              key: 'SENHA_SUPERADMIN_ALAN',
            }),
          });
        } catch (e) {
          console.warn('Could not sync password to Google Sheets immediately:', e);
        }
      }

      return { success: true, message: 'Senha do Super Admin atualizada com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Erro ao salvar senha: ${err.message}` };
    }
  }

  public static async syncConfigFromGoogleSheets(): Promise<Record<string, string> | null> {
    const scriptUrl = this.getGoogleScriptUrl();
    if (!scriptUrl) return null;

    try {
      const getUrl = scriptUrl.includes('?') ? `${scriptUrl}&action=getConfig` : `${scriptUrl}?action=getConfig`;
      const res = await fetch(getUrl);
      if (!res.ok) return null;
      const configs = await res.json();
      if (configs && typeof configs === 'object') {
        if (configs['SENHA_SUPERADMIN_ALAN']) {
          localStorage.setItem(SUPER_ADMIN_PASSWORD_KEY, String(configs['SENHA_SUPERADMIN_ALAN']).trim());
        }
        return configs;
      }
      return null;
    } catch (e) {
      console.warn('Failed to fetch config from Google Sheets:', e);
      return null;
    }
  }

  public static verifySuperAdminPassword(input: string): boolean {
    const sanitized = input.trim().toLowerCase();
    const currentCustom = this.getSuperAdminPassword().toLowerCase();
    const fallbackList = ['alan2026', 'alanmorais', 'alanpkmorais', 'superadmin', 'alan@2026'];
    return sanitized === currentCustom || fallbackList.includes(sanitized);
  }

  public static getGoogleScriptUrl(): string {
    try {
      const saved = localStorage.getItem(GOOGLE_SCRIPT_STORAGE_KEY);
      if (saved) return saved.trim();
      const metaEnv = (import.meta as unknown as { env?: { VITE_GOOGLE_APPS_SCRIPT_URL?: string } }).env;
      return (metaEnv?.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim();
    } catch {
      return '';
    }
  }

  public static setGoogleScriptUrl(url: string): void {
    try {
      localStorage.setItem(GOOGLE_SCRIPT_STORAGE_KEY, url.trim());
      window.dispatchEvent(new CustomEvent('gas_url_updated', { detail: url.trim() }));
    } catch (e) {
      console.error('Failed to save Google Apps Script URL', e);
    }
  }

  public static async testGoogleScriptConnection(url?: string): Promise<{ success: boolean; message: string }> {
    const targetUrl = (url || this.getGoogleScriptUrl()).trim();
    if (!targetUrl) {
      return { success: false, message: 'Nenhuma URL do Google Apps Script configurada.' };
    }

    try {
      const pingUrl = targetUrl.includes('?') ? `${targetUrl}&action=ping` : `${targetUrl}?action=ping`;
      const res = await fetch(pingUrl, { method: 'GET' });
      if (!res.ok) {
        return { success: false, message: `Erro HTTP ${res.status}: ${res.statusText}` };
      }
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'Conexão com Google Sheets validada com sucesso!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Falha na conexão: ${err.message || 'Verifique se a implantação do Apps Script está pública para "Qualquer pessoa"'}.`,
      };
    }
  }

  public static async syncToGoogleSheets(action: 'createReservation' | 'confirmDeposit' | 'updateStatus', payload: any): Promise<void> {
    const scriptUrl = this.getGoogleScriptUrl();
    if (!scriptUrl) return;

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload }),
      });
    } catch (e) {
      console.warn('Asynchronous Google Sheets sync warning:', e);
    }
  }

  public static async fetchFromGoogleSheets(): Promise<Reservation[] | null> {
    const scriptUrl = this.getGoogleScriptUrl();
    if (!scriptUrl) return null;

    try {
      const getUrl = scriptUrl.includes('?') ? `${scriptUrl}&action=getReservations` : `${scriptUrl}?action=getReservations`;
      const res = await fetch(getUrl);
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data)) {
        this.saveReservations(data);
        return data;
      }
      return null;
    } catch (e) {
      console.warn('Failed to fetch reservations from Google Sheets:', e);
      return null;
    }
  }

  public static getReservations(): Reservation[] {
    try {
      const data = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS));
        return INITIAL_RESERVATIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read reservations from storage', e);
      return INITIAL_RESERVATIONS;
    }
  }

  public static saveReservations(reservations: Reservation[]): void {
    try {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
      window.dispatchEvent(new CustomEvent('reservations_updated', { detail: reservations }));
    } catch (e) {
      console.error('Failed to save reservations to storage', e);
    }
  }

  public static getDrivers(): Driver[] {
    try {
      const data = localStorage.getItem(DRIVERS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(DRIVERS));
        return DRIVERS;
      }
      return JSON.parse(data);
    } catch (e) {
      return DRIVERS;
    }
  }

  public static addReservation(reservation: Omit<Reservation, 'id' | 'code' | 'createdAt'>): Reservation {
    const list = this.getReservations();
    const newCode = `LM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `res-${Date.now()}`;
    const totalPrice = reservation.totalPrice;
    const depositAmount = reservation.depositAmount ?? Number((totalPrice * 0.5).toFixed(2));
    const remainingAmount = reservation.remainingAmount ?? Number((totalPrice - depositAmount).toFixed(2));

    const newReservation: Reservation = {
      ...reservation,
      id: newId,
      code: newCode,
      depositAmount,
      remainingAmount,
      depositPaid: reservation.depositPaid ?? false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReservation, ...list];
    this.saveReservations(updated);

    // Asynchronously synchronize with Google Sheets if configured
    this.syncToGoogleSheets('createReservation', { reservation: newReservation });

    return newReservation;
  }

  public static confirmDepositPayment(
    reservationId: string,
    method: 'PIX' | 'Cartão' = 'PIX'
  ): Reservation | null {
    const list = this.getReservations();
    const index = list.findIndex((r) => r.id === reservationId || r.code === reservationId);
    if (index === -1) return null;

    list[index].depositPaid = true;
    list[index].paymentMethod = method;
    list[index].paymentStatus = 'Sinal 50% Pago (Confirmado)';
    if (list[index].status === 'Pendente') {
      list[index].status = 'Confirmado';
    }

    this.saveReservations(list);

    // Asynchronously synchronize with Google Sheets
    this.syncToGoogleSheets('confirmDeposit', {
      id: list[index].id,
      code: list[index].code,
      paymentMethod: method,
    });

    return list[index];
  }

  public static updateReservationStatus(id: string, status: TripStatus): Reservation | null {
    const list = this.getReservations();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return null;

    list[index].status = status;
    this.saveReservations(list);

    this.syncToGoogleSheets('updateStatus', {
      id: list[index].id,
      code: list[index].code,
      status,
    });

    return list[index];
  }

  public static assignDriver(reservationId: string, driverId: string): Reservation | null {
    const list = this.getReservations();
    const drivers = this.getDrivers();
    const reservationIndex = list.findIndex((r) => r.id === reservationId);
    if (reservationIndex === -1) return null;

    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
      list[reservationIndex].assignedDriverId = driver.id;
      list[reservationIndex].assignedDriverName = driver.name;
      list[reservationIndex].driverPhone = driver.phone;
      list[reservationIndex].driverVehicle = driver.vehicleModel;
      list[reservationIndex].driverPlate = driver.plate;
      if (list[reservationIndex].status === 'Pendente') {
        list[reservationIndex].status = 'Confirmado';
      }
    } else {
      list[reservationIndex].assignedDriverId = undefined;
      list[reservationIndex].assignedDriverName = undefined;
      list[reservationIndex].driverPhone = undefined;
      list[reservationIndex].driverVehicle = undefined;
      list[reservationIndex].driverPlate = undefined;
    }

    this.saveReservations(list);

    this.syncToGoogleSheets('updateStatus', {
      id: list[reservationIndex].id,
      code: list[reservationIndex].code,
      status: list[reservationIndex].status,
      driverName: list[reservationIndex].assignedDriverName,
      driverVehicle: list[reservationIndex].driverVehicle,
    });

    return list[reservationIndex];
  }

  public static addGpsDeviation(
    reservationId: string,
    deviation: GPSDeviation,
    applyToTotal: boolean = true
  ): Reservation | null {
    const list = this.getReservations();
    const index = list.findIndex((r) => r.id === reservationId);
    if (index === -1) return null;

    list[index].gpsDeviation = deviation;
    if (applyToTotal && deviation.calculatedSurcharge > 0) {
      list[index].totalPrice += deviation.calculatedSurcharge;
    }

    this.saveReservations(list);
    return list[index];
  }

  public static updateNotes(reservationId: string, internalNotes: string): Reservation | null {
    const list = this.getReservations();
    const index = list.findIndex((r) => r.id === reservationId);
    if (index === -1) return null;

    list[index].internalAdminNotes = internalNotes;
    this.saveReservations(list);
    return list[index];
  }

  public static resetToDefaults(): void {
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS));
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(DRIVERS));
    window.dispatchEvent(new CustomEvent('reservations_updated', { detail: INITIAL_RESERVATIONS }));
  }

  public static generateWhatsAppDeepLink(reservation: Reservation): string {
    const phone = COMPANY_CONTACT.phoneRaw; // Michelly: +55 12 98850-6597 (Central Litoral em Movimento)
    const vehicleText = reservation.vehicleCategory === 'sedan_4'
      ? 'Carro Executivo (até 4 passageiros)'
      : 'Chevrolet Spin 7 Lugares (até 6 passageiros + motorista)';
    
    const message = `*SOLICITAÇÃO DE AGENDAMENTO • LITORAL EM MOVIMENTO* 🚐🌴
*A/C Michelly (Atendimento & Agendamentos)*
================================
*Código da Reserva:* ${reservation.code}
*Nome:* ${reservation.customerName}
*WhatsApp:* ${reservation.customerPhone}
*E-mail:* ${reservation.customerEmail}

📍 *Origem:* ${reservation.origin} (${reservation.pickupAddress || reservation.originDetails || 'A combinar'})
📍 *Destino:* ${reservation.destination} (${reservation.dropoffAddress || reservation.destinationDetails || 'A combinar'})
📅 *Data:* ${reservation.date}
⏰ *Horário:* ${reservation.time}
👥 *Passageiros:* ${reservation.passengers} (${reservation.tripType === 'Individual' ? 'Privativo Exclusivo' : 'Shuttle Compartilhado'})
🧳 *Bagagens:* ${reservation.luggageCount} volumes
🚗 *Veículo Selecionado:* ${vehicleText}

${reservation.extraStops.length > 0 ? `🛑 *Paradas Extras:* ${reservation.extraStops.map((s) => s.address).join(', ')}\n` : ''}${reservation.flightNumber ? `✈️ *Nº do Voo:* ${reservation.flightNumber}\n` : ''}${reservation.notes ? `📝 *Observações:* ${reservation.notes}\n` : ''}💰 *Valor Estimado:* R$ ${reservation.totalPrice.toFixed(2).replace('.', ',')}
*Status:* ${reservation.status}
================================
_Olá Michelly! Por favor, confirme a disponibilidade deste transfer._`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  public static calculatePrice(params: {
    origin: string;
    destination: string;
    passengers: number;
    tripType: 'Individual' | 'Compartilhada';
    extraStopsCount: number;
    crossesBalsaIsland?: boolean;
    vehicleCategory?: 'spin_7' | 'sedan_4';
  }): { basePrice: number; stopsCost: number; totalPrice: number; depositAmount: number; remainingAmount: number } {
    const isLitoralToLitoral =
      (params.origin.includes('São Sebastião') || params.origin.includes('Ilhabela') || params.origin.includes('Caraguatatuba')) &&
      (params.destination.includes('São Sebastião') || params.destination.includes('Ilhabela') || params.destination.includes('Caraguatatuba'));

    const isIslandCrossing =
      params.destination.includes('Travessia') ||
      params.origin.includes('Travessia') ||
      params.crossesBalsaIsland === true;

    // Base private standard price is R$ 700,00
    let base = 700;

    // Crossing into Ilhabela with closed vehicle starts at R$ 900,00
    if (isIslandCrossing) {
      base = 900;
    }

    if (isLitoralToLitoral) {
      base = isIslandCrossing ? 450 : 250;
    }

    let calculatedBase = base;
    if (params.tripType === 'Compartilhada') {
      const perSeat = 180;
      calculatedBase = perSeat * Math.max(1, params.passengers);
    }

    const stopsCost = params.extraStopsCount * PRICING_RULES.extraStopFixedFee;
    const totalPrice = calculatedBase + stopsCost;
    const depositAmount = Number((totalPrice * 0.5).toFixed(2));
    const remainingAmount = Number((totalPrice - depositAmount).toFixed(2));

    return {
      basePrice: calculatedBase,
      stopsCost,
      totalPrice,
      depositAmount,
      remainingAmount,
    };
  }
}
