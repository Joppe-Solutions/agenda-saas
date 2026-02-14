# Reserva.Online - MVP Roadmap

## VISÃO DO PRODUTO

**Transformar "caos do WhatsApp" em sistema organizado com fluxo inevitável.**

Usuário leigo entra → configura em 10min → publica link → recebe reservas com sinal → confirma → cobra → mede resultados.

---

## 1. FLUXO DO USUÁRIO EM 7 PASSOS

### Passo 1: CADASTRO → Perfil básico

```
Entrada: Link de indicação ou busca
Ação: Criar conta (email/senha ou Google)
Sistema: Cria merchant + slug único (reserva.online/seunegocio)
Saída: Dashboard vazio com onboarding
```

**O que aparece:**
- Boas-vindas com próximo passo claro: "Adicione seu primeiro recurso"
- Campos: Nome do negócio, WhatsApp, cidade (opcional)

---

### Passo 2: CONFIGURAR → Recursos

```
Entrada: Dashboard → "Adicionar recurso"
Ação: Escolher template OU criar do zero
Campos: Nome, tipo, preço, duração, capacidade, horários
Sistema: Valida conflitos, cria disponibilidade
Saída: Recurso ativo com link de reserva
```

**Templates iniciais:**
- 🚤 Barco de pesca/turismo
- ⚽ Quadra esportiva
- 🏥 Consultório/Sala
- 🎉 Espaço de eventos
- 🎮 Equipamento/Console
- ✂️ Profissional (barbeiro, dentista, etc.)
- 🏠 Imóvel temporada

---

### Passo 3: PUBLICAR → Link de reserva

```
Entrada: Recurso criado
Ação: Copiar link ou QR code
Sistema: Gera página pública otimizada mobile
Saída: Link pronto para compartilhar
```

**O link tem:**
- Foto do recurso
- Preço e regras claras
- Calendário visual
- Botão "Reservar"

---

### Passo 4: RECEBER → Cliente reserva

```
Entrada: Cliente acessa link
Ação: Escolhe recurso → data → horário → preenche dados → paga sinal
Sistema: Valida disponibilidade, cria PIX, registra reserva
Saída: Reserva "Pendente (aguardando sinal)"
```

**Dados coletados:**
- Nome (obrigatório)
- WhatsApp (obrigatório)
- E-mail (opcional)
- Observações (opcional)

---

### Passo 5: CONFIRMAR → Pagamento do sinal

```
Entrada: Cliente paga PIX
Ação: Webhook do Mercado Pago notifica
Sistema: Atualiza status → confirma reserva → notifica双方
Saída: Reserva "Confirmada" + comprovante
```

**Regras automáticas:**
- Confirmação imediata ao pagar
- Cancelamento automático se prazo expirar
- Notificação para merchant e cliente

---

### Passo 6: EXECUTAR → Dia da reserva

```
Entrada: Data da reserva
Ação: Lembretes automáticos + check-in manual
Sistema: Notifica 24h antes, 2h antes
Saída: Reserva "Em andamento" → "Concluída" ou "No-show"
```

**Checklist do dia:**
- Ver reservas do dia (Dashboard)
- Marcar status manualmente
- Cobrar valor restante (se houver)

---

### Passo 7: MEDIR → Relatórios

```
Entrada: Dashboard → Relatórios
Ação: Ver números da semana/mês
Métricas: Reservas, receita, no-show, top recursos
Saída: Decisões baseadas em dados
```

---

## 2. BACKLOG PRIORIZADO

### MVP (Fase 1 - 8 semanas)

#### P0 - Crítico (Sem isso, não funciona)

| ID | Funcionalidade | Módulo | Esforço |
|----|----------------|--------|---------|
| P0-01 | Cadastro merchant + slug único | Configurações | 1 dia |
| P0-02 | CRUD de recursos com templates | Recursos | 3 dias |
| P0-03 | Motor de disponibilidade (horários) | Recursos | 2 dias |
| P0-04 | Página pública de reserva | Link | 2 dias |
| P0-05 | Criação de reserva (frontend) | Reservas | 2 dias |
| P0-06 | PIX + webhook Mercado Pago | Pagamentos | 2 dias |
| P0-07 | Status de reserva + transições | Reservas | 1 dia |
| P0-08 | Cancelamento automático por sinal | Reservas | 1 dia |

