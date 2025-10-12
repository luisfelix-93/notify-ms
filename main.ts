import express from 'express'
import http from 'http'
import { Server as SocektIOServer } from 'socket.io';
import { WebSocketNotificationService } from './src/infrastructure/services/WebSocketNotificationService';
import { SendCompletionNotificationUseCase } from './src/domain/usecases/SendCompletionNotificationUseCase';
import { NotificationWorker } from './src/application/queues/notfication.worker';


const app = express();
const server = http.createServer(app);

const io = new SocektIOServer(server, {
    cors: {
        origin: '*'
    }
});

const PORT = process.env.PORT || 4004;

app.get('/health', (req, res) => res.status(200).send('ok'));

const webSocketService = new WebSocketNotificationService(io);
const sendNotificationUseCase = new SendCompletionNotificationUseCase(webSocketService);
const notificationWorker = new NotificationWorker(sendNotificationUseCase);


server.listen(PORT, () => {
    console.log(`[Server] Microsserviço de notificação iniciado na porta ${PORT}`);
    notificationWorker.start();
});

io.on('connection', (socket) => {
    console.log(`[Server] Cliente conectado: ${socket.id}`);
});


