export interface NotificationPayload {
    testId: string;
    status: 'completed' | 'failed';
    message: string;
    resultsUrl?: string;
}
export interface EmailNotificationPayload {
    recipientEmail: string;
    endpointName: string;
    endpointUrl: string;
    metric: string;
    value: string;
    threshold: string;
}


export interface INotificationService {
    send(payload: NotificationPayload): Promise<void>;
}

export interface IEmailNotificationService {
    send(payload: EmailNotificationPayload): Promise<void>;
}