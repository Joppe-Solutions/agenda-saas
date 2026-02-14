# PRD -> Implementacao Tecnica Inicial

## Decisoes aplicadas

- Dominio modelado com `Merchant`, `Asset`, `Booking` e enums para nicho/tipo de preco/status.
- Backend dividido por servico (`merchant`, `booking`, `payment`).
- Frontend com rotas publicas e dashboard protegido.
- Gateway de pagamento em interface para facilitar troca de provider.

## Proximas entregas recomendadas

1. Substituir stub de pagamento por Mercado Pago ou Asaas.
2. Conectar webhook do Clerk para criar/atualizar `Merchant` no backend.
3. Adicionar testes de disponibilidade (concorrencia e conflito de reserva).
4. Instalar Shadcn e trocar os componentes placeholder pelos oficiais.