**Total P0: ~14 dias**

#### P1 - Essencial (Sem isso, fricção alta)

| ID | Funcionalidade | Módulo | Esforço |
|----|----------------|--------|---------|
| P1-01 | Dashboard com "hoje" | Visão Geral | 2 dias |
| P1-02 | Lista de reservas com filtros | Reservas | 1 dia |
| P1-03 | Calendário visual (dia/semana) | Reservas | 3 dias |
| P1-04 | Cadastro automático de clientes | Clientes | 1 dia |
| P1-05 | Histórico do cliente | Clientes | 1 dia |
| P1-06 | Notificação confirmação (WhatsApp/Email) | Notificações | 2 dias |
| P1-07 | Lembrete 24h antes | Notificações | 1 dia |
| P1-08 | Relatórios básicos | Relatórios | 2 dias |

**Total P1: ~13 dias**

#### P2 - Importante (Melhora UX)

| ID | Funcionalidade | Módulo | Esforço |
|----|----------------|--------|---------|
| P2-01 | Bloqueio de horário (manutenção) | Recursos | 1 dia |
| P2-02 | Reagendamento em 1 clique | Reservas | 2 dias |
| P2-03 | Observações internas | Reservas | 0.5 dia |
| P2-04 | Tags de cliente (VIP, inadimplente) | Clientes | 0.5 dia |
| P2-05 | "Cobrar sinal novamente" | Pagamentos | 0.5 dia |
| P2-06 | Comprovante/recibo simples | Pagamentos | 1 dia |
| P2-07 | Config de regras de sinal (%) | Configurações | 0.5 dia |
| P2-08 | Políticas de cancelamento | Configurações | 0.5 dia |

**Total P2: ~6 dias**

**TOTAL MVP: ~33 dias de desenvolvimento**

---

### V2 (Fase 2 - Após validação)

#### Funcionalidades Avançadas

| ID | Funcionalidade | Módulo | Prioridade |
|----|----------------|--------|------------|
| V2-01 | Calendário mensal + arrastar | Reservas | Média |
| V2-02 | Múltiplos usuários/equipe | Configurações | Média |
| V2-03 | Permissões por papel | Configurações | Média |
| V2-04 | Split de pagamento (parceiros) | Pagamentos | Baixa |
| V2-05 | Cupons/descontos | Pagamentos | Baixa |
| V2-06 | Assinatura/recorrência | Pagamentos | Baixa |
| V2-07 | Multi-unidades | Configurações | Baixa |
| V2-08 | Integração Google Calendar | Notificações | Média |
| V2-09 | App mobile merchant | Dashboard | Média |
| V2-10 | API pública | Developer | Baixa |
| V2-11 | Avaliação pós-serviço | Clientes | Média |
| V2-12 | Relatórios avançados (exportar) | Relatórios | Média |
| V2-13 | Preço por pessoa (adicional) | Recursos | Média |
| V2-14 | Fotos do recurso | Recursos | Alta |
| V2-15 | Termos/contrato do recurso | Recursos | Média |

---

## 3. REGRAS DO MOTOR DE AGENDA

### 3.1 Disponibilidade

```typescript
interface AvailabilityRule {
  resourceId: string
  dayOfWeek: 0-6  // Domingo = 0
  startTime: string  // "08:00"
  endTime: string    // "18:00"
  slotDuration: number  // minutos (padrão: 60)
  bufferBefore: number  // minutos entre reservas
  bufferAfter: number   // minutos entre reservas
}
```

**Lógica:**
1. Horário disponível = dentro das regras E não bloqueado E não reservado
2. Slots são calculados dinamicamente
3. Buffer é opcional (padrão: 0)

### 3.2 Conflito de Horário

