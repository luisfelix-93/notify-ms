# Notify MS

Microsserviço de notificação em tempo real para o projeto Load Tester.

## Descrição

Este microsserviço é responsável por receber notificações de conclusão de testes de carga e enviá-las em tempo real para os clientes conectados via WebSocket. Ele utiliza uma fila para processar as notificações de forma assíncrona e garantir a entrega.

## Tecnologias Utilizadas

- **Node.js**
- **TypeScript**
- **Express**
- **Socket.IO**
- **BullMQ**
- **Redis**

## Começando

### Pré-requisitos

- Node.js (v18 ou superior)
- npm
- Docker (para rodar o Redis)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/luisfelix-93/notify-ms.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

### Rodando a Aplicação

1. Inicie o Redis com Docker:
   ```bash
   docker run -d --name redis -p 6379:6379 redis
   ```
2. Inicie a aplicação em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em `http://localhost:4004`.

## Como Funciona

1. A aplicação recebe uma mensagem em uma fila do BullMQ chamada `notification-queue`.
2. O `NotificationWorker` processa a mensagem da fila.
3. O worker chama o `SendCompletionNotificationUseCase` para processar a notificação.
4. O caso de uso utiliza o `WebSocketNotificationService` para enviar a notificação para os clientes conectados via WebSocket.
5. Os clientes recebem a notificação através do evento `push-notification`.

## Endpoints da API

### GET /health

Retorna o status da aplicação.

- **Status:** `200 OK`
- **Body:** `ok`

## Eventos WebSocket

### `push-notification`

Envia uma notificação para os clientes.

**Payload:**

```json
{
  "testId": "string",
  "message": "string"
}
```
