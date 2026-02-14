# Fish SaaS

Monorepo inicial para o MVP de agendamento multi-nicho com:

- `frontend/`: Next.js App Router + Clerk + base para Shadcn UI.
- `backend/`: Encore.ts com servicos `merchant`, `booking` e `payment`.

## Estrutura

```text
.
|-- backend
|   |-- db
|   |   |-- db.ts
|   |   `-- migrations
|   |-- services
|   |   |-- booking
|   |   |-- merchant
|   |   `-- payment
|   `-- package.json
|-- frontend
|   |-- app
|   |-- components
|   |-- lib
|   `-- package.json
`-- docs
```

## Requisitos locais

- Node.js 20+
- npm 10+
- Encore CLI (para rodar o backend)

## Setup rapido

1. Instalar dependencias do monorepo:

```bash
npm install
```

2. Configurar variaveis:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

3. Rodar frontend:

```bash
npm run dev:frontend
```

4. Rodar backend (quando Encore estiver instalado):

```bash
cd backend
encore run
```

## Fluxo MVP implementado (esqueleto)

1. Pagina publica do merchant (`/[merchantSlug]`) busca merchant e assets.
2. Usuario seleciona data/pessoas e cria reserva (`PENDING_PAYMENT`).
3. Backend gera payload de pagamento PIX (stub).
4. Webhook confirma pagamento e marca reserva como `CONFIRMED`.
5. Dashboard protegido por Clerk lista reservas e permite atualizacao de status.

## Observacoes

- Endpoints de pagamento estao com integracao stubada e pontos de extensao para Mercado Pago/Asaas.
- Middleware do Clerk protege rotas `/dashboard/*`.
- O modelo de dados ja nasce multi-nicho (`Merchant`, `Asset`, `Booking`).
