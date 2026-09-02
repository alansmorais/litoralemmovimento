/**
 * =======================================================================================
 * LITORAL EM MOVIMENTO - SISTEMA COMPLETO DE BANCO DE DADOS GOOGLE APPS SCRIPT
 * =======================================================================================
 * Este script transforma qualquer planilha Google Sheets em um banco de dados REST API
 * de alta performance para o sistema de agendamento de transfers Litoral em Movimento.
 *
 * Funcionalidades automáticas:
 *  - Criação e formatação automática das abas: "Reservas", "Motoristas", "Dashboard" e "Configuracoes"
 *  - 27 colunas formatadas para o modelo Chevrolet Spin 7L e regra de Sinal 50%
 *  - Validação de dados suspensa (Dropdowns de Status, Forma de Pagamento, Tipo de Viagem)
 *  - Formatação monetária brasileira (R$ 0,00) e datas automáticas
 *  - Formatação condicional por cores (Verde = Confirmado/Pago, Âmbar = Pendente, Azul = Em Rota)
 *  - Dashboard de Métricas com fórmulas automáticas de faturamento e sinais recebidos
 *  - Menu interativo na barra superior do Google Sheets ("🚕 Litoral em Movimento")
 *  - Endpoints REST API (GET e POST com CORS) para integração com Web / GitHub Hosting
 *
 * INSTRUÇÕES DE INSTALAÇÃO:
 * 1. Abra uma nova Planilha no Google Sheets (https://sheets.new).
 * 2. No menu superior, clique em: Extensões -> Apps Script.
 * 3. Apague todo o conteúdo padrão e cole este código completo (Code.gs).
 * 4. Salve o projeto (Ctrl + S ou ícone de disquete).
 * 5. Execute a função "setupAllSheets" uma vez no editor OU use o menu "🚕 Litoral em Movimento" na planilha.
 * 6. Clique em "Implantar" (botão azul superior direito) -> "Nova implantação".
 * 7. Selecione o tipo: "App da Web" (Web App).
 *    - Descrição: "Litoral em Movimento API v2.0"
 *    - Executar como: "Eu" (seu e-mail)
 *    - Quem tem acesso: "Qualquer pessoa" (Anyone)
 * 8. Copie a "URL do app da Web" gerada (termina com /exec) e cole no Painel Admin do App.
 * =======================================================================================
 */

// Constantes das Abas
var SHEET_RESERVAS = 'Reservas';
var SHEET_MOTORISTAS = 'Motoristas';
var SHEET_USUARIOS_ADMIN = 'Usuarios_Admin';
var SHEET_DASHBOARD = 'Dashboard';
var SHEET_CONFIG = 'Configuracoes';
var SHEET_SAC = 'Mensagens_SAC';

/**
 * Menu personalizado que aparece no Google Sheets ao abrir a planilha
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚕 Litoral em Movimento')
    .addItem('⚙️ 1. Criar / Formatar Todas as Abas e Cabeçalhos', 'setupAllSheets')
    .addItem('👥 2. Configurar Aba de Usuários & Motoristas', 'setupUserSheets')
    .addItem('📊 3. Atualizar Fórmulas do Dashboard', 'setupDashboardSheet')
    .addSeparator()
    .addItem('🧪 4. Inserir Reserva de Teste', 'insertSampleReservation')
    .addItem('🧹 5. Limpar Dados de Teste', 'clearSampleData')
    .addSeparator()
    .addItem('ℹ️ 6. Instruções da API Web App', 'showApiInstructions')
    .addToUi();
}

/**
 * Configura apenas as abas de usuários e motoristas
 */
function setupUserSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupMotoristasSheet(ss);
  setupUsuariosAdminSheet(ss);
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Abas Motoristas e Usuarios_Admin configuradas com sucesso!', '👥 Usuários & Senhas', 5);
  } catch (e) {}
}

/**
 * Função Mestra que cria e formata todas as abas necessárias
 */
function setupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetReservas = setupReservasSheet(ss);
  var sheetMotoristas = setupMotoristasSheet(ss);
  var sheetUsuariosAdmin = setupUsuariosAdminSheet(ss);
  var sheetConfig = setupConfigSheet(ss);
  var sheetSac = setupSacSheet(ss);
  var sheetDashboard = setupDashboardSheet(ss);
  
  // Ativa a aba de Reservas como padrão
  ss.setActiveSheet(sheetReservas);
  
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Todas as 6 abas (Reservas, Motoristas, Usuarios_Admin, Mensagens_SAC, Dashboard, Configurações) foram configuradas!',
      '✅ Litoral em Movimento',
      5
    );
  } catch (e) {
    // Modo headless
  }

  return {
    status: 'success',
    message: 'Todas as 6 abas e cabeçalhos foram criados e formatados com sucesso!',
    sheets: [SHEET_RESERVAS, SHEET_MOTORISTAS, SHEET_USUARIOS_ADMIN, SHEET_SAC, SHEET_DASHBOARD, SHEET_CONFIG]
  };
}

/**
 * 1. Configuração Completa da Aba de Reservas
 */
function setupReservasSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_RESERVAS) || ss.insertSheet(SHEET_RESERVAS);
  
  var headers = [
    'ID Sistema',              // A (1)
    'Código Voucher',          // B (2)
    'Data Criação',            // C (3)
    'Nome Cliente',            // D (4)
    'Telefone (WhatsApp)',     // E (5)
    'E-mail',                  // F (6)
    'Origem',                  // G (7)
    'Detalhes Origem',         // H (8)
    'Destino',                 // I (9)
    'Detalhes Destino',        // J (10)
    'Data da Corrida',         // K (11)
    'Horário de Embarque',     // L (12)
    'Qtd Passageiros',         // M (13)
    'Tipo de Viagem',          // N (14)
    'Malas',                   // O (15)
    'Cadeirinha Bebê',         // P (16)
    'Valor Total (R$)',        // Q (17)
    'Sinal 50% (R$)',          // R (18)
    'Saldo no Embarque (R$)',  // S (19)
    'Sinal 50% Pago?',         // T (20)
    'Forma de Pagamento',      // U (21)
    'Status Reserva',          // V (22)
    'Status Pagamento',        // W (23)
    'Nº do Voo / Obs Aerop.',  // X (24)
    'Motorista Atribuído',     // Y (25)
    'Veículo da Frota',        // Z (26)
    'Observações Internas'     // AA (27)
  ];

  // Se estiver vazia ou com cabeçalho desatualizado, redefine a primeira linha
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Estilização Visual do Cabeçalho
  headerRange
    .setBackground('#0F172A') // Slate 900 Navy
    .setFontColor('#FFFFFF') // Texto branco
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontFamily('Arial')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
    
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);

  // Formatação de Colunas Específicas
  // Q, R, S: Formato Moeda Brasileira R$ #,##0.00
  sheet.getRange('Q2:S').setNumberFormat('R$ #,##0.00');
  
  // A, B, E: Texto centralizado
  sheet.getRange('A2:C').setHorizontalAlignment('center');
  sheet.getRange('K2:L').setHorizontalAlignment('center');
  sheet.getRange('M2:P').setHorizontalAlignment('center');
  sheet.getRange('T2:W').setHorizontalAlignment('center');
  sheet.getRange('Q2:S').setHorizontalAlignment('right');

  // Validação de Dados (Dropdowns Inteligentes)
  // Tipo de Viagem (Col N / 14)
  var ruleTipo = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Individual (Exclusivo)', 'Compartilhada'], true)
    .build();
  sheet.getRange('N2:N').setDataValidation(ruleTipo);

  // Cadeirinha Bebê (Col P / 16)
  var ruleSimNao = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Sim', 'Não'], true)
    .build();
  sheet.getRange('P2:P').setDataValidation(ruleSimNao);

  // Sinal Pago? (Col T / 20)
  sheet.getRange('T2:T').setDataValidation(ruleSimNao);

  // Forma de Pagamento (Col U / 21)
  var rulePagamento = SpreadsheetApp.newDataValidation()
    .requireValueInList(['PIX Copia e Cola', 'PIX QR Code', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro no Embarque'], true)
    .build();
  sheet.getRange('U2:U').setDataValidation(rulePagamento);

  // Status da Reserva (Col V / 22)
  var ruleStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendente', 'Confirmado', 'A caminho', 'Em Rota', 'Concluído', 'Cancelado'], true)
    .build();
  sheet.getRange('V2:V').setDataValidation(ruleStatus);

  // Status Pagamento (Col W / 23)
  var ruleStatusPag = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Aguardando Sinal 50%', 'Sinal 50% Pago (Confirmado)', 'Totalmente Pago', 'Reembolsado'], true)
    .build();
  sheet.getRange('W2:W').setDataValidation(ruleStatusPag);

  // Formatação Condicional por Cores
  var rules = [];
  
  // Verde para Confirmado
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Confirmado')
    .setBackground('#DCFCE7') // Verde claro
    .setFontColor('#166534')
    .setRanges([sheet.getRange('V2:V')])
    .build());

  // Âmbar para Pendente
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Pendente')
    .setBackground('#FEF3C7') // Amarelo claro
    .setFontColor('#92400E')
    .setRanges([sheet.getRange('V2:V')])
    .build());

  // Azul para A caminho / Em Rota
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('A caminho')
    .setBackground('#E0F2FE') // Azul claro
    .setFontColor('#075985')
    .setRanges([sheet.getRange('V2:V')])
    .build());

  // Verde para Sinal Pago = Sim
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Sim')
    .setBackground('#DCFCE7')
    .setFontColor('#166534')
    .setRanges([sheet.getRange('T2:T')])
    .build());

  // Vermelho para Cancelado
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Cancelado')
    .setBackground('#FEE2E2')
    .setFontColor('#991B1B')
    .setRanges([sheet.getRange('V2:V')])
    .build());

  sheet.setConditionalFormatRules(rules);

  // Ajuste de Largura das Colunas
  sheet.setColumnWidth(1, 110);  // ID
  sheet.setColumnWidth(2, 110);  // Voucher
  sheet.setColumnWidth(3, 140);  // Data Criacao
  sheet.setColumnWidth(4, 180);  // Nome
  sheet.setColumnWidth(5, 140);  // Telefone
  sheet.setColumnWidth(6, 180);  // Email
  sheet.setColumnWidth(7, 160);  // Origem
  sheet.setColumnWidth(8, 180);  // Detalhes Origem
  sheet.setColumnWidth(9, 160);  // Destino
  sheet.setColumnWidth(10, 180); // Detalhes Destino
  sheet.setColumnWidth(11, 110); // Data Corrida
  sheet.setColumnWidth(12, 100); // Horario
  sheet.setColumnWidth(13, 90);  // Passag
  sheet.setColumnWidth(14, 140); // Tipo
  sheet.setColumnWidth(15, 80);  // Malas
  sheet.setColumnWidth(16, 100); // Cadeira
  sheet.setColumnWidth(17, 120); // Total
  sheet.setColumnWidth(18, 120); // Sinal 50%
  sheet.setColumnWidth(19, 130); // Saldo Restante
  sheet.setColumnWidth(20, 100); // Sinal Pago
  sheet.setColumnWidth(21, 140); // Pagamento
  sheet.setColumnWidth(22, 120); // Status
  sheet.setColumnWidth(23, 170); // Status Pagamento
  sheet.setColumnWidth(24, 140); // Voo
  sheet.setColumnWidth(25, 150); // Motorista
  sheet.setColumnWidth(26, 170); // Veiculo
  sheet.setColumnWidth(27, 200); // Observacoes

  return sheet;
}

/**
 * 2. Configuração da Aba de Motoristas (Com Usuários Curtos e PINs)
 */
function setupMotoristasSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_MOTORISTAS) || ss.insertSheet(SHEET_MOTORISTAS);
  
  var headers = [
    'ID Motorista',
    'Nome do Motorista',
    'Usuário (Login Curto)',
    'PIN / Senha de Acesso',
    'Trocar Senha 1º Acesso?',
    'Telefone (WhatsApp)',
    'E-mail',
    'Veículo Oficial',
    'Placa',
    'Status Atual',
    'Avaliação Média',
    'Viagens Concluídas',
    'Chave PIX Repasse'
  ];

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange
    .setBackground('#1E293B')
    .setFontColor('#F8FAFC')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  // Validação: Trocar Senha 1º Acesso (Sim / Não)
  var ruleSimNao = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Sim', 'Não'], true)
    .build();
  sheet.getRange('E2:E').setDataValidation(ruleSimNao);

  // Validação: Status Atual
  var ruleStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Disponível', 'Em Viagem', 'Descanso'], true)
    .build();
  sheet.getRange('J2:J').setDataValidation(ruleStatus);

  // Inserir motoristas padrão caso a tabela esteja vazia
  if (sheet.getLastRow() <= 1) {
    sheet.appendRow([
      'drv-01',
      'Eduardo Silveira',
      'eduardo',
      '1234',
      'Sim',
      '(12) 98850-6597',
      'eduardo.motorista@litoralemmovimento.com.br',
      'Chevrolet Spin Premier 7L • 2024 (Ar-Cond. Duplo, USB)',
      'SP-LIT7A24',
      'Disponível',
      4.98,
      342,
      '12988506597'
    ]);
    sheet.appendRow([
      'drv-02',
      'Edivam Santos',
      'edivam',
      '1234',
      'Sim',
      '(12) 98850-6597',
      'edivam.motorista@litoralemmovimento.com.br',
      'Chevrolet Spin LTZ 7L • 2024 (Bancos em Couro, Wi-Fi)',
      'SP-MOV7B88',
      'Disponível',
      4.97,
      310,
      '12988506597'
    ]);
    sheet.appendRow([
      'drv-03',
      'Karine Souza',
      'karine',
      '1234',
      'Sim',
      '(12) 98850-6597',
      'karine.motorista@litoralemmovimento.com.br',
      'Chevrolet Spin Premier 7L • 2024',
      'SP-LIT7C50',
      'Disponível',
      4.99,
      275,
      '12988506597'
    ]);
  }

  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }

  return sheet;
}

/**
 * 2.1 Configuração da Aba de Administradores & Usuários do Painel
 */
function setupUsuariosAdminSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_USUARIOS_ADMIN) || ss.insertSheet(SHEET_USUARIOS_ADMIN);

  var headers = [
    'ID Usuário',
    'Usuário (Login Curto)',
    'Nome Completo',
    'Cargo / Função',
    'Senha de Acesso',
    'Trocar Senha 1º Acesso?',
    'E-mail',
    'Telefone (WhatsApp)',
    'Status'
  ];

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange
    .setBackground('#0F172A')
    .setFontColor('#F8FAFC')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  // Validação: Trocar Senha (Sim / Não)
  var ruleSimNao = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Sim', 'Não'], true)
    .build();
  sheet.getRange('F2:F').setDataValidation(ruleSimNao);

  // Validação: Status (Ativo / Inativo)
  var ruleStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Ativo', 'Inativo'], true)
    .build();
  sheet.getRange('I2:I').setDataValidation(ruleStatus);

  if (sheet.getLastRow() <= 1) {
    sheet.appendRow([
      'adm-05',
      'alan',
      'Alan Morais',
      'Super Admin',
      'alan2026',
      'Não',
      'alanpkmorais@gmail.com',
      '(12) 98850-6597',
      'Ativo'
    ]);
    sheet.appendRow([
      'adm-01',
      'eduardo',
      'Eduardo Silveira',
      'Gestão Operacional',
      'litoral2026',
      'Sim',
      'eduardo@litoralemmovimento.com.br',
      '(12) 98850-6597',
      'Ativo'
    ]);
    sheet.appendRow([
      'adm-02',
      'edivam',
      'Edivam Santos',
      'Gestão de Frota',
      'litoral2026',
      'Sim',
      'edivam@litoralemmovimento.com.br',
      '(12) 98850-6597',
      'Ativo'
    ]);
    sheet.appendRow([
      'adm-03',
      'karine',
      'Karine Souza',
      'Gestão de Atendimento',
      'litoral2026',
      'Sim',
      'karine@litoralemmovimento.com.br',
      '(12) 98850-6597',
      'Ativo'
    ]);
    sheet.appendRow([
      'adm-04',
      'michelly',
      'Michelly Santos',
      'Gestão Administrativa',
      'litoral2026',
      'Sim',
      'michelly@litoralemmovimento.com.br',
      '(12) 98850-6597',
      'Ativo'
    ]);
    sheet.appendRow([
      'adm-06',
      'admin',
      'Administrador Geral',
      'Gestão Geral',
      'litoral2026',
      'Não',
      'contato@litoralemmovimento.com.br',
      '(12) 98850-6597',
      'Ativo'
    ]);
  }

  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }

  return sheet;
}

/**
 * 3. Configuração da Aba de SAC / Mensagens de Suporte
 */
function setupSacSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_SAC) || ss.insertSheet(SHEET_SAC);
  
  var headers = [
    'ID Mensagem',
    'Data / Hora',
    'Nome do Cliente',
    'Telefone (WhatsApp)',
    'E-mail',
    'Assunto / Categoria',
    'Mensagem / Dúvida',
    'Status Atendimento',
    'Canal de Origem',
    'Atendente / Respondido Por',
    'Notas Internas'
  ];

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange
    .setBackground('#0F172A')
    .setFontColor('#F8FAFC')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  // Validação de status SAC
  var ruleStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendente', 'Em Atendimento', 'Respondido', 'Arquivado'], true)
    .build();
  sheet.getRange('H2:H').setDataValidation(ruleStatus);

  if (sheet.getLastRow() <= 1) {
    sheet.appendRow([
      'msg-001',
      new Date().toISOString(),
      'Mariana Siqueira',
      '(11) 99876-5432',
      'mariana.siqueira@email.com',
      'Dúvida sobre Bagagem na Spin 7L',
      'Boa tarde! Gostaria de saber se cabem 4 malas grandes e 2 de bordo para 5 passageiros no Chevrolet Spin.',
      'Respondido',
      'WhatsApp / Site',
      'Atendimento (Gestão)',
      'Cliente orientada que rebatendo a última fileira cabem perfeitamente.'
    ]);
  }

  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }

  return sheet;
}

