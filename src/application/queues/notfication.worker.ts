import { Job, Worker } from "bullmq";
import { SendCompletionNotificationUseCase } from "../../domain/usecases/SendCompletionNotificationUseCase";
import { NotificationPayload } from "../../domain/services/INotificationService";
import { redisConnection } from "../../infrastructure/config/redis.config";

export const notificationQueueName = 'notification-queue';

export class NotificationWorker {
    private worker: Worker;

    constructor(private useCase: SendCompletionNotificationUseCase) {
        this.worker = new Worker<NotificationPayload>(
            notificationQueueName,
            this.processJob.bind(this),
            { connection: redisConnection }
        );
    }

    private async processJob(job: Job<NotificationPayload>): Promise<void> {
        console.log(`[Worker] Job ${job.id} recebido. Dados: `, job.data);
        try {
            await this.useCase.execute(job.data);
            console.log(`[Worker] Job ${job.id} processado com sucesso.`);
        } catch (error) {
            console.error(`[Worker] Erro ao processar o job ${job.id}:`, error);
            throw error;
        }
    }

    start(): void {
        console.log(`[Worker] Worker da fila '${notificationQueueName}' iniciado.`);
    }
}