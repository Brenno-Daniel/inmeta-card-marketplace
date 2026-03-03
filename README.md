# DuelTrade 🃏

Aplicação web para criação e gestão de trocas de cartas (inspirada em TCGs como Yu‑Gi‑Oh!).  
Você pode:

- Navegar pelo **Marketplace** com ofertas ativas
- Gerenciar seu **inventário** de cartas
- Criar **propostas de troca** com múltiplas cartas oferecendo/recebendo
- Acompanhar e revogar **trades ativas**

---

## 🚀 Tech stack

- **Framework:** Vue 3 + TypeScript
- **UI & Design System:** Quasar Framework 2
- **State management:** Pinia
- **Roteamento:** Vue Router 5
- **HTTP client:** Axios
- **Qualidade de código:** ESLint + Prettier + vue-tsc

---

## 📦 Instalação

### Pré‑requisitos

- Node.js (recomendado ≥ 20)
- Gerenciador de pacotes: `npm`, `yarn` ou `pnpm`

### Passos

```bash
# 1. Instalar dependências
npm install
# ou
yarn

# 2. Rodar em modo desenvolvimento
npm run dev
# ou
yarn dev
```

Aplicação ficará disponível (por padrão) em `http://localhost:9000`.

---

## 🧰 Scripts disponíveis

Via `npm run <script>` ou `yarn <script>`:

- **dev** – sobe o app em modo desenvolvimento com hot reload
- **build** – gera o bundle de produção usando Quasar/Vite
- **lint** – roda ESLint em `.ts/.js/.vue`
- **format** – formata o código com Prettier
- **test** – placeholder atual, não há testes automatizados ainda

---

## 🌐 Deploy

A aplicação está publicada como SPA na **Vercel**:

- 👉 [`DuelTrade na Vercel`](https://inmeta-card-marketplace.vercel.app/#/)

---

## 🎨 Inspiração visual

O layout visual do DuelTrade foi inspirado em um protótipo gerado na plataforma **Replit**, disponível em:

- 👉 [`Duelist Exchange (Replit)`](https://duelist-exchange--brennodaniel98.replit.app)

---

## 🗂 Estrutura principal do projeto

```text
inmeta-card-marketplace/
├─ src/
│  ├─ layouts/          # Layouts globais (ex: MainLayout)
│  ├─ modules/
│  │  ├─ auth/          # Autenticação (login/registro)
│  │  ├─ marketplace/   # Home / listagem de trades
│  │  ├─ trade/         # Criação de propostas de troca
│  │  ├─ inventory/     # Inventário do usuário
│  ├─ shared/           # Componentes reutilizáveis (ex: YugiohCard)
│  ├─ core/             # API client, types, utilitários
│  ├─ router/           # Definição das rotas
│  └─ css/              # Estilos globais e tokens
├─ docs/
│  ├─ API-RESPONSE.md   # Documentação da API backend
│  └─ ARCHITECTURE.md   # Arquitetura, decisões e design system
└─ ...
```

Para detalhes da arquitetura (stores, camadas, componentes reutilizáveis e design system), veja:  
👉 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