/**
 * 4. Configuração da Aba de Configurações do Negócio
 */
function setupConfigSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CONFIG) || ss.insertSheet(SHEET_CONFIG);
  
  var headers = ['Chave de Configuração', 'Valor', 'Descrição'];
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#0F172A').setFontColor('#FFFFFF').setFontWeight('bold');
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  if (sheet.getLastRow() <= 1) {
    var defaultConfigs = [
      ['NOME_EMPRESA', 'Litoral em Movimento Transfer Executivo', 'Nome oficial da empresa nos vouchers'],
      ['RESPONSAVEL_ATENDIMENTO', 'Central de Atendimento', 'Responsável principal pelo agendamento no WhatsApp'],
      ['TELEFONE_WHATSAPP', '(12) 98850-6597', 'WhatsApp oficial para suporte e atendimento'],
      ['CHAVE_PIX_OFICIAL', '12988506597', 'Chave PIX para recebimento do sinal de 50%'],
      ['BENEFICIARIO_PIX', 'Litoral em Movimento • Transfer Executivo', 'Nome cadastrado no banco para conferência PIX'],
      ['BANCO_PIX', 'Banco Inter', 'Instituição bancária receptora'],
      ['PERCENTUAL_SINAL', '50%', 'Exigência de 50% de entrada para confirmação de vaga na Spin 7L'],
      ['FROTA_OFICIAL', 'Chevrolet Spin 7 Lugares', 'Modelo exclusivo da frota para conforto de famílias e malas'],
      ['ROTAS_PRINCIPAIS', 'São Paulo ⇌ São Sebastião, Ilhabela, Caraguatatuba', 'Corredor principal de atendimento'],
      ['HORARIOS_SUBIDA_DIARIOS', '05:00, 08:30, 14:00, 18:30', 'Horários oficiais diários de subida (Litoral ➔ São Paulo / GRU)'],
      ['HORARIOS_DESCIDA_SEMANA', '11:30, 14:30, 17:30, 22:00', 'Horários oficiais de descida de segunda a sexta (São Paulo ➔ Litoral)'],
      ['HORARIOS_DESCIDA_FDS', '11:30, 13:00, 17:30, 21:30', 'Horários oficiais de descida de sábado e domingo (São Paulo ➔ Litoral)'],
      ['TARIFA_CARAGUA_TIETE', 'R$ 80,00', 'Valor por vaga: Caraguatatuba (a partir da Rodoviária) ⇌ Metrô Tietê'],
      ['TARIFA_SAO_SEBASTIAO_TIETE', 'R$ 90,00', 'Valor por vaga: São Sebastião (Balsa / Centro) ⇌ Metrô Tietê'],
      ['TARIFA_AEROPORTO_GRU', 'R$ 150,00', 'Valor por vaga: Aeroporto Internacional de Guarulhos (GRU) ⇌ Litoral'],
      ['EQUIPE_GESTAO', 'Eduardo, Edivam, Claudinei, Karine', 'Equipe oficial autorizada para gestão de reservas e frota'],
      ['SENHA_SUPERADMIN_ALAN', 'alan2026', 'Senha master de acesso do Super Admin Alan Morais para Conexão API e Banco de Dados'],
      ['SENHA_ADMIN_GERAL', 'litoral2026', 'Senha de acesso para o Painel Geral Administrativo']
    ];

    sheet.getRange(2, 1, defaultConfigs.length, 3).setValues(defaultConfigs);
  }

  sheet.autoResizeColumn(1);
  sheet.autoResizeColumn(2);
  sheet.autoResizeColumn(3);

  return sheet;
}

/**
 * 4. Configuração da Aba de Dashboard Executivo (Fórmulas Automáticas)
 */
function setupDashboardSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_DASHBOARD) || ss.insertSheet(SHEET_DASHBOARD);
  sheet.clear();

  // Título do Dashboard
  sheet.getRange('A1:E1').merge();
  sheet.getRange('A1')
    .setValue('📊 DASHBOARD EXECUTIVO - LITORAL EM MOVIMENTO')
    .setBackground('#0F172A')
    .setFontColor('#F59E0B')
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 45);

  sheet.getRange('A2:E2').merge();
  sheet.getRange('A2')
    .setValue('Métricas em tempo real calculadas automaticamente a partir da aba "Reservas"')
    .setBackground('#1E293B')
    .setFontColor('#94A3B8')
    .setFontSize(9)
    .setHorizontalAlignment('center');

  // Bloco de KPIs - Linha 4 a 8
  var kpiLabels = [
    ['Métrica Operacional / Financeira', 'Resultado em Tempo Real', 'Fórmula Google Sheets'],
    ['Total de Reservas Registradas', '=COUNTA(Reservas!A2:A)', 'Total absoluto de vouchers'],
    ['Reservas Confirmadas (Sinal Pago)', '=COUNTIF(Reservas!V2:V; "Confirmado")', 'Viagens com sinal de 50% garantido'],
    ['Reservas Pendentes de Sinal', '=COUNTIF(Reservas!V2:V; "Pendente")', 'Clientes aguardando pagamento do PIX'],
    ['Viagens Concluídas', '=COUNTIF(Reservas!V2:V; "Concluído")', 'Transfers executados com sucesso'],
    ['Faturamento Bruto Total (R$)', '=SUM(Reservas!Q2:Q)', 'Valor total de todas as reservas'],
    ['Sinais de 50% Recebidos (R$)', '=SUMIFS(Reservas!R2:R; Reservas!T2:T; "Sim")', 'Valores já creditados via PIX/Cartão'],
    ['Saldos Restantes a Receber (R$)', '=SUMIFS(Reservas!S2:S; Reservas!V2:V; "<>Cancelado")', 'Valores a receber no embarque da minivan']
  ];

  sheet.getRange(4, 1, kpiLabels.length, 3).setValues(kpiLabels);
  
  // Estilo Cabeçalho KPI
  sheet.getRange('A4:C4')
    .setBackground('#0F172A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Formatação de Valores
  sheet.getRange('B5:B8').setHorizontalAlignment('center').setFontWeight('bold').setFontSize(12);
  sheet.getRange('B9:B11').setNumberFormat('R$ #,##0.00').setFontWeight('bold').setFontSize(12).setHorizontalAlignment('right').setFontColor('#065F46');

  sheet.getRange('A5:A11').setFontWeight('bold').setBackground('#F8FAFC');
  sheet.getRange('C5:C11').setFontColor('#64748B').setFontSize(9);

  // Bordas
  sheet.getRange(4, 1, kpiLabels.length, 3).setBorder(true, true, true, true, true, true, '#CBD5E1', SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(1, 280);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 300);

  return sheet;
}

