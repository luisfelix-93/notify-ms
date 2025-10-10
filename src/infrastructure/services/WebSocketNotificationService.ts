import { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";
import { Server as SocektIOServer } from "socket.io";
export class WebSocketNotificationService implements INotificationService {
    constructor(private io: SocektIOServer) {}

    async send(payload: NotificationPayload): Promise<void> {
       console.log(`[WebSocketService] Enviando notificação para o teste: ${payload.testId}`);
       
       this.io.emit('push-notification', payload);
    }
}