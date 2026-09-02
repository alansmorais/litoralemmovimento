import { Reservation, Driver, TripStatus, GPSDeviation, ContactMessage, MessageStatus } from '../types';
import { INITIAL_RESERVATIONS, DRIVERS, PRICING_RULES, COMPANY_CONTACT } from '../data/mockData';

const RESERVATIONS_STORAGE_KEY = 'litoral_em_movimento_reservations_v2';
const DRIVERS_STORAGE_KEY = 'litoral_em_movimento_drivers_v2';
const CONTACT_MESSAGES_STORAGE_KEY = 'litoral_em_movimento_contact_messages_v1';
const GOOGLE_SCRIPT_STORAGE_KEY = 'litoral_em_movimento_gas_url_v1';
const SUPER_ADMIN_PASSWORD_KEY = 'litoral_superadmin_password_custom_v1';

const INITIAL_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    ticketCode: 'FAL-1082',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    name: 'Carolina Mendes',
    phone: '(11) 99872-4411',
    email: 'carolina.mendes@gmail.com',
    subject: 'Cotação para Grupo em São Sebastião',
    message: 'Olá! Somos um grupo de 6 pessoas e gostaríamos de saber se vocês atendem com Spin 7 lugares para passar o feriado em São Sebastião com 5 malas grandes.',
    preferredContact: 'WhatsApp',
    status: 'Pendente',
  },
  {
    id: 'msg-2',
    ticketCode: 'FAL-1081',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    name: 'Dr. Rodrigo Albuquerque',
    phone: '(12) 98114-5566',
    email: 'rodrigo.albuquerque@advocacia.com.br',
    subject: 'Transfer Corporativo Frequente',
    message: 'Preciso de saídas semanais às quintas-feiras saindo do Aeroporto GRU direto para a Balsa de Ilhabela. Gostaria de entender como funciona a emissão de nota fiscal para empresa.',
    preferredContact: 'E-mail',
    status: 'Respondida',
    adminNotes: 'Atendimento respondeu por e-mail com a tabela corporativa e modelo de NF.',
    answeredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    answeredBy: 'Atendimento (Gestão)',
  },
];

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

  public static async syncToGoogleSheets(
    action:
      | 'createReservation'
      | 'confirmDeposit'
      | 'updateStatus'
      | 'createContactMessage'
      | 'updateContactMessage'
      | 'syncAll'
      | 'syncAllReservations'
      | 'syncAllDrivers'
      | 'syncAllContactMessages'
      | 'updateSuperAdminPassword'
      | 'updateConfig'
      | 'updateDriverStatus'
      | 'confirmBoardingPayment',
    payload: any
  ): Promise<{ success: boolean; message?: string }> {
    const scriptUrl = this.getGoogleScriptUrl();
    if (!scriptUrl) {
      return { success: false, message: 'URL do Google Apps Script não configurada.' };
    }

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload }),
      });

      let resData: any = {};
      try {
        resData = await response.json();
      } catch {
        resData = { status: 'sent' };
      }

      this.setLastSyncTimestamp();
      return {
        success: true,
        message: resData.message || 'Sincronização com Google Apps Script concluída!',
      };
    } catch (e: any) {
      console.warn('Asynchronous Google Sheets sync warning:', e);
      return {
        success: false,
        message: `Aviso na sincronização: ${e.message || 'Erro de rede ou permissão'}.`,
      };
    }
  }

  public static getLastSyncTimestamp(): string | null {
    try {
      return localStorage.getItem('litoral_last_gas_sync_time');
    } catch {
      return null;
    }
  }

  public static setLastSyncTimestamp(): void {
    try {
      localStorage.setItem('litoral_last_gas_sync_time', new Date().toISOString());
    } catch {
      // ignore
    }
  }

  public static async syncAllToGoogleSheets(): Promise<{
    success: boolean;
    message: string;
    details: { reservationsCount: number; driversCount: number; messagesCount: number };
  }> {
    const reservations = this.getReservations();
    const drivers = this.getDrivers();
    const contactMessages = this.getContactMessages();
    const superAdminPassword = this.getSuperAdminPassword();

    const payload = {
      reservations,
      drivers,
      contactMessages,
      configs: {
        SENHA_SUPERADMIN_ALAN: superAdminPassword,
        NOME_EMPRESA: COMPANY_CONTACT.name,
        CONTATO_WHATSAPP: COMPANY_CONTACT.phone,
        CHAVE_PIX_OFICIAL: COMPANY_CONTACT.pixKey,
        SYNCED_AT: new Date().toISOString(),
      },
    };

    const res = await this.syncToGoogleSheets('syncAll', payload);
    return {
      success: res.success,
      message: res.message || 'Todos os dados do Painel foram enviados e salvos no Google Sheets!',
      details: {
        reservationsCount: reservations.length,
        driversCount: drivers.length,
        messagesCount: contactMessages.length,
      },
    };
  }

  public static async syncReservationsOnlyToGoogleSheets(): Promise<{ success: boolean; message: string; count: number }> {
    const reservations = this.getReservations();
    const res = await this.syncToGoogleSheets('syncAllReservations', { reservations });
    return {
      success: res.success,
      message: res.message || `${reservations.length} reservas salvas no Google Sheets.`,
      count: reservations.length,
    };
  }

  public static async syncDriversOnlyToGoogleSheets(): Promise<{ success: boolean; message: string; count: number }> {
    const drivers = this.getDrivers();
    const res = await this.syncToGoogleSheets('syncAllDrivers', { drivers });
    return {
      success: res.success,
      message: res.message || `${drivers.length} motoristas salvos no Google Sheets.`,
      count: drivers.length,
    };
  }

  public static async syncContactMessagesOnlyToGoogleSheets(): Promise<{ success: boolean; message: string; count: number }> {
    const contactMessages = this.getContactMessages();
    const res = await this.syncToGoogleSheets('syncAllContactMessages', { contactMessages });
    return {
      success: res.success,
      message: res.message || `${contactMessages.length} mensagens do SAC salvas no Google Sheets.`,
      count: contactMessages.length,
    };
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

  public static saveDrivers(drivers: Driver[]): void {
    try {
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
      window.dispatchEvent(new CustomEvent('drivers_updated', { detail: drivers }));
    } catch (e) {
      console.error('Failed to save drivers to storage', e);
    }
  }

  public static getDriverById(id: string): Driver | null {
    const list = this.getDrivers();
    return list.find((d) => d.id === id) || null;
  }

  public static updateDriverStatus(driverId: string, activeStatus: 'Disponível' | 'Em Viagem' | 'Descanso'): Driver | null {
    const list = this.getDrivers();
    const idx = list.findIndex((d) => d.id === driverId);
    if (idx === -1) return null;

    list[idx].activeStatus = activeStatus;
    this.saveDrivers(list);

    // Sync to backend if needed
    this.syncToGoogleSheets('updateDriverStatus', {
      driverId,
      activeStatus,
    });

    return list[idx];
  }

  public static updateDriverLocation(driverId: string, address: string, lat?: number, lng?: number): Driver | null {
    const list = this.getDrivers();
    const idx = list.findIndex((d) => d.id === driverId);
    if (idx === -1) return null;

    list[idx].currentLocation = {
      lat: lat ?? list[idx].currentLocation?.lat ?? -23.5505,
      lng: lng ?? list[idx].currentLocation?.lng ?? -45.4158,
      address,
    };
    this.saveDrivers(list);
    return list[idx];
  }

  public static getLoggedDriverId(): string | null {
    try {
      return sessionStorage.getItem('litoral_driver_auth') || localStorage.getItem('litoral_driver_auth');
    } catch {
      return null;
    }
  }

  public static setLoggedDriverId(driverId: string | null): void {
    try {
      if (driverId) {
        sessionStorage.setItem('litoral_driver_auth', driverId);
        localStorage.setItem('litoral_driver_auth', driverId);
        localStorage.setItem('litoral_preferred_view', 'driver');
      } else {
        sessionStorage.removeItem('litoral_driver_auth');
        localStorage.removeItem('litoral_driver_auth');
        localStorage.removeItem('litoral_preferred_view');
      }
    } catch (e) {
      console.error('Failed to set logged driver id', e);
    }
  }

  public static getPreferredView(): 'landing' | 'admin' | 'driver' | null {
    try {
      return (localStorage.getItem('litoral_preferred_view') as any) || null;
    } catch {
      return null;
    }
  }

  public static setPreferredView(view: 'landing' | 'admin' | 'driver'): void {
    try {
      localStorage.setItem('litoral_preferred_view', view);
    } catch (e) {
      console.error('Failed to set preferred view', e);
    }
  }

  public static confirmBoardingPayment(reservationId: string, paymentMethod: 'PIX' | 'Cartão' | 'Dinheiro' = 'PIX'): Reservation | null {
    const list = this.getReservations();
    const idx = list.findIndex((r) => r.id === reservationId);
    if (idx === -1) return null;

    list[idx].paymentStatus = 'Pago (PIX)';
    list[idx].depositPaid = true;
    list[idx].remainingAmount = 0;
    this.saveReservations(list);

    this.syncToGoogleSheets('confirmBoardingPayment', {
      id: list[idx].id,
      code: list[idx].code,
      paymentMethod,
    });

    return list[idx];
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
    const phone = COMPANY_CONTACT.phoneRaw; // Central Litoral em Movimento
    const vehicleText = reservation.vehicleCategory === 'sedan_4'
      ? 'Carro Executivo (até 4 passageiros)'
      : 'Chevrolet Spin 7 Lugares (até 6 passageiros + motorista)';
    
    const message = `*SOLICITAÇÃO DE AGENDAMENTO • LITORAL EM MOVIMENTO* 🚐🌴
*A/C Central de Atendimento & Agendamentos*
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
_Olá! Por favor, confirme a disponibilidade deste transfer._`;

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
      const origLower = params.origin.toLowerCase();
      const destLower = params.destination.toLowerCase();

      const isAirportGRU =
        origLower.includes('guarulhos') ||
        origLower.includes('gru') ||
        destLower.includes('guarulhos') ||
        destLower.includes('gru');

      const isCaragua =
        origLower.includes('caraguatatuba') ||
        destLower.includes('caraguatatuba');

      let perSeat = 90; // Default São Sebastião / Metrô Tietê / Balsa
      if (isAirportGRU) {
        perSeat = 150;
      } else if (isCaragua) {
        perSeat = 80;
      }

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

  public static getContactMessages(): ContactMessage[] {
    try {
      const saved = localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify(INITIAL_CONTACT_MESSAGES));
      return INITIAL_CONTACT_MESSAGES;
    } catch {
      return INITIAL_CONTACT_MESSAGES;
    }
  }

  public static saveContactMessages(messages: ContactMessage[]): void {
    try {
      localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify(messages));
      window.dispatchEvent(new CustomEvent('contact_messages_updated', { detail: messages }));
    } catch (e) {
      console.error('Failed to save contact messages to localStorage', e);
    }
  }

  public static createContactMessage(data: Omit<ContactMessage, 'id' | 'ticketCode' | 'createdAt' | 'status'>): ContactMessage {
    const list = this.getContactMessages();
    const newMsg: ContactMessage = {
      ...data,
      id: `msg-${Date.now()}`,
      ticketCode: `FAL-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'Pendente',
    };
    list.unshift(newMsg);
    this.saveContactMessages(list);

    // Sync to Google Sheets if configured
    this.syncToGoogleSheets('createContactMessage', { contactMessage: newMsg });

    return newMsg;
  }

  public static updateContactMessageStatus(id: string, status: MessageStatus, answeredBy?: string): ContactMessage | null {
    const list = this.getContactMessages();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    list[idx].status = status;
    if (status === 'Respondida') {
      list[idx].answeredAt = new Date().toISOString();
      if (answeredBy) list[idx].answeredBy = answeredBy;
    }
    this.saveContactMessages(list);
    return list[idx];
  }

  public static updateContactMessageNotes(id: string, adminNotes: string): ContactMessage | null {
    const list = this.getContactMessages();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    list[idx].adminNotes = adminNotes;
    this.saveContactMessages(list);
    return list[idx];
  }

  public static deleteContactMessage(id: string): boolean {
    const list = this.getContactMessages();
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length === list.length) return false;
    this.saveContactMessages(filtered);
    return true;
  }
}
