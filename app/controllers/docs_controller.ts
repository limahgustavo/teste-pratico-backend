import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Multi-Gateways Payment API',
        version: '1.0.0',
        description:
            'API de pagamento multi-gateway com fallback automático. Desenvolvida com AdonisJS 6, MySQL, Strategy Pattern e princípios SOLID.',
        contact: { name: 'Gustavo Lima', url: 'https://github.com/limahgustavo/teste-pratico-backend' },
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    tags: [
        { name: 'Auth', description: 'Autenticação' },
        { name: 'Users', description: 'Gestão de usuários (ADMIN)' },
        { name: 'Products', description: 'Gestão de produtos' },
        { name: 'Purchase', description: 'Rota pública de compra' },
        { name: 'Clients', description: 'Clientes e histórico' },
        { name: 'Transactions', description: 'Transações e estorno' },
        { name: 'Gateways', description: 'Gestão de gateways (ADMIN)' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'admin@admin.com' },
                    password: { type: 'string', example: 'Admin@123' },
                },
            },
            PurchaseRequest: {
                type: 'object',
                required: ['client', 'products', 'card'],
                properties: {
                    client: {
                        type: 'object',
                        required: ['name', 'email'],
                        properties: {
                            name: { type: 'string', example: 'João Silva' },
                            email: { type: 'string', format: 'email', example: 'joao@email.com' },
                        },
                    },
                    products: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            required: ['id', 'quantity'],
                            properties: {
                                id: { type: 'integer', example: 1 },
                                quantity: { type: 'integer', minimum: 1, example: 2 },
                            },
                        },
                    },
                    card: {
                        type: 'object',
                        required: ['number', 'cvv'],
                        properties: {
                            number: { type: 'string', pattern: '^\\d{16}$', example: '5569000000006063' },
                            cvv: { type: 'string', pattern: '^\\d{3,4}$', example: '010' },
                        },
                    },
                },
            },
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    errors: { type: 'object' },
                },
            },
        },
    },
    paths: {
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
                responses: {
                    200: { description: 'Token de acesso' },
                    400: { description: 'Credenciais inválidas' },
                    422: { description: 'Dados inválidos' },
                },
            },
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Logout',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Logout realizado' }, 401: { description: 'Não autenticado' } },
            },
        },
        '/users': {
            get: {
                tags: ['Users'],
                summary: 'Listar usuários',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Lista de usuários' }, 401: { description: 'Não autenticado' }, 403: { description: 'Sem permissão' } },
            },
            post: {
                tags: ['Users'],
                summary: 'Criar usuário',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password', 'role'],
                                properties: {
                                    name: { type: 'string', example: 'Maria Silva' },
                                    email: { type: 'string', format: 'email', example: 'maria@email.com' },
                                    password: { type: 'string', minLength: 8, example: 'Senha@123' },
                                    role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'FINANCE', 'USER'] },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: 'Usuário criado' }, 422: { description: 'Dados inválidos' } },
            },
        },
        '/users/{id}': {
            put: {
                tags: ['Users'],
                summary: 'Atualizar usuário',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Usuário atualizado' } },
            },
            delete: {
                tags: ['Users'],
                summary: 'Remover usuário',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Usuário removido' } },
            },
        },
        '/products': {
            get: {
                tags: ['Products'],
                summary: 'Listar produtos',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Lista de produtos' } },
            },
            post: {
                tags: ['Products'],
                summary: 'Criar produto',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'amount'],
                                properties: {
                                    name: { type: 'string', example: 'Camiseta Premium' },
                                    amount: { type: 'integer', description: 'Valor em centavos', example: 9900 },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: 'Produto criado' } },
            },
        },
        '/products/{id}': {
            put: {
                tags: ['Products'],
                summary: 'Atualizar produto',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Produto atualizado' } },
            },
            delete: {
                tags: ['Products'],
                summary: 'Remover produto',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Produto removido' } },
            },
        },
        '/purchase': {
            post: {
                tags: ['Purchase'],
                summary: 'Realizar compra (rota pública)',
                description: 'Cria uma transação com fallback automático entre gateways por prioridade.',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PurchaseRequest' } } } },
                responses: {
                    201: { description: 'Compra realizada com sucesso' },
                    422: { description: 'Dados inválidos ou todos os gateways falharam' },
                },
            },
        },
        '/clients': {
            get: {
                tags: ['Clients'],
                summary: 'Listar clientes',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Lista de clientes' } },
            },
        },
        '/clients/{id}': {
            get: {
                tags: ['Clients'],
                summary: 'Detalhe do cliente com histórico de compras',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Cliente com transações' }, 404: { description: 'Não encontrado' } },
            },
        },
        '/transactions': {
            get: {
                tags: ['Transactions'],
                summary: 'Listar todas as transações',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Lista de transações' } },
            },
        },
        '/transactions/{id}': {
            get: {
                tags: ['Transactions'],
                summary: 'Detalhe da transação',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Transação' }, 404: { description: 'Não encontrada' } },
            },
        },
        '/transactions/{id}/refund': {
            post: {
                tags: ['Transactions'],
                summary: 'Estornar transação (FINANCE / ADMIN / MANAGER)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Estorno realizado' }, 403: { description: 'Sem permissão' }, 404: { description: 'Não encontrada' } },
            },
        },
        '/gateways': {
            get: {
                tags: ['Gateways'],
                summary: 'Listar gateways',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Lista de gateways com prioridade' } },
            },
        },
        '/gateways/{id}/toggle': {
            patch: {
                tags: ['Gateways'],
                summary: 'Ativar / desativar gateway',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Estado alterado' } },
            },
        },
        '/gateways/{id}/priority': {
            patch: {
                tags: ['Gateways'],
                summary: 'Alterar prioridade do gateway',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { type: 'object', required: ['priority'], properties: { priority: { type: 'integer', example: 2 } } },
                        },
                    },
                },
                responses: { 200: { description: 'Prioridade alterada' } },
            },
        },
    },
}

export default class DocsController {
    async ui({ response }: HttpContext) {
        const html = `<!DOCTYPE html>
<html>
<head>
  <title>Payment API - Docs</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" >
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"> </script>
  <script>
    SwaggerUIBundle({
      url: '${router.makeUrl('docs.json')}',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      deepLinking: true,
      tryItOutEnabled: true,
    })
  </script>
</body>
</html>`
        return response.header('Content-Type', 'text/html').send(html)
    }

    async json({ response }: HttpContext) {
        return response.json(openApiSpec)
    }
}
