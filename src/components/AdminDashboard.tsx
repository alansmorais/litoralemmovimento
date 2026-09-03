import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Reservation, Driver, AdminAccount, TripStatus, GPSDeviation, ContactMessage, MessageStatus } from '../types';
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
  UserX,
  UserPlus,
  Shield,
  KeyRound,
  MessageSquare,
  Headphones,
  CheckCheck,
  Zap,
  ShieldCheck,
  Layers,
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
  onOpenDriverView?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToSite,
  onOpenDriverView,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>(() => StorageService.getAdmins());
  const [activeAdmin, setActiveAdmin] = useState<AdminAccount>(() => {
    const currentAdmins = StorageService.getAdmins();
    const sessionName = sessionStorage.getItem('litoral_admin_name');
    if (sessionName) {
      const found = currentAdmins.find(
        (a) =>
          a.name.toLowerCase() === sessionName.toLowerCase() ||
          a.username.toLowerCase() === sessionName.toLowerCase()
      );
      if (found) return found;
    }
    return currentAdmins[0] || ADMIN_ACCOUNTS[0];
  });

  // Admin Management Modal states
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [isEditingAdminModalOpen, setIsEditingAdminModalOpen] = useState<boolean>(false);
  const [editAdminEmail, setEditAdminEmail] = useState<string>('');
  const [editAdminName, setEditAdminName] = useState<string>('');
  const [editAdminRole, setEditAdminRole] = useState<string>('');
  const [editAdminStatus, setEditAdminStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [editAdminPassword, setEditAdminPassword] = useState<string>('');
  const [isSavingAdmin, setIsSavingAdmin] = useState<boolean>(false);
  const [adminFeedback, setAdminFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Admin Modal states
  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState<boolean>(false);
  const [newAdminUsername, setNewAdminUsername] = useState<string>('');
  const [newAdminName, setNewAdminName] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminRole, setNewAdminRole] = useState<string>('Gestão Geral');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('litoral2026');
  const [newAdminStatus, setNewAdminStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'reservations' | 'calendar' | 'messages' | 'stats' | 'gps-audit' | 'team'>('reservations');

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

  // Selected contact message for modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageNoteDraft, setMessageNoteDraft] = useState('');
  const [messageStatusFilter, setMessageStatusFilter] = useState<string>('all');

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
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [lastGasSyncTime, setLastGasSyncTime] = useState<string | null>(() => {
    const ts = StorageService.getLastSyncTimestamp();
    return ts ? new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;
  });

  // Super User Diagnostic & Self-Healing Sheet Structure state
  const [sheetsStructure, setSheetsStructure] = useState<{
    checked: boolean;
    allOk: boolean;
    missingSheets: string[];
    headersMissing: string[];
    sheets: Record<string, any>;
    lastCheckTime?: string;
  } | null>(null);
  const [isCheckingStructure, setIsCheckingStructure] = useState(false);
  const [isRepairingSheets, setIsRepairingSheets] = useState(false);
  const [repairSuccessMessage, setRepairSuccessMessage] = useState<string | null>(null);
  const [isSuperUserOverrideAll, setIsSuperUserOverrideAll] = useState(false);

  // Reservation Super User Override Modal state
  const [selectedResForOverride, setSelectedResForOverride] = useState<Reservation | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState<{
    status: TripStatus;
    paymentStatus: any;
    totalPrice: number;
    depositAmount: number;
    depositPaid: boolean;
    assignedDriverId: string;
    driverVehicle: string;
    driverPlate: string;
    driverPhone: string;
    internalAdminNotes: string;
    overrideReason: string;
  }>({
    status: 'Confirmado',
    paymentStatus: 'Sinal 50% Pago (Confirmado)',
    totalPrice: 0,
    depositAmount: 0,
    depositPaid: true,
    assignedDriverId: '',
    driverVehicle: 'Chevrolet Spin 7L (2025/2026)',
    driverPlate: 'BRA-2026',
    driverPhone: '(12) 99742-8859',
    internalAdminNotes: '',
    overrideReason: 'Ajuste operacional de contingência pelo Super Admin',
  });

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
    setContactMessages(StorageService.getContactMessages());
    setAdmins(StorageService.getAdmins());
  };

  useEffect(() => {
    loadData();
    StorageService.syncWithServer().then(() => loadData()).catch(() => {});

    // Periodic synchronization (every 4s) so updates from drivers on their devices reflect instantly in Admin
    const syncInterval = setInterval(() => {
      StorageService.syncWithServer().then(() => loadData()).catch(() => {});
    }, 4000);

    const handleUpdate = () => loadData();
    const handleAdminsUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setAdmins(e.detail);
      } else {
        setAdmins(StorageService.getAdmins());
      }
    };

    window.addEventListener('reservations_updated', handleUpdate);
    window.addEventListener('drivers_updated', handleUpdate);
    window.addEventListener('contact_messages_updated', handleUpdate);
    window.addEventListener('admins_updated', handleAdminsUpdate);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('reservations_updated', handleUpdate);
      window.removeEventListener('drivers_updated', handleUpdate);
      window.removeEventListener('contact_messages_updated', handleUpdate);
      window.removeEventListener('admins_updated', handleAdminsUpdate);
    };
  }, []);

  const handleToggleAdminStatus = async (adminId: string, newStatus: 'Ativo' | 'Inativo') => {
    const target = admins.find((a) => a.id === adminId);
    if (!target) return;

    if (target.username === 'alan' && newStatus === 'Inativo') {
      alert('O Super Admin principal (Alan Morais) não pode ser desativado.');
      return;
    }

    const updated = admins.map((a) => (a.id === adminId ? { ...a, status: newStatus } : a));
    setAdmins(updated);
    StorageService.saveAdmins(updated);

    if (activeAdmin.id === adminId) {
      setActiveAdmin({ ...activeAdmin, status: newStatus });
    }

    setAdminFeedback({
      text: `Permissão atualizada: ${target.name} agora está configurado como "${
        newStatus === 'Ativo' ? 'Pode usar o sistema' : 'Não pode usar o sistema (Bloqueado)'
      }".`,
      type: 'success',
    });
    setTimeout(() => setAdminFeedback(null), 5000);

    await StorageService.updateAdminProfile(adminId, { status: newStatus });
  };

  const handleOpenEditAdmin = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setEditAdminName(admin.name);
    setEditAdminEmail(admin.email || '');
    setEditAdminRole(admin.role);
    setEditAdminStatus(admin.status || 'Ativo');
    setEditAdminPassword('');
    setIsEditingAdminModalOpen(true);
  };

  const handleSaveEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setIsSavingAdmin(true);
    const updates: { email: string; status: 'Ativo' | 'Inativo'; name: string; role: string; password?: string } = {
      name: editAdminName.trim() || editingAdmin.name,
      email: editAdminEmail.trim(),
      status: editAdminStatus,
      role: editAdminRole.trim() || editingAdmin.role,
    };

    if (editAdminPassword.trim().length >= 4) {
      updates.password = editAdminPassword.trim();
    }

    const res = await StorageService.updateAdminProfile(editingAdmin.id, updates);
    setIsSavingAdmin(false);

    if (res.success) {
      const updatedList = admins.map((a) =>
        a.id === editingAdmin.id
          ? {
              ...a,
              ...updates,
              ...(updates.password ? { password: updates.password, mustChangePassword: false } : {}),
            }
          : a
      );
      setAdmins(updatedList);
      if (activeAdmin.id === editingAdmin.id) {
        setActiveAdmin({ ...activeAdmin, ...updates });
      }
      setIsEditingAdminModalOpen(false);
      setAdminFeedback({ text: `Dados de ${updates.name} salvos com sucesso!`, type: 'success' });
      setTimeout(() => setAdminFeedback(null), 5000);
    } else {
      setAdminFeedback({ text: res.message, type: 'error' });
    }
  };

  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newAdminUsername.trim().toLowerCase();
    const cleanName = newAdminName.trim();
    const cleanEmail = newAdminEmail.trim();

    if (!cleanUser || !cleanName) {
      alert('Por favor, informe o usuário curto e o nome completo.');
      return;
    }

    if (admins.some((a) => a.username.toLowerCase() === cleanUser)) {
      alert(`O usuário curto @${cleanUser} já está em uso.`);
      return;
    }

    setIsCreatingAdmin(true);

    const newAdminObj: AdminAccount = {
      id: `adm-${Date.now().toString().slice(-4)}`,
      username: cleanUser,
      name: cleanName,
      email: cleanEmail,
      role: newAdminRole,
      password: newAdminPassword.trim() || 'litoral2026',
      status: newAdminStatus,
      mustChangePassword: true,
    };

    const updated = [...admins, newAdminObj];
    setAdmins(updated);
    StorageService.saveAdmins(updated);

    // Sync to backend and Google Sheets
    await StorageService.updateAdminProfile(newAdminObj.id, {
      name: newAdminObj.name,
      email: newAdminObj.email,
      status: newAdminObj.status,
      role: newAdminObj.role,
      password: newAdminObj.password,
    });

    setIsCreatingAdmin(false);
    setIsNewAdminModalOpen(false);
    setNewAdminUsername('');
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('litoral2026');
    setAdminFeedback({ text: `Novo administrador @${cleanUser} criado com sucesso!`, type: 'success' });
    setTimeout(() => setAdminFeedback(null), 5000);
  };

  const handleUpdateMessageStatus = (id: string, newStatus: MessageStatus) => {
    StorageService.updateContactMessageStatus(id, newStatus, `${activeAdmin.name} (${activeAdmin.role})`);
    loadData();
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSaveMessageNotes = (id: string) => {
    StorageService.updateContactMessageNotes(id, messageNoteDraft);
    loadData();
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage((prev) => (prev ? { ...prev, adminNotes: messageNoteDraft } : null));
    }
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mensagem da central?')) {
      StorageService.deleteContactMessage(id);
      loadData();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    }
  };

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

  // Contact Messages stats
  const totalMessagesCount = contactMessages.length;
  const pendingMessagesCount = contactMessages.filter((m) => m.status === 'Pendente').length;
  const answeredMessagesCount = contactMessages.filter((m) => m.status === 'Respondida').length;

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

  const handleDriverAssign = async (reservationId: string, driverId: string) => {
    await StorageService.assignDriver(reservationId, driverId);
    loadData();
  };

  const handleDeleteReservation = async (id: string, code: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a reserva ${code}? Esta ação removerá o registro permanentemente do sistema.`)) {
      await StorageService.deleteReservation(id);
      loadData();
    }
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

  const handleCheckSheetsStructure = async () => {
    setIsCheckingStructure(true);
    setRepairSuccessMessage(null);
    try {
      const res = await StorageService.checkGoogleSheetsStructure(gasUrl);
      setSheetsStructure({
        checked: true,
        allOk: res.allOk,
        missingSheets: res.missingSheets || [],
        headersMissing: res.headersMissing || [],
        sheets: res.sheets || {},
        lastCheckTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });
      if (res.allOk) {
        setRepairSuccessMessage('Todas as abas e cabeçalhos foram verificados e estão íntegros!');
      }
    } catch (e: any) {
      alert('Erro ao verificar estrutura das abas: ' + e.message);
    } finally {
      setIsCheckingStructure(false);
    }
  };

  const handleRepairSheetsStructure = async () => {
    if (!gasUrl) {
      alert('Por favor, informe e salve a URL do Google Apps Script primeiro.');
      return;
    }
    setIsRepairingSheets(true);
    setRepairSuccessMessage(null);
    try {
      const res = await StorageService.repairGoogleSheetsHeadersAndTabs(gasUrl);
      if (res.success) {
        setRepairSuccessMessage(res.message || 'Todas as abas e cabeçalhos foram reparados/criados com sucesso!');
        await handleCheckSheetsStructure();
      } else {
        alert('Falha ao auto-criar abas: ' + res.message);
      }
    } catch (err: any) {
      alert('Erro ao reparar abas: ' + err.message);
    } finally {
      setIsRepairingSheets(false);
    }
  };

  const handleSaveSuperUserOverride = () => {
    if (!selectedResForOverride) return;
    const targetDriver = drivers.find((d) => d.id === overrideForm.assignedDriverId);
    const updated = StorageService.overrideReservation(
      selectedResForOverride.id,
      {
        status: overrideForm.status,
        paymentStatus: overrideForm.paymentStatus,
        totalPrice: Number(overrideForm.totalPrice),
        depositAmount: Number(overrideForm.depositAmount),
        depositPaid: overrideForm.depositPaid,
        assignedDriverId: overrideForm.assignedDriverId,
        assignedDriverName: targetDriver?.name || selectedResForOverride.assignedDriverName || '',
        driverVehicle: overrideForm.driverVehicle,
        driverPlate: overrideForm.driverPlate,
        driverPhone: overrideForm.driverPhone,
        internalAdminNotes: `${overrideForm.internalAdminNotes ? overrideForm.internalAdminNotes + ' | ' : ''}Motivo SU: ${overrideForm.overrideReason}`,
      },
      activeAdmin.name
    );

    if (updated) {
      loadData();
      setShowOverrideModal(false);
      setSelectedResForOverride(null);
      setSyncStatus(`Reserva #${selectedResForOverride.code} sobrescrita com sucesso pelo Super User!`);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const handleCopyGasCode = () => {
    const codeSnippet = `/**
 * =======================================================================================
 * LITORAL EM MOVIMENTO - SISTEMA COMPLETO DE BANCO DE DADOS GOOGLE APPS SCRIPT
 * =======================================================================================
 * Cole este código completo no editor de Apps Script (Extensões -> Apps Script).
 * 
 * Abas automáticas criadas e gerenciadas:
 * 1. "Reservas" (27 colunas, dropdowns, formatação de moeda R$, cores)
 * 2. "Motoristas" (Escala da frota Chevrolet Spin 7L)
 * 3. "Mensagens_SAC" (Central de mensagens de clientes, WhatsApp e suporte)
 * 4. "Dashboard" (Fórmulas em tempo real de faturamento e sinais)
 * 5. "Configuracoes" (Dados da empresa, WhatsApp, PIX, Senha Master)
 */

var SHEET_RESERVAS = 'Reservas';
var SHEET_MOTORISTAS = 'Motoristas';
var SHEET_DASHBOARD = 'Dashboard';
var SHEET_CONFIG = 'Configuracoes';
var SHEET_SAC = 'Mensagens_SAC';

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
  setupSacSheet(ss);
  setupDashboardSheet(ss);
  return { status: 'success', message: 'Todas as 5 abas configuradas com sucesso!' };
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

function setupSacSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_SAC) || ss.insertSheet(SHEET_SAC);
  var headers = ['ID Mensagem', 'Data / Hora', 'Nome do Cliente', 'Telefone (WhatsApp)', 'E-mail', 'Assunto / Categoria', 'Mensagem / Dúvida', 'Status Atendimento', 'Canal de Origem', 'Atendente / Respondido Por', 'Notas Internas'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground('#0F172A').setFontColor('#F8FAFC').setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function setupConfigSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CONFIG) || ss.insertSheet(SHEET_CONFIG);
  sheet.getRange(1, 1, 1, 3).setValues([['Chave de Configuração', 'Valor', 'Descrição']]).setBackground('#0F172A').setFontColor('#FFFFFF').setFontWeight('bold');
  sheet.setFrozenRows(1);
  if (sheet.getLastRow() <= 1) {
    sheet.appendRow(['NOME_EMPRESA', 'Litoral em Movimento Transfer Executivo', 'Nome oficial da empresa']);
    sheet.appendRow(['CONTATO_WHATSAPP', '(12) 98850-6597', 'WhatsApp oficial de atendimento']);
    sheet.appendRow(['CHAVE_PIX_OFICIAL', '12988506597', 'Chave PIX para sinal 50%']);
    sheet.appendRow(['PERCENTUAL_SINAL', '50%', 'Exigência de 50% para reserva']);
    sheet.appendRow(['FROTA_OFICIAL', 'Chevrolet Spin 7 Lugares', 'Frota oficial']);
    sheet.appendRow(['SENHA_SUPERADMIN_ALAN', 'alan2026', 'Senha master Super Admin Alan Morais']);
    sheet.appendRow(['SENHA_ADMIN_GERAL', 'litoral2026', 'Senha de acesso Painel Admin']);
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

  if (action === 'getDrivers') {
    var sheetDrv = ss.getSheetByName(SHEET_MOTORISTAS) || setupMotoristasSheet(ss);
    var drvData = sheetDrv.getDataRange().getValues();
    var drivers = [];
    for (var d = 1; d < drvData.length; d++) {
      if (!drvData[d][0]) continue;
      drivers.push({
        id: String(drvData[d][0]), name: String(drvData[d][1]), phone: String(drvData[d][2]),
        email: String(drvData[d][3] || ''), vehicleModel: String(drvData[d][4]),
        plate: String(drvData[d][5]), status: String(drvData[d][6]),
        rating: Number(drvData[d][7]) || 5.0, totalTrips: Number(drvData[d][8]) || 0
      });
    }
    return createJsonResponse(drivers);
  }

  if (action === 'getContactMessages' || action === 'getMessages') {
    var sheetSac = ss.getSheetByName(SHEET_SAC) || setupSacSheet(ss);
    var sacData = sheetSac.getDataRange().getValues();
    var messages = [];
    for (var m = 1; m < sacData.length; m++) {
      if (!sacData[m][0]) continue;
      messages.push({
        id: String(sacData[m][0]), createdAt: String(sacData[m][1]), name: String(sacData[m][2]),
        phone: String(sacData[m][3]), email: String(sacData[m][4] || ''),
        subject: String(sacData[m][5] || 'Geral'), message: String(sacData[m][6] || ''),
        status: String(sacData[m][7] || 'Pendente'), channel: String(sacData[m][8] || 'Site / WhatsApp'),
        answeredBy: String(sacData[m][9] || ''), adminNotes: String(sacData[m][10] || '')
      });
    }
    return createJsonResponse(messages);
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

    if (action === 'syncAll') {
      if (Array.isArray(payload.reservations)) {
        var sheetRes = ss.getSheetByName(SHEET_RESERVAS) || setupReservasSheet(ss);
        var existingData = sheetRes.getDataRange().getValues();
        var existingIds = {};
        for (var er = 1; er < existingData.length; er++) {
          if (existingData[er][0]) existingIds[String(existingData[er][0])] = er + 1;
        }
        for (var rIdx = 0; rIdx < payload.reservations.length; rIdx++) {
          var item = payload.reservations[rIdx];
          var itemId = String(item.id || ('res-' + (new Date().getTime() + rIdx)));
          var itemCode = String(item.code || ('LM-' + Math.floor(1000 + Math.random() * 9000)));
          var tPrice = Number(item.totalPrice) || 0;
          var depAmt = item.depositAmount ? Number(item.depositAmount) : Number((tPrice * 0.5).toFixed(2));
          var remAmt = item.remainingAmount ? Number(item.remainingAmount) : Number((tPrice - depAmt).toFixed(2));
          var dPaid = item.depositPaid === true;
          var resRow = [
            itemId, itemCode, item.createdAt || new Date().toISOString(),
            item.customerName || '', item.customerPhone || '', item.customerEmail || '',
            item.origin || '', item.originDetails || '', item.destination || '', item.destinationDetails || '',
            item.date || '', item.time || '', item.passengers || 1, item.tripType || 'Individual (Exclusivo)',
            item.luggageCount || 1, item.hasChildSeat ? 'Sim' : 'Não',
            tPrice, depAmt, remAmt, dPaid ? 'Sim' : 'Não',
            item.paymentMethod || 'PIX Copia e Cola', item.status || 'Pendente',
            item.paymentStatus || (dPaid ? 'Sinal 50% Pago (Confirmado)' : 'Aguardando Sinal 50%'),
            item.flightNumber || '', item.assignedDriverName || '', item.driverVehicle || '', item.notes || ''
          ];
          if (existingIds[itemId]) sheetRes.getRange(existingIds[itemId], 1, 1, resRow.length).setValues([resRow]);
          else sheetRes.appendRow(resRow);
        }
      }

      if (Array.isArray(payload.drivers)) {
        var sheetDrv = ss.getSheetByName(SHEET_MOTORISTAS) || setupMotoristasSheet(ss);
        var drvData = sheetDrv.getDataRange().getValues();
        var existingDrvIds = {};
        for (var ed = 1; ed < drvData.length; ed++) {
          if (drvData[ed][0]) existingDrvIds[String(drvData[ed][0])] = ed + 1;
        }
        for (var dIdx = 0; dIdx < payload.drivers.length; dIdx++) {
          var drv = payload.drivers[dIdx];
          var drvId = String(drv.id);
          var drvRow = [
            drvId, drv.name || '', drv.phone || '', drv.email || '',
            drv.vehicleModel || 'Chevrolet Spin Premier 7L', drv.plate || '',
            drv.status || 'Disponível', Number(drv.rating) || 5.0,
            Number(drv.totalTrips) || 0, drv.pixKey || ''
          ];
          if (existingDrvIds[drvId]) sheetDrv.getRange(existingDrvIds[drvId], 1, 1, drvRow.length).setValues([drvRow]);
          else sheetDrv.appendRow(drvRow);
        }
      }

      if (Array.isArray(payload.contactMessages)) {
        var sheetSac = ss.getSheetByName(SHEET_SAC) || setupSacSheet(ss);
        var sacData = sheetSac.getDataRange().getValues();
        var existingSacIds = {};
        for (var es = 1; es < sacData.length; es++) {
          if (sacData[es][0]) existingSacIds[String(sacData[es][0])] = es + 1;
        }
        for (var mIdx = 0; mIdx < payload.contactMessages.length; mIdx++) {
          var msg = payload.contactMessages[mIdx];
          var msgId = String(msg.id);
          var msgRow = [
            msgId, msg.createdAt || new Date().toISOString(),
            msg.name || '', msg.phone || '', msg.email || '',
            msg.subject || 'Geral', msg.message || '',
            msg.status || 'Pendente', msg.channel || 'Site / WhatsApp',
            msg.answeredBy || '', msg.adminNotes || ''
          ];
          if (existingSacIds[msgId]) sheetSac.getRange(existingSacIds[msgId], 1, 1, msgRow.length).setValues([msgRow]);
          else sheetSac.appendRow(msgRow);
        }
      }

      if (payload.configs && typeof payload.configs === 'object') {
        var sheetConf = ss.getSheetByName(SHEET_CONFIG) || setupConfigSheet(ss);
        var cData = sheetConf.getDataRange().getValues();
        var confKeys = {};
        for (var ck = 1; ck < cData.length; ck++) {
          if (cData[ck][0]) confKeys[String(cData[ck][0]).trim()] = ck + 1;
        }
        for (var configKey in payload.configs) {
          var configVal = String(payload.configs[configKey]);
          if (confKeys[configKey]) sheetConf.getRange(confKeys[configKey], 2).setValue(configVal);
          else sheetConf.appendRow([configKey, configVal, 'Sincronizado via Painel Admin']);
        }
      }

      setupDashboardSheet(ss);
      return createJsonResponse({ status: 'success', message: 'Sincronização de todos os dados realizada no Google Sheets!' });
    }

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

    if (action === 'updateStatus' || action === 'assignDriver' || action === 'updateReservation') {
      var targetId = String(payload.id || payload.code || '');
      var rows = sheet.getDataRange().getValues();
      var updatedRow = false;
      for (var k = 1; k < rows.length; k++) {
        if (String(rows[k][0]) === targetId || String(rows[k][1]) === targetId) {
          if (payload.status !== undefined) sheet.getRange(k + 1, 22).setValue(payload.status);
          if (payload.paymentStatus !== undefined) sheet.getRange(k + 1, 23).setValue(payload.paymentStatus);
          if (payload.driverName !== undefined) sheet.getRange(k + 1, 25).setValue(payload.driverName || '');
          if (payload.assignedDriverName !== undefined) sheet.getRange(k + 1, 25).setValue(payload.assignedDriverName || '');
          if (payload.driverVehicle !== undefined) sheet.getRange(k + 1, 26).setValue(payload.driverVehicle || '');
          if (payload.notes !== undefined) sheet.getRange(k + 1, 27).setValue(payload.notes || '');
          if (payload.depositPaid !== undefined) sheet.getRange(k + 1, 20).setValue(payload.depositPaid ? 'Sim' : 'Não');
          updatedRow = true;
          break;
        }
      }
      return createJsonResponse({ status: updatedRow ? 'success' : 'not_found', message: 'Reserva e motorista sincronizados com a planilha!' });
    }

    if (action === 'updateDriverStatus') {
      var sheetDrv = ss.getSheetByName(SHEET_DRIVERS) || setupDriversSheet(ss);
      var dRows = sheetDrv.getDataRange().getValues();
      for (var d = 1; d < dRows.length; d++) {
        if (String(dRows[d][0]) === String(payload.driverId)) {
          sheetDrv.getRange(d + 1, 9).setValue(payload.activeStatus || 'Disponível');
          break;
        }
      }
      return createJsonResponse({ status: 'success', message: 'Status do motorista atualizado na planilha!' });
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

  const handleSyncAllToGoogleAppsScript = async () => {
    setIsSyncingAll(true);
    setSyncStatus('Enviando TUDO (Reservas, Motoristas, Mensagens SAC, Senhas) para o Google Apps Script...');
    try {
      const res = await StorageService.syncAllToGoogleSheets();
      setIsSyncingAll(false);
      const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastGasSyncTime(timeStr);
      setSyncStatus(`✓ Salvo com sucesso no Apps Script! (${res.details.reservationsCount} reservas, ${res.details.driversCount} motoristas, ${res.details.messagesCount} mensagens)`);
    } catch (e: any) {
      setIsSyncingAll(false);
      setSyncStatus(`Aviso ao salvar no Apps Script: ${e.message || 'Verifique conexão'}`);
    }
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handleSyncGoogleSheets = async () => {
    setSyncStatus('Sincronizando todas as reservas com Google Sheets...');
    const res = await StorageService.syncReservationsOnlyToGoogleSheets();
    setSyncStatus(`Sucesso: ${res.count} reservas sincronizadas no Google Sheets.`);
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setLastGasSyncTime(timeStr);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleSyncDriversOnly = async () => {
    setSyncStatus('Sincronizando motoristas com Google Sheets...');
    const res = await StorageService.syncDriversOnlyToGoogleSheets();
    setSyncStatus(`Sucesso: ${res.count} motoristas sincronizados no Google Sheets.`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleSyncMessagesOnly = async () => {
    setSyncStatus('Sincronizando mensagens do SAC com Google Sheets...');
    const res = await StorageService.syncContactMessagesOnlyToGoogleSheets();
    setSyncStatus(`Sucesso: ${res.count} mensagens do SAC salvas na planilha.`);
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
              <div className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center border border-amber-400/40 shrink-0">
                {activeAdmin.name ? activeAdmin.name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div>
                <span className="font-bold text-white block leading-tight">{activeAdmin.name}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {activeAdmin.status === 'Inativo' ? '• Bloqueado' : '• Online'}
                </span>
              </div>
              <select
                value={activeAdmin.id}
                onChange={(e) => {
                  const selected = admins.find((a) => a.id === e.target.value);
                  if (selected) setActiveAdmin(selected);
                }}
                className="bg-transparent text-slate-200 outline-none ml-1 cursor-pointer text-xs"
                title="Selecionar usuário da gestão"
              >
                {admins.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {acc.name} {acc.status === 'Inativo' ? '(Bloqueado)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Super User Diagnostic & Self-Healing Sheets Tool */}
            {isAlanMorais && (
              <button
                onClick={() => {
                  setShowDevModal(true);
                  handleCheckSheetsStructure();
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Diagnóstico Super User: Checar e auto-criar abas e cabeçalhos no Google Sheets"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                <span>Super User • Abas & Override</span>
                <span className="bg-slate-950 text-amber-300 text-[9px] px-1.5 py-0.2 rounded font-black">SU</span>
              </button>
            )}

            {/* Salvar TUDO no Banco de Dados em Nuvem Button */}
            <button
              onClick={handleSyncAllToGoogleAppsScript}
              disabled={isSyncingAll}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Salva todas as reservas, motoristas, SAC e configurações no banco de dados em nuvem"
            >
              {isSyncingAll ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-emerald-200" />
              )}
              <span>{isSyncingAll ? 'Sincronizando Nuvem...' : 'Sincronizar Nuvem'}</span>
            </button>

            {/* Sync Timestamp Badge */}
            {lastGasSyncTime && (
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-700 text-emerald-300 px-2.5 py-1.5 rounded-xl font-mono">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>Salvo: {lastGasSyncTime}</span>
              </span>
            )}

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

            {/* App do Motorista Direct Button */}
            {onOpenDriverView && (
              <button
                onClick={onOpenDriverView}
                className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Abrir o Portal e Aplicativo Operacional do Motorista"
              >
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>App do Motorista</span>
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reservations'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📋 Tabela de Reservas ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'messages'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              <span>Atendimento & Mensagens</span>
              {pendingMessagesCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {pendingMessagesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              👥 Equipe de Gestão ({admins.length})
            </button>
          </div>

          {/* Export & Sync buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={exportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Baixar Relatório em formato CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleSyncGoogleSheets}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Sincronizar reservas com o banco de dados em nuvem"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Nuvem</span>
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
                        <td colSpan={8} className="py-14 text-center text-slate-500">
                          {reservations.length === 0 ? (
                            <div className="py-8 flex flex-col items-center justify-center">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                                <Calendar className="w-6 h-6" />
                              </div>
                              <p className="font-bold text-slate-800 text-sm">Nenhuma reserva cadastrada no sistema</p>
                              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                O sistema está 100% limpo, aguardando novos agendamentos e registros reais.
                              </p>
                            </div>
                          ) : (
                            'Nenhuma reserva encontrada para os filtros selecionados.'
                          )}
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

                          {/* Driver Assign with Dynamic Availability & Journey Protection */}
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
                              <optgroup label="✅ Disponíveis nesta Jornada">
                                {drivers
                                  .filter((drv) => {
                                    const avail = StorageService.checkDriverAvailabilityForTrip(
                                      drv.id,
                                      res.date,
                                      res.time,
                                      res.id,
                                      reservations
                                    );
                                    return avail.isAvailable || res.assignedDriverId === drv.id;
                                  })
                                  .map((drv) => (
                                    <option key={drv.id} value={drv.id}>
                                      👤 {drv.name} {res.assignedDriverId === drv.id ? '(Atribuído)' : '(Disponível)'} - Spin {drv.plate.slice(-4)}
                                    </option>
                                  ))}
                              </optgroup>
                              <optgroup label="⛔ Ocupados nesta Jornada (Indisponíveis)">
                                {drivers
                                  .filter((drv) => {
                                    const avail = StorageService.checkDriverAvailabilityForTrip(
                                      drv.id,
                                      res.date,
                                      res.time,
                                      res.id,
                                      reservations
                                    );
                                    return !avail.isAvailable && res.assignedDriverId !== drv.id;
                                  })
                                  .map((drv) => {
                                    const avail = StorageService.checkDriverAvailabilityForTrip(
                                      drv.id,
                                      res.date,
                                      res.time,
                                      res.id,
                                      reservations
                                    );
                                    return (
                                      <option key={drv.id} value={drv.id} disabled className="text-slate-400">
                                        ❌ {drv.name} ({avail.reason || 'Ocupado na Jornada'})
                                      </option>
                                    );
                                  })}
                              </optgroup>
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
                              {/* Super User Override Button */}
                              {isAlanMorais && (
                                <button
                                  onClick={() => {
                                    setSelectedResForOverride(res);
                                    setOverrideForm({
                                      status: res.status,
                                      paymentStatus: res.paymentStatus,
                                      totalPrice: res.totalPrice,
                                      depositAmount: res.depositAmount || Number((res.totalPrice * 0.5).toFixed(2)),
                                      depositPaid: !!res.depositPaid,
                                      assignedDriverId: res.assignedDriverId || '',
                                      driverVehicle: res.driverVehicle || 'Chevrolet Spin 7L (2025/2026)',
                                      driverPlate: res.driverPlate || 'SP-LIT7A24',
                                      driverPhone: res.driverPhone || '(12) 98877-6655',
                                      internalAdminNotes: res.internalAdminNotes || '',
                                      overrideReason: 'Ajuste operacional direto pelo Super Admin',
                                    });
                                    setShowOverrideModal(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 border border-amber-300 cursor-pointer transition-colors"
                                  title="⚡ Super User Override Total: Modificar qualquer campo com privilégio total"
                                >
                                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                                </button>
                              )}

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

                              {/* Excluir reserva */}
                              <button
                                onClick={() => handleDeleteReservation(res.id, res.code)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 cursor-pointer transition-colors"
                                title="Excluir reserva permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

        {/* TAB: ATENDIMENTO & MENSAGENS DO SITE (FALE CONOSCO) */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Header & Quick stats */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-900 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-1">
                  <Headphones className="w-3.5 h-3.5 text-amber-600" />
                  <span>Central de Atendimento ao Cliente</span>
                </div>
                <h3 className="font-serif-display font-extrabold text-2xl text-slate-900">
                  Mensagens & Solicitações do Formulário
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Todas as dúvidas, orçamentos personalizados e mensagens enviadas pelos clientes através do formulário de contato do site são recebidas e gerenciadas aqui em tempo real.
                </p>
              </div>

              {/* Status pills counter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">Pendentes</span>
                  <span className="text-lg font-extrabold text-amber-900">{pendingMessagesCount}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Respondidas</span>
                  <span className="text-lg font-extrabold text-emerald-900">{answeredMessagesCount}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-700 font-bold uppercase block">Total</span>
                  <span className="text-lg font-extrabold text-slate-900">{totalMessagesCount}</span>
                </div>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setMessageStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    messageStatusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todas ({contactMessages.length})
                </button>
                <button
                  onClick={() => setMessageStatusFilter('Pendente')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    messageStatusFilter === 'Pendente'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pendentes ({pendingMessagesCount})</span>
                </button>
                <button
                  onClick={() => setMessageStatusFilter('Respondida')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    messageStatusFilter === 'Respondida'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Respondidas ({answeredMessagesCount})</span>
                </button>
                <button
                  onClick={() => setMessageStatusFilter('Arquivada')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    messageStatusFilter === 'Arquivada'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Arquivadas ({contactMessages.filter((m) => m.status === 'Arquivada').length})
                </button>
              </div>

              <div className="w-full md:w-72 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome, telefone, assunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Messages List / Grid */}
            {(() => {
              const filtered = contactMessages.filter((msg) => {
                const matchesFilter =
                  messageStatusFilter === 'all' || msg.status === messageStatusFilter;
                const matchesSearch =
                  searchTerm === '' ||
                  msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  msg.phone.includes(searchTerm) ||
                  msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  msg.ticketCode.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesFilter && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Nenhuma mensagem encontrada
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Quando um passageiro preencher o formulário "Fale Conosco" no site, a mensagem aparecerá imediatamente nesta lista com notificações de status.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((msg) => {
                    const cleanPhone = msg.phone.replace(/\D/g, '');
                    const waNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                    const waText = encodeURIComponent(
                      `Olá ${msg.name}! Aqui é a Central de Atendimento do Litoral em Movimento. Recebemos sua mensagem sobre "${msg.subject}" (Protocolo: ${msg.ticketCode}). Como posso te ajudar?`
                    );

                    return (
                      <div
                        key={msg.id}
                        className={`bg-white rounded-2xl p-5 border transition-all shadow-xs space-y-4 ${
                          msg.status === 'Pendente'
                            ? 'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/10'
                            : msg.status === 'Respondida'
                            ? 'border-slate-200'
                            : 'border-slate-200 opacity-75 bg-slate-50/50'
                        }`}
                      >
                        {/* Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {msg.ticketCode}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {new Date(msg.createdAt).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                              {msg.subject}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                                msg.status === 'Pendente'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : msg.status === 'Respondida'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}
                            >
                              {msg.status === 'Pendente' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                              {msg.status === 'Respondida' && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                              <span>{msg.status}</span>
                            </span>

                            {msg.answeredBy && (
                              <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
                                Por {msg.answeredBy}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Info & Message Body */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                          {/* Sender details */}
                          <div className="lg:col-span-4 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{msg.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              <span className="font-mono">{msg.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                              <span className="truncate">{msg.email}</span>
                            </div>
                            {msg.preferredContact && (
                              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                                Prefere retorno por: <strong className="text-slate-800 uppercase">{msg.preferredContact}</strong>
                              </div>
                            )}
                          </div>

                          {/* Message Content & Internal Notes */}
                          <div className="lg:col-span-8 space-y-3">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Mensagem do Passageiro:
                              </div>
                              <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {msg.message}
                              </p>
                            </div>

                            {/* Internal Admin Note */}
                            <div className="flex items-center gap-2 text-xs">
                              <input
                                type="text"
                                defaultValue={msg.adminNotes || ''}
                                placeholder="Adicionar nota interna (ex: Passageiro prefere retorno após 18h)..."
                                onBlur={(e) => {
                                  if (e.target.value !== (msg.adminNotes || '')) {
                                    StorageService.updateContactMessageNotes(msg.id, e.target.value);
                                    loadData();
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-amber-400 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                          {/* Quick response buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={`https://wa.me/${waNumber}?text=${waText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleUpdateMessageStatus(msg.id, 'Respondida')}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Responder no WhatsApp</span>
                            </a>

                            <a
                              href={`mailto:${msg.email}?subject=Retorno:%20${encodeURIComponent(msg.subject)}%20[Protocolo:%20${msg.ticketCode}]&body=${encodeURIComponent(`Olá ${msg.name},\n\nRecebemos sua mensagem através da nossa central do Litoral em Movimento.\n\n`)}`}
                              onClick={() => handleUpdateMessageStatus(msg.id, 'Respondida')}
                              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Responder por E-mail</span>
                            </a>
                          </div>

                          {/* Status and management actions */}
                          <div className="flex items-center gap-2">
                            {msg.status !== 'Respondida' ? (
                              <button
                                onClick={() => handleUpdateMessageStatus(msg.id, 'Respondida')}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
                              >
                                Marcar Respondida
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateMessageStatus(msg.id, 'Pendente')}
                                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold transition-colors border border-amber-200 cursor-pointer"
                              >
                                Reabrir (Pendente)
                              </button>
                            )}

                            {msg.status !== 'Arquivada' && (
                              <button
                                onClick={() => handleUpdateMessageStatus(msg.id, 'Arquivada')}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium transition-colors cursor-pointer"
                              >
                                Arquivar
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Excluir mensagem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: TEAM MANAGEMENT */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-900 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Equipe de Gestão Oficial</span>
                </div>
                <h3 className="font-serif-display font-extrabold text-2xl text-slate-900">
                  Administradores & Gestores do Sistema
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gerenciamento de credenciais, alteração de e-mails oficiais e controle de permissão de uso do sistema (Pode ou Não Pode usar o sistema).
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs">
                  <div className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-bold text-[9px] flex items-center justify-center border border-amber-400/50">
                    {activeAdmin.name ? activeAdmin.name.substring(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <span className="font-bold">{activeAdmin.name}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">• Online</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewAdminModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Novo Administrador</span>
                </button>
              </div>
            </div>

            {/* Feedback alert */}
            {adminFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
                  adminFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {adminFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{adminFeedback.text}</span>
              </div>
            )}

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {admins.map((admin) => {
                const isActive = activeAdmin.id === admin.id;
                const canUseSystem = admin.status !== 'Inativo';

                return (
                  <div
                    key={admin.id}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between gap-4 ${
                      isActive
                        ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10'
                        : !canUseSystem
                          ? 'border-red-200 bg-red-50/20 opacity-90'
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top info: Monogram & Identity (NO PICTURE) */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm border shadow-xs ${
                              !canUseSystem
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : isActive
                                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                                  : 'bg-slate-950 text-white border-slate-800'
                            }`}
                          >
                            {admin.name ? admin.name.substring(0, 2).toUpperCase() : 'AD'}
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-slate-900 flex items-center gap-1.5 leading-tight">
                              <span>{admin.name}</span>
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sessão Ativa" />
                              )}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs font-mono text-slate-500 font-semibold">
                                @{admin.username}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                {admin.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isActive && (
                          <span className="text-[10px] bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-full shrink-0">
                            Você
                          </span>
                        )}
                      </div>

                      {/* E-mail configuration (Option to change email) */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>E-mail do Administrador</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditAdmin(admin)}
                            className="text-[11px] text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Alterar E-mail</span>
                          </button>
                        </div>
                        <div className="text-xs text-slate-800 font-medium truncate" title={admin.email || 'Não configurado'}>
                          {admin.email || <span className="text-slate-400 italic">Sem e-mail cadastrado</span>}
                        </div>
                      </div>

                      {/* System Access Permission (Pode ou Não Pode Usar o Sistema) */}
                      <div
                        className={`p-3 rounded-xl border transition-all ${
                          canUseSystem
                            ? 'bg-emerald-50/70 border-emerald-200'
                            : 'bg-red-50/70 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                              Uso do Sistema
                            </span>
                            <span
                              className={`text-xs font-bold flex items-center gap-1.5 mt-0.5 ${
                                canUseSystem ? 'text-emerald-800' : 'text-red-800'
                              }`}
                            >
                              {canUseSystem ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Pode usar o sistema</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                  <span>Não pode usar o sistema</span>
                                </>
                              )}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleAdminStatus(admin.id, canUseSystem ? 'Inativo' : 'Ativo')
                            }
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border shadow-xs ${
                              canUseSystem
                                ? 'bg-white hover:bg-red-50 text-red-700 border-red-200 hover:border-red-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
                            }`}
                            title={
                              canUseSystem
                                ? 'Bloquear acesso deste usuário no sistema'
                                : 'Liberar acesso para este usuário usar o sistema'
                            }
                          >
                            {canUseSystem ? 'Bloquear Acesso' : 'Liberar Uso'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAdmin(admin)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (canUseSystem) {
                            setActiveAdmin(admin);
                          }
                        }}
                        disabled={isActive || !canUseSystem}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-100 text-amber-900 cursor-default'
                            : !canUseSystem
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        }`}
                        title={!canUseSystem ? 'Usuário bloqueado para usar o sistema' : undefined}
                      >
                        {isActive
                          ? '✓ Selecionado'
                          : !canUseSystem
                            ? 'Acesso Bloqueado'
                            : 'Acessar como ' + admin.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Information Notice */}
            <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs">
              <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block mb-1">
                  Diretrizes de Segurança e Acesso da Gestão:
                </strong>
                <p className="text-slate-400 leading-relaxed">
                  Todos os administradores com permissão <strong>"Pode usar o sistema"</strong> possuem acesso para despachar rotas de transfer Spin 7L e Sedã 4L, confirmar reservas e gerenciar passageiros. Ao definir como <strong>"Não pode usar o sistema"</strong>, o login deste usuário é imediatamente bloqueado no painel e no servidor. Alterações de e-mail e permissão sincronizam em tempo real com a planilha do Google Sheets.
                </p>
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
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Sincronização & Backup do Banco de Dados:</span>
                </span>
                {lastGasSyncTime && (
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Última sincronização: {lastGasSyncTime}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={handleSyncAllToGoogleAppsScript}
                  disabled={isSyncingAll}
                  className="sm:col-span-2 lg:col-span-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {isSyncingAll ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Salvar Dados na Nuvem</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncGoogleSheets}
                  className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-xs"
                  title="Sincroniza apenas a lista de reservas"
                >
                  <Send className="w-3.5 h-3.5 text-sky-600" />
                  <span>Reservas ({reservations.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncDriversOnly}
                  className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-xs"
                  title="Sincroniza a frota de motoristas Spin 7L"
                >
                  <Car className="w-3.5 h-3.5 text-amber-600" />
                  <span>Motoristas ({drivers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncMessagesOnly}
                  className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-xs"
                  title="Sincroniza as mensagens do SAC"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SAC ({contactMessages.length})</span>
                </button>
              </div>
            </div>

            {/* Super User: Self-Healing & Diagnostic for Sheets Tabs & Headers */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-amber-500/40 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">
                        Diagnóstico & Auto-Criação de Abas e Cabeçalhos (Sheets)
                      </h4>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/40">
                        Super User Exclusivo
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Verifica e auto-cria abas ou cabeçalhos faltantes diretamente no Google Sheets sem mexer em código
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCheckSheetsStructure}
                    disabled={isCheckingStructure || !gasUrl}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    title="Verifica se todas as abas e cabeçalhos estão presentes na planilha"
                  >
                    {isCheckingStructure ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 text-sky-400" />}
                    <span>{isCheckingStructure ? 'Verificando...' : 'Verificar Abas'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRepairSheetsStructure}
                    disabled={isRepairingSheets || !gasUrl}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Cria ou restaura automaticamente todas as abas e cabeçalhos faltantes no Google Sheets"
                  >
                    {isRepairingSheets ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                    <span>{isRepairingSheets ? 'Criando/Reparando...' : 'Auto-Criar / Reparar Abas'}</span>
                  </button>
                </div>
              </div>

              {/* Status Display of Expected Sheets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {[
                  { name: 'Reservas', desc: '27 colunas, fórmulas, cores' },
                  { name: 'Motoristas', desc: 'Frota Spin 7L e repasse PIX' },
                  { name: 'Usuarios_Admin', desc: 'Acessos e senhas de equipe' },
                  { name: 'Mensagens_SAC', desc: 'Contatos e dúvidas do site' },
                  { name: 'Dashboard', desc: 'Métricas e faturamento' },
                  { name: 'Configuracoes', desc: 'WhatsApp, PIX, Senha Master' },
                ].map((sh) => {
                  const sheetInfo = sheetsStructure?.sheets?.[sh.name];
                  const isMissing = sheetsStructure?.missingSheets?.includes(sh.name);
                  const isOk = sheetsStructure?.checked && !isMissing && sheetInfo?.exists !== false;
                  return (
                    <div
                      key={sh.name}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                        isOk
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : isMissing
                          ? 'bg-red-950/40 border-red-500/40 text-red-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-[11px] truncate">{sh.name}</span>
                        {isOk && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {isMissing && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        {!sheetsStructure?.checked && <span className="text-[9px] text-slate-500">Padrão</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 leading-tight line-clamp-2">{sh.desc}</span>
                      {sheetInfo?.headerCount && (
                        <span className="text-[9px] text-emerald-400 mt-1 font-mono">✓ {sheetInfo.headerCount} colunas</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {repairSuccessMessage && (
                <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{repairSuccessMessage}</span>
                </div>
              )}

              {sheetsStructure?.missingSheets && sheetsStructure.missingSheets.length > 0 && (
                <div className="p-3 rounded-xl text-xs flex items-center justify-between gap-2 bg-amber-950/60 border border-amber-500/50 text-amber-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Abas faltantes na planilha: <strong>{sheetsStructure.missingSheets.join(', ')}</strong>.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRepairSheetsStructure}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs cursor-pointer shrink-0"
                  >
                    Criar Agora
                  </button>
                </div>
              )}
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
                  type="password"
                  placeholder="Digite a nova senha master..."
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
      {/* EDIT ADMIN MODAL */}
      {isEditingAdminModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  Gestão de Credencial
                </span>
                <h3 className="font-serif-display font-extrabold text-xl text-slate-900 mt-1">
                  Editar Administrador
                </h3>
                <p className="text-xs text-slate-500">
                  Atualize o e-mail, permissão de uso do sistema e dados de acesso de @{editingAdmin.username}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingAdminModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAdmin} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  value={editAdminName}
                  onChange={(e) => setEditAdminName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Usuário curto (readonly) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Usuário de Login (Google Sheets):
                </label>
                <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono">
                  @{editingAdmin.username}
                </div>
              </div>

              {/* E-mail (Explicit user request) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    E-mail Oficial:
                  </label>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    Notificações e Recuperação
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={editAdminEmail}
                    onChange={(e) => setEditAdminEmail(e.target.value)}
                    placeholder="ex: admin@litoralemmovimento.com.br"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Permissão no sistema (Pode ou não pode usar o sistema) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Permissão de Uso do Sistema:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAdminStatus('Ativo')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                      editAdminStatus === 'Ativo'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        editAdminStatus === 'Ativo' ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Pode usar o sistema
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Acesso liberado ao painel e reservas
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditAdminStatus('Inativo')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                      editAdminStatus === 'Inativo'
                        ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <UserX
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        editAdminStatus === 'Inativo' ? 'text-red-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Não pode usar
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Bloqueia login e operações
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Cargo */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Cargo / Função:
                </label>
                <input
                  type="text"
                  value={editAdminRole}
                  onChange={(e) => setEditAdminRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Nova Senha (Opcional) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nova Senha de Acesso (Opcional):
                </label>
                <input
                  type="text"
                  value={editAdminPassword}
                  onChange={(e) => setEditAdminPassword(e.target.value)}
                  placeholder="Deixe em branco para manter a senha atual"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-400 focus:bg-white transition-colors font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Mínimo de 4 dígitos. Se informada, sincronizará com a aba Usuarios_Admin da planilha.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingAdminModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdmin}
                  className="px-5 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingAdmin ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW ADMIN MODAL */}
      {isNewAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  Novo Membro
                </span>
                <h3 className="font-serif-display font-extrabold text-xl text-slate-900 mt-1">
                  Cadastrar Administrador
                </h3>
                <p className="text-xs text-slate-500">
                  Crie um novo acesso administrativo sem foto com permissão de login no sistema.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewAdminModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAdmin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Usuário Curto:
                  </label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="ex: carlos"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nome Completo:
                  </label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="ex: Carlos Mendes"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  E-mail Oficial:
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="ex: carlos@litoralemmovimento.com.br"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Cargo / Função:
                  </label>
                  <input
                    type="text"
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                    placeholder="ex: Gestão Operacional"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Senha Inicial:
                  </label>
                  <input
                    type="text"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="litoral2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Permissão Inicial:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAdminStatus('Ativo')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                      newAdminStatus === 'Ativo'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs">Pode usar o sistema</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAdminStatus('Inativo')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                      newAdminStatus === 'Inativo'
                        ? 'bg-red-50 border-red-500 font-bold text-red-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <UserX className="w-4 h-4 text-red-600" />
                    <span className="text-xs">Não pode usar</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewAdminModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="px-5 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingAdmin ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Criar Administrador</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER USER OVERRIDE MODAL */}
      {showOverrideModal && selectedResForOverride && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border border-amber-300 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="border-b border-amber-100 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    ⚡ Super User Override
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Voucher: #{selectedResForOverride.code}
                  </span>
                </div>
                <h3 className="font-serif-display font-extrabold text-xl text-slate-900 mt-1">
                  Sobrescrita Forçada da Reserva
                </h3>
                <p className="text-xs text-slate-500">
                  Cliente: <strong>{selectedResForOverride.customerName}</strong> ({selectedResForOverride.customerPhone}) • {selectedResForOverride.origin} → {selectedResForOverride.destination}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOverrideModal(false);
                  setSelectedResForOverride(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Status Operacional:</label>
                  <select
                    value={overrideForm.status}
                    onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value as TripStatus })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Pendente">⏳ Pendente</option>
                    <option value="Confirmado">✅ Confirmado</option>
                    <option value="A caminho">🚗 A caminho</option>
                    <option value="Em andamento">🛣️ Em andamento</option>
                    <option value="Concluído">🏁 Concluído</option>
                    <option value="Cancelado">❌ Cancelado</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Status do Pagamento:</label>
                  <select
                    value={overrideForm.paymentStatus}
                    onChange={(e) => setOverrideForm({ ...overrideForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Sinal 50% Pago (Confirmado)">Sinal 50% Pago (Confirmado)</option>
                    <option value="Pago Total">Pago Total (100%)</option>
                  </select>
                </div>
              </div>

              {/* Financial Section */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2.5">
                <span className="font-bold text-slate-900 block text-xs">Valores Financeiros (R$):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-600 text-[11px]">Valor Total (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={overrideForm.totalPrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setOverrideForm({
                          ...overrideForm,
                          totalPrice: val,
                          depositAmount: Number((val * 0.5).toFixed(2)),
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-600 text-[11px]">Sinal 50% (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={overrideForm.depositAmount}
                      onChange={(e) => setOverrideForm({ ...overrideForm, depositAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-600 text-[11px]">Sinal 50% Pago?:</label>
                    <div className="flex gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setOverrideForm({ ...overrideForm, depositPaid: true })}
                        className={`flex-1 py-1.5 rounded-xl font-bold cursor-pointer transition-colors text-center ${
                          overrideForm.depositPaid ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        ✓ Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverrideForm({ ...overrideForm, depositPaid: false })}
                        className={`flex-1 py-1.5 rounded-xl font-bold cursor-pointer transition-colors text-center ${
                          !overrideForm.depositPaid ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        ✕ Não
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver and Vehicle Assignment */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-900 block text-xs">Alocação de Motorista e Veículo:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-medium text-slate-600 text-[11px]">Motorista Oficial:</label>
                    <select
                      value={overrideForm.assignedDriverId}
                      onChange={(e) => {
                        const drv = drivers.find((d) => d.id === e.target.value);
                        setOverrideForm({
                          ...overrideForm,
                          assignedDriverId: e.target.value,
                          driverVehicle: drv?.vehicleModel || overrideForm.driverVehicle,
                          driverPlate: drv?.plate || overrideForm.driverPlate,
                          driverPhone: drv?.phone || overrideForm.driverPhone,
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none cursor-pointer"
                    >
                      <option value="">Sem Motorista</option>
                      {drivers.map((drv) => (
                        <option key={drv.id} value={drv.id}>
                          {drv.name} ({drv.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-medium text-slate-600 text-[11px]">Veículo & Modelo:</label>
                    <input
                      type="text"
                      value={overrideForm.driverVehicle}
                      onChange={(e) => setOverrideForm({ ...overrideForm, driverVehicle: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-medium text-slate-600 text-[11px]">Placa do Veículo:</label>
                    <input
                      type="text"
                      value={overrideForm.driverPlate}
                      onChange={(e) => setOverrideForm({ ...overrideForm, driverPlate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-medium text-slate-600 text-[11px]">WhatsApp do Motorista:</label>
                    <input
                      type="text"
                      value={overrideForm.driverPhone}
                      onChange={(e) => setOverrideForm({ ...overrideForm, driverPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Audit & Notes */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Justificativa do Override (Auditoria):</label>
                <input
                  type="text"
                  value={overrideForm.overrideReason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, overrideReason: e.target.value })}
                  placeholder="Ex: Correção de horário a pedido do cliente via WhatsApp"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Observações Internas:</label>
                <textarea
                  rows={2}
                  value={overrideForm.internalAdminNotes}
                  onChange={(e) => setOverrideForm({ ...overrideForm, internalAdminNotes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowOverrideModal(false);
                  setSelectedResForOverride(null);
                }}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSuperUserOverride}
                className="px-5 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Aplicar Sobrescrita Forçada (SU)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
