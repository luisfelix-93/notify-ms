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
        
    }
}