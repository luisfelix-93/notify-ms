import { EmailNotificationPayload, IEmailNotificationService } from "../../domain/services/INotificationService";
import * as nodemailer from 'nodemailer';

export class EmailNotificationService implements IEmailNotificationService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.EMAIL_PORT || '587', 10),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(payload: EmailNotificationPayload): Promise<void> {
        console.log(`[EmailService] Enviando alerta por e-mail para ${payload.recipientEmail}`);

        const mailOptions = {
            from: '"Sistema de Monitoramento" <monitor@support.io>',
            to: payload.recipientEmail,
            subject: `🚨 Alerta: Problema no endpoint ${payload.endpointName}`,
            html: `
                    <h1>Alerta de Performance</h1>
                    <p>O endpoint <strong>${payload.endpointName}</strong> (${payload.endpointUrl}) ultrapassou um limite de monitoramento.</p>
                    <ul>
                        <li><strong>Métrica:</strong> ${payload.metric}</li>
                        <li><strong>Valor Registrado:</strong> ${payload.value}</li>
                        <li><strong>Limite Definido:</strong> ${payload.threshold}</li>
                    </ul>
                    <p>Por favor, verifique o status do serviço.</p>
                `,
        }

        const info = await this.transporter.sendMail(mailOptions);
        console.log(`[EmailService] E-mail enviado: ${info.messageId}`);
        console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
}