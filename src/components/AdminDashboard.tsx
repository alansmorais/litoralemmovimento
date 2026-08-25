import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Reservation, Driver, AdminAccount, TripStatus, GPSDeviation } from '../types';
import { ADMIN_ACCOUNTS, DRIVERS, PRICING_RULES } from '../data/mockData';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  MapPin,
  Car,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Phone,
  Mail,
  Edit,
  Save,
  Trash2,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  Navigation,
  HelpCircle,
  ChevronRight,
  Send,
  Eye,
  Check,
  AlertCircle,
  Database,
  Copy,
  ExternalLink,
  Lock,
  Sliders,
  Code2,
  Settings,
  ShieldAlert,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { SuperAdminAuthModal } from './SuperAdminAuthModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onOpenDriverView: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToSite,
  onOpenDriverView,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeAdmin, setActiveAdmin] = useState<AdminAccount>(ADMIN_ACCOUNTS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'reservations' | 'calendar' | 'stats' | 'gps-audit'>('reservations');

  // Selected reservation for modals
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [internalNoteDraft, setInternalNoteDraft] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [showSuperAdminAuthModal, setShowSuperAdminAuthModal] = useState(false);
  const [isSuperAdminUnlocked, setIsSuperAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('litoral_superadmin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const isAlanMorais = activeAdmin.name.toLowerCase().includes('alan') || activeAdmin.role === 'Super Admin';

  const handleOpenApiConnection = () => {
    if (isSuperAdminUnlocked) {
      setShowDevModal(true);
    } else {
      setShowSuperAdminAuthModal(true);
    }
  };

  // GPS Deviation simulation state for selected reservation
  const [simulatedDeviationKm, setSimulatedDeviationKm] = useState(8.5);
  const [selectedRateType, setSelectedRateType] = useState<'flat' | 'per_km'>('per_km');
  const [deviationReason, setDeviationReason] = useState('Parada extra solicitada pelo passageiro em São José dos Campos');

  // Sync / Export feedback
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Google Apps Script Database Integration State
  const [gasUrl, setGasUrl] = useState<string>(StorageService.getGoogleScriptUrl());
  const [isTestingGas, setIsTestingGas] = useState<boolean>(false);
  const [gasTestResult, setGasTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedGasCode, setCopiedGasCode] = useState<boolean>(false);
  const [newSuperAdminPassword, setNewSuperAdminPassword] = useState<string>('');
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [currentSuperAdminPassword, setCurrentSuperAdminPassword] = useState<string>(StorageService.getSuperAdminPassword());

  const handleUpdateSuperAdminPassword = async () => {
    if (!newSuperAdminPassword.trim()) return;
    setIsSavingPassword(true);
    setPasswordFeedback(null);
    const res = await StorageService.setSuperAdminPassword(newSuperAdminPassword.trim());
    setIsSavingPassword(false);
    setPasswordFeedback(res);
    if (res.success) {
      setCurrentSuperAdminPassword(newSuperAdminPassword.trim());
      setNewSuperAdminPassword('');
      setTimeout(() => setPasswordFeedback(null), 6000);
    }
  };

  const loadData = () => {
    setReservations(StorageService.getReservations());
    setDrivers(StorageService.getDrivers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('reservations_updated', handleUpdate);
    return () => window.removeEventListener('reservations_updated', handleUpdate);
  }, []);

  // Filtered reservations
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerPhone.includes(searchTerm) ||
      r.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDest = destinationFilter === 'all' || r.destination === destinationFilter;

    return matchesSearch && matchesStatus && matchesDest;
  });

  // Stats Calculations
  const totalBookings = reservations.length;
  const pendingBookings = reservations.filter((r) => r.status === 'Pendente').length;
  const confirmedBookings = reservations.filter((r) => r.status === 'Confirmado').length;
  const activeBookings = reservations.filter((r) => r.status === 'Em andamento' || r.status === 'A caminho').length;
  const completedBookings = reservations.filter((r) => r.status === 'Concluído').length;
  const totalRevenue = reservations.reduce((acc, curr) => acc + curr.totalPrice, 0);
  
  // 50% Deposit metrics
  const totalDepositReceived = reservations.reduce(
    (acc, curr) => (curr.depositPaid ? acc + (curr.depositAmount || curr.totalPrice * 0.5) : acc),
    0
  );
  const pendingDepositCount = reservations.filter((r) => !r.depositPaid && r.status !== 'Cancelado').length;

  const handleConfirmDeposit = (reservationId: string) => {
    StorageService.confirmDepositPayment(reservationId, 'PIX');
    loadData();
  };

  // Chart Data
  const destinationData = [
    {
      name: 'São Sebastião',
      value: reservations.filter((r) => r.destination === 'São Sebastião').length,
      fill: '#0284c7', // Sky 600
    },
    {
      name: 'Ilhabela',
      value: reservations.filter((r) => r.destination === 'Ilhabela').length,
      fill: '#0ea5e9', // Sky 500
    },
    {
      name: 'Caraguatatuba',
      value: reservations.filter((r) => r.destination === 'Caraguatatuba').length,
      fill: '#f59e0b', // Amber 500
    },
    {
      name: 'Retorno SP',
      value: reservations.filter((r) => r.destination === 'São Paulo').length,
      fill: '#475569', // Slate 600
    },
  ];

  const statusChartData = [
    { name: 'Pendente', count: pendingBookings },
    { name: 'Confirmado', count: confirmedBookings },
    { name: 'Em Rota', count: activeBookings },
    { name: 'Concluído', count: completedBookings },
  ];

  // Actions
  const handleStatusChange = (id: string, status: TripStatus) => {
    StorageService.updateReservationStatus(id, status);
    loadData();
  };

  const handleDriverAssign = (reservationId: string, driverId: string) => {
    StorageService.assignDriver(reservationId, driverId);
    loadData();
  };

  const handleSaveNotes = () => {
    if (!selectedReservation) return;
    StorageService.updateNotes(selectedReservation.id, internalNoteDraft);
    setShowNotesModal(false);
    loadData();
  };

  const handleApplyGpsDeviation = () => {
    if (!selectedReservation) return;
    const surcharge =
      selectedRateType === 'flat'
        ? PRICING_RULES.extraStopFixedFee
        : Number((simulatedDeviationKm * PRICING_RULES.offRouteKmRate).toFixed(2));

    const deviation: GPSDeviation = {
      detected: true,
      distanceKm: simulatedDeviationKm,
      detourLocation: 'Desvio fora da rota autorizada',
      rateType: selectedRateType,
      calculatedSurcharge: surcharge,
      approvedByAdmin: true,
      timestamp: new Date().toISOString(),
      reason: deviationReason,
    };

    StorageService.addGpsDeviation(selectedReservation.id, deviation, true);
    setShowGpsModal(false);
    loadData();
  };

  const handleSaveGasUrl = () => {
    StorageService.setGoogleScriptUrl(gasUrl);
    setSyncStatus('URL do Google Apps Script salva com sucesso!');
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleTestGasConnection = async () => {
    setIsTestingGas(true);
    setGasTestResult(null);
    const result = await StorageService.testGoogleScriptConnection(gasUrl);
    setIsTestingGas(false);
    setGasTestResult(result);
  };

  const handleImportFromGas = async () => {
    setSyncStatus('Importando dados da Planilha Google...');
    const result = await StorageService.fetchFromGoogleSheets();
    if (result && result.length > 0) {
      setSyncStatus(`Sucesso! ${result.length} reservas carregadas da planilha Google.`);
      loadData();
    } else {
      setSyncStatus('Nenhuma reserva encontrada na planilha ou erro de conexão.');
    }
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handleTriggerRemoteSetup = async () => {
    if (!gasUrl) {
      alert('Por favor, informe a URL do Google Apps Script primeiro.');
      return;
    }
    setSyncStatus('Executando criação remota de abas e cabeçalhos no Google Sheets...');
    try {
      const targetUrl = gasUrl.includes('?') ? `${gasUrl}&action=setup` : `${gasUrl}?action=setup`;
      const res = await fetch(targetUrl);
      const data = await res.json();
      if (data.status === 'success') {
        setSyncStatus('Sucesso! As 4 abas (Reservas, Motoristas, Dashboard, Configurações) foram criadas e formatadas na planilha.');
      } else {
        setSyncStatus('Comando enviado à planilha! Verifique sua planilha Google.');
      }
    } catch (err) {
      setSyncStatus('Comando de setup enviado para o Google Apps Script.');
    }
    setTimeout(() => setSyncStatus(null), 6000);
  };

  const handleCopyGasCode = () => {
    const codeSnippet = `/**
 * =======================================================================================
 * LITORAL EM MOVIMENTO - SISTEMA COMPLETO DE BANCO DE DADOS GOOGLE APPS SCRIPT
 * =======================================================================================
 * Cole este código completo no editor de Apps Script (Extensões -> Apps Script).
 * 
 * Abas automáticas criadas:
 * 1. "Reservas" (27 colunas, dropdowns, formatação de moeda R$, cores)
 * 2. "Motoristas" (Escala da frota Chevrolet Spin 7L)
 * 3. "Dashboard" (Fórmulas em tempo real de faturamento e sinais)
 * 4. "Configuracoes" (Dados da empresa, WhatsApp da Michelly, PIX)
 */

var SHEET_RESERVAS = 'Reservas';
var SHEET_MOTORISTAS = 'Motoristas';
var SHEET_DASHBOARD = 'Dashboard';
var SHEET_CONFIG = 'Configuracoes';

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🚕 Litoral em Movimento')
    .addItem('⚙️ 1. Criar / Formatar Todas as Abas e Cabeçalhos', 'setupAllSheets')
    .addItem('📊 2. Atualizar Fórmulas do Dashboard', 'setupDashboardSheet')
    .addSeparator()
    .addItem('🧪 3. Inserir Reserva de Teste', 'insertSampleReservation')
    .addItem('🧹 4. Limpar Dados de Teste', 'clearSampleData')
    .addToUi();
}

function setupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupReservasSheet(ss);
  setupMotoristasSheet(ss);
  setupConfigSheet(ss);
  setupDashboardSheet(ss);
  return { status: 'success', message: 'Todas as abas foram configuradas com sucesso!' };
}

function setupReservasSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_RESERVAS) || ss.insertSheet(SHEET_RESERVAS);
  var headers = [
    'ID Sistema', 'Código Voucher', 'Data Criação', 'Nome Cliente', 'Telefone (WhatsApp)', 'E-mail',
    'Origem', 'Detalhes Origem', 'Destino', 'Detalhes Destino', 'Data da Corrida', 'Horário de Embarque',
    'Qtd Passageiros', 'Tipo de Viagem', 'Malas', 'Cadeirinha Bebê', 'Valor Total (R$)', 'Sinal 50% (R$)',
    'Saldo no Embarque (R$)', 'Sinal 50% Pago?', 'Forma de Pagamento', 'Status Reserva', 'Status Pagamento',
    'Nº do Voo / Obs Aerop.', 'Motorista Atribuído', 'Veículo da Frota', 'Observações Internas'
  ];
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#0F172A').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);
  sheet.getRange('Q2:S').setNumberFormat('R$ #,##0.00');

  // Validações
  var ruleTipo = SpreadsheetApp.newDataValidation().requireValueInList(['Individual (Exclusivo)', 'Compartilhada'], true).build();
  sheet.getRange('N2:N').setDataValidation(ruleTipo);
  var ruleSimNao = SpreadsheetApp.newDataValidation().requireValueInList(['Sim', 'Não'], true).build();
  sheet.getRange('P2:P').setDataValidation(ruleSimNao);
  sheet.getRange('T2:T').setDataValidation(ruleSimNao);
  var ruleStatus = SpreadsheetApp.newDataValidation().requireValueInList(['Pendente', 'Confirmado', 'A caminho', 'Concluído', 'Cancelado'], true).build();
  sheet.getRange('V2:V').setDataValidation(ruleStatus);
  return sheet;
}

function setupMotoristasSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_MOTORISTAS) || ss.insertSheet(SHEET_MOTORISTAS);
  var headers = ['ID Motorista', 'Nome do Motorista', 'Telefone (WhatsApp)', 'E-mail', 'Veículo Oficial', 'Placa', 'Status Atual', 'Avaliação Média', 'Viagens Concluídas', 'Chave PIX Repasse'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground('#1E293B').setFontColor('#F8FAFC').setFontWeight('bold');
  sheet.setFrozenRows(1);
  if (sheet.getLastRow() <= 1) {
    sheet.appendRow(['drv-01', 'Carlos Silva', '(12) 98877-6655', 'carlos@litoralemmovimento.com.br', 'Chevrolet Spin Premier 7L', 'SP-LIT7A24', 'Disponível', 4.98, 342, '12988776655']);
    sheet.appendRow(['drv-02', 'Marcos Oliveira', '(11) 97654-3210', 'marcos@litoralemmovimento.com.br', 'Chevrolet Spin LTZ 7L', 'SP-MOV7B88', 'Disponível', 4.95, 289, '11976543210']);
  }
  return sheet;
}

function setupConfigSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CONFIG) || ss.insertSheet(SHEET_CONFIG);
  sheet.getRange(1, 1, 1, 3).setValues([['Chave de Configuração', 'Valor', 'Descrição']]).setBackground('#0F172A').setFontColor('#FFFFFF').setFontWeight('bold');
  sheet.setFrozenRows(1);
  if (sheet.getLastRow() <= 1) {
    sheet.appendRow(['NOME_EMPRESA', 'Litoral em Movimento Transfer Executivo', 'Nome oficial da empresa']);
    sheet.appendRow(['CONTATO_WHATSAPP', '(12) 98850-6597 (Michelly)', 'WhatsApp oficial de atendimento']);
    sheet.appendRow(['CHAVE_PIX_OFICIAL', '12988506597', 'Chave PIX para sinal 50%']);
    sheet.appendRow(['PERCENTUAL_SINAL', '50%', 'Exigência de 50% para reserva']);
    sheet.appendRow(['FROTA_OFICIAL', 'Chevrolet Spin 7 Lugares', 'Frota oficial']);
    sheet.appendRow(['SENHA_SUPERADMIN_ALAN', 'alan2026', 'Senha master Super Admin Alan Morais']);
    sheet.appendRow(['SENHA_ADMIN_MICHELLY', 'litoral2026', 'Senha de acesso Painel Admin']);
  }
  return sheet;
}

function setupDashboardSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_DASHBOARD) || ss.insertSheet(SHEET_DASHBOARD);
  sheet.clear();
  sheet.getRange('A1:C1').merge().setValue('📊 DASHBOARD EXECUTIVO - LITORAL EM MOVIMENTO').setBackground('#0F172A').setFontColor('#F59E0B').setFontWeight('bold').setFontSize(14).setHorizontalAlignment('center');
  var kpis = [
    ['Métrica Operacional', 'Resultado em Tempo Real', 'Fórmula Google Sheets'],
    ['Total de Reservas Registradas', '=COUNTA(Reservas!A2:A)', 'Total absoluto de vouchers'],
    ['Reservas Confirmadas (Sinal Pago)', '=COUNTIF(Reservas!V2:V; "Confirmado")', 'Viagens com sinal 50% pago'],
    ['Reservas Pendentes', '=COUNTIF(Reservas!V2:V; "Pendente")', 'Aguardando PIX'],
    ['Faturamento Bruto Total (R$)', '=SUM(Reservas!Q2:Q)', 'Valor total'],
    ['Sinais 50% Recebidos (R$)', '=SUMIFS(Reservas!R2:R; Reservas!T2:T; "Sim")', 'Créditos recebidos'],
    ['Saldos a Receber no Embarque (R$)', '=SUMIFS(Reservas!S2:S; Reservas!V2:V; "<>Cancelado")', 'A receber na Spin 7L']
  ];
  sheet.getRange(3, 1, kpis.length, 3).setValues(kpis);
  sheet.getRange('A3:C3').setBackground('#0F172A').setFontColor('#FFFFFF').setFontWeight('bold');
  sheet.getRange('B7:B9').setNumberFormat('R$ #,##0.00');
  return sheet;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getReservations';
  if (action === 'ping') return createJsonResponse({ status: 'ok', message: 'Google Apps Script conectado com sucesso!', version: '2.0' });
  if (action === 'setup') return createJsonResponse(setupAllSheets());
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (action === 'getConfig') {
    var sheetConf = ss.getSheetByName(SHEET_CONFIG) || setupConfigSheet(ss);
    var confData = sheetConf.getDataRange().getValues();
    var configs = {};
    for (var c = 1; c < confData.length; c++) {
      if (confData[c][0]) configs[confData[c][0]] = confData[c][1];
    }
    return createJsonResponse(configs);
  }
  var sheet = ss.getSheetByName(SHEET_RESERVAS) || setupReservasSheet(ss);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createJsonResponse([]);
  var reservations = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0] && !r[1]) continue;
    reservations.push({
      id: String(r[0]), code: String(r[1]), createdAt: String(r[2]),
      customerName: String(r[3]), customerPhone: String(r[4]), customerEmail: String(r[5] || ''),
      origin: String(r[6]), originDetails: String(r[7] || ''), destination: String(r[8]),
      destinationDetails: String(r[9] || ''), date: String(r[10]), time: String(r[11]),
      passengers: Number(r[12]) || 1, tripType: String(r[13] || 'Individual (Exclusivo)'), luggageCount: Number(r[14]) || 1,
      hasChildSeat: r[15] === true || String(r[15]).toLowerCase() === 'sim',
      totalPrice: Number(r[16]) || 0, depositAmount: Number(r[17]) || 0, remainingAmount: Number(r[18]) || 0,
      depositPaid: r[19] === true || String(r[19]).toLowerCase() === 'sim',
      paymentMethod: String(r[20] || 'PIX Copia e Cola'), status: String(r[21] || 'Pendente'),
      paymentStatus: String(r[22] || 'Aguardando Sinal 50%'), flightNumber: String(r[23] || ''),
      assignedDriverName: String(r[24] || ''), driverVehicle: String(r[25] || ''), notes: String(r[26] || '')
    });
  }
  return createJsonResponse(reservations);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_RESERVAS) || setupReservasSheet(ss);
  try {
    var payload = {};
    if (e.postData && e.postData.contents) payload = JSON.parse(e.postData.contents);
    else if (e.parameter) payload = e.parameter;
    var action = payload.action || 'createReservation';

    if (action === 'createReservation') {
      var res = payload.reservation || payload;
      var newId = res.id || ('res-' + new Date().getTime());
      var newCode = res.code || ('LM-' + Math.floor(1000 + Math.random() * 9000));
      var totalPrice = Number(res.totalPrice) || 0;
      var depositAmount = res.depositAmount ? Number(res.depositAmount) : Number((totalPrice * 0.5).toFixed(2));
      var remainingAmount = res.remainingAmount ? Number(res.remainingAmount) : Number((totalPrice - depositAmount).toFixed(2));
      sheet.appendRow([
        newId, newCode, res.createdAt || new Date().toISOString(),
        res.customerName || '', res.customerPhone || '', res.customerEmail || '',
        res.origin || '', res.originDetails || '', res.destination || '', res.destinationDetails || '',
        res.date || '', res.time || '', res.passengers || 1, res.tripType || 'Individual (Exclusivo)',
        res.luggageCount || 1, res.hasChildSeat ? 'Sim' : 'Não',
        totalPrice, depositAmount, remainingAmount, res.depositPaid ? 'Sim' : 'Não',
        res.paymentMethod || 'PIX Copia e Cola', res.status || 'Pendente', res.paymentStatus || 'Aguardando Sinal 50%',
        res.flightNumber || '', res.assignedDriverName || '', res.driverVehicle || '', res.notes || ''
      ]);
      return createJsonResponse({ status: 'success', message: 'Reserva gravada no Google Sheets!' });
    }

    if (action === 'confirmDeposit') {
      var targetId = String(payload.id || payload.code || '');
      var rows = sheet.getDataRange().getValues();
      for (var k = 1; k < rows.length; k++) {
        if (String(rows[k][0]) === targetId || String(rows[k][1]) === targetId) {
          sheet.getRange(k + 1, 20).setValue('Sim');
          if (payload.paymentMethod) sheet.getRange(k + 1, 21).setValue(payload.paymentMethod);
          sheet.getRange(k + 1, 22).setValue('Confirmado');
          sheet.getRange(k + 1, 23).setValue('Sinal 50% Pago (Confirmado)');
          break;
        }
      }
      return createJsonResponse({ status: 'success', message: 'Sinal de 50% confirmado!' });
    }

    if (action === 'updateSuperAdminPassword' || action === 'updateConfig') {
      var sheetConf = ss.getSheetByName(SHEET_CONFIG) || setupConfigSheet(ss);
      var configKey = payload.key || 'SENHA_SUPERADMIN_ALAN';
      var newValue = String(payload.password || payload.value || '');
      var confData = sheetConf.getDataRange().getValues();
      var keyFound = false;
      for (var p = 1; p < confData.length; p++) {
        if (String(confData[p][0]).trim() === configKey.trim()) {
          sheetConf.getRange(p + 1, 2).setValue(newValue);
          keyFound = true;
          break;
        }
      }
      if (!keyFound) {
        sheetConf.appendRow([configKey, newValue, 'Atualizado via Painel Admin']);
      }
      return createJsonResponse({ status: 'success', message: 'Senha atualizada na planilha Google Sheets!' });
    }

    if (action === 'setup') return createJsonResponse(setupAllSheets());
    return createJsonResponse({ status: 'error', message: 'Ação desconhecida: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

    navigator.clipboard.writeText(codeSnippet);
    setCopiedGasCode(true);
    setTimeout(() => setCopiedGasCode(false), 3000);
  };

  const handleSyncGoogleSheets = async () => {
    setSyncStatus('Sincronizando todas as reservas com Google Sheets...');
    for (const res of reservations) {
      await StorageService.syncToGoogleSheets('createReservation', { reservation: res });
    }
    setSyncStatus(`Sucesso: ${reservations.length} reservas sincronizadas.`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const exportCSV = () => {
    const headers = ['Código', 'Cliente', 'WhatsApp', 'Email', 'Origem', 'Destino', 'Data', 'Hora', 'Passageiros', 'Tipo', 'Motorista', 'Valor', 'Status'];
    const rows = reservations.map((r) => [
      r.code,
      `"${r.customerName}"`,
      r.customerPhone,
      r.customerEmail,
      `"${r.origin}"`,
      `"${r.destination}"`,
      r.date,
      r.time,
      r.passengers,
      r.tripType,
      r.assignedDriverName || 'Não atribuído',
      r.totalPrice.toFixed(2),
      r.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `litoral_em_movimento_reservas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top Admin Navigation Bar */}
      <div className="bg-slate-950 text-slate-100 border-b border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-display font-extrabold text-xl text-white">
                  Painel de Controle Administrativo
                </h1>
                <span className="bg-sky-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Gestão de Frota
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Litoral em Movimento • São Paulo ⇌ Litoral Norte (Spin 7 Lugares)
              </p>
            </div>
          </div>

          {/* Admin Account Switcher & Actions */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Account dropdown */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              <img
                src={activeAdmin.avatarUrl}
                alt={activeAdmin.name}
                className="w-6 h-6 rounded-full object-cover border border-amber-400"
              />
              <div>
                <span className="font-bold text-white block leading-tight">{activeAdmin.name}</span>
                <span className="text-[10px] text-amber-400 font-semibold">{activeAdmin.role}</span>
              </div>
              <select
                value={activeAdmin.id}
                onChange={(e) => {
                  const selected = ADMIN_ACCOUNTS.find((a) => a.id === e.target.value);
                  if (selected) setActiveAdmin(selected);
                }}
                className="bg-transparent text-slate-200 outline-none ml-1 cursor-pointer"
                title="Trocar conta de administrador"
              >
                {ADMIN_ACCOUNTS.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {acc.name} ({acc.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Driver App Launch */}
            <button
              onClick={onOpenDriverView}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Ver App do Motorista</span>
            </button>

            {/* Developer / Technical API Settings - Only visible / accessible for Super Admin Alan Morais */}
            {isAlanMorais && (
              <button
                onClick={handleOpenApiConnection}
                className="bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Acesso restrito ao Super Admin Alan Morais com senha master"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Conexão API</span>
              </button>
            )}

            {/* Back / Logout */}
            <button
              onClick={onBackToSite}
              className="bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Encerrar sessão de administrador e bloquear painel"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bloquear / Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Sync notification banner if active */}
        {syncStatus && (
          <div className="bg-sky-600 text-white px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-medium shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{syncStatus}</span>
            </div>
            <button onClick={() => setSyncStatus(null)} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
              Total Reservas
            </span>
            <div className="font-serif-display font-extrabold text-2xl text-slate-900 mt-1">
              {totalBookings}
            </div>
            <span className="text-[10px] text-slate-500">Histórico completo</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
            <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold block">
              Aguardando Sinal
            </span>
            <div className="font-serif-display font-extrabold text-2xl text-amber-600 mt-1">
              {pendingDepositCount}
            </div>
            <span className="text-[10px] text-amber-700">Sinal 50% pendente</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-sky-200 shadow-xs">
            <span className="text-[10px] text-sky-800 uppercase tracking-wider font-bold block">
              Sinais Confirmados
            </span>
            <div className="font-serif-display font-extrabold text-2xl text-sky-600 mt-1">
              {confirmedBookings}
            </div>
            <span className="text-[10px] text-sky-700">Prontas para saída</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-purple-200 shadow-xs">
            <span className="text-[10px] text-purple-800 uppercase tracking-wider font-bold block">
              Em Viagem
            </span>
            <div className="font-serif-display font-extrabold text-2xl text-purple-700 mt-1">
              {activeBookings}
            </div>
            <span className="text-[10px] text-purple-600">Com motorista na pista</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
            <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold block">
              Sinais Arrecadados
            </span>
            <div className="font-serif-display font-extrabold text-xl text-emerald-600 mt-1">
              R$ {totalDepositReceived.toFixed(2).replace('.', ',')}
            </div>
            <span className="text-[10px] text-emerald-700">50% pago via PIX/Cartão</span>
          </div>

          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl border border-slate-800 shadow-md">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Receita Total
            </span>
            <div className="font-serif-display font-extrabold text-xl text-amber-400 mt-1">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </div>
            <span className="text-[10px] text-slate-400">2x Spin 7 Lugares</span>
          </div>
        </div>

        {/* Tab Navigation & Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reservations'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📋 Tabela de Reservas ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📅 Calendário de Viagens
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📊 Métricas & Destinos
            </button>
            <button
              onClick={() => setActiveTab('gps-audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gps-audit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🛰️ Auditoria de Rota & GPS
            </button>
          </div>

          {/* Export & Sync buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={exportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Baixar Planilha CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleSyncGoogleSheets}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Sincronizar reservas atuais com a planilha Google Sheets"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* TAB 1: RESERVATIONS TABLE */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, código (LM-...), telefone ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-sky-500"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Pendente">Pendentes</option>
                  <option value="Confirmado">Confirmadas</option>
                  <option value="A caminho">A caminho</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluídas</option>
                  <option value="Cancelado">Canceladas</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">Todos os Destinos</option>
                  <option value="São Sebastião">São Sebastião</option>
                  <option value="Ilhabela">Ilhabela</option>
                  <option value="Caraguatatuba">Caraguatatuba</option>
                  <option value="São Paulo">São Paulo (Retorno)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-200 text-[11px] uppercase tracking-wider font-bold border-b border-slate-800">
                      <th className="py-3.5 px-4">Código / Data</th>
                      <th className="py-3.5 px-4">Cliente / Contato</th>
                      <th className="py-3.5 px-4">Rota & Horário</th>
                      <th className="py-3.5 px-4">Passageiros</th>
                      <th className="py-3.5 px-4">Motorista Atribuído</th>
                      <th className="py-3.5 px-4">Valor</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          Nenhuma reserva encontrada para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((res) => (
                        <tr
                          key={res.id}
                          className="hover:bg-slate-50 transition-colors group"
                        >
                          {/* Code & Created */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {res.code}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-1">
                              {new Date(res.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <strong className="text-slate-900 block">{res.customerName}</strong>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                              <a
                                href={`https://wa.me/55${res.customerPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 hover:underline flex items-center gap-0.5 font-medium"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{res.customerPhone}</span>
                              </a>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                              {res.customerEmail}
                            </span>
                          </td>

                          {/* Route & Time */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {res.origin} ➔ {res.destination}
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-amber-500" />
                              <span>{res.date}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3 text-sky-600" />
                              <span>{res.time}</span>
                            </div>
                            {res.extraStops.length > 0 && (
                              <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                                +{res.extraStops.length} Parada(s)
                              </span>
                            )}
                          </td>

                          {/* Passengers & Type */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900">
                              {res.passengers} pessoa(s)
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              {res.tripType} • {res.luggageCount} malas
                            </span>
                          </td>

                          {/* Driver Assign */}
                          <td className="py-3.5 px-4">
                            <select
                              value={res.assignedDriverId || ''}
                              onChange={(e) => handleDriverAssign(res.id, e.target.value)}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold border outline-none cursor-pointer ${
                                res.assignedDriverId
                                  ? 'bg-slate-900 text-white border-amber-400'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="">⚠️ Não Atribuído</option>
                              {drivers.map((drv) => (
                                <option key={drv.id} value={drv.id}>
                                  👤 {drv.name} (Spin {drv.plate.slice(-4)})
                                </option>
                              ))}
                            </select>
                            {res.assignedDriverName && (
                              <span className="block text-[10px] text-slate-500 mt-0.5">
                                {res.driverVehicle}
                              </span>
                            )}
                          </td>

                          {/* Price & 50% Deposit Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 font-serif-display text-sm">
                                R$ {res.totalPrice.toFixed(2).replace('.', ',')}
                              </strong>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                              <div className="flex items-center gap-1">
                                <span>Sinal (50%): R$ {(res.depositAmount || res.totalPrice * 0.5).toFixed(2).replace('.', ',')}</span>
                                {res.depositPaid ? (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                    ✓ Pago
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleConfirmDeposit(res.id)}
                                    className="text-[9px] bg-amber-100 hover:bg-emerald-600 hover:text-white text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300 transition-colors cursor-pointer"
                                    title="Marcar sinal de 50% como recebido"
                                  >
                                    + Confirmar Sinal
                                  </button>
                                )}
                              </div>
                              <span className="block text-slate-400">
                                Saldo: R$ {(res.remainingAmount || res.totalPrice * 0.5).toFixed(2).replace('.', ',')} (Embarque)
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <select
                              value={res.status}
                              onChange={(e) => handleStatusChange(res.id, e.target.value as TripStatus)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border outline-none cursor-pointer ${
                                res.status === 'Pendente'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : res.status === 'Confirmado'
                                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                                  : res.status === 'Em andamento' || res.status === 'A caminho'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : res.status === 'Concluído'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-red-100 text-red-800 border-red-300'
                              }`}
                            >
                              <option value="Pendente">⏳ Pendente</option>
                              <option value="Confirmado">✅ Confirmado</option>
                              <option value="A caminho">🚗 A caminho</option>
                              <option value="Em andamento">🛣️ Em andamento</option>
                              <option value="Concluído">🏁 Concluído</option>
                              <option value="Cancelado">❌ Cancelado</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Internal notes button */}
                              <button
                                onClick={() => {
                                  setSelectedReservation(res);
                                  setInternalNoteDraft(res.internalAdminNotes || '');
                                  setShowNotesModal(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                                title="Anotações internas"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {/* GPS Deviation Audit button */}
                              <button
                                onClick={() => {
                                  setSelectedReservation(res);
                                  setShowGpsModal(true);
                                }}
                                className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-200 cursor-pointer transition-colors"
                                title="Auditar Rota GPS & Desvios"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                              </button>

                              {/* Direct WhatsApp link */}
                              <a
                                href={StorageService.generateWhatsAppDeepLink(res)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                title="Abrir WhatsApp com dados preenchidos"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span>Escala & Cronograma de Viagens</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visualização de saídas programadas e alocação da frota Chevrolet Spin 7 Lugares.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-900" /> Motorista 1 (Carlos)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-sky-600" /> Motorista 2 (Marcos)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" /> Pendente de Alocação
                </span>
              </div>
            </div>

            {/* Schedule List sorted by Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reservations
                .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
                .map((trip) => (
                  <div
                    key={trip.id}
                    className={`p-4 rounded-2xl border transition-all shadow-xs ${
                      trip.assignedDriverId === 'drv-01'
                        ? 'border-slate-300 bg-slate-50'
                        : trip.assignedDriverId === 'drv-02'
                        ? 'border-sky-300 bg-sky-50/50'
                        : 'border-amber-300 bg-amber-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                        {trip.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {trip.date} às {trip.time}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{trip.customerName}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      📍 {trip.origin} ➔ {trip.destination}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="text-slate-500">
                        {trip.assignedDriverName ? `👤 ${trip.assignedDriverName}` : '⚠️ Sem Motorista'}
                      </span>
                      <span className="font-bold text-slate-900">
                        R$ {trip.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: STATS & CHARTS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-serif-display font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Distribuição por Destino</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={destinationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {destinationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-serif-display font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Volume por Status Operacional</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0284c7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GPS ROUTE & DEVIATION AUDIT */}
        {activeTab === 'gps-audit' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Monitoramento de Rota Estrita & Desvios</span>
              </div>
              <h3 className="font-serif-display font-extrabold text-2xl text-slate-900">
                Cálculo de Desvios Fora da Rota (Sem Taxímetro)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Conforme solicitado: O motorista segue uma rota estrita pré-definida. Qualquer desvio fora da rota (parada extra, rota alternativa solicitada pelo cliente) pode ser cobrado como <strong>Taxa Fixa (Flat Rate de R$ 50,00)</strong> ou <strong>Por KM Excedente (R$ 4,50/km)</strong> baseado no GPS do app.
              </p>
            </div>

            {/* Interactive Calculator Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900">
                  Simulador de Auditoria de Desvio GPS
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selecione a Reserva para Auditar:
                  </label>
                  <select
                    value={selectedReservation?.id || ''}
                    onChange={(e) => {
                      const found = reservations.find((r) => r.id === e.target.value);
                      setSelectedReservation(found || null);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  >
                    <option value="">Selecione uma viagem...</option>
                    {reservations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} • {r.customerName} ({r.origin} ➔ {r.destination})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      KM de Desvio Detectado pelo GPS:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={simulatedDeviationKm}
                      onChange={(e) => setSimulatedDeviationKm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Método de Cobrança:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRateType('per_km')}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border ${
                          selectedRateType === 'per_km'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        R$ 4,50 / km
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRateType('flat')}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border ${
                          selectedRateType === 'flat'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Fixo R$ 50,00
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motivo do Desvio / Parada:
                  </label>
                  <input
                    type="text"
                    value={deviationReason}
                    onChange={(e) => setDeviationReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                    placeholder="Ex: Parada em farmácia ou desvio para pegar segundo passageiro"
                  />
                </div>

                <button
                  onClick={handleApplyGpsDeviation}
                  disabled={!selectedReservation}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprovar Desvio e Atualizar Cobrança da Viagem</span>
                </button>
              </div>

              {/* Summary Card */}
              <div className="lg:col-span-5 bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
                <h4 className="font-serif-display font-bold text-base text-white border-b border-slate-800 pb-2">
                  Resultado do Cálculo Automático
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Viagem Base:</span>
                    <span className="text-white font-medium">
                      {selectedReservation?.code || 'Nenhuma selecionada'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Valor Original:</span>
                    <span className="text-white font-medium">
                      R$ {selectedReservation ? selectedReservation.basePrice.toFixed(2) : '0,00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Adicional Calculado:</span>
                    <span className="text-amber-400 font-bold text-sm">
                      + R${' '}
                      {(selectedRateType === 'flat'
                        ? PRICING_RULES.extraStopFixedFee
                        : simulatedDeviationKm * PRICING_RULES.offRouteKmRate
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
                    <span className="text-white">Novo Total:</span>
                    <span className="text-amber-400">
                      R${' '}
                      {(
                        (selectedReservation?.basePrice || 0) +
                        (selectedRateType === 'flat'
                          ? PRICING_RULES.extraStopFixedFee
                          : simulatedDeviationKm * PRICING_RULES.offRouteKmRate)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  💡 <strong>Vantagem sem Taxímetro:</strong> O cliente e o motorista mantêm a previsibilidade de um transfer executivo com valor fechado, enquanto desvios reais registrados via GPS são tarifados de forma justa e transparente.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discreet Developer Footer Link - Only visible for Super Admin Alan Morais */}
        {isAlanMorais && (
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Litoral em Movimento</span>
              <span>•</span>
              <span>Painel Operacional do Gestor</span>
            </div>
            <button
              onClick={handleOpenApiConnection}
              className="text-slate-500 hover:text-amber-600 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-amber-50/50 transition-colors cursor-pointer border border-transparent hover:border-amber-200"
              title="Acesso restrito ao Super Admin Alan Morais com senha master"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Configurações Técnicas & API (Alan Morais)</span>
            </button>
          </div>
        )}
      </div>

      {/* SUPER ADMIN PASSWORD AUTH MODAL FOR ALAN MORAIS */}
      <SuperAdminAuthModal
        isOpen={showSuperAdminAuthModal}
        onClose={() => setShowSuperAdminAuthModal(false)}
        onSuccess={() => {
          setIsSuperAdminUnlocked(true);
          setShowSuperAdminAuthModal(false);
          setShowDevModal(true);
        }}
      />

      {/* DEVELOPER SETTINGS MODAL (HIDDEN FROM REGULAR CLIENT VIEW) */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-4 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Área Técnica • Super Admin Alan Morais</span>
                </div>
                <h3 className="font-serif-display font-extrabold text-2xl text-slate-900">
                  Integração com Google Sheets & API
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Painel de infraestrutura para configurar o Google Apps Script como backend gratuito do app.
                </p>
              </div>

              <button
                onClick={() => setShowDevModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-600 font-medium">Sincronização Direta com Planilha:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleImportFromGas}
                  className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Puxar da Planilha</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncGoogleSheets}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Sincronizar Todas</span>
                </button>
              </div>
            </div>

            {/* Connection Configuration Box */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🔗
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">URL do App da Web (Google Apps Script)</h4>
                    <span className="text-[11px] text-slate-400">URL de execução da API (termina com /exec)</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${gasUrl ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {gasUrl ? '● Conexão Ativa' : '○ Não configurado'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestGasConnection}
                  disabled={isTestingGas || !gasUrl}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  {isTestingGas ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{isTestingGas ? 'Testando...' : 'Testar Conexão'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleTriggerRemoteSetup}
                  disabled={!gasUrl}
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title="Executa a criação automática das 4 abas (Reservas, Motoristas, Dashboard, Configurações) na sua planilha Google"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Criar Abas no Sheets</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveGasUrl}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
              </div>

              {gasTestResult && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${gasTestResult.success ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-red-950/60 border-red-500/50 text-red-300'}`}>
                  {gasTestResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  <span>{gasTestResult.message}</span>
                </div>
              )}
            </div>

            {/* Super Admin Password Management & Database Hosting */}
            <div className="bg-amber-50/80 border border-amber-300/70 p-5 sm:p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        Senha Master do Super Admin (Alan Morais)
                      </h4>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        Hospedada na Planilha
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Esta senha protege o acesso técnico da API. Fica salva na aba <strong>Configuracoes</strong> do Sheets (chave <code className="bg-white px-1 py-0.5 rounded font-mono text-slate-800 border border-amber-200">SENHA_SUPERADMIN_ALAN</code>).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <input
                  type="text"
                  placeholder={`Digite a nova senha (senha atual ativa: ${currentSuperAdminPassword})`}
                  value={newSuperAdminPassword}
                  onChange={(e) => setNewSuperAdminPassword(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-500 font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleUpdateSuperAdminPassword}
                  disabled={isSavingPassword || !newSuperAdminPassword.trim()}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {isSavingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSavingPassword ? 'Salvando...' : 'Salvar & Sincronizar Senha'}</span>
                </button>
              </div>

              {passwordFeedback && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${passwordFeedback.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                  {passwordFeedback.success ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  <span>{passwordFeedback.message}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-700 bg-white/90 p-3.5 rounded-xl border border-amber-200 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <span>💡 Onde alterar a senha diretamente na Planilha Google (Sem abrir o código):</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Abra a sua planilha vinculada no Google Sheets → Clique na aba <strong>Configuracoes</strong> → Localize a linha com <code>SENHA_SUPERADMIN_ALAN</code> e mude o texto na coluna B (Valor). Ao salvar a planilha, a API passa a responder com a nova senha imediatamente!
                </p>
              </div>
            </div>

            {/* Quick Copy Script Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>Código do Google Apps Script (Code.gs)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Arquivo disponível em <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">/google-apps-script/Code.gs</code>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyGasCode}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copiedGasCode ? '✓ Código Copiado!' : 'Copiar Código .GS'}</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto border border-slate-800 leading-relaxed">
                <pre>{`/**
 * LITORAL EM MOVIMENTO - GOOGLE APPS SCRIPT DATABASE BACKEND
 * Cole este código em: Google Sheets -> Extensões -> Apps Script
 * Implante como: Web App (Executar como: Eu, Quem tem acesso: Qualquer pessoa)
 */
var SHEET_NAME = 'Reservas';

function setupAllSheets() {
  // Cria e formata 4 abas completas com 27 colunas, dropdowns e fórmulas
}

function doGet(e) { ... }
function doPost(e) { ... }`}</pre>
              </div>
            </div>

            {/* Step by Step Guide for GitHub Hosting */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h5 className="font-bold text-slate-900">1. Planilha no Sheets</h5>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Acesse <strong>Extensões → Apps Script</strong> no Sheets e cole o código <code className="bg-white px-1 py-0.5 rounded border border-slate-200">Code.gs</code>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h5 className="font-bold text-slate-900">2. Implantar Web App</h5>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Clique em <strong>Implantar → Nova Implantação</strong>. Tipo: <em>App da Web</em>, <em>Acesso: Qualquer pessoa</em>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h5 className="font-bold text-slate-900">3. Conectar e Sincronizar</h5>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Cole a URL acima ou configure <code className="bg-white px-1 py-0.5 rounded border border-slate-200">VITE_GOOGLE_APPS_SCRIPT_URL</code> no GitHub.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDevModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Concluído / Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Notes Modal */}
      {showNotesModal && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-serif-display font-bold text-base text-slate-900">
                Anotações Internas • {selectedReservation.code}
              </h4>
              <button onClick={() => setShowNotesModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <textarea
              rows={4}
              value={internalNoteDraft}
              onChange={(e) => setInternalNoteDraft(e.target.value)}
              placeholder="Digite observações internas (visíveis apenas para administradores)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-sky-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Salvar Anotação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
