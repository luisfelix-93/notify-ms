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

## Arquitetura

A aplicação segue uma arquitetura baseada em eventos e filas para garantir o desacoplamento e a escalabilidade.

```
+-----------------+      +---------------------+      +--------------------+
|   API Gateway   |----->|    Notify MS        |----->|       Redis        |
+-----------------+      | (este microsserviço)|      |      (BullMQ)      |
                       +---------------------+      +--------------------+
                                 |
                                 | (WebSocket)
                                 |
                       +---------------------+
                       |      Clientes       |
                       +---------------------+
```

1.  **Fila de Notificações:** A aplicação utiliza o BullMQ com Redis para gerenciar uma fila de notificações chamada `notification-queue`. As mensagens são adicionadas a esta fila por outros serviços (por exemplo, o serviço que executa os testes de carga).

2.  **Worker de Notificação:** O `NotificationWorker` é responsável por processar as mensagens da fila. Ele escuta por novos trabalhos na fila `notification-queue` e, quando um trabalho é recebido, ele o processa.

3.  **Caso de Uso:** O worker invoca o `SendCompletionNotificationUseCase`, que contém a lógica de negócios para enviar a notificação.

4.  **Serviço de WebSocket:** O caso de uso utiliza o `WebSocketNotificationService` para enviar a notificação para todos os clientes conectados via WebSocket.

5.  **Clientes:** Os clientes (por exemplo, a interface do usuário do Load Tester) se conectam ao microsserviço via WebSocket e escutam o evento `push-notification` para receber as notificações em tempo real.

## Começando

### Pré-requisitos

- Node.js (v18 ou superior)
- npm
- Docker (para rodar o Redis)

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

1.  Inicie o Redis com Docker:
    ```bash
    docker run -d --name redis -p 6379:6379 redis
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

    Certifique-se de que o Redis esteja em execução e acessível pela aplicação. Se o Redis estiver rodando em um container Docker na mesma rede, você pode usar o nome do container como host.

    ```bash
    docker run -d -p 4004:4004 --name notify-ms notify-ms
    ```

    Se o Redis estiver rodando localmente (fora de um container), você pode precisar configurar a rede do container para `host`:

    ```bash
    docker run -d --network host --name notify-ms notify-ms
    ```

## Benchmark

Para executar o teste de benchmark, que envia 1000 mensagens para a fila e mede o tempo total e a vazão, execute o seguinte comando:

```bash
npm run benchmark
```

O script irá:
1. Conectar-se ao servidor WebSocket.
2. Enviar 1000 mensagens para a fila `notification-queue`.
3. Aguardar o recebimento de todas as notificações via WebSocket.
4. Calcular e exibir o tempo total e a vazão (notificações por segundo).

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