import express from 'express'
import http from 'http'
import { Server as SocektIOServer } from 'socket.io';
import { WebSocketNotificationService } from './src/infrastructure/services/WebSocketNotificationService';
import { SendCompletionNotificationUseCase } from './src/domain/usecases/SendCompletionNotificationUseCase';
import { NotificationWorker } from './src/application/queues/notfication.worker';
import { EmailNotificationService } from './src/infrastructure/services/EmailNotificationService';
import { SendAlertNotificationUseCase } from './src/domain/usecases/SendAlertNotificationUseCase';
import { AlertWorker } from './src/application/queues/alert.worker';
import { connectToDatabase } from './src/infrastructure/config/mongo.config';
import * as smtpController from './src/application/web/smtp.controller';

const app = express();
const server = http.createServer(app);
connectToDatabase();
const io = new SocektIOServer(server, {
    cors: {
        origin: '*'
    }
});

const PORT = process.env.PORT || 4004;
app.use(express.json());
app.post('/api/settings/smtp', smtpController.handleSaveConfig);
app.get('/api/settings/smtp', smtpController.handleGetConfig);
app.post('/api/settings/smtp/test', smtpController.handleTestConfig);
app.get('/health', (req, res) => res.status(200).send('ok'));

// --- Notificações via WebSocket (teste de carga)
const webSocketService = new WebSocketNotificationService(io);
const sendNotificationUseCase = new SendCompletionNotificationUseCase(webSocketService);
const notificationWorker = new NotificationWorker(sendNotificationUseCase);

// --- Notificações por email (health-check)
const emailService = new EmailNotificationService();
const sendEmailAlertUseCase = new SendAlertNotificationUseCase(emailService);
const alertWorker = new AlertWorker(sendEmailAlertUseCase);

server.listen(PORT, () => {
    console.log(`[Server] Microsserviço de notificação iniciado na porta ${PORT}`);
    notificationWorker.start();
    alertWorker.start();
});

io.on('connection', (socket) => {
    console.log(`[Server] Cliente conectado: ${socket.id}`);
});


