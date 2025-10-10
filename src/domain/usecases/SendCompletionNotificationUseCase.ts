import { INotificationService, NotificationPayload } from "../services/INotificationService";

export class SendCompletionNotificationUseCase {
    constructor(private notificationService: INotificationService) {}

    async execute(payload: NotificationPayload): Promise<void> {
        console.log(`[UseCase] Iniciando envio de notificação para o teste: ${payload.testId}`);

        if (!payload.testId || !payload.message) {
            throw new Error('Dados da notificação inválidos.');
        }

        await this.notificationService.send(payload);

        console.log(`[UseCase] Notificação para o teste ${payload.testId} enviada com sucesso.`);
    }
}