```typescript
// Ao criar reserva:
function checkConflict(
  resourceId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): boolean {
  
  const overlapping = bookings.filter(b => 
    b.resourceId === resourceId &&
    b.status !== 'cancelled' &&
    b.status !== 'no_show' &&
    b.id !== excludeBookingId &&
    
    // Sobreposição de tempo
    startTime < b.endTime && endTime > b.startTime
  )
  
  return overlapping.length > 0
}
```

**Regras:**
- NUNCA permite double booking
- Conflito = bloqueia criação
- Reagendamento = verifica novo horário

### 3.3 Bloqueios

```typescript
interface Block {
  resourceId: string
  startTime: Date
  endTime: Date
  reason: 'maintenance' | 'vacation' | 'weather' | 'other'
  notes?: string
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    until?: Date
  }
}
```

**Tipos de bloqueio:**
- Manutenção: planejado
- Folga: férias/feriado
- Clima: imprevisto (barco, externo)
- Outro: livre

### 3.4 Prazo do Sinal

```typescript
interface SignalConfig {
  percentage: number      // Padrão: 50%
  deadlineMinutes: number // Padrão: 120 (2h)
  autoCancel: boolean     // Padrão: true
}
```

**Fluxo:**

```
Reserva criada
    ↓
Status: PENDING_PAYMENT
    ↓
Clock inicia (deadlineMinutes)
    ↓
┌─────────────────────────────────────┐
│  Cliente paga?                       │
│  ├─ SIM → CONFIRMED + notifica       │
│  └─ NÃO (expira) →                   │
│      ├─ autoCancel=true → CANCELLED  │
│      └─ autoCancel=false → PENDING   │
└─────────────────────────────────────┘
```

**Jobs necessários:**
- Cron a cada 5min verificando reservas expiradas
- Notificação 30min antes de expirar (opcional)

### 3.5 Status de Reserva

```typescript
type BookingStatus = 
  | 'pending_payment'  // Aguardando sinal
  | 'confirmed'        // Sinal pago
  | 'in_progress'      // Em andamento
  | 'completed'        // Concluída
  | 'cancelled'        // Cancelada
  | 'no_show'          // Não compareceu

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'completed'],
  in_progress: ['completed', 'no_show'],
  completed: [], // Terminal
  cancelled: [], // Terminal
  no_show: []    // Terminal
}
```

**Transições automáticas:**
- `pending_payment` → `confirmed`: pagamento confirmado
- `pending_payment` → `cancelled`: prazo expirado
- `confirmed` → `in_progress`: hora de início chegou

**Transições manuais:**
- Merchant pode: cancelar, marcar concluída, marcar no-show

### 3.6 Preços

```typescript
interface Pricing {
  basePrice: number      // Preço base
  priceType: 'hourly' | 'slot' | 'daily' | 'per_person'
  
  // Variações (opcional)
  variations?: {
    name: string         // "Fim de semana", "Feriado"
    multiplier: number   // 1.5 = +50%
    appliesOn: {
      daysOfWeek?: number[]
      dates?: Date[]
    }
  }[]
  
  // Adicional por pessoa (opcional)
  perPersonExtra?: number
  maxPeople?: number
}
```

**Cálculo:**
```
precoFinal = basePrice * variacaoAtiva + (numPessoas * perPersonExtra)
```

### 3.7 Validações de Criação

```typescript
async function validateBooking(input: BookingInput): ValidationResult {
  const errors: string[] = []
  
  // 1. Recurso existe e está ativo
  const resource = await getResource(input.resourceId)
  if (!resource?.active) errors.push("Recurso não disponível")
  
  // 2. Horário dentro do funcionamento
  const available = await checkAvailability(
    input.resourceId, 
    input.startTime, 
    input.endTime
  )
  if (!available) errors.push("Horário indisponível")
  
  // 3. Sem conflito
  const conflict = await checkConflict(
    input.resourceId,
    input.startTime,
    input.endTime
  )
  if (conflict) errors.push("Horário já reservado")
  
  // 4. Dados do cliente
  if (!input.customerName) errors.push("Nome é obrigatório")
  if (!input.customerPhone) errors.push("WhatsApp é obrigatório")
  
  // 5. Capacidade
  if (input.numPeople && input.numPeople > resource.capacity) {
    errors.push(`Capacidade máxima: ${resource.capacity}`)
  }
  
  // 6. Antecedência mínima
  const minAdvance = 30 // minutos
  if (input.startTime < addMinutes(now, minAdvance)) {
    errors.push(`Mínimo ${minAdvance}min de antecedência`)
  }
  
  return { valid: errors.length === 0, errors }
}
```

