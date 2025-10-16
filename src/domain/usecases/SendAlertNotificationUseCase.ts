import { EmailNotificationPayload, IEmailNotificationService, INotificationService } from "../services/INotificationService";

export class SendAlertNotificationUseCase {
    constructor(private notificationService:IEmailNotificationService ){}

    async execute(payload: EmailNotificationPayload): Promise<void> {
        console.log(`[UseCase] Iniciando envio de notificação de alerta para: ${payload.recipientEmail}`);

        if (!payload.recipientEmail || !payload.endpointName || !payload.endpointUrl || !payload.metric || !payload.value || !payload.threshold) {
            throw new Error('Dados da notificação inválidos.');
        }

        await this.notificationService.send(payload);

        console.log(`[UseCase] Notificação de alerta para ${payload.recipientEmail} enviada com sucesso.`);

    }
}