# 🚀 Guia de Integração: Banco de Dados Google Sheets (Google Apps Script)

Este documento contém todas as instruções para transformar uma **Planilha Google gratuita** no banco de dados oficial do seu aplicativo de transfers (**Litoral em Movimento**) para hospedagem no **GitHub / GitHub Pages / Vercel / Netlify**.

---

## 📋 Passo 1: Criar a Planilha Google

1. Acesse [Google Sheets](https://sheets.google.com) e clique em **Criar planilha em branco**.
2. Dê um nome para a planilha (exemplo: `Litoral em Movimento - Banco de Reservas`).

---

## ⚡ Passo 2: Adicionar o Google Apps Script

1. No menu superior da planilha, clique em **Extensões** > **Apps Script**.
2. No editor de código aberto, apague qualquer código existente no arquivo `Código.gs` (ou `Code.gs`).
3. Abra o arquivo [`google-apps-script/Code.gs`](./Code.gs) deste repositório, **copie todo o seu conteúdo** e cole no editor do Google Apps Script.
4. Clique no ícone de disquete **Salvar projeto** (ou pressione `Ctrl + S` / `Cmd + S`).

---

## 🌐 Passo 3: Publicar como App da Web (Web App API)

1. No canto superior direito do Apps Script, clique no botão azul **Implantar** > **Nova implantação**.
2. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha **App da Web** (Web App).
3. Preencha as configurações exatamente assim:
   - **Descrição:** `Litoral em Movimento API`
   - **Executar como:** `Eu (seu e-mail)`
   - **Quem tem acesso:** `Qualquer pessoa` *(Isso é necessário para que seu site hospedado no GitHub envie as reservas via fetch)*
4. Clique em **Implantar**.
5. O Google solicitará permissões de acesso:
   - Clique em **Autorizar acesso**.
   - Escolha sua conta Google.
   - Clique em **Avançado** (na parte inferior) > **Acessar Litoral em Movimento API (não seguro)**.
   - Clique em **Permitir**.
6. **Copie a "URL do app da Web"** gerada. Ela terá o seguinte formato:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

---

## 🔗 Passo 4: Conectar ao Aplicativo

Você tem duas formas muito simples de conectar a URL:

### Opção A: Pelo Painel Admin do Aplicativo (Recomendado & Instantâneo)
1. Abra seu site no navegador.
2. Acesse o **Painel Administrativo** no rodapé (ou clique em **Admin**).
3. Clique na aba **"Integração Google Sheets / Apps Script"**.
4. Cole a URL do seu App da Web no campo e clique em **Testar Conexão** & **Salvar**.
5. Pronto! Todas as novas reservas, confirmações de sinal de 50% e alterações de status serão sincronizadas em tempo real diretamente para sua planilha Google!

### Opção B: Por Variável de Ambiente no GitHub / `.env`
No arquivo `.env` do seu projeto ou nas variáveis de ambiente do repositório GitHub:
```env
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec
```

---

## 🔐 Onde Criar Usuários, Senhas e Troca no 1º Acesso na Planilha

Você pode cadastrar e gerenciar as senhas de **Motoristas** e de **Administradores** diretamente nas abas da sua planilha Google!

### 🚕 1. Para os Motoristas (Aba `Motoristas`)
Na aba **`Motoristas`**, você encontra as seguintes colunas essenciais de autenticação:

| Coluna | Cabeçalho | Exemplo | Descrição |
|---|---|---|---|
| **A** | `ID Motorista` | `drv-01` | Identificador único do motorista |
| **B** | `Nome do Motorista` | `Eduardo Silveira` | Nome exibido no app e vouchers |
| **C** | **`Usuário (Login Curto)`** | `eduardo` | Nome de usuário curto para login direto |
| **D** | **`PIN / Senha de Acesso`** | `1234` | Senha ou PIN de 4 a 6 dígitos |
| **E** | **`Trocar Senha 1º Acesso?`** | `Sim` ou `Não` | Se marcado como `Sim`, o motorista é forçado a criar um novo PIN no primeiro login |
| **F** | `Telefone (WhatsApp)` | `(12) 98850-6597` | Contato do motorista |
| **G** | `E-mail` | `eduardo@litoralemmovimento.com.br` | E-mail corporativo |
| **H** | `Veículo Oficial` | `Chevrolet Spin Premier 7L` | Carro de operação |
| **I** | `Placa` | `SP-LIT7A24` | Placa do veículo |
| **J** | `Status Atual` | `Disponível` | Disponível / Em Viagem / Descanso |
| **K** | `Avaliação Média` | `4.98` | Nota média de passageiros |
| **L** | `Viagens Concluídas` | `342` | Total de corridas |
| **M** | `Chave PIX Repasse` | `12988506597` | Chave PIX para repasse |

> 💡 **Como funciona a troca no 1º Acesso do Motorista:**
> 1. Você cadastra o motorista com o PIN inicial (ex: `1234`) e coloca a Coluna E como **`Sim`**.
> 2. O motorista abre o app, digita o usuário (`eduardo`) e o PIN (`1234`).
> 3. O sistema detecta o primeiro acesso e abre automaticamente a tela **"Criar Novo PIN Pessoal"**.
> 4. O motorista define seu novo PIN seguro.
> 5. O aplicativo atualiza imediatamente a planilha: a Coluna D recebe o novo PIN e a Coluna E é alterada para **`Não`** automaticamente!

---

### 🛡️ 2. Para os Usuários do Painel Admin (Aba `Usuarios_Admin`)
Na aba **`Usuarios_Admin`**, você pode cadastrar toda a equipe de gestão:

| Coluna | Cabeçalho | Exemplo | Descrição |
|---|---|---|---|
| **A** | `ID Usuário` | `adm-05` | Identificador único do administrador |
| **B** | **`Usuário (Login Curto)`** | `alan` | Usuário curto para entrar no painel |
| **C** | `Nome Completo` | `Alan Morais` | Nome completo do gestor |
| **D** | `Cargo / Função` | `Super Admin` | Cargo (Super Admin, Gestão Operacional, etc.) |
| **E** | **`Senha de Acesso`** | `alan2026` | Senha atual de acesso |
| **F** | **`Trocar Senha 1º Acesso?`** | `Sim` ou `Não` | Se `Sim`, exige troca de senha no 1º login |
| **G** | `E-mail` | `alanpkmorais@gmail.com` | E-mail de recuperação e avisos |
| **H** | `Telefone (WhatsApp)` | `(12) 98850-6597` | WhatsApp de contato |
| **I** | `Status` | `Ativo` | `Ativo` ou `Inativo` |

> 💡 **Usuários Padrão Já Pré-Cadastrados:**
> - `alan`: Super Admin (Senha: `alan2026` - Acesso total)
> - `eduardo`: Gestão Operacional (Senha inicial: `litoral2026`, Troca no 1º Acesso: `Sim`)
> - `edivam`: Gestão de Frota (Senha inicial: `litoral2026`, Troca no 1º Acesso: `Sim`)
> - `karine`: Gestão de Atendimento (Senha inicial: `litoral2026`, Troca no 1º Acesso: `Sim`)
> - `michelly`: Gestão Administrativa (Senha inicial: `litoral2026`, Troca no 1º Acesso: `Sim`)
> - `admin`: Acesso Geral (Senha inicial: `litoral2026`)

---

## 📊 Estrutura Automática de Colunas na Planilha

O script cria automaticamente a aba `Reservas` com as seguintes 27 colunas formatadas:

| # | Coluna | Descrição |
|---|---|---|
| 1 | `ID` | Identificador único interno |
| 2 | `Código Voucher` | Código do voucher do passageiro (ex: LM-8921) |
| 3 | `Data Criação` | Data e hora ISO do agendamento |
| 4 | `Nome Cliente` | Nome completo do passageiro principal |
| 5 | `Telefone` | WhatsApp / Telefone com DDD |
| 6 | `E-mail` | E-mail de contato do passageiro |
| 7 | `Origem` | Cidade / Local de embarque |
| 8 | `Detalhes Origem` | Endereço ou terminal/portão |
| 9 | `Destino` | Cidade / Local de desembarque |
| 10 | `Detalhes Destino` | Hotel, pousada ou endereço |
| 11 | `Data Corrida` | Data agendada da viagem |
| 12 | `Horário` | Horário agendado da saída |
| 13 | `Passageiros` | Quantidade de passageiros |
| 14 | `Tipo Viagem` | Individual (Minivan Exclusiva) ou Compartilhada |
| 15 | `Malas` | Quantidade de bagagens |
| 16 | `Cadeirinha Bebê` | Sim / Não |
| 17 | `Valor Total (R$)` | Preço fechado total do transfer |
| 18 | `Sinal 50% (R$)` | **Valor do sinal obrigatório para bloqueio** |
| 19 | `Saldo Restante (R$)` | Valor a ser pago no embarque ao motorista |
| 20 | `Sinal Pago?` | Sim / Não |
| 21 | `Forma de Pagamento` | PIX / Cartão |
| 22 | `Status Reserva` | Pendente / Confirmado / A caminho / Concluído |
| 23 | `Status Pagamento` | Aguardando Sinal 50% / Sinal 50% Pago |
| 24 | `Nº Voo` | Código do voo caso seja aeroporto |
| 25 | `Motorista` | Motorista designado (ex: Carlos Silva) |
| 26 | `Veículo` | Chevrolet Spin 7L |
| 27 | `Observações` | Notas e solicitações especiais |
