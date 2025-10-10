export interface NotificationPayload {
    testId: string;
    status: 'completed' | 'failed';
    message: string;
    resultsUrl?: string;
}

export interface INotificationService {
    send(payload: NotificationPayload): Promise<void>;
}