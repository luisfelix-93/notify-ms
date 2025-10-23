import { Job, Worker } from "bullmq";
import { SendAlertNotificationUseCase } from "../../domain/usecases/SendAlertNotificationUseCase";
import { EmailNotificationPayload } from "../../domain/services/INotificationService";
import { redisConnection } from "../../infrastructure/config/redis.config";

export const alertQueueName = 'alert-queue';

export class AlertWorker {
    private worker: Worker;

    constructor(private useCase: SendAlertNotificationUseCase) {
        this.worker = new Worker<EmailNotificationPayload>(
            alertQueueName,
            this.processJob.bind(this),
            { connection: redisConnection }
        );
    }

    private async processJob(job: Job<EmailNotificationPayload>): Promise<void> {
        console.log(`[AlertWorker] Job de alerta ${job.id} recebido.`, job.data);
        try {
            await this.useCase.execute(job.data);
        } catch (error) {
            console.log(`[AlertWorker] Erro ao processa job ${job.id}.`, error);
            throw error;
        }
    }

    start(): void {
        console.log(`[AlertWorker] Worker da fila '${alertQueueName}' iniciado.`);
    }
}