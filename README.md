# Notify MS

Microsserviço de notificação em tempo real para o projeto Load Tester.

## Descrição

Este microsserviço é responsável por receber notificações de conclusão de testes de carga e alertas de performance, e enviá-las em tempo real para os clientes conectados via WebSocket ou por e-mail. Ele utiliza filas para processar as notificações de forma assíncrona e garantir a entrega.

## Tecnologias Utilizadas

- **Node.js**
- **TypeScript**
- **Express**
- **Socket.IO**
- **BullMQ**
- **Redis**
- **Nodemailer**
- **MongoDB**
- **Mongoose**
- **crypto-js**

## Arquitetura

A aplicação segue uma arquitetura baseada em eventos e filas para garantir o desacoplamento e a escalabilidade.

```
+-----------------+      +---------------------+      +--------------------
|   API Gateway   |----->|    Notify MS        |----->|       Redis        |
+-----------------+      | (este microsserviço)|      |      (BullMQ)      |
                       +---------------------+      +--------------------
                                 |   ^
              (WebSocket)        |   | (E-mail)
                                 v   |
                       +---------------------+      +--------------------
                       |      Clientes       |      | Servidor de E-mail |
                       +---------------------+      +--------------------
```

1.  **Filas:** A aplicação utiliza o BullMQ com Redis para gerenciar duas filas:
    *   `notification-queue`: Para notificações de conclusão de testes.
    *   `alert-queue`: Para notificações de alertas de performance.

2.  **Workers:**
    *   `NotificationWorker`: Processa as mensagens da `notification-queue`, invocando o `SendCompletionNotificationUseCase` para enviar notificações via WebSocket.
    *   `AlertWorker`: Processa as mensagens da `alert-queue`, invocando o `SendAlertNotificationUseCase` para enviar alertas por e-mail.

3.  **Casos de Uso:**
    *   `SendCompletionNotificationUseCase`: Contém a lógica de negócios para enviar a notificação de conclusão de teste.
    *   `SendAlertNotificationUseCase`: Contém a lógica de negócios para enviar a notificação de alerta.

4.  **Serviços de Notificação:**
    *   `WebSocketNotificationService`: Envia notificações para todos os clientes conectados via WebSocket.
    *   `EmailNotificationService`: Envia notificações por e-mail utilizando o Nodemailer, com configurações de SMTP dinâmicas.

5.  **Clientes:** Os clientes (por exemplo, a interface do usuário do Load Tester) se conectam ao microsserviço via WebSocket e escutam o evento `push-notification` para receber as notificações em tempo real.

## Variáveis de Ambiente

Para a configuração da aplicação, as seguintes variáveis de ambiente podem ser configuradas:

- `MONGO_URL`: URL de conexão do MongoDB. (Padrão: `mongodb://localhost:27017/notify-db`)
- `REDIS_HOST`: Host do Redis. (Padrão: `localhost`)
- `REDIS_PORT`: Porta do Redis. (Padrão: `6379`)
- `SECRET_KEY`: Chave secreta para criptografar as senhas de SMTP.

## Começando

### Pré-requisitos

- Node.js (v18 ou superior)
- npm
- Docker (para rodar o Redis e o MongoDB)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/luisfelix-93/notify-ms.git
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```

### Rodando a Aplicação

1.  Inicie o Redis e o MongoDB com Docker:
    ```bash
    docker run -d --name redis -p 6379:6379 redis
    docker run -d --name mongo -p 27017:27017 mongo
    ```
2.  Inicie a aplicação em modo de desenvolvimento:
    ```bash
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:4004`.

### Rodando com Docker

Para iniciar a aplicação com Docker, siga estes passos:

1.  **Construa a imagem Docker:**

    ```bash
    docker build -t notify-ms .
    ```

2.  **Inicie o container:**

    Certifique-se de que o Redis e o MongoDB estejam em execução e acessíveis pela aplicação. Se estiverem rodando em containers Docker na mesma rede, você pode usar o nome do container como host.

    ```bash
    docker run -d -p 4004:4004 --name notify-ms notify-ms
    ```

    Se o Redis e o MongoDB estiverem rodando localmente (fora de um container), você pode precisar configurar a rede do container para `host`:

    ```bash
    docker run -d --network host --name notify-ms notify-ms
    ```

## Benchmark

Para executar o teste de benchmark, que envia 2000 mensagens (1000 para cada fila) e mede o tempo total e a vazão da fila de notificação, execute o seguinte comando:

```bash
npm run benchmark
```

O script irá:
1. Conectar-se ao servidor WebSocket.
2. Enviar 1000 mensagens para a fila `notification-queue` e 1000 para a `alert-queue`.
3. Aguardar o recebimento de 1000 notificações via WebSocket (da `notification-queue`).
4. Calcular e exibir o tempo total e a vazão (notificações por segundo).

## Endpoints da API

### GET /health

Retorna o status da aplicação.

- **Status:** `200 OK`
- **Body:** `ok`

### Configuração de SMTP

#### POST /smtp/config

Salva ou atualiza a configuração de SMTP.

- **Status:** `200 OK`
- **Body (Request):**
  ```json
  {
    "host": "smtp.example.com",
    "port": 587,
    "secure": false,
    "user": "user@example.com",
    "pass": "password"
  }
  ```
- **Body (Response):**
  ```json
  {
    "message": "Configuração guardada com sucesso!",
    "id": "default"
  }
  ```

#### GET /smtp/config

Recupera a configuração de SMTP atual (sem a senha).

- **Status:** `200 OK`
- **Body (Response):**
  ```json
  {
    "configId": "default",
    "host": "smtp.example.com",
    "port": 587,
    "secure": false,
    "user": "user@example.com"
  }
  ```

#### POST /smtp/config/test

Envia um e-mail de teste para verificar a configuração de SMTP.

- **Status:** `200 OK`
- **Body (Request):**
  ```json
  {
    "recipientEmail": "test@example.com"
  }
  ```
- **Body (Response):**
  ```json
  {
    "message": "E-mail de teste enviado com sucesso para test@example.com."
  }
  ```

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