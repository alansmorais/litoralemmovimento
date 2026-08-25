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