/**
 * =========================================================================
 * ENDPOINT GET (API REST)
 * =========================================================================
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getReservations';
  
  // Endpoint de Ping
  if (action === 'ping') {
    return createJsonResponse({
      status: 'ok',
      message: 'Banco de dados Google Apps Script conectado com sucesso!',
      version: '2.0',
      timestamp: new Date().toISOString()
    });
  }

  // Endpoint de Setup Automático via URL
  if (action === 'setup') {
    var setupResult = setupAllSheets();
    return createJsonResponse(setupResult);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Endpoint: Retornar Configurações (com proteção de senhas)
  if (action === 'getConfig') {
    var sheetConf = ss.getSheetByName(SHEET_CONFIG) || setupConfigSheet(ss);
    var confData = sheetConf.getDataRange().getValues();
    var configs = {};
    for (var c = 1; c < confData.length; c++) {
      var key = String(confData[c][0] || '').trim();
      if (!key) continue;
      // Não expor senhas em chamadas públicas
      if (key.indexOf('SENHA_') === 0 && (!e.parameter.authToken || e.parameter.authToken !== 'AUTH_ADMIN')) {
        continue;
      }
      configs[key] = confData[c][1];
    }
    return createJsonResponse(configs);
  }

  // Endpoint: Retornar Motoristas (Com Usuários Curtos e PINs)
  if (action === 'getDrivers') {
    var sheetDrv = ss.getSheetByName(SHEET_MOTORISTAS) || setupMotoristasSheet(ss);
    var drvData = sheetDrv.getDataRange().getValues();
    var drivers = [];
    var isNewSchema = drvData.length > 0 && String(drvData[0][2] || '').toLowerCase().indexOf('usuário') !== -1;

    for (var d = 1; d < drvData.length; d++) {
      if (!drvData[d][0]) continue;
      if (isNewSchema) {
        drivers.push({
          id: String(drvData[d][0]),
          name: String(drvData[d][1]),
          username: String(drvData[d][2] || drvData[d][1].toString().split(' ')[0].toLowerCase()),
          pin: String(drvData[d][3] || '1234'),
          mustChangePassword: String(drvData[d][4] || '').toLowerCase() === 'sim',
          phone: String(drvData[d][5]),
          email: String(drvData[d][6] || ''),
          vehicleModel: String(drvData[d][7]),
          plate: String(drvData[d][8]),
          status: String(drvData[d][9]),
          rating: Number(drvData[d][10]) || 5.0,
          totalTrips: Number(drvData[d][11]) || 0,
          pixKey: String(drvData[d][12] || '')
        });
      } else {
        drivers.push({
          id: String(drvData[d][0]),
          name: String(drvData[d][1]),
          username: String(drvData[d][1]).split(' ')[0].toLowerCase(),
          pin: '1234',
          mustChangePassword: false,
          phone: String(drvData[d][2]),
          email: String(drvData[d][3] || ''),
          vehicleModel: String(drvData[d][4]),
          plate: String(drvData[d][5]),
          status: String(drvData[d][6]),
          rating: Number(drvData[d][7]) || 5.0,
          totalTrips: Number(drvData[d][8]) || 0,
          pixKey: String(drvData[d][9] || '')
        });
      }
    }
    return createJsonResponse(drivers);
  }

  // Endpoint: Retornar Usuários Administradores
  if (action === 'getAdmins' || action === 'getUsers') {
    var sheetAdm = ss.getSheetByName(SHEET_USUARIOS_ADMIN) || setupUsuariosAdminSheet(ss);
    var admData = sheetAdm.getDataRange().getValues();
    var admins = [];
    for (var a = 1; a < admData.length; a++) {
      if (!admData[a][0] && !admData[a][1]) continue;
      admins.push({
        id: String(admData[a][0] || ('adm-' + a)),
        username: String(admData[a][1] || '').trim().toLowerCase(),
        name: String(admData[a][2] || ''),
        role: String(admData[a][3] || 'Administrador'),
        password: String(admData[a][4] || 'litoral2026'),
        mustChangePassword: String(admData[a][5] || '').toLowerCase() === 'sim',
        email: String(admData[a][6] || ''),
        phone: String(admData[a][7] || ''),
        status: String(admData[a][8] || 'Ativo')
      });
    }
    return createJsonResponse(admins);
  }

  // Endpoint: Retornar Mensagens do SAC
  if (action === 'getContactMessages' || action === 'getMessages') {
    var sheetSac = ss.getSheetByName(SHEET_SAC) || setupSacSheet(ss);
    var sacData = sheetSac.getDataRange().getValues();
    var messages = [];
    for (var m = 1; m < sacData.length; m++) {
      if (!sacData[m][0]) continue;
      messages.push({
        id: String(sacData[m][0]),
        createdAt: String(sacData[m][1]),
        name: String(sacData[m][2]),
        phone: String(sacData[m][3]),
        email: String(sacData[m][4] || ''),
        subject: String(sacData[m][5] || 'Geral'),
        message: String(sacData[m][6] || ''),
        status: String(sacData[m][7] || 'Pendente'),
        channel: String(sacData[m][8] || 'Site / WhatsApp'),
        answeredBy: String(sacData[m][9] || ''),
        adminNotes: String(sacData[m][10] || '')
      });
    }
    return createJsonResponse(messages);
  }

  // Endpoint Padrão: Retornar Reservas
  var sheet = ss.getSheetByName(SHEET_RESERVAS) || setupReservasSheet(ss);
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return createJsonResponse([]);
  }

  var reservations = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue; // linha vazia

    reservations.push({
      id: String(row[0]),
      code: String(row[1]),
      createdAt: String(row[2]),
      customerName: String(row[3]),
      customerPhone: String(row[4]),
      customerEmail: String(row[5] || ''),
      origin: String(row[6]),
      originDetails: String(row[7] || ''),
      destination: String(row[8]),
      destinationDetails: String(row[9] || ''),
      date: String(row[10]),
      time: String(row[11]),
      passengers: Number(row[12]) || 1,
      tripType: String(row[13] || 'Individual (Exclusivo)'),
      luggageCount: Number(row[14]) || 1,
      hasChildSeat: row[15] === true || String(row[15]).toLowerCase() === 'sim' || String(row[15]).toLowerCase() === 'true',
      totalPrice: Number(row[16]) || 0,
      depositAmount: Number(row[17]) || 0,
      remainingAmount: Number(row[18]) || 0,
      depositPaid: row[19] === true || String(row[19]).toLowerCase() === 'sim' || String(row[19]).toLowerCase() === 'true',
      paymentMethod: String(row[20] || 'PIX'),
      status: String(row[21] || 'Pendente'),
      paymentStatus: String(row[22] || 'Aguardando Sinal 50%'),
      flightNumber: String(row[23] || ''),
      assignedDriverName: String(row[24] || ''),
      driverVehicle: String(row[25] || ''),
      notes: String(row[26] || '')
    });
  }

  return createJsonResponse(reservations);
}

/**
 * =========================================================================
 * ENDPOINT POST (API REST)
 * =========================================================================
 */
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_RESERVAS) || setupReservasSheet(ss);
  
  try {
    var payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    var action = payload.action || 'createReservation';

    // 1. Criar Nova Reserva
    if (action === 'createReservation') {
      var res = payload.reservation || payload;
      var newId = res.id || ('res-' + new Date().getTime());
      var newCode = res.code || ('LM-' + Math.floor(1000 + Math.random() * 9000));
      var createdAt = res.createdAt || new Date().toISOString();

      var totalPrice = Number(res.totalPrice) || 0;
      var depositAmount = res.depositAmount ? Number(res.depositAmount) : Number((totalPrice * 0.5).toFixed(2));
      var remainingAmount = res.remainingAmount ? Number(res.remainingAmount) : Number((totalPrice - depositAmount).toFixed(2));
      var depositPaid = res.depositPaid === true;

      var newRow = [
        newId,
        newCode,
        createdAt,
        res.customerName || '',
        res.customerPhone || '',
        res.customerEmail || '',
        res.origin || '',
        res.originDetails || '',
        res.destination || '',
        res.destinationDetails || '',
        res.date || '',
        res.time || '',
        res.passengers || 1,
        res.tripType || 'Individual (Exclusivo)',
        res.luggageCount || 1,
        res.hasChildSeat ? 'Sim' : 'Não',
        totalPrice,
        depositAmount,
        remainingAmount,
        depositPaid ? 'Sim' : 'Não',
        res.paymentMethod || 'PIX Copia e Cola',
        res.status || 'Pendente',
        res.paymentStatus || (depositPaid ? 'Sinal 50% Pago (Confirmado)' : 'Aguardando Sinal 50%'),
        res.flightNumber || '',
        res.assignedDriverName || '',
        res.driverVehicle || '',
        res.notes || ''
      ];

      sheet.appendRow(newRow);

      return createJsonResponse({
        status: 'success',
        message: 'Reserva gravada no Google Sheets com sucesso!',
        reservation: {
          id: newId,
          code: newCode,
          customerName: res.customerName,
          totalPrice: totalPrice,
          depositAmount: depositAmount,
          remainingAmount: remainingAmount,
          depositPaid: depositPaid
        }
      });
    }

    // 2. Confirmar Pagamento do Sinal de 50%
    if (action === 'confirmDeposit') {
      var targetCodeOrId = String(payload.id || payload.code || '');
      var data = sheet.getDataRange().getValues();
      var found = false;

      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === targetCodeOrId || String(data[i][1]) === targetCodeOrId) {
          sheet.getRange(i + 1, 20).setValue('Sim'); // Col T (Sinal Pago)
          if (payload.paymentMethod) sheet.getRange(i + 1, 21).setValue(payload.paymentMethod);
          sheet.getRange(i + 1, 22).setValue('Confirmado'); // Col V (Status)
          sheet.getRange(i + 1, 23).setValue('Sinal 50% Pago (Confirmado)'); // Col W (Status Pag)
          found = true;
          break;
        }
      }

      return createJsonResponse({
        status: found ? 'success' : 'not_found',
        message: found ? 'Sinal de 50% confirmado com sucesso na planilha!' : 'Reserva não encontrada.'
      });
    }

    // 3. Atualizar Status e Motorista
    if (action === 'updateStatus') {
      var codeOrId = String(payload.id || payload.code || '');
      var newStatus = payload.status;
      var dataRows = sheet.getDataRange().getValues();
      var updated = false;

      for (var j = 1; j < dataRows.length; j++) {
        if (String(dataRows[j][0]) === codeOrId || String(dataRows[j][1]) === codeOrId) {
          if (newStatus) sheet.getRange(j + 1, 22).setValue(newStatus);
          if (payload.driverName) sheet.getRange(j + 1, 25).setValue(payload.driverName);
          if (payload.driverVehicle) sheet.getRange(j + 1, 26).setValue(payload.driverVehicle);
          updated = true;
          break;
        }
      }

      return createJsonResponse({
        status: updated ? 'success' : 'not_found',
        message: updated ? 'Status da viagem atualizado na planilha!' : 'Reserva não encontrada.'
      });
    }

    // 4. Sincronização Completa de TUDO (Backup e Atualização Mestra do Dashboard)
    if (action === 'syncAll') {
      var syncResCount = 0;
      var syncDrvCount = 0;
      var syncMsgCount = 0;

      // 4.1 Sincronizar Reservas
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

          if (existingIds[itemId]) {
            sheetRes.getRange(existingIds[itemId], 1, 1, resRow.length).setValues([resRow]);
          } else {
            sheetRes.appendRow(resRow);
          }
          syncResCount++;
        }
      }

      // 4.2 Sincronizar Motoristas
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
            drvId,
            drv.name || '',
            drv.username || drv.name.toString().split(' ')[0].toLowerCase(),
            drv.pin || '1234',
            drv.mustChangePassword === true ? 'Sim' : 'Não',
            drv.phone || '',
            drv.email || '',
            drv.vehicleModel || 'Chevrolet Spin Premier 7L',
            drv.plate || '',
            drv.status || 'Disponível',
            Number(drv.rating) || 5.0,
            Number(drv.totalTrips) || 0,
            drv.pixKey || ''
          ];

          if (existingDrvIds[drvId]) {
            sheetDrv.getRange(existingDrvIds[drvId], 1, 1, drvRow.length).setValues([drvRow]);
          } else {
            sheetDrv.appendRow(drvRow);
          }
          syncDrvCount++;
        }
      }

      // 4.2.1 Sincronizar Administradores
      var syncAdmCount = 0;
      if (Array.isArray(payload.admins)) {
        var sheetAdm = ss.getSheetByName(SHEET_USUARIOS_ADMIN) || setupUsuariosAdminSheet(ss);
        var admData = sheetAdm.getDataRange().getValues();
        var existingAdmIds = {};
        for (var ea = 1; ea < admData.length; ea++) {
          if (admData[ea][0]) existingAdmIds[String(admData[ea][0])] = ea + 1;
        }

        for (var aIdx = 0; aIdx < payload.admins.length; aIdx++) {
          var adm = payload.admins[aIdx];
          var admId = String(adm.id || ('adm-' + (aIdx + 1)));
          var admRow = [
            admId,
            adm.username || '',
            adm.name || '',
            adm.role || 'Administrador',
            adm.password || 'litoral2026',
            adm.mustChangePassword === true ? 'Sim' : 'Não',
            adm.email || '',
            adm.phone || '',
            adm.status || 'Ativo'
          ];

          if (existingAdmIds[admId]) {
            sheetAdm.getRange(existingAdmIds[admId], 1, 1, admRow.length).setValues([admRow]);
          } else {
            sheetAdm.appendRow(admRow);
          }
          syncAdmCount++;
        }
      }

      // 4.3 Sincronizar Mensagens do SAC
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

          if (existingSacIds[msgId]) {
            sheetSac.getRange(existingSacIds[msgId], 1, 1, msgRow.length).setValues([msgRow]);
          } else {
            sheetSac.appendRow(msgRow);
          }
          syncMsgCount++;
        }
      }

      // 4.4 Sincronizar Configurações & Senhas
      if (payload.configs && typeof payload.configs === 'object') {
        var sheetConf = ss.getSheetByName(SHEET_CONFIG) || setupConfigSheet(ss);
        var cData = sheetConf.getDataRange().getValues();
        var confKeys = {};
        for (var ck = 1; ck < cData.length; ck++) {
          if (cData[ck][0]) confKeys[String(cData[ck][0]).trim()] = ck + 1;
        }

        for (var configKey in payload.configs) {
          var configVal = String(payload.configs[configKey]);
          if (confKeys[configKey]) {
            sheetConf.getRange(confKeys[configKey], 2).setValue(configVal);
          } else {
            sheetConf.appendRow([configKey, configVal, 'Sincronizado via Painel Admin']);
          }
        }
      }

      // 4.5 Atualizar Dashboard
      setupDashboardSheet(ss);

      return createJsonResponse({
        status: 'success',
        message: 'Sincronização total concluída com sucesso no Google Sheets!',
        details: {
          reservationsSynced: syncResCount,
          driversSynced: syncDrvCount,
          messagesSynced: syncMsgCount
        }
      });
    }

    // 5. Criar Mensagem do SAC
    if (action === 'createContactMessage') {
      var sheetSacMsg = ss.getSheetByName(SHEET_SAC) || setupSacSheet(ss);
      var msgObj = payload.message || payload;
      var newMsgId = msgObj.id || ('msg-' + new Date().getTime());
      sheetSacMsg.appendRow([
        newMsgId,
        msgObj.createdAt || new Date().toISOString(),
        msgObj.name || '',
        msgObj.phone || '',
        msgObj.email || '',
        msgObj.subject || 'Atendimento Geral',
        msgObj.message || '',
        msgObj.status || 'Pendente',
        msgObj.channel || 'Site / WhatsApp',
        msgObj.answeredBy || '',
        msgObj.adminNotes || ''
      ]);
      return createJsonResponse({
        status: 'success',
        message: 'Mensagem de SAC registrada com sucesso na planilha!'
      });
    }

    // 6. Atualizar Senha do Super Admin ou Chave de Configuração
    if (action === 'updateSuperAdminPassword' || action === 'updateConfig') {
      var sheetConf = ss.getSheetByName(SHEET_CONFIG) || setupConfigSheet(ss);
      var configKey = payload.key || 'SENHA_SUPERADMIN_ALAN';
      var newValue = String(payload.password || payload.value || '');
      var confData = sheetConf.getDataRange().getValues();
      var keyFound = false;

      for (var k = 1; k < confData.length; k++) {
        if (String(confData[k][0]).trim() === configKey.trim()) {
          sheetConf.getRange(k + 1, 2).setValue(newValue);
          keyFound = true;
          break;
        }
      }

      if (!keyFound) {
        sheetConf.appendRow([configKey, newValue, 'Configuração atualizada via API / Painel']);
      }

      return createJsonResponse({
        status: 'success',
        message: 'Senha / Configuração (' + configKey + ') atualizada com sucesso no Google Sheets!',
        key: configKey,
        value: newValue
      });
    }

    // 7. Atualizar Senha / PIN do Motorista (e desativar Troca Obrigatória de 1º Acesso)
    if (action === 'updateDriverPassword') {
      var sheetDrvPw = ss.getSheetByName(SHEET_MOTORISTAS) || setupMotoristasSheet(ss);
      var drvRows = sheetDrvPw.getDataRange().getValues();
      var targetDrvId = String(payload.driverId || '').trim().toLowerCase();
      var targetUsername = String(payload.username || '').trim().toLowerCase();
      var newPin = String(payload.pin || payload.password || '').trim();
      var mustChange = payload.mustChangePassword === true ? 'Sim' : 'Não';
      var drvUpdated = false;

      for (var dr = 1; dr < drvRows.length; dr++) {
        var rowDrvId = String(drvRows[dr][0] || '').trim().toLowerCase();
        var rowDrvUser = String(drvRows[dr][2] || '').trim().toLowerCase();
        if ((targetDrvId && rowDrvId === targetDrvId) || (targetUsername && rowDrvUser === targetUsername)) {
          sheetDrvPw.getRange(dr + 1, 4).setValue(newPin); // Col D: PIN
          sheetDrvPw.getRange(dr + 1, 5).setValue(mustChange); // Col E: Trocar Senha 1º Acesso
          drvUpdated = true;
          break;
        }
      }

      return createJsonResponse({
        status: drvUpdated ? 'success' : 'not_found',
        message: drvUpdated
          ? 'PIN do motorista atualizado na planilha e flag de 1º acesso desativada!'
          : 'Motorista não encontrado na planilha.'
      });
    }

    // 8. Atualizar Senha de Usuário Administrador (e desativar Troca Obrigatória de 1º Acesso)
    if (action === 'updateAdminPassword') {
      var sheetAdmPw = ss.getSheetByName(SHEET_USUARIOS_ADMIN) || setupUsuariosAdminSheet(ss);
      var admRows = sheetAdmPw.getDataRange().getValues();
      var targetAdmId = String(payload.adminId || '').trim().toLowerCase();
      var targetAdmUser = String(payload.username || '').trim().toLowerCase();
      var newPass = String(payload.password || '').trim();
      var mustChangeAdm = payload.mustChangePassword === true ? 'Sim' : 'Não';
      var admUpdated = false;

      for (var ar = 1; ar < admRows.length; ar++) {
        var rowAdmId = String(admRows[ar][0] || '').trim().toLowerCase();
        var rowAdmUser = String(admRows[ar][1] || '').trim().toLowerCase();
        if ((targetAdmId && rowAdmId === targetAdmId) || (targetAdmUser && rowAdmUser === targetAdmUser)) {
          sheetAdmPw.getRange(ar + 1, 5).setValue(newPass); // Col E: Senha
          sheetAdmPw.getRange(ar + 1, 6).setValue(mustChangeAdm); // Col F: Trocar Senha 1º Acesso
          admUpdated = true;

          // Se for Alan Morais ou Super Admin, atualiza também a chave na aba de configurações
          if (rowAdmUser === 'alan' || targetAdmUser === 'alan') {
            var sheetCfg = ss.getSheetByName(SHEET_CONFIG) || setupConfigSheet(ss);
            var cfgData = sheetCfg.getDataRange().getValues();
            for (var cp = 1; cp < cfgData.length; cp++) {
              if (String(cfgData[cp][0]).trim() === 'SENHA_SUPERADMIN_ALAN') {
                sheetCfg.getRange(cp + 1, 2).setValue(newPass);
                break;
              }
            }
          }
          break;
        }
      }

      return createJsonResponse({
        status: admUpdated ? 'success' : 'not_found',
        message: admUpdated
          ? 'Senha do administrador atualizada na planilha e flag de 1º acesso desativada!'
          : 'Usuário administrador não encontrado na planilha.'
      });
    }

    // 9. Executar Setup Geral
    if (action === 'setup') {
      var resSetup = setupAllSheets();
      return createJsonResponse(resSetup);
    }

    return createJsonResponse({ status: 'error', message: 'Ação não reconhecida: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Utilitário de Resposta JSON
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Insere uma reserva de teste para validação de layout
 */
function insertSampleReservation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_RESERVAS) || setupReservasSheet(ss);
  
  var sampleId = 'res-' + new Date().getTime();
  var sampleCode = 'LM-' + Math.floor(1000 + Math.random() * 9000);
  
  sheet.appendRow([
    sampleId,
    sampleCode,
    new Date().toISOString(),
    'Dr. Fernando Albuquerque (Exemplo)',
    '(11) 98765-4321',
    'fernando.exemplo@gmail.com',
    'Aeroporto Internacional de Guarulhos (GRU)',
    'Terminal 3 - Desembarque Internacional',
    'São Sebastião',
    'Porto da Balsa - Centro Histórico',
    new Date().toISOString().split('T')[0],
    '14:30',
    4,
    'Individual (Exclusivo)',
    4,
    'Sim',
    580.00,
    290.00,
    290.00,
    'Sim',
    'PIX Copia e Cola',
    'Confirmado',
    'Sinal 50% Pago (Confirmado)',
    'LA-8012 (LATAM)',
    'Carlos Silva',
    'Chevrolet Spin Premier 7L (SP-LIT7A24)',
    'Reserva de teste inserida para verificação de layout.'
  ]);
  
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Reserva de teste inserida com sucesso!', '🧪 Teste', 4);
  } catch (e) {}
}

/**
 * Limpa dados de teste
 */
function clearSampleData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_RESERVAS);
  if (sheet && sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast('Dados limpos! Planilha pronta para receber clientes reais.', '🧹 Limpeza', 4);
    } catch (e) {}
  }
}

/**
 * Exibe caixa de diálogo com ajuda
 */
function showApiInstructions() {
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    '🚕 Litoral em Movimento - API Google Apps Script',
    'Para conectar este backend ao seu aplicativo:\n\n' +
    '1. Clique em "Implantar" (canto superior direito) -> "Nova implantação"\n' +
    '2. Tipo: "App da Web"\n' +
    '3. Executar como: "Eu" (seu e-mail)\n' +
    '4. Quem tem acesso: "Qualquer pessoa" (Anyone)\n' +
    '5. Copie a URL gerada e cole no Painel Admin do App.',
    ui.ButtonSet.OK
  );
}