---

## 4. ARQUITETURA TÉCNICA - ATUALIZAÇÕES

### Novas Tabelas Necessárias

```sql
-- Bloqueios
CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  resource_id UUID REFERENCES resources(id),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  reason TEXT,
  notes TEXT,
  recurring JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regras de disponibilidade
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY,
  resource_id UUID REFERENCES resources(id),
  day_of_week INT,
  start_time TIME,
  end_time TIME,
  slot_duration INT DEFAULT 60,
  buffer_before INT DEFAULT 0,
  buffer_after INT DEFAULT 0
);

-- Configuração de sinal (por merchant)
-- Adicionar em merchants:
ALTER TABLE merchants ADD COLUMN signal_percentage INT DEFAULT 50;
ALTER TABLE merchants ADD COLUMN signal_deadline_minutes INT DEFAULT 120;
ALTER TABLE merchants ADD COLUMN signal_auto_cancel BOOLEAN DEFAULT true;

-- Tags de cliente
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id),
  name TEXT,
  color TEXT
);

CREATE TABLE customer_tag_assignments (
  customer_id UUID REFERENCES customers(id),
  tag_id UUID REFERENCES customer_tags(id),
  PRIMARY KEY (customer_id, tag_id)
);
```

### Novos Endpoints

```
# Bloqueios
POST   /blocks                    - Criar bloqueio
GET    /blocks?resourceId=X       - Listar bloqueios
DELETE /blocks/:id                - Remover bloqueio

# Disponibilidade
GET    /availability/:resourceId?date=X - Ver slots disponíveis
POST   /availability/rules        - Criar regra
PUT    /availability/rules/:id    - Atualizar regra

# Configuração de sinal
PUT    /merchants/me/signal-config - Atualizar config

# Clientes
GET    /customers                 - Listar clientes
GET    /customers/:id             - Detalhes + histórico
POST   /customers/:id/tags        - Atribuir tag
DELETE /customers/:id/tags/:tagId - Remover tag

# Relatórios
GET    /reports/summary?period=X  - Resumo (dia/semana/mês)
GET    /reports/bookings?period=X - Detalhado
```

---

## 5. CRONOGRAMA SUGERIDO

### Semanas 1-2: Fundação P0
- [ ] Cadastro merchant + slug
- [ ] CRUD recursos + templates
- [ ] Motor de disponibilidade
- [ ] Página pública básica

### Semanas 3-4: Core P0
- [ ] Criação de reserva
- [ ] PIX + webhook
- [ ] Status + transições
- [ ] Cancelamento automático

### Semanas 5-6: Essencial P1
- [ ] Dashboard
- [ ] Lista + filtros
- [ ] Calendário
- [ ] Cadastro clientes

### Semanas 7-8: Polimento P1 + P2
- [ ] Notificações
- [ ] Relatórios
- [ ] Bloqueios
- [ ] UX final

---

## 6. MÉTRICAS DE SUCESSO MVP

| Métrica | Meta | Como medir |
|---------|------|------------|
| Time-to-first-booking | < 15min | Analytics |
| Taxa de conversão | > 30% | Reservas/link |
| Taxa de pagamento | > 70% | Sinal pago |
| No-show | < 10% | Cancelamentos |
| NPS merchant | > 40 | Survey pós-onboarding |
| Churn 30 dias | < 20% | Cancelamentos |

---

## PRÓXIMA AÇÃO

**Começar pelo P0-02: CRUD de recursos com templates**

Isso é o coração do sistema. Precisa de:
1. Modelagem de recursos no banco
2. Templates pré-definidos
3. UI de criação wizard
4. Validação de disponibilidade

Confirmar para começar?