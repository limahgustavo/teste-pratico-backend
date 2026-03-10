# 💳 BeTalent Payment API

API REST multi-gateway para gerenciamento de pagamentos — Nível 3 do desafio BeTalent.

---

## 📋 Sobre

Sistema de pagamentos com suporte a múltiplos gateways, fallback automático, roles de usuário e TDD. Desenvolvido com **AdonisJS 7**, **Lucid ORM** (MySQL) e **Docker**.

### Padrões Arquiteturais
| Padrão | Aplicação |
|--------|-----------|
| **SOLID** | SRP, OCP, LSP, ISP, DIP aplicados em toda a camada de serviços |
| **Strategy Pattern** | Gateways implementam `GatewayInterface` — extensível sem modificar `PaymentService` |
| **Repository Pattern** | Acesso a dados isolado dos controllers |
| **DTOs** | Entrada e saída tipados (`PurchaseDTO`, `ChargeData`) |
| **Custom Exceptions** | `PaymentFailedException` (422) com código semântico |
| **Response Envelope** | Todas as respostas no formato `{ data, message }` |

---

## ⚙️ Requisitos

- **Node.js** 22+
- **Docker** e **Docker Compose**
- **MySQL** 8 (ou via Docker)

---

## 🚀 Como Rodar

### Rodando tudo com Docker (recomendado)

**Subir a aplicação completa:**
```bash
docker compose --profile app up --build
```
Sobe MySQL + Gateways mock + App em Node 24 (migrations e seeds automáticos)
API disponível em: http://localhost:3333

**Rodar os testes:**
```bash
docker compose --profile test up --build --attach test
```
Sobe MySQL + Gateways mock + Container de testes (migrations → seeds → `node ace test`)


### Localmente (sem Docker)

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env
# Edite .env com suas credenciais de banco

# 3. Gere a chave da aplicação
node ace generate:key

# 4. Inicie os mocks dos gateways (em outro terminal)
docker run -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock

# 5. Crie o banco e execute as migrations
node ace migration:run

# 6. Popule o banco com dados iniciais
node ace db:seed

# 7. Inicie o servidor
npm run dev
```

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `APP_KEY` | Chave da aplicação (gerar com `node ace generate:key`) | — |
| `DB_HOST` | Host do MySQL | `127.0.0.1` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASSWORD` | Senha do MySQL | `root` |
| `DB_DATABASE` | Nome do banco | `payment_api` |
| `GATEWAY1_URL` | URL do Gateway 1 | `http://localhost:3001` |
| `GATEWAY1_EMAIL` | Email de autenticação | `dev@betalent.tech` |
| `GATEWAY1_TOKEN` | Token de autenticação | `FEC9...` |
| `GATEWAY2_URL` | URL do Gateway 2 | `http://localhost:3002` |
| `GATEWAY2_AUTH_TOKEN` | Header auth token | `tk_f2...` |
| `GATEWAY2_AUTH_SECRET` | Header auth secret | `3d15...` |

---

## 🛣️ Rotas da API

### Públicas

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/v1/auth/login` | Login — retorna Bearer token |
| `POST` | `/api/v1/purchase` | Realizar uma compra |

### Privadas (requerem `Authorization: Bearer <token>`)

#### Autenticação
| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/v1/auth/logout` | — | Invalida o token |

#### Usuários
| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/v1/users` | ADMIN | Lista usuários |
| `POST` | `/api/v1/users` | ADMIN | Cria usuário |
| `GET` | `/api/v1/users/:id` | ADMIN | Detalhe do usuário |
| `PUT` | `/api/v1/users/:id` | ADMIN | Atualiza usuário |
| `DELETE` | `/api/v1/users/:id` | ADMIN | Remove usuário |

#### Produtos
| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/v1/products` | ADMIN, MANAGER, FINANCE | Lista produtos |
| `POST` | `/api/v1/products` | ADMIN, MANAGER | Cria produto |
| `GET` | `/api/v1/products/:id` | ADMIN, MANAGER, FINANCE | Detalhe do produto |
| `PUT` | `/api/v1/products/:id` | ADMIN, MANAGER | Atualiza produto |
| `DELETE` | `/api/v1/products/:id` | ADMIN, MANAGER | Desativa produto |

#### Clientes
| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/v1/clients` | Autenticado | Lista clientes |
| `GET` | `/api/v1/clients/:id` | Autenticado | Detalhe + compras do cliente |

#### Transações
| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/v1/transactions` | Autenticado | Lista transações |
| `GET` | `/api/v1/transactions/:id` | Autenticado | Detalhe da transação |
| `POST` | `/api/v1/transactions/:id/refund` | ADMIN, FINANCE | Reembolso |

#### Gateways
| Método | Rota | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/v1/gateways` | ADMIN | Lista gateways |
| `PATCH` | `/api/v1/gateways/:id/toggle` | ADMIN | Ativa/desativa gateway |
| `PATCH` | `/api/v1/gateways/:id/priority` | ADMIN | Altera prioridade |

---

## 📦 Exemplo de Requisições

### Login
```json
POST /api/v1/auth/login
{
  "email": "admin@admin.com",
  "password": "Admin@123"
}
```

### Compra
```json
POST /api/v1/purchase
{
  "client": { "name": "João Silva", "email": "joao@email.com" },
  "products": [
    { "id": 1, "quantity": 2 },
    { "id": 2, "quantity": 1 }
  ],
  "card": { "number": "5569000000006063", "cvv": "010" }
}
```

---

## 🐳 Arquitetura Docker

```
┌─────────────────────────────────────┐
│           Docker Network             │
│                                     │
│  ┌────────┐    ┌────┐    ┌───────┐ │
│  │  App   │───▶│ DB │    │Gtway  │ │
│  │ :3333  │    │3306│    │3001/2 │ │
│  └────────┘    └────┘    └───────┘ │
└─────────────────────────────────────┘
```

---

## 🧪 Testes

```bash
node ace test
```

---

## 👥 Usuário padrão

| Campo | Valor |
|-------|-------|
| Email | `admin@admin.com` |
| Senha | `Admin@123` |
| Role | `ADMIN` |

---

## 🏗️ Estrutura do Projeto

```
app/
├── controllers/     # Thin controllers (HTTP layer)
├── services/
│   ├── payment_service.ts          # Orquestrador (OCP/DIP)
│   └── gateways/
│       ├── gateway_interface.ts    # Contratos ISP
│       ├── gateway1_service.ts     # Implementação Gateway 1
│       └── gateway2_service.ts     # Implementação Gateway 2
├── models/          # Lucid ORM models
├── middleware/
│   ├── auth_middleware.ts
│   └── role_middleware.ts          # Controle de acesso por role
├── validators/      # VineJS validators
├── dtos/            # Data Transfer Objects
└── exceptions/      # Custom exceptions
database/
├── migrations/      # 7 migrations em ordem
└── seeders/         # Gateway + Admin user
```
