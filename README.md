# Clipply Web

Front-end do Clipply — sistema de agendamentos para pequenas e médias empresas.

## Stack

- **React 18** + Vite 5
- **React Router v6** (SPA)
- **Tailwind CSS 3** (design system customizado)
- **Axios** (HTTP + interceptors de refresh token automático)
- **Context API** (autenticação global)

## Requisitos

- Node.js 18+
- npm 9+
- Back-end Clipply rodando em `localhost:9002`

## Início rápido

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento (proxy → localhost:9002)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## Estrutura de pastas

```
src/
├── assets/              # Imagens, ícones estáticos
├── components/
│   ├── auth/            # Guards de rota (PrivateRoute)
│   ├── layout/          # AppLayout (sidebar + topbar mobile)
│   └── ui/              # Componentes base: Button, Input, Modal, etc.
├── context/
│   └── AuthContext.jsx  # Estado global de autenticação
├── hooks/
│   ├── useApi.js        # Wrapper genérico para chamadas de serviço
│   └── useToast.js      # Sistema de notificações
├── pages/
│   ├── auth/            # LoginPage
│   ├── admin/           # Agendamentos, Serviços, Horários, Equipe, Clientes
│   ├── professional/    # Agenda do profissional
│   ├── public/          # BookingPage (/{slug}), CancelPage
│   └── support/         # Painel interno Clipply
├── routes/
│   └── AppRouter.jsx    # Definição central de rotas
├── services/
│   ├── api.js           # Instância Axios + interceptor de refresh
│   ├── authService.js
│   ├── appointmentService.js
│   ├── companyService.js
│   ├── customerService.js
│   ├── productService.js
│   ├── scheduleService.js
│   └── userService.js
└── utils/
    ├── constants.js     # ROLES, APPOINTMENT_STATUS, DAYS_OF_WEEK
    └── format.js        # formatDate, formatCurrency, formatPhone, etc.
```

## Perfis de usuário

| Role         | Acesso            | Rota base       |
|--------------|-------------------|-----------------|
| ADMIN        | Painel completo   | `/admin`        |
| PROFESSIONAL | Agenda própria    | `/professional` |
| SUPPORT      | Gestão de empresas| `/support`      |
| Cliente      | Agendamento público | `/:slug`      |

## Design System

Paleta principal: **Verde brand** (`brand-600: #16a34a`) + Neutros quentes (`surface-*`).

Fontes:
- **Playfair Display** — títulos e display
- **DM Sans** — corpo e interface
- **DM Mono** — horários, tokens, dados técnicos

Classes utilitárias customizadas: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`, `.input`, `.label`, `.card`, `.badge-*`, `.alert-*`

## Observações

- Autenticação via **cookies HttpOnly** (access token + refresh token) — sem localStorage de tokens.
- O interceptor Axios renova o access token automaticamente ao receber 401.
- Toda a comunicação com a API passa pelo proxy do Vite em desenvolvimento.
```
