# DuelTrade – Arquitetura ⚙️

Este documento descreve, em alto nível, como o frontend do DuelTrade está organizado, as principais decisões de arquitetura e o design system aplicado.

---

## 1. Visão geral

O projeto é um **SPA** construída com:

- Vue 3 + TypeScript
- Quasar Framework (UI + layout + componentes)
- Pinia para estado global
- Vue Router para navegação
- Axios para comunicação com a API REST (`/docs/API-RESPONSE.md`)

Principais rotas:

- `/` – **Marketplace** (lista de trades ativas, carrosséis de cartas vinculadas)
- `/trade` – **Trade Portal** (criação de ofertas com múltiplas cartas offering/receiving)
- `/inventory` – **Inventory** (cartas do usuário)
- `/active-trades` – **Active Trades** (gerenciamento e revogação de trades do usuário)
- `/auth` – **Auth** (login/registro)

---

## 2. Organização de pastas

```text
src/
├─ layouts/
│  └─ MainLayout.vue      # Header, navegação e shell principal da aplicação
├─ modules/
│  ├─ auth/               # Telas e store de autenticação
│  ├─ marketplace/        # Listagem e interação com trades públicas
│  ├─ trade/              # Criação de trades (TradePage + stores/serviços)
│  ├─ inventory/          # Gestão de cartas do usuário
│  └─ trade/views/ActiveTradesPage.vue  # Trades ativas do usuário
├─ shared/
│  └─ components/
│     └─ YugiohCard.vue   # Cartão reutilizável para exibir cartas
├─ core/
│  ├─ api/axios.ts        # Configuração do Axios (apiClient)
│  └─ types/api.ts        # Tipagens de DTOs usados na API
├─ router/                # Definição de rotas, layout raiz e children
└─ css/app.css            # Estilos globais + tokens (variáveis CSS / utilitários)
```

---

## 3. Estado global (Pinia) 🧠

Stores principais:

- **`auth.store`**
  - Estado de autenticação (`token`, `user`, `status`, `errorMessage`)
  - Fluxos de login, registro, carregamento do usuário atual
- **`marketplace.store`**
  - Lista paginada de trades (`trades`, `page`, `more`)
  - Carregamento inicial e paginação “Load more”
- **`trade.store`**
  - Cartas do usuário (`myCards`) e catálogo global (`catalogCards`)
  - Multi‑seleção de cartas offering/receiving (`selectedOfferingIds`, `selectedReceivingIds`)
  - Criação de trade (`submitTrade`) consumindo a rota `POST /trades`
- **`activeTrades.store`**
  - Lista de trades do usuário logado e revogação (`revokeTrade`)
- **`inventory.store`**
  - Inventário de cartas do usuário e adição de novas cartas

Todas as stores seguem o padrão:

- `state`: apenas dados serializáveis
- `getters`: derivação/computação (ex.: `canSubmit`, `selectedOfferings`)
- `actions`: chamadas à API + update de estado + mensagens de erro amigáveis

---

## 4. Camada de serviços (HTTP) 🌐

Em `src/modules/*/services` ficam funções puras de acesso à API, sempre tipadas com os tipos de `src/core/types/api.ts`.

Exemplos:

- `trade.service.ts`
  - `fetchMyCardsForTrade`, `fetchCatalogForTrade`, `createTrade`, `fetchTradesList`, `deleteTrade`
- `marketplace.service.ts`
  - `fetchTrades` (lista paginada de trades públicas)

Essa camada evita espalhar detalhes de endpoints e headers pelas views/stores.

---

## 5. Componentes reutilizáveis 🧩

### `YugiohCard.vue`

Componente base para exibir cartas, com variações:

- `variant="default"` – cartão completo (usado onde há mais espaço)
- `variant="compact"` – usado em colunas de trade, carrosséis e listagens
- `variant="inventory"` – usado em grids de inventário/seleção

Props importantes:

- `title`, `imageUrl`, `description`
- `rarityLabel`, `rarityVariant` (`common`, `rare`, `super-rare`, `ultra-rare`, `secret-rare`)
- `interactive` + evento `@click` para seleção
- `selected` para estados visuais (bordas, overlay, etc.)

Esse componente centraliza o visual das cartas e garante consistência em toda a aplicação.

### Layout principal

- `MainLayout.vue`
  - Header com logo em forma de **hexágono**, navegação principal e avatar do usuário
  - Drawer responsivo para navegação em dispositivos móveis

---

## 6. Design system & UX 🎨

O design system é baseado em:

- **Quasar** como base de componentes (botões, inputs, carrosséis, diálogos, banners, toasts, etc.)
- **Tokens CSS customizados** em `app.css` com prefixo `--dt-`:
  - Cores (ex.: `--dt-color-deep-navy`, `--dt-color-millennium-gold`, `--dt-color-cyber-blue`)
  - Cores de texto (`--dt-text-primary`, `--dt-text-muted`)
  - Backgrounds “glassmorphism” (`dt-glass-surface`, `dt-holo-border`, etc.)
- Tipografia:
  - Títulos com fontes como **Orbitron** (ex.: `dt-heading-orbitron`)
  - Corpo com fontes legíveis e alto contraste

Padrões de UX aplicados:

- **Feedback imediato** com `QNotify` para erros de rede (ex.: falha ao criar trade, catálogo indisponível).
- **Estado de carregamento** explícito:
  - `QInnerLoading` com spinners em grids/listas
  - Botões com `:loading` em ações que chamam a API
- **Confirmações importantes** com diálogos:
  - Revogar trade em `ActiveTradesPage`
  - Interesse em trade no Marketplace (modal informativa + CTA para `/trade`)
- **Responsividade**:
  - Grids com `auto-fill` para cartas
  - Layouts que se empilham em telas menores

---

## 7. Próximos passos sugeridos 🧭

Algumas evoluções naturais para o projeto:

- Adicionar testes unitários (Vitest) e de componentes (Vue Test Utils)
- Melhorar acessibilidade (ARIA labels, foco em modais, etc.)
- Internacionalização (i18n) para alternar entre inglês/português